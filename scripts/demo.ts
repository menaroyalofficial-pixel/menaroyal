/**
 * MENA ROYAL Demo Day script (devnet only).
 *   pnpm demo:menaroyal
 *
 * 1. Demo house "Dar Rime" registers a caftan, signs it, certificate minted
 * 2. Buyer pays $1,500 devnet USDC: $1,200 to the house, $300 to MENA ROYAL, one transaction
 * 3. Certificate moves to the buyer
 * 4. /verify/<serial> -> "Made by Dar Rime, signed by the house ✓" (+ QR for the phone)
 * 5. A fake serial -> "Can't verify this piece"
 *
 * Demo keys live in .demo/ (ignored by git). Secrets are written to
 * .env.local and are never printed.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createMint, getAccount, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import bs58 from "bs58";
import nacl from "tweetnacl";
import QRCode from "qrcode";

const ROOT = process.cwd();
const DEMO_DIR = path.join(ROOT, ".demo");
const KEYS_FILE = path.join(DEMO_DIR, "keys.json");
const ENV_FILE = path.join(ROOT, ".env.local");
const DEMO_HOUSE_ID = "0d1a7e00-0000-4000-8000-00000000d4a1";
const CAFTAN_PHOTO = "https://www.menaroyal.com/curated/royal-velvet-caftan.jpg";

const t0 = Date.now();
const secs = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const step = (n: number | string, text: string) => console.log(`\n[${secs()}] ${n}. ${text}`);
const ok = (text: string) => console.log(`     ✓ ${text}`);
const info = (text: string) => console.log(`       ${text}`);

// ---------- env and keys (values are never printed) ----------

function readEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return out;
}

function setEnvValues(values: Record<string, string>) {
  const current = readEnvFile();
  const missing = Object.entries(values).filter(([k]) => !current[k]);
  if (missing.length) {
    const block = `\n# Added by pnpm demo:menaroyal (devnet demo values)\n${missing.map(([k, v]) => `${k}=${v}`).join("\n")}\n`;
    fs.appendFileSync(ENV_FILE, block);
    info(`Saved to .env.local: ${missing.map(([k]) => k).join(", ")}`);
  }
}

interface DemoKeys {
  authority: string;
  treasury: string;
  house: string;
  buyer: string;
  seedSecret: string;
  mint?: string;
}

function loadKeys(): DemoKeys {
  if (fs.existsSync(KEYS_FILE)) return JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
  fs.mkdirSync(DEMO_DIR, { recursive: true });
  const k: DemoKeys = {
    authority: bs58.encode(Keypair.generate().secretKey),
    treasury: bs58.encode(Keypair.generate().secretKey),
    house: bs58.encode(Keypair.generate().secretKey),
    buyer: bs58.encode(Keypair.generate().secretKey),
    seedSecret: randomBytes(32).toString("base64url"),
  };
  fs.writeFileSync(KEYS_FILE, JSON.stringify(k, null, 2));
  return k;
}

const kp = (s: string) => Keypair.fromSecretKey(bs58.decode(s));

function lanAddress(): string {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list ?? []) if (a.family === "IPv4" && !a.internal && !a.address.startsWith("169.254")) return a.address;
  }
  return "localhost";
}

// ---------- main ----------

async function main() {
  console.log("MENA ROYAL · Demo Day · Solana devnet");
  const keys = loadKeys();
  const authority = kp(keys.authority);
  const treasury = kp(keys.treasury);
  const houseKp = kp(keys.house);
  const buyer = kp(keys.buyer);

  // Settings for the site and this script. Existing values in .env.local win.
  const demoValues = {
    SOLANA_CLUSTER: "devnet",
    MENAROYAL_AUTHORITY_SECRET_KEY: keys.authority,
    MENAROYAL_AUTHORITY_PUBLIC_KEY: authority.publicKey.toBase58(),
    MENAROYAL_TREASURY_WALLET: treasury.publicKey.toBase58(),
    CERT_SEED_SECRET: keys.seedSecret,
  };
  setEnvValues(demoValues);
  Object.assign(process.env, { ...readEnvFile(), ...process.env });
  const differs = Object.entries(demoValues).filter(([k, v]) => readEnvFile()[k] !== v).map(([k]) => k);
  if (differs.length) {
    info(`Note: .env.local has other values for ${differs.join(", ")}. The script uses the demo keys;`);
    info(`the website will only verify demo certificates if .env.local uses the demo keys too.`);
  }
  Object.assign(process.env, demoValues); // the demo always runs with its own keys

  const cfg = await import("../server/config.js");
  const connection = new Connection(cfg.rpcUrl(), "confirmed");

  step(0, "Wallets");
  info(`MENA ROYAL authority  ${authority.publicKey.toBase58()}`);
  info(`MENA ROYAL treasury   ${treasury.publicKey.toBase58()}`);
  info(`Dar Rime (house)      ${houseKp.publicKey.toBase58()}`);
  info(`Buyer                 ${buyer.publicKey.toBase58()}`);

  // SOL for fees: only MENA ROYAL needs it, it tops up the buyer.
  let sol = await connection.getBalance(authority.publicKey);
  if (sol < 0.2 * LAMPORTS_PER_SOL) {
    try {
      const sig = await connection.requestAirdrop(authority.publicKey, 1 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      sol = await connection.getBalance(authority.publicKey);
    } catch {
      /* faucet limits */
    }
  }
  if (sol < 0.2 * LAMPORTS_PER_SOL) {
    console.log(`\n  The MENA ROYAL demo wallet needs devnet SOL (has ${(sol / LAMPORTS_PER_SOL).toFixed(3)}).`);
    console.log(`  1. Open https://faucet.solana.com`);
    console.log(`  2. Paste: ${authority.publicKey.toBase58()}`);
    console.log(`  3. Choose devnet, 5 SOL, confirm. Then run pnpm demo:menaroyal again.\n`);
    process.exit(1);
  }
  ok(`MENA ROYAL has ${(sol / LAMPORTS_PER_SOL).toFixed(2)} devnet SOL`);
  const buyerSol = await connection.getBalance(buyer.publicKey);
  if (buyerSol < 0.02 * LAMPORTS_PER_SOL) {
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(SystemProgram.transfer({ fromPubkey: authority.publicKey, toPubkey: buyer.publicKey, lamports: 0.05 * LAMPORTS_PER_SOL })),
      [authority],
    );
    ok("Buyer topped up with 0.05 SOL for network fees");
  }

  // Devnet USDC. Default: a demo USDC mint we control (6 decimals, like USDC).
  let mint: PublicKey;
  const envMint = process.env.USDC_MINT;
  if (envMint && envMint !== keys.mint) {
    mint = new PublicKey(envMint);
    info(`Using USDC mint from .env.local: ${mint.toBase58()}`);
  } else {
    if (!keys.mint) {
      keys.mint = (await createMint(connection, authority, authority.publicKey, null, 6)).toBase58();
      fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
    }
    mint = new PublicKey(keys.mint);
    setEnvValues({ USDC_MINT: mint.toBase58() });
    process.env.USDC_MINT = mint.toBase58();
  }
  const buyerAta = await getOrCreateAssociatedTokenAccount(connection, authority, mint, buyer.publicKey);
  if (buyerAta.amount < 1_500_000_000n) {
    try {
      await mintTo(connection, authority, mint, buyerAta.address, authority, 1_500_000_000n - buyerAta.amount);
      ok("Buyer funded with devnet USDC");
    } catch {
      console.log(`\n  The buyer needs 1,500 devnet USDC on mint ${mint.toBase58()}.`);
      console.log(`  Get it at https://faucet.circle.com (Solana devnet) for ${buyer.publicKey.toBase58()}, then run again.\n`);
      process.exit(1);
    }
  }

  // Everything below uses the same code as the website.
  const { FileStore } = await import("../server/store/fileStore.js");
  const { authorityUmi, signerFrom } = await import("../server/certificates/umi.js");
  const { inlineStorage, irysStorage } = await import("../server/certificates/storage.js");
  const { registerPieceWithSigner } = await import("../server/pieces.js");
  const { walletChallenge, verifyWalletSignature } = await import("../server/houseWallet.js");
  const { createUsdcOrder, buildOrderTransaction, refreshOrder, defaultCertificateMover } = await import("../server/orders.js");
  const { verifyBySerial } = await import("../server/services.js");
  const { formatUsdc } = await import("../server/money.js");

  const store = new FileStore(path.join(DEMO_DIR, "store.json"));
  const umi = authorityUmi(cfg.rpcUrl(), authority);
  const storage = cfg.certStorage() === "irys" ? irysStorage(umi) : inlineStorage();
  const chain = { connection, mint, treasury: treasury.publicKey };

  // ---- 1. House registers a caftan ----
  step(1, 'Demo house "Dar Rime" registers a caftan and signs it');
  await store.upsertHouse({
    id: DEMO_HOUSE_ID,
    name: "Dar Rime",
    slug: "dar-rime",
    country: "AE",
    wallet_address: null,
    wallet_verified_at: null,
    commission_bps: 2000,
    founding_house: true,
    start_date: "2026-01-01", // founding period (0%) ended on 1 April 2026 -> 20% now
    founding_months: 3,
  });
  const challenge = walletChallenge(keys.seedSecret, DEMO_HOUSE_ID, houseKp.publicKey.toBase58());
  const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(challenge.message), houseKp.secretKey));
  if (!verifyWalletSignature(keys.seedSecret, { houseId: DEMO_HOUSE_ID, wallet: houseKp.publicKey.toBase58(), message: challenge.message, signature })) {
    throw new Error("House wallet check failed");
  }
  const house = await store.updateHouse(DEMO_HOUSE_ID, { wallet_address: houseKp.publicKey.toBase58(), wallet_verified_at: new Date().toISOString() });
  ok("House wallet verified by signing a message");

  const piece = await registerPieceWithSigner(
    { store, umi, storage, seedSecret: keys.seedSecret },
    house,
    signerFrom(umi, houseKp),
    {
      name: "Caftan Layla",
      maker: "Dar Rime atelier, Dubai",
      country: "United Arab Emirates",
      materials: ["Silk velvet", "Gold thread embroidery"],
      madeOn: "2026-10-20",
      priceUsd: "1500",
      photoUrls: [CAFTAN_PHOTO],
    },
  );
  ok(`Certificate minted, serial ${piece.serial}`);
  info(`Signed by the house and MENA ROYAL in one transaction: ${cfg.explorerTx(piece.registration_tx!)}`);
  info(`Certificate: ${cfg.explorerAddress(piece.asset_address!)}`);

  // ---- 2. Buyer pays ----
  step(2, "Buyer pays $1,500 in devnet USDC (one transaction, split on chain)");
  const houseAta = getAssociatedTokenAddressSync(mint, houseKp.publicKey);
  const treasuryAta = getAssociatedTokenAddressSync(mint, treasury.publicKey);
  const bal = async (a: PublicKey) => (await getAccount(connection, a).catch(() => ({ amount: 0n }))).amount;
  const [houseBefore, treasuryBefore] = [await bal(houseAta), await bal(treasuryAta)];

  const order = await createUsdcOrder(store, chain, { pieceId: piece.id, buyerCountry: "AE", allowUnknownCountry: false });
  info(`Order ${order.id} · commission ${order.platform_bps / 100}% (founding period over)`);
  const { transaction } = await buildOrderTransaction(store, chain, order.id, buyer.publicKey.toBase58());
  const tx = Transaction.from(Buffer.from(transaction, "base64"));
  tx.partialSign(buyer); // what Phantom/Solflare does when the buyer approves
  const paySig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(paySig, "confirmed");
  ok(`Paid: ${cfg.explorerTx(paySig)}`);

  const deps = { store, chain, mover: defaultCertificateMover(), seedSecret: keys.seedSecret };
  let paid = await refreshOrder(deps, order.id);
  for (let i = 0; i < 10 && paid.status !== "paid"; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    paid = await refreshOrder(deps, order.id);
  }
  if (paid.status !== "paid") throw new Error(`Payment not confirmed: ${paid.failure_reason ?? paid.status}`);
  const houseGot = (await bal(houseAta)) - houseBefore;
  const treasuryGot = (await bal(treasuryAta)) - treasuryBefore;
  ok(`Server checked amounts, receivers, USDC mint and memo -> order marked paid`);
  ok(`Dar Rime received $${formatUsdc(houseGot)} · MENA ROYAL received $${formatUsdc(treasuryGot)}`);
  if (houseGot !== 1_200_000_000n || treasuryGot !== 300_000_000n) throw new Error("Split is wrong");

  // ---- 3. Certificate to buyer ----
  step(3, "Certificate moves to the buyer");
  if (paid.certificate_status !== "transferred") throw new Error(`Certificate not transferred (${paid.certificate_status})`);
  ok(`Now owned by the buyer: ${cfg.explorerTx(paid.certificate_tx!)}`);

  // ---- 4. Verify ----
  step(4, "Verify (what the QR on the label opens)");
  const real = await verifyBySerial(piece.serial);
  if (!real.ok) throw new Error(`Verification failed: ${real.reasons.join("; ")}`);
  ok(`Made by ${real.house!.name}, signed by the house ✓`);
  ok(`Current owner: ${real.owner!.label}`);
  ok(`Photos match: ${real.photos.every((p) => p.ok) ? "✓" : "✗"} · history: ${real.history.length} events`);

  // ---- 5. Fake serial ----
  step(5, "A fake serial");
  const fakeSerial = piece.serial.slice(0, -4) + "ZZZZ";
  const fake = await verifyBySerial(fakeSerial);
  if (fake.ok) throw new Error("Fake serial verified!");
  ok(`${fakeSerial} -> "Can't verify this piece" (${fake.reasons[0]})`);

  // ---- QR for the phone ----
  const base = (process.env.DEMO_BASE_URL ?? `http://${lanAddress()}:8080`).replace(/\/$/, "");
  const verifyUrl = `${base}/verify/${piece.serial}`;
  fs.writeFileSync(path.join(DEMO_DIR, "last-run.json"), JSON.stringify({ serial: piece.serial, fakeSerial, verifyUrl, order: order.id }, null, 2));
  console.log(`\n[${secs()}] Done in ${secs()}.\n`);
  console.log(`  Laptop: ${verifyUrl}`);
  console.log(`  Fake:   ${base}/verify/${fakeSerial}`);
  console.log(`  Phone (same Wi-Fi, site running with pnpm dev): scan this QR\n`);
  console.log(await QRCode.toString(verifyUrl, { type: "terminal", small: true }));
}

main().catch((e) => {
  console.error(`\n✗ Demo stopped: ${e.message}`);
  process.exit(1);
});
