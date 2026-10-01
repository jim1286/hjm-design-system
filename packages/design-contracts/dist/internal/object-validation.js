// Anchored overlay contracts share shape validation, but preserve their public
// component-specific error messages instead of merging Tooltip/Popover semantics.
export function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function rejectUnknownKeys(value, allowed, field, component) {
    for (const key of Object.keys(value)) {
        if (!allowed.has(key))
            throw new TypeError(`Unsupported ${component} ${field} field: ${key}`);
    }
}
//# sourceMappingURL=object-validation.js.map