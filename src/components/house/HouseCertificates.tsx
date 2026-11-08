import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import QRCode from "qrcode";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { usdcText, usdText } from "@/lib/solana";
import SolanaProvider from "@/components/solana/SolanaProvider";

interface Overview {
  house: { name: string; wallet: string | null; walletVerified: boolean; commissionBps: number; foundingUntil: string | null };
  pieces: { id: string; serial: string; name: string; priceUsd: string; status: string; photo: string | null; assetExplorerUrl: string | null }[];
  orders: { id: string; status: string; amountUsd: string; houseShare: string; platformShare: string; createdAt: string; payoutExplorerUrl: string | null }[];
}

const label = "font-sans text-[10px] editorial-spacing text-muted-foreground uppercase";
const input = "w-full bg-transparent border-b border-border py-2 outline-none focus:border-foreground font-sans text-sm";

async function houseApi<T>(body: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch("/api/house", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong.");
  return json as T;
}

const emptyPiece = { name: "", maker: "", country: "", materials: "", madeOn: "", priceUsd: "", photoUrl: "" };

const HouseCertificates = ({ brandId }: { brandId: string }) => {
  const { connection } = useConnection();
  const { publicKey, signMessage, signTransaction } = useWallet();
  const [data, setData] = useState<Overview | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [piece, setPiece] = useState(emptyPiece);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const load = useCallback(() => {
    houseApi<Overview>({ action: "overview" }).then(setData).catch((e) => toast.error(e.message));
  }, []);
  useEffect(load, [load]);

  const verifyWallet = async () => {
    if (!publicKey || !signMessage) return toast.error("Connect a wallet that can sign messages.");
    setBusy("wallet");
    try {
      const wallet = publicKey.toBase58();
      const { message } = await houseApi<{ message: string }>({ action: "wallet-challenge", wallet });
      const sig = await signMessage(new TextEncoder().encode(message));
      await houseApi({ action: "wallet-verify", wallet, message, signature: bs58.encode(sig) });
      toast.success("Wallet verified. Your house can now be paid in USDC.");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile) return piece.photoUrl.trim();
    const ext = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${brandId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("piece-photos").upload(path, photoFile, { contentType: photoFile.type });
    if (error) throw new Error(`Photo upload failed: ${error.message}`);
    return supabase.storage.from("piece-photos").getPublicUrl(path).data.publicUrl;
  };

  // One click: prepare on the server, the house wallet signs, then we confirm on chain.
  const registerPiece = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signTransaction) return toast.error("Connect the house wallet first.");
    if (data?.house.wallet !== publicKey.toBase58()) return toast.error("Connect the verified house wallet to sign.");
    setBusy("piece");
    try {
      const photoUrl = await uploadPhoto();
      const out = await houseApi<{ pieceId: string; serial: string; transaction: string }>({
        action: "register-piece",
        piece: {
          name: piece.name,
          maker: piece.maker,
          country: piece.country,
          materials: piece.materials.split(",").map((m) => m.trim()).filter(Boolean),
          madeOn: piece.madeOn,
          priceUsd: piece.priceUsd,
          photoUrls: [photoUrl],
        },
      });
      const tx = VersionedTransaction.deserialize(Buffer.from(out.transaction, "base64"));
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");
      await houseApi({ action: "confirm-piece", pieceId: out.pieceId });
      toast.success(`Registered and signed. Serial ${out.serial}`);
      setPiece(emptyPiece);
      setPhotoFile(null);
      load();
    } catch (err: any) {
      toast.error(err?.message?.includes("rejected") ? "Signature cancelled in the wallet." : err.message);
    } finally {
      setBusy(null);
    }
  };

  const downloadLabel = async (serial: string) => {
    const url = await QRCode.toDataURL(`${window.location.origin}/verify/${serial}`, { margin: 2, width: 600 });
    const a = document.createElement("a");
    a.href = url;
    a.download = `${serial}-label-qr.png`;
    a.click();
  };

  if (!data) return <div className="py-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-30" /></div>;

  const walletOk = data.house.walletVerified && data.house.wallet;

  return (
    <div className="space-y-16">
      {/* Wallet and commission */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 sm:p-10 bg-white border border-border space-y-5">
          <p className={label}>House wallet (receives USDC, signs certificates)</p>
          {walletOk ? (
            <p className="font-sans text-sm break-all flex items-start gap-2"><Check className="w-4 h-4 shrink-0 mt-0.5" /> {data.house.wallet}</p>
          ) : (
            <p className="font-sans text-sm text-muted-foreground">No verified wallet yet. Connect Phantom or Solflare and sign a short message to prove it is yours.</p>
          )}
          <div className="flex flex-wrap gap-4 items-center">
            <WalletMultiButton style={{ background: "#000", borderRadius: 0, fontSize: 12, height: 44 }} />
            {publicKey && publicKey.toBase58() !== data.house.wallet && (
              <button onClick={verifyWallet} disabled={busy === "wallet"} className="border border-black px-5 h-11 font-sans text-[10px] uppercase disabled:opacity-50">
                {busy === "wallet" ? "Waiting for signature…" : "Use and verify this wallet"}
              </button>
            )}
          </div>
          <p className="font-sans text-[11px] text-muted-foreground">No crypto wallet? Email-login wallets for houses are coming next. Until then, our team can set one up with you.</p>
        </div>
        <div className="p-6 sm:p-10 bg-white border border-border space-y-4">
          <p className={label}>Commission</p>
          {data.house.foundingUntil ? (
            <p className="font-serif text-3xl font-light">0% <span className="text-base italic">founding house, until {new Date(data.house.foundingUntil).toLocaleDateString("en-GB")}</span></p>
          ) : (
            <p className="font-serif text-3xl font-light">{data.house.commissionBps / 100}%</p>
          )}
          <p className="font-sans text-xs text-muted-foreground">You are paid in the same transaction as the buyer pays. Nobody holds your money.</p>
        </div>
      </section>

      {/* Register a piece */}
      <section className="p-6 sm:p-10 bg-white border border-border">
        <h3 className="font-serif text-2xl font-light mb-2">Register a piece</h3>
        <p className="font-sans text-xs text-muted-foreground mb-8">Creates its certificate of authenticity on Solana. Your wallet signs it, so the certificate says "signed by the house".</p>
        <form onSubmit={registerPiece} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {([
            ["name", "Piece name", "Caftan Layla"],
            ["maker", "Maker / atelier", "Our atelier, Dubai"],
            ["country", "Country made in", "United Arab Emirates"],
            ["materials", "Materials (comma separated)", "Silk, gold thread"],
            ["madeOn", "Date made", "2026-10-20"],
            ["priceUsd", "Price (USD)", "1500"],
          ] as const).map(([key, text, ph]) => (
            <label key={key} className="space-y-1 block">
              <span className={label}>{text}</span>
              <input
                required
                type={key === "madeOn" ? "date" : "text"}
                inputMode={key === "priceUsd" ? "decimal" : undefined}
                value={piece[key]}
                placeholder={ph}
                onChange={(e) => setPiece({ ...piece, [key]: e.target.value })}
                className={input}
              />
            </label>
          ))}
          <label className="space-y-1 block md:col-span-2">
            <span className={label}>Photo</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="block font-sans text-xs mt-2" />
          </label>
          <button
            disabled={busy === "piece" || !walletOk || (!photoFile && !piece.photoUrl)}
            className="md:col-span-2 bg-black text-white font-sans text-[10px] editorial-spacing uppercase py-5 disabled:opacity-40"
          >
            {busy === "piece" ? "Registering… approve in your wallet" : "Register and sign"}
          </button>
        </form>
      </section>

      {/* Pieces */}
      <section>
        <h3 className="font-serif text-2xl font-light mb-6">Certified pieces</h3>
        {data.pieces.length === 0 && <p className="font-sans text-sm text-muted-foreground">No pieces registered yet.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.pieces.map((p) => (
            <div key={p.id} className="border border-border bg-white">
              {p.photo && <img src={p.photo} alt="" className="w-full aspect-[3/4] object-cover" />}
              <div className="p-4 space-y-2 font-sans text-xs">
                <p className="font-serif text-lg">{p.name}</p>
                <p>$ {usdText(p.priceUsd)} · {p.status}</p>
                <p className="text-muted-foreground break-all">{p.serial}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to={`/verify/${p.serial}`} className="underline">Verify page</Link>
                  <button onClick={() => downloadLabel(p.serial)} className="underline">Label QR</button>
                  {p.status === "registered" && <Link to={`/checkout/usdc/${p.id}`} className="underline">Sale link</Link>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Orders and payouts */}
      <section>
        <h3 className="font-serif text-2xl font-light mb-6">Orders and payouts</h3>
        {data.orders.length === 0 && <p className="font-sans text-sm text-muted-foreground">No USDC orders yet.</p>}
        <div className="space-y-3">
          {data.orders.map((o) => (
            <div key={o.id} className="bg-white border border-border p-4 grid grid-cols-2 md:grid-cols-5 gap-3 font-sans text-xs items-center">
              <span>#{o.id.slice(0, 8)}</span>
              <span>{new Date(o.createdAt).toLocaleDateString("en-GB")}</span>
              <span>$ {usdText(o.amountUsd)}</span>
              <span>You: {usdcText(o.houseShare)} USDC · {o.status}</span>
              {o.payoutExplorerUrl ? (
                <a href={o.payoutExplorerUrl} target="_blank" rel="noreferrer" className="underline flex items-center gap-1">Payout <ExternalLink className="w-3 h-3" /></a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const HouseCertificatesWithWallet = (props: { brandId: string }) => (
  <SolanaProvider>
    <HouseCertificates {...props} />
  </SolanaProvider>
);

export default HouseCertificatesWithWallet;
