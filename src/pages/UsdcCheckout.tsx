import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction } from "@solana/web3.js";
import QRCode from "qrcode";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import SolanaProvider from "@/components/solana/SolanaProvider";
import { api, usdcText, usdText } from "@/lib/solana";

interface PieceInfo {
  piece: { id: string; serial: string; name: string; maker: string; priceUsd: string; photo: string | null; available: boolean };
  house: { name: string; acceptsUsdc: boolean };
  split: { houseShare: string; platformShare: string; platformBps: number };
  buyer: { country: string | null; cryptoAllowed: boolean };
}

interface OrderInfo {
  order: { id: string; status: string };
  solanaPayUrl: string;
}

const label = "font-sans text-[10px] editorial-spacing text-muted-foreground uppercase";

const CheckoutInner = () => {
  const { pieceId = "" } = useParams();
  const navigate = useNavigate();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [info, setInfo] = useState<PieceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<PieceInfo>(`/api/orders?piece=${encodeURIComponent(pieceId)}`)
      .then(setInfo)
      .catch((e) => setError(e.message));
  }, [pieceId]);

  // While an order is open, check every 3 seconds (QR payments happen on the phone).
  useEffect(() => {
    if (!order) return;
    QRCode.toDataURL(order.solanaPayUrl, { margin: 1, width: 280 }).then(setQr);
    const timer = setInterval(async () => {
      try {
        const r = await api<{ order: { status: string } }>(`/api/orders?id=${order.order.id}`);
        if (r.order.status === "paid") navigate(`/order/${order.order.id}`);
      } catch {
        /* keep waiting */
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [order, navigate]);

  const startOrder = async () => {
    setBusy(true);
    try {
      const o = await api<OrderInfo>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ pieceId, email: email || undefined }),
      });
      setOrder(o);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const payWithWallet = async () => {
    if (!order || !publicKey) return;
    setBusy(true);
    try {
      const { transaction } = await api<{ transaction: string }>(`/api/pay?order=${order.order.id}`, {
        method: "POST",
        body: JSON.stringify({ account: publicKey.toBase58() }),
      });
      const tx = Transaction.from(Buffer.from(transaction, "base64"));
      await sendTransaction(tx, connection);
      toast.success("Payment sent. Confirming on Solana…");
      navigate(`/order/${order.order.id}`);
    } catch (e: any) {
      toast.error(e?.message?.includes("rejected") ? "Payment cancelled in the wallet." : e.message || "Payment failed.");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="pt-48 pb-40 text-center px-6">
        <h1 className="font-serif text-3xl italic mb-8">{error}</h1>
        <Link to="/shop" className="font-sans text-[10px] editorial-spacing border-b border-foreground/30 pb-1 uppercase">Back to the collection</Link>
      </div>
    );
  }
  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    );
  }

  const canPayUsdc = info.piece.available && info.house.acceptsUsdc && info.buyer.cryptoAllowed;

  return (
    <div className="bg-background min-h-screen pt-32 pb-32">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] bg-secondary/10 overflow-hidden border border-border">
            {info.piece.photo && <img src={info.piece.photo} alt={info.piece.name} className="w-full h-full object-cover" />}
          </div>
          <p className={`${label} mt-6`}>Serial {info.piece.serial}</p>
        </div>

        <div className="lg:col-span-7 space-y-10">
          <div>
            <p className={`${label} mb-4`}>{info.house.name}</p>
            <h1 className="font-serif text-4xl lg:text-6xl font-light tracking-tighter break-words">{info.piece.name}</h1>
            <p className="font-sans text-2xl font-light text-foreground/60 mt-6">$ {usdText(info.piece.priceUsd)}</p>
          </div>

          <div className="border border-border p-6 space-y-3">
            <p className={label}>Where your payment goes, in one transaction</p>
            <div className="flex justify-between font-sans text-sm"><span>{info.house.name}</span><span>{usdcText(info.split.houseShare)} USDC</span></div>
            <div className="flex justify-between font-sans text-sm">
              <span>MENA ROYAL ({info.split.platformBps / 100}%)</span><span>{usdcText(info.split.platformShare)} USDC</span>
            </div>
            <p className="font-sans text-[11px] text-muted-foreground flex items-start gap-2 pt-2">
              <ShieldCheck className="w-4 h-4 shrink-0" /> The house is paid at the same moment as you pay. The piece comes with a certificate of authenticity on Solana, signed by the house.
            </p>
          </div>

          {!info.piece.available && <p className="font-sans text-sm">This piece has already been sold.</p>}
          {info.piece.available && !info.buyer.cryptoAllowed && (
            <p className="font-sans text-sm">Payment in USDC is not available in your country. Card payment is coming soon.</p>
          )}
          {info.piece.available && info.buyer.cryptoAllowed && !info.house.acceptsUsdc && (
            <p className="font-sans text-sm">This house is paid by card. Card payment is coming soon.</p>
          )}

          {canPayUsdc && !order && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className={label}>Email for your receipt (optional)</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground font-sans text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <button
                onClick={startOrder}
                disabled={busy}
                className="w-full bg-black text-white font-sans text-[11px] editorial-spacing py-5 uppercase tracking-[0.3em] disabled:opacity-50"
              >
                {busy ? "Preparing…" : "Pay with USDC"}
              </button>
            </div>
          )}

          {order && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border pt-10">
              <div className="space-y-4">
                <p className={label}>On a computer</p>
                <p className="font-sans text-xs text-muted-foreground">Connect Phantom or Solflare (devnet), then approve.</p>
                <WalletMultiButton style={{ background: "#000", borderRadius: 0, fontSize: 12, height: 44 }} />
                {publicKey && (
                  <button
                    onClick={payWithWallet}
                    disabled={busy}
                    className="w-full bg-black text-white font-sans text-[11px] editorial-spacing py-4 uppercase disabled:opacity-50"
                  >
                    {busy ? "Waiting for the wallet…" : `Approve $${usdText(info.piece.priceUsd)}`}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <p className={label}>On your phone</p>
                <p className="font-sans text-xs text-muted-foreground">Scan with Phantom or Solflare. This page updates by itself.</p>
                {qr && <img src={qr} alt="Solana Pay QR code" className="w-48 h-48 border border-border" />}
                <a href={order.solanaPayUrl} className="font-sans text-[10px] underline md:hidden">Open in wallet app</a>
              </div>
            </div>
          )}

          <button disabled className="w-full border border-border font-sans text-[11px] editorial-spacing py-5 uppercase text-muted-foreground cursor-not-allowed">
            Pay by card · coming soon
          </button>
        </div>
      </div>
    </div>
  );
};

const UsdcCheckout = () => (
  <Layout>
    <SolanaProvider>
      <CheckoutInner />
    </SolanaProvider>
  </Layout>
);

export default UsdcCheckout;
