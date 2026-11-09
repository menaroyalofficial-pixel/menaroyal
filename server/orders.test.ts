// @vitest-environment node
import { describe, expect, it } from "vitest";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { FileStore } from "./store/fileStore";
import { createUsdcOrder, deliverCertificate, expectedPayment, type Chain } from "./orders";
import type { House, Piece } from "./store/types";
import { walletChallenge, verifyWalletSignature } from "./houseWallet";
import { rateLimit, resetRateLimits } from "./rateLimit";
import { authorized, signaturesFrom } from "../api/webhooks/helius";
import { isCryptoAllowed } from "../shared/cryptoCountries";

const chain: Chain = {
  connection: new Connection("http://127.0.0.1:8899"),
  mint: Keypair.generate().publicKey,
  treasury: Keypair.generate().publicKey,
};

const houseWallet = Keypair.generate().publicKey.toBase58();

function house(over: Partial<House> = {}): House {
  return {
    id: "h1",
    name: "Dar Rime",
    slug: "dar-rime",
    country: "AE",
    wallet_address: houseWallet,
    wallet_verified_at: "2026-11-01T00:00:00Z",
    commission_bps: 2000,
    founding_house: true,
    start_date: "2026-01-01",
    founding_months: 3,
    ...over,
  };
}

function piece(over: Partial<Piece> = {}): Piece {
  return {
    id: "p1",
    product_id: null,
    house_id: "h1",
    serial: "MR-DARR-ABCDEFGH",
    name: "Caftan",
    maker: "Dar Rime",
    country: "UAE",
    materials: [],
    made_on: "2026-10-01",
    price_usd: "1500",
    photos: [],
    asset_address: Keypair.generate().publicKey.toBase58(),
    metadata_uri: null,
    registration_tx: null,
    status: "registered",
    owner_wallet: houseWallet,
    created_at: "",
    ...over,
  };
}

async function setup(h = house(), p = piece()) {
  const store = new FileStore(null);
  await store.upsertHouse(h);
  await store.createPiece(p);
  return store;
}

describe("creating a USDC order", () => {
  it("takes the price and split from the database: $1,500 -> $1,200 / $300", async () => {
    const store = await setup();
    const o = await createUsdcOrder(store, chain, { pieceId: "p1", buyerCountry: "AE", allowUnknownCountry: false, now: new Date("2026-11-12") });
    expect(o.amount_usdc).toBe("1500000000");
    expect(o.house_share).toBe("1200000000");
    expect(o.platform_share).toBe("300000000");
    expect(o.status).toBe("pending");
    expect(expectedPayment(o).recipients).toHaveLength(2);
  });

  it("gives everything to a founding house in its first 3 months", async () => {
    const store = await setup(house({ start_date: "2026-10-01" }));
    const o = await createUsdcOrder(store, chain, { pieceId: "p1", buyerCountry: "AE", allowUnknownCountry: false, now: new Date("2026-11-12") });
    expect(o.platform_share).toBe("0");
    expect(o.house_share).toBe("1500000000");
    expect(expectedPayment(o).recipients).toHaveLength(1);
  });

  it("hides USDC for buyers in Kuwait and Saudi Arabia", async () => {
    const store = await setup();
    for (const c of ["KW", "SA"]) {
      await expect(createUsdcOrder(store, chain, { pieceId: "p1", buyerCountry: c, allowUnknownCountry: true })).rejects.toThrow(/not available/);
    }
    expect(isCryptoAllowed("AE")).toBe(true);
    expect(isCryptoAllowed(null, false)).toBe(false);
  });

  it("does not pay houses based in Kuwait or Saudi Arabia in crypto", async () => {
    const store = await setup(house({ country: "Saudi Arabia" }));
    await expect(createUsdcOrder(store, chain, { pieceId: "p1", buyerCountry: "AE", allowUnknownCountry: false })).rejects.toThrow(/card/);
  });

  it("refuses pieces that are not registered or houses without a verified wallet", async () => {
    await expect(createUsdcOrder(await setup(house(), piece({ status: "draft" })), chain, { pieceId: "p1", buyerCountry: "AE", allowUnknownCountry: false })).rejects.toThrow();
    await expect(createUsdcOrder(await setup(house({ wallet_verified_at: null })), chain, { pieceId: "p1", buyerCountry: "AE", allowUnknownCountry: false })).rejects.toThrow();
  });
});

describe("handing over the certificate", () => {
  it("moves it to the buyer's wallet once paid", async () => {
    const store = await setup();
    const o = await createUsdcOrder(store, chain, { pieceId: "p1", buyerCountry: "AE", allowUnknownCountry: false });
    const buyer = Keypair.generate().publicKey.toBase58();
    const paid = (await store.updateOrder(o.id, { status: "paid", buyer_wallet: buyer }))!;
    const calls: string[] = [];
    const done = await deliverCertificate(store, paid, async (a) => (calls.push(a.newOwner), "certsig"), "secret");
    expect(calls).toEqual([buyer]);
    expect(done.certificate_status).toBe("transferred");
    expect((await store.getPiece("p1"))?.status).toBe("sold");
  });

  it("does nothing while the order is unpaid", async () => {
    const store = await setup();
    const o = await createUsdcOrder(store, chain, { pieceId: "p1", buyerCountry: "AE", allowUnknownCountry: false });
    let called = false;
    await deliverCertificate(store, o, async () => ((called = true), "x"), "secret");
    expect(called).toBe(false);
  });
});

describe("house wallet ownership", () => {
  const secret = "test-secret";
  const kp = nacl.sign.keyPair();
  const wallet = new PublicKey(kp.publicKey).toBase58();

  it("accepts a correct signature and refuses tampering", () => {
    const { message } = walletChallenge(secret, "h1", wallet);
    const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey));
    expect(verifyWalletSignature(secret, { houseId: "h1", wallet, message, signature })).toBe(true);
    expect(verifyWalletSignature(secret, { houseId: "h2", wallet, message, signature })).toBe(false);
    expect(verifyWalletSignature("other", { houseId: "h1", wallet, message, signature })).toBe(false);
    const other = nacl.sign.keyPair();
    const bad = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), other.secretKey));
    expect(verifyWalletSignature(secret, { houseId: "h1", wallet, message, signature: bad })).toBe(false);
  });

  it("expires after 10 minutes", () => {
    const { message } = walletChallenge(secret, "h1", wallet, Date.now() - 11 * 60 * 1000);
    const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey));
    expect(verifyWalletSignature(secret, { houseId: "h1", wallet, message, signature })).toBe(false);
  });
});

describe("webhook and rate limits", () => {
  it("checks the webhook auth header", () => {
    expect(authorized("s3cret", "s3cret")).toBe(true);
    expect(authorized("wrong!", "s3cret")).toBe(false);
    expect(authorized(undefined, "s3cret")).toBe(false);
    expect(authorized("anything", undefined)).toBe(false);
  });

  it("reads signatures from Helius payloads", () => {
    const sig = "5".repeat(88);
    expect(signaturesFrom([{ signature: sig }, { transaction: { signatures: [sig] } }, { signature: "bad" }])).toEqual([sig]);
  });

  it("blocks after too many requests", () => {
    resetRateLimits();
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 60_000, 1000).allowed).toBe(true);
    expect(rateLimit("k", 3, 60_000, 1000).allowed).toBe(false);
    expect(rateLimit("k", 3, 60_000, 62_000).allowed).toBe(true);
  });
});
