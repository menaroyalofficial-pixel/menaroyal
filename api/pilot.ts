import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Connection } from "@solana/web3.js";
import * as cfg from "../server/config.js";
import { header, limited, sendError } from "../server/http.js";
import { defaultCertificateMover, OrderError } from "../server/orders.js";
import { authorityUmi } from "../server/certificates/umi.js";
import { inlineStorage, irysStorage } from "../server/certificates/storage.js";
import { PilotConfigError } from "../shared/pilot.js";
import {
  completePurchase,
  loadPilot,
  pilotAccess,
  pilotOrderView,
  pilotOverview,
  pilotStore,
  preparePurchase,
  type PilotDeps,
  type PilotPageDeps,
} from "../server/pilot/pilot.js";

/**
 * Private pilot preview for one house. Preview only.
 *  GET  ?slug=&key=                         -> page data and the house dashboard
 *  POST ?slug=&key= { action: "prepare", productId, engraving? } -> bottle registered, order opened
 *  POST ?slug=&key= { action: "pay", orderId }                   -> paid, checked, certificate handed over
 * Anything wrong (flag off, production, wrong key, unknown house) answers 404.
 */
function pageDeps(): PilotPageDeps {
  return { store: pilotStore(), seedSecret: cfg.certSeedSecret() };
}

function deps(): PilotDeps {
  const authority = cfg.authorityKeypair();
  const umi = authorityUmi(cfg.rpcUrl(), authority);
  return {
    store: pilotStore(),
    umi,
    storage: cfg.certStorage() === "irys" ? irysStorage(umi) : inlineStorage(),
    seedSecret: cfg.certSeedSecret(),
    chain: { connection: new Connection(cfg.rpcUrl(), "confirmed"), mint: cfg.usdcMint(), treasury: cfg.treasuryWallet() },
    mover: defaultCertificateMover(),
    authority,
  };
}

/** Address the certificate photos and the QR code point to. */
function origin(req: VercelRequest): string {
  const fixed = process.env.PUBLIC_SITE_URL?.trim() || process.env.DEMO_BASE_URL?.trim();
  if (fixed) return fixed.replace(/\/$/, "");
  const host = header(req, "x-forwarded-host") ?? header(req, "host") ?? "localhost:8080";
  const proto = header(req, "x-forwarded-proto") ?? (/^(localhost|127\.|192\.168\.|10\.)/.test(host) ? "http" : "https");
  return `${proto.split(",")[0]}://${host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  const notFound = () => res.status(404).json({ error: "Not found" });

  if (pilotAccess(process.env, req.query.key) !== "ok") return notFound();
  if (limited(req, res, "pilot", 40)) return;

  try {
    const pilot = loadPilot(String(req.query.slug ?? ""));
    if (!pilot) return notFound();
    if (req.method === "GET") {
      return res.status(200).json(await pilotOverview(pageDeps(), pilot, origin(req)));
    }
    if (req.method !== "POST") return res.status(405).end();
    const d = deps();

    const body = (req.body ?? {}) as Record<string, unknown>;
    if (body.action === "prepare") {
      const { order } = await preparePurchase(d, pilot, {
        productId: String(body.productId ?? ""),
        engraving: body.engraving,
        origin: origin(req),
      });
      return res.status(200).json({ order: await pilotOrderView(d.store, pilot, order) });
    }
    if (body.action === "pay") {
      const order = await completePurchase(d, pilot, String(body.orderId ?? ""));
      return res.status(200).json({ order: await pilotOrderView(d.store, pilot, order) });
    }
    throw new OrderError("Unknown action.");
  } catch (e) {
    if (e instanceof PilotConfigError) {
      return res.status(422).json({ error: e.message.startsWith("Engraving") ? e.message : `Pilot file: ${e.message}` });
    }
    return sendError(res, e);
  }
}
