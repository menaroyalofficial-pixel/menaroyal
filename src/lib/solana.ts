/** Browser-side Solana settings. Devnet only. */
export const SOLANA_CLUSTER = "devnet" as const;

export const SOLANA_RPC_URL: string =
  import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const explorerTx = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=${SOLANA_CLUSTER}`;
export const explorerAddress = (a: string) => `https://explorer.solana.com/address/${a}?cluster=${SOLANA_CLUSTER}`;

/** micro-USDC text -> "1,200.00" */
export function usdcText(micro: string | number | bigint): string {
  const v = BigInt(micro);
  const whole = (v / 1_000_000n).toLocaleString("en-US");
  const cents = ((v % 1_000_000n) / 10_000n).toString().padStart(2, "0");
  return `${whole}.${cents}`;
}

export function usdText(value: string | number): string {
  const [w, f = ""] = String(value).split(".");
  return `${Number(w).toLocaleString("en-US")}.${(f + "00").slice(0, 2)}`;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Something went wrong. Please try again.");
  return body as T;
}
