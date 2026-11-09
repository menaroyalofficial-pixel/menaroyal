/**
 * Print-ready certificate card, A6 (105 x 148 mm), like a luxury gift card.
 *
 *  Page 1  Front, full print. Two layers: "Print" (paper and ink) and
 *          "Gold foil" (border, title, front QR). Gold uses a spot colour
 *          named "GoldFoil", so the printer can run it as foil.
 *  Page 2  Back, full print (same layers).
 *  Page 3  Front foil plate: only the gold elements, 100% black.
 *  Page 4  Back foil plate.
 *
 * Every page has 3 mm bleed, crop marks and trim/bleed boxes set.
 * The large QR on the back is printed in ink, not foil, so it always scans.
 */
import {
  beginText,
  endText,
  fill,
  lineTo,
  moveText,
  moveTo,
  PDFDocument,
  PDFFont,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames as Ops,
  PDFPage,
  PDFRef,
  PDFString,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  setCharacterSpacing,
  setFillingCmykColor,
  setFontAndSize,
  setLineWidth,
  setStrokingCmykColor,
  showText,
  StandardFonts,
  stroke,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export const TRIM_MM = { w: 105, h: 148 };
export const BLEED_MM = 3;
const SLUG_MM = 12; // space around the bleed for crop marks and labels
const MM = 72 / 25.4;

export interface CertificatePrint {
  house: string;
  product: string;
  serial: string;
  batch: string | null;
  madeOn: string | null; // "1 October 2026"
  engraving: string | null;
  verifyUrl: string;
  style: "ivory" | "black";
  qr: boolean[][];
}

type Cmyk = [number, number, number, number];
const GOLD_TINT: Cmyk = [0, 0.2, 0.6, 0.25];
const REGISTRATION: Cmyk = [1, 1, 1, 1];

function palette(style: CertificatePrint["style"]) {
  return style === "black"
    ? { paper: [0.6, 0.45, 0.4, 1] as Cmyk, ink: [0, 0.03, 0.09, 0.02] as Cmyk, muted: [0, 0.02, 0.06, 0.4] as Cmyk }
    : { paper: [0, 0.03, 0.09, 0.02] as Cmyk, ink: [0, 0, 0, 0.92] as Cmyk, muted: [0, 0, 0, 0.55] as Cmyk };
}

interface Fonts {
  serif: PDFFont;
  sans: PDFFont;
}

/** Drawing helpers in millimetres from the bottom-left corner of the trim. */
class Painter {
  ops: PDFOperator[] = [];
  private keys = new Map<PDFFont, PDFName>();
  constructor(private page: PDFPage) {}

  private x = (mm: number) => (SLUG_MM + BLEED_MM + mm) * MM;
  private y = (mm: number) => (SLUG_MM + BLEED_MM + mm) * MM;
  private key(font: PDFFont) {
    if (!this.keys.has(font)) this.keys.set(font, this.page.node.newFontDictionary(font.name, font.ref));
    return this.keys.get(font)!;
  }

  fillColor(c: Cmyk) {
    this.ops.push(setFillingCmykColor(...c));
  }
  strokeColor(c: Cmyk) {
    this.ops.push(setStrokingCmykColor(...c));
  }
  rect(x: number, y: number, w: number, h: number) {
    this.ops.push(rectangle(this.x(x), this.y(y), w * MM, h * MM), fill());
  }
  frame(x: number, y: number, w: number, h: number, widthPt: number) {
    this.ops.push(setLineWidth(widthPt), rectangle(this.x(x), this.y(y), w * MM, h * MM), stroke());
  }
  line(x1: number, y1: number, x2: number, y2: number, widthPt: number) {
    this.ops.push(setLineWidth(widthPt), moveTo(this.x(x1), this.y(y1)), lineTo(this.x(x2), this.y(y2)), stroke());
  }
  check(cx: number, cy: number, size: number) {
    this.ops.push(
      setLineWidth(0.6),
      moveTo(this.x(cx - size / 2), this.y(cy)),
      lineTo(this.x(cx - size / 8), this.y(cy - size / 2.4)),
      lineTo(this.x(cx + size / 2), this.y(cy + size / 2.2)),
      stroke(),
    );
  }
  width(font: PDFFont, size: number, s: string, trackingPt = 0) {
    return (font.widthOfTextAtSize(s, size) + trackingPt * Math.max(s.length - 1, 0)) / MM;
  }
  /** Largest size up to `size` so the text fits in `maxMm`. */
  fit(font: PDFFont, size: number, s: string, maxMm: number, trackingPt = 0) {
    const w = this.width(font, size, s, trackingPt);
    return w <= maxMm ? size : Math.max(6, (size * maxMm) / w);
  }
  text(font: PDFFont, size: number, s: string, xMm: number, yMm: number, align: "left" | "center" = "left", trackingPt = 0) {
    const w = this.width(font, size, s, trackingPt);
    const left = align === "center" ? xMm - w / 2 : xMm;
    this.ops.push(
      beginText(),
      setFontAndSize(this.key(font), size),
      setCharacterSpacing(trackingPt),
      moveText(this.x(left), this.y(yMm)),
      showText(font.encodeText(s)),
      endText(),
    );
  }
  /** QR: "dark" draws the dark squares; "light" draws the light squares and a quiet zone (for dark paper). */
  qr(matrix: boolean[][], x: number, y: number, size: number, mode: "dark" | "light") {
    const n = matrix.length;
    const quiet = mode === "light" ? 2 : 0;
    const cell = size / (n + quiet * 2);
    const ox = x + quiet * cell;
    const oy = y + quiet * cell;
    if (mode === "light") {
      // quiet zone frame
      this.rect(x, y, size, quiet * cell);
      this.rect(x, y + size - quiet * cell, size, quiet * cell);
      this.rect(x, y, quiet * cell, size);
      this.rect(x + size - quiet * cell, y, quiet * cell, size);
    }
    matrix.forEach((row, r) =>
      row.forEach((dark, c) => {
        if (dark === (mode === "dark")) {
          // tiny overlap avoids hairline gaps between squares
          this.rect(ox + c * cell, oy + (n - 1 - r) * cell, cell + 0.02, cell + 0.02);
        }
      }),
    );
  }
  raw(...ops: PDFOperator[]) {
    this.ops.push(...ops);
  }
  /** Crop marks at the four trim corners, outside the bleed. */
  cropMarks() {
    const { w, h } = TRIM_MM;
    const gap = BLEED_MM + 1;
    const len = 6;
    this.strokeColor(REGISTRATION);
    for (const cx of [0, w]) {
      for (const cy of [0, h]) {
        const sx = cx === 0 ? -1 : 1;
        const sy = cy === 0 ? -1 : 1;
        this.line(cx + sx * gap, cy, cx + sx * (gap + len), cy, 0.25);
        this.line(cx, cy + sy * gap, cx, cy + sy * (gap + len), 0.25);
      }
    }
  }
}

interface Art {
  print: (p: Painter) => void; // paper and ink
  gold: (p: Painter) => void; // geometry only: colour is set by the caller
}

function goldBorder(p: Painter) {
  const { w, h } = TRIM_MM;
  p.frame(6, 6, w - 12, h - 12, 0.6);
  p.frame(7.6, 7.6, w - 15.2, h - 15.2, 0.25);
}

function frontArt(d: CertificatePrint, f: Fonts): Art {
  const c = palette(d.style);
  const { w, h } = TRIM_MM;
  const mid = w / 2;
  return {
    print(p) {
      p.fillColor(c.paper);
      p.rect(-BLEED_MM, -BLEED_MM, w + BLEED_MM * 2, h + BLEED_MM * 2);
      p.fillColor(c.ink);
      p.text(f.serif, p.fit(f.serif, 26, d.house, 80), d.house, mid, 104, "center");
      p.text(f.serif, p.fit(f.serif, 15, d.product, 82), d.product, mid, 89, "center");

      const rows: [string, string | null][] = [
        ["SERIAL", d.serial],
        ["BATCH", d.batch],
        ["MADE ON", d.madeOn],
        ["ENGRAVING", d.engraving],
      ];
      rows
        .filter(([, v]) => v)
        .forEach(([label, value], i) => {
          const x = i % 2 === 0 ? 16 : 60;
          const y = 66 - Math.floor(i / 2) * 15;
          p.fillColor(c.muted);
          p.text(f.sans, 4.6, label, x, y, "left", 0.9);
          p.fillColor(c.ink);
          p.text(f.serif, p.fit(f.serif, 10.5, value!, 38), value!, x, y - 5.2);
        });

      const signed = `Signed by ${d.house}`;
      const size = p.fit(f.serif, 11, signed, 68);
      p.text(f.serif, size, signed, mid - 2.5, 30, "center");

      p.fillColor(c.muted);
      p.text(f.sans, 5.6, "MENA ROYAL", mid, 13, "center", 2.2);
    },
    gold(p) {
      goldBorder(p);
      p.text(f.sans, 5.4, "CERTIFICATE OF AUTHENTICITY", mid, 127, "center", 1.5);
      p.line(mid - 9, 122.5, mid + 9, 122.5, 0.3);
      p.line(mid - 20, 80.5, mid + 20, 80.5, 0.3);
      const signedW = p.width(f.serif, p.fit(f.serif, 11, `Signed by ${d.house}`, 68), `Signed by ${d.house}`);
      p.check(mid - 2.5 + signedW / 2 + 3.4, 31.3, 2.6);
      // Discreet gold QR in the corner (on dark paper the gold forms the light squares).
      p.qr(d.qr, w - 27, 11, 15, d.style === "black" ? "light" : "dark");
    },
  };
}

function backArt(d: CertificatePrint, f: Fonts): Art {
  const c = palette(d.style);
  const { w, h } = TRIM_MM;
  const mid = w / 2;
  const qrSize = 46;
  const qrX = mid - qrSize / 2;
  const qrY = 50;
  return {
    print(p) {
      p.fillColor(c.paper);
      p.rect(-BLEED_MM, -BLEED_MM, w + BLEED_MM * 2, h + BLEED_MM * 2);
      p.fillColor(c.ink);
      p.text(f.serif, 17, "Scan to verify", mid, 118, "center");
      p.fillColor(c.muted);
      p.text(f.sans, 5, "ANY TIME, FOR THE LIFE OF THIS PIECE", mid, 111, "center", 0.8);
      if (d.style === "ivory") {
        p.fillColor(c.ink);
        p.qr(d.qr, qrX, qrY, qrSize, "dark");
      }
      p.fillColor(c.muted);
      const url = d.verifyUrl.replace(/^https?:\/\//, "");
      p.text(f.sans, p.fit(f.sans, 5, url, 80), url, mid, 42, "center");
      p.fillColor(c.ink);
      p.text(f.serif, 10, d.serial, mid, 35, "center");
      p.fillColor(c.muted);
      p.text(f.sans, 5.6, "MENA ROYAL", mid, 13, "center", 2.2);
    },
    gold(p) {
      goldBorder(p);
      p.line(mid - 9, 106, mid + 9, 106, 0.3);
      // On black paper the QR is a gold plate with the dark squares left open.
      if (d.style === "black") p.qr(d.qr, qrX, qrY, qrSize, "light");
    },
  };
}

function sizePage(page: PDFPage) {
  const total = (TRIM_MM.w + 2 * (BLEED_MM + SLUG_MM)) * MM;
  const totalH = (TRIM_MM.h + 2 * (BLEED_MM + SLUG_MM)) * MM;
  page.setSize(total, totalH);
  page.setBleedBox(SLUG_MM * MM, SLUG_MM * MM, (TRIM_MM.w + 2 * BLEED_MM) * MM, (TRIM_MM.h + 2 * BLEED_MM) * MM);
  page.setTrimBox((SLUG_MM + BLEED_MM) * MM, (SLUG_MM + BLEED_MM) * MM, TRIM_MM.w * MM, TRIM_MM.h * MM);
}

function slugLabel(p: Painter, f: Fonts, text: string) {
  p.fillColor([0, 0, 0, 1]);
  p.text(f.sans, 5.5, text, -BLEED_MM, TRIM_MM.h + BLEED_MM + 8.6);
}

export async function buildCertificatePdf(d: CertificatePrint, serifFont: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fonts: Fonts = {
    serif: await doc.embedFont(serifFont, { subset: true }),
    sans: await doc.embedFont(StandardFonts.Helvetica),
  };
  doc.setTitle(`Certificate of Authenticity · ${d.product} · ${d.serial}`);
  doc.setAuthor(d.house);
  doc.setSubject(`Verify at ${d.verifyUrl}`);
  doc.setCreator("MENA ROYAL");
  doc.setProducer("MENA ROYAL");

  // Spot colour "GoldFoil" and the two layers.
  const ctx = doc.context;
  const tint = ctx.register(ctx.obj({ FunctionType: 2, Domain: [0, 1], C0: [0, 0, 0, 0], C1: GOLD_TINT, N: 1 }));
  const goldSpace = ctx.register(ctx.obj(["Separation", "GoldFoil", "DeviceCMYK", tint]));
  const layerPrint = ctx.register(ctx.obj({ Type: "OCG", Name: PDFString.of("Print (CMYK)") }));
  const layerFoil = ctx.register(ctx.obj({ Type: "OCG", Name: PDFString.of("Gold foil") }));
  doc.catalog.set(
    PDFName.of("OCProperties"),
    ctx.obj({ OCGs: [layerPrint, layerFoil], D: { Name: PDFString.of("Layers"), Order: [layerPrint, layerFoil], ON: [layerPrint, layerFoil] } }),
  );

  const addResources = (page: PDFPage, extra: Record<string, PDFRef>) => {
    const { Resources } = page.node.normalizedEntries();
    for (const [k, v] of Object.entries(extra)) Resources.set(PDFName.of(k), v);
  };

  const sides: [string, Art][] = [
    ["Front", frontArt(d, fonts)],
    ["Back", backArt(d, fonts)],
  ];

  // Full print pages with layers
  for (const [name, art] of sides) {
    const page = doc.addPage();
    sizePage(page);
    addResources(page, {
      ColorSpace: ctx.register(ctx.obj({ CSGold: goldSpace })),
      Properties: ctx.register(ctx.obj({ OCPrint: layerPrint, OCFoil: layerFoil })),
    });
    const p = new Painter(page);
    p.raw(pushGraphicsState(), PDFOperator.of(Ops.BeginMarkedContentSequence, [PDFName.of("OC"), PDFName.of("OCPrint")]));
    art.print(p);
    p.raw(PDFOperator.of(Ops.EndMarkedContent), popGraphicsState());
    p.raw(
      pushGraphicsState(),
      PDFOperator.of(Ops.BeginMarkedContentSequence, [PDFName.of("OC"), PDFName.of("OCFoil")]),
      PDFOperator.of(Ops.NonStrokingColorspace, [PDFName.of("CSGold")]),
      PDFOperator.of(Ops.NonStrokingColorN, [PDFNumber.of(1)]),
      PDFOperator.of(Ops.StrokingColorspace, [PDFName.of("CSGold")]),
      PDFOperator.of(Ops.StrokingColorN, [PDFNumber.of(1)]),
    );
    art.gold(p);
    p.raw(PDFOperator.of(Ops.EndMarkedContent), popGraphicsState());
    p.cropMarks();
    slugLabel(p, fonts, `MENA ROYAL · ${d.serial} · ${name} · A6 105x148 mm + 3 mm bleed · layers: Print (CMYK) + Gold foil (spot "GoldFoil")`);
    page.pushOperators(...p.ops);
  }

  // Foil plates: gold elements only, 100% black
  for (const [name, art] of sides) {
    const page = doc.addPage();
    sizePage(page);
    const p = new Painter(page);
    p.fillColor([0, 0, 0, 1]);
    p.strokeColor([0, 0, 0, 1]);
    art.gold(p);
    p.cropMarks();
    slugLabel(p, fonts, `MENA ROYAL · ${d.serial} · ${name} · FOIL PLATE (gold foil = 100% K)`);
    page.pushOperators(...p.ops);
  }

  // Plain objects (no object streams): older print workflows read these best.
  return doc.save({ useObjectStreams: false });
}

