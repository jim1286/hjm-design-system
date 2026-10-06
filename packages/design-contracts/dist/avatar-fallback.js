/**
 * Initials shown when an Avatar has no image: the first character of the first and the last word,
 * counted in code points, upper-cased for the current locale. `provided` (Native `initials`) wins and
 * keeps at most three code points.
 *
 * 2026-10-06 follow-up: Web took the first two words and Native the first and last, so the same
 * "Kim Min Jun" read "KM" on Web and "KJ" on Native. First+last was kept because the family and
 * given names sit at the two ends of a name with middle names; the first-two rule shows a middle
 * name instead. Native also indexed UTF-16 units and could split a surrogate pair; code points fix it.
 */
export function resolveAvatarInitials(name, provided) {
    const supplied = provided?.trim();
    if (supplied)
        return Array.from(supplied).slice(0, 3).join("").toLocaleUpperCase();
    const parts = name.trim().split(/\s+/u).filter(Boolean);
    if (parts.length === 0)
        throw new TypeError("Avatar name must not be empty");
    const first = Array.from(parts[0])[0] ?? "";
    const last = parts.length > 1 ? Array.from(parts.at(-1))[0] ?? "" : "";
    return `${first}${last}`.toLocaleUpperCase();
}
export function resolveBlobatarFallback(options) {
    if (typeof options.seed !== "string" || !options.seed.trim())
        throw new TypeError("Avatar seed must not be empty");
    const expression = options.expression ?? "idle";
    if (expression !== "idle" && expression !== "happy")
        throw new TypeError("Unsupported avatar expression");
    // Preserve exact identifiers: normalizing case would merge distinct accounts.
    return { seed: options.seed, expression };
}
export function resolveBlobatarMotion(options) {
    resolveBlobatarFallback({ seed: options.seed });
    const expression = options.expression ?? 'idle';
    if (!['idle', 'happy', 'sad', 'surprised', 'wink', 'sleepy', 'thinking'].includes(expression))
        throw new TypeError('Unsupported animated avatar expression');
    return { seed: options.seed, expression, active: options.active ?? false, visible: options.visible ?? true };
}
//# sourceMappingURL=avatar-fallback.js.map