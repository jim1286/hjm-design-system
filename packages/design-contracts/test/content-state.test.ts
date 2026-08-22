import { describe, expect, it, vi } from "vitest";
import {
  resolveContentStateActionEmphasis,
  resolveContentStateAnnouncement,
  resolveContentStateDescriptor,
  validateContentStateDescriptor,
  type ContentStateDescriptor,
} from "../src/content-state.js";

describe("ContentState validator — must not reject what it should allow", () => {
  it("allows a loading descriptor with no title, description, or action", () => {
    const loading: ContentStateDescriptor = {
      status: "loading",
      scope: "region",
      loadingLabel: "불러오는 중",
    };
    expect(() => validateContentStateDescriptor(loading)).not.toThrow();
  });

  it("allows a screen-scope error with zero actions — chrome's back button is the real exit, not this action", () => {
    const deadEnd: ContentStateDescriptor = {
      status: "error",
      scope: "screen",
      title: "불러오지 못했어요",
    };
    expect(() => validateContentStateDescriptor(deadEnd)).not.toThrow();
  });

  it("allows a region-scope empty block with only a title", () => {
    const bare: ContentStateDescriptor = {
      status: "empty",
      scope: "region",
      title: "표시할 정보가 없어요",
    };
    expect(() => validateContentStateDescriptor(bare)).not.toThrow();
  });
});

describe("ContentState validator — rejects malformed descriptors", () => {
  it("rejects an unsupported scope", () => {
    expect(() =>
      validateContentStateDescriptor({
        status: "empty",
        scope: "full" as never,
        title: "표시할 정보가 없어요",
      }),
    ).toThrow(/scope/);
  });

  it("rejects an unsupported status", () => {
    expect(() =>
      validateContentStateDescriptor({
        status: "success" as never,
        scope: "region",
      } as never),
    ).toThrow(/status/);
  });

  it("rejects an empty loadingLabel", () => {
    expect(() =>
      validateContentStateDescriptor({
        status: "loading",
        scope: "screen",
        loadingLabel: " ",
      }),
    ).toThrow(/loadingLabel/);
  });

  it("rejects a whitespace-only title on an error block", () => {
    expect(() =>
      validateContentStateDescriptor({
        status: "error",
        scope: "screen",
        title: " ",
      }),
    ).toThrow(/title/);
  });

  it("rejects an action whose onAction is not a function", () => {
    expect(() =>
      validateContentStateDescriptor({
        status: "error",
        scope: "region",
        title: "불러오지 못했어요",
        action: { label: "다시 시도", onAction: undefined as never },
      }),
    ).toThrow(/onAction/);
  });
});

describe("ContentState action emphasis", () => {
  it("marks screen scope as the sole action and region scope as optional", () => {
    expect(resolveContentStateActionEmphasis("screen")).toBe("sole");
    expect(resolveContentStateActionEmphasis("region")).toBe("optional");
  });
});

describe("ContentState announcement", () => {
  it("never moves accessibility focus for loading, regardless of scope", () => {
    expect(
      resolveContentStateAnnouncement("loading", "screen").native
        .moveAccessibilityFocus,
    ).toBe(false);
    expect(
      resolveContentStateAnnouncement("loading", "region").native
        .moveAccessibilityFocus,
    ).toBe(false);
  });

  it("never moves accessibility focus for empty, even at screen scope — empty is an invitation, not an interruption", () => {
    expect(
      resolveContentStateAnnouncement("empty", "screen").native
        .moveAccessibilityFocus,
    ).toBe(false);
    expect(
      resolveContentStateAnnouncement("empty", "region").native
        .moveAccessibilityFocus,
    ).toBe(false);
  });

  it("moves accessibility focus for a screen-scope error but never for a region-scope error", () => {
    expect(
      resolveContentStateAnnouncement("error", "screen").native
        .moveAccessibilityFocus,
    ).toBe(true);
    expect(
      resolveContentStateAnnouncement("error", "region").native
        .moveAccessibilityFocus,
    ).toBe(false);
  });

  it("always announces error as assertive/alert on both platforms, independent of scope", () => {
    for (const scope of ["screen", "region"] as const) {
      const { web, native } = resolveContentStateAnnouncement("error", scope);
      expect(web).toEqual({ role: "alert", live: "assertive" });
      expect(native.accessibilityLiveRegion).toBe("assertive");
      expect(native.accessibilityRole).toBe("alert");
    }
  });

  it("announces loading as a polite progressbar and empty as a polite, non-alert block", () => {
    expect(resolveContentStateAnnouncement("loading", "region").native).toMatchObject(
      { accessibilityLiveRegion: "polite", accessibilityRole: "progressbar" },
    );
    expect(resolveContentStateAnnouncement("empty", "region").native).toMatchObject({
      accessibilityLiveRegion: "polite",
      accessibilityRole: "text",
    });
  });
});

describe("ContentState resolver", () => {
  it("resolves a loading descriptor with title/description/action left null", () => {
    const resolved = resolveContentStateDescriptor({
      status: "loading",
      scope: "screen",
      loadingLabel: "불러오는 중",
    });
    expect(resolved.title).toBeNull();
    expect(resolved.description).toBeNull();
    expect(resolved.action).toBeNull();
    expect(resolved.loadingLabel).toBe("불러오는 중");
  });

  it("defaults an action's accessibilityLabel to its label and tags emphasis by scope", () => {
    const onAction = vi.fn();
    const screenResolved = resolveContentStateDescriptor({
      status: "error",
      scope: "screen",
      title: "불러오지 못했어요",
      action: { label: "다시 시도", onAction },
    });
    expect(screenResolved.action).toMatchObject({
      label: "다시 시도",
      accessibilityLabel: "다시 시도",
      emphasis: "sole",
    });

    const regionResolved = resolveContentStateDescriptor({
      status: "error",
      scope: "region",
      title: "불러오지 못했어요",
      action: { label: "다시 시도", onAction },
    });
    expect(regionResolved.action).toMatchObject({ emphasis: "optional" });
  });

  it("resolves description to null when omitted and preserves it when given", () => {
    const withDescription = resolveContentStateDescriptor({
      status: "empty",
      scope: "region",
      title: "표시할 정보가 없어요",
      description: "조건을 바꾸면 다시 채워져요.",
    });
    expect(withDescription.description).toBe("조건을 바꾸면 다시 채워져요.");

    const withoutDescription = resolveContentStateDescriptor({
      status: "empty",
      scope: "region",
      title: "표시할 정보가 없어요",
    });
    expect(withoutDescription.description).toBeNull();
    expect(withoutDescription.action).toBeNull();
  });
});
