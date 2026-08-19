import { isThemePreference } from "./colors.js";
export const designSystemEnvironmentDefaults = {
    theme: "system",
    direction: "ltr",
    textScale: 1,
    reducedMotion: false,
};
function assertBoolean(value, field) {
    if (typeof value !== "boolean") {
        throw new TypeError(`DesignSystemEnvironment ${field} must be a boolean`);
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
        if (typeof input.textScale !== "number" ||
            !Number.isFinite(input.textScale) ||
            input.textScale <= 0) {
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
export function resolveDesignSystemEnvironment(input, options) {
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
//# sourceMappingURL=design-system-provider.js.map