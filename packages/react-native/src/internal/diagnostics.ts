type DevGlobals = { __DEV__?: boolean; process?: { env?: { NODE_ENV?: string } } };
const warned = new Set<string>();

export function isDevelopment(): boolean {
  const globals = globalThis as DevGlobals;
  return typeof globals.__DEV__ === "boolean" ? globals.__DEV__ : globals.process?.env?.NODE_ENV !== "production";
}

/** Keep general component diagnostics independent of removed compatibility props. */
export function warnOnce(key: string, message: string): void {
  if (!isDevelopment() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[@hjmds/react-native] ${message}`);
}

/** Prevent untyped callers from sending a removed visual override through host props. */
export function assertNoRemovedStyleProps(component: string, props: object, names: readonly string[]): void {
  const removed = names.filter(name => name in props);
  if (removed.length) throw new TypeError(`${component} ${removed.join("/")} were removed; use layoutStyle and semantic props`);
}

export function resetDiagnosticsForTest(): void { warned.clear(); }
