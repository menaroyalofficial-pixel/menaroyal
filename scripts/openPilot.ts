/**
 * Opens a pilot preview in the browser with its secret key, without printing the key.
 *   pnpm pilot:open                 -> fragrance-demo on this laptop
 *   pnpm pilot:open maison-x        -> pilots/maison-x.json
 *   pnpm pilot:open maison-x https://<preview>.vercel.app
 *
 * On the laptop it uses the Wi-Fi address (not "localhost"), so a phone on the
 * same Wi-Fi can scan the certificate QR. Run `pnpm dev` first.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return undefined;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && m[1] === name) return m[2].replace(/^"(.*)"$/, "$1");
  }
  return undefined;
}

function lanAddress(): string {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list ?? []) if (a.family === "IPv4" && !a.internal && !a.address.startsWith("169.254")) return a.address;
  }
  return "localhost";
}

const slug = process.argv[2] ?? "fragrance-demo";
const base = (process.argv[3] ?? env("DEMO_BASE_URL") ?? `http://${lanAddress()}:8080`).replace(/\/$/, "");
const key = env("PILOT_PREVIEW_KEY");

if (!fs.existsSync(path.join(process.cwd(), "pilots", `${slug}.json`))) {
  console.error(`No pilot file: pilots/${slug}.json`);
  process.exit(1);
}
if (!key || env("PILOT_PREVIEW") !== "true") {
  console.error("Set PILOT_PREVIEW=true and PILOT_PREVIEW_KEY in .env.local (or in Vercel for a preview site).");
  process.exit(1);
}

const url = `${base}/pilot/${slug}?key=${encodeURIComponent(key)}`;
console.log(`Opening ${base}/pilot/${slug}?key=•••••• (key from PILOT_PREVIEW_KEY)`);
const [cmd, args] =
  process.platform === "win32" ? ["rundll32", ["url.dll,FileProtocolHandler", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
spawn(cmd, args as string[], { stdio: "ignore", detached: true }).unref();
