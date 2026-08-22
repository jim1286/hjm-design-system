import type { ColorReference } from "./color-references.js";
import { radius } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

export const progressRecipe = {
  slots: ["root", "track", "indicator", "label", "value"] as const,
  defaults: { size: "medium", tone: "brand" },
  sizes: { small: 4, medium: 8, large: 12 },
  tones: {
    brand: semanticColors.content.brand,
    success: semanticColors.feedback.success.foreground,
    warning: semanticColors.feedback.warning.foreground,
    danger: semanticColors.content.danger,
  },
  track: semanticColors.surface.sunken,
  radius: "full",
} as const satisfies {
  radius: keyof typeof radius;
  slots: readonly string[];
  defaults: { size: "small" | "medium" | "large"; tone: "brand" | "success" | "warning" | "danger" };
  sizes: Record<"small" | "medium" | "large", number>;
  tones: Record<"brand" | "success" | "warning" | "danger", ColorReference>;
  track: ColorReference;
};

export type ProgressSize = keyof typeof progressRecipe.sizes;
export type ProgressTone = keyof typeof progressRecipe.tones;
