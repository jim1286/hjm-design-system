import { describe, expect, it } from "vitest";
import {
  layoutBehavior,
  layoutRecipe,
  resolveLayoutWebLandmarks,
  validateLayoutDescriptor,
  type LayoutDescriptor,
} from "../src/layout.js";

describe("Layout descriptor validation", () => {
  it("accepts the minimal shell: main only", () => {
    expect(() => validateLayoutDescriptor({})).not.toThrow();
  });

  it("rejects an unsupported sidebar role or mode", () => {
    expect(() =>
      validateLayoutDescriptor({
        sidebar: { role: "aside" as never, mode: "persistent", label: "Filters" },
      }),
    ).toThrow(/role/);
    expect(() =>
      validateLayoutDescriptor({
        sidebar: { role: "navigation", mode: "modal" as never, label: "Filters" },
      }),
    ).toThrow(/mode/);
  });

  it("rejects an empty sidebar label or skipLinkLabel", () => {
    expect(() =>
      validateLayoutDescriptor({
        sidebar: { role: "navigation", mode: "persistent", label: " " },
        skipLinkLabel: "본문으로 건너뛰기",
      }),
    ).toThrow(/label/);
    expect(() =>
      validateLayoutDescriptor({ hasHeader: true, skipLinkLabel: " " }),
    ).toThrow(/skipLinkLabel/);
  });

  it("requires a skip link whenever a header or sidebar precedes main", () => {
    expect(() => validateLayoutDescriptor({ hasHeader: true })).toThrow(/skipLinkLabel/);
    expect(() =>
      validateLayoutDescriptor({
        sidebar: { role: "navigation", mode: "persistent", label: "Sidebar" },
      }),
    ).toThrow(/skipLinkLabel/);
    expect(() =>
      validateLayoutDescriptor({ hasHeader: true, skipLinkLabel: "본문으로 건너뛰기" }),
    ).not.toThrow();
  });

  it("does not require a skip link when only a footer is present", () => {
    expect(() => validateLayoutDescriptor({ hasFooter: true })).not.toThrow();
  });
});

describe("resolveLayoutWebLandmarks", () => {
  it("always includes exactly one main landmark", () => {
    expect(resolveLayoutWebLandmarks({})).toEqual(["main"]);
  });

  it("orders banner, sidebar role, main, contentinfo", () => {
    const descriptor: LayoutDescriptor = {
      hasHeader: true,
      hasFooter: true,
      sidebar: { role: "complementary", mode: "persistent", label: "Filters" },
      skipLinkLabel: "본문으로 건너뛰기",
    };
    expect(resolveLayoutWebLandmarks(descriptor)).toEqual([
      "banner",
      "complementary",
      "main",
      "contentinfo",
    ]);
  });

  it("uses the sidebar's declared role regardless of persistent/overlay mode", () => {
    const persistent: LayoutDescriptor = {
      sidebar: { role: "navigation", mode: "persistent", label: "Nav" },
      skipLinkLabel: "본문으로 건너뛰기",
    };
    const overlay: LayoutDescriptor = {
      sidebar: { role: "navigation", mode: "overlay", label: "Nav" },
      skipLinkLabel: "본문으로 건너뛰기",
    };
    expect(resolveLayoutWebLandmarks(persistent)).toEqual(["navigation", "main"]);
    expect(resolveLayoutWebLandmarks(overlay)).toEqual(["navigation", "main"]);
  });
});

describe("Layout visual and behavior contract", () => {
  it("hides the skip link until keyboard focus reaches it", () => {
    expect(layoutRecipe.skipLink.visibility).toBe("focus-only");
  });

  it("does not own the sidebar's open/dismiss state — composes SidePanel instead", () => {
    expect(layoutBehavior.controlled).toEqual([]);
  });

  it("declares no native surface — landmark roles have no RN equivalent", () => {
    expect(layoutBehavior.native).toEqual({ roles: [], states: [], actions: [] });
  });
});
