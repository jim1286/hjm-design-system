import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  componentCatalog,
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

  it("detects npm latest drift without putting a network check in normal push gates", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.["reference:antd:verify"]).toBe(
      "node scripts/verify-antd-reference.mjs",
    );

    const workflow = await readFile(
      new URL("../.github/workflows/antd-reference-drift.yml", import.meta.url),
      "utf8",
    );
    expect(workflow).toMatch(/^  schedule:/m);
    expect(workflow).toMatch(/^  workflow_dispatch:/m);
    expect(workflow).not.toMatch(/^  (?:push|pull_request):/m);

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
      surfaces: { web: { status: "beta" }, native: { status: "unsupported" } },
    });
    expect(getComponentDefinition("top-bar")).toMatchObject({
      surfaces: { web: { status: "unsupported" }, native: { status: "beta" } },
    });
  });

  it("allows nonvisual provider and utility definitions without fake recipes", () => {
    expect(getComponentDefinition("app-provider")).toMatchObject({
      kind: "provider",
      contract: { recipes: [], behaviors: [] },
    });
    expect(getComponentDefinition("utility")).toMatchObject({
      kind: "utility",
      contract: { recipes: [], behaviors: [] },
    });
  });

  it("explains every roadmap transition and every planned row", () => {
    const planned: readonly ComponentCatalogEntry[] = componentCatalog.filter(
      ({ status }) => status === "planned",
    );
    for (const entry of planned) {
      expect(entry.roadmap?.summary.trim().length, entry.name).toBeGreaterThan(0);
    }
    const roadmapEntries = componentCatalog.filter((entry) => "roadmap" in entry);
    expect(Object.values(summarizeComponentRoadmap()).reduce((sum, count) => sum + count, 0)).toBe(
      roadmapEntries.length,
    );
    expect(summarizeComponentRoadmap()).toMatchObject({
      composed: 3,
      prerequisite: 1,
      declined: 3,
    });
  });

  it("tracks every Ant Design 6.6.1 core component exactly once", () => {
    expect(antDesignReferenceSystem).toMatchObject({
      name: "Ant Design",
      version: "6.6.1",
    });
    expect(antDesignReferenceComponents).toHaveLength(73);
    expect(new Set(antDesignReferenceComponents.map(({ name }) => name)).size).toBe(73);

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
      other: 5,
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

    expect(summarizeAntDesignCoverage().tracked).toBe(73);
  });

  it("distinguishes full, partial, and planned target maturity", () => {
    const summary = summarizeAntDesignCoverage();
    expect(summary).toMatchObject({
      total: 73,
      tracked: 73,
      fullyMature: 38,
      partiallyMature: 2,
      plannedOnly: 33,
      fullyPreviewable: 38,
      partiallyPreviewable: 2,
      contractOnly: 33,
    });
    expect(
      summary.fullyMature + summary.partiallyMature + summary.plannedOnly,
    ).toBe(summary.total);
    expect(summary.partiallyPreviewable).toBeGreaterThan(0);
    expect(summary.contractOnly).toBeGreaterThan(0);
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
    expect(componentCatalog.find(({ name }) => name === "List")?.status).toBe("beta");
  });
});

describe("declined components", () => {
  // componentCatalog은 `as const`라 항목마다 타입이 좁다 — optional 필드는 그 필드를
  // 실제로 가진 항목에만 존재한다. 계약 타입으로 넓혀서 전부 같은 모양으로 본다.
  const entries: readonly ComponentCatalogEntry[] = componentCatalog;
  const declined = entries.filter((entry) => entry.declinedReason !== undefined);

  it("marks components we decided never to build, not merely ones we have not built", () => {
    expect(declined.length).toBeGreaterThan(0);
    for (const entry of declined) {
      // `declinedReason`은 성숙도가 아니라 "만들 것인가"를 말한다. beta/stable에 붙으면
      // 이미 만든 것을 안 만들겠다고 말하는 셈이라 성립하지 않는다.
      expect(entry.status, entry.name).toBe("planned");
      expect(entry.declinedReason?.trim().length, entry.name).toBeGreaterThan(0);
    }
  });

  it("keeps a written rationale on disk for every declined component", async () => {
    // 사유 한 줄은 요약이고 근거는 문서에 있다. 문서가 없으면 다음 사람이 판정을
    // 되돌릴 근거도, 뒤집힐 조건도 알 수 없다.
    for (const entry of declined) {
      const id = componentIds[entry.name as keyof typeof componentIds];
      await expect(
        readFile(new URL(`../docs/${id}.md`, import.meta.url), "utf8"),
        `${entry.name} -> docs/${id}.md`,
      ).resolves.toContain(entry.name);
    }
  });
});
