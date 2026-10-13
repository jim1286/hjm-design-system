const warned = new Set();
export function isDevelopment() {
    const globals = globalThis;
    return typeof globals.__DEV__ === "boolean" ? globals.__DEV__ : globals.process?.env?.NODE_ENV !== "production";
}
/** Keep general component diagnostics independent of removed compatibility props. */
export function warnOnce(key, message) {
    if (!isDevelopment() || warned.has(key))
        return;
    warned.add(key);
    console.warn(`[@hjmds/react-native] ${message}`);
}
/** Prevent untyped callers from sending a removed visual override through host props. */
export function assertNoRemovedStyleProps(component, props, names) {
    const removed = names.filter(name => name in props);
    if (removed.length)
        throw new TypeError(`${component} ${removed.join("/")} were removed; use layoutStyle and semantic props`);
}
export function resetDiagnosticsForTest() { warned.clear(); }
//# sourceMappingURL=diagnostics.js.map