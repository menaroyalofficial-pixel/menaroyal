import QRCode from "qrcode";

/** QR code as a grid of dark/light squares, so we can draw it in gold (web and print). */
export function qrMatrix(text: string): boolean[][] {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const rows: boolean[][] = [];
  for (let r = 0; r < n; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < n; c++) row.push(Boolean(qr.modules.get(r, c)));
    rows.push(row);
  }
  return rows;
}

/** One SVG path for all dark squares (crisp at any size). */
export function qrPath(matrix: boolean[][]): string {
  let d = "";
  matrix.forEach((row, r) => row.forEach((dark, c) => dark && (d += `M${c} ${r}h1v1h-1z`)));
  return d;
}
