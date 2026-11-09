import type { VercelRequest, VercelResponse } from "@vercel/node";
import { siteUrl } from "../server/config.js";
import { cors, limited, sendError } from "../server/http.js";
import { buildOrderTransaction, defaultChain } from "../server/orders.js";
import { getStore } from "../server/store/index.js";

/**
 * Solana Pay transaction request (used by the QR code and by desktop wallets).
 * GET  -> label and icon shown in the wallet
 * POST { account } -> the payment transaction, built here from the order
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if (req.method === "GET") {
      return res.status(200).json({ label: "MENA ROYAL", icon: `${siteUrl()}/mr-icon.svg` });
    }
    if (req.method === "POST") {
      if (limited(req, res, "checkout-tx", 20)) return;
      const orderId = String(req.query.order ?? "");
      const account = (req.body ?? {}).account;
      if (!/^[0-9a-f-]{36}$/i.test(orderId)) return res.status(400).json({ error: "Invalid order." });
      if (typeof account !== "string") return res.status(400).json({ error: "Missing wallet account." });
      const out = await buildOrderTransaction(getStore(), defaultChain(), orderId, account);
      return res.status(200).json(out);
    }
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).end();
  } catch (e) {
    return sendError(res, e);
  }
}
