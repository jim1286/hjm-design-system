import { describe, expect, it } from "vitest";
import {
  agreementBehavior,
  agreementRecipe,
  reconcileAgreementSelection,
  resolveAgreementState,
  toggleAgreementAll,
  toggleAgreementItem,
  validateAgreementDescriptor,
  type AgreementDescriptor,
} from "../src/agreement.js";
import { behaviorRegistry } from "../src/behaviors.js";
import { componentCatalog, recipeRegistry } from "../src/catalog.js";

const descriptor: AgreementDescriptor = {
  accessibilityLabel: "약관 동의",
  allLabel: "전체 동의하기",
  items: [
    { id: "terms", label: "서비스 이용약관", required: true, detail: { label: "전문 보기", href: "/legal/terms" } },
    { id: "privacy", label: "개인정보 처리방침", required: true, detail: { label: "전문 보기", href: "/legal/privacy" } },
    { id: "marketing", label: "마케팅 정보 수신", description: "언제든 끌 수 있어요" },
  ],
};

describe("Agreement descriptor", () => {
  it("rejects an empty list, duplicate ids, and empty copy", () => {
    expect(() => validateAgreementDescriptor({ ...descriptor, items: [] })).toThrow(RangeError);
    expect(() => validateAgreementDescriptor({ ...descriptor, allLabel: " " })).toThrow(TypeError);
    expect(() =>
      validateAgreementDescriptor({
        ...descriptor,
        items: [descriptor.items[0]!, descriptor.items[0]!],
      }),
    ).toThrow(/Duplicate Agreement item id/);
  });

  it("rejects a required item that can never be checked", () => {
    expect(() =>
      validateAgreementDescriptor({
        ...descriptor,
        items: [{ id: "terms", label: "이용약관", required: true, disabled: true }],
      }),
    ).toThrow(/cannot be both required and disabled/);
  });
});

describe("Agreement state", () => {
  it("derives all-agree from the items and never stores it", () => {
    expect(resolveAgreementState(descriptor, new Set()).all).toBe(false);
    expect(resolveAgreementState(descriptor, new Set(["terms"])).all).toBe("mixed");
    expect(resolveAgreementState(descriptor, new Set(["terms", "privacy", "marketing"])).all).toBe(true);
  });

  it("lets only required items decide whether the product may submit", () => {
    const partial = resolveAgreementState(descriptor, new Set(["terms", "marketing"]));
    expect(partial.satisfied).toBe(false);
    expect(partial.missingRequiredIds).toEqual(["privacy"]);

    const required = resolveAgreementState(descriptor, new Set(["terms", "privacy"]));
    expect(required.satisfied).toBe(true);
    // Optional consent never blocks submission, even though all-agree is mixed.
    expect(required.all).toBe("mixed");
  });

  it("keeps disabled items out of the all-agree denominator and out of the toggle", () => {
    const withLocked: AgreementDescriptor = {
      ...descriptor,
      items: [...descriptor.items, { id: "locked", label: "이미 동의함", disabled: true }],
    };
    expect(resolveAgreementState(withLocked, new Set(["terms", "privacy", "marketing"])).all).toBe(true);
    const next = toggleAgreementAll(withLocked, new Set());
    expect([...next].sort()).toEqual(["marketing", "privacy", "terms"]);
    expect(toggleAgreementItem(withLocked, new Set(), "locked").has("locked")).toBe(false);
  });

  it("checks every enabled item from mixed and clears them all from checked", () => {
    const fromMixed = toggleAgreementAll(descriptor, new Set(["terms"]));
    expect([...fromMixed].sort()).toEqual(["marketing", "privacy", "terms"]);
    expect([...toggleAgreementAll(descriptor, fromMixed)]).toEqual([]);
  });

  it("drops consent for an item that left the list", () => {
    const reduced: AgreementDescriptor = { ...descriptor, items: [descriptor.items[0]!] };
    expect([...reconcileAgreementSelection(reduced, new Set(["terms", "marketing"]))]).toEqual(["terms"]);
  });
});

describe("Agreement catalog wiring", () => {
  it("binds the recipe and behavior the catalog declares", () => {
    const entry = componentCatalog.find((item) => item.name === "Agreement");
    expect(entry).toMatchObject({ category: "input", platform: "adaptive", recipe: "agreementRecipe", behavior: "agreement" });
    expect(recipeRegistry).toHaveProperty("agreementRecipe");
    expect(behaviorRegistry.agreement).toBe(agreementBehavior);
    expect(agreementRecipe.item.minHeight).toBeGreaterThanOrEqual(44);
  });
});
