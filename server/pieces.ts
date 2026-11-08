/**
 * House side: register a piece and its certificate.
 */
import { randomUUID } from "node:crypto";
import type { Signer, Umi } from "@metaplex-foundation/umi";
import { usdToCents } from "./money.js";
import { buildMetadata, CERT_STANDARD, type CertificateFacts } from "./certificates/metadata.js";
import {
  buildRegisterForWallet,
  ensureHouseCollection,
  houseNoopSigner,
  registerWithServerSigner,
} from "./certificates/register.js";
import { assetKeypairFor, generateSerial } from "./certificates/serial.js";
import { downloadPhoto, type CertStorage } from "./certificates/storage.js";
import type { ChainReader } from "./certificates/verify.js";
import type { House, Piece, Store } from "./store/types.js";

export interface NewPieceInput {
  name: string;
  maker: string;
  country: string;
  materials: string[];
  madeOn: string; // YYYY-MM-DD
  priceUsd: string;
  photoUrls: string[];
  productId?: string | null;
}

export function validatePieceInput(input: NewPieceInput): NewPieceInput {
  const clean = (s: unknown, max = 120) => String(s ?? "").trim().slice(0, max);
  const out: NewPieceInput = {
    name: clean(input.name),
    maker: clean(input.maker),
    country: clean(input.country, 60),
    materials: (input.materials ?? []).map((m) => clean(m, 60)).filter(Boolean).slice(0, 10),
    madeOn: clean(input.madeOn, 10),
    priceUsd: clean(input.priceUsd, 16),
    photoUrls: (input.photoUrls ?? []).map((u) => clean(u, 500)).filter(Boolean).slice(0, 6),
    productId: input.productId ? clean(input.productId, 64) : null,
  };
  if (!out.name || !out.maker || !out.country) throw new Error("Name, maker and country are required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.madeOn)) throw new Error("Date made must look like 2026-11-01.");
  usdToCents(out.priceUsd); // throws on a bad price
  if (!out.photoUrls.length) throw new Error("Add at least one photo.");
  return out;
}

async function prepare(store: Store, storage: CertStorage, house: House, raw: NewPieceInput) {
  if (!house.wallet_address || !house.wallet_verified_at) throw new Error("Connect and verify the house wallet first.");
  const input = validatePieceInput(raw);
  const serial = generateSerial(house.slug);

  const photos = [];
  for (const [i, url] of input.photoUrls.entries()) {
    const { bytes, sha256 } = await downloadPhoto(url);
    const name = `${serial}-${i + 1}${/\.png($|\?)/i.test(url) ? ".png" : ".jpg"}`;
    photos.push({ uri: await storage.storePhoto(bytes, name, url), sha256 });
  }

  const facts: CertificateFacts = {
    standard: CERT_STANDARD,
    serial,
    piece: input.name,
    house: house.name,
    house_wallet: house.wallet_address,
    maker: input.maker,
    country: input.country,
    materials: input.materials,
    made_on: input.madeOn,
    photos,
  };
  const uri = await storage.storeJson(buildMetadata(facts));

  const piece: Piece = {
    id: randomUUID(),
    product_id: input.productId ?? null,
    house_id: house.id,
    serial,
    name: input.name,
    maker: input.maker,
    country: input.country,
    materials: input.materials,
    made_on: input.madeOn,
    price_usd: input.priceUsd,
    photos: photos.map((p) => ({ url: p.uri, sha256: p.sha256 })),
    asset_address: null,
    metadata_uri: uri,
    registration_tx: null,
    status: "draft",
    owner_wallet: null,
    created_at: new Date().toISOString(),
  };
  return { piece, facts, uri };
}

export interface RegisterDeps {
  store: Store;
  umi: Umi; // signs as MENA ROYAL
  storage: CertStorage;
  seedSecret: string;
}

/** House wallet in the browser: returns a transaction for the house to sign. */
export async function startPieceRegistration(deps: RegisterDeps, house: House, input: NewPieceInput) {
  const { piece, facts, uri } = await prepare(deps.store, deps.storage, house, input);
  const identity = { id: house.id, name: house.name, wallet: house.wallet_address! };
  const collection = await ensureHouseCollection(deps.umi, deps.seedSecret, identity);
  const { transaction, asset } = await buildRegisterForWallet(deps.umi, {
    seedSecret: deps.seedSecret,
    collection,
    house: identity,
    facts,
    uri,
    houseSigner: houseNoopSigner(identity.wallet),
  });
  const saved = await deps.store.createPiece({ ...piece, asset_address: asset });
  return { piece: saved, transaction };
}

/** House key on the server (demo house or a custodial house wallet). */
export async function registerPieceWithSigner(deps: RegisterDeps, house: House, houseSigner: Signer, input: NewPieceInput) {
  const { piece, facts, uri } = await prepare(deps.store, deps.storage, house, input);
  const identity = { id: house.id, name: house.name, wallet: house.wallet_address! };
  const collection = await ensureHouseCollection(deps.umi, deps.seedSecret, identity);
  const { asset, signature } = await registerWithServerSigner(deps.umi, {
    seedSecret: deps.seedSecret,
    collection,
    house: identity,
    facts,
    uri,
    houseSigner,
  });
  return deps.store.createPiece({ ...piece, asset_address: asset, registration_tx: signature, status: "registered", owner_wallet: identity.wallet });
}

/** After the house wallet sent the transaction: check the chain, then mark it registered. */
export async function confirmPieceRegistration(store: Store, reader: ChainReader, seedSecret: string, pieceId: string, houseId: string) {
  const piece = await store.getPiece(pieceId);
  if (!piece || piece.house_id !== houseId) throw new Error("Piece not found.");
  if (piece.status !== "draft") return piece;
  const address = assetKeypairFor(seedSecret, piece.serial).publicKey.toBase58();
  const asset = await reader.getAsset(address);
  const house = await store.getHouse(houseId);
  const signed = asset?.creators.some((c) => c.address === house?.wallet_address && c.verified);
  if (!asset || !signed) throw new Error("The certificate is not on the chain yet. Try again in a few seconds.");
  return store.updatePiece(piece.id, { status: "registered", asset_address: address, owner_wallet: asset.owner });
}
