import type { VercelRequest, VercelResponse } from "@vercel/node";
import { explorerAddress, explorerTx } from "../server/config.js";
import { limited, sendError } from "../server/http.js";
import { verifyBySerial } from "../server/services.js";

/** GET /api/verify?serial=MR-XXXX-XXXXXXXX  (public, no login) */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();
  if (limited(req, res, "verify", 30)) return;
  try {
    const serial = String(req.query.serial ?? "").slice(0, 40);
    const result = await verifyBySerial(serial);
    res.setHeader("Cache-Control", "public, max-age=15");
    return res.status(200).json({
      ...result,
      assetExplorerUrl: result.asset ? explorerAddress(result.asset.address) : null,
      history: result.history.map((h) => ({ ...h, explorerUrl: explorerTx(h.signature) })),
    });
  } catch (e) {
    return sendError(res, e);
  }
}
