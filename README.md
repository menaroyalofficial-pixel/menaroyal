# MENA ROYAL

The home of the Middle East's finest design houses. Vite + React + TypeScript, Supabase, deployed on Vercel.
Payments in USDC and certificates of authenticity on Solana (devnet). How it works: [docs/SOLANA.md](docs/SOLANA.md).

## Run it

```sh
pnpm install
pnpm dev            # http://localhost:8080 (the /api routes run too)
pnpm test           # all tests
pnpm typecheck
pnpm build
```

Settings: copy `.env.example` to `.env.local` and fill it in (or `vercel env pull .env.local`). Never commit real values.

Database: run `supabase/migrations/20261108000000_solana_v1.sql` in the Supabase SQL editor.

## Demo Day (devnet, under 2 minutes)

`pnpm demo:menaroyal` runs the whole story on Solana devnet, with the same code as the website:

1. The demo house **Dar Rime** registers a caftan, signs it, and its certificate is minted.
2. A buyer pays **$1,500** in devnet USDC. In one transaction, **$1,200** goes to the house and **$300** to MENA ROYAL.
3. The certificate moves to the buyer.
4. It prints the `/verify` link and a QR code: "Made by Dar Rime, signed by the house ✓".
5. It checks a fake serial: "Can't verify this piece".

### Once, before the day

1. `pnpm install`
2. Run `pnpm demo:menaroyal` once. The first time, it creates the demo wallets in `.demo/` and the demo settings in `.env.local`, then stops and prints a wallet address.
3. Open https://faucet.solana.com, sign in with GitHub, paste that address, choose **devnet**, and request 5 SOL. One top-up is enough for many runs.
4. Run `pnpm demo:menaroyal` again. It should end with "Done" and a QR code. Each later run takes about 30 to 60 seconds.

### Live, on the laptop and the phone

1. **Terminal 1:** `pnpm dev`. If Windows asks about the firewall, allow **private networks** so the phone can reach the laptop.
2. **Terminal 2:** `pnpm demo:menaroyal`. Talk through steps 1 to 5 as they print. Each step has a Solana Explorer link: open the payment one to show the two transfers in one transaction.
3. **Laptop:** open the printed `Laptop:` link. It shows "Made by Dar Rime, signed by the house ✓", the photo with ✓, the owner (the buyer) and the history.
4. **Phone** (same Wi-Fi as the laptop): scan the QR code in the terminal with the camera. The same page opens.
5. Open the printed `Fake:` link. It shows the red "Can't verify this piece".

If the phone can't reach the laptop (guest Wi-Fi often blocks it), show steps 3 and 5 on the laptop, or set `DEMO_BASE_URL` to the https preview address once it is deployed.

Paying from the website itself: open `/checkout/usdc/<piece id>` (the house dashboard has a "Sale link" per piece), connect Phantom set to devnet, and approve. Paying by scanning the QR code on a phone needs the https preview address, because wallets refuse http links.

## Pilot preview for a house (private, preview only)

A private page that shows one house how working with MENA ROYAL looks: its bottles listed, a client buying one (devnet test money), the split, the certificate card (flip, print-ready A6 PDF with a gold-foil layer), the scan and the house dashboard.

- Address: `/pilot/<house-slug>?key=<PILOT_PREVIEW_KEY>`
- Works only when `PILOT_PREVIEW=true`, the site is **not** production, and the key is right. Otherwise it is a normal 404.
- Production builds leave out the pilot route and the `public/pilots/` photos. The page is `noindex` and is not in any menu or sitemap.
- The pilot keeps its own small database (`.demo/pilot-store.json` on the laptop), separate from the live one.

On the laptop: `pnpm dev`, then `pnpm pilot:open fragrance-demo`. It opens the page with the key, without printing it.

### Create a pilot for a new house

1. Copy `pilots/fragrance-demo.json` to `pilots/<house-slug>.json` (lowercase and dashes, e.g. `maison-noor`). Set `"slug"` to the same name.
2. Fill in the house (name, country, founding year, 2 short lines of story, maker), the brand colours, and 3 to 5 products: name, price in GBP and USD, image file name, notes, size, batch and the date it was made.
3. Put the photos in `public/pilots/<house-slug>/` with the same file names. A missing photo shows a placeholder card with the product name.
4. Run `pnpm test` to check the file (a bad price or file name is reported in plain words), then `pnpm pilot:open <house-slug>`.

The first visit makes the house a founding house from that day: 100% to the house and 0% to MENA ROYAL for 3 months, then 20%. These terms are read from the pilot database, not from the page.
