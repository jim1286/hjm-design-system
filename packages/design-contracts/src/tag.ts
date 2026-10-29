import {
  resolveColorReference,
  type ColorReferencePalette,
} from "./color-references.js";
import { semanticColors } from "./semantic-colors.js";
import { fontWeight, spacing, stroke } from "./foundations.js";

export type TagTone = "neutral" | "info" | "success" | "attention" | "brand";

export type TagVariant = "default" | "outline";

export const tagDefaults = {
  tone: "neutral",
  variant: "default",
} as const satisfies Readonly<{ tone: TagTone; variant: TagVariant }>;

/**
 * A single piece of static metadata (a position, a grade, a season). Tag has
 * no interaction axis at all — no selected, no pressed, no closable. Removing
 * or toggling a tag is deselection, which belongs to `Chip`.
 */
export type TagDescriptor = Readonly<{
  label: string;
  tone?: TagTone;
  variant?: TagVariant;
}>;

export type ResolvedTagDescriptor = Readonly<{
  label: string;
  tone: TagTone;
  variant: TagVariant;
}>;

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Tag ${field} must not be empty`);
  }
}

const supportedTones: readonly TagTone[] = [
  "neutral",
  "info",
  "success",
  "attention",
  "brand",
];

export function validateTagDescriptor(descriptor: TagDescriptor): void {
  assertCopy(descriptor.label, "label");
  if (descriptor.variant !== undefined && !["default", "outline"].includes(descriptor.variant)) {
    throw new TypeError(`Unsupported Tag variant: ${String(descriptor.variant)}`);
  }
  if (
    descriptor.tone !== undefined &&
    !supportedTones.includes(descriptor.tone)
  ) {
    throw new TypeError(`Unsupported Tag tone: ${String(descriptor.tone)}`);
  }
}

export function resolveTagDescriptor(
  descriptor: TagDescriptor,
): ResolvedTagDescriptor {
  validateTagDescriptor(descriptor);
  return {
    label: descriptor.label,
    tone: descriptor.tone ?? tagDefaults.tone,
    variant: descriptor.variant ?? tagDefaults.variant,
  };
}

/** Static metadata has no focus or press contract, including the outline capsule. */
export const tagRecipe = {
  slots: ["root", "label"] as const,
  defaults: tagDefaults,
  tones: {
    // Same as badgeRecipe: a canvas plate without a border vanished on the canvas (2026-10-17 review E3).
    neutral: {
      background: semanticColors.canvas,
      content: semanticColors.content.secondary,
      border: semanticColors.border.default,
    },
    brand: {
      background: semanticColors.canvas,
      content: semanticColors.content.brand,
      border: semanticColors.border.default,
    },
    info: {
      background: semanticColors.canvas,
      content: semanticColors.feedback.info.foreground,
      border: semanticColors.feedback.info.border,
    },
    success: {
      background: semanticColors.feedback.success.badgeBackground,
      content: semanticColors.feedback.success.foreground,
      border: semanticColors.feedback.success.border,
    },
    attention: {
      background: semanticColors.feedback.attention.badgeBackground,
      content: semanticColors.feedback.attention.foreground,
      border: semanticColors.feedback.attention.border,
    },
  },
  size: {
    // Static metadata still participates in Dynamic Type. A fixed 20px frame
    // clips the label at accessibility sizes; minHeight preserves the compact
    // base shape while allowing the intrinsic line box to grow.
    minHeight: 20,
    paddingHorizontal: spacing.xxs,
    gap: spacing.xxs,
    textVariant: "caption",
    fontWeight: fontWeight.medium,
  },
  // Profile fact rails need breathing room without a colored plate (2026-10-29 approved preview).
  outline: {
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    radius: "full",
    fontWeight: fontWeight.regular,
    background: "transparent",
    content: semanticColors.content.primary,
  },
  radius: "sm",
  borderWidth: stroke.default,
} as const;

export type ResolvedTagPresentation = Readonly<{
  background: string;
  content: string;
  border: string | null;
}>;

/** Resolve the same Tag recipe for non-CSS renderers. */
export function resolveTagPresentation(
  tone: TagTone,
  palette: ColorReferencePalette,
  variant: TagVariant = tagDefaults.variant,
): ResolvedTagPresentation {
  const contract = tagRecipe.tones[tone];
  return {
    background: variant === "outline" ? "transparent" : resolveColorReference(contract.background, palette),
    content: resolveColorReference(variant === "outline" && tone === "neutral" ? tagRecipe.outline.content : contract.content, palette),
    border:
      contract.border === null
        ? null
        : resolveColorReference(contract.border, palette),
  };
}
