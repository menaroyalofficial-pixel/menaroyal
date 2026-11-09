/**
 * What a certificate says about a piece. No personal data about the buyer.
 *
 * The "facts" are hashed and the hash is written on the chain, in a part of
 * the certificate nobody can edit later. The house signs the same transaction,
 * so the facts are approved by the house.
 */
import { sha256Hex } from "./serial.js";

export const CERT_STANDARD = "menaroyal-certificate-v1";

export interface CertificateFacts {
  standard: typeof CERT_STANDARD;
  serial: string;
  piece: string;
  house: string;
  house_wallet: string;
  maker: string;
  country: string;
  materials: string[];
  made_on: string;
  photos: { uri: string; sha256: string }[];
  /** Production batch, when the house tracks one (fragrance, ceramics). */
  batch?: string;
  /**
   * Personalised pieces: only a salted hash of the engraving goes on the chain.
   * The engraving itself and the salt stay in our database.
   */
  engraving_sha256?: string;
}

/** JSON with sorted keys, so the same facts always give the same hash. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function factsHash(facts: CertificateFacts): string {
  return sha256Hex(canonicalJson(facts));
}

/** Metaplex-style JSON. The facts sit under properties.certificate. */
export function buildMetadata(facts: CertificateFacts) {
  return {
    name: `${facts.piece} · ${facts.house}`,
    symbol: "MRCOA",
    description: `Certificate of authenticity for "${facts.piece}" by ${facts.house}. Serial ${facts.serial}. Verify at menaroyal.com/verify/${facts.serial}`,
    image: facts.photos[0]?.uri,
    external_url: `https://www.menaroyal.com/verify/${facts.serial}`,
    attributes: [
      { trait_type: "House", value: facts.house },
      { trait_type: "Maker", value: facts.maker },
      { trait_type: "Country", value: facts.country },
      { trait_type: "Materials", value: facts.materials.join(", ") },
      { trait_type: "Made on", value: facts.made_on },
      { trait_type: "Serial", value: facts.serial },
      ...(facts.batch ? [{ trait_type: "Batch", value: facts.batch }] : []),
    ],
    properties: {
      category: "image",
      files: facts.photos.map((p) => ({ uri: p.uri, type: guessType(p.uri) })),
      certificate: facts,
    },
  };
}

function guessType(uri: string): string {
  if (/\.png($|\?)/i.test(uri)) return "image/png";
  if (/\.webp($|\?)/i.test(uri)) return "image/webp";
  if (/\.svg($|\?)/i.test(uri)) return "image/svg+xml";
  return "image/jpeg";
}

/** Reads facts back from metadata JSON, or null if the shape is wrong. */
export function extractFacts(metadata: any): CertificateFacts | null {
  const f = metadata?.properties?.certificate;
  if (!f || f.standard !== CERT_STANDARD || typeof f.serial !== "string" || !Array.isArray(f.photos)) return null;
  return f as CertificateFacts;
}

export function inlineUri(json: unknown): string {
  return `data:application/json;base64,${Buffer.from(JSON.stringify(json)).toString("base64")}`;
}

/** Loads JSON from https://, ar:// or a data: URI. */
export async function loadJson(uri: string, fetchImpl: typeof fetch = fetch): Promise<unknown> {
  if (uri.startsWith("data:application/json;base64,")) {
    return JSON.parse(Buffer.from(uri.slice("data:application/json;base64,".length), "base64").toString("utf8"));
  }
  const res = await fetchImpl(toHttp(uri));
  if (!res.ok) throw new Error(`Metadata not reachable (${res.status})`);
  return res.json();
}

export function toHttp(uri: string): string {
  if (uri.startsWith("ar://")) return `https://gateway.irys.xyz/${uri.slice(5)}`;
  return uri;
}
