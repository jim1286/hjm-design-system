import type { ColorReference } from "./color-references.js";
import {
  fontWeight,
  radius,
  spacing,
  stroke,
  type FontWeightValue,
  type TextVariant,
} from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import {
  counterBadgeDefaults,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
} from "./counter-badge.js";

export {
  counterBadgeDefaults,
  formatCounterBadgeCount,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
} from "./counter-badge.js";

/** Numeric counters use a compact solid plate, distinct from status badges. */
export const counterBadgeRecipe = {
  slots: ["root", "label"] as const,
  defaults: counterBadgeDefaults,
  tones: {
    danger: {
      background: semanticColors.action.danger.background,
      content: semanticColors.action.danger.content,
    },
    brand: {
      background: semanticColors.action.brand.background,
      content: semanticColors.action.brand.content,
    },
    neutral: {
      background: semanticColors.content.body,
      content: semanticColors.canvas,
    },
  },
  sizes: {
    small: {
      height: 16,
      minWidth: 16,
      paddingHorizontal: spacing.xxs,
      textVariant: "caption",
    },
    medium: {
      height: 20,
      minWidth: 20,
      paddingHorizontal: spacing.xs,
      textVariant: "caption",
    },
  },
  variants: {
    inline: { border: null, borderWidth: 0 },
    floating: { border: semanticColors.canvas, borderWidth: stroke.strong },
  },
  radius: "full",
  fontWeight: fontWeight.bold,
} as const satisfies {
  slots: readonly ["root", "label"];
  defaults: {
    tone: CounterBadgeTone;
    size: CounterBadgeSize;
    variant: CounterBadgeVariant;
    max: number;
  };
  tones: Record<
    CounterBadgeTone,
    { background: ColorReference; content: ColorReference }
  >;
  sizes: Record<
    CounterBadgeSize,
    {
      height: number;
      minWidth: number;
      paddingHorizontal: number;
      textVariant: TextVariant;
    }
  >;
  variants: Record<
    CounterBadgeVariant,
    { border: ColorReference | null; borderWidth: number }
  >;
  radius: keyof typeof radius;
  fontWeight: FontWeightValue;
};
