import { spacing } from "./foundations.js";
import {
  buttonRecipe,
  type SurfacePadding,
  type SurfaceTone,
} from "./base-recipes.js";

export type CardHeadingLevel = 2 | 3 | 4;

/**
 * Shared Card anatomy. Renderers own their host nodes (`article` on Web,
 * `View` on Native), while these slots and defaults stay identical.
 */
export const cardRecipe = {
  slots: [
    "root",
    "media",
    "body",
    "header",
    "leading",
    "title",
    "description",
    "content",
    "actions",
  ] as const,
  defaults: {
    // Today Baseball's schedule cards establish the shared raised card treatment.
    // Keep plain Surface defaults independent so layout containers stay flat.
    tone: "raised",
    selected: false,
    bordered: true,
    headingLevel: 3,
    padding: "md",
  },
  selectedTone: "accent",
  // BurnTok's compact 3-column picker (2026-10-10) needs the whole card to activate.
  // Reuse control state opacity instead of a product Pressable with a second visual contract.
  interaction: { disabledOpacity: buttonRecipe.opacity.disabled, pressedOpacity: buttonRecipe.opacity.pressed },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    gap: spacing.sm,
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
  slots: readonly [
    "root",
    "media",
    "body",
    "header",
    "leading",
    "title",
    "description",
    "content",
    "actions",
  ];
  defaults: {
    tone: SurfaceTone;
    selected: boolean;
    bordered: boolean;
    headingLevel: CardHeadingLevel;
    padding: SurfacePadding;
  };
  selectedTone: SurfaceTone;
  interaction: { disabledOpacity: number; pressedOpacity: number };
  body: { padding: number; gap: number };
  header: { gap: number };
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
