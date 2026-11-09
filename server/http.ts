import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ConfigError } from "./config.js";
import { OrderError } from "./orders.js";
import { rateLimit } from "./rateLimit.js";

export function header(req: VercelRequest, name: string): string | undefined {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}

export function clientIp(req: VercelRequest): string {
  return (header(req, "x-forwarded-for")?.split(",")[0] ?? req.socket?.remoteAddress ?? "unknown").trim();
}

/** Country from Vercel's edge header, or a dev override. */
export function buyerCountry(req: VercelRequest): string | null {
  return header(req, "x-vercel-ip-country") ?? process.env.DEV_COUNTRY ?? null;
}

export function limited(req: VercelRequest, res: VercelResponse, bucket: string, max: number, windowMs = 60_000): boolean {
  const r = rateLimit(`${bucket}:${clientIp(req)}`, max, windowMs);
  res.setHeader("X-RateLimit-Remaining", String(r.remaining));
  if (!r.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(r.retryAfterMs / 1000)));
    res.status(429).json({ error: "Too many requests. Please wait a moment." });
    return true;
  }
  return false;
}

export function cors(res: VercelResponse) {
  // Solana Pay wallets call the transaction request URL from their own app.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function sendError(res: VercelResponse, e: unknown) {
  if (e instanceof OrderError) return res.status(e.status).json({ error: e.message });
  if (e instanceof ConfigError) {
    console.error(e.message);
    return res.status(503).json({ error: "Payments are not set up yet on this site." });
  }
  console.error(e);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}
