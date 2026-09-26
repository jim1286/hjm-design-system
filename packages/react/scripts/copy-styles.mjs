import { mkdir, readFile, writeFile } from "node:fs/promises";

/**
 * Ships the hand-written stylesheet twice from one source:
 * - dist/styles.css stays unlayered (the compatibility default).
 * - dist/styles.layered.css wraps the same rules in `@layer hjm`, the opt-in
 *   migration path in design-contracts/docs/brand-boundary.md. Unlayered
 *   product CSS then wins over HJM regardless of specificity.
 * Generating both here keeps the two files from drifting; a node script
 * replaces the old `cp` so the build stays cross-platform.
 */
const source = new URL("../src/styles.css", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
const css = await readFile(source, "utf8");

// A layer block cannot contain @charset or @import; fail loudly if one appears.
if (/^\s*@(charset|import)\b/m.test(css)) {
  throw new Error("styles.css gained @charset/@import; hoist it outside the generated @layer block");
}

await mkdir(dist, { recursive: true });
await writeFile(new URL("styles.css", dist), css);
await writeFile(new URL("styles.layered.css", dist), `@layer hjm {\n${css}\n}\n`);
