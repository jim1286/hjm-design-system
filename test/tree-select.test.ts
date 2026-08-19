import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { antDesignReferenceComponents } from "../src/component-references.js";
import type { TreeNodeDescriptor } from "../src/tree.js";
import {
  reconcileTreeCheckedSelection,
  resolveTreeCheckedStates,
  toggleTreeCheckedSelection,
  treeSelectBehaviorScenarios,
  validateTreeCheckedSelection,
} from "../src/tree-select.js";

const nodes: readonly TreeNodeDescriptor[] = [
  {
    id: "kbo",
    label: "KBO",
    textValue: "KBO",
    children: [
      {
        id: "hitting",
        label: "타격",
        textValue: "타격",
        children: [
          { id: "avg", label: "타율", textValue: "타율" },
          { id: "obp", label: "출루율", textValue: "출루율" },
          { id: "slg", label: "장타율", textValue: "장타율", disabled: true },
        ],
      },
      {
        id: "pitching",
        label: "투구",
        textValue: "투구",
        children: [
          { id: "era", label: "평균자책점", textValue: "평균자책점" },
          { id: "whip", label: "WHIP", textValue: "WHIP" },
        ],
      },
    ],
  },
];

describe("TreeSelect checked-selection validation", () => {
  it("rejects a parent id or an unknown id in checkedKeys", () => {
    expect(() =>
      validateTreeCheckedSelection(nodes, new Set(["hitting"])),
    ).toThrow(/leaf node id/);
    expect(() =>
      validateTreeCheckedSelection(nodes, new Set(["ghost"])),
    ).toThrow(/leaf node id/);
  });

  it("accepts an empty set and a set of real leaf ids", () => {
    expect(() => validateTreeCheckedSelection(nodes, new Set())).not.toThrow();
    expect(() =>
      validateTreeCheckedSelection(nodes, new Set(["avg", "era"])),
    ).not.toThrow();
  });
});

describe("resolveTreeCheckedStates", () => {
  it("derives unchecked for every node when nothing is checked", () => {
    const states = resolveTreeCheckedStates(nodes, new Set());
    for (const id of ["kbo", "hitting", "pitching", "avg", "obp", "slg", "era", "whip"]) {
      expect(states.get(id)).toBe(false);
    }
  });

  it("derives checked all the way up when every leaf under a parent is checked", () => {
    const states = resolveTreeCheckedStates(
      nodes,
      new Set(["avg", "obp", "slg", "era", "whip"]),
    );
    expect(states.get("hitting")).toBe(true);
    expect(states.get("pitching")).toBe(true);
    expect(states.get("kbo")).toBe(true);
  });

  it("derives mixed when only some descendant leaves are checked", () => {
    const states = resolveTreeCheckedStates(nodes, new Set(["avg"]));
    expect(states.get("avg")).toBe(true);
    expect(states.get("obp")).toBe(false);
    expect(states.get("hitting")).toBe("mixed");
    expect(states.get("pitching")).toBe(false);
    expect(states.get("kbo")).toBe("mixed");
  });

  it("excludes a disabled leaf from its parent's aggregate but keeps its own displayed bit", () => {
    // slg is disabled and unchecked; hitting's other two leaves (avg, obp)
    // are fully checked, so hitting must read as fully checked too — a
    // disabled-and-unchecked leaf must never permanently pin an ancestor to
    // "mixed", the same "excluded from the denominator" rule
    // resolveDataTableSelectAllState applies to disabled rows.
    const states = resolveTreeCheckedStates(nodes, new Set(["avg", "obp"]));
    expect(states.get("slg")).toBe(false);
    expect(states.get("hitting")).toBe(true);

    const withSlgChecked = resolveTreeCheckedStates(
      nodes,
      new Set(["avg", "obp", "slg"]),
    );
    expect(withSlgChecked.get("slg")).toBe(true);
    expect(withSlgChecked.get("hitting")).toBe(true);
  });
});

describe("toggleTreeCheckedSelection", () => {
  it("checking an unchecked parent checks every enabled descendant leaf, skipping disabled ones", () => {
    const next = toggleTreeCheckedSelection(nodes, new Set(), "hitting");
    expect(next).toEqual(new Set(["avg", "obp"]));
  });

  it("unchecking a fully checked parent unchecks every enabled descendant leaf", () => {
    const fullyChecked = new Set(["avg", "obp", "era", "whip"]);
    const next = toggleTreeCheckedSelection(nodes, fullyChecked, "hitting");
    expect(next).toEqual(new Set(["era", "whip"]));
  });

  it("toggling a mixed parent checks every enabled descendant leaf (mixed defaults to checked)", () => {
    const next = toggleTreeCheckedSelection(nodes, new Set(["avg"]), "hitting");
    expect(next).toEqual(new Set(["avg", "obp"]));
  });

  it("toggling a leaf directly behaves like a plain checkbox toggle", () => {
    expect(toggleTreeCheckedSelection(nodes, new Set(), "avg")).toEqual(
      new Set(["avg"]),
    );
    expect(toggleTreeCheckedSelection(nodes, new Set(["avg"]), "avg")).toEqual(
      new Set(),
    );
  });

  it("cascading to the root checks every enabled leaf across both branches", () => {
    const next = toggleTreeCheckedSelection(nodes, new Set(), "kbo");
    expect(next).toEqual(new Set(["avg", "obp", "era", "whip"]));
  });

  it("throws for an unknown target id", () => {
    expect(() =>
      toggleTreeCheckedSelection(nodes, new Set(), "ghost" as never),
    ).toThrow(/must exist/);
  });

  it("no-ops when the toggled leaf itself is disabled", () => {
    const current = new Set(["avg"]);
    expect(toggleTreeCheckedSelection(nodes, current, "slg")).toEqual(current);
  });
});

describe("reconcileTreeCheckedSelection", () => {
  it("drops a checked leaf id that no longer exists in the tree", () => {
    const reconciled = reconcileTreeCheckedSelection(
      nodes,
      new Set(["avg", "ghost"]),
    );
    expect(reconciled).toEqual(new Set(["avg"]));
  });

  it("returns the same reference when nothing changed", () => {
    const current = new Set(["avg", "era"]);
    expect(reconcileTreeCheckedSelection(nodes, current)).toBe(current);
  });
});

describe("TreeSelect self-contained contract", () => {
  it("keeps a non-empty, deduplicated behavior scenario list", () => {
    expect(treeSelectBehaviorScenarios.length).toBeGreaterThan(0);
    expect(new Set(treeSelectBehaviorScenarios).size).toBe(
      treeSelectBehaviorScenarios.length,
    );
  });
});

describe("TreeSelect catalog and crosswalk stay untouched", () => {
  it("still reserves TreeSelect as planned/web/input", () => {
    const entry = componentCatalog.find((item) => item.name === "TreeSelect");
    expect(entry).toMatchObject({
      category: "input",
      platform: "web",
      status: "planned",
    });
  });

  it("keeps the antd TreeSelect crosswalk pointed at the same target", () => {
    const entry = antDesignReferenceComponents.find(
      (item) => item.name === "TreeSelect",
    );
    expect(entry).toMatchObject({
      targets: ["tree-select"],
      relationship: "direct",
    });
  });
});
