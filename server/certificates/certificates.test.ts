// @vitest-environment node
import { describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { createNoopSigner, publicKey } from "@metaplex-foundation/umi";
import { authorityUmi } from "./umi";
import { buildRegisterTransaction, certificateAttributes } from "./register";
import { assetKeypairFor, collectionKeypairFor, generateSerial, isValidSerial, sha256Hex } from "./serial";
import { CERT_STANDARD, buildMetadata, canonicalJson, extractFacts, factsHash, type CertificateFacts } from "./metadata";

const SECRET = "test-secret-not-real";
const authority = Keypair.generate();
const houseKp = Keypair.generate();
const house = { id: "house-1", name: "Dar Rime", wallet: houseKp.publicKey.toBase58() };

function facts(serial: string): CertificateFacts {
  return {
    standard: CERT_STANDARD,
    serial,
    piece: "Caftan Layla",
    house: house.name,
    house_wallet: house.wallet,
    maker: "Atelier Dar Rime, Dubai",
    country: "United Arab Emirates",
    materials: ["Silk crepe", "Gold thread"],
    made_on: "2026-10-20",
    photos: [{ uri: "https://www.menaroyal.com/curated/royal-velvet-caftan.jpg", sha256: sha256Hex("photo") }],
  };
}

describe("serial numbers", () => {
  it("are unique, valid and map to a fixed certificate address", () => {
    const a = generateSerial("dar-rime");
    const b = generateSerial("dar-rime");
    expect(a).not.toBe(b);
    expect(isValidSerial(a)).toBe(true);
    expect(a.startsWith("MR-DARR-")).toBe(true);
    expect(assetKeypairFor(SECRET, a).publicKey.equals(assetKeypairFor(SECRET, a).publicKey)).toBe(true);
    expect(assetKeypairFor(SECRET, a).publicKey.equals(assetKeypairFor(SECRET, b).publicKey)).toBe(false);
    expect(assetKeypairFor("other-secret", a).publicKey.equals(assetKeypairFor(SECRET, a).publicKey)).toBe(false);
    expect(isValidSerial("MR-FAKE-123")).toBe(false);
  });
});

describe("certificate metadata", () => {
  it("hashes the same facts the same way, whatever the key order", () => {
    const f = facts("MR-DARR-ABCDEFGH");
    const shuffled = JSON.parse(JSON.stringify({ ...f, piece: f.piece }));
    expect(factsHash(shuffled)).toBe(factsHash(f));
    expect(canonicalJson({ b: 1, a: [2, { d: 1, c: 2 }] })).toBe('{"a":[2,{"c":2,"d":1}],"b":1}');
  });

  it("changes the hash if any detail or photo changes", () => {
    const f = facts("MR-DARR-ABCDEFGH");
    expect(factsHash({ ...f, materials: ["Polyester"] })).not.toBe(factsHash(f));
    expect(factsHash({ ...f, photos: [{ ...f.photos[0], sha256: sha256Hex("other photo") }] })).not.toBe(factsHash(f));
  });

  it("contains no buyer data and can be read back", () => {
    const m = buildMetadata(facts("MR-DARR-ABCDEFGH"));
    const text = JSON.stringify(m);
    expect(text).not.toMatch(/buyer|email/i);
    expect(extractFacts(m)?.serial).toBe("MR-DARR-ABCDEFGH");
  });
});

describe("certificate minting (transaction)", () => {
  const umi = authorityUmi("http://127.0.0.1:8899", authority);
  const serial = "MR-DARR-ABCDEFGH";
  const collection = collectionKeypairFor(SECRET, house.id).publicKey.toBase58();

  it("needs the house's signature and puts the asset at the serial's address", () => {
    const houseSigner = createNoopSigner(publicKey(house.wallet));
    const { builder, asset } = buildRegisterTransaction(umi, {
      seedSecret: SECRET,
      collection,
      house,
      facts: facts(serial),
      uri: "data:application/json;base64,e30=",
      houseSigner,
    });
    expect(asset).toBe(assetKeypairFor(SECRET, serial).publicKey.toBase58());
    const signers = builder.getSigners(umi).map((s) => s.publicKey.toString());
    expect(signers).toContain(house.wallet); // house signs
    expect(signers).toContain(authority.publicKey.toBase58()); // MENA ROYAL signs
    expect(signers).toContain(asset);
    expect(builder.getInstructions()).toHaveLength(2); // create + house verification
  });

  it("refuses a signer that is not the house wallet", () => {
    expect(() =>
      buildRegisterTransaction(umi, {
        seedSecret: SECRET,
        collection,
        house,
        facts: facts(serial),
        uri: "x",
        houseSigner: createNoopSigner(publicKey(Keypair.generate().publicKey.toBase58())),
      }),
    ).toThrow(/House signer/);
  });

  it("writes the serial and the hash of the details on the chain", () => {
    const attrs = Object.fromEntries(certificateAttributes(facts(serial)).map((a) => [a.key, a.value]));
    expect(attrs.serial).toBe(serial);
    expect(attrs.house_wallet).toBe(house.wallet);
    expect(attrs.facts_sha256).toBe(factsHash(facts(serial)));
  });
});
