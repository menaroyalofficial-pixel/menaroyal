import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * "Pay with USDC" on a product page. Shown only when:
 *  - the product has a piece registered on Solana (with its certificate), and
 *  - USDC payments are allowed in the visitor's country (see shared/cryptoCountries.ts).
 * The server checks both again when the order is created.
 */
const UsdcBuyButton = ({ productId }: { productId: string }) => {
  const [pieceId, setPieceId] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase
      .from("pieces")
      .select("id")
      .eq("product_id", productId)
      .eq("status", "registered")
      .limit(1)
      .then(({ data }) => alive && setPieceId(data?.[0]?.id ?? null));
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : { cryptoAllowed: false }))
      .then((g) => alive && setAllowed(Boolean(g.cryptoAllowed)))
      .catch(() => alive && setAllowed(false));
    return () => {
      alive = false;
    };
  }, [productId]);

  if (!pieceId) return null;

  return (
    <div className="space-y-3">
      {allowed ? (
        <Link
          to={`/checkout/usdc/${pieceId}`}
          className="block w-full text-center bg-white border border-black text-black font-sans text-[10px] editorial-spacing py-5 uppercase hover:bg-black hover:text-white transition-colors"
        >
          Pay with USDC
        </Link>
      ) : null}
      <p className="font-sans text-[9px] text-muted-foreground uppercase editorial-spacing flex items-center justify-center gap-2">
        <BadgeCheck className="w-3 h-3" /> Certificate of authenticity on Solana, signed by the house
      </p>
    </div>
  );
};

export default UsdcBuyButton;
