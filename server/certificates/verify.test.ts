// @vitest-environment node
import { describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { verifySerial, type AssetView, type ChainReader, type CollectionView } from "./verify";
import { CERT_STANDARD, buildMetadata, factsHash, type CertificateFacts } from "./metadata";
import { assetKeypairFor, sha256Hex } from "./serial";

const SECRET = "test-secret-not-real";
const AUTHORITY = Keypair.generate().publicKey.toBase58();
const HOUSE = Keypair.generate().publicKey.toBase58();
const BUYER = Keypair.generate().publicKey.toBase58();
const SERIAL = "MR-DARR-7K3Q9XAB";
const PHOTO = new TextEncoder().encode("the real caftan photo");
const PHOTO_URL = "https://example.test/caftan.jpg";
const COLLECTION = Keypair.generate().publicKey.toBase58();
const addressFor = (s: string) => assetKeypairFor(SECRET, s).publicKey.toBase58();

const facts: CertificateFacts = {
  standard: CERT_STANDARD,
  serial: SERIAL,
  piece: "Caftan Layla",
  house: "Dar Rime",
  house_wallet: HOUSE,
  maker: "Atelier Dar Rime",
  country: "United Arab Emirates",
  materials: ["Silk"],
  made_on: "2026-10-20",
  photos: [{ uri: PHOTO_URL, sha256: sha256Hex(PHOTO) }],
};

function world(over: { asset?: Partial<AssetView>; collection?: Partial<CollectionView>; photo?: Uint8Array; metadata?: unknown } = {}) {
  const asset: AssetView = {
    address: addressFor(SERIAL),
    owner: BUYER,
    name: "Caftan Layla · Dar Rime",
    uri: "https://example.test/meta.json",
    collection: COLLECTION,
    attributes: {
      immutable: true,
      map: { standard: CERT_STANDARD, serial: SERIAL, house: "Dar Rime", house_wallet: HOUSE, facts_sha256: factsHash(facts) },
    },
    creators: [{ address: HOUSE, verified: true }],
    ...over.asset,
  };
  const collection: CollectionView = {
    address: COLLECTION,
    updateAuthority: AUTHORITY,
    attributes: { immutable: true, map: { house: "Dar Rime", house_wallet: HOUSE } },
    ...over.collection,
  };
  const reader: ChainReader = {
    getAsset: async (a) => (a === asset.address ? asset : null),
    getCollection: async (a) => (a === COLLECTION ? collection : null),
    getHistory: async () => [
      { signature: "sig2", time: "2026-11-10T10:00:00.000Z", label: "Ownership transferred" },
      { signature: "sig1", time: "2026-11-09T10:00:00.000Z", label: "Registered and signed by the house" },
    ],
    fetchJson: async () => over.metadata ?? buildMetadata(facts),
    fetchBytes: async () => over.photo ?? PHOTO,
  };
  return { reader, authority: AUTHORITY, assetAddressFor: addressFor };
}

describe("verify a serial", () => {
  it("a real certificate passes, signed by the house", async () => {
    const r = await verifySerial(SERIAL, world());
    expect(r.reasons).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.house).toEqual({ name: "Dar Rime", wallet: HOUSE, signed: true });
    expect(r.registeredAt).toBe("2026-11-09T10:00:00.000Z");
    expect(r.owner?.label).toMatch(/Verified buyer/);
    expect(r.photos).toEqual([{ uri: PHOTO_URL, ok: true }]);
  });

  it("a fake serial fails", async () => {
    const r = await verifySerial("MR-DARR-ZZZZZZZZ", world());
    expect(r.ok).toBe(false);
    expect(r.reasons[0]).toMatch(/No certificate/);
    expect((await verifySerial("hello", world())).ok).toBe(false);
  });

  it("a swapped photo fails", async () => {
    const r = await verifySerial(SERIAL, world({ photo: new TextEncoder().encode("another photo") }));
    expect(r.ok).toBe(false);
    expect(r.photos[0].ok).toBe(false);
  });

  it("changed details fail", async () => {
    const r = await verifySerial(SERIAL, world({ metadata: buildMetadata({ ...facts, materials: ["Polyester"] }) }));
    expect(r.ok).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/changed/);
  });

  it("fails when the house did not sign", async () => {
    const r = await verifySerial(SERIAL, world({ asset: { creators: [{ address: HOUSE, verified: false }] } }));
    expect(r.ok).toBe(false);
    expect(r.house?.signed).toBe(false);
  });

  it("fails when the collection was not issued by MENA ROYAL", async () => {
    const r = await verifySerial(SERIAL, world({ collection: { updateAuthority: Keypair.generate().publicKey.toBase58() } }));
    expect(r.ok).toBe(false);
  });

  it("fails when the details on the chain are editable", async () => {
    const r = await verifySerial(SERIAL, world({ asset: { attributes: { immutable: false, map: { serial: SERIAL } } } }));
    expect(r.ok).toBe(false);
  });

  it("shows the house as owner before the sale", async () => {
    const r = await verifySerial(SERIAL, world({ asset: { owner: HOUSE } }));
    expect(r.owner?.label).toBe("Dar Rime (the house)");
  });
});
