import { describe, expect, it } from "vitest";
import { behaviorRegistry } from "../src/behaviors.js";
import { componentCatalog, recipeRegistry } from "../src/catalog.js";
import { bottomInfoRecipe, validateBottomInfoDescriptor } from "../src/bottom-info.js";
import { skipNavBehavior, skipNavRecipe, validateSkipNavDescriptor } from "../src/skip-nav.js";
import { sidebarDefaults, sidebarRecipe, validateSidebarDescriptor, type SidebarDescriptor } from "../src/sidebar.js";

describe("SkipNav", () => {
  it("rejects a target written with a leading hash instead of silently doubling it", () => {
    expect(() => validateSkipNavDescriptor({ targetId: "main", label: "본문 바로가기" })).not.toThrow();
    expect(() => validateSkipNavDescriptor({ targetId: "#main", label: "본문" })).toThrow(/bare id/);
    expect(() => validateSkipNavDescriptor({ targetId: "main", label: " " })).toThrow(TypeError);
  });

  it("is a Web-only link with a real touch target", () => {
    expect(skipNavBehavior.native.roles).toEqual([]);
    expect(skipNavRecipe.minHeight).toBeGreaterThanOrEqual(44);
    expect(componentCatalog.find((item) => item.name === "SkipNav")).toMatchObject({ platform: "web", recipe: "skipNavRecipe" });
    expect(behaviorRegistry.skipNav).toBe(skipNavBehavior);
  });
});

describe("BottomInfo", () => {
  it("requires at least one non-empty line", () => {
    expect(() => validateBottomInfoDescriptor({ items: [] })).toThrow(RangeError);
    expect(() => validateBottomInfoDescriptor({ items: [" "] })).toThrow(TypeError);
    expect(() => validateBottomInfoDescriptor({ items: ["수수료는 결제 시 확정됩니다"] })).not.toThrow();
  });

  it("carries no alarm tone, because it states a condition rather than a change", () => {
    expect(Object.keys(bottomInfoRecipe.tones).sort()).toEqual(["emphasis", "muted"]);
    expect(bottomInfoRecipe.defaults.tone).toBe("muted");
    expect(() => validateBottomInfoDescriptor({ items: ["a"], tone: "danger" as never })).toThrow(/Unsupported BottomInfo tone/);
    expect(recipeRegistry).toHaveProperty("bottomInfoRecipe");
  });
});

const sidebar: SidebarDescriptor = {
  accessibilityLabel: "주요 메뉴",
  currentId: "records",
  groups: [
    { id: "main", label: "기록", items: [{ id: "records", label: "내 기록" }, { id: "archive", label: "보관함", badgeCount: 3 }] },
    { id: "settings", items: [{ id: "profile", label: "프로필" }] },
  ],
};

describe("Sidebar", () => {
  it("rejects duplicate ids, empty groups and a current id that matches nothing", () => {
    expect(() => validateSidebarDescriptor(sidebar)).not.toThrow();
    expect(() => validateSidebarDescriptor({ ...sidebar, groups: [] })).toThrow(RangeError);
    expect(() => validateSidebarDescriptor({ ...sidebar, groups: [{ id: "main", items: [] }] })).toThrow(/at least one item/);
    expect(() => validateSidebarDescriptor({ ...sidebar, currentId: "nope" })).toThrow(/currentId/);
    expect(() =>
      validateSidebarDescriptor({
        ...sidebar,
        currentId: null,
        groups: [{ id: "a", items: [{ id: "x", label: "X" }] }, { id: "b", items: [{ id: "x", label: "X2" }] }],
      }),
    ).toThrow(/Duplicate Sidebar item id/);
  });

  it("treats collapsing as density, not as content", () => {
    expect(sidebarDefaults.collapsed).toBe(false);
    // Both widths exist, so the collapsed rail still has room for icon + badge.
    expect(sidebarRecipe.widths.collapsed).toBeGreaterThanOrEqual(sidebarRecipe.itemMinHeight);
    expect(sidebarRecipe.widths.expanded).toBeGreaterThan(sidebarRecipe.widths.collapsed);
  });

  it("stays Web-only and leaves the mobile destination case to BottomNavigation", () => {
    const entry = componentCatalog.find((item) => item.name === "Sidebar");
    expect(entry).toMatchObject({ category: "navigation", platform: "web", recipe: "sidebarRecipe" });
    expect(entry?.surfaceStatus).toMatchObject({ native: "unsupported" });
  });
});
