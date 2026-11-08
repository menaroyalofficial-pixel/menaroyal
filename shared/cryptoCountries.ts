/**
 * Where "Pay with USDC" is offered.
 *
 * Edit this list to change it. Use two-letter country codes (ISO 3166-1).
 * - Buyers in these countries do not see the USDC button.
 * - Houses based in these countries are not paid in crypto (card payouts later).
 */
export const CRYPTO_BLOCKED_COUNTRIES: Record<string, string> = {
  KW: "Kuwait banned crypto payments in 2023.",
  SA: "Saudi Arabia does not allow crypto payments for now.",
};

/** Country names we see in the houses table, mapped to two-letter codes. */
const COUNTRY_NAMES: Record<string, string> = {
  "saudi arabia": "SA",
  ksa: "SA",
  "united arab emirates": "AE",
  uae: "AE",
  kuwait: "KW",
  qatar: "QA",
  bahrain: "BH",
  oman: "OM",
  jordan: "JO",
  lebanon: "LB",
  egypt: "EG",
  palestine: "PS",
  morocco: "MA",
  tunisia: "TN",
  algeria: "DZ",
  iraq: "IQ",
  syria: "SY",
  turkey: "TR",
  "united kingdom": "GB",
  uk: "GB",
  france: "FR",
  "united states": "US",
  usa: "US",
};

export function normalizeCountry(value?: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (/^[A-Za-z]{2}$/.test(v)) return v.toUpperCase();
  return COUNTRY_NAMES[v.toLowerCase()] ?? null;
}

/**
 * True when a USDC payment is allowed for this country.
 * `allowUnknown` decides what happens when we cannot tell the country
 * (for example on a laptop during development).
 */
export function isCryptoAllowed(country?: string | null, allowUnknown = true): boolean {
  const code = normalizeCountry(country);
  if (!code) return allowUnknown;
  return !(code in CRYPTO_BLOCKED_COUNTRIES);
}
