# MENA ROYAL on Solana (devnet)

What this branch adds, how it works, and what comes next. Devnet only.

## 1. Paying in USDC

1. The buyer clicks **Pay with USDC** on a piece.
2. The server creates an order. The price, the house wallet, the treasury wallet and the split are read from the database. Nothing comes from the browser.
3. The buyer pays with Phantom or Solflare on a computer, or scans a **Solana Pay** QR code on the phone. Both ask our server for the transaction (`/api/pay`, a Solana Pay "transaction request").
4. That one transaction contains:
   - the house share in USDC, sent to the house wallet,
   - the MENA ROYAL share in USDC, sent to the treasury (left out when the commission is 0%),
   - a unique `reference` key and a memo `menaroyal:order:<id>`.
5. The server finds the transaction by its reference and checks the amounts, the receivers, the USDC mint and the memo. Only then is the order marked `paid`.
6. A Helius webhook (`/api/webhooks/helius`) does the same check when the buyer closes the page. The confirmation page also checks every 3 seconds as a fallback.

Money maths uses whole numbers only: USD cents, then micro-USDC (6 decimals). The platform share is rounded down and the house gets the rest, so the two parts always add up to the price.

**Commission:** read from the `brands` table: `commission_bps` (2000 = 20%), `founding_house`, `start_date`, `founding_months` (3). A founding house pays 0% until `start_date + 3 months`, then `commission_bps`.

**Where USDC is offered:** `shared/cryptoCountries.ts`. Kuwait and Saudi Arabia are blocked. The buyer's country comes from Vercel's `x-vercel-ip-country` header. Houses based in a blocked country are not paid in crypto (card payouts later). The server checks again when the order is created.

**Cards:** "Pay by card · coming soon". The order record and the confirmation page don't depend on the payment method, so Stripe (through the future UAE entity) can plug in later: create the order, confirm it from a Stripe webhook, then call the same `deliverCertificate`.

## 2. The certificate of authenticity

One **Metaplex Core** asset per piece, inside one **collection per house**.

| Who | Role |
|---|---|
| The house wallet | Verified creator. It signs when the piece is registered. |
| MENA ROYAL | Update authority of the collection. It can add history later. |
| MENA ROYAL | Holds a one-time transfer permission, used to hand the certificate to the buyer once paid. The permission ends at the first transfer. |

**Why MENA ROYAL alone can't fake one:** the "verified creator" mark can only be set by the house's own wallet. The registration is one transaction signed by both MENA ROYAL and the house. Without the house's signature, the transaction is invalid.

**What is on the chain (cannot be edited, plugin authority = None):** serial, house, house wallet, date made, and `facts_sha256`, a hash of all the details and of every photo.

**What is in the metadata:** piece name, house, maker, country, materials, date made, serial, photos and the SHA-256 of each photo. Nothing about the buyer. Stored inline by default (`CERT_STORAGE=inline`), or on Arweave through Irys (`CERT_STORAGE=irys`, paid in devnet SOL). Either way, a swapped photo or an edited detail no longer matches the hash on the chain.

**Address from the serial:** each certificate's address is derived from its serial and a server secret (`CERT_SEED_SECRET`). So `/verify/<serial>` can find it on the chain without a database, and a made-up serial points to an empty address.

### /verify/<serial>

Public, no login. It reads the asset straight from the chain (through the Helius RPC when `HELIUS_API_KEY` is set) and checks, in order:

1. the serial exists on the chain,
2. the collection was issued by MENA ROYAL's authority,
3. the details on the chain can't be edited and match the serial,
4. the house wallet in the collection signed the certificate (verified creator),
5. the details and every photo still match their hashes.

All pass: "Made by [House], signed by the house ✓", registration date, current owner and ownership history (Helius `getSignaturesForAsset`, plain RPC otherwise). Anything fails: a red "Can't verify this piece" with the reason.

## 3. Buyers without a wallet: decision

**Chosen for Demo Day: no embedded wallet yet.** USDC buyers already pay from a wallet, so the certificate goes to that wallet. For buyers without a wallet (card payments, later), the code already sends the certificate to a **MENA ROYAL custody wallet** (`MENAROYAL_CUSTODY_WALLET`). The buyer can claim it later with their email.

Why: an embedded wallet (Privy) needs an account, app keys, a login flow and testing on phones. That is too much risk four days before Demo Day, and it isn't needed for the demo flow. Next step after Demo Day: add Privy email login for buyers and houses, then let custody certificates be claimed into the new wallet with one click.

## 4. Linking the real piece to its certificate

**Demo Day:** a QR code on the label opens `menaroyal.com/verify/<serial>`. Houses download it from the dashboard ("Label QR").

**Production plan (not built): NFC, NTAG 424 DNA with SUN messages**
- A small NFC tag is sewn into the piece (lining, label or care tag).
- Each tap produces a new URL with an encrypted counter and a signature (AES-128 CMAC), made by a key inside the chip that can't be read out. A copied URL stops working after the next tap, and the tag can't be cloned, unlike a QR.
- URL format: `menaroyal.com/verify/<serial>?picc=<encrypted>&cmac=<sig>`.
- The server keeps one key per tag (in a key store, never in the database in clear), decrypts the counter, checks that the CMAC is right and that the counter went up, then shows the same certificate page plus "Physical tag ✓".
- At registration, the house taps the tag with a phone. The tag UID goes into the certificate's on-chain details, so tag and certificate are bound together.
- Cost: about $1 per tag. Suppliers ship pre-programmed tags with keys exported to us.

## 5. Resale (plan, not built)

- The certificate moves with the piece: the seller lists it, the buyer pays through the same split transaction (seller + MENA ROYAL resale fee, e.g. 5%, + optionally a royalty to the original house).
- Core supports this natively: add a `Royalties` plugin on the house collection (fee to the house, enforced on Core transfers through marketplaces that honour it), and run our own resale checkout that transfers the certificate only after the payment is checked, as today.
- The ownership history on `/verify` then shows each resale. Repairs or re-authentication can be added as history entries by MENA ROYAL (update authority) without touching the house-signed facts.

## 6. House dashboard

`/designer` → **Certificates & payouts**
- Connect Phantom or Solflare and sign a short message to prove the wallet belongs to the house (the challenge is server-signed and expires after 10 minutes).
- Register a piece: photo, details, price → **Register and sign**. One wallet approval. MENA ROYAL pays the network fee.
- Pieces with their serial, verify link, label QR and sale link.
- Orders and payouts with Solana Explorer links.

Email-login wallets for houses (Privy) are the same next step as for buyers.

## 7. Security

- Row Level Security on every table (the migration also turns it on for any table that missed it). Houses see only their own pieces and orders. Buyers see only their own orders. Orders and pieces are written by the server only (service role).
- Fixed in the migration: the waitlist policy let anyone read every email, and the profiles admin policy queried itself (an infinite recursion error).
- Secrets live in env vars and Vercel only. `.demo/` and `.env.local` are git-ignored.
- In production, photos for certificates can only come from our storage or site (no fetching of arbitrary addresses).
- Rate limits on checkout, verify and house endpoints (in memory per server; move to Vercel KV / Upstash for real traffic).
- A wrong transaction sent with an order's reference can't block or close the order. Every transaction with that reference is checked.

## 8. Setup checklist

1. Run `supabase/migrations/20261108000000_solana_v1.sql` in the Supabase SQL editor.
2. In Vercel, set the variables listed in `.env.example` (real values only there).
3. Helius dashboard → Webhooks → new webhook on devnet, type "enhanced" or "raw", watching the treasury wallet and the house wallets, URL `https://<site>/api/webhooks/helius`, auth header = `HELIUS_WEBHOOK_SECRET`.
4. `PUBLIC_SITE_URL` must be the https address of the site (Solana Pay wallets require https).
