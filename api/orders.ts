import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isCryptoAllowed, normalizeCountry } from "../shared/cryptoCountries.js";
import { platformBpsFor } from "../server/commission.js";
import { isProduction, siteUrl } from "../server/config.js";
import { buyerCountry, limited, sendError } from "../server/http.js";
import { splitAmount, usdToMicroUsdc } from "../server/money.js";
import { createUsdcOrder, defaultChain, publicOrder, refreshOrder } from "../server/orders.js";
import { refreshDeps } from "../server/services.js";
import { getStore } from "../server/store/index.js";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * GET  /api/orders?piece=...              -> piece summary for the checkout page
 * POST /api/orders   { pieceId, email? }  -> new pending order + Solana Pay link
 * GET  /api/orders?id=...                 -> order status (checks the chain while pending)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "POST") {
      if (limited(req, res, "checkout", 10)) return;
      const { pieceId, email } = (req.body ?? {}) as { pieceId?: string; email?: string };
      if (!pieceId || typeof pieceId !== "string" || !UUID.test(pieceId)) return res.status(400).json({ error: "Missing piece." });
      // Price, receivers and split all come from the database, never from the browser.
      const order = await createUsdcOrder(getStore(), defaultChain(), {
        pieceId,
        email: typeof email === "string" ? email : null,
        buyerCountry: buyerCountry(req),
        allowUnknownCountry: !isProduction(),
      });
      const link = `${siteUrl()}/api/pay?order=${order.id}`;
      return res.status(201).json({ order: publicOrder(order), solanaPayUrl: `solana:${encodeURIComponent(link)}` });
    }

    if (req.method === "GET" && req.query.piece) {
      if (limited(req, res, "piece", 60)) return;
      const id = String(req.query.piece);
      if (!UUID.test(id)) return res.status(400).json({ error: "Invalid piece." });
      const store = getStore();
      const piece = await store.getPiece(id);
      if (!piece || piece.status === "draft") return res.status(404).json({ error: "This piece does not exist." });
      const house = await store.getHouse(piece.house_id);
      const split = splitAmount(usdToMicroUsdc(piece.price_usd), house ? platformBpsFor(house) : 2000);
      const country = buyerCountry(req);
      return res.status(200).json({
        piece: {
          id: piece.id,
          serial: piece.serial,
          name: piece.name,
          maker: piece.maker,
          priceUsd: piece.price_usd,
          photo: piece.photos[0]?.url ?? null,
          available: piece.status === "registered",
        },
        house: { name: house?.name ?? "", acceptsUsdc: Boolean(house?.wallet_verified_at) && isCryptoAllowed(normalizeCountry(house?.country), true) },
        split: { houseShare: split.house.toString(), platformShare: split.platform.toString(), platformBps: split.platformBps },
        buyer: { country, cryptoAllowed: isCryptoAllowed(country, !isProduction()) },
      });
    }

    if (req.method === "GET") {
      if (limited(req, res, "order-status", 60)) return;
      const id = String(req.query.id ?? "");
      if (!UUID.test(id)) return res.status(400).json({ error: "Invalid order id." });
      const deps = refreshDeps();
      const order = await refreshOrder(deps, id);
      const piece = await deps.store.getPiece(order.piece_id);
      return res.status(200).json({ order: { ...publicOrder(order), serial: piece?.serial ?? null, pieceName: piece?.name ?? null } });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (e) {
    return sendError(res, e);
  }
}
