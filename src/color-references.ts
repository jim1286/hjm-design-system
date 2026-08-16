import {
  withAlpha,
  type AccentTone,
  type ThemeColors,
} from "./colors.js";

/**
 * Recipes point at semantic colors instead of copying a palette value.
 * Renderers resolve the reference with the active theme and accent map.
 */
export type ThemeColorReference = Readonly<{
  source: "theme";
  key: keyof ThemeColors;
  alpha?: number;
}>;

export type AccentColorReference = Readonly<{
  source: "accent";
  key: AccentTone;
  alpha?: number;
}>;

export type AccentFillReference = Readonly<{
  source: "accentFill";
  key: AccentTone;
  alpha?: number;
}>;

export type ColorReference =
  | ThemeColorReference
  | AccentColorReference
  | AccentFillReference;

export type ColorReferencePalette = Readonly<{
  theme: Readonly<ThemeColors>;
  /** Generic feedback roles. Product aliases belong in a separate product map. */
  statusAccents: Readonly<Record<AccentTone, string>>;
  /** Solid fills stay generic too; products may map their vocabulary separately. */
  statusAccentFills: Readonly<Record<AccentTone, string>>;
}>;

function assertAlpha(alpha: number): void {
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError("Color reference alpha must be between 0 and 1");
  }
}

export function themeColor<K extends keyof ThemeColors>(
  key: K,
  alpha?: number,
): Readonly<{ source: "theme"; key: K; alpha?: number }> {
  if (alpha === undefined) return { source: "theme", key };
  assertAlpha(alpha);
  return { source: "theme", key, alpha };
}

export function accentColor<K extends AccentTone>(
  key: K,
  alpha?: number,
): Readonly<{ source: "accent"; key: K; alpha?: number }> {
  if (alpha === undefined) return { source: "accent", key };
  assertAlpha(alpha);
  return { source: "accent", key, alpha };
}

export function solidAccentColor<K extends AccentTone>(
  key: K,
  alpha?: number,
): Readonly<{ source: "accentFill"; key: K; alpha?: number }> {
  if (alpha === undefined) return { source: "accentFill", key };
  assertAlpha(alpha);
  return { source: "accentFill", key, alpha };
}

/** Resolve a recipe color without coupling the recipe to CSS or React Native. */
export function resolveColorReference(
  reference: ColorReference,
  palette: ColorReferencePalette,
): string {
  const value =
    reference.source === "theme"
      ? palette.theme[reference.key]
      : reference.source === "accent"
        ? palette.statusAccents[reference.key]
        : palette.statusAccentFills[reference.key];

  if (typeof value !== "string") {
    throw new TypeError(
      `Missing ${reference.source} color for semantic key \"${reference.key}\"`,
    );
  }

  return reference.alpha === undefined || reference.alpha === 1
    ? value
    : withAlpha(value, reference.alpha);
}
