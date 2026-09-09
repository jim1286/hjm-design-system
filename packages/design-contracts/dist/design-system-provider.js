import { control } from "./foundations.js";
import { ACCENTS, THEMES, accentFill, isThemePreference, } from "./colors.js";
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
export function visibleControlHeight(recipeHeight, minimumVisualTarget) {
    return minimumVisualTarget ? Math.max(recipeHeight, control.minTouchTarget) : recipeHeight;
}
export const designSystemEnvironmentDefaults = {
    theme: "system",
    direction: "ltr",
    textScale: 1,
    reducedMotion: false,
    minimumVisualTarget: false,
};
const themeColorKeys = Object.keys(THEMES.light);
const accentColorKeys = Object.keys(ACCENTS.light);
const sixDigitHexColor = /^#[0-9a-f]{6}$/i;
function assertColorRecord(value, keys, field) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError(`DesignSystemProviderValue ${field} must be a color record`);
    }
    const record = value;
    for (const key of keys) {
        const color = record[key];
        if (typeof color !== "string" || !sixDigitHexColor.test(color)) {
            throw new TypeError(`DesignSystemProviderValue ${field}.${key} must be a six-digit hex color`);
        }
    }
}
/**
 * Runtime boundary for reviewed full product palettes supplied to a renderer.
 * Partial token overrides remain unsupported: every semantic role required by
 * a recipe must be present, and alpha composition requires six-digit hex.
 */
export function validateDesignSystemProviderValue(value) {
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
    assertColorRecord(palette.statusAccents, accentColorKeys, "palette.statusAccents");
    assertColorRecord(palette.statusAccentFills, accentColorKeys, "palette.statusAccentFills");
}
function assertBoolean(value, field) {
    if (typeof value !== "boolean") {
        throw new TypeError(`DesignSystemEnvironment ${field} must be a boolean`);
    }
}
function assertDirection(value, field) {
    if (value !== "ltr" && value !== "rtl") {
        throw new TypeError(`Unsupported DesignSystemEnvironment ${field}: ${String(value)}`);
    }
}
function assertTextScale(value, field) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new RangeError(`DesignSystemEnvironment ${field} must be a finite number greater than 0`);
    }
}
export function validateDesignSystemEnvironmentInput(input) {
    if (input.theme !== undefined && !isThemePreference(input.theme)) {
        throw new TypeError(`Unsupported DesignSystemEnvironment theme: ${String(input.theme)}`);
    }
    if (input.direction !== undefined &&
        input.direction !== "ltr" &&
        input.direction !== "rtl") {
        throw new TypeError(`Unsupported DesignSystemEnvironment direction: ${String(input.direction)}`);
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
}
/**
 * A parent has already crossed the system-preference boundary. Unlike the
 * partial input validator, this rejects `"system"`, missing axes, and every
 * malformed resolved value instead of silently resolving them again.
 */
export function validateResolvedDesignSystemEnvironment(environment) {
    if (environment.theme !== "light" && environment.theme !== "dark") {
        throw new TypeError(`Unsupported ResolvedDesignSystemEnvironment theme: ${String(environment.theme)}`);
    }
    assertDirection(environment.direction, "parent direction");
    assertTextScale(environment.textScale, "parent textScale");
    assertBoolean(environment.reducedMotion, "parent reducedMotion");
    assertBoolean(environment.minimumVisualTarget, "parent minimumVisualTarget");
}
/**
 * Merges partial signals with safe defaults and resolves `"system"` against
 * the renderer-supplied `systemTheme`. This — not a React/RN context, which
 * this package cannot own — is the entire portable contract behind antd
 * `ConfigProvider`: see docs/design-system-provider.md for what was
 * deliberately left to the renderer.
 */
export function resolveDesignSystemEnvironment(input, options) {
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
    const theme = input.theme ?? options.parent?.theme ?? designSystemEnvironmentDefaults.theme;
    return {
        theme: theme === "system" ? options.systemTheme : theme,
        direction: input.direction ??
            options.parent?.direction ??
            options.systemDirection ??
            designSystemEnvironmentDefaults.direction,
        textScale: input.textScale ??
            options.parent?.textScale ??
            options.systemTextScale ??
            designSystemEnvironmentDefaults.textScale,
        reducedMotion: input.reducedMotion ??
            options.parent?.reducedMotion ??
            options.systemReducedMotion ??
            designSystemEnvironmentDefaults.reducedMotion,
        minimumVisualTarget: input.minimumVisualTarget ??
            options.parent?.minimumVisualTarget ??
            designSystemEnvironmentDefaults.minimumVisualTarget,
    };
}
/**
 * Resolves the portable Provider value without owning React/RN Context. A
 * renderer stores this object in its own context and feeds `palette` directly
 * to recipe color resolution.
 */
export function resolveDesignSystemProviderValue(input, options) {
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
//# sourceMappingURL=design-system-provider.js.map