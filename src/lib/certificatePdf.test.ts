import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PDFDocument, PDFName } from "pdf-lib";
import { buildCertificatePdf, BLEED_MM, TRIM_MM } from "./certificatePdf";
import { qrMatrix } from "./qrMatrix";

const font = new Uint8Array(
  fs.readFileSync(path.resolve("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff")),
);
const MM = 72 / 25.4;

const data = (style: "ivory" | "black") => ({
  house: "Maison Test",
  product: "Oud Nocturne",
  serial: "MR-MAIS-7K3Q9XAB",
  batch: "B-2026-01",
  madeOn: "1 October 2026",
  engraving: "R.K.",
  verifyUrl: "https://www.menaroyal.com/verify/MR-MAIS-7K3Q9XAB",
  style,
  qr: qrMatrix("https://www.menaroyal.com/verify/MR-MAIS-7K3Q9XAB"),
});

describe("printable certificate (A6)", () => {
  for (const style of ["ivory", "black"] as const) {
    it(`builds 4 print pages with A6 trim, bleed, foil layer and spot colour (${style})`, async () => {
      const bytes = await buildCertificatePdf(data(style), font);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount()).toBe(4);
      const page = doc.getPage(0);
      const trim = page.getTrimBox();
      expect(trim.width / MM).toBeCloseTo(TRIM_MM.w, 1);
      expect(trim.height / MM).toBeCloseTo(TRIM_MM.h, 1);
      expect(page.getBleedBox().width / MM).toBeCloseTo(TRIM_MM.w + 2 * BLEED_MM, 1);
      const text = Buffer.from(bytes).toString("latin1");
      expect(text).toContain("/GoldFoil");
      expect(text).toContain("Gold foil");
      expect(doc.catalog.get(PDFName.of("OCProperties"))).toBeTruthy();
    });
  }
});
