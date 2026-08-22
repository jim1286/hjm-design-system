import type { ColorReferencePalette } from "./color-references.js";
import {
  ACCENTS,
  THEMES,
  accentFill,
  isThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./colors.js";

/**
 * Canonical logical direction. Existing public component-specific names stay
 * source-compatible as aliases of this type instead of redeclaring the union.
 */
export type DesignSystemDirection = "ltr" | "rtl";

/**
 * A continuous OS/user font-scale multiplier (iOS Dynamic Type, Android font
 * size, browser zoom) — not `ShowcaseTextScale`'s closed `1 | 1.5 | 2`, which
 * only names Showcase's five fixture stories, or `description-list.ts`'s
 * local layout clamp. This is the single upstream signal both now consume.
 */
export type DesignSystemTextScale = number;

export type DesignSystemEnvironmentInput = Readonly<{
  theme?: ThemePreference;
  direction?: DesignSystemDirection;
  textScale?: DesignSystemTextScale;
  reducedMotion?: boolean;
}>;

export const designSystemEnvironmentDefaults = {
  theme: "system",
  direction: "ltr",
  textScale: 1,
  reducedMotion: false,
} as const satisfies Readonly<{
  theme: ThemePreference;
  direction: DesignSystemDirection;
  textScale: DesignSystemTextScale;
  reducedMotion: boolean;
}>;

export type ResolvedDesignSystemEnvironment = Readonly<{
  theme: ResolvedTheme;
  direction: DesignSystemDirection;
  textScale: DesignSystemTextScale;
  reducedMotion: boolean;
}>;

export type ResolveDesignSystemEnvironmentOptions = Readonly<{
  /**
   * The platform's current OS-level scheme, consulted only when `theme`
   * resolves to `"system"`. Renderers detect this themselves
   * (`Appearance.getColorScheme()`, `matchMedia('(prefers-color-scheme)')`)
   * — this package never queries the OS.
   */
  systemTheme: ResolvedTheme;
  /** Optional OS/renderer signals used when neither input nor a parent supplies the axis. */
  systemDirection?: DesignSystemDirection;
  systemTextScale?: DesignSystemTextScale;
  systemReducedMotion?: boolean;
  /** A nested renderer inherits the already-resolved parent before consulting OS defaults. */
  parent?: ResolvedDesignSystemEnvironment;
}>;

export type DesignSystemProviderValue = Readonly<{
  environment: ResolvedDesignSystemEnvironment;
  /** Palette consumed directly by `resolveColorReference`. */
  palette: ColorReferencePalette;
}>;

function assertBoolean(value: boolean, field: string): void {
  if (typeof value !== "boolean") {
    throw new TypeError(`DesignSystemEnvironment ${field} must be a boolean`);
  }
}

function assertDirection(value: DesignSystemDirection, field: string): void {
  if (value !== "ltr" && value !== "rtl") {
    throw new TypeError(`Unsupported DesignSystemEnvironment ${field}: ${String(value)}`);
  }
}

function assertTextScale(value: DesignSystemTextScale, field: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      `DesignSystemEnvironment ${field} must be a finite number greater than 0`,
    );
  }
}

export function validateDesignSystemEnvironmentInput(
  input: DesignSystemEnvironmentInput,
): void {
  if (input.theme !== undefined && !isThemePreference(input.theme)) {
    throw new TypeError(`Unsupported DesignSystemEnvironment theme: ${String(input.theme)}`);
  }
  if (
    input.direction !== undefined &&
    input.direction !== "ltr" &&
    input.direction !== "rtl"
  ) {
    throw new TypeError(
      `Unsupported DesignSystemEnvironment direction: ${String(input.direction)}`,
    );
  }
  if (input.textScale !== undefined) {
    assertTextScale(input.textScale, "textScale");
  }
  if (input.reducedMotion !== undefined) {
    assertBoolean(input.reducedMotion, "reducedMotion");
  }
}

/**
 * A parent has already crossed the system-preference boundary. Unlike the
 * partial input validator, this rejects `"system"`, missing axes, and every
 * malformed resolved value instead of silently resolving them again.
 */
export function validateResolvedDesignSystemEnvironment(
  environment: ResolvedDesignSystemEnvironment,
): void {
  if (environment.theme !== "light" && environment.theme !== "dark") {
    throw new TypeError(
      `Unsupported ResolvedDesignSystemEnvironment theme: ${String(environment.theme)}`,
    );
  }
  assertDirection(environment.direction, "parent direction");
  assertTextScale(environment.textScale, "parent textScale");
  assertBoolean(environment.reducedMotion, "parent reducedMotion");
}

/**
 * Merges partial signals with safe defaults and resolves `"system"` against
 * the renderer-supplied `systemTheme`. This — not a React/RN context, which
 * this package cannot own — is the entire portable contract behind antd
 * `ConfigProvider`: see docs/design-system-provider.md for what was
 * deliberately left to the renderer.
 */
export function resolveDesignSystemEnvironment(
  input: DesignSystemEnvironmentInput,
  options: ResolveDesignSystemEnvironmentOptions,
): ResolvedDesignSystemEnvironment {
  validateDesignSystemEnvironmentInput(input);
  if (options.systemTheme !== "light" && options.systemTheme !== "dark") {
    throw new TypeError(`Unsupported DesignSystemEnvironment systemTheme: ${String(options.systemTheme)}`);
  }
  if (options.systemDirection !== undefined) {
    assertDirection(options.systemDirection, "systemDirection");
  }
  if (options.systemTextScale !== undefined) {
    assertTextScale(options.systemTextScale, "systemTextScale");
  }
  if (options.systemReducedMotion !== undefined) {
    assertBoolean(options.systemReducedMotion, "systemReducedMotion");
  }
  if (options.parent !== undefined) {
    validateResolvedDesignSystemEnvironment(options.parent);
  }

  const theme =
    input.theme ?? options.parent?.theme ?? designSystemEnvironmentDefaults.theme;
  return {
    theme: theme === "system" ? options.systemTheme : theme,
    direction:
      input.direction ??
      options.parent?.direction ??
      options.systemDirection ??
      designSystemEnvironmentDefaults.direction,
    textScale:
      input.textScale ??
      options.parent?.textScale ??
      options.systemTextScale ??
      designSystemEnvironmentDefaults.textScale,
    reducedMotion:
      input.reducedMotion ??
      options.parent?.reducedMotion ??
      options.systemReducedMotion ??
      designSystemEnvironmentDefaults.reducedMotion,
  };
}

/**
 * Resolves the portable Provider value without owning React/RN Context. A
 * renderer stores this object in its own context and feeds `palette` directly
 * to recipe color resolution.
 */
export function resolveDesignSystemProviderValue(
  input: DesignSystemEnvironmentInput,
  options: ResolveDesignSystemEnvironmentOptions,
): DesignSystemProviderValue {
  const environment = resolveDesignSystemEnvironment(input, options);
  return {
    environment,
    palette: {
      theme: THEMES[environment.theme],
      statusAccents: ACCENTS[environment.theme],
      statusAccentFills: accentFill,
    },
  };
}
