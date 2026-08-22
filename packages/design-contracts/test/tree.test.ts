import { describe, expect, it, vi } from "vitest";

import {
  flattenTreeNodes,
  getTreeArrowKeyIntent,
  getTreeArrowResult,
  getVisibleTreeNavigationTarget,
  getVisibleTreeTypeaheadMatch,
  reconcileTreeExpansion,
  resolveTreeDescriptor,
  treeBehavior,
  treeRecipe,
  validateTreeNode,
  validateTreeNodes,
  type ResolvedTreeNodeDescriptor,
  type TreeNodeDescriptor,
} from "../src/tree.js";
import { collectionItemContract } from "../src/component-contracts.js";

const nodes: readonly TreeNodeDescriptor[] = [
  {
    id: "hitter",
    label: "야수",
    textValue: "야수",
    children: [
      {
        id: "infield",
        label: "내야수",
        textValue: "내야수",
        children: [
          { id: "first-base", label: "1루수", textValue: "1루수" },
          { id: "second-base", label: "2루수", textValue: "2루수" },
        ],
      },
      {
        id: "outfield",
        label: "외야수",
        textValue: "외야수",
        children: [
          { id: "left-field", label: "좌익수", textValue: "좌익수", disabled: true },
          { id: "right-field", label: "우익수", textValue: "우익수" },
        ],
      },
    ],
  },
  { id: "pitcher", label: "투수", textValue: "투수" },
];

const composeAccessibleName = ({
  depth,
  position,
  siblingCount,
  label,
  hasChildren,
  expanded,
}: {
  depth: number;
  position: number;
  siblingCount: number;
  label: string;
  hasChildren: boolean;
  expanded: boolean;
}) =>
  `${depth}단계, ${siblingCount}개 중 ${position}번째: ${label}${
    hasChildren ? (expanded ? ", 펼쳐짐" : ", 접힘") : ""
  }`;

function resolve(expandedKeys: ReadonlySet<string> = new Set()) {
  return resolveTreeDescriptor(nodes, expandedKeys, { composeAccessibleName });
}

describe("Tree node validation", () => {
  it("accepts a well-formed leaf and a well-formed branch", () => {
    expect(() =>
      validateTreeNode({ id: "a", label: "A", textValue: "A" }),
    ).not.toThrow();
    expect(() =>
      validateTreeNode({
        id: "a",
        label: "A",
        textValue: "A",
        children: [{ id: "b", label: "B", textValue: "B" }],
      }),
    ).not.toThrow();
  });

  it("rejects duplicate, empty, and padded node identity", () => {
    expect(() => validateTreeNode({ id: " ", label: "A", textValue: "A" })).toThrow(
      /id/,
    );
    expect(() =>
      validateTreeNode({ id: " a ", label: "A", textValue: "A" }),
    ).toThrow(/whitespace/);
    expect(() => validateTreeNode({ id: "a", label: "", textValue: "A" })).toThrow(
      /label/,
    );
    expect(() => validateTreeNode({ id: "a", label: "A", textValue: "" })).toThrow(
      /textValue/,
    );
  });

  it("rejects an explicitly empty children array", () => {
    expect(() =>
      validateTreeNode({ id: "a", label: "A", textValue: "A", children: [] }),
    ).toThrow(/empty array/);
  });

  it("rejects duplicate ids across different depths via the reused collection validator", () => {
    const withDuplicate: readonly TreeNodeDescriptor[] = [
      { id: "a", label: "A", textValue: "A", children: [{ id: "a", label: "A2", textValue: "A2" }] },
    ];
    expect(() => validateTreeNodes(withDuplicate)).toThrow(/duplicate/i);
  });

  it("rejects an empty root list", () => {
    expect(() => validateTreeNodes([])).toThrow(/at least one/);
  });

  it("accepts the fixture tree", () => {
    expect(() => validateTreeNodes(nodes)).not.toThrow();
  });
});

describe("flattenTreeNodes", () => {
  it("visits every node depth-first, parent before children", () => {
    expect(flattenTreeNodes(nodes).map((node) => node.id)).toEqual([
      "hitter",
      "infield",
      "first-base",
      "second-base",
      "outfield",
      "left-field",
      "right-field",
      "pitcher",
    ]);
  });
});

describe("reconcileTreeExpansion", () => {
  it("keeps ids that still identify an expandable node", () => {
    const expanded = new Set(["hitter", "infield"]);
    expect(reconcileTreeExpansion(nodes, expanded)).toBe(expanded);
  });

  it("drops ids for leaves and ids absent from the tree", () => {
    const reconciled = reconcileTreeExpansion(
      nodes,
      new Set(["hitter", "pitcher", "missing", "first-base"]),
    );
    expect([...reconciled].sort()).toEqual(["hitter"]);
  });
});

describe("resolveTreeDescriptor", () => {
  it("rejects a malformed tree before deriving anything", () => {
    expect(() =>
      resolveTreeDescriptor([], new Set<string>(), { composeAccessibleName }),
    ).toThrow(/at least one/);
  });

  it("rejects a composer that is missing or returns empty copy", () => {
    expect(() =>
      resolveTreeDescriptor(nodes, new Set(), {
        composeAccessibleName: undefined as never,
      }),
    ).toThrow(/composeAccessibleName/);
    expect(() =>
      resolveTreeDescriptor(nodes, new Set(), { composeAccessibleName: () => "  " }),
    ).toThrow(/composeAccessibleName/);
  });

  it("assigns depth, sibling position and count, and parent linkage", () => {
    const resolved = resolve();
    const byId = new Map(resolved.map((node) => [node.id, node]));
    expect(byId.get("hitter")).toMatchObject({ depth: 1, position: 1, siblingCount: 2, parentId: null });
    expect(byId.get("pitcher")).toMatchObject({ depth: 1, position: 2, siblingCount: 2, parentId: null });
    expect(byId.get("infield")).toMatchObject({ depth: 2, position: 1, siblingCount: 2, parentId: "hitter" });
    expect(byId.get("first-base")).toMatchObject({ depth: 3, position: 1, siblingCount: 2, parentId: "infield" });
    expect(byId.get("right-field")).toMatchObject({ depth: 3, position: 2, siblingCount: 2, parentId: "outfield" });
  });

  it("marks hasChildren and never expands a leaf", () => {
    const resolved = resolve(new Set(["hitter", "pitcher"]));
    const byId = new Map(resolved.map((node) => [node.id, node]));
    expect(byId.get("hitter")).toMatchObject({ hasChildren: true, expanded: true });
    expect(byId.get("pitcher")).toMatchObject({ hasChildren: false, expanded: false });
  });

  it("marks a node visible only when every ancestor is expanded", () => {
    const collapsedAll = resolve();
    expect(collapsedAll.find((node) => node.id === "hitter")?.visible).toBe(true);
    expect(collapsedAll.find((node) => node.id === "infield")?.visible).toBe(false);
    expect(collapsedAll.find((node) => node.id === "first-base")?.visible).toBe(false);

    const oneLevel = resolve(new Set(["hitter"]));
    expect(oneLevel.find((node) => node.id === "infield")?.visible).toBe(true);
    expect(oneLevel.find((node) => node.id === "first-base")?.visible).toBe(false);

    const twoLevels = resolve(new Set(["hitter", "infield"]));
    expect(twoLevels.find((node) => node.id === "first-base")?.visible).toBe(true);
  });

  it("composes the accessible name from depth, sibling position, and expansion", () => {
    const composer = vi.fn(composeAccessibleName);
    const resolved = resolveTreeDescriptor(nodes, new Set(["hitter"]), {
      composeAccessibleName: composer,
    });
    expect(composer).toHaveBeenCalledWith({
      depth: 1,
      position: 1,
      siblingCount: 2,
      label: "야수",
      hasChildren: true,
      expanded: true,
    });
    expect(resolved.find((node) => node.id === "hitter")?.accessibleName).toBe(
      "1단계, 2개 중 1번째: 야수, 펼쳐짐",
    );
  });
});

function visibleOf(resolved: readonly ResolvedTreeNodeDescriptor[]) {
  return resolved.filter((node) => node.visible);
}

describe("getTreeArrowKeyIntent", () => {
  it("maps ArrowRight to expand and ArrowLeft to collapse in ltr", () => {
    expect(getTreeArrowKeyIntent("ArrowRight", "ltr")).toBe("expand");
    expect(getTreeArrowKeyIntent("ArrowLeft", "ltr")).toBe("collapse");
  });

  it("flips the mapping in rtl", () => {
    expect(getTreeArrowKeyIntent("ArrowRight", "rtl")).toBe("collapse");
    expect(getTreeArrowKeyIntent("ArrowLeft", "rtl")).toBe("expand");
  });

  it("returns undefined for keys it does not own", () => {
    expect(getTreeArrowKeyIntent("ArrowDown", "ltr")).toBeUndefined();
    expect(getTreeArrowKeyIntent("Enter", "ltr")).toBeUndefined();
  });
});

describe("getTreeArrowResult", () => {
  it("expands a collapsed branch instead of moving focus", () => {
    const visible = visibleOf(resolve());
    expect(getTreeArrowResult(visible, "hitter", "expand")).toEqual({ action: "expand" });
  });

  it("moves focus to the first child once already expanded", () => {
    const visible = visibleOf(resolve(new Set(["hitter"])));
    expect(getTreeArrowResult(visible, "hitter", "expand")).toEqual({
      action: "moveFocus",
      targetId: "infield",
    });
  });

  it("does nothing on expand for a leaf", () => {
    const visible = visibleOf(resolve());
    expect(getTreeArrowResult(visible, "pitcher", "expand")).toEqual({ action: "none" });
  });

  it("collapses an expanded branch instead of moving focus", () => {
    const visible = visibleOf(resolve(new Set(["hitter"])));
    expect(getTreeArrowResult(visible, "hitter", "collapse")).toEqual({ action: "collapse" });
  });

  it("moves focus to the parent when collapsing a leaf or already-collapsed branch", () => {
    const visible = visibleOf(resolve(new Set(["hitter"])));
    expect(getTreeArrowResult(visible, "infield", "collapse")).toEqual({
      action: "moveFocus",
      targetId: "hitter",
    });
  });

  it("does nothing on collapse at a root leaf", () => {
    const visible = visibleOf(resolve());
    expect(getTreeArrowResult(visible, "pitcher", "collapse")).toEqual({ action: "none" });
  });

  it("throws for a node that is not currently visible", () => {
    const visible = visibleOf(resolve());
    expect(() => getTreeArrowResult(visible, "infield", "expand")).toThrow(/visible/);
  });
});

describe("visible-node navigation reuses the collection helpers", () => {
  it("moves down and up across visible siblings, skipping collapsed descendants", () => {
    const visible = visibleOf(resolve(new Set(["hitter"])));
    expect(getVisibleTreeNavigationTarget(visible, "hitter", "next")).toBe("infield");
    expect(getVisibleTreeNavigationTarget(visible, "infield", "next")).toBe("outfield");
    expect(getVisibleTreeNavigationTarget(visible, "outfield", "previous")).toBe("infield");
  });

  it("moves from the last node of one branch into the next root sibling", () => {
    const visible = visibleOf(resolve(new Set(["hitter"])));
    expect(getVisibleTreeNavigationTarget(visible, "outfield", "next")).toBe("pitcher");
  });

  it("does not loop past the last visible node", () => {
    const visible = visibleOf(resolve(new Set(["hitter"])));
    expect(getVisibleTreeNavigationTarget(visible, "pitcher", "next")).toBe("pitcher");
  });

  it("jumps to the first and last visible node", () => {
    const visible = visibleOf(resolve(new Set(["hitter"])));
    expect(getVisibleTreeNavigationTarget(visible, "outfield", "first")).toBe("hitter");
    expect(getVisibleTreeNavigationTarget(visible, "hitter", "last")).toBe("pitcher");
  });

  it("matches typeahead only against currently visible nodes", () => {
    const visible = visibleOf(resolve());
    expect(getVisibleTreeTypeaheadMatch(visible, "투")).toBe("pitcher");
    expect(getVisibleTreeTypeaheadMatch(visible, "내야")).toBeUndefined();
  });
});

describe("Tree visual and behavior identity", () => {
  it("reuses the shared collection-item chrome instead of new row visuals", () => {
    expect(treeRecipe.node).toBe(collectionItemContract);
  });

  it("has no native surface, matching Breadcrumb and Tooltip", () => {
    expect(treeBehavior.native).toEqual({ roles: [], states: [], actions: [] });
  });

  it("has no drag-reorder or loop configuration anywhere in the contract", () => {
    expect(treeBehavior.controlled.join(" ")).not.toMatch(/drag|reorder/i);
    expect(Object.keys(treeRecipe)).not.toContain("loop");
  });

  it("keeps the toggle glyph hit target touch-safe", () => {
    expect(treeRecipe.toggle.hitTarget).toBeGreaterThanOrEqual(44);
  });
});
