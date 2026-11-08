import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isCryptoAllowed } from "../shared/cryptoCountries.js";
import { isProduction } from "../server/config.js";
import { buyerCountry } from "../server/http.js";

/** Tells the page whether to show "Pay with USDC" for this visitor. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const country = buyerCountry(req);
  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({ country, cryptoAllowed: isCryptoAllowed(country, !isProduction()) });
}
