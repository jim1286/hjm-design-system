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

export const typography = {
  caption: { fontSize: 11, lineHeight: 16, fontWeight: "400" },
  label: { fontSize: 12, lineHeight: 18, fontWeight: "600" },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  title: { fontSize: 18, lineHeight: 26, fontWeight: "700" },
  titleLarge: { fontSize: 20, lineHeight: 28, fontWeight: "800" },
  heading: { fontSize: 24, lineHeight: 32, fontWeight: "800" },
} as const;

export type TextVariant = keyof typeof typography;

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
} as const;

export const overlay = {
  scrim: 0.6,
  veil: 0.25,
} as const;

export const scrim = `rgba(0, 0, 0, ${overlay.scrim})`;

/** Renderers translate this contract to box-shadow or native shadow/elevation properties. */
export const shadow = {
  raised: {
    color: "#000000",
    opacity: 0.08,
    radius: 4,
    offsetY: 1,
  },
} as const;
