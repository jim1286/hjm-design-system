import { stateLayer } from "./foundations.js";
import { accentTint } from "./colors.js";
import { accentColor, themeColor } from "./color-references.js";

/**
 * Stable role aliases above the legacy ThemeColors key set. New recipes should
 * prefer these roles so the underlying theme shape can evolve independently.
 */
export const semanticColors = {
  canvas: themeColor("bg"),
  surface: {
    default: themeColor("surface"),
    sunken: themeColor("surfaceAlt"),
    raised: themeColor("bg"),
    brand: themeColor("surfaceAccent"),
    // Opaque neutral status plates are surfaces, independent of notice severity.
    statusNeutral: themeColor("neutralFill"),
    statusStrong: themeColor("strongFill"),
    /**
     * Loading placeholder fill (Skeleton, ListRow `loading`). A translucent text tint instead of an opaque
     * neutral: it darkens/lightens whatever it sits on, so it stays visible on canvas, Card surfaces and
     * profile palettes whose `surfaceAlt` is as light as `bg` (2026-10-17 Skeleton review, skeleton.md 근거).
     */
    placeholder: themeColor("text", 0.12),
  },
  // 2026-10-23: a neutral selection must not recolor brand surfaces or primary actions.
  selection: {
    background: themeColor("surfaceSelected"),
    content: themeColor("text"),
    border: themeColor("borderControl"),
  },
  content: {
    primary: themeColor("text"),
    body: themeColor("textBody"),
    secondary: themeColor("textMuted"),
    tertiary: themeColor("textSub"),
    decorative: themeColor("textWeak"),
    brand: themeColor("contentBrand"),
    danger: themeColor("danger"),
    inverse: themeColor("onPrimary"),
    // Status fills are independent of a product's primary button contrast pair.
    statusInverse: themeColor("onStatusFill"),
  },
  border: {
    subtle: themeColor("border", 0.7),
    default: themeColor("border"),
    /** Resting outline of an interactive control. */
    control: themeColor("borderControl"),
    strong: themeColor("textWeak"),
    focus: themeColor("contentBrand"),
    danger: themeColor("danger"),
  },
  action: {
    brand: {
      background: themeColor("primary"),
      content: themeColor("onPrimary"),
    },
    neutral: {
      background: themeColor("bg"),
      content: themeColor("text"),
      // A control outline is a border role. `textSub` made a resting neutral
      // action read heavier than the selected control beside it.
      border: themeColor("borderControl"),
    },
    danger: {
      background: themeColor("dangerFill"),
      content: themeColor("onDanger"),
    },
  },
  feedback: {
    info: {
      foreground: accentColor("info"),
      background: accentColor("info", accentTint.weak),
      badgeBackground: accentColor("info", accentTint.weak),
      border: accentColor("info", accentTint.border),
    },
    success: {
      foreground: accentColor("success"),
      background: accentColor("success", accentTint.weak),
      badgeBackground: accentColor("success", accentTint.weak),
      border: accentColor("success", accentTint.border),
    },
    warning: {
      foreground: accentColor("warning"),
      background: accentColor("warning", accentTint.weak),
      badgeBackground: accentColor("warning", accentTint.weak),
      border: accentColor("warning", accentTint.border),
    },
    attention: {
      foreground: accentColor("attention"),
      background: accentColor("attention", accentTint.weak),
      badgeBackground: accentColor("attention", accentTint.weak),
      border: accentColor("attention", accentTint.border),
    },
    danger: {
      foreground: themeColor("danger"),
      background: themeColor("danger", accentTint.weak),
      badgeBackground: themeColor("danger", accentTint.weak),
      border: themeColor("danger", accentTint.border),
    },
  },
  interaction: {
    hover: themeColor("text", stateLayer.hover),
    focus: themeColor("contentBrand", stateLayer.focus),
    pressed: themeColor("text", stateLayer.pressed),
    selected: themeColor("primary", stateLayer.selected),
    /**
     * Lower edge of a raised object, composited over its own fill so one shade
     * darkens any brand color (BottomNavigation raised tile, Spint 2026-10-13).
     */
    depth: themeColor("text", 0.45),
  },
} as const;
