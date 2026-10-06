// Raw visual style props that survived 1.11 keep working (removing or throwing like Button would
// break 1.x callers in a minor) and warn once per component/prop until the next major. Per-render
// warnings were rejected because list rows flood Metro. See migration-native-legacy-removal.md.
const warned = new Set();
export function isDevelopment() {
    const globals = globalThis;
    // React Native defines __DEV__; Node tests fall back to NODE_ENV.
    if (typeof globals.__DEV__ === "boolean")
        return globals.__DEV__;
    return globals.process?.env?.NODE_ENV !== "production";
}
/** Development-only console.warn deduplicated by key for the lifetime of the JS runtime. */
export function warnOnce(key, message) {
    if (!isDevelopment() || warned.has(key))
        return;
    warned.add(key);
    console.warn(`[@hjmds/react-native] ${message}`);
}
/** Warns once per component/prop pair for each deprecated visual style prop the caller passed. */
export function warnDeprecatedStyleProps(component, props, replacement) {
    if (!isDevelopment())
        return;
    for (const [name, value] of Object.entries(props)) {
        if (value === undefined || value === null || value === false)
            continue;
        warnOnce(`${component}.${name}`, `${component}.${name} is deprecated and will be removed in the next major. ` +
            `Use ${replacement}. See docs/migration-native-legacy-removal.md.`);
    }
}
/** Test seam: the once-per-runtime memo would otherwise hide warnings across test cases. */
export function resetDeprecatedStyleWarningsForTest() {
    warned.clear();
}
//# sourceMappingURL=deprecated-style.js.map