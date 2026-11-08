import type { VercelRequest, VercelResponse } from "@vercel/node";
import { houseIdFromToken } from "../server/auth.js";
import { certSeedSecret, explorerAddress, explorerTx } from "../server/config.js";
import { foundingPeriodEnd, platformBpsFor } from "../server/commission.js";
import { header, limited, sendError } from "../server/http.js";
import { walletChallenge, verifyWalletSignature } from "../server/houseWallet.js";
import { OrderError } from "../server/orders.js";
import { confirmPieceRegistration, startPieceRegistration } from "../server/pieces.js";
import { chainReader, registerDeps } from "../server/services.js";
import { getStore } from "../server/store/index.js";

/**
 * House dashboard API (login required). POST { action, ... }
 *  overview         -> wallet, commission, pieces, orders and payouts
 *  wallet-challenge -> message for the house wallet to sign
 *  wallet-verify    -> checks the signature and saves the wallet
 *  register-piece   -> prepares the certificate, returns a transaction for the house to sign
 *  confirm-piece    -> checks the chain after the house sent it
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).end();
  if (limited(req, res, "house", 30)) return;
  try {
    const houseId = await houseIdFromToken(header(req, "authorization"));
    const store = getStore();
    const house = await store.getHouse(houseId);
    if (!house) throw new OrderError("House not found.", 404);
    const body = (req.body ?? {}) as Record<string, any>;

    switch (body.action) {
      case "overview": {
        const [pieces, orders] = await Promise.all([store.listHousePieces(houseId), store.listHouseOrders(houseId)]);
        const end = foundingPeriodEnd(house);
        return res.status(200).json({
          house: {
            name: house.name,
            wallet: house.wallet_address,
            walletVerified: Boolean(house.wallet_verified_at),
            commissionBps: platformBpsFor(house),
            foundingUntil: end && end > new Date() ? end.toISOString() : null,
          },
          pieces: pieces.map((p) => ({
            id: p.id,
            serial: p.serial,
            name: p.name,
            priceUsd: p.price_usd,
            status: p.status,
            photo: p.photos[0]?.url ?? null,
            assetExplorerUrl: p.asset_address && p.status !== "draft" ? explorerAddress(p.asset_address) : null,
          })),
          orders: orders.map((o) => ({
            id: o.id,
            pieceId: o.piece_id,
            status: o.status,
            amountUsd: o.amount_usd,
            houseShare: o.house_share,
            platformShare: o.platform_share,
            createdAt: o.created_at,
            payoutExplorerUrl: o.tx_signature ? explorerTx(o.tx_signature) : null,
          })),
        });
      }
      case "wallet-challenge": {
        if (typeof body.wallet !== "string") throw new OrderError("Missing wallet address.");
        const pieces = await store.listHousePieces(houseId);
        if (house.wallet_address && house.wallet_address !== body.wallet && pieces.some((p) => p.status !== "draft")) {
          throw new OrderError("This house already has certificates signed by another wallet. Contact MENA ROYAL to change it.", 409);
        }
        return res.status(200).json(walletChallenge(certSeedSecret(), houseId, body.wallet));
      }
      case "wallet-verify": {
        const ok = verifyWalletSignature(certSeedSecret(), {
          houseId,
          wallet: String(body.wallet ?? ""),
          message: String(body.message ?? ""),
          signature: String(body.signature ?? ""),
        });
        if (!ok) throw new OrderError("The signature does not match. Please try again.", 400);
        await store.updateHouse(houseId, { wallet_address: body.wallet, wallet_verified_at: new Date().toISOString() });
        return res.status(200).json({ ok: true });
      }
      case "register-piece": {
        const out = await startPieceRegistration(registerDeps(), house, body.piece ?? {});
        return res.status(200).json({ pieceId: out.piece.id, serial: out.piece.serial, transaction: out.transaction });
      }
      case "confirm-piece": {
        const piece = await confirmPieceRegistration(store, chainReader(), certSeedSecret(), String(body.pieceId ?? ""), houseId);
        return res.status(200).json({ status: piece.status, serial: piece.serial });
      }
      default:
        throw new OrderError("Unknown action.");
    }
  } catch (e) {
    if (e instanceof Error && !(e instanceof OrderError) && /required|photo|price|date|wallet/i.test(e.message)) {
      return res.status(400).json({ error: e.message });
    }
    return sendError(res, e);
  }
}
