/** Numeric units are consumed as CSS pixels on web and density-independent points on native. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/**
 * Ordered fallbacks keep the contract platform-neutral: Web renderers join
 * the list as a CSS stack, while native renderers select the first family
 * available on the device instead of receiving a CSS-only string.
 */
export const fontFamily = {
  ui: [
    "Inter",
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "sans-serif",
  ],
  code: [
    "ui-monospace",
    "SFMono-Regular",
    "Consolas",
    "Liberation Mono",
    "monospace",
  ],
} as const;

export type FontFamily = keyof typeof fontFamily;

/** String weights translate unchanged to CSS and React Native text styles. */
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
} as const;

export type FontWeight = keyof typeof fontWeight;
export type FontWeightValue = (typeof fontWeight)[FontWeight];

/** Numeric tracking uses CSS pixels on Web and density-independent points on Native. */
export const letterSpacing = {
  tight: -0.2,
  normal: 0,
  wide: 0.2,
} as const;

export type LetterSpacing = keyof typeof letterSpacing;

/** Renderers map the shared intent to `font-variant-numeric` / `fontVariant`. */
export const numeric = {
  proportional: "proportional-nums",
  tabular: "tabular-nums",
} as const;

export type NumericVariant = keyof typeof numeric;

export const typography = {
  caption: { fontSize: 11, lineHeight: 16, fontWeight: fontWeight.regular },
  label: { fontSize: 12, lineHeight: 18, fontWeight: fontWeight.semibold },
  body: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  title: { fontSize: 18, lineHeight: 26, fontWeight: fontWeight.bold },
  titleLarge: { fontSize: 20, lineHeight: 28, fontWeight: fontWeight.heavy },
  heading: { fontSize: 24, lineHeight: 32, fontWeight: fontWeight.heavy },
} as const;

export type TextVariant = keyof typeof typography;

/**
 * Document heading hierarchy without widening the established `TextVariant`
 * union. Levels 3–5 reuse the existing semantic styles; larger levels are
 * additive display roles for dense product pages and documentation.
 */
export const heading = {
  level1: { fontSize: 40, lineHeight: 48, fontWeight: fontWeight.heavy },
  level2: { fontSize: 32, lineHeight: 40, fontWeight: fontWeight.heavy },
  level3: typography.heading,
  level4: typography.titleLarge,
  level5: typography.title,
} as const;

export type HeadingLevel = keyof typeof heading;

/** Glyphs include icons and avatars; they do not inherit paragraph line-height. */
export const glyph = {
  xs: 14,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 44,
  xxxl: 48,
} as const;

export type GlyphSize = keyof typeof glyph;

export const motion = {
  fast: 120,
  normal: 200,
  slow: 320,
} as const;

/**
 * Curves are stored as normalized cubic-bezier tuples so CSS and native
 * animation drivers can translate the same motion intent without sharing a
 * renderer dependency.
 */
export const easing = {
  standard: [0.2, 0, 0, 1],
  enter: [0, 0, 0, 1],
  exit: [0.3, 0, 1, 1],
  emphasized: [0.2, 0, 0, 1],
} as const;

export type ReducedMotionBehavior = "instant" | "opacity" | "static";

/** Shared transition intent; renderers translate easing tuples to their animation API. */
export const motionPreset = {
  micro: {
    duration: motion.fast,
    easing: "standard",
    reducedMotion: "instant",
  },
  enter: {
    duration: motion.normal,
    easing: "enter",
    reducedMotion: "opacity",
  },
  exit: {
    duration: motion.fast,
    easing: "exit",
    reducedMotion: "instant",
  },
  context: {
    duration: motion.slow,
    easing: "emphasized",
    reducedMotion: "opacity",
  },
} as const satisfies Record<
  "micro" | "enter" | "exit" | "context",
  {
    duration: number;
    easing: keyof typeof easing;
    reducedMotion: ReducedMotionBehavior;
  }
>;

/** Native renderers may use these values directly; web renderers use easing. */
export const spring = {
  responsive: { stiffness: 760, damping: 52, mass: 1 },
  expressive: { stiffness: 520, damping: 38, mass: 1 },
} as const;

/** Reusable state strengths. Components still decide which states are valid. */
export const opacity = {
  disabled: 0.5,
  muted: 0.72,
  pressed: 0.86,
  dragged: 0.64,
} as const;

/** Overlaying the content color at these strengths creates predictable states. */
export const stateLayer = {
  hover: 0.06,
  focus: 0.08,
  pressed: 0.1,
  selected: 0.1,
} as const;

export const stroke = {
  subtle: 1,
  default: 1,
  strong: 2,
  focus: 2,
} as const;

export const control = {
  minTouchTarget: 44,
  buttonHeight: {
    small: 36,
    medium: 44,
    large: 52,
  },
  buttonHitSlop: {
    small: 4,
    medium: 0,
    large: 0,
  },
  fieldHeight: 44,
  chipHeight: {
    small: 36,
    medium: 44,
  },
  selectionIndicator: 24,
} as const;

/** Product renderers may narrow these widths, but should not invent new rhythm. */
export const layout = {
  pagePadding: {
    compact: spacing.md,
    regular: spacing.lg,
    spacious: spacing.xl,
  },
  sectionGap: spacing.xl,
  contentGap: spacing.md,
  rowHeight: {
    singleLine: 56,
    twoLine: 68,
  },
  readingMaxWidth: 720,
  contentMaxWidth: 1200,
} as const;

/** Width thresholds use CSS pixels on Web and density-independent points on Native. */
export const breakpoint = {
  compact: 0,
  medium: 600,
  expanded: 960,
  wide: 1280,
} as const;

/** Shared stacking intent. Values remain sparse to leave room for app layers. */
export const layer = {
  base: 0,
  sticky: 100,
  dropdown: 400,
  overlay: 800,
  modal: 900,
  tooltip: 950,
  toast: 1000,
} as const;

export const overlay = {
  scrim: 0.6,
  veil: 0.25,
} as const;

export type BackdropReference = Readonly<{
  color: "#000000";
  opacity: number;
}>;

/** Fixed backdrop contracts avoid renderer-specific names such as CSS `scrim`. */
export const backdrop = {
  modal: { color: "#000000", opacity: overlay.scrim },
  veil: { color: "#000000", opacity: overlay.veil },
} as const satisfies Record<"modal" | "veil", BackdropReference>;

export const scrim = `rgba(0, 0, 0, ${overlay.scrim})`;

/** Renderers translate this contract to box-shadow or native shadow/elevation properties. */
export const shadow = {
  raised: {
    color: "#000000",
    opacity: 0.08,
    radius: 4,
    offsetY: 1,
  },
  floating: {
    color: "#000000",
    opacity: 0.12,
    radius: 12,
    offsetY: 4,
  },
  overlay: {
    color: "#000000",
    opacity: 0.16,
    radius: 24,
    offsetY: 8,
  },
} as const;
