/**
 * Proves a house owns the wallet it pastes: the wallet signs a short message.
 * The challenge is signed by the server (HMAC) and expires after 10 minutes,
 * so nothing has to be stored between the two steps.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

const TTL_MS = 10 * 60 * 1000;

function mac(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(`wallet-challenge:${payload}`).digest("base64url");
}

export function walletChallenge(secret: string, houseId: string, wallet: string, now = Date.now()) {
  new PublicKey(wallet); // throws on an invalid address
  const payload = Buffer.from(JSON.stringify({ h: houseId, w: wallet, e: now + TTL_MS, n: randomBytes(8).toString("hex") })).toString("base64url");
  const token = `${payload}.${mac(secret, payload)}`;
  const message = `MENA ROYAL: I confirm this wallet belongs to my house.\n\nWallet: ${wallet}\nCode: ${token}`;
  return { token, message };
}

export function verifyWalletSignature(
  secret: string,
  args: { houseId: string; wallet: string; message: string; signature: string },
  now = Date.now(),
): boolean {
  const m = /Code: ([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(args.message);
  if (!m) return false;
  const [, payload, tag] = m;
  const expected = Buffer.from(mac(secret, payload));
  const given = Buffer.from(tag);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;

  let data: { h: string; w: string; e: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return false;
  }
  if (data.h !== args.houseId || data.w !== args.wallet || data.e < now) return false;
  if (!args.message.includes(`Wallet: ${args.wallet}\n`)) return false;

  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(args.message),
      bs58.decode(args.signature),
      new PublicKey(args.wallet).toBytes(),
    );
  } catch {
    return false;
  }
}
