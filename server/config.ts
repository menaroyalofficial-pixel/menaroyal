/**
 * Server settings, read from environment variables only.
 * Secrets are never logged. See .env.example for the full list.
 */
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export type Cluster = "devnet";

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export function required(name: string): string {
  const v = read(name);
  if (!v) throw new ConfigError(name);
  return v;
}

export class ConfigError extends Error {
  constructor(public variable: string) {
    super(`Missing setting: ${variable}`);
  }
}

/** Devnet only. Anything else is refused on purpose. */
export function cluster(): Cluster {
  const c = read("SOLANA_CLUSTER") ?? "devnet";
  if (c !== "devnet") throw new Error(`Only devnet is allowed (got "${c}")`);
  return "devnet";
}

export function rpcUrl(): string {
  cluster();
  const explicit = read("SOLANA_RPC_URL");
  if (explicit) return explicit;
  const helius = read("HELIUS_API_KEY");
  if (helius) return `https://devnet.helius-rpc.com/?api-key=${helius}`;
  return "https://api.devnet.solana.com";
}

export function usdcMint(): PublicKey {
  return new PublicKey(required("USDC_MINT"));
}

export function treasuryWallet(): PublicKey {
  return new PublicKey(required("MENAROYAL_TREASURY_WALLET"));
}

/** Signs certificate mints and transfers. Never sent to the browser. */
export function authorityKeypair(): Keypair {
  const raw = required("MENAROYAL_AUTHORITY_SECRET_KEY");
  const bytes = raw.startsWith("[") ? Uint8Array.from(JSON.parse(raw)) : bs58.decode(raw);
  return Keypair.fromSecretKey(bytes);
}

/** Public key of the authority. Can be read without the secret (verify page). */
export function authorityPublicKey(): PublicKey {
  const pub = read("MENAROYAL_AUTHORITY_PUBLIC_KEY");
  if (pub) return new PublicKey(pub);
  return authorityKeypair().publicKey;
}

/** Secret used to derive certificate addresses from serial numbers. */
export function certSeedSecret(): string {
  return required("CERT_SEED_SECRET");
}

export function custodyWallet(): PublicKey | null {
  const v = read("MENAROYAL_CUSTODY_WALLET");
  return v ? new PublicKey(v) : null;
}

export function heliusApiKey(): string | undefined {
  return read("HELIUS_API_KEY");
}

export function heliusWebhookSecret(): string | undefined {
  return read("HELIUS_WEBHOOK_SECRET");
}

/** "irys" (Arweave via Irys devnet) or "inline" (metadata stored inside the asset). */
export function certStorage(): "irys" | "inline" {
  return read("CERT_STORAGE") === "irys" ? "irys" : "inline";
}

export function siteUrl(): string {
  return (read("PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/$/, "");
}

export function isProduction(): boolean {
  return read("VERCEL_ENV") === "production";
}

export function supabaseServer(): { url: string; serviceKey: string } | null {
  const url = read("SUPABASE_URL") ?? read("VITE_SUPABASE_URL");
  const serviceKey = read("SUPABASE_SERVICE_ROLE_KEY");
  return url && serviceKey ? { url, serviceKey } : null;
}

export function explorerTx(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster()}`;
}

export function explorerAddress(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster()}`;
}
