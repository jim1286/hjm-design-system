import qrcode from "qrcode-generator";
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
// jsQR is CommonJS; explicit require keeps NodeNext types and runtime aligned.
const jsQR = createRequire(import.meta.url)("jsqr") as typeof import("jsqr").default;
import { resolveMasonryLayout } from "../src/masonry.js";
import { resolveVirtualWindow, validateListKeys } from "../src/virtual-list.js";
import { createQRMatrix } from "../src/qr-code.js";

describe("data layout contracts", () => {
  it("packs into the shortest column without changing reading order or overlapping", () => {
    const layout = resolveMasonryLayout([100, 50, 80, 40], 210, 2, 10);
    expect(layout.items.map(({ left, top }) => [left, top])).toEqual([[0,0],[110,0],[110,60],[0,110]]);
    expect(layout.height).toBe(150);
    expect(resolveMasonryLayout([], 100).height).toBe(0);
    expect(() => resolveMasonryLayout([Number.NaN], 100)).toThrow();
    expect(() => resolveMasonryLayout([30], 10, 2, 20)).toThrow();
  });
  it("bounds windows and clamps a stale offset after a filtered collection shrinks", () => {
    expect(resolveVirtualWindow(10000, 40, 200, 20000)).toEqual({ start:497,end:508,totalHeight:400000,offset:20000 });
    expect(resolveVirtualWindow(2, 40, 200, 20000)).toEqual({ start:0,end:2,totalHeight:80,offset:0 });
    expect(() => validateListKeys(["same","same"],"Items")).toThrow();
    expect(() => resolveVirtualWindow(2,0,200,0)).toThrow();
  });
  it.each(["https://example.com/share", "https://example.com/한글?message=안녕🌿"])("encodes a scannable UTF-8 QR round-trip: %s", value => {
    const matrix = createQRMatrix(value, qrcode); const scale = 5; const size = (matrix.count + 8) * scale;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    matrix.cells.forEach((row,y) => row.forEach((dark,x) => {
      if (!dark) return;
      for(let dy=0;dy<scale;dy++) for(let dx=0;dx<scale;dx++) {
        const i=(((y+4)*scale+dy)*size+(x+4)*scale+dx)*4;
        pixels[i]=pixels[i+1]=pixels[i+2]=0;
      }
    }));
    expect(jsQR(pixels,size,size)?.data).toBe(value);
  });
  it("rejects empty and overflowing QR payloads instead of drawing a misleading code", () => {
    expect(() => createQRMatrix(" ", qrcode)).toThrow();
    expect(() => createQRMatrix("x".repeat(10000), qrcode)).toThrow();
  });
});
