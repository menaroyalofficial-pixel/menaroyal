/**
 * Order flow for USDC payments.
 *   createUsdcOrder   -> price and split computed here from the database
 *   buildOrderTransaction -> the exact transaction the buyer signs
 *   refreshOrder      -> finds the payment on chain, checks it, marks it paid,
 *                        then hands the certificate to the buyer
 */
import { randomUUID } from "node:crypto";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { isCryptoAllowed, normalizeCountry } from "../shared/cryptoCountries.js";
import { platformBpsFor } from "./commission.js";
import * as cfg from "./config.js";
import { splitAmount, usdToMicroUsdc } from "./money.js";
import { buildPaymentTransaction, serializeForWallet } from "./payments/buildTransaction.js";
import { checkSignature, findAndCheckPayment, type CheckResult, type ExpectedPayment } from "./payments/confirm.js";
import { collectionKeypairFor } from "./certificates/serial.js";
import { authorityUmi } from "./certificates/umi.js";
import { transferCertificate } from "./certificates/register.js";
import type { Order, Store } from "./store/types.js";

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export interface Chain {
  connection: Connection;
  mint: PublicKey;
  treasury: PublicKey;
}

export function defaultChain(): Chain {
  return { connection: new Connection(cfg.rpcUrl(), "confirmed"), mint: cfg.usdcMint(), treasury: cfg.treasuryWallet() };
}

export async function createUsdcOrder(
  store: Store,
  chain: Chain,
  input: { pieceId: string; email?: string | null; buyerCountry?: string | null; allowUnknownCountry: boolean; now?: Date },
): Promise<Order> {
  if (!isCryptoAllowed(input.buyerCountry, input.allowUnknownCountry)) {
    throw new OrderError("USDC payments are not available in your country.", 451);
  }
  const piece = await store.getPiece(input.pieceId);
  if (!piece) throw new OrderError("This piece does not exist.", 404);
  if (piece.status !== "registered" || !piece.asset_address) throw new OrderError("This piece is not available.", 409);

  const house = await store.getHouse(piece.house_id);
  if (!house) throw new OrderError("House not found.", 404);
  if (!house.wallet_address || !house.wallet_verified_at) throw new OrderError("This house cannot receive USDC yet.", 409);
  if (!isCryptoAllowed(normalizeCountry(house.country), true)) {
    throw new OrderError("This house is paid by card, not USDC.", 409);
  }

  const total = usdToMicroUsdc(piece.price_usd);
  const split = splitAmount(total, platformBpsFor(house, input.now ?? new Date()));
  const email = input.email?.trim() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new OrderError("Invalid email.");

  return store.createOrder({
    id: randomUUID(),
    piece_id: piece.id,
    house_id: house.id,
    buyer_wallet: null,
    buyer_email: email,
    amount_usd: piece.price_usd,
    amount_usdc: split.total.toString(),
    house_share: split.house.toString(),
    platform_share: split.platform.toString(),
    platform_bps: split.platformBps,
    house_wallet: house.wallet_address,
    treasury_wallet: chain.treasury.toBase58(),
    usdc_mint: chain.mint.toBase58(),
    reference: Keypair.generate().publicKey.toBase58(),
    tx_signature: null,
    status: "pending",
    failure_reason: null,
    certificate_status: "pending",
    certificate_tx: null,
    created_at: new Date().toISOString(),
  });
}

export async function buildOrderTransaction(store: Store, chain: Chain, orderId: string, account: string) {
  const order = await store.getOrder(orderId);
  if (!order) throw new OrderError("Order not found.", 404);
  if (order.status !== "pending") throw new OrderError("This order is already closed.", 409);
  let buyer: PublicKey;
  try {
    buyer = new PublicKey(account);
  } catch {
    throw new OrderError("Invalid wallet address.");
  }
  const tx = await buildPaymentTransaction(chain.connection, {
    orderId: order.id,
    buyer,
    mint: new PublicKey(order.usdc_mint),
    reference: new PublicKey(order.reference),
    houseWallet: new PublicKey(order.house_wallet),
    houseShare: BigInt(order.house_share),
    treasuryWallet: new PublicKey(order.treasury_wallet),
    platformShare: BigInt(order.platform_share),
  });
  return { transaction: serializeForWallet(tx), message: `MENA ROYAL order ${order.id.slice(0, 8)}` };
}

export function expectedPayment(order: Order): ExpectedPayment {
  const recipients = [{ owner: order.house_wallet, amount: BigInt(order.house_share) }];
  if (BigInt(order.platform_share) > 0n) recipients.push({ owner: order.treasury_wallet, amount: BigInt(order.platform_share) });
  return { orderId: order.id, reference: order.reference, mint: order.usdc_mint, recipients };
}

async function applyCheck(store: Store, order: Order, result: CheckResult): Promise<Order> {
  if (result.ok) {
    const paid = await store.updateOrder(
      order.id,
      { status: "paid", tx_signature: result.signature, buyer_wallet: result.payer, failure_reason: null },
      "pending",
    );
    return paid ?? ((await store.getOrder(order.id)) as Order);
  }
  // A wrong transaction does not close the order: the real payment can still arrive.
  // "failed" is set by an admin (or a future expiry job), never by a stranger's transaction.
  const noted = await store.updateOrder(order.id, { failure_reason: result.reason }, "pending");
  return noted ?? ((await store.getOrder(order.id)) as Order);
}

export type CertificateMover = (args: { asset: string; collection: string; newOwner: string }) => Promise<string>;

export function defaultCertificateMover(): CertificateMover {
  const umi = authorityUmi(cfg.rpcUrl(), cfg.authorityKeypair());
  return (args) => transferCertificate(umi, args);
}

/**
 * Hands the certificate to the buyer once paid.
 * Buyers always pay from a wallet, so the certificate goes to that wallet.
 * If there is no buyer wallet (future card payments), it goes to the
 * MENA ROYAL custody wallet and the buyer claims it later with their email.
 */
export async function deliverCertificate(store: Store, order: Order, mover: CertificateMover, seedSecret: string): Promise<Order> {
  if (order.status !== "paid" || order.certificate_status === "transferred" || order.certificate_status === "held_in_custody") {
    return order;
  }
  const piece = await store.getPiece(order.piece_id);
  if (!piece?.asset_address) return order;
  if (piece.status === "sold" && piece.owner_wallet && piece.owner_wallet !== order.buyer_wallet) {
    return (await store.updateOrder(order.id, { certificate_status: "failed", failure_reason: "Piece already sold to another buyer: refund needed." }))!;
  }
  const custody = cfg.custodyWallet();
  const recipient = order.buyer_wallet ?? custody?.toBase58();
  if (!recipient) return order;
  const collection = collectionKeypairFor(seedSecret, order.house_id).publicKey.toBase58();
  try {
    const sig = await mover({ asset: piece.asset_address, collection, newOwner: recipient });
    await store.updatePiece(piece.id, { status: "sold", owner_wallet: recipient });
    return (await store.updateOrder(order.id, {
      certificate_status: order.buyer_wallet ? "transferred" : "held_in_custody",
      certificate_tx: sig === "already-owned" ? order.certificate_tx : sig,
    }))!;
  } catch (e) {
    console.error("Certificate transfer failed for order", order.id, (e as Error).message);
    return (await store.updateOrder(order.id, { certificate_status: "failed" }))!;
  }
}

export interface RefreshDeps {
  store: Store;
  chain: Chain;
  mover?: CertificateMover;
  seedSecret?: string;
}

/** Checks the chain for a pending order. Safe to call many times. */
export async function refreshOrder(deps: RefreshDeps, orderId: string): Promise<Order> {
  let order = await deps.store.getOrder(orderId);
  if (!order) throw new OrderError("Order not found.", 404);
  if (order.status === "pending") {
    const result = await findAndCheckPayment(deps.chain.connection, new PublicKey(order.reference), expectedPayment(order));
    if (result) order = await applyCheck(deps.store, order, result);
  }
  if (order.status === "paid" && order.certificate_status !== "transferred" && deps.mover && deps.seedSecret) {
    order = await deliverCertificate(deps.store, order, deps.mover, deps.seedSecret);
  }
  return order;
}

/** Webhook path: we only trust the signature, then read the chain ourselves. */
export async function processSignatures(deps: RefreshDeps, signatures: string[]): Promise<string[]> {
  const pending = await deps.store.listPendingOrders(200);
  if (!pending.length) return [];
  const byReference = new Map(pending.map((o) => [o.reference, o]));
  const updated: string[] = [];
  for (const sig of signatures.slice(0, 50)) {
    const tx = await deps.chain.connection.getParsedTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (!tx) continue;
    const keys = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
    const order = keys.map((k) => byReference.get(k)).find(Boolean);
    if (!order) continue;
    let next = await applyCheck(deps.store, order, await checkSignature(deps.chain.connection, sig, expectedPayment(order)));
    if (next.status === "paid" && deps.mover && deps.seedSecret) next = await deliverCertificate(deps.store, next, deps.mover, deps.seedSecret);
    updated.push(next.id);
  }
  return updated;
}

/** What the browser may see about an order. */
export function publicOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    amountUsd: order.amount_usd,
    houseShare: order.house_share,
    platformShare: order.platform_share,
    platformBps: order.platform_bps,
    txSignature: order.tx_signature,
    explorerUrl: order.tx_signature ? cfg.explorerTx(order.tx_signature) : null,
    certificateStatus: order.certificate_status,
    certificateExplorerUrl: order.certificate_tx ? cfg.explorerTx(order.certificate_tx) : null,
    failureReason: order.failure_reason,
    reference: order.reference,
    createdAt: order.created_at,
  };
}
