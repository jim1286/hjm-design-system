import { describe, expect, it } from "vitest";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum, validateMediaSetChoice } from "../src/screen-patterns.js";

// 2026-10-18 Utilverse: the paged album mounts one page; index rules are shared by both renderers.
describe("media album", () => {
  it("rejects empty sets and controlled indexes outside the set", () => {
    expect(() => validateMediaAlbum(0, 0)).toThrow(RangeError);
    expect(() => validateMediaAlbum(3, 3)).toThrow(RangeError);
    expect(() => validateMediaAlbum(3, 1.5)).toThrow(RangeError);
    expect(() => validateMediaAlbum(3, 2)).not.toThrow();
  });
  it("keeps the nearest page when an uncontrolled set shrinks", () => {
    expect(resolveMediaAlbumIndex(2, 4)).toBe(1);
    expect(resolveMediaAlbumIndex(5, -1)).toBe(0);
    expect(mediaAlbumRecipe.defaultAspectRatio).toBe(1);
  });
  it("allows one photo set per message or comment", () => {
    expect(() => validateMediaSetChoice(true, true)).toThrow(TypeError);
    expect(() => validateMediaSetChoice(true, false)).not.toThrow();
  });
});
