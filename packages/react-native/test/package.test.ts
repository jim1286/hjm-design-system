import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("@hjm/react-native package boundary", () => {
  it("keeps Expo out and declares React/RN as peers", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as {
      version: string;
      dependencies?: Record<string, string>;
      devDependencies: Record<string, string>;
      exports: Record<string, unknown>;
      peerDependencies: Record<string, string>;
      sideEffects: boolean;
    };
    expect(packageJson.dependencies).toBeUndefined();
    expect(packageJson.devDependencies["@hjm/design-contracts"]).toBe("workspace:*");
    expect(packageJson.peerDependencies).toEqual({
      "@hjm/design-contracts": ">=0.6.0 <0.7.0",
      react: ">=19",
      "react-native": ">=0.81",
    });
    expect(packageJson.sideEffects).toBe(false);
    expect(Object.keys(packageJson.exports)).toEqual(expect.arrayContaining([
      ".",
      "./provider",
      "./primitives",
      "./actions",
      "./inputs",
      "./number-field",
      "./slider",
      "./forms",
      "./navigation",
      "./data-display",
      "./feedback",
      "./overlays",
    ]));
    expect(packageJson.exports["./number-field"]).toMatchObject({
      types: "./dist/number-field.d.ts",
      "react-native": "./dist/number-field.js",
      import: "./dist/number-field.js",
      default: "./dist/number-field.js",
    });
    expect(packageJson.exports["./slider"]).toMatchObject({
      types: "./dist/slider.d.ts",
      "react-native": "./dist/slider.js",
      import: "./dist/slider.js",
      default: "./dist/slider.js",
    });

    const sources = await Promise.all(
      [
        "provider.tsx",
        "primitives.tsx",
        "actions.tsx",
        "inputs.tsx",
        "inputs-public.ts",
        "number-field.tsx",
        "slider.tsx",
        "forms.tsx",
        "navigation.tsx",
        "data-display.tsx",
        "feedback.tsx",
        "overlays.tsx",
      ].map((file) =>
        readFile(fileURLToPath(new URL(`../src/${file}`, import.meta.url)), "utf8"),
      ),
    );
    expect(sources.join("\n")).not.toMatch(/(?:from|import\()\s*["']expo(?:[\/"'])/);
  });

  it("uses granular design-contract imports for Metro-sensitive modules", async () => {
    const sources = await Promise.all(
      [
        "provider.tsx",
        "primitives.tsx",
        "actions.tsx",
        "inputs.tsx",
        "inputs-public.ts",
        "number-field.tsx",
        "slider.tsx",
        "forms.tsx",
        "navigation.tsx",
        "data-display.tsx",
        "feedback.tsx",
        "overlays.tsx",
      ].map((file) =>
        readFile(fileURLToPath(new URL(`../src/${file}`, import.meta.url)), "utf8"),
      ),
    );
    expect(sources.join("\n")).not.toMatch(/from ["']@hjm\/design-contracts["']/);
  });
});
