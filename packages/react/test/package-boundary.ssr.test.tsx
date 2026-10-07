import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("@hjmds/react package boundary", () => {
  it("exposes distinct family-level entry points and an explicit stylesheet", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as {
      exports: Record<string, unknown>;
      sideEffects: readonly string[];
    };
    const executableExportPaths = [
      ".",
      "./provider",
      "./carousel",
      "./floating-action-button",
      "./top-bar",
      "./bottom-cta",
      "./layout",
      "./actions",
      "./forms",
      "./password-field",
      "./otp-field",
      "./number-field",
      "./slider",
      "./date-picker",
      "./calendar",
      "./file-picker",
      "./steps",
      "./upload-item",
      "./selection",
      "./navigation",
      "./breadcrumb",
      "./pagination",
      "./anchor",
      "./display",
      "./overlays",
      "./popover",
      "./side-panel",
      "./splitter",
      "./tour",
      "./tree",
      "./transfer-list",
      "./mentions",
      "./command-palette",
      "./agreement",
      "./top",
      "./heading",
      "./text-formats",
      "./clipboard",
      "./toggle-group",
      "./tags-input",
      "./skip-nav",
      "./bottom-info",
      "./sidebar",
      "./overlay-stack",
      "./date-range",
      "./provider-button",
      "./auth-screen",
      "./data-table",
      "./collapsible",
      "./context-menu",
      "./menubar",
      "./asset",
      "./feedback",
      "./toast",
      "./evidence",
      "./thinking-orb",
      "./statistic-motion",
      "./menu-morph",
      "./affix",
      "./color-picker",
      "./watermark",
      "./masonry",
      "./virtual-list",
      "./qr-code",
      "./sortable",
      "./swipe-actions",
      "./content-transition", "./rating", "./image-comparison",
      "./carousel-motion",
      "./celebration",
    ];

    // Optional visual entry points are checked independently of canonical family exports.
    const optionalExportPaths = [
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
      "./date-entry",
      "./field-group",
      "./document-resource",
      // Profiles are optional: core imports must not pull the preset registry.
      "./design-profile",
      "./collection-rail",
    ];

    expect(Object.keys(packageJson.exports)).toEqual([
      ...executableExportPaths,
      "./styles.css",
      "./styles.layered.css",
      ...optionalExportPaths,
    ]);
    const familyTargets = [...executableExportPaths.slice(1), ...optionalExportPaths].map((exportPath) => {
      const definition = packageJson.exports[exportPath] as Record<string, string>;
      expect(definition.import).toMatch(/^\.\/dist\/.+\.js$/);
      expect(definition.import).not.toBe("./dist/index.js");
      return definition.import;
    });
    expect(new Set(familyTargets).size).toBe(familyTargets.length);
    expect(packageJson.exports["./styles.css"]).toBe("./dist/styles.css");
    expect(packageJson.exports["./styles.layered.css"]).toBe("./dist/styles.layered.css");
    expect(packageJson.sideEffects).toEqual(["**/*.css"]);
  });
});
