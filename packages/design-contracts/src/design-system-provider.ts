import type { ColorReferencePalette } from "./color-references.js";
import { control, largeTextThreshold } from "./foundations.js";
import {
  ACCENTS,
  THEMES,
  accentFill,
  isThemePreference,
  type ResolvedTheme,
  type ThemeColors,
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

/**
 * Whether a resolved `textScale` has crossed into large-text layout. A
 * stylesheet cannot compare numbers, so the provider resolves the axis once and
 * publishes the result for surfaces that can only match a flag (#20).
 */
export function isLargeTextScale(textScale: DesignSystemTextScale): boolean {
  return Number.isFinite(textScale) && textScale >= largeTextThreshold;
}

/**
 * Visible height a compact control paints under a product's target-size policy.
 *
 * The compact recipes stay at 36 and reach the 44pt target through hit slop,
 * which satisfies WCAG 2.5.8 but not the stricter iOS/Android guidance some
 * products commit to. `minimumVisualTarget` turns that commitment into one
 * resolved axis, so both renderers compute the same geometry instead of each
 * consumer re-adding `minHeight` in product styles. It lives beside the axis
 * rather than in `foundations` because it is a policy over a token, not a token.
 */
export function visibleControlHeight(
  recipeHeight: number,
  minimumVisualTarget: boolean,
): number {
  return minimumVisualTarget ? Math.max(recipeHeight, control.minTouchTarget) : recipeHeight;
}

/**
 * 한 화면 안에서 목록·메뉴·표가 각각 다른 밀도로 그려지던 문제를 하나의 축으로 모은다.
 * 지금까지는 `ListRow density`, `Menu density`, DataTable의 행 높이가 서로 모르는 값이라
 * 제품이 세 군데를 따로 맞췄다. 컴포넌트의 명시적 prop이 언제나 이 축을 이긴다 —
 * 전역값은 기본이지 강제가 아니다.
 *
 * OS 신호가 없다. 밀도는 제품의 입장(같은 화면에 얼마나 담을 것인가)이지 사용자 설정이
 * 아니라서 `system*` 짝을 두지 않았다. 반대로 큰 글자 설정은 사용자 설정이므로
 * `textScale`이 큰 상태에서 `compact`를 쓰는 것은 제품이 스스로 막아야 한다.
 */
export type DesignSystemDensity = "comfortable" | "compact";

/**
 * 전역 밀도를 컴포넌트마다 다른 밀도 어휘로 옮긴다. 컴포넌트의 명시적 prop이 언제나
 * 이긴다 — 전역값은 기본이지 강제가 아니다. 어휘를 하나로 통일하지 않은 이유: 목록의
 * `relaxed`와 표의 `regular`는 같은 말이 아니고, 억지로 합치면 둘 중 하나가 거짓말을 한다.
 */
export function resolveDensityDefault<Comfortable extends string, Compact extends string>(
  density: DesignSystemDensity,
  vocabulary: Readonly<{ comfortable: Comfortable; compact: Compact }>,
): Comfortable | Compact {
  return density === "compact" ? vocabulary.compact : vocabulary.comfortable;
}

export type DesignSystemEnvironmentInput = Readonly<{
  theme?: ThemePreference;
  direction?: DesignSystemDirection;
  textScale?: DesignSystemTextScale;
  reducedMotion?: boolean;
  /**
   * Paint the minimum touch target as visible control geometry instead of
   * reaching it with hit slop. This is a product accessibility stance, not an
   * OS signal, so it has no `system*` counterpart.
   */
  minimumVisualTarget?: boolean;
  /** Default row/menu/table density for everything below this provider. */
  density?: DesignSystemDensity;
}>;

export const designSystemEnvironmentDefaults = {
  theme: "system",
  direction: "ltr",
  textScale: 1,
  reducedMotion: false,
  minimumVisualTarget: false,
  density: "comfortable",
} as const satisfies Readonly<{
  theme: ThemePreference;
  direction: DesignSystemDirection;
  textScale: DesignSystemTextScale;
  reducedMotion: boolean;
  minimumVisualTarget: boolean;
  density: DesignSystemDensity;
}>;

export type ResolvedDesignSystemEnvironment = Readonly<{
  theme: ResolvedTheme;
  direction: DesignSystemDirection;
  textScale: DesignSystemTextScale;
  reducedMotion: boolean;
  minimumVisualTarget: boolean;
  density: DesignSystemDensity;
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
  /**
   * Product brand colors layered over the HJM semantic keys. The key set is
   * unchanged, so recipes and contrast rules keep applying. Without this entry
   * point a consumer has to build its own token layer and override the CSS
   * variables, which is a copy of the canonical palette. Only the supplied
   * keys are replaced; the rest keep the HJM defaults.
   */
  brandPalette?: Readonly<Partial<Record<ResolvedTheme, Readonly<Partial<ThemeColors>>>>>;
  /** A nested renderer inherits the already-resolved parent before consulting OS defaults. */
  parent?: ResolvedDesignSystemEnvironment;
}>;

export type DesignSystemProviderValue = Readonly<{
  environment: ResolvedDesignSystemEnvironment;
  /** Palette consumed directly by `resolveColorReference`. */
  palette: ColorReferencePalette;
}>;

const themeColorKeys = Object.keys(THEMES.light) as readonly (keyof typeof THEMES.light)[];
const accentColorKeys = Object.keys(ACCENTS.light) as readonly (keyof typeof ACCENTS.light)[];
const sixDigitHexColor = /^#[0-9a-f]{6}$/i;

function assertColorRecord(
  value: unknown,
  keys: readonly string[],
  field: string,
): asserts value is Readonly<Record<string, string>> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`DesignSystemProviderValue ${field} must be a color record`);
  }
  const record = value as Readonly<Record<string, unknown>>;
  for (const key of keys) {
    const color = record[key];
    if (typeof color !== "string" || !sixDigitHexColor.test(color)) {
      throw new TypeError(
        `DesignSystemProviderValue ${field}.${key} must be a six-digit hex color`,
      );
    }
  }
}

/**
 * Runtime boundary for the resolved palette a renderer receives, including one
 * merged from a partial `brandPalette`: after merging, every semantic role a
 * recipe reads must be present, and alpha composition requires six-digit hex.
 * Brand rules: docs/brand-boundary.md.
 */
export function validateDesignSystemProviderValue(
  value: DesignSystemProviderValue,
): void {
  if (value === null || typeof value !== "object") {
    throw new TypeError("DesignSystemProviderValue must be an object");
  }
  if (value.environment === null || typeof value.environment !== "object") {
    throw new TypeError("DesignSystemProviderValue environment must be an object");
  }
  validateResolvedDesignSystemEnvironment(value.environment);
  const palette = value.palette;
  if (palette === null || typeof palette !== "object") {
    throw new TypeError("DesignSystemProviderValue palette must be an object");
  }
  assertColorRecord(palette.theme, themeColorKeys, "palette.theme");
  assertColorRecord(
    palette.statusAccents,
    accentColorKeys,
    "palette.statusAccents",
  );
  assertColorRecord(
    palette.statusAccentFills,
    accentColorKeys,
    "palette.statusAccentFills",
  );
}

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

function assertDensity(value: unknown, field: string): asserts value is DesignSystemDensity {
  if (value !== "comfortable" && value !== "compact") {
    throw new TypeError(`Unsupported DesignSystemEnvironment ${field}: ${String(value)}`);
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
  if (input.minimumVisualTarget !== undefined) {
    assertBoolean(input.minimumVisualTarget, "minimumVisualTarget");
  }
  if (input.density !== undefined) {
    assertDensity(input.density, "density");
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
  assertBoolean(environment.minimumVisualTarget, "parent minimumVisualTarget");
  assertDensity(environment.density, "parent density");
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
    minimumVisualTarget:
      input.minimumVisualTarget ??
      options.parent?.minimumVisualTarget ??
      designSystemEnvironmentDefaults.minimumVisualTarget,
    density:
      input.density ??
      options.parent?.density ??
      designSystemEnvironmentDefaults.density,
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
  const brandOverride = options.brandPalette?.[environment.theme];
  const value = {
    environment,
    palette: {
      theme: brandOverride === undefined
        ? THEMES[environment.theme]
        : { ...THEMES[environment.theme], ...brandOverride },
      statusAccents: ACCENTS[environment.theme],
      statusAccentFills: accentFill,
    },
  };
  validateDesignSystemProviderValue(value);
  return value;
}
