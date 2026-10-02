/** Host-provided graphemes avoid splitting emoji or complex scripts with UTF-16 indexing. */
export function resolveGravityLetters(glyphs: readonly string[]) {
  // A promotional accent is bounded to 32 units; paragraphs belong in canonical Text.
  if (glyphs.length > 32 || glyphs.some(glyph => !glyph || glyph.includes("\n"))) {
    throw new RangeError("GravityLetters requires at most 32 nonempty, single-line glyphs");
  }
  return glyphs.map((glyph, index) => ({ glyph, delay: index * 24, rotation: index % 2 ? -6 : 6 }));
}
// One authored drop/rebound curve, not a physics engine. Fixed geometry prevents layout shifts.
export const gravityLetterMotion = { duration: 640, input: [0, 0.55, 0.75, 0.9, 1], y: [-36, 0, -10, 0, 0] } as const;
