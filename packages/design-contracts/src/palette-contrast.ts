import { THEMES, type ResolvedTheme, type ThemeColors } from "./colors.js";

/** Pair thresholds and their rationale: docs/brand-boundary.md. */
export type PaletteContrastRule = Readonly<{
  foreground: keyof ThemeColors;
  background: keyof ThemeColors;
  minimum: number;
  kind: "text" | "non-text";
}>;

export type PaletteContrastFinding = PaletteContrastRule & Readonly<{ ratio: number }>;

const readable = ["text", "textBody", "textMuted", "textSub", "contentBrand", "danger"] as const;
const surfaces = ["bg", "surface"] as const;

export const paletteContrastRules: readonly PaletteContrastRule[] = [
  ...readable.flatMap((foreground) =>
    surfaces.map((background) => ({ foreground, background, minimum: 4.5, kind: "text" as const })),
  ),
  { foreground: "onPrimary", background: "primary", minimum: 4.5, kind: "text" },
  { foreground: "onDanger", background: "dangerFill", minimum: 4.5, kind: "text" },
  ...(["primary", "borderControl"] as const).flatMap((foreground) =>
    surfaces.map((background) => ({ foreground, background, minimum: 3, kind: "non-text" as const })),
  ),
  // textWeak is the disabled/decorative/placeholder tier, exempt from text AA;
  // it also paints border.strong on canvas, which must stay a visible boundary.
  { foreground: "textWeak", background: "bg", minimum: 3, kind: "non-text" },
];

const sixDigitHex = /^#[0-9a-f]{6}$/i;

function luminance(hex: string): number {
  if (!sixDigitHex.test(hex)) throw new TypeError(`Expected a six-digit hex color, got ${hex}`);
  const [r, g, b] = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two six-digit hex colors. */
export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Pairs of a resolved theme palette that fall below their threshold; empty means it passes. */
export function checkPaletteContrast(
  palette: Readonly<ThemeColors>,
): readonly PaletteContrastFinding[] {
  const findings: PaletteContrastFinding[] = [];
  for (const rule of paletteContrastRules) {
    const ratio = contrastRatio(palette[rule.foreground], palette[rule.background]);
    if (ratio < rule.minimum) findings.push({ ...rule, ratio: Math.round(ratio * 100) / 100 });
  }
  return findings;
}

/** Checks a `brandPalette` the way the Provider applies it: each theme merged over the HJM defaults. */
export function checkBrandPaletteContrast(
  brandPalette: Readonly<Partial<Record<ResolvedTheme, Readonly<Partial<ThemeColors>>>>>,
): Readonly<Record<ResolvedTheme, readonly PaletteContrastFinding[]>> {
  return {
    light: checkPaletteContrast({ ...THEMES.light, ...brandPalette.light }),
    dark: checkPaletteContrast({ ...THEMES.dark, ...brandPalette.dark }),
  };
}
