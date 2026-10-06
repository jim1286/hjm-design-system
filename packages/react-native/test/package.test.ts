import { readFile } from "node:fs/promises";
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
      sideEffects: boolean;
    };
    expect(packageJson.dependencies).toBeUndefined();
    expect(packageJson.devDependencies["@hjmds/design-contracts"]).toBe("workspace:*");
    expect(packageJson.peerDependencies).toEqual({
      // The authored next train precedes the generated release commit. Exact train
      // alignment is enforced by workspace:check; a stale literal blocked 1.4.0.
      "@hjmds/design-contracts": expect.stringMatching(/^>=\d+\.\d+\.0 <\d+\.\d+\.0$/),
      react: ">=19",
      "react-native": ">=0.81",
      "@shopify/react-native-skia": "^2.6.2",
      "react-native-reanimated": "^4.5.1",
      "react-native-worklets": "^0.10.1",
      "react-native-zoom-toolkit": "5.1.1",
      "react-native-keyboard-controller": "1.22.5",
      "@gorhom/bottom-sheet": "5.2.14",
      "zeego": "3.0.6",
      "@react-native-menu/menu": "1.2.2",
      "react-native-ios-utilities": "5.2.0",
      "react-native-ios-context-menu": "3.2.1",
      "react-native-gesture-handler": "2.32.0",
      "react-native-svg": "15.15.5",
      "qrcode-generator": "2.0.4",
      "react-native-sortables": "1.10.1",
      "react-native-reanimated-carousel": "5.1.1",
      "react-native-fast-confetti": "2.0.2",
      "react-native-screen-transitions": "4.0.0",
      "@react-navigation/native": "7.4.1",
      "react-native-safe-area-context": "5.7.0",
      "@blobatar/react-native": "2.7.0",
      "blobatar": "2.7.0",
      "lucide-react-native": "1.49.0",
    });
    expect(packageJson.sideEffects).toBe(false);
    const expectedExportPaths = [
      ".",
      "./provider",
      "./carousel",
      "./floating-action-button",
      "./top-bar",
      "./bottom-cta",
      "./composition-style",
      "./primitives",
      "./actions",
      "./inputs",
      "./password-field",
      "./otp-field",
      "./number-field",
      "./slider",
      "./date-picker",
      "./calendar",
      "./agreement",
      "./top",
      "./heading",
      "./toggle-group",
      "./bottom-info",
      "./collapsible",
      "./asset",
      "./tags-input",
      "./date-range",
      "./mentions",
      "./transfer-list",
      "./keyboard",
      "./provider-button",
      "./auth-screen",
      "./file-picker",
      "./steps",
      "./upload-item",
      "./forms",
      "./navigation",
      "./data-display",
      "./feedback",
      "./overlays",
      "./evidence",
      "./toast-liquid",
      "./thinking-orb",
      "./image-viewer",
      "./keyboard-controller",
      "./sheet-gesture",
      "./context-menu-native",
      "./masonry",
      "./virtual-list",
      "./qr-code",
      "./sortable",
      "./swipe-actions",
      "./content-transition", "./rating", "./image-comparison",
      "./carousel-motion",
      "./celebration",
      "./screen-transition",
      "./avatar-blobatar",
      "./effect-surface",
      "./icon-lucide",
      "./duration-field",
      "./inline-confirm",
      "./reaction-picker",
      "./notification-bell",
      "./scroll-progress",
      "./code-block",
      "./activity-heatmap",
      "./statistic-motion",
      "./task-list",
      "./folder-preview",
      "./avatar-blobatar-motion",
      "./step-player",
      "./voice-note",
      "./grid-reveal",
      "./gravity-letters",
      "./navigation-bar",
      "./screens", "./screen-flows",
      "./saved-items",
      "./progressive-blur",
    ];
    expect(Object.keys(packageJson.exports)).toEqual(expectedExportPaths);
    const familyTargets = expectedExportPaths.slice(1).filter((path) => path !== "./top-bar" && path !== "./bottom-cta").map((exportPath) => {
      const definition = packageJson.exports[exportPath] as Record<string, string>;
      expect(definition["react-native"]).toMatch(/^\.\/dist\/.+\.js$/);
      expect(definition["react-native"]).not.toBe("./dist/index.js");
      return definition["react-native"];
    });
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
