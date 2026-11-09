import { useMemo, useState } from "react";
import { qrMatrix, qrPath } from "@/lib/qrMatrix";

export interface CertificateView {
  house: string;
  product: string;
  serial: string;
  batch: string | null;
  madeOn: string | null;
  engraving: string | null;
  verifyUrl: string;
}

const serif = { fontFamily: "'Cormorant Garamond', 'Bodoni Moda', Georgia, serif" };

function Qr({ text, colour, background, className }: { text: string; colour: string; background?: string; className?: string }) {
  const matrix = useMemo(() => qrMatrix(text), [text]);
  const n = matrix.length;
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className={className} role="img" aria-label="QR code to verify this piece" shapeRendering="crispEdges">
      {background && <rect x={-2} y={-2} width={n + 4} height={n + 4} fill={background} />}
      <path d={qrPath(matrix)} fill={colour} />
    </svg>
  );
}

/**
 * The certificate as a keepsake: ivory or deep black card, thin gold border.
 * Click (or press Enter) to turn it over: the back has the QR to scan.
 */
const CertificateCard = ({
  data,
  style,
  gold = "#B8975A",
  sample = false,
}: {
  data: CertificateView;
  style: "ivory" | "black";
  gold?: string;
  sample?: boolean;
}) => {
  const [flipped, setFlipped] = useState(false);
  const paper = style === "black" ? "#0B0B0B" : "#F7F2E8";
  const ink = style === "black" ? "#F3EDE1" : "#141414";
  const muted = style === "black" ? "rgba(243,237,225,0.55)" : "rgba(20,20,20,0.5)";

  const face = "absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] overflow-hidden";
  const border = (
    <>
      <div className="absolute inset-[5.7%] pointer-events-none" style={{ border: `1px solid ${gold}` }} />
      <div className="absolute inset-[7.2%] pointer-events-none" style={{ border: `0.5px solid ${gold}` }} />
    </>
  );
  const rows: [string, string | null][] = [
    ["Serial", data.serial],
    ["Batch", data.batch],
    ["Made on", data.madeOn],
    ["Engraving", data.engraving],
  ];

  return (
    <div className="w-full max-w-[340px] mx-auto">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show the front of the certificate" : "Turn the certificate over"}
        className="block w-full [perspective:1400px] focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
      >
        <div
          className="relative w-full transition-transform duration-700 [transform-style:preserve-3d] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
          style={{ aspectRatio: "105 / 148", transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          {/* Front */}
          <div className={face} style={{ background: paper, color: ink }}>
            {border}
            <div className="absolute inset-[9%] flex flex-col items-center text-center">
              <p className="mt-[6%] font-sans uppercase" style={{ color: gold, fontSize: "clamp(6px, 1.9vw, 8px)", letterSpacing: "0.32em" }}>
                Certificate of Authenticity
              </p>
              <div className="w-[18%] h-px mt-[3%]" style={{ background: gold }} />
              <h3 className="mt-[12%] leading-[1.05] break-words max-w-full" style={{ ...serif, fontSize: "clamp(24px, 8.4vw, 34px)", fontWeight: 500 }}>
                {data.house}
              </h3>
              <p className="mt-[6%] italic" style={{ ...serif, fontSize: "clamp(15px, 4.8vw, 19px)" }}>{data.product}</p>
              <div className="w-[40%] h-px mt-[6%]" style={{ background: gold }} />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-[9%] w-full text-left px-[4%]">
                {rows
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className={`min-w-0 ${k === "Serial" ? "col-span-2" : ""}`}>
                      <dt className="font-sans uppercase" style={{ color: muted, fontSize: 7, letterSpacing: "0.18em" }}>{k}</dt>
                      <dd className="truncate" style={{ ...serif, fontSize: 14 }}>{v}</dd>
                    </div>
                  ))}
              </dl>
              <p className="mt-auto mb-[13%]" style={{ ...serif, fontSize: 15 }}>
                Signed by {data.house} <span style={{ color: gold }}>✓</span>
              </p>
            </div>
            <p className="absolute bottom-[8.6%] left-0 right-0 text-center font-sans uppercase" style={{ color: muted, fontSize: 7.5, letterSpacing: "0.36em" }}>
              MENA ROYAL
            </p>
            <Qr
              text={data.verifyUrl}
              colour={style === "black" ? paper : gold}
              background={style === "black" ? gold : undefined}
              className="absolute right-[10%] bottom-[7.4%] w-[14%]"
            />
            {sample && (
              <p className="absolute top-[45%] left-0 right-0 text-center font-sans uppercase rotate-[-18deg] pointer-events-none" style={{ color: gold, opacity: 0.35, fontSize: 22, letterSpacing: "0.4em" }}>
                Sample
              </p>
            )}
          </div>

          {/* Back */}
          <div className={`${face} [transform:rotateY(180deg)]`} style={{ background: paper, color: ink }}>
            {border}
            <div className="absolute inset-[9%] flex flex-col items-center text-center">
              <p className="mt-[12%]" style={{ ...serif, fontSize: "clamp(20px, 6.4vw, 26px)" }}>Scan to verify</p>
              <p className="font-sans uppercase mt-2" style={{ color: muted, fontSize: 7, letterSpacing: "0.2em" }}>Any time, for the life of this piece</p>
              <div className="w-[18%] h-px mt-[4%]" style={{ background: gold }} />
              <Qr
                text={data.verifyUrl}
                colour={style === "black" ? paper : ink}
                background={style === "black" ? gold : undefined}
                className="w-[58%] mt-[9%]"
              />
              <p className="font-sans mt-[6%] break-all" style={{ color: muted, fontSize: 8 }}>{data.verifyUrl.replace(/^https?:\/\//, "")}</p>
              <p className="mt-1" style={{ ...serif, fontSize: 14 }}>{data.serial}</p>
            </div>
            <p className="absolute bottom-[8.6%] left-0 right-0 text-center font-sans uppercase" style={{ color: muted, fontSize: 7.5, letterSpacing: "0.36em" }}>
              MENA ROYAL
            </p>
          </div>
        </div>
      </button>
      <p className="font-sans text-[10px] text-muted-foreground text-center mt-4 uppercase tracking-[0.2em]">
        {flipped ? "Tap to see the front" : "Tap to turn over"}
      </p>
    </div>
  );
};

export default CertificateCard;
