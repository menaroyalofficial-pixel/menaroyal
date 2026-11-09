import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import Layout from "@/components/layout/Layout";

export interface VerifyResponse {
  ok: boolean;
  serial: string;
  reasons: string[];
  piece: null | { name: string; maker: string; country: string; materials: string[]; madeOn: string; batch?: string | null };
  house: null | { name: string; wallet: string; signed: boolean };
  registeredAt: string | null;
  owner: null | { address: string; short: string; label: string };
  history: { signature: string; time: string | null; label: string; explorerUrl: string }[];
  photos: { uri: string; ok: boolean }[];
  assetExplorerUrl: string | null;
}

const label = "font-sans text-[10px] editorial-spacing text-muted-foreground uppercase";

function niceDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export const VerifyResult = ({ data }: { data: VerifyResponse }) => {
  if (!data.ok) {
    return (
      <div className="border-2 border-red-600 p-8 space-y-4 text-left" role="alert">
        <div className="flex items-center gap-3 text-red-600">
          <X className="w-6 h-6 shrink-0" />
          <h2 className="font-serif text-3xl font-light">Can't verify this piece</h2>
        </div>
        <p className="font-sans text-sm">Serial: {data.serial || "—"}</p>
        <ul className="font-sans text-sm list-disc pl-5 space-y-1">
          {data.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="font-sans text-xs text-muted-foreground">If you bought this piece as authentic, contact MENA ROYAL before going further.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left">
      <div className="border-2 border-black p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light">
            Made by {data.house!.name}, signed by the house ✓
          </h2>
        </div>
        <p className="font-sans text-sm">Registered on {niceDate(data.registeredAt)}</p>
        <p className="font-sans text-sm">Current owner: {data.owner!.label}</p>
        <p className="font-sans text-xs text-muted-foreground">Serial {data.serial}</p>
      </div>

      {data.piece && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-sm">
          <div><p className={label}>Piece</p><p className="mt-1">{data.piece.name}</p></div>
          <div><p className={label}>Made by</p><p className="mt-1">{data.piece.maker}</p></div>
          <div><p className={label}>Country</p><p className="mt-1">{data.piece.country}</p></div>
          <div><p className={label}>Made on</p><p className="mt-1">{niceDate(data.piece.madeOn)}</p></div>
          {data.piece.batch && <div><p className={label}>Batch</p><p className="mt-1">{data.piece.batch}</p></div>}
          <div className="sm:col-span-2"><p className={label}>Made with</p><p className="mt-1">{data.piece.materials.join(", ") || "—"}</p></div>
        </div>
      )}

      {data.photos.length > 0 && (
        <div>
          <p className={`${label} mb-4`}>Photos (checked against the originals)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {data.photos.map((p) => (
              <figure key={p.uri} className="relative border border-border">
                <img src={p.uri} alt="" className="w-full aspect-[3/4] object-cover" />
                <figcaption className="absolute bottom-2 right-2 bg-white px-2 py-1 font-sans text-[10px] uppercase">
                  {p.ok ? "Original ✓" : "Does not match ✗"}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className={`${label} mb-4`}>Ownership history</p>
        <ol className="space-y-3 font-sans text-sm">
          {[...data.history].reverse().map((h) => (
            <li key={h.signature} className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-border pb-3">
              <span>{h.label}</span>
              <a href={h.explorerUrl} target="_blank" rel="noreferrer" className="text-muted-foreground underline flex items-center gap-1">
                {niceDate(h.time)} <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          ))}
        </ol>
      </div>

      {data.assetExplorerUrl && (
        <a href={data.assetExplorerUrl} target="_blank" rel="noreferrer" className="font-sans text-xs underline flex items-center gap-1">
          See the certificate on Solana Explorer <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

const Verify = () => {
  const { serial = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!serial) return;
    setData(null);
    setError(null);
    fetch(`/api/verify?serial=${encodeURIComponent(serial)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (!r.ok || !body) throw new Error(body?.error || "The check could not run. Please try again.");
        setData(body);
      })
      .catch((e) => setError(e.message));
  }, [serial]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) navigate(`/verify/${encodeURIComponent(input.trim().toUpperCase())}`);
  };

  return (
    <Layout>
      <div className="min-h-screen pt-36 pb-32 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center">
            <p className={`${label} mb-4`}>Certificate of authenticity</p>
            <h1 className="font-serif text-4xl lg:text-6xl font-light tracking-tighter">Verify a piece</h1>
            <p className="font-sans text-xs text-muted-foreground mt-4">Checked live on the Solana blockchain. No login needed.</p>
          </div>

          {!serial && (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="MR-XXXX-XXXXXXXX"
                aria-label="Serial number"
                className="flex-1 border border-border py-4 px-4 font-sans text-sm outline-none focus:border-foreground"
              />
              <button className="bg-black text-white font-sans text-[10px] editorial-spacing uppercase px-8 py-4">Verify</button>
            </form>
          )}

          {serial && !data && !error && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-40" />
              <p className="font-sans text-xs text-muted-foreground">Reading the certificate from the chain…</p>
            </div>
          )}
          {error && <p className="font-sans text-sm text-center">{error}</p>}
          {data && <VerifyResult data={data} />}

          {serial && (
            <p className="text-center">
              <Link to="/verify" className="font-sans text-[10px] editorial-spacing uppercase border-b border-foreground/30 pb-1">Check another serial</Link>
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Verify;
