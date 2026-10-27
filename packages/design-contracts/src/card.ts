import { control, glyph, spacing } from "./foundations.js";
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
    "backgroundMedia",
    "backgroundInteraction",
    "mediaBadges",
    "badges",
    "mediaAction",
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
    badgesAlign: "start",
    badgesPlacement: "body",
    padding: "md",
  },
  selectedTone: "selected",
  // BurnTok's compact 3-column picker (2026-10-10) needs the whole card to activate.
  // Reuse control state opacity instead of a product Pressable with a second visual contract.
  interaction: { disabledOpacity: buttonRecipe.opacity.disabled, pressedOpacity: buttonRecipe.opacity.pressed },
  // A playable cover is one target beside independent creator/comment actions (BurnTok screen migration).
  mediaAction: { inset: spacing.sm, diameter: control.minTouchTarget, iconSize: glyph.sm },
  // Decorative artwork needs fixed contrast independent of brand onPrimary (which can be dark).
  // A 60% black scrim keeps white card text readable even over a white source image.
  backgroundMedia: { scrim: "rgba(0, 0, 0, 0.6)", foreground: "#ffffff" },
  // Diairy NEW labels must not add a body row or change collection-card height.
  cornerBadge: { inset: spacing.xs, rotation: 12 },
  quotation: { gap: spacing.xs, markSize: glyph.md },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    gap: spacing.sm,
    // Short copy and independent commands share one vertical center (BurnTok profile, 2026-10-20).
    alignItems: "center",
  },
  // Card titles stay below page titles in dense content flows (BurnTok review, 2026-10-25).
  title: {
    variant: "bodyLarge",
    tone: "primary",
    emphasis: "medium",
  },
  description: {
    variant: "body",
    tone: "muted",
    emphasis: "regular",
  },
  actions: {
    // Button groups share the 8px actionGroupRecipe contract in both renderers (2026-10-21 audit).
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
} as const satisfies {
  slots: readonly [
    "root",
    "media",
    "backgroundMedia",
    "backgroundInteraction",
    "mediaBadges",
    "badges",
    "mediaAction",
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
    badgesAlign: "start" | "center";
    badgesPlacement: "body" | "corner";
    padding: SurfacePadding;
  };
  selectedTone: SurfaceTone;
  interaction: { disabledOpacity: number; pressedOpacity: number };
  mediaAction: { inset: number; diameter: number; iconSize: number };
  backgroundMedia: { scrim: string; foreground: string };
  cornerBadge: { inset: number; rotation: number };
  quotation: { gap: number; markSize: number };
  body: { padding: number; gap: number };
  header: { gap: number; alignItems: "center" };
  title: {
    variant: "bodyLarge";
    tone: "primary";
    emphasis: "medium";
  };
  description: {
    variant: "body";
    tone: "muted";
    emphasis: "regular";
  };
  actions: { gap: number; paddingHorizontal: number; paddingBottom: number };
};
