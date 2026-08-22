import type { SemanticIconName } from "./icon.js";
import type { IconTone } from "./component-recipes.js";
import { semanticColors } from "./semantic-colors.js";

export type ImageFit = "cover" | "contain" | "fill";
export type ImageLoadStatus = "idle" | "loading" | "loaded" | "error";

export const imageDefaults = {
  fit: "cover",
} as const satisfies Readonly<{ fit: ImageFit }>;

type ImageAppearance = Readonly<{
  src: string;
  /** Intrinsic dimensions reserve layout space before the asset loads. */
  width: number;
  height: number;
  fit?: ImageFit;
}>;

/**
 * Same shape as Icon's decorative/informative split: a picture that only
 * repeats a caption or label already visible nearby stays decorative, and
 * only a self-sufficient picture requires localized alt copy.
 */
export type DecorativeImageDescriptor = ImageAppearance &
  Readonly<{ decorative?: true; accessibilityLabel?: never }>;

export type InformativeImageDescriptor = ImageAppearance &
  Readonly<{ decorative: false; accessibilityLabel: string }>;

export type ImageDescriptor =
  | DecorativeImageDescriptor
  | InformativeImageDescriptor;

export type ResolvedImageDescriptor =
  | (Required<Omit<DecorativeImageDescriptor, "accessibilityLabel">> &
      Readonly<{ accessibilityLabel?: never }>)
  | Required<InformativeImageDescriptor>;

const fits: readonly ImageFit[] = ["cover", "contain", "fill"];

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Image ${field} must not be empty`);
  }
}

function assertDimension(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`Image ${field} must be a positive finite number`);
  }
}

export function validateImageDescriptor(descriptor: ImageDescriptor): void {
  assertCopy(descriptor.src, "src");
  assertDimension(descriptor.width, "width");
  assertDimension(descriptor.height, "height");
  if (descriptor.fit !== undefined && !fits.includes(descriptor.fit)) {
    throw new TypeError(`Unsupported Image fit: ${String(descriptor.fit)}`);
  }
  const runtimeDecorative = (
    descriptor as Readonly<{ decorative?: unknown }>
  ).decorative;
  const runtimeLabel = (
    descriptor as Readonly<{ accessibilityLabel?: unknown }>
  ).accessibilityLabel;
  if (
    runtimeDecorative !== undefined &&
    runtimeDecorative !== true &&
    runtimeDecorative !== false
  ) {
    throw new TypeError("Image decorative must be a boolean when provided");
  }
  if (runtimeDecorative === false) {
    if (typeof runtimeLabel !== "string" || runtimeLabel.trim().length === 0) {
      throw new TypeError(
        "Informative Image accessibilityLabel must not be empty",
      );
    }
  } else if (runtimeLabel !== undefined) {
    throw new TypeError("Decorative Image must not provide accessibilityLabel");
  }
}

export function resolveImageDescriptor(
  descriptor: ImageDescriptor,
): ResolvedImageDescriptor {
  validateImageDescriptor(descriptor);
  const common = {
    src: descriptor.src,
    width: descriptor.width,
    height: descriptor.height,
    fit: descriptor.fit ?? imageDefaults.fit,
  } as const;
  if (descriptor.decorative === false) {
    return {
      ...common,
      decorative: false,
      accessibilityLabel: descriptor.accessibilityLabel,
    } as ResolvedImageDescriptor;
  }
  return { ...common, decorative: true } as ResolvedImageDescriptor;
}

/**
 * Reserves layout space ahead of load so a slow asset never shifts
 * surrounding content — the same problem `width`/`height` solve for
 * `next/image`, translated without a bundler dependency.
 */
export function resolveImageAspectRatio(width: number, height: number): number {
  assertDimension(width, "width");
  assertDimension(height, "height");
  return width / height;
}

/**
 * The fallback node on `error` always carries the resolved
 * `accessibilityLabel`, never a generic "broken image" string. An
 * informative picture's meaning does not disappear because the asset
 * failed to load; only its visual form changes.
 */
export function resolveImageFallbackAccessibilityLabel(
  descriptor: ResolvedImageDescriptor,
): string | undefined {
  return descriptor.decorative ? undefined : descriptor.accessibilityLabel;
}

const errorIconName: SemanticIconName = "error";
const fallbackIconTone: IconTone = "secondary";

/**
 * Web `object-fit` and RN `resizeMode` diverge only in the `fill` case;
 * `fills` is the platform-neutral name and `nativeResizeModes` is the one
 * translation renderers need, kept here instead of re-derived per product.
 */
export const nativeResizeModes = {
  cover: "cover",
  contain: "contain",
  fill: "stretch",
} as const satisfies Record<ImageFit, string>;

export const imageRecipe = {
  slots: ["root", "image", "placeholder", "fallbackIcon"] as const,
  defaults: imageDefaults,
  fits,
  placeholder: {
    background: semanticColors.surface.sunken,
  },
  fallback: {
    background: semanticColors.surface.sunken,
    icon: { name: errorIconName, tone: fallbackIconTone },
  },
  radius: "md",
} as const;
