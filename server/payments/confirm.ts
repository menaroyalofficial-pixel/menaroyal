/**
 * Server-side payment check. An order is only marked "paid" when the
 * transaction on the chain matches exactly what we quoted:
 * the reference key, the memo, the USDC mint, the receivers and the amounts.
 */
import type { Connection, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { findReference, FindReferenceError } from "@solana/pay";
import { orderMemo } from "./buildTransaction.js";

export interface ExpectedPayment {
  orderId: string;
  reference: string;
  mint: string;
  recipients: { owner: string; amount: bigint }[];
}

export type CheckResult =
  | { ok: true; signature: string; payer: string }
  | { ok: false; reason: string };

function accountKeys(tx: ParsedTransactionWithMeta): string[] {
  return tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
}

function memos(tx: ParsedTransactionWithMeta): string[] {
  const found: string[] = [];
  for (const ix of tx.transaction.message.instructions) {
    if ("parsed" in ix && ix.program === "spl-memo" && typeof ix.parsed === "string") found.push(ix.parsed);
  }
  // Fallback: the memo program also writes the memo into the logs.
  for (const line of tx.meta?.logMessages ?? []) {
    const m = /^Program log: Memo \(len \d+\): "(.*)"$/.exec(line);
    if (m) found.push(m[1]);
  }
  return found;
}

/** Change in token balance per (owner, mint), in base units. */
export function tokenDeltas(tx: ParsedTransactionWithMeta): Map<string, bigint> {
  const deltas = new Map<string, bigint>();
  const key = (owner: string | undefined, mint: string) => `${owner ?? "?"}|${mint}`;
  for (const b of tx.meta?.preTokenBalances ?? []) {
    const k = key(b.owner, b.mint);
    deltas.set(k, (deltas.get(k) ?? 0n) - BigInt(b.uiTokenAmount.amount));
  }
  for (const b of tx.meta?.postTokenBalances ?? []) {
    const k = key(b.owner, b.mint);
    deltas.set(k, (deltas.get(k) ?? 0n) + BigInt(b.uiTokenAmount.amount));
  }
  return deltas;
}

export function checkPayment(tx: ParsedTransactionWithMeta | null, expected: ExpectedPayment): CheckResult {
  if (!tx) return { ok: false, reason: "Transaction not found" };
  if (tx.meta?.err) return { ok: false, reason: "Transaction failed on chain" };

  const signature = tx.transaction.signatures[0];
  const keys = accountKeys(tx);
  if (!keys.includes(expected.reference)) return { ok: false, reason: "Reference key missing" };
  if (!memos(tx).includes(orderMemo(expected.orderId))) return { ok: false, reason: "Order memo missing" };

  const deltas = tokenDeltas(tx);
  const movedExpectedMint = [...deltas.entries()].some(([k, v]) => k.endsWith(`|${expected.mint}`) && v !== 0n);
  if (!movedExpectedMint) {
    const movedOther = [...deltas.values()].some((v) => v !== 0n);
    return { ok: false, reason: movedOther ? "Wrong token (not USDC)" : "No USDC was moved" };
  }

  for (const r of expected.recipients) {
    const got = deltas.get(`${r.owner}|${expected.mint}`) ?? 0n;
    if (got === 0n) return { ok: false, reason: `Receiver ${r.owner} was not paid` };
    if (got !== r.amount) {
      return { ok: false, reason: `Wrong amount for ${r.owner}: expected ${r.amount}, got ${got}` };
    }
  }

  const payer = keys[0];
  return { ok: true, signature, payer };
}

/**
 * Finds the transactions that carry the reference key and checks them.
 * Returns the first valid payment, otherwise the last problem found,
 * or null while nothing has been sent yet. Checking every transaction
 * (not only the newest) means a stranger cannot block a real payment by
 * sending a wrong transaction with the same reference.
 */
export async function findAndCheckPayment(
  connection: Connection,
  reference: PublicKey,
  expected: ExpectedPayment,
): Promise<CheckResult | null> {
  try {
    await findReference(connection, reference, { finality: "confirmed" });
  } catch (e) {
    if (e instanceof FindReferenceError) return null;
    throw e;
  }
  const sigs = await connection.getSignaturesForAddress(reference, { limit: 20 }, "confirmed");
  let last: CheckResult | null = null;
  for (const s of sigs) {
    if (s.err) continue;
    const result = await checkSignature(connection, s.signature, expected);
    if (result.ok) return result;
    last = result;
  }
  return last;
}

export async function checkSignature(
  connection: Connection,
  signature: string,
  expected: ExpectedPayment,
): Promise<CheckResult> {
  const tx = await connection.getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  return checkPayment(tx, expected);
}
