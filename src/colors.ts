/** A persisted preference is an application concern; this package only defines valid values. */
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

/**
 * Product code chooses colors by meaning, never by a raw palette name.
 * Both themes deliberately expose exactly the same keys.
 */
export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceAccent: string;
  border: string;
  text: string;
  textBody: string;
  textMuted: string;
  textSub: string;
  textWeak: string;
  primary: string;
  contentBrand: string;
  danger: string;
  onPrimary: string;
  dangerFill: string;
  onDanger: string;
};

const light = {
  bg: "#ffffff",
  surface: "#f2f4f6",
  surfaceAlt: "#e5e8eb",
  surfaceAccent: "#c9e2ff",
  border: "#e5e8eb",
  text: "#191f28",
  textBody: "#333d4b",
  textMuted: "#4e5968",
  textSub: "#6b7684",
  textWeak: "#8b95a1",
  primary: "#0369a1",
  contentBrand: "#075985",
  danger: "#dc2626",
  onPrimary: "#ffffff",
  dangerFill: "#b91c1c",
  onDanger: "#ffffff",
} as const satisfies ThemeColors;

const dark = {
  bg: "#0b1026",
  surface: "#131a36",
  surfaceAlt: "#1e293b",
  surfaceAccent: "#1e3a5f",
  border: "#1e293b",
  text: "#f1f5f9",
  textBody: "#e2e8f0",
  textMuted: "#cbd5e1",
  textSub: "#94a3b8",
  textWeak: "#64748b",
  primary: "#075985",
  contentBrand: "#38bdf8",
  danger: "#f87171",
  onPrimary: "#ffffff",
  dangerFill: "#b91c1c",
  onDanger: "#ffffff",
} as const satisfies ThemeColors;

export const THEMES: Readonly<
  Record<ResolvedTheme, Readonly<ThemeColors>>
> = { light, dark };

/** Generic emphasis roles. Product-specific meanings are mapped by each consumer. */
export type AccentTone = "info" | "success" | "warning" | "attention";

export const ACCENTS: Readonly<
  Record<ResolvedTheme, Readonly<Record<AccentTone, string>>>
> = {
  light: {
    info: "#6d28d9",
    success: "#065f46",
    warning: "#92400e",
    attention: "#9a3412",
  },
  dark: {
    info: "#a78bfa",
    success: "#34d399",
    warning: "#fbbf24",
    attention: "#fb923c",
  },
};

/** Solid emphasis fills always pair with `onAccentFill`. */
export const accentFill: Readonly<Record<AccentTone, string>> = {
  info: "#6d28d9",
  success: "#065f46",
  warning: "#92400e",
  attention: "#9a3412",
};

export const onAccentFill = "#ffffff";

export const accentTint = {
  weak: 0.1,
  base: 0.15,
  strong: 0.2,
  border: 0.3,
} as const;

/** Shared visual signature. Renderers translate the normalized coordinates. */
export const brandGradient = {
  from: "#0369a1",
  to: "#155dfc",
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

export const onBrandGradient = "#ffffff";

/** Add an alpha channel without coupling callers to a CSS or React Native helper. */
export function withAlpha(hex: string, alpha: number): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) {
    throw new TypeError("A six-digit hex color is required");
  }
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError("Alpha must be a finite number between 0 and 1");
  }

  const source = match[1]!;
  const channels = [0, 2, 4].map((offset) =>
    Number.parseInt(source.slice(offset, offset + 2), 16),
  );
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
}
