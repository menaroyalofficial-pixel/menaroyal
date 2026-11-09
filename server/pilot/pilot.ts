/**
 * Pilot preview for one house (sales calls). Preview only, never production.
 *
 *  - The page is off unless PILOT_PREVIEW=true, the site is not production,
 *    and the visitor has the secret key (PILOT_PREVIEW_KEY).
 *  - The pilot keeps its own small database (a file), separate from the live
 *    one, so a test house never appears on menaroyal.com.
 *  - The house and the "client" use keys derived on the server from
 *    CERT_SEED_SECRET. They never leave the server.
 *  - Same code as the real checkout: register + sign, pay, check, hand over.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import bs58 from "bs58";
import nacl from "tweetnacl";
import type { Umi } from "@metaplex-foundation/umi";
import { cleanEngraving, parsePilotConfig, PILOT_SLUG, type PilotConfig, type PilotProduct } from "../../shared/pilot.js";
import { normalizeCountry } from "../../shared/cryptoCountries.js";
import { foundingPeriodEnd, platformBpsFor } from "../commission.js";
import { splitAmount, usdToCents, usdToMicroUsdc } from "../money.js";
import { sha256Hex } from "../certificates/serial.js";
import { signerFrom } from "../certificates/umi.js";
import type { CertStorage } from "../certificates/storage.js";
import { walletChallenge, verifyWalletSignature } from "../houseWallet.js";
import { buildOrderTransaction, createUsdcOrder, OrderError, refreshOrder, type CertificateMover, type Chain } from "../orders.js";
import { registerPieceWithSigner } from "../pieces.js";
import { FileStore } from "../store/fileStore.js";
import type { House, Order, Piece, Store } from "../store/types.js";

// ---------------------------------------------------------------- access

export type PilotAccess = "ok" | "off" | "denied";

/** Off on production, off without the flag, off without a long secret key. */
export function pilotAccess(env: Record<string, string | undefined>, key: unknown): PilotAccess {
  if (env.PILOT_PREVIEW !== "true" || env.VERCEL_ENV === "production") return "off";
  const secret = env.PILOT_PREVIEW_KEY ?? "";
  if (secret.length < 16) return "off";
  const given = typeof key === "string" ? key : "";
  const a = createHmac("sha256", "pilot").update(given).digest();
  const b = createHmac("sha256", "pilot").update(secret).digest();
  return timingSafeEqual(a, b) ? "ok" : "denied";
}

// ---------------------------------------------------------------- files

const ROOT = () => process.cwd();

export function loadPilot(slug: string, root = ROOT()): PilotConfig | null {
  if (!PILOT_SLUG.test(slug)) return null;
  const file = path.join(root, "pilots", `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return parsePilotConfig(JSON.parse(fs.readFileSync(file, "utf8")), slug);
}

/** Path of a product photo on disk, or null when the house has not added it yet. */
export function productImageFile(cfg: PilotConfig, product: PilotProduct, root = ROOT()): string | null {
  if (!product.image) return null;
  const file = path.join(root, "public", "pilots", cfg.slug, product.image);
  return fs.existsSync(file) ? file : null;
}

export const PLACEHOLDER_IMAGE = "placeholder-bottle.svg";

let pilotStoreCache: Store | null = null;
/** The pilot's own small database. On Vercel previews it lives in /tmp. */
export function pilotStore(): Store {
  if (pilotStoreCache) return pilotStoreCache;
  const file = process.env.VERCEL
    ? path.join(os.tmpdir(), "menaroyal-pilot-store.json")
    : path.join(ROOT(), ".demo", "pilot-store.json");
  pilotStoreCache = new FileStore(file);
  return pilotStoreCache;
}

// ---------------------------------------------------------------- keys

function derive(secret: string, label: string): Uint8Array {
  return Uint8Array.from(createHmac("sha256", secret).update(`menaroyal:pilot:${label}`).digest());
}

/**
 * The house name is part of the key: when you replace "[House name]" with the
 * real name, the pilot starts fresh with a new collection under that name.
 */
function houseLabel(cfg: PilotConfig) {
  return `${cfg.slug}:${cfg.house.name}`;
}

export function pilotHouseId(secret: string, cfg: PilotConfig): string {
  const h = Buffer.from(derive(secret, `id:${houseLabel(cfg)}`)).toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function pilotHouseKeypair(secret: string, cfg: PilotConfig): Keypair {
  return Keypair.fromSeed(derive(secret, `house:${houseLabel(cfg)}`));
}

export function pilotClientKeypair(secret: string, cfg: PilotConfig): Keypair {
  return Keypair.fromSeed(derive(secret, `client:${cfg.slug}`));
}

// ---------------------------------------------------------------- money

export function gbpToPence(value: string): bigint {
  return usdToCents(value); // same rules: 2 decimals, integers only
}

/** Split of a price for the page, in the smallest unit (pence or cents) as text. */
export function priceSplit(price: string, bps: number) {
  const s = splitAmount(usdToCents(price), bps);
  return { total: s.total.toString(), house: s.house.toString(), platform: s.platform.toString() };
}

// ---------------------------------------------------------------- house

export interface PilotDeps {
  store: Store;
  umi: Umi; // signs as MENA ROYAL
  storage: CertStorage;
  seedSecret: string;
  chain: Chain;
  mover: CertificateMover;
  authority: Keypair;
  root?: string;
  now?: () => Date;
}

/** Enough to show the page: no keys, no chain. */
export type PilotPageDeps = Pick<PilotDeps, "store" | "seedSecret" | "root" | "now">;

/**
 * Creates the pilot house once, as a founding house starting today
 * (0% for founding_months, then commission_bps). After that the terms are
 * read from the database row, so changing the row changes the page.
 */
export async function ensurePilotHouse(deps: PilotPageDeps, cfg: PilotConfig): Promise<House> {
  const id = pilotHouseId(deps.seedSecret, cfg);
  const existing = await deps.store.getHouse(id);
  if (existing?.wallet_verified_at) return existing;

  const houseKp = pilotHouseKeypair(deps.seedSecret, cfg);
  const wallet = houseKp.publicKey.toBase58();
  const today = (deps.now?.() ?? new Date()).toISOString().slice(0, 10);
  await deps.store.upsertHouse({
    id,
    name: cfg.house.name,
    slug: `pilot-${cfg.slug}`,
    country: normalizeCountry(cfg.house.country) ?? cfg.house.country,
    wallet_address: null,
    wallet_verified_at: null,
    commission_bps: 2000,
    founding_house: true,
    start_date: today,
    founding_months: 3,
  });
  // The house proves it owns its payout account by signing a message.
  const challenge = walletChallenge(deps.seedSecret, id, wallet);
  const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(challenge.message), houseKp.secretKey));
  if (!verifyWalletSignature(deps.seedSecret, { houseId: id, wallet, message: challenge.message, signature })) {
    throw new Error("Pilot house check failed");
  }
  return deps.store.updateHouse(id, { wallet_address: wallet, wallet_verified_at: new Date().toISOString() });
}

export function houseTerms(house: House, now: Date) {
  const bps = platformBpsFor(house, now);
  const end = house.founding_house && house.start_date ? foundingPeriodEnd(house) : null;
  return {
    platformBps: bps,
    commissionBps: house.commission_bps,
    foundingHouse: house.founding_house,
    foundingMonths: house.founding_months,
    foundingEnds: end ? end.toISOString().slice(0, 10) : null,
    inFoundingPeriod: bps === 0 && house.founding_house,
  };
}

// ---------------------------------------------------------------- page data

export async function pilotOverview(deps: PilotPageDeps, cfg: PilotConfig, verifyBase: string) {
  const house = await ensurePilotHouse(deps, cfg);
  const now = deps.now?.() ?? new Date();
  const terms = houseTerms(house, now);
  return {
    pilot: {
      slug: cfg.slug,
      house: { name: house.name, country: cfg.house.country, founded: cfg.house.founded, story: cfg.house.story },
      colours: cfg.colours,
      certificate: cfg.certificate,
      terms,
      verifyBase,
      products: cfg.products.map((p) => ({
        id: p.id,
        name: p.name,
        notes: p.notes,
        size: p.size,
        batch: p.batch,
        madeOn: p.madeOn,
        priceGbp: p.priceGbp,
        priceUsd: p.priceUsd,
        image: productImageFile(cfg, p, deps.root) ? `/pilots/${cfg.slug}/${p.image}` : null,
        split: { gbp: priceSplit(p.priceGbp, terms.platformBps), usd: priceSplit(p.priceUsd, terms.platformBps) },
      })),
    },
    dashboard: await pilotDashboard(deps, cfg, house),
  };
}

export async function pilotDashboard(deps: PilotPageDeps, cfg: PilotConfig, house: House) {
  const [orders, pieces] = await Promise.all([deps.store.listHouseOrders(house.id), deps.store.listHousePieces(house.id)]);
  const byId = new Map(pieces.map((p) => [p.id, p]));
  const productOf = (piece?: Piece) => cfg.products.find((x) => x.id === piece?.product_id);
  const paid = orders.filter((o) => o.status === "paid");
  const sum = (key: "house_share" | "platform_share") => paid.reduce((a, o) => a + BigInt(o[key]), 0n).toString();
  return {
    orders: orders
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((o) => {
        const piece = byId.get(o.piece_id);
        const product = productOf(piece);
        return {
          id: o.id,
          date: o.created_at,
          product: piece?.name ?? "—",
          serial: piece?.serial ?? null,
          status: o.status,
          priceGbp: product?.priceGbp ?? null,
          amountUsd: o.amount_usd,
          houseShare: o.house_share,
          platformShare: o.platform_share,
          platformBps: o.platform_bps,
          receiptUrl: o.tx_signature ? `https://explorer.solana.com/tx/${o.tx_signature}?cluster=devnet` : null,
        };
      }),
    payouts: { paidOrders: paid.length, houseTotal: sum("house_share"), platformTotal: sum("platform_share") },
    certificates: pieces
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((p) => ({
        serial: p.serial,
        product: p.name,
        batch: p.batch ?? null,
        issuedAt: p.created_at,
        holder: p.status === "sold" ? "With the client" : "With the house",
      })),
  };
}

// ---------------------------------------------------------------- purchase

function photoFor(cfg: PilotConfig, product: PilotProduct, origin: string, root: string) {
  const file = productImageFile(cfg, product, root);
  if (file) return { url: `${origin}/pilots/${cfg.slug}/${product.image}`, bytes: new Uint8Array(fs.readFileSync(file)) };
  const placeholder = path.join(root, "public", "pilots", PLACEHOLDER_IMAGE);
  return { url: `${origin}/pilots/${PLACEHOLDER_IMAGE}`, bytes: new Uint8Array(fs.readFileSync(placeholder)) };
}

export function engravingHash(salt: string, engraving: string): string {
  return sha256Hex(`${salt}:${engraving}`);
}

/**
 * Step 1: the house registers this bottle and signs its certificate,
 * then an order is opened for the client.
 */
export async function preparePurchase(
  deps: PilotDeps,
  cfg: PilotConfig,
  input: { productId: string; engraving?: unknown; origin: string },
) {
  const product = cfg.products.find((p) => p.id === input.productId);
  if (!product) throw new OrderError("This product is not in the pilot.", 404);
  const engraving = cleanEngraving(input.engraving);
  const salt = engraving ? randomBytes(16).toString("hex") : null;

  const house = await ensurePilotHouse(deps, cfg);
  const photo = photoFor(cfg, product, input.origin, deps.root ?? ROOT());
  const piece = await registerPieceWithSigner(deps, house, signerFrom(deps.umi, pilotHouseKeypair(deps.seedSecret, cfg)), {
    name: product.name,
    maker: cfg.house.maker,
    country: cfg.house.country,
    materials: product.notes.split(/[·,]/).map((s) => s.trim()).filter(Boolean),
    madeOn: product.madeOn,
    priceUsd: product.priceUsd,
    photoUrls: [photo.url],
    photoFiles: [photo],
    productId: product.id,
    batch: product.batch,
    engravingSha256: engraving && salt ? engravingHash(salt, engraving) : null,
  });

  // The pilot client is simulated, so no country check on the buyer side.
  const order = await createUsdcOrder(deps.store, deps.chain, { pieceId: piece.id, allowUnknownCountry: true, now: deps.now?.() });
  const saved = engraving ? await deps.store.updateOrder(order.id, { engraving, engraving_salt: salt }) : order;
  return { order: saved ?? order, piece };
}

async function fundClient(deps: PilotDeps, client: PublicKey, needed: bigint) {
  const { connection, mint } = deps.chain;
  const sol = await connection.getBalance(client);
  if (sol < 0.01 * LAMPORTS_PER_SOL) {
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(SystemProgram.transfer({ fromPubkey: deps.authority.publicKey, toPubkey: client, lamports: 0.03 * LAMPORTS_PER_SOL })),
      [deps.authority],
    );
  }
  const ata = await getOrCreateAssociatedTokenAccount(connection, deps.authority, mint, client);
  if (ata.amount >= needed) return;
  const info = await getMint(connection, mint);
  if (!info.mintAuthority?.equals(deps.authority.publicKey)) {
    throw new OrderError(`The demo client needs devnet USDC. Send some to ${client.toBase58()} (faucet.circle.com).`, 409);
  }
  await mintTo(connection, deps.authority, mint, ata.address, deps.authority, needed - ata.amount);
}

/** Step 2: the client pays; the server checks the payment and hands over the certificate. */
export async function completePurchase(deps: PilotDeps, cfg: PilotConfig, orderId: string, wait = (ms: number) => new Promise((r) => setTimeout(r, ms))) {
  const house = await ensurePilotHouse(deps, cfg);
  let order = await deps.store.getOrder(orderId);
  if (!order || order.house_id !== house.id) throw new OrderError("Order not found.", 404);

  if (order.status === "pending" && !order.tx_signature) {
    const client = pilotClientKeypair(deps.seedSecret, cfg);
    await fundClient(deps, client.publicKey, usdToMicroUsdc(order.amount_usd));
    const { transaction } = await buildOrderTransaction(deps.store, deps.chain, order.id, client.publicKey.toBase58());
    const tx = Transaction.from(Buffer.from(transaction, "base64"));
    tx.partialSign(client); // what the client's app does when they approve
    const sig = await deps.chain.connection.sendRawTransaction(tx.serialize());
    await deps.chain.connection.confirmTransaction(sig, "confirmed");
  }

  const refresh = { store: deps.store, chain: deps.chain, mover: deps.mover, seedSecret: deps.seedSecret };
  order = await refreshOrder(refresh, orderId);
  for (let i = 0; i < 12 && (order.status !== "paid" || order.certificate_status === "pending"); i++) {
    await wait(1500);
    order = await refreshOrder(refresh, orderId);
  }
  return order;
}

/** What the pilot page may show about an order (engraving included: the key holder is the house). */
export async function pilotOrderView(store: Store, cfg: PilotConfig, order: Order) {
  const piece = await store.getPiece(order.piece_id);
  const product = cfg.products.find((p) => p.id === piece?.product_id);
  return {
    id: order.id,
    status: order.status,
    certificateStatus: order.certificate_status,
    failureReason: order.failure_reason,
    platformBps: order.platform_bps,
    amountUsd: order.amount_usd,
    houseShare: order.house_share,
    platformShare: order.platform_share,
    priceGbp: product?.priceGbp ?? null,
    split: product ? { gbp: priceSplit(product.priceGbp, order.platform_bps) } : null,
    receiptUrl: order.tx_signature ? `https://explorer.solana.com/tx/${order.tx_signature}?cluster=devnet` : null,
    handoverUrl: order.certificate_tx ? `https://explorer.solana.com/tx/${order.certificate_tx}?cluster=devnet` : null,
    registrationUrl: piece?.registration_tx ? `https://explorer.solana.com/tx/${piece.registration_tx}?cluster=devnet` : null,
    certificate: piece
      ? {
          serial: piece.serial,
          product: piece.name,
          batch: piece.batch ?? product?.batch ?? null,
          madeOn: piece.made_on,
          engraving: order.engraving ?? null,
          house: cfg.house.name,
        }
      : null,
  };
}

export type { Connection };
