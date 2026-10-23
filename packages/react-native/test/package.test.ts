import { access, readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("@hjmds/react-native package boundary", () => {
  it("keeps Expo out and exposes distinct family-level entry points", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as {
      version: string;
      dependencies?: Record<string, string>;
      devDependencies: Record<string, string>;
      exports: Record<string, unknown>;
      peerDependencies: Record<string, string>;
      peerDependenciesMeta: Record<string, { optional?: boolean }>;
      sideEffects: boolean;
    };
    expect(packageJson.dependencies).toBeUndefined();
    expect(packageJson.devDependencies["@hjmds/design-contracts"]).toBe("workspace:*");
    // Peer version compatibility belongs to installation; this boundary verifies no Expo runtime and opt-in adapters.
    expect(packageJson.peerDependencies["@hjmds/design-contracts"]).toMatch(/^>=\d+\.\d+\.0 <\d+\.\d+\.0$/);
    for (const peer of Object.keys(packageJson.peerDependencies)) {
      expect(peer).not.toMatch(/^expo(?:-|$)/);
      if (!["@hjmds/design-contracts", "react", "react-native"].includes(peer)) expect(packageJson.peerDependenciesMeta[peer]?.optional).toBe(true);
    }
    expect(packageJson.sideEffects).toBe(false);
    const familyTargets = await Promise.all(Object.entries(packageJson.exports)
      .filter(([path]) => path !== "." && path !== "./top-bar" && path !== "./bottom-cta")
      .map(async ([, entry]) => {
        const definition = entry as Record<string, string>;
        expect(definition["react-native"]).toMatch(/^\.\/dist\/.+\.js$/);
        expect(definition["react-native"]).not.toBe("./dist/index.js");
        await access(new URL(`../${definition["react-native"]}`, import.meta.url));
        await access(new URL(`../${definition.types}`, import.meta.url));
        return definition["react-native"];
      }));
    expect(new Set(familyTargets).size).toBe(familyTargets.length);
    expect(packageJson.exports["./top-bar"]).toEqual(packageJson.exports["./navigation"]);
    expect(packageJson.exports["./bottom-cta"]).toEqual(packageJson.exports["./actions"]);
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
        "password-field.ts",
        "otp-field.ts",
        "number-field.tsx",
        "slider.tsx",
        "date-picker.tsx",
        "calendar.tsx",
        "file-picker.tsx",
        "steps.tsx",
        "upload-item.tsx",
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
        "date-picker.tsx",
        "calendar.tsx",
        "file-picker.tsx",
        "steps.tsx",
        "upload-item.tsx",
        "forms.tsx",
        "navigation.tsx",
        "data-display.tsx",
        "feedback.tsx",
        "overlays.tsx",
      ].map((file) =>
        readFile(fileURLToPath(new URL(`../src/${file}`, import.meta.url)), "utf8"),
      ),
    );
    expect(sources.join("\n")).not.toMatch(/from ["']@hjmds\/design-contracts["']/);
  });
});
