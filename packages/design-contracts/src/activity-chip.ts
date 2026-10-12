import type { ColorReference } from "./color-references.js";
import {
  control,
  fontWeight,
  opacity,
  radius,
  spacing,
  stroke,
  type FontWeightValue,
  type TextVariant,
} from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * ActivityChip — a compact pressable status for one running background task (a review, an upload,
 * a sync). It shows a small decorative media and a short label in an otherwise empty header slot,
 * and opens the matching panel toast for details (composition `activity-status`).
 *
 * Why a new component (2026-10-10, BurnTok "똑쟁이" request): `Chip` is a selection/action control
 * with pressed/checked semantics; a status that toggles a details panel is a disclosure trigger with
 * `aria-expanded`, so reusing Chip would announce the wrong role. The name differs because Chip exists.
 * The task state, its copy and the panel content stay product-owned; HJM owns the trigger shape,
 * disclosure semantics and the panel (Toast) lifecycle.
 */
export type ActivityChipEmphasis = "default" | "emphasis";

export type ActivityChipDescriptor = Readonly<{
  /** Short visible status, for example "다듬는 중". */
  label: string;
  /** Full spoken status; defaults to `label`. */
  accessibilityLabel?: string;
  /** `emphasis` marks a result that waits for the user (e.g. a ready version to apply). */
  emphasis?: ActivityChipEmphasis;
  /** Whether the details panel it controls is open. */
  expanded?: boolean;
}>;

export type ResolvedActivityChipDescriptor = Readonly<{
  label: string;
  accessibilityLabel: string;
  emphasis: ActivityChipEmphasis;
  expanded: boolean;
}>;

export const activityChipDefaults = {
  emphasis: "default",
  expanded: false,
} as const satisfies Readonly<{ emphasis: ActivityChipEmphasis; expanded: boolean }>;

/** Validates product copy once so Web and Native reject the same empty labels. */
export function resolveActivityChipDescriptor(
  descriptor: ActivityChipDescriptor,
): ResolvedActivityChipDescriptor {
  if (typeof descriptor.label !== "string" || !descriptor.label.trim()) {
    throw new TypeError("ActivityChip label must not be empty");
  }
  if (
    descriptor.accessibilityLabel !== undefined &&
    (typeof descriptor.accessibilityLabel !== "string" || !descriptor.accessibilityLabel.trim())
  ) {
    throw new TypeError("ActivityChip accessibilityLabel must not be empty");
  }
  const emphasis = descriptor.emphasis ?? activityChipDefaults.emphasis;
  if (emphasis !== "default" && emphasis !== "emphasis") {
    throw new TypeError(`Unsupported ActivityChip emphasis: ${String(emphasis)}`);
  }
  if (descriptor.expanded !== undefined && typeof descriptor.expanded !== "boolean") {
    throw new TypeError("ActivityChip expanded must be a boolean");
  }
  return {
    label: descriptor.label,
    accessibilityLabel: descriptor.accessibilityLabel ?? descriptor.label,
    emphasis,
    expanded: descriptor.expanded ?? activityChipDefaults.expanded,
  };
}

export type ActivityChipRecipe = Readonly<{
  slots: readonly ["root", "media", "label"];
  defaults: typeof activityChipDefaults;
  root: Readonly<{
    minHeight: number;
    maxWidth: number;
    radius: keyof typeof radius;
    borderWidth: number;
    gap: number;
    paddingStart: number;
    paddingEnd: number;
    pressedOpacity: number;
  }>;
  media: Readonly<{ size: number; radius: keyof typeof radius }>;
  label: Readonly<{ textVariant: TextVariant; fontWeight: FontWeightValue; maxLines: number }>;
  emphasis: Readonly<
    Record<ActivityChipEmphasis, Readonly<{ background: ColorReference; foreground: ColorReference; border: ColorReference }>>
  >;
}>;

export const activityChipRecipe = {
  slots: ["root", "media", "label"] as const,
  defaults: activityChipDefaults,
  // The 44pt minimum keeps the whole chip one touch target; the width cap keeps a header's side
  // controls visible on a 320pt screen (BurnTok header: back 44 + three actions ~150).
  root: {
    minHeight: control.minTouchTarget,
    maxWidth: 180,
    radius: "full",
    borderWidth: stroke.default,
    gap: spacing.xxs,
    // The media hugs the start edge like an avatar chip; the label end keeps the wider pill inset.
    paddingStart: spacing.xxs,
    paddingEnd: spacing.sm,
    pressedOpacity: opacity.pressed,
  },
  // 28 keeps a mascot legible inside the 44 row with 8pt of air; it is decorative (hidden from AT).
  media: { size: 28, radius: "full" },
  // One line: the chip is a glance status, the panel carries the long copy.
  label: { textVariant: "label", fontWeight: fontWeight.bold, maxLines: 1 },
  emphasis: {
    // A resting status sits on the header like a quiet surface; the border keeps its edge on canvas.
    default: {
      background: semanticColors.surface.default,
      foreground: semanticColors.content.primary,
      border: semanticColors.border.default,
    },
    // The brand action pair is the contrast-checked fill/content couple (same as a primary Button).
    emphasis: {
      background: semanticColors.action.brand.background,
      foreground: semanticColors.action.brand.content,
      border: semanticColors.action.brand.background,
    },
  },
} as const satisfies ActivityChipRecipe;
