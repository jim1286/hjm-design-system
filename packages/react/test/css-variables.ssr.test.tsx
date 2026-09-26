import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { describe, expect, it } from "vitest";
import { createHjmThemeStyle } from "../src/theme.js";

/**
 * The stylesheet is hand-written text and the tokens are TypeScript, so the two
 * are linked only by custom property names. Before 1.4.1 nothing checked that a
 * referenced name was ever set: 30 focus outlines read an undefined
 * --hjm-color-focus and drew nothing, because a declaration that references an
 * undefined custom property is invalid at computed-value time. This test closes
 * that gap by requiring every var() without a fallback to resolve to a name the
 * renderer actually emits.
 */
const srcDir = fileURLToPath(new URL("../src/", import.meta.url));
const stylesheet = readFileSync(join(srcDir, "styles.css"), "utf8");

function emittedByTheme(): Set<string> {
  const names = new Set<string>();
  for (const theme of ["light", "dark"] as const) {
    for (const density of ["comfortable", "compact"] as const) {
      const value = resolveDesignSystemProviderValue({ theme, density }, { systemTheme: theme });
      for (const key of Object.keys(createHjmThemeStyle(value))) {
        if (key.startsWith("--hjm-")) names.add(key);
      }
    }
  }
  return names;
}

function sourceFiles(): string[] {
  return readdirSync(srcDir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file) && !file.endsWith("theme.ts"));
}

function setInlineByComponents(): Readonly<{ exact: Set<string>; prefixes: string[] }> {
  const exact = new Set<string>();
  const prefixes: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(join(srcDir, file), "utf8");
    for (const match of source.matchAll(/["'](--hjm-[a-z0-9-]+)["']/g)) exact.add(match[1]!);
    for (const match of source.matchAll(/`(--hjm-[a-z0-9-]+)\$\{/g)) prefixes.push(match[1]!);
  }
  return { exact, prefixes };
}

function declaredInStylesheet(): Set<string> {
  return new Set([...stylesheet.matchAll(/(--hjm-[a-z0-9-]+)\s*:/g)].map((match) => match[1]!));
}

type Reference = Readonly<{ name: string; line: number }>;

function referencesWithoutFallback(): Reference[] {
  const references: Reference[] = [];
  stylesheet.split("\n").forEach((text, index) => {
    for (const match of text.matchAll(/var\(\s*(--hjm-[a-z0-9-]+)\s*([,)])/g)) {
      if (match[2] === ")") references.push({ name: match[1]!, line: index + 1 });
    }
  });
  return references;
}

describe("stylesheet custom properties", () => {
  it("resolves every var() without a fallback to a property the renderer sets", () => {
    const theme = emittedByTheme();
    const inline = setInlineByComponents();
    const declared = declaredInStylesheet();
    const undefinedReferences = referencesWithoutFallback().filter(
      ({ name }) =>
        !theme.has(name) &&
        !declared.has(name) &&
        !inline.exact.has(name) &&
        !inline.prefixes.some((prefix) => name.startsWith(prefix)),
    );
    expect(undefinedReferences.map(({ name, line }) => `styles.css:${line} ${name}`)).toEqual([]);
  });

  it("emits the focus indicator from the shared contract", () => {
    const value = resolveDesignSystemProviderValue({ theme: "light" }, { systemTheme: "light" });
    const style = createHjmThemeStyle(value) as Record<string, unknown>;
    expect(style["--hjm-color-focus"]).toBe(value.palette.theme.contentBrand);
    expect(style["--hjm-focus-width"]).toBe("2px");
    expect(style["--hjm-focus-offset"]).toBe("2px");
  });
});
