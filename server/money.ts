/**
 * Money maths. Integers only: prices are USD with 2 decimals,
 * USDC has 6 decimals. Nothing here uses floating point maths.
 */
export const USDC_DECIMALS = 6;
const MICRO_PER_CENT = 10_000n; // 1 cent = 10^4 micro-USDC

/** "1500", "1500.5", "1500.50" or 1500 -> price in cents (bigint). */
export function usdToCents(value: string | number | bigint): bigint {
  if (typeof value === "bigint") {
    if (value < 0n) throw new Error("Price cannot be negative");
    return value * 100n;
  }
  // Numbers arrive from the database as JSON numbers. String() gives the
  // shortest exact text form (1500.5 -> "1500.5"), which we parse as text.
  const text = typeof value === "number" ? String(value) : value.trim();
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!m) throw new Error(`Invalid USD price: ${text}`);
  const whole = BigInt(m[1]);
  const fraction = BigInt((m[2] ?? "").padEnd(2, "0"));
  return whole * 100n + fraction;
}

/** USD price -> micro-USDC (6 decimals). */
export function usdToMicroUsdc(value: string | number | bigint): bigint {
  return usdToCents(value) * MICRO_PER_CENT;
}

/** micro-USDC -> "1500.00" style text for display. */
export function formatUsdc(micro: bigint): string {
  const negative = micro < 0n;
  const abs = negative ? -micro : micro;
  const whole = abs / 1_000_000n;
  const fraction = (abs % 1_000_000n).toString().padStart(6, "0").slice(0, 2);
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

export interface Split {
  total: bigint;
  house: bigint;
  platform: bigint;
  platformBps: number;
}

/**
 * Split a total between the house and MENA ROYAL.
 * `platformBps` is in basis points: 2000 = 20%, 0 = 0%.
 * The platform share is rounded down; the house gets the rest,
 * so the two parts always add up to the total exactly.
 */
export function splitAmount(total: bigint, platformBps: number): Split {
  if (total <= 0n) throw new Error("Total must be positive");
  if (!Number.isInteger(platformBps) || platformBps < 0 || platformBps > 10_000) {
    throw new Error(`Invalid commission: ${platformBps}`);
  }
  const platform = (total * BigInt(platformBps)) / 10_000n;
  return { total, house: total - platform, platform, platformBps };
}
