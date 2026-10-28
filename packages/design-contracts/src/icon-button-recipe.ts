import {
  resolveColorReference,
  type ColorReference,
  type ColorReferencePalette,
} from "./color-references.js";
import {
  glyph,
  opacity,
  radius,
  stroke,
  validateElevationStep,
  type GlyphSize,
} from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import { counterBadgeRecipe, type CounterBadgeSize, type CounterBadgeVariant } from "./counter-badge-recipe.js";

export type IconButtonSize = "small" | "medium" | "large";
export type IconButtonShape = "rounded" | "circle";
export type IconButtonTone = "primary" | "secondary" | "ghost" | "danger";
/**
 * Which container edge a ghost IconButton sits on (logical: `start`/`end` follow the reading direction). The
 * button keeps its full touch target but overhangs that edge so its glyph slot, not the transparent hit area,
 * sets the visible inset (2026-10-17 measured audit: glyphs sat 10–15px inside the row/header inset).
 */
export type IconButtonEdge = "start" | "end" | "both";
export const iconButtonEdges = ["start", "end", "both"] as const satisfies readonly IconButtonEdge[];

export const iconButtonRecipe = {
  slots: ["root", "icon", "spinner"] as const,
  defaults: { tone: "ghost", size: "medium", shape: "rounded" },
  tones: {
    primary: {
      background: semanticColors.action.brand.background,
      content: semanticColors.action.brand.content,
      border: null,
    },
    secondary: {
      background: semanticColors.action.neutral.background,
      content: semanticColors.action.neutral.content,
      border: semanticColors.action.neutral.border,
    },
    ghost: {
      background: null,
      content: semanticColors.content.secondary,
      border: null,
    },
    danger: {
      background: semanticColors.action.danger.background,
      content: semanticColors.action.danger.content,
      border: null,
    },
  },
  sizes: {
    small: { diameter: 36, hitSlop: 4, glyph: "sm" },
    medium: { diameter: 44, hitSlop: 0, glyph: "md" },
    large: { diameter: 52, hitSlop: 0, glyph: "lg" },
  },
  shapes: { rounded: "md", circle: "full" },
  /**
   * Edge alignment (2026-10-17 measured audit): a ghost IconButton at a row/header edge overhangs that edge by
   * (visible diameter − glyph slot) / 2, so the glyph slot lines up with the container inset like text does while
   * the hit area stays whole. Only `ghost` overhangs — filled and outlined tones show their frame, and the frame is
   * what aligns. Renderers read `resolveIconButtonEdgeOverhang` so a raised visible diameter (minimumVisualTarget)
   * moves the glyph slot by the same amount on Web and Native.
   */
  edge: { tones: ["ghost"] as const },
  /**
   * `elevation` (2026-10-23) lifts a floating control (Burntok Dock's center action) with a shadow token. Only filled
   * tones can carry it: a ghost button has no frame for the shadow to belong to (Android draws none without a fill).
   */
  elevation: { default: "none", tones: ["primary", "secondary", "danger"] as const },
  /**
   * Count badge on an IconButton (NotificationBell). 2026-10-23 web check: a medium badge at the button's top-end
   * corner (top 0, end 0) covered 82% of BurnTok's 18px heart in a small (36) bell. The badge is now the compact
   * `small` floating plate, kept on the button's end edge (it never sticks out past an `edge`-aligned inset) and
   * raised so only its `glyphOverlap` ring (the canvas-colored floating border) reaches into the glyph slot.
   * Wider counts grow toward the start along the top, not down over the glyph. See `resolveIconButtonBadgeOffset`.
   */
  badge: { size: "small", variant: "floating", glyphOverlap: stroke.strong, inlineEnd: 0 },
  states: {
    // 2026-10-28: the selected flower gained an unwanted surrounding plate. Selection keeps the tone's
    // background/border; only foreground or the product's filled glyph conveys the persistent state.
    selected: { content: semanticColors.selection.content },
    pressedOpacity: opacity.pressed,
    disabledOpacity: opacity.disabled,
  },
} as const satisfies {
  slots: readonly string[];
  defaults: {
    tone: IconButtonTone;
    size: IconButtonSize;
    shape: IconButtonShape;
  };
  tones: Record<
    IconButtonTone,
    { background: ColorReference | null; content: ColorReference; border: ColorReference | null }
  >;
  sizes: Record<IconButtonSize, { diameter: number; hitSlop: number; glyph: GlyphSize }>;
  shapes: Record<IconButtonShape, keyof typeof radius>;
  edge: { tones: readonly IconButtonTone[] };
  elevation: { default: "none"; tones: readonly IconButtonTone[] };
  badge: { size: CounterBadgeSize; variant: CounterBadgeVariant; glyphOverlap: number; inlineEnd: number };
  states: {
    selected: { content: ColorReference };
    pressedOpacity: number;
    disabledOpacity: number;
  };
};

export type ResolvedIconButtonPresentation = Readonly<{
  background: string | null;
  content: string;
  border: string | null;
}>;

/** Resolve one recipe tone for non-CSS renderers without a second tone table. */
export function resolveIconButtonPresentation(
  tone: IconButtonTone,
  palette: ColorReferencePalette,
  selected = false,
): ResolvedIconButtonPresentation {
  const contract: {
    background: ColorReference | null;
    content: ColorReference;
    border: ColorReference | null;
  } = iconButtonRecipe.tones[tone];
  // Filled tones keep inverse content so selecting never loses contrast against their retained fill.
  const content = selected && tone !== "primary" && tone !== "danger"
    ? iconButtonRecipe.states.selected.content : contract.content;
  return {
    background:
      contract.background === null
        ? null
        : resolveColorReference(contract.background, palette),
    content: resolveColorReference(content, palette),
    border:
      contract.border === null
        ? null
        : resolveColorReference(contract.border, palette),
  };
}

/**
 * Negative margin a ghost IconButton applies on its `edge` side(s): (visible diameter − glyph slot) / 2, e.g. 10 for
 * medium (44 − 24). 0 for tones that draw a frame. `visibleDiameter` is the rendered size after the Provider's
 * minimumVisualTarget axis (`visibleControlHeight`), so the overhang tracks what is actually drawn.
 */
export function resolveIconButtonEdgeOverhang(
  tone: IconButtonTone,
  size: IconButtonSize,
  visibleDiameter: number = iconButtonRecipe.sizes[size].diameter,
): number {
  if (!(iconButtonRecipe.edge.tones as readonly IconButtonTone[]).includes(tone)) return 0;
  return Math.max(0, (visibleDiameter - glyph[iconButtonRecipe.sizes[size].glyph]) / 2);
}

/**
 * Where an IconButton's count badge sits, measured from the button's top-end corner (logical: `inlineEnd` mirrors in
 * RTL). The badge's block-end lands `badge.glyphOverlap` inside the glyph slot's top edge: blockStart = slot inset +
 * overlap − badge height, e.g. −6 for small (36 − 20 slot, 16 badge). `visibleDiameter` is the rendered size after the
 * Provider's minimumVisualTarget axis, so the badge follows the glyph slot when the button grows (Web and Native).
 */
export function resolveIconButtonBadgeOffset(
  size: IconButtonSize,
  visibleDiameter: number = iconButtonRecipe.sizes[size].diameter,
): Readonly<{ blockStart: number; inlineEnd: number }> {
  const { badge } = iconButtonRecipe;
  const slotInset = Math.max(0, (visibleDiameter - glyph[iconButtonRecipe.sizes[size].glyph]) / 2);
  return {
    blockStart: slotInset + badge.glyphOverlap - counterBadgeRecipe.sizes[badge.size].height,
    inlineEnd: badge.inlineEnd,
  };
}

/** Throws for an unknown step or an elevated ghost IconButton (iconButtonRecipe.elevation). */
export function validateIconButtonElevation(elevation: string, tone: IconButtonTone): void {
  validateElevationStep(elevation, "IconButton");
  if (elevation !== "none" && !(iconButtonRecipe.elevation.tones as readonly string[]).includes(tone)) {
    throw new TypeError(`IconButton elevation needs a filled tone, not ${tone}`);
  }
}
