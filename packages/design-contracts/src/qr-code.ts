export type QRErrorCorrection = "L" | "M" | "Q" | "H";
/** Pure encoding: hosts render the same matrix without image/network dependencies. */
export type QREncoder = (type: 0, level: QRErrorCorrection) => { addData(value: string, mode: "Byte"): void; make(): void; getModuleCount(): number; isDark(row: number, column: number): boolean };
// Encoding is injected by renderers so the neutral contracts package stays dependency-free.
export function createQRMatrix(value: string, encode: QREncoder, level: QRErrorCorrection = "M") {
  if (!value.trim() || !["L", "M", "Q", "H"].includes(level)) throw new TypeError("QRCode needs a value and valid error correction level");
  const code = encode(0, level);
  // Encode UTF-8 explicitly: the upstream default truncates non-Latin strings to bytes.
  // Hermes hosts need not provide TextEncoder; preserve UTF-8 without a global polyfill.
  const bytes: number[] = [];
  for (const character of value) {
    const raw = character.codePointAt(0)!;
    const code = raw >= 0xd800 && raw <= 0xdfff ? 0xfffd : raw;
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 63), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
  }
  const binary = bytes.map(byte => String.fromCharCode(byte)).join("");
  code.addData(binary, "Byte");
  try { code.make(); } catch { throw new RangeError("QRCode value exceeds the selected encoding capacity"); }
  const count = code.getModuleCount();
  const cells = Array.from({ length: count }, (_, row) => Array.from({ length: count }, (_, column) => code.isDark(row, column)));
  return { count, cells, quietZone: 4 as const };
}
export function qrPath(matrix: ReturnType<typeof createQRMatrix>) {
  return matrix.cells.flatMap((row, y) => row.flatMap((dark, x) => dark ? [`M${x + 4},${y + 4}h1v1h-1z`] : [])).join("");
}
export { qrCodeRecipe } from "./qr-code-recipe.js";
