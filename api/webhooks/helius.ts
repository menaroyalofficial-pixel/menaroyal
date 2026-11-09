import { timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { heliusWebhookSecret } from "../../server/config.js";
import { header, sendError } from "../../server/http.js";
import { processSignatures } from "../../server/orders.js";
import { refreshDeps } from "../../server/services.js";

/** Constant-time comparison of the Authorization header. */
export function authorized(given: string | undefined, secret: string | undefined): boolean {
  if (!given || !secret) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Pulls transaction signatures out of a Helius webhook body (enhanced or raw). */
export function signaturesFrom(body: unknown): string[] {
  const items = Array.isArray(body) ? body : [body];
  const out = new Set<string>();
  for (const item of items as any[]) {
    const sig = item?.signature ?? item?.transaction?.signatures?.[0];
    if (typeof sig === "string" && /^[1-9A-HJ-NP-Za-km-z]{60,100}$/.test(sig)) out.add(sig);
  }
  return [...out];
}

/**
 * Helius calls this when a watched wallet receives a transaction, so orders
 * get marked paid even if the buyer closed the page. We only take the
 * signatures from the body and read the transactions from the chain ourselves.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (!authorized(header(req, "authorization"), heliusWebhookSecret())) return res.status(401).json({ error: "Unauthorized" });
  try {
    const updated = await processSignatures(refreshDeps(), signaturesFrom(req.body));
    return res.status(200).json({ updated: updated.length });
  } catch (e) {
    return sendError(res, e);
  }
}
