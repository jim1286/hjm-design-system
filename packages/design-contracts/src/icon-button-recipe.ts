import {
  resolveColorReference,
  type ColorReference,
  type ColorReferencePalette,
} from "./color-references.js";
import {
  opacity,
  radius,
  type GlyphSize,
} from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

export type IconButtonSize = "small" | "medium" | "large";
export type IconButtonShape = "rounded" | "circle";
export type IconButtonTone = "primary" | "secondary" | "ghost" | "danger";

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
      border: semanticColors.border.default,
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
  states: {
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
  states: { pressedOpacity: number; disabledOpacity: number };
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
): ResolvedIconButtonPresentation {
  const contract = iconButtonRecipe.tones[tone];
  return {
    background:
      contract.background === null
        ? null
        : resolveColorReference(contract.background, palette),
    content: resolveColorReference(contract.content, palette),
    border:
      contract.border === null
        ? null
        : resolveColorReference(contract.border, palette),
  };
}
