import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  componentCatalog,
  getComponentSurfaceStatus,
  summarizeComponentRoadmap,
  type ComponentCatalogEntry,
} from "../src/catalog.js";
import {
  componentDefinitions,
  componentIds,
  getComponentDefinition,
} from "../src/component-definitions.js";
import {
  antDesignReferenceComponents,
  antDesignReferenceSystem,
  getAntDesignReferencesFor,
  summarizeAntDesignCoverage,
} from "../src/component-references.js";

describe("component reference coverage", () => {
  it("keeps Ant Design as reference data rather than a runtime dependency", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const packageNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];
    expect(packageNames.filter((name) => name === "antd" || name.startsWith("@ant-design/"))).toEqual(
      [],
    );
  });

  it("keeps npm latest drift as an explicit local check outside automatic CI", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.["reference:antd:verify"]).toBe(
      "node scripts/verify-antd-reference.mjs",
    );

    const automaticWorkflows = await Promise.all(
      ["showcase.yml", "version-packages.yml"].map((file) =>
        readFile(new URL(`../../../.github/workflows/${file}`, import.meta.url), "utf8"),
      ),
    );
    expect(automaticWorkflows.join("\n")).not.toContain("reference:antd:verify");
    expect(automaticWorkflows.join("\n")).not.toContain("verify-antd-reference.mjs");

    const scriptPath = fileURLToPath(
      new URL("../scripts/verify-antd-reference.mjs", import.meta.url),
    );
    const runAgainst = (latestVersion: string) =>
      spawnSync(process.execPath, [scriptPath], {
        encoding: "utf8",
        env: {
          ...process.env,
          ANTD_REGISTRY_URL: `data:application/json,${encodeURIComponent(
            JSON.stringify({ version: latestVersion }),
          )}`,
        },
      });

    const current = runAgainst("6.6.1");
    expect(current.status, current.stderr).toBe(0);
    expect(current.stdout).toContain("Ant Design reference is current: 6.6.1");

    const drifted = runAgainst("6.6.2");
    expect(drifted.status).toBe(1);
    expect(drifted.stderr).toContain(
      "Ant Design reference drift detected: pinned 6.6.1, npm latest 6.6.2",
    );
  });

  it("keeps canonical HJM component names unique", () => {
    expect(new Set(componentCatalog.map(({ name }) => name)).size).toBe(componentCatalog.length);
  });

  it("provides stable IDs and per-surface definitions for every catalog entry", () => {
    expect(componentDefinitions).toHaveLength(componentCatalog.length);
    expect(new Set(componentDefinitions.map(({ id }) => id)).size).toBe(componentDefinitions.length);
    expect(Object.keys(componentIds)).toHaveLength(componentCatalog.length);

    expect(getComponentDefinition("button")).toMatchObject({
      name: "Button",
      contract: { status: "stable", recipes: ["buttonRecipe"] },
      surfaces: {
        parity: "shared",
        web: { status: "stable" },
        native: { status: "stable" },
      },
    });
    expect(getComponentDefinition("tooltip")).toMatchObject({
      contract: { status: "stable" },
      surfaces: { web: { status: "stable" }, native: { status: "unsupported" } },
    });
    expect(getComponentDefinition("top-bar")).toMatchObject({
      surfaces: { web: { status: "stable" }, native: { status: "stable" } },
    });
    expect(getComponentDefinition("select")).toMatchObject({
      contract: { status: "stable" },
      surfaces: { web: { status: "stable" }, native: { status: "stable" } },
    });
    expect(getComponentDefinition("combobox")).toMatchObject({
      contract: { status: "stable" },
      surfaces: { web: { status: "stable" }, native: { status: "stable" } },
    });
    expect(getComponentDefinition("form")).toMatchObject({
      contract: { status: "stable" },
      surfaces: { web: { status: "stable" }, native: { status: "stable" } },
    });
  });

  it("tracks built-in renderer maturity independently from contract maturity", () => {
    const catalogEntries: readonly ComponentCatalogEntry[] = componentCatalog;
    for (const entry of componentCatalog as readonly ComponentCatalogEntry[]) {
      expect(entry.surfaceStatus, entry.name).toBeDefined();
      if (entry.platform === "web") {
        expect(entry.surfaceStatus?.native, entry.name).toBe("unsupported");
      }
      if (entry.platform === "native") {
        expect(entry.surfaceStatus?.web, entry.name).toBe("unsupported");
      }
    }

    // 2026-09-29 promotion: every beta renderer now has complete required evidence; Form's focus path was implemented, and ThinkingOrb Native passed installed iOS/Android Skia smoke.
    expect(catalogEntries.filter(({ surfaceStatus }) => surfaceStatus?.web === "beta")).toHaveLength(0);
    expect(catalogEntries.filter(({ surfaceStatus }) => surfaceStatus?.native === "beta")).toHaveLength(0);
    expect(catalogEntries.filter(({ surfaceStatus }) => surfaceStatus?.web === "stable")).toHaveLength(103);
    expect(catalogEntries.filter(({ surfaceStatus }) => surfaceStatus?.native === "stable")).toHaveLength(83);
  });

  it("keeps legacy custom catalog entries working during the surface-status migration", () => {
    const legacyEntry: ComponentCatalogEntry = {
      name: "LegacyShared",
      category: "layout",
      platform: "shared",
      status: "beta",
    };
    expect(getComponentSurfaceStatus(legacyEntry, "web")).toBe("beta");
    expect(getComponentSurfaceStatus(legacyEntry, "native")).toBe("beta");
  });

  it("does not list deliberately excluded candidates as future work", () => {
    const names = componentCatalog.map(entry => entry.name) as readonly string[];
    for (const name of ["AppProvider", "Utility", "BorderBeam", "Chart", "TimePicker", "Cascader", "Rating", "TreeSelect", "ConfirmPopover"]) expect(names).not.toContain(name);
  });

  it("explains every roadmap transition and every planned row", () => {
    const planned = (componentCatalog as readonly ComponentCatalogEntry[]).filter(
      ({ status }) => status === "planned",
    );
    for (const entry of planned) {
      expect(entry.roadmap?.summary.trim().length, entry.name).toBeGreaterThan(0);
    }
    const roadmapEntries = componentCatalog.filter((entry) => "roadmap" in entry);
    expect(Object.values(summarizeComponentRoadmap()).reduce((sum, count) => sum + count, 0)).toBe(
      roadmapEntries.length,
    );
    // Composition patterns are covered by their existing primitive targets.
    expect(summarizeComponentRoadmap()).toMatchObject({
      composed: 0,
      prerequisite: 0,
      declined: 0,
    });
  });

  it("tracks every Ant Design 6.6.1 core component exactly once", () => {
    expect(antDesignReferenceSystem).toMatchObject({
      name: "Ant Design",
      version: "6.6.1",
    });
    expect(antDesignReferenceComponents).toHaveLength(70);
    expect(new Set(antDesignReferenceComponents.map(({ name }) => name)).size).toBe(70);

    const categoryCounts = Object.fromEntries(
      ["general", "layout", "navigation", "data-entry", "data-display", "feedback", "other"].map(
        (category) => [
          category,
          antDesignReferenceComponents.filter((entry) => entry.category === category).length,
        ],
      ),
    );
    expect(categoryCounts).toEqual({
      general: 4,
      layout: 7,
      navigation: 7,
      "data-entry": 18,
      "data-display": 21,
      feedback: 11,
      other: 2,
    });
  });

  it("maps every external reference to a real HJM catalog target", () => {
    const ids = new Set(componentDefinitions.map(({ id }) => id));
    for (const reference of antDesignReferenceComponents) {
      expect(reference.targets.length, reference.name).toBeGreaterThan(0);
      for (const target of reference.targets) {
        expect(ids.has(target), `${reference.name} -> ${target}`).toBe(true);
      }
    }

    expect(summarizeAntDesignCoverage().tracked).toBe(70);
  });

  it("distinguishes full, partial, and planned target maturity", async () => {
    const summary = summarizeAntDesignCoverage();
    expect(summary).toMatchObject({
      total: 70,
      tracked: 70,
      fullyMature: 70,
      partiallyMature: 0,
      plannedOnly: 0,
    });
    expect(
      summary.fullyMature + summary.partiallyMature + summary.plannedOnly,
    ).toBe(summary.total);
    // SidePanel was the last partially mature target; decomposed Drawer now has
    // both halves shipped. Keep the axis reported rather than asserting it is
    // non-empty, so a future partial entry still has to state its own number.
    expect(summary).not.toHaveProperty("partiallyPreviewable");
    expect(summary).not.toHaveProperty("contractOnly");

    const coverageDocument = await readFile(
      new URL("../docs/ant-design-coverage.md", import.meta.url),
      "utf8",
    );
    expect(coverageDocument).toContain(
      `fully mature ${summary.fullyMature} / partial maturity ${summary.partiallyMature} /\nplanned only ${summary.plannedOnly}`,
    );
  });

  it("preserves HJM semantics for adapted and decomposed references", () => {
    expect(getAntDesignReferencesFor("Field").map(({ name }) => name)).toEqual(
      expect.arrayContaining(["Form", "Input"]),
    );
    expect(getAntDesignReferencesFor("Sheet").map(({ name }) => name)).toContain("Drawer");
    expect(getAntDesignReferencesFor("Toast").map(({ name }) => name)).toContain("Message");
  });

  it("tracks the List to Listy lifecycle without deprecating HJM List", () => {
    const legacyList = antDesignReferenceComponents.find(({ name }) => name === "List");
    expect(legacyList && "lifecycle" in legacyList ? legacyList.lifecycle : undefined).toBe(
      "deprecated",
    );
    expect(antDesignReferenceComponents.find(({ name }) => name === "Listy")).toMatchObject({
      lifecycle: "new",
      targets: ["virtual-list"],
    });
    expect(componentCatalog.find(({ name }) => name === "List")?.status).toBe("stable");
  });
});
