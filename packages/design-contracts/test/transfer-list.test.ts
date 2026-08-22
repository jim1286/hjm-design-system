import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { antDesignReferenceComponents } from "../src/component-references.js";
import { componentIds } from "../src/component-definitions.js";
import type { SelectItemDescriptor } from "../src/behaviors.js";
import {
  moveTransferListSelection,
  reconcileTransferListSelection,
  resolveTransferListFocusAfterMove,
  resolveTransferListPanels,
  resolveTransferListSelectAllState,
  toggleTransferListSelectAll,
  toggleTransferListSelection,
  transferListBehavior,
  validateTransferListDescriptor,
  validateTransferListSelection,
  type TransferListDescriptor,
  type TransferListSelection,
} from "../src/transfer-list.js";

const items: readonly SelectItemDescriptor[] = [
  { id: "kim", label: "김선수", textValue: "김선수" },
  { id: "lee", label: "이선수", textValue: "이선수" },
  { id: "park", label: "박선수", textValue: "박선수", disabled: true },
  { id: "choi", label: "최선수", textValue: "최선수" },
];

function makeDescriptor(targetKeys: ReadonlySet<string> = new Set<string>()): TransferListDescriptor {
  return { items, targetKeys };
}

const emptySelection: TransferListSelection = { source: new Set<string>(), target: new Set<string>() };

describe("validateTransferListDescriptor — inputs it must NOT reject", () => {
  it("accepts an empty targetKeys (nothing moved yet)", () => {
    expect(() => validateTransferListDescriptor(makeDescriptor())).not.toThrow();
  });

  it("accepts every item already in the target panel, leaving source empty", () => {
    expect(() =>
      validateTransferListDescriptor(makeDescriptor(new Set(items.map((i) => i.id)))),
    ).not.toThrow();
  });

  it("accepts a disabled item pre-placed in either panel", () => {
    expect(() => validateTransferListDescriptor(makeDescriptor(new Set(["park"])))).not.toThrow();
  });
});

describe("validateTransferListDescriptor — inputs it must reject", () => {
  it("rejects a targetKeys id that is not in items", () => {
    expect(() =>
      validateTransferListDescriptor(makeDescriptor(new Set(["ghost"]))),
    ).toThrow(/unknown item id/);
  });
});

describe("validateTransferListSelection", () => {
  it("accepts a selection whose ids all exist in their claimed panel", () => {
    const descriptor = makeDescriptor(new Set(["lee"]));
    expect(() =>
      validateTransferListSelection(descriptor, { source: new Set(["kim"]), target: new Set(["lee"]) }),
    ).not.toThrow();
  });

  it("rejects a selection id that has already moved out of the panel it claims", () => {
    const descriptor = makeDescriptor(new Set(["lee"]));
    expect(() =>
      validateTransferListSelection(descriptor, { source: new Set(["lee"]), target: new Set<string>() }),
    ).toThrow(/unknown item id/);
  });
});

describe("resolveTransferListPanels", () => {
  it("splits by targetKeys membership, preserving items order within each panel", () => {
    const panels = resolveTransferListPanels(makeDescriptor(new Set(["lee"])));
    expect(panels.source.map((i) => i.id)).toEqual(["kim", "park", "choi"]);
    expect(panels.target.map((i) => i.id)).toEqual(["lee"]);
  });
});

describe("toggleTransferListSelection", () => {
  it("toggles only within the given panel, leaving the other panel's selection untouched", () => {
    const selection = toggleTransferListSelection(
      makeDescriptor(new Set(["lee"])),
      { source: new Set<string>(), target: new Set(["lee"]) },
      "source",
      "kim",
    );
    expect(selection.source).toEqual(new Set(["kim"]));
    expect(selection.target).toEqual(new Set(["lee"]));
  });

  it("no-ops when toggling a disabled item", () => {
    const descriptor = makeDescriptor();
    const selection = toggleTransferListSelection(descriptor, emptySelection, "source", "park");
    expect(selection.source.size).toBe(0);
  });
});

describe("resolveTransferListSelectAllState / toggleTransferListSelectAll", () => {
  it("excludes disabled items from the denominator and the count", () => {
    const descriptor = makeDescriptor();
    const selected = toggleTransferListSelection(
      descriptor,
      toggleTransferListSelection(descriptor, emptySelection, "source", "kim"),
      "source",
      "choi",
    );
    // kim, choi selected; lee not selected; park disabled and excluded.
    expect(resolveTransferListSelectAllState(descriptor, selected, "source")).toBe("mixed");

    const allSelected = toggleTransferListSelection(descriptor, selected, "source", "lee");
    expect(resolveTransferListSelectAllState(descriptor, allSelected, "source")).toBe(true);
  });

  it("mixed select-all defaults to checking every enabled item in the panel", () => {
    const descriptor = makeDescriptor();
    const partial = toggleTransferListSelection(descriptor, emptySelection, "source", "kim");
    const next = toggleTransferListSelectAll(descriptor, partial, "source");
    expect(next.source).toEqual(new Set(["kim", "lee", "choi"]));
  });

  it("a fully-checked select-all unchecks the whole panel", () => {
    const descriptor = makeDescriptor();
    const full = { source: new Set(["kim", "lee", "choi"]), target: new Set<string>() };
    const next = toggleTransferListSelectAll(descriptor, full, "source");
    expect(next.source.size).toBe(0);
  });
});

describe("moveTransferListSelection", () => {
  it("moves selected enabled ids from source to target, skipping disabled ones", () => {
    const descriptor = makeDescriptor();
    const selection: TransferListSelection = {
      source: new Set(["kim", "park", "choi"]),
      target: new Set<string>(),
    };
    const result = moveTransferListSelection(descriptor, selection, "toTarget");
    expect(result.movedIds).toEqual(["kim", "choi"]);
    expect(result.targetKeys).toEqual(new Set(["kim", "choi"]));
    // park was selected but disabled, so it never moved — only the ids that
    // actually moved are cleared from the origin panel's selection.
    expect(result.selection.source).toEqual(new Set(["park"]));
    expect(result.selection.target.size).toBe(0);
  });

  it("returns the same targetKeys and selection reference when nothing is selected", () => {
    const descriptor = makeDescriptor();
    const result = moveTransferListSelection(descriptor, emptySelection, "toTarget");
    expect(result.movedIds).toEqual([]);
    expect(result.targetKeys).toBe(descriptor.targetKeys);
    expect(result.selection).toBe(emptySelection);
  });

  it("moves back to source and clears the target panel's selection for the moved ids", () => {
    const descriptor = makeDescriptor(new Set(["kim", "lee", "choi"]));
    const selection: TransferListSelection = { source: new Set<string>(), target: new Set(["lee"]) };
    const result = moveTransferListSelection(descriptor, selection, "toSource");
    expect(result.movedIds).toEqual(["lee"]);
    expect(result.targetKeys).toEqual(new Set(["kim", "choi"]));
    expect(result.selection.target.size).toBe(0);
  });

  it("does not pre-select moved items in the destination panel", () => {
    const descriptor = makeDescriptor();
    const selection: TransferListSelection = { source: new Set(["kim"]), target: new Set<string>() };
    const result = moveTransferListSelection(descriptor, selection, "toTarget");
    expect(result.selection.target.has("kim")).toBe(false);
  });
});

describe("resolveTransferListFocusAfterMove", () => {
  it("lands on the item that slid into the removed row's position", () => {
    const remaining: readonly SelectItemDescriptor[] = [
      { id: "lee", label: "이", textValue: "이" },
      { id: "choi", label: "최", textValue: "최" },
    ];
    expect(resolveTransferListFocusAfterMove(remaining, 0)).toBe("lee");
  });

  it("clamps to the last remaining item when the removed row was at the end", () => {
    const remaining: readonly SelectItemDescriptor[] = [
      { id: "lee", label: "이", textValue: "이" },
    ];
    expect(resolveTransferListFocusAfterMove(remaining, 3)).toBe("lee");
  });

  it("returns null when the panel is now empty", () => {
    expect(resolveTransferListFocusAfterMove([], 0)).toBeNull();
  });
});

describe("reconcileTransferListSelection", () => {
  it("drops a selected id that left the item collection entirely", () => {
    const descriptor = makeDescriptor();
    const selection: TransferListSelection = { source: new Set(["kim", "ghost"]), target: new Set<string>() };
    const reconciled = reconcileTransferListSelection(descriptor, selection);
    expect(reconciled.source).toEqual(new Set(["kim"]));
  });

  it("returns the same reference when nothing changed", () => {
    const descriptor = makeDescriptor();
    const selection: TransferListSelection = { source: new Set(["kim"]), target: new Set<string>() };
    expect(reconcileTransferListSelection(descriptor, selection)).toBe(selection);
  });
});

describe("TransferList self-contained contract", () => {
  it("keeps a non-empty, deduplicated behavior scenario list", () => {
    expect(transferListBehavior.scenarios.length).toBeGreaterThan(0);
    expect(new Set(transferListBehavior.scenarios).size).toBe(transferListBehavior.scenarios.length);
  });
});

describe("TransferList catalog and crosswalk stay untouched", () => {
  it("still reserves TransferList as planned/adaptive/input with the Transfer alias", () => {
    const entry = componentCatalog.find((item) => item.name === "TransferList");
    expect(entry).toMatchObject({
      category: "input",
      platform: "adaptive",
      status: "planned",
      aliases: ["Transfer"],
    });
  });

  it("keeps the antd Transfer crosswalk pointed at TransferList", () => {
    const entry = antDesignReferenceComponents.find((item) => item.name === "Transfer");
    expect(entry).toMatchObject({ targets: [componentIds.TransferList], relationship: "adapted" });
  });
});

describe("registry entry stays in step with the module", () => {
  it("matches behaviorRegistry.transferList", async () => {
    // behaviors.ts는 순환을 피하려고 transferListBehavior를 import하지 않고
    // 같은 내용을 직접 담는다. 한쪽만 고쳐지는 것을 여기서 막는다.
    const { behaviorRegistry } = await import("../src/behaviors.js");
    expect(behaviorRegistry.transferList).toEqual(transferListBehavior);
  });
});
