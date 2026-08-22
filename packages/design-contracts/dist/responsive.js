import { breakpoint } from "./foundations.js";
/**
 * Width classes are shared semantic names, not device categories. Web uses
 * CSS pixels and Native uses density-independent points for the same numeric
 * thresholds.
 */
export const windowClassOrder = [
    "compact",
    "medium",
    "expanded",
    "wide",
];
const windowClasses = new Set(windowClassOrder);
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
/** Validates only the responsive map shape; the owning contract validates each value. */
export function validateResponsiveValue(value) {
    if (!isRecord(value)) {
        throw new TypeError("ResponsiveValue must be an object");
    }
    for (const key of Object.keys(value)) {
        if (!windowClasses.has(key)) {
            throw new TypeError(`Unsupported ResponsiveValue window class: ${key}`);
        }
    }
    if (!Object.hasOwn(value, "compact")) {
        throw new TypeError("ResponsiveValue requires a compact baseline");
    }
}
/** Resolves the shared width class at the inclusive foundation thresholds. */
export function resolveWindowClass(windowWidth) {
    if (typeof windowWidth !== "number" || !Number.isFinite(windowWidth)) {
        throw new TypeError("Window width must be a finite number");
    }
    if (windowWidth < 0) {
        throw new RangeError("Window width must not be negative");
    }
    for (let index = windowClassOrder.length - 1; index >= 0; index -= 1) {
        const windowClass = windowClassOrder[index];
        if (windowWidth >= breakpoint[windowClass])
            return windowClass;
    }
    // `breakpoint.compact` is zero, so every validated width returns above.
    return "compact";
}
/**
 * Resolves an exact class override or walks toward compact until a declared
 * value is found. The required compact baseline makes the result total.
 */
export function resolveResponsiveValue(value, windowClass) {
    validateResponsiveValue(value);
    if (!windowClasses.has(windowClass)) {
        throw new TypeError(`Unsupported window class: ${String(windowClass)}`);
    }
    const activeIndex = windowClassOrder.indexOf(windowClass);
    for (let index = activeIndex; index >= 0; index -= 1) {
        const candidate = windowClassOrder[index];
        if (Object.hasOwn(value, candidate)) {
            return value[candidate];
        }
    }
    // `validateResponsiveValue` guarantees the compact property exists.
    return value.compact;
}
//# sourceMappingURL=responsive.js.map