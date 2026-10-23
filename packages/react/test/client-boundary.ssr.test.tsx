import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * React Server Component boundary of the built package (2026-10-23 Diairy web audit).
 *
 * Until 1.41.2 only layout.js and a few compositions declared `"use client"`; screens, display, heading and
 * actions read React context without it, so a Next App Router server component could not import them and the
 * product re-exported them from its own `"use client"` file. tsc keeps a source directive prologue in the emit,
 * so the source module owns its directive and this test reads the built output that consumers actually load.
 *
 * Rule: a module is a client module when it — or a module it imports (not merely re-exports) — uses client-only
 * React APIs, calls a client hook, passes an event handler, or imports a client-only React library. Such modules
 * must declare the directive themselves. Every other module (tokens, recipes, pure helpers, re-export barrels)
 * must not, because a directive turns its functions and constants into client references that a server component
 * can no longer call.
 */
const distDirectory = fileURLToPath(new URL("../dist/", import.meta.url));

const clientOnlyReactNames = new Set([
  "Component", "PureComponent", "createContext", "createPortal", "flushSync", "startTransition",
  "useActionState", "useContext", "useDeferredValue", "useEffect", "useEffectEvent", "useFormStatus",
  "useImperativeHandle", "useInsertionEffect", "useLayoutEffect", "useOptimistic", "useReducer", "useRef",
  "useState", "useSyncExternalStore", "useTransition",
]);
// React's server build still exports these hooks, so calling them alone does not require a client module.
const serverSafeHooks = new Set(["use", "useCallback", "useDebugValue", "useId", "useMemo"]);
// Third-party React renderers that hold state or effects and do not mark their own entry points.
const clientPackages = /^(?:@blobatar\/react|@dnd-kit\/react|@number-flow\/react|bloom-menu|embla-carousel-react|framer-motion)(?:\/|$)/;

type ModuleFacts = Readonly<{
  directive: boolean;
  ownClientUse: string | null;
  imports: readonly string[];
}>;

async function listModules(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listModules(path);
    return entry.name.endsWith(".js") ? [path] : [];
  }));
  return nested.flat();
}

function readFacts(path: string, source: string): ModuleFacts {
  const directive = /^\s*["']use client["'];/.test(source);
  const imports: string[] = [];
  let ownClientUse: string | null = null;
  for (const match of source.matchAll(/^import\s+([\s\S]*?)\s+from\s+"([^"]+)";/gm)) {
    const [, clause = "", specifier = ""] = match;
    if (specifier.startsWith(".")) imports.push(resolve(dirname(path), specifier));
    else if (clientPackages.test(specifier)) ownClientUse ??= `imports ${specifier}`;
    if (specifier !== "react" && specifier !== "react-dom") continue;
    const named = /\{([^}]*)\}/.exec(clause)?.[1] ?? "";
    for (const part of named.split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0] ?? "";
      if (clientOnlyReactNames.has(name)) ownClientUse ??= `imports ${name} from ${specifier}`;
    }
  }
  for (const match of source.matchAll(/\b(use[A-Z]\w*)\(/g)) {
    const name = match[1] ?? "";
    if (!serverSafeHooks.has(name)) ownClientUse ??= `calls ${name}()`;
  }
  // Compiled JSX props: a function passed as onX cannot be serialized out of a server component.
  const handler = /\b(on[A-Z]\w*):\s/.exec(source);
  if (handler) ownClientUse ??= `passes ${handler[1]}`;
  return { directive, ownClientUse, imports };
}

async function readPackageGraph() {
  const facts = new Map<string, ModuleFacts>();
  for (const path of await listModules(distDirectory)) {
    facts.set(path, readFacts(path, await readFile(path, "utf8")));
  }
  const reasons = new Map<string, string | null>();
  const visiting = new Set<string>();
  const reasonFor = (path: string): string | null => {
    if (reasons.has(path)) return reasons.get(path) ?? null;
    // An import cycle cannot add a reason the other members do not already report.
    if (visiting.has(path)) return null;
    visiting.add(path);
    const module = facts.get(path);
    if (!module) throw new Error(`Unresolved import in dist: ${relative(distDirectory, path)}`);
    let reason = module.ownClientUse;
    for (const dependency of module.imports) {
      if (reason) break;
      const dependencyReason = reasonFor(dependency);
      if (dependencyReason) reason = `imports ${relative(distDirectory, dependency)} (${dependencyReason})`;
    }
    visiting.delete(path);
    reasons.set(path, reason);
    return reason;
  };
  return [...facts].map(([path, module]) => ({
    module: relative(distDirectory, path),
    directive: module.directive,
    reason: reasonFor(path),
  }));
}

describe("@hjmds/react client boundary", () => {
  it("declares \"use client\" on exactly the built modules that need the client", async () => {
    const graph = await readPackageGraph();
    const missing = graph.filter((entry) => entry.reason && !entry.directive)
      .map((entry) => `${entry.module}: ${entry.reason}`);
    const unnecessary = graph.filter((entry) => !entry.reason && entry.directive).map((entry) => entry.module);
    expect(missing).toEqual([]);
    expect(unnecessary).toEqual([]);
  });

  it("keeps every package entry point importable from a server component", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as { exports: Record<string, string | Record<string, string>> };
    const graph = new Map((await readPackageGraph()).map((entry) => [entry.module, entry]));
    const entries = Object.entries(packageJson.exports).flatMap(([exportPath, definition]) => {
      const target = typeof definition === "string" ? definition : definition.import;
      return target?.endsWith(".js") ? [[exportPath, target.replace(/^\.\/dist\//, "")] as const] : [];
    });
    expect(entries.length).toBeGreaterThan(100);
    // A barrel that only re-exports stays a server module; each re-exported client module is its own boundary.
    const unbounded = entries.filter(([, target]) => {
      const entry = graph.get(target);
      if (!entry) throw new Error(`Missing built entry ${target}`);
      return entry.reason !== null && !entry.directive;
    }).map(([exportPath]) => exportPath);
    expect(unbounded).toEqual([]);
    // Pure entry points (style keys, evidence) stay callable from the server.
    for (const pure of ["composition-style.js", "evidence.js"]) {
      expect(graph.get(pure)).toMatchObject({ directive: false, reason: null });
    }
  });
});
