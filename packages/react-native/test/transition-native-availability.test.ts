import { URL } from "node:url";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transpileModule, ModuleKind } from "typescript";
import { expect, it, vi } from "vitest";

// Exercise the installed upstream patch: importing its JS peer alone does not
// prove that Fabric has the matching native views in an existing dev client.
const source = readFileSync(new URL("../node_modules/react-native-screen-transitions/src/components/boundary/portal/teleport.ts", import.meta.url), "utf8");
const compiled = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } }).outputText;
for (const linked of [false, true]) {
  it(`loads teleport only when native views are linked: ${linked}`, () => {
    const exports: Record<string, unknown> = {};
    const peer = { PortalProvider() {}, Portal() {}, PortalHost() {} };
    const load = vi.fn((name: string) => name === "react-native" ? { UIManager: { hasViewManagerConfig: () => linked } } : peer);
    runInNewContext(compiled, { exports, require: load });
    expect(exports.isTeleportAvailable).toBe(linked);
    expect(exports.NativePortalHost).toBe(linked ? peer.PortalHost : null);
    expect(load.mock.calls.some(([name]) => name === "react-native-teleport")).toBe(linked);
  });
}
