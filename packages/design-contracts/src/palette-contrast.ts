import { THEMES, accentFill, type AccentTone, type ResolvedTheme, type ThemeColors } from "./colors.js";

/** Pair thresholds and their rationale: docs/brand-boundary.md. */
export type PaletteContrastRule = Readonly<{
  foreground: keyof ThemeColors;
  background: keyof ThemeColors | `accentFill.${AccentTone}`;
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
  // Selected text must remain readable when a product overrides the shared neutral fill.
  { foreground: "text", background: "surfaceSelected", minimum: 4.5, kind: "text" },
  { foreground: "onPrimary", background: "primary", minimum: 4.5, kind: "text" },
  { foreground: "onDanger", background: "dangerFill", minimum: 4.5, kind: "text" },
  // Filled badges use a separate ink/fill pair, independent of primary buttons.
  ...(["neutralFill", "strongFill"] as const).map(background => ({ foreground: "onStatusFill" as const, background, minimum: 4.5, kind: "text" as const })),
  ...(Object.keys(accentFill) as AccentTone[]).map(tone => ({ foreground: "onStatusFill" as const, background: `accentFill.${tone}` as const, minimum: 4.5, kind: "text" as const })),
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

/** Fixed status fills remain outside the product palette, but participate in the same report. */
export function resolveContrastBackground(palette: Readonly<ThemeColors>, key: PaletteContrastRule["background"]): string {
  return key.startsWith("accentFill.") ? accentFill[key.slice("accentFill.".length) as AccentTone] : palette[key as keyof ThemeColors];
}

/** Pairs of a resolved theme palette that fall below their threshold; empty means it passes. */
export function checkPaletteContrast(
  palette: Readonly<ThemeColors>,
): readonly PaletteContrastFinding[] {
  const findings: PaletteContrastFinding[] = [];
  for (const rule of paletteContrastRules) {
    const ratio = contrastRatio(palette[rule.foreground], resolveContrastBackground(palette, rule.background));
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

/** Shared whole-surface fill adaptation. This palette-only entry keeps ordinary
 * renderer imports independent of the optional preset registry/effect descriptors.
 * The supported 0.85..1 interval keeps readable foregrounds outside the backdrop
 * luminance interval; testing its black/white endpoints bounds any opaque backdrop.
 * See docs/design-profile.md for why a reference card's low alpha is not copied. */
export function resolveSurfaceFillOpacity(requested: number, palette: Readonly<ThemeColors>): number {
  if (!Number.isFinite(requested) || requested < 0.85 || requested > 1) throw new RangeError("Surface fill opacity must be between 0.85 and 1");
  const channels = [1, 3, 5].map(offset => Number.parseInt(palette.bg.slice(offset, offset + 2), 16));
  const rules = paletteContrastRules.filter(rule => rule.background === "bg");
  for (let opacity = requested; opacity < 1; opacity = Math.min(1, opacity + 0.01)) {
    const endpoints = [0, 255].map(backdrop => "#" + channels.map(channel => Math.round(channel * opacity + backdrop * (1 - opacity)).toString(16).padStart(2, "0")).join(""));
    if (endpoints.every(color => rules.every(rule => contrastRatio(palette[rule.foreground], color) >= rule.minimum))) return opacity;
  }
  return 1;
}
