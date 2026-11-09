/**
 * Serial numbers and certificate addresses.
 *
 * The certificate address is derived from the serial with a server secret,
 * so /verify/<serial> can find the asset on the chain without a database.
 * A made-up serial points to an empty address and fails verification.
 */
import { createHash, createHmac, randomBytes } from "node:crypto";
import { Keypair } from "@solana/web3.js";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // no I, L, O, U
export const SERIAL_PATTERN = /^MR-[A-Z0-9]{2,6}-[0-9A-HJKMNP-TV-Z]{8}$/;

export function houseCode(slug: string): string {
  const letters = slug.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return (letters.slice(0, 4) || "HSE").padEnd(2, "X");
}

export function generateSerial(houseSlug: string): string {
  const bytes = randomBytes(8);
  let tail = "";
  for (const b of bytes) tail += ALPHABET[b % 32];
  return `MR-${houseCode(houseSlug)}-${tail}`;
}

export function isValidSerial(serial: string): boolean {
  return SERIAL_PATTERN.test(serial);
}

function seed(secret: string, label: string): Uint8Array {
  return Uint8Array.from(createHmac("sha256", secret).update(`menaroyal:${label}`).digest());
}

/** Keypair for the certificate (Core asset) of a serial. */
export function assetKeypairFor(secret: string, serial: string): Keypair {
  return Keypair.fromSeed(seed(secret, `asset:${serial}`));
}

/** Keypair for a house's collection. */
export function collectionKeypairFor(secret: string, houseId: string): Keypair {
  return Keypair.fromSeed(seed(secret, `collection:${houseId}`));
}

export function sha256Hex(data: Uint8Array | string): string {
  return createHash("sha256").update(data).digest("hex");
}
