import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { api, usdcText, usdText } from "@/lib/solana";

interface PublicOrder {
  id: string;
  status: "pending" | "paid" | "failed" | "refunded";
  amountUsd: string;
  houseShare: string;
  platformShare: string;
  explorerUrl: string | null;
  certificateStatus: string;
  certificateExplorerUrl: string | null;
  serial: string | null;
  pieceName: string | null;
  failureReason: string | null;
}

const label = "font-sans text-[10px] editorial-spacing text-muted-foreground uppercase";

const OrderConfirmation = () => {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await api<{ order: PublicOrder }>(`/api/orders?id=${encodeURIComponent(id)}`);
        if (stop) return;
        setOrder(r.order);
        const done = r.order.status !== "pending" && r.order.certificateStatus !== "pending";
        if (!done) setTimeout(load, 3000);
      } catch (e: any) {
        if (!stop) setError(e.message);
      }
    };
    load();
    return () => {
      stop = true;
    };
  }, [id]);

  return (
    <Layout>
      <div className="min-h-screen pt-40 pb-32 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center space-y-10">
          {error && <p className="font-serif text-2xl italic">{error}</p>}
          {!order && !error && <Loader2 className="w-8 h-8 animate-spin opacity-20 mx-auto" />}

          {order?.status === "pending" && (
            <>
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <h1 className="font-serif text-4xl font-light">Confirming your payment</h1>
              <p className="font-sans text-sm text-muted-foreground">This usually takes a few seconds. You can close this page: we will finish it for you.</p>
            </>
          )}

          {order?.status === "paid" && (
            <>
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className={`${label} mb-4`}>Thank you</p>
                <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tighter">Your piece is yours</h1>
                {order.pieceName && <p className="font-serif text-xl italic mt-4">{order.pieceName}</p>}
              </div>

              <div className="border border-border p-6 text-left space-y-3 font-sans text-sm">
                <div className="flex justify-between"><span>Paid</span><span>$ {usdText(order.amountUsd)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>To the house</span><span>{usdcText(order.houseShare)} USDC</span></div>
                <div className="flex justify-between text-muted-foreground"><span>To MENA ROYAL</span><span>{usdcText(order.platformShare)} USDC</span></div>
                {order.explorerUrl && (
                  <a href={order.explorerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline pt-2 break-all">
                    View the payment on Solana Explorer <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>

              <div className="border border-border p-6 text-left space-y-3 font-sans text-sm">
                <p className={label}>Certificate of authenticity</p>
                {order.certificateStatus === "transferred" && <p>Your certificate is now in your wallet.</p>}
                {order.certificateStatus === "held_in_custody" && <p>We are keeping your certificate safe for you. You can claim it any time with your email.</p>}
                {order.certificateStatus === "pending" && <p className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Moving the certificate to you…</p>}
                {order.certificateStatus === "failed" && <p>We could not move the certificate yet. Our team has been told and will fix it.</p>}
                {order.serial && (
                  <Link to={`/verify/${order.serial}`} className="underline block">Check it: menaroyal.com/verify/{order.serial}</Link>
                )}
                {order.certificateExplorerUrl && (
                  <a href={order.certificateExplorerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
                    Certificate transfer on Solana Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </>
          )}

          {(order?.status === "failed" || order?.status === "refunded") && (
            <>
              <h1 className="font-serif text-4xl font-light">This order is {order.status}</h1>
              <p className="font-sans text-sm text-muted-foreground">Please contact us and quote order {order.id.slice(0, 8)}.</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
