import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { iconButtonRecipe } from "../src/component-recipes.js";
import {
  floatingActionButtonBehaviorDefaults,
  floatingActionButtonBehaviorScenarios,
  floatingActionButtonRecipe,
  resolveFloatingActionButtonContentClearance,
  resolveFloatingActionButtonDescriptor,
  resolveFloatingActionButtonLayoutMode,
  validateFloatingActionButtonDescriptor,
  type FloatingActionButtonDescriptor,
} from "../src/floating-action-button.js";

const base: FloatingActionButtonDescriptor = {
  icon: { name: "add" },
  label: "새 기록 추가",
};

describe("FloatingActionButton descriptor", () => {
  it("rejects an empty or padded label", () => {
    expect(() =>
      validateFloatingActionButtonDescriptor({ ...base, label: "" }),
    ).toThrow(/label/);
    expect(() =>
      validateFloatingActionButtonDescriptor({ ...base, label: " padded " }),
    ).toThrow(/whitespace/);
  });

  it("rejects icon overrides the recipe must own, not the call site", () => {
    expect(() =>
      validateFloatingActionButtonDescriptor({
        ...base,
        icon: { name: "add", size: "large" } as never,
      }),
    ).toThrow(/Unsupported FloatingActionButton icon field/);
    expect(() =>
      validateFloatingActionButtonDescriptor({
        ...base,
        icon: { name: "add", decorative: false } as never,
      }),
    ).toThrow(/decorative/);
  });

  it("rejects an unsupported layoutMode and unknown descriptor fields", () => {
    expect(() =>
      validateFloatingActionButtonDescriptor({
        ...base,
        layoutMode: "mini" as never,
      }),
    ).toThrow(/layoutMode/);
    expect(() =>
      validateFloatingActionButtonDescriptor({
        ...base,
        tone: "danger",
      } as never),
    ).toThrow(/Unsupported FloatingActionButton descriptor field/);
  });

  it("accepts a minimal descriptor and a product-extended icon name", () => {
    expect(() => validateFloatingActionButtonDescriptor(base)).not.toThrow();
    const extended: FloatingActionButtonDescriptor<"kboAdd"> = {
      icon: { name: "kboAdd" },
      label: "선수 추가",
    };
    expect(() => validateFloatingActionButtonDescriptor(extended)).not.toThrow();
  });

  it("keeps the full label as the accessible name in both layout modes", () => {
    const expanded = resolveFloatingActionButtonDescriptor(base);
    expect(expanded.layoutMode).toBe(floatingActionButtonBehaviorDefaults.layoutMode);
    expect(expanded.resolvedAccessibilityLabel).toBe(base.label);

    const collapsed = resolveFloatingActionButtonDescriptor({
      ...base,
      layoutMode: "collapsed",
    });
    expect(collapsed.layoutMode).toBe("collapsed");
    expect(collapsed.resolvedAccessibilityLabel).toBe(base.label);
    expect(collapsed.icon).toEqual({ name: "add", decorative: true });
  });
});

describe("FloatingActionButton scroll-driven layout mode", () => {
  it("collapses away from the start and expands toward it", () => {
    expect(resolveFloatingActionButtonLayoutMode("away-from-start", "expanded")).toBe(
      "collapsed",
    );
    expect(resolveFloatingActionButtonLayoutMode("toward-start", "collapsed")).toBe(
      "expanded",
    );
  });

  it("keeps the previous mode on an idle signal instead of guessing", () => {
    expect(resolveFloatingActionButtonLayoutMode("idle", "collapsed")).toBe("collapsed");
    expect(resolveFloatingActionButtonLayoutMode("idle", "expanded")).toBe("expanded");
    expect(resolveFloatingActionButtonLayoutMode("idle")).toBe(
      floatingActionButtonBehaviorDefaults.layoutMode,
    );
  });

  it("rejects an unsupported scroll signal or layout mode", () => {
    expect(() =>
      resolveFloatingActionButtonLayoutMode("sideways" as never),
    ).toThrow(/scroll signal/);
    expect(() =>
      resolveFloatingActionButtonLayoutMode("idle", "mini" as never),
    ).toThrow(/layoutMode/);
  });
});

describe("FloatingActionButton content clearance", () => {
  it("adds the safe-area inset to the fixed footprint instead of clamping it", () => {
    const withoutInset = resolveFloatingActionButtonContentClearance(0);
    const withInset = resolveFloatingActionButtonContentClearance(34);
    expect(withInset - withoutInset).toBe(34);
    expect(withoutInset).toBe(
      floatingActionButtonRecipe.circle.diameter + floatingActionButtonRecipe.margin * 2,
    );
  });

  it("rejects a negative or non-finite inset", () => {
    expect(() => resolveFloatingActionButtonContentClearance(-1)).toThrow(RangeError);
    expect(() => resolveFloatingActionButtonContentClearance(Number.NaN)).toThrow(
      RangeError,
    );
  });
});

describe("FloatingActionButton visual recipe", () => {
  it("reuses IconButton's large tier and Button's large label instead of forking new tokens", () => {
    expect(floatingActionButtonRecipe.circle).toBe(iconButtonRecipe.sizes.large);
    expect(floatingActionButtonRecipe.tone).toBe(iconButtonRecipe.tones.primary);
    expect(floatingActionButtonRecipe.shape).toBe(iconButtonRecipe.shapes.circle);
    expect(floatingActionButtonRecipe.expandedLabel.textVariant).toBe(
      buttonRecipe.sizes.large.textVariant,
    );
    expect(floatingActionButtonRecipe.expandedLabel.paddingHorizontal).toBe(
      buttonRecipe.sizes.large.paddingHorizontal,
    );
  });

  it("keeps a self-contained, non-empty behavior scenario list for the lead to wire", () => {
    expect(floatingActionButtonBehaviorScenarios.length).toBeGreaterThan(0);
    expect(new Set(floatingActionButtonBehaviorScenarios).size).toBe(
      floatingActionButtonBehaviorScenarios.length,
    );
  });
});

describe("FloatingActionButton catalog stays untouched", () => {
  it("still reserves FloatingActionButton as planned/adaptive/action", () => {
    const entry = componentCatalog.find((item) => item.name === "FloatingActionButton");
    expect(entry).toMatchObject({
      category: "action",
      platform: "adaptive",
      status: "planned",
    });
  });
});

import { buttonRecipe } from "../src/recipes.js";

describe("expanded label stays on Button's large tier", () => {
  it("matches buttonRecipe.sizes.large without importing it at runtime", () => {
    // floating-action-button.ts는 순환을 피하려고 buttonRecipe를 import하지 않는다.
    // 그래서 두 값이 같다는 사실을 여기서 잠근다 — Button의 large 티어가 바뀌면
    // 이 테스트가 먼저 깨져서 FAB도 따라가야 한다는 것을 알린다.
    expect(floatingActionButtonRecipe.expandedLabel.textVariant).toBe(
      buttonRecipe.sizes.large.textVariant,
    );
    expect(floatingActionButtonRecipe.expandedLabel.paddingHorizontal).toBe(
      buttonRecipe.sizes.large.paddingHorizontal,
    );
  });
});
