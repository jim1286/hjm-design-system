import { isThemePreference, type ResolvedTheme, type ThemePreference } from "./colors.js";

/**
 * Canonical logical direction. Several modules already redeclare this exact
 * union locally (`BottomNavigationDirection`, `TabsDirection`,
 * `SelectionDirection`, `IconDirection`, `ShowcaseDirection`) — see
 * docs/design-system-provider.md for why this module does not edit those
 * (shared-file boundary) but names the duplication so a future pass can
 * migrate them to this one.
 */
export type DesignSystemDirection = "ltr" | "rtl";

/**
 * A continuous OS/user font-scale multiplier (iOS Dynamic Type, Android font
 * size, browser zoom) — not `ShowcaseTextScale`'s closed `1 | 1.5 | 2`, which
 * only names Showcase's five fixture stories, or `description-list.ts`'s
 * local `fontScale` clamp, which is that one component's own layout math.
 * This is the single upstream signal both would read from once wired.
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
}>;

function assertBoolean(value: boolean, field: string): void {
  if (typeof value !== "boolean") {
    throw new TypeError(`DesignSystemEnvironment ${field} must be a boolean`);
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
    if (
      typeof input.textScale !== "number" ||
      !Number.isFinite(input.textScale) ||
      input.textScale <= 0
    ) {
      throw new RangeError("DesignSystemEnvironment textScale must be a finite number greater than 0");
    }
  }
  if (input.reducedMotion !== undefined) {
    assertBoolean(input.reducedMotion, "reducedMotion");
  }
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
  const theme = input.theme ?? designSystemEnvironmentDefaults.theme;
  return {
    theme: theme === "system" ? options.systemTheme : theme,
    direction: input.direction ?? designSystemEnvironmentDefaults.direction,
    textScale: input.textScale ?? designSystemEnvironmentDefaults.textScale,
    reducedMotion: input.reducedMotion ?? designSystemEnvironmentDefaults.reducedMotion,
  };
}
