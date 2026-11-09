import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import Layout from "@/components/layout/Layout";
import CertificateCard, { type CertificateView } from "@/components/pilot/CertificateCard";
import NotFound from "./NotFound";
import { VerifyResult, type VerifyResponse } from "./Verify";

/**
 * Private pilot preview for one house (sales calls).
 * Opens only on a preview site with PILOT_PREVIEW=true and the secret key:
 *   /pilot/<house-slug>?key=<PILOT_PREVIEW_KEY>
 * House-facing words stay plain. The technical words live in "How it works".
 */

interface Split {
  total: string;
  house: string;
  platform: string;
}
interface Product {
  id: string;
  name: string;
  notes: string;
  size: string | null;
  batch: string;
  madeOn: string;
  priceGbp: string;
  priceUsd: string;
  image: string | null;
  split: { gbp: Split; usd: Split };
}
interface Overview {
  pilot: {
    slug: string;
    house: { name: string; country: string; founded: string; story: string[] };
    colours: { primary: string; accent: string; background: string };
    certificate: { style: "ivory" | "black" };
    terms: { platformBps: number; commissionBps: number; foundingHouse: boolean; foundingMonths: number; foundingEnds: string | null; inFoundingPeriod: boolean };
    verifyBase: string;
    products: Product[];
  };
  dashboard: {
    orders: { id: string; date: string; product: string; serial: string | null; status: string; priceGbp: string | null; platformBps: number; receiptUrl: string | null }[];
    payouts: { paidOrders: number; houseTotal: string; platformTotal: string };
    certificates: { serial: string; product: string; batch: string | null; issuedAt: string; holder: string }[];
  };
}
interface PilotOrder {
  id: string;
  status: string;
  certificateStatus: string;
  failureReason: string | null;
  platformBps: number;
  split: { gbp: Split } | null;
  receiptUrl: string | null;
  handoverUrl: string | null;
  registrationUrl: string | null;
  certificate: null | { serial: string; product: string; batch: string | null; madeOn: string | null; engraving: string | null; house: string };
}

type Phase = "idle" | "registering" | "paying" | "done" | "error";

const label = "font-sans text-[10px] editorial-spacing text-muted-foreground uppercase";
const serif = { fontFamily: "'Cormorant Garamond', 'Bodoni Moda', Georgia, serif" };

/** "18000" pence -> "£180.00" (integers only, no floats). */
function money(minor: string, symbol: string) {
  const v = BigInt(minor);
  const whole = (v / 100n).toLocaleString("en-GB");
  return `${symbol}${whole}.${(v % 100n).toString().padStart(2, "0")}`;
}
const gbp = (pounds: string) => money(String(Math.round(Number(pounds) * 100)), "£");
const usd = (dollars: string) => money(String(Math.round(Number(dollars) * 100)), "$");
const niceDate = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body?.error || "Something went wrong. Please try again."), { status: res.status });
  return body as T;
}

const Placeholder = ({ name, gold }: { name: string; gold: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-center bg-[#F7F2E8] relative">
    <div className="absolute inset-3" style={{ border: `1px solid ${gold}` }} />
    <p className={label} style={{ color: gold }}>Photo to come</p>
    <p className="mt-4 px-6 text-2xl leading-tight" style={serif}>{name}</p>
  </div>
);

const Step = ({ done, active, children }: { done: boolean; active: boolean; children: React.ReactNode }) => (
  <li className="flex gap-4 items-start">
    <span className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${done ? "bg-black border-black text-white" : "border-border"}`}>
      {done ? <Check className="w-3.5 h-3.5" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
    </span>
    <div className={`font-sans text-sm ${done || active ? "" : "text-muted-foreground"}`}>{children}</div>
  </li>
);

const Pilot = () => {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const key = params.get("key") ?? "";
  const q = `slug=${encodeURIComponent(slug)}&key=${encodeURIComponent(key)}`;

  const [data, setData] = useState<Overview | null>(null);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [engraving, setEngraving] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [order, setOrder] = useState<PilotOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<"ivory" | "black">("ivory");
  const [check, setCheck] = useState<{ kind: "real" | "fake"; data: VerifyResponse | null; loading: boolean; error?: string } | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Never indexed, never followed.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow, noarchive";
    document.head.appendChild(meta);
    const title = document.title;
    return () => {
      meta.remove();
      document.title = title;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const d = await call<Overview>(`/api/pilot?${q}`);
      setData((prev) => {
        if (!prev) setStyle(d.pilot.certificate.style);
        return d;
      });
      document.title = `${d.pilot.house.name} · Founding house pilot`;
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 404) setMissing(true);
      else setLoadError(e.message);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const gold = data?.pilot.colours.accent ?? "#B8975A";
  const house = data?.pilot.house.name ?? "";
  const terms = data?.pilot.terms;
  const ourPct = terms ? terms.platformBps / 100 : 0;

  const certificate: CertificateView | null = useMemo(() => {
    if (!data) return null;
    const c = order?.certificate;
    const p = selected ?? data.pilot.products[0];
    const serial = c?.serial ?? "MR-XXXX-XXXXXXXX";
    return {
      house,
      product: c?.product ?? p.name,
      serial,
      batch: c?.batch ?? p.batch,
      madeOn: niceDate(c?.madeOn ?? p.madeOn),
      engraving: c ? c.engraving : engraving.trim() || null,
      verifyUrl: `${data.pilot.verifyBase}/verify/${serial}`,
    };
  }, [data, order, selected, house, engraving]);

  const bought = phase === "done" && order?.status === "paid" && !!order.certificate;

  const buy = async (p: Product) => {
    setSelected(p);
    setOrder(null);
    setCheck(null);
    setError(null);
    setPhase("registering");
    document.getElementById("purchase")?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const prepared = await call<{ order: PilotOrder }>(`/api/pilot?${q}`, {
        method: "POST",
        body: JSON.stringify({ action: "prepare", productId: p.id, engraving: engraving.trim() || undefined }),
      });
      setOrder(prepared.order);
      setPhase("paying");
      const paid = await call<{ order: PilotOrder }>(`/api/pilot?${q}`, {
        method: "POST",
        body: JSON.stringify({ action: "pay", orderId: prepared.order.id }),
      });
      setOrder(paid.order);
      if (paid.order.status !== "paid") throw new Error(paid.order.failureReason ?? "The payment is still being confirmed. Try again in a moment.");
      setPhase("done");
      load();
    } catch (err) {
      const e = err as Error & { status?: number };
      setError(e.message);
      setPhase("error");
    }
  };

  const verify = async (kind: "real" | "fake") => {
    const real = order?.certificate?.serial;
    const serial = kind === "real" && real ? real : real ? `${real.slice(0, -4)}ZZZZ` : "MR-FAKE-00000000";
    setCheck({ kind, data: null, loading: true });
    try {
      setCheck({ kind, data: await call<VerifyResponse>(`/api/verify?serial=${encodeURIComponent(serial)}`), loading: false });
    } catch (err) {
      const e = err as Error & { status?: number };
      setCheck({ kind, data: null, loading: false, error: e.message });
    }
  };

  const downloadPdf = async () => {
    if (!certificate) return;
    setPdfBusy(true);
    try {
      const [{ buildCertificatePdf }, { qrMatrix }, fontUrl] = await Promise.all([
        import("@/lib/certificatePdf"),
        import("@/lib/qrMatrix"),
        import("@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff?url").then((m) => m.default),
      ]);
      const font = new Uint8Array(await (await fetch(fontUrl)).arrayBuffer());
      const bytes = await buildCertificatePdf({ ...certificate, style, qr: qrMatrix(certificate.verifyUrl) }, font);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${certificate.serial}-${style}-A6.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      const e = err as Error & { status?: number };
      setError(e.message);
    } finally {
      setPdfBusy(false);
    }
  };

  if (missing) return <NotFound />;
  if (loadError) {
    return (
      <Layout>
        <div className="min-h-screen pt-48 px-6 text-center font-serif text-2xl italic">{loadError}</div>
      </Layout>
    );
  }
  if (!data || !terms || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    );
  }

  const { pilot, dashboard } = data;
  const split = order?.split?.gbp ?? selected?.split.gbp ?? null;
  const step1 = phase === "paying" || phase === "done" || (phase === "error" && !!order);
  const step2 = phase === "done";

  return (
    <Layout>
      <div className="bg-background pt-32 pb-32">
        {/* 1. Header */}
        <header className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <p className={label}>Founding house pilot · private preview</p>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight break-words" style={{ ...serif, color: pilot.colours.primary }}>
            {pilot.house.name}
          </h1>
          <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {pilot.house.country}
            {pilot.house.founded ? ` · Founded ${pilot.house.founded}` : ""}
          </p>
          <div className="mt-8 max-w-xl mx-auto space-y-1">
            {pilot.house.story.map((line) => (
              <p key={line} className="text-xl italic text-foreground/80" style={serif}>{line}</p>
            ))}
          </div>
        </header>

        {/* 2. Products */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 mt-24">
          <p className={`${label} mb-8`}>The collection, as your clients will see it</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {pilot.products.map((p) => (
              <article key={p.id} className="flex flex-col">
                <div className="aspect-[3/4] overflow-hidden border border-border bg-secondary/10">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Placeholder name={p.name} gold={gold} />}
                </div>
                <h2 className="mt-5 text-2xl" style={serif}>{p.name}</h2>
                <p className="font-sans text-xs text-muted-foreground mt-1">{[p.size, p.notes].filter(Boolean).join(" · ")}</p>
                <p className="font-sans text-sm mt-3">
                  {gbp(p.priceGbp)} <span className="text-muted-foreground">· {usd(p.priceUsd)}</span>
                </p>
                <button
                  onClick={() => buy(p)}
                  disabled={phase === "registering" || phase === "paying"}
                  className="mt-5 w-full bg-black text-white font-sans text-[11px] uppercase tracking-[0.3em] py-4 disabled:opacity-40"
                >
                  Buy
                </button>
              </article>
            ))}
          </div>
          <div className="mt-10 max-w-sm">
            <label htmlFor="engraving" className={label}>Personalised bottle (optional engraving)</label>
            <input
              id="engraving"
              value={engraving}
              maxLength={24}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder="e.g. R.K."
              className="mt-2 w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground font-sans text-sm"
            />
            <p className="font-sans text-[11px] text-muted-foreground mt-2">
              Kept private by MENA ROYAL. The public certificate only holds a sealed fingerprint of it, never the client's name or details.
            </p>
          </div>
        </section>

        {/* 3. Purchase */}
        <section id="purchase" className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 mt-24 scroll-mt-28">
          <p className={`${label} mb-6`}>A client buys a bottle</p>
          <div className="border border-border p-6 sm:p-10">
            {!selected && <p className="font-sans text-sm text-muted-foreground">Press "Buy" on any bottle above. It takes about 15 seconds.</p>}
            {selected && (
              <>
                <h3 className="text-3xl" style={serif}>{selected.name}</h3>
                {split && (
                  <p className="font-sans text-base mt-4">
                    <strong>{money(split.house, "£")}</strong> to {house}, <strong>{money(split.platform, "£")}</strong> to MENA ROYAL, paid at the same moment.
                  </p>
                )}
                {terms.inFoundingPeriod && terms.foundingEnds && (
                  <p className="font-sans text-xs text-muted-foreground mt-2">
                    Founding period: 100% to {house} and 0% to MENA ROYAL until {niceDate(terms.foundingEnds)}. Then {terms.commissionBps / 100}%.
                  </p>
                )}
                {!terms.inFoundingPeriod && <p className="font-sans text-xs text-muted-foreground mt-2">MENA ROYAL commission: {ourPct}%.</p>}

                <ol className="mt-8 space-y-5">
                  <Step done={step1} active={phase === "registering"}>
                    {house} registers this bottle and signs its digital certificate.
                    {order?.registrationUrl && step1 && (
                      <a href={order.registrationUrl} target="_blank" rel="noreferrer" className="ml-2 underline text-muted-foreground text-xs inline-flex items-center gap-1">
                        record <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </Step>
                  <Step done={step2} active={phase === "paying"}>
                    Secure payment of {gbp(selected.priceGbp)} by the client.
                  </Step>
                  <Step done={step2} active={phase === "paying"}>
                    Paid instantly: {split ? `${money(split.house, "£")} to ${house}, ${money(split.platform, "£")} to MENA ROYAL` : ""}.
                    {order?.receiptUrl && (
                      <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="ml-2 underline text-muted-foreground text-xs inline-flex items-center gap-1">
                        payment receipt <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </Step>
                  <Step done={step2 && order?.certificateStatus === "transferred"} active={phase === "paying"}>
                    The certificate is handed to the client, for life.
                    {order?.handoverUrl && (
                      <a href={order.handoverUrl} target="_blank" rel="noreferrer" className="ml-2 underline text-muted-foreground text-xs inline-flex items-center gap-1">
                        record <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </Step>
                </ol>
                {error && <p className="font-sans text-sm text-red-700 mt-6" role="alert">{error}</p>}
              </>
            )}
          </div>
        </section>

        {/* 4. Certificate */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 mt-24">
          <p className={`${label} mb-8`}>The certificate your client keeps for life</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <CertificateCard data={certificate} style={style} gold={gold} sample={!bought} />
            <div className="space-y-6">
              <p className="font-sans text-sm leading-relaxed">
                Every bottle comes with this card in the box, like a fine watch or a piece of jewellery. The same certificate lives online: scanning the card at any time, even years from now, shows that the bottle is genuine and signed by {house}.
              </p>
              <div className="flex gap-2">
                {(["ivory", "black"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`font-sans text-[10px] uppercase tracking-[0.25em] px-5 py-3 border ${style === s ? "border-black bg-black text-white" : "border-border"}`}
                  >
                    {s === "ivory" ? "Ivory" : "Deep black"}
                  </button>
                ))}
              </div>
              <button
                onClick={downloadPdf}
                disabled={pdfBusy}
                className="w-full bg-black text-white font-sans text-[11px] uppercase tracking-[0.3em] py-4 disabled:opacity-50"
              >
                {pdfBusy ? "Preparing the print file…" : "Download to print (A6)"}
              </button>
              <p className="font-sans text-[11px] text-muted-foreground">
                Print-ready A6 card with crop marks and bleed. The gold is on its own layer for gold-foil printing, plus separate foil plates for the printer.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button disabled className="border border-border font-sans text-[10px] uppercase tracking-[0.2em] py-3 text-muted-foreground cursor-not-allowed">
                  Add to Apple Wallet · soon
                </button>
                <button disabled className="border border-border font-sans text-[10px] uppercase tracking-[0.2em] py-3 text-muted-foreground cursor-not-allowed">
                  Add to Google Wallet · soon
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Scan to verify */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 mt-24">
          <p className={`${label} mb-6`}>Scan to verify</p>
          <div className="border border-border p-6 sm:p-10 space-y-6">
            <p className="font-sans text-sm">
              {bought
                ? "Scan the QR on the card with any phone camera, or press the button. Anyone can check, no account needed."
                : "Buy a bottle first: its certificate can then be scanned and checked by anyone."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => verify("real")}
                disabled={!bought}
                className="bg-black text-white font-sans text-[11px] uppercase tracking-[0.25em] px-8 py-4 disabled:opacity-30"
              >
                Check this bottle
              </button>
              <button onClick={() => verify("fake")} className="border border-black font-sans text-[11px] uppercase tracking-[0.25em] px-8 py-4">
                Try a fake bottle
              </button>
              {bought && (
                <a href={certificate.verifyUrl} target="_blank" rel="noreferrer" className="font-sans text-xs underline self-center inline-flex items-center gap-1">
                  Open the scan page <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {check?.loading && (
              <p className="font-sans text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking…
              </p>
            )}
            {check?.error && <p className="font-sans text-sm">{check.error}</p>}
            {check?.data && <VerifyResult data={check.data} />}
          </div>
        </section>

        {/* 6. What you get */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 mt-24">
          <div className="bg-black text-white p-8 sm:p-12">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/60">What you get as a founding house</p>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-sm">
              <li>
                <span className="text-3xl block mb-1" style={serif}>0% commission</span>
                for your first {terms.foundingMonths} months, then {terms.commissionBps / 100}%.
              </li>
              <li>
                <span className="text-3xl block mb-1" style={serif}>A certificate on every bottle</span>
                signed by your house, kept by your client for life.
              </li>
              <li>
                <span className="text-3xl block mb-1" style={serif}>Protection against fakes</span>
                anyone can scan a bottle and see at once if it is genuine.
              </li>
              <li>
                <span className="text-3xl block mb-1" style={serif}>An editorial feature</span>
                your story told on MENA ROYAL. We handle the listings with your existing photos.
              </li>
            </ul>
            <p className="font-sans text-xs text-white/60 mt-8">You are paid instantly on every sale, at the same moment the client pays.</p>
          </div>
        </section>

        {/* 7. House dashboard */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 mt-24">
          <p className={`${label} mb-6`}>Your dashboard</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-border p-6">
              <p className={label}>Orders</p>
              <p className="text-4xl mt-2" style={serif}>{dashboard.orders.length}</p>
            </div>
            <div className="border border-border p-6">
              <p className={label}>Paid to you</p>
              <p className="text-4xl mt-2" style={serif}>{money(String(BigInt(dashboard.payouts.houseTotal) / 10_000n), "$")}</p>
            </div>
            <div className="border border-border p-6">
              <p className={label}>Certificates issued</p>
              <p className="text-4xl mt-2" style={serif}>{dashboard.certificates.length}</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full font-sans text-sm min-w-[560px]">
              <thead>
                <tr className="text-left border-b border-border">
                  {["Date", "Bottle", "Price", "Your payout", "Receipt"].map((h) => (
                    <th key={h} className={`${label} py-3 font-normal`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboard.orders.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-muted-foreground">No orders yet.</td></tr>
                )}
                {dashboard.orders.map((o) => {
                  const pence = o.priceGbp ? BigInt(Math.round(Number(o.priceGbp) * 100)) : null;
                  const payout = pence !== null ? pence - (pence * BigInt(o.platformBps)) / 10_000n : null;
                  return (
                    <tr key={o.id} className="border-b border-border">
                      <td className="py-3">{niceDate(o.date)}</td>
                      <td className="py-3">{o.product}<span className="block text-[11px] text-muted-foreground">{o.serial}</span></td>
                      <td className="py-3">{o.priceGbp ? gbp(o.priceGbp) : "—"}</td>
                      <td className="py-3">{o.status === "paid" && payout !== null ? money(payout.toString(), "£") : o.status === "paid" ? "Paid" : "Waiting"}</td>
                      <td className="py-3">
                        {o.receiptUrl ? (
                          <a href={o.receiptUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">View <ExternalLink className="w-3 h-3" /></a>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {dashboard.certificates.length > 0 && (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full font-sans text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left border-b border-border">
                    {["Certificate", "Bottle", "Batch", "Held by", "Check"].map((h) => (
                      <th key={h} className={`${label} py-3 font-normal`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboard.certificates.map((c) => (
                    <tr key={c.serial} className="border-b border-border">
                      <td className="py-3 whitespace-nowrap">{c.serial}</td>
                      <td className="py-3">{c.product}</td>
                      <td className="py-3">{c.batch ?? "—"}</td>
                      <td className="py-3">{c.holder}</td>
                      <td className="py-3">
                        <a href={`/verify/${c.serial}`} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">Scan page <ExternalLink className="w-3 h-3" /></a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* How it works (technical words live here only) */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 mt-24">
          <details className="border-t border-border pt-6 group">
            <summary className={`${label} cursor-pointer list-none flex justify-between`}>
              How it works <span className="group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Certificate.</strong> Each bottle is a Metaplex Core asset on the Solana blockchain (devnet in this pilot), inside a collection for {house}. The house wallet signs it as verified creator; MENA ROYAL is the update authority. The details (serial, batch, date, photo SHA-256 hashes) are hashed and stored in an attribute nobody can edit.
              </p>
              <p>
                <strong className="text-foreground">Payment.</strong> The client pays in USDC (devnet test money here). One Solana transaction carries both transfers to the house and to MENA ROYAL, with a reference key and a memo. Our server checks the amounts, receivers, token and memo before marking the order paid, then moves the certificate to the client's wallet.
              </p>
              <p>
                <strong className="text-foreground">Commission.</strong> Read from the house record in our database: founding houses pay 0% for {terms.foundingMonths} months from their start date, then {terms.commissionBps / 100}%. Today: {ourPct}%.
              </p>
              <p>
                <strong className="text-foreground">Privacy.</strong> No client name or personal data goes on-chain. An engraving is stored privately; only a salted SHA-256 hash of it is written into the certificate. Not an NFT marketplace: certificates are not listed for sale.
              </p>
            </div>
          </details>
        </section>
      </div>
    </Layout>
  );
};

export default Pilot;
