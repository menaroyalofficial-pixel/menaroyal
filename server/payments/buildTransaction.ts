/**
 * Builds the payment transaction on the server, so the buyer cannot change
 * the price or the receivers. One transaction contains:
 *   1. USDC transfer of the house share to the house wallet
 *   2. USDC transfer of the MENA ROYAL share to the treasury (skipped at 0%)
 *   3. a unique reference key (on the first transfer) and a memo with the order id
 */
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { USDC_DECIMALS } from "../money.js";

export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export function orderMemo(orderId: string): string {
  return `menaroyal:order:${orderId}`;
}

export interface PaymentPlan {
  orderId: string;
  buyer: PublicKey;
  mint: PublicKey;
  reference: PublicKey;
  houseWallet: PublicKey;
  houseShare: bigint;
  treasuryWallet: PublicKey;
  platformShare: bigint;
}

export function buildPaymentInstructions(plan: PaymentPlan): TransactionInstruction[] {
  if (plan.houseShare <= 0n) throw new Error("House share must be positive");
  if (plan.platformShare < 0n) throw new Error("Platform share cannot be negative");

  const buyerAta = getAssociatedTokenAddressSync(plan.mint, plan.buyer, true);
  const ix: TransactionInstruction[] = [];

  const legs: { owner: PublicKey; amount: bigint }[] = [
    { owner: plan.houseWallet, amount: plan.houseShare },
  ];
  if (plan.platformShare > 0n) legs.push({ owner: plan.treasuryWallet, amount: plan.platformShare });

  legs.forEach((leg, i) => {
    const ata = getAssociatedTokenAddressSync(plan.mint, leg.owner, true);
    // Creates the receiver's USDC account if it does not exist yet.
    ix.push(createAssociatedTokenAccountIdempotentInstruction(plan.buyer, ata, leg.owner, plan.mint));
    const transfer = createTransferCheckedInstruction(
      buyerAta,
      plan.mint,
      ata,
      plan.buyer,
      leg.amount,
      USDC_DECIMALS,
    );
    if (i === 0) {
      // Solana Pay convention: the reference is a read-only, non-signer key.
      transfer.keys.push({ pubkey: plan.reference, isSigner: false, isWritable: false });
    }
    ix.push(transfer);
  });

  ix.push(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(orderMemo(plan.orderId), "utf8"),
    }),
  );
  return ix;
}

/** Full transaction, ready for the buyer's wallet to sign. */
export async function buildPaymentTransaction(
  connection: Connection,
  plan: PaymentPlan,
): Promise<Transaction> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: plan.buyer, blockhash, lastValidBlockHeight });
  tx.add(...buildPaymentInstructions(plan));
  return tx;
}

export function serializeForWallet(tx: Transaction): string {
  return tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");
}
