/**
 * Where certificate details and photos are stored.
 *  - "irys": permanent storage on Arweave through Irys (devnet node, paid in devnet SOL).
 *  - "inline": details stored inside the certificate itself; photos stay at their URL.
 * In both cases the photo hashes are on the chain, so a swapped photo is detected.
 */
import { createGenericFile, type Umi } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { inlineUri } from "./metadata.js";
import { sha256Hex } from "./serial.js";

export interface CertStorage {
  storePhoto(bytes: Uint8Array, name: string, sourceUrl: string): Promise<string>;
  storeJson(json: unknown): Promise<string>;
}

export function inlineStorage(): CertStorage {
  return {
    storePhoto: async (_bytes, _name, sourceUrl) => sourceUrl,
    storeJson: async (json) => inlineUri(json),
  };
}

export function irysStorage(umi: Umi): CertStorage {
  umi.use(irysUploader({ address: "https://devnet.irys.xyz" }));
  return {
    async storePhoto(bytes, name) {
      const type = /\.png$/i.test(name) ? "image/png" : /\.svg$/i.test(name) ? "image/svg+xml" : /\.webp$/i.test(name) ? "image/webp" : "image/jpeg";
      const [uri] = await umi.uploader.upload([createGenericFile(bytes, name, { contentType: type })]);
      return uri;
    },
    storeJson: (json) => umi.uploader.uploadJson(json),
  };
}

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/** In production, photos may only come from our own storage and site. */
export function allowedPhotoHosts(): string[] | null {
  if (process.env.VERCEL_ENV !== "production") return null;
  const hosts = ["www.menaroyal.com", "menaroyal.com", "gateway.irys.xyz"];
  const sb = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  if (sb) hosts.push(new URL(sb).host);
  return hosts;
}

export async function downloadPhoto(url: string): Promise<{ bytes: Uint8Array; sha256: string }> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Photo must be a web address");
  const allowed = allowedPhotoHosts();
  if (allowed && (parsed.protocol !== "https:" || !allowed.includes(parsed.host))) {
    throw new Error("Upload photos through the dashboard.");
  }
  const res = await fetch(url, { redirect: "error" });
  if (!res.ok) throw new Error(`Photo not reachable: ${url} (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength > MAX_PHOTO_BYTES) throw new Error("Photo is larger than 8 MB");
  return { bytes, sha256: sha256Hex(bytes) };
}
