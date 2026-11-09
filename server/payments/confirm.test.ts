// @vitest-environment node
import { describe, expect, it } from "vitest";
import { Keypair, PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { checkPayment, type ExpectedPayment } from "./confirm";
import { buildPaymentInstructions, MEMO_PROGRAM_ID, orderMemo } from "./buildTransaction";

const buyer = Keypair.generate().publicKey.toBase58();
const house = Keypair.generate().publicKey.toBase58();
const treasury = Keypair.generate().publicKey.toBase58();
const stranger = Keypair.generate().publicKey.toBase58();
const usdc = Keypair.generate().publicKey.toBase58();
const fakeToken = Keypair.generate().publicKey.toBase58();
const reference = Keypair.generate().publicKey.toBase58();
const orderId = "7f1c4e9a-0000-4000-8000-000000000001";

const expected: ExpectedPayment = {
  orderId,
  reference,
  mint: usdc,
  recipients: [
    { owner: house, amount: 1_200_000_000n },
    { owner: treasury, amount: 300_000_000n },
  ],
};

interface Move {
  owner: string;
  mint?: string;
  amount: bigint;
}

function fakeTx(opts: { moves?: Move[]; memo?: string | null; withReference?: boolean; err?: unknown } = {}) {
  const moves = opts.moves ?? [
    { owner: house, amount: 1_200_000_000n },
    { owner: treasury, amount: 300_000_000n },
  ];
  const keys = [buyer, house, treasury, ...(opts.withReference === false ? [] : [reference])];
  const pre: any[] = [];
  const post: any[] = [];
  const total = moves.reduce((s, m) => s + m.amount, 0n);
  const bal = (accountIndex: number, owner: string, mint: string, amount: bigint) => ({
    accountIndex,
    owner,
    mint,
    uiTokenAmount: { amount: amount.toString(), decimals: 6, uiAmount: null, uiAmountString: "" },
  });
  const payMint = moves[0]?.mint ?? usdc;
  pre.push(bal(10, buyer, payMint, 5_000_000_000n));
  post.push(bal(10, buyer, payMint, 5_000_000_000n - total));
  moves.forEach((m, i) => {
    pre.push(bal(11 + i, m.owner, m.mint ?? usdc, 0n));
    post.push(bal(11 + i, m.owner, m.mint ?? usdc, m.amount));
  });
  const memo = opts.memo === undefined ? orderMemo(orderId) : opts.memo;
  return {
    slot: 1,
    blockTime: 1,
    transaction: {
      signatures: ["5sig"],
      message: {
        accountKeys: keys.map((k, i) => ({ pubkey: new PublicKey(k), signer: i === 0, writable: true })),
        instructions: memo ? [{ program: "spl-memo", programId: MEMO_PROGRAM_ID, parsed: memo }] : [],
        recentBlockhash: "x",
      },
    },
    meta: { err: opts.err ?? null, fee: 5000, preBalances: [], postBalances: [], preTokenBalances: pre, postTokenBalances: post, logMessages: [] },
  } as unknown as ParsedTransactionWithMeta;
}

describe("payment confirmation", () => {
  it("accepts the right amount to the right receivers", () => {
    const r = checkPayment(fakeTx(), expected);
    expect(r).toEqual({ ok: true, signature: "5sig", payer: buyer });
  });

  it("rejects a wrong amount", () => {
    const r = checkPayment(fakeTx({ moves: [{ owner: house, amount: 1_100_000_000n }, { owner: treasury, amount: 300_000_000n }] }), expected);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/Wrong amount/);
  });

  it("rejects a wrong receiver", () => {
    const r = checkPayment(fakeTx({ moves: [{ owner: stranger, amount: 1_200_000_000n }, { owner: treasury, amount: 300_000_000n }] }), expected);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/was not paid/);
  });

  it("rejects a wrong mint (not USDC)", () => {
    const r = checkPayment(
      fakeTx({ moves: [{ owner: house, mint: fakeToken, amount: 1_200_000_000n }, { owner: treasury, mint: fakeToken, amount: 300_000_000n }] }),
      expected,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/Wrong token/);
  });

  it("rejects a missing memo, a missing reference and a failed transaction", () => {
    expect(checkPayment(fakeTx({ memo: null }), expected).ok).toBe(false);
    expect(checkPayment(fakeTx({ memo: "menaroyal:order:another" }), expected).ok).toBe(false);
    expect(checkPayment(fakeTx({ withReference: false }), expected).ok).toBe(false);
    expect(checkPayment(fakeTx({ err: { InstructionError: [0, "x"] } }), expected).ok).toBe(false);
    expect(checkPayment(null, expected).ok).toBe(false);
  });

  it("accepts a 0% founding order with a single transfer", () => {
    const exp0 = { ...expected, recipients: [{ owner: house, amount: 1_500_000_000n }] };
    expect(checkPayment(fakeTx({ moves: [{ owner: house, amount: 1_500_000_000n }] }), exp0).ok).toBe(true);
  });
});

describe("payment transaction built on the server", () => {
  const plan = {
    orderId,
    buyer: new PublicKey(buyer),
    mint: new PublicKey(usdc),
    reference: new PublicKey(reference),
    houseWallet: new PublicKey(house),
    houseShare: 1_200_000_000n,
    treasuryWallet: new PublicKey(treasury),
    platformShare: 300_000_000n,
  };

  it("has both transfers, the reference and the memo in one transaction", () => {
    const ix = buildPaymentInstructions(plan);
    const transfers = ix.filter((i) => i.programId.equals(TOKEN_PROGRAM_ID));
    expect(transfers).toHaveLength(2);
    // transferChecked data: [12, amount u64 LE, decimals]
    const amounts = transfers.map((t) => t.data.readBigUInt64LE(1));
    expect(amounts).toEqual([1_200_000_000n, 300_000_000n]);
    expect(transfers.every((t) => t.data[9] === 6)).toBe(true);
    expect(transfers[0].keys.some((k) => k.pubkey.toBase58() === reference && !k.isSigner && !k.isWritable)).toBe(true);
    const memo = ix.find((i) => i.programId.equals(MEMO_PROGRAM_ID));
    expect(memo?.data.toString("utf8")).toBe(orderMemo(orderId));
  });

  it("skips the MENA ROYAL transfer at 0%", () => {
    const ix = buildPaymentInstructions({ ...plan, houseShare: 1_500_000_000n, platformShare: 0n });
    expect(ix.filter((i) => i.programId.equals(TOKEN_PROGRAM_ID))).toHaveLength(1);
  });
});
