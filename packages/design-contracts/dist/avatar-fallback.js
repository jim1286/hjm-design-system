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