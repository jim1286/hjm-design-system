import { spacing } from "./foundations.js";
import {
  surfaceDefaults,
  type SurfacePadding,
  type SurfaceTone,
} from "./base-recipes.js";

export type CardHeadingLevel = 2 | 3 | 4;

/**
 * Shared Card anatomy. Renderers own their host nodes (`article` on Web,
 * `View` on Native), while these slots and defaults stay identical.
 */
export const cardRecipe = {
  slots: ["root", "media", "body", "title", "description", "content", "actions"] as const,
  defaults: {
    tone: surfaceDefaults.tone,
    selected: false,
    bordered: true,
    headingLevel: 3,
    padding: "md",
  },
  selectedTone: "accent",
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    variant: "title",
    tone: "primary",
    emphasis: "strong",
  },
  description: {
    variant: "body",
    tone: "muted",
    emphasis: "regular",
  },
  actions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
} as const satisfies {
  slots: readonly ["root", "media", "body", "title", "description", "content", "actions"];
  defaults: {
    tone: SurfaceTone;
    selected: boolean;
    bordered: boolean;
    headingLevel: CardHeadingLevel;
    padding: SurfacePadding;
  };
  selectedTone: SurfaceTone;
  body: { padding: number; gap: number };
  title: {
    variant: "title";
    tone: "primary";
    emphasis: "strong";
  };
  description: {
    variant: "body";
    tone: "muted";
    emphasis: "regular";
  };
  actions: { gap: number; paddingHorizontal: number; paddingBottom: number };
};
