import { describe, expect, it } from "vitest";
import { behaviorRegistry } from "../src/behaviors.js";
import { componentCatalog } from "../src/catalog.js";
import { validateCollapsibleOpenState } from "../src/collapsible.js";
import { resolveContextMenuAnchor, validateContextMenuAnchor } from "../src/context-menu.js";
import { resolveMenubarNavigation, validateMenubarDescriptor, type MenubarDescriptor } from "../src/menubar.js";
import { popoverBehaviorDefaults, popoverHoverDelay } from "../src/popover.js";

describe("Collapsible", () => {
  it("rejects a controlled state without a change handler", () => {
    expect(() => validateCollapsibleOpenState({ defaultOpen: true })).not.toThrow();
    expect(() => validateCollapsibleOpenState({ open: true } as never)).toThrow(/onOpenChange/);
    expect(() => validateCollapsibleOpenState({ open: true, defaultOpen: true } as never)).toThrow(/both/);
  });

  it("stays separate from Accordion, which keeps the multi-item case", () => {
    expect(componentCatalog.find((item) => item.name === "Collapsible")).toMatchObject({ recipe: "collapsibleRecipe" });
    expect(componentCatalog.find((item) => item.name === "Accordion")).toBeDefined();
  });
});

describe("ContextMenu", () => {
  it("anchors to the pointer, and to the focused box when opened by keyboard", () => {
    expect(resolveContextMenuAnchor("pointer", { x: 120, y: 80 }, null)).toEqual({ x: 120, y: 80 });
    // Without this a keyboard user gets a menu pinned to the viewport origin.
    expect(resolveContextMenuAnchor("keyboard", null, { left: 40, bottom: 200 })).toEqual({ x: 40, y: 200 });
    expect(() => resolveContextMenuAnchor("keyboard", null, null)).toThrow(/focused element rect/);
    expect(() => validateContextMenuAnchor({ x: Number.NaN, y: 0 })).toThrow(TypeError);
  });

  it("reuses Menu's item vocabulary and recipe", () => {
    expect(componentCatalog.find((item) => item.name === "ContextMenu")).toMatchObject({
      recipe: "menuRecipe",
      behavior: "contextMenu",
      platform: "web",
    });
    expect(behaviorRegistry.contextMenu.web.keyboard).toContain("Escape");
  });
});

const bar: MenubarDescriptor = {
  accessibilityLabel: "주요 메뉴",
  menus: [
    { id: "file", label: "파일", items: [{ id: "new", label: "새로 만들기", textValue: "새로 만들기" }] },
    { id: "edit", label: "편집", disabled: true, items: [{ id: "undo", label: "되돌리기", textValue: "되돌리기" }] },
    { id: "view", label: "보기", items: [{ id: "zoom", label: "확대", textValue: "확대" }] },
  ],
};

describe("Menubar", () => {
  it("skips disabled menus and cycles instead of stopping at the end", () => {
    expect(resolveMenubarNavigation(bar, "file", "next")).toBe("view");
    expect(resolveMenubarNavigation(bar, "view", "next")).toBe("file");
    expect(resolveMenubarNavigation(bar, "file", "previous")).toBe("view");
  });

  it("requires every menu to have a unique id and at least one item", () => {
    expect(() => validateMenubarDescriptor({ ...bar, menus: [] })).toThrow(RangeError);
    expect(() => validateMenubarDescriptor({ ...bar, menus: [{ id: "file", label: "파일", items: [] }] })).toThrow(/at least one item/);
    expect(() => validateMenubarDescriptor({ ...bar, menus: [bar.menus[0]!, bar.menus[0]!] })).toThrow(/Duplicate/);
  });

  it("is one roving tab stop, unlike a row of independent menus", () => {
    expect(behaviorRegistry.menubar.web.focus).toBe("roving");
    expect(behaviorRegistry.menubar.web.roles).toContain("menubar");
  });
});

describe("Popover hover axis", () => {
  it("defaults to press and delays the hover case", () => {
    expect(popoverBehaviorDefaults.openOn).toBe("press");
    // Opening on every passing pointer makes the screen flicker.
    expect(popoverHoverDelay.open).toBeGreaterThan(popoverHoverDelay.close);
  });
});
