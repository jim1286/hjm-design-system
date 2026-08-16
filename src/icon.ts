import type { GlyphSize } from "./foundations.js";
import type { IconTone, IconWeight } from "./component-recipes.js";

/**
 * Shared semantic names. Renderers map these roles to their tree-shakeable SVG
 * or native glyph component instead of leaking a third-party icon name into a
 * product screen.
 */
export const semanticIconNames = [
  "add",
  "ai",
  "alert",
  "back",
  "calendar",
  "check",
  "chevronDown",
  "chevronEnd",
  "chevronStart",
  "chevronUp",
  "close",
  "compare",
  "copy",
  "delete",
  "download",
  "edit",
  "error",
  "favorite",
  "filter",
  "forward",
  "help",
  "home",
  "info",
  "lock",
  "menu",
  "more",
  "notifications",
  "pause",
  "play",
  "refresh",
  "search",
  "settings",
  "share",
  "success",
  "trendDown",
  "trendFlat",
  "trendUp",
  "upload",
  "user",
  "users",
  "visibility",
  "visibilityOff",
  "warning",
] as const;

export type SemanticIconName = (typeof semanticIconNames)[number];
export type IconDirection = "ltr" | "rtl";
export type IconDirectionality = "fixed" | "mirror-in-rtl";
export type IconTransform = "none" | "mirror-inline";

const logicalIconNames = new Set<string>([
  "back",
  "chevronEnd",
  "chevronStart",
  "forward",
]);

type IconAppearance = Readonly<{
  size?: GlyphSize;
  weight?: IconWeight;
  directionality?: IconDirectionality;
}>;

export type DecorativeIconDescriptor<Name extends string = SemanticIconName> =
  IconAppearance &
    Readonly<{
      name: Name;
      tone?: IconTone;
      decorative?: true;
      accessibilityLabel?: never;
    }>;

export type InformativeIconDescriptor<Name extends string = SemanticIconName> =
  IconAppearance &
    Readonly<{
      name: Name;
      /** Decorative is intentionally excluded because informative marks need contrast. */
      tone?: Exclude<IconTone, "decorative">;
      decorative: false;
      accessibilityLabel: string;
    }>;

export type IconDescriptor<Name extends string = SemanticIconName> =
  | DecorativeIconDescriptor<Name>
  | InformativeIconDescriptor<Name>;

export type ResolvedIconDescriptor<Name extends string = SemanticIconName> =
  | (Required<Omit<DecorativeIconDescriptor<Name>, "accessibilityLabel">> &
      Readonly<{ accessibilityLabel?: never }>)
  | Required<InformativeIconDescriptor<Name>>;

export function getIconDirectionality(name: string): IconDirectionality {
  return logicalIconNames.has(name) ? "mirror-in-rtl" : "fixed";
}

export function getIconTransform(
  directionality: IconDirectionality,
  direction: IconDirection,
): IconTransform {
  if (directionality !== "fixed" && directionality !== "mirror-in-rtl") {
    throw new TypeError(`Unsupported Icon directionality: ${String(directionality)}`);
  }
  if (direction !== "ltr" && direction !== "rtl") {
    throw new TypeError(`Unsupported Icon direction: ${String(direction)}`);
  }
  return directionality === "mirror-in-rtl" && direction === "rtl"
    ? "mirror-inline"
    : "none";
}

const sizes = new Set<GlyphSize>(["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"]);
const tones = new Set<IconTone>([
  "primary",
  "secondary",
  "decorative",
  "brand",
  "info",
  "success",
  "warning",
  "danger",
  "inverse",
]);
const weights = new Set<IconWeight>(["regular", "strong"]);

export function validateIconDescriptor<Name extends string>(
  descriptor: IconDescriptor<Name>,
): void {
  const runtimeName = (descriptor as Readonly<{ name?: unknown }>).name;
  const runtimeTone = (descriptor as Readonly<{ tone?: unknown }>).tone;
  const runtimeDecorative = (
    descriptor as Readonly<{ decorative?: unknown }>
  ).decorative;
  const runtimeLabel = (
    descriptor as Readonly<{ accessibilityLabel?: unknown }>
  ).accessibilityLabel;
  if (typeof runtimeName !== "string" || runtimeName.trim().length === 0) {
    throw new TypeError("Icon name must not be empty");
  }
  if (runtimeName !== runtimeName.trim()) {
    throw new TypeError("Icon name must not start or end with whitespace");
  }
  if (descriptor.size !== undefined && !sizes.has(descriptor.size)) {
    throw new TypeError(`Unsupported Icon size: ${String(descriptor.size)}`);
  }
  if (runtimeTone !== undefined && !tones.has(runtimeTone as IconTone)) {
    throw new TypeError(`Unsupported Icon tone: ${String(runtimeTone)}`);
  }
  if (descriptor.weight !== undefined && !weights.has(descriptor.weight)) {
    throw new TypeError(`Unsupported Icon weight: ${String(descriptor.weight)}`);
  }
  if (
    descriptor.directionality !== undefined &&
    descriptor.directionality !== "fixed" &&
    descriptor.directionality !== "mirror-in-rtl"
  ) {
    throw new TypeError(
      `Unsupported Icon directionality: ${String(descriptor.directionality)}`,
    );
  }
  if (
    runtimeDecorative !== undefined &&
    runtimeDecorative !== true &&
    runtimeDecorative !== false
  ) {
    throw new TypeError("Icon decorative must be a boolean when provided");
  }
  if (runtimeDecorative === false) {
    if (typeof runtimeLabel !== "string" || runtimeLabel.trim().length === 0) {
      throw new TypeError("Informative Icon accessibilityLabel must not be empty");
    }
    if (runtimeTone === "decorative") {
      throw new TypeError("Informative Icon cannot use the decorative tone");
    }
  } else if (runtimeLabel !== undefined) {
    throw new TypeError("Decorative Icon must not provide accessibilityLabel");
  }
}

export function resolveIconDescriptor<Name extends string>(
  descriptor: IconDescriptor<Name>,
): ResolvedIconDescriptor<Name> {
  validateIconDescriptor(descriptor);
  const common = {
    name: descriptor.name,
    size: descriptor.size ?? "md",
    tone: descriptor.tone ?? "secondary",
    weight: descriptor.weight ?? "regular",
    directionality:
      descriptor.directionality ?? getIconDirectionality(descriptor.name),
  } as const;
  if (descriptor.decorative === false) {
    return {
      ...common,
      decorative: false,
      accessibilityLabel: descriptor.accessibilityLabel,
    } as ResolvedIconDescriptor<Name>;
  }
  return {
    ...common,
    decorative: true,
  } as ResolvedIconDescriptor<Name>;
}
