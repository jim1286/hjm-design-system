import { describe, expect, it } from "vitest";
import {
  breadcrumbBehaviorSpec,
  breadcrumbRecipe,
  resolveBreadcrumbDescriptor,
  validateBreadcrumbDescriptor,
  type BreadcrumbDescriptor,
} from "../src/breadcrumb.js";

const trail: BreadcrumbDescriptor = {
  items: [
    { id: "home", label: "홈", destination: { kind: "internal", href: "/" } },
    {
      id: "teams",
      label: "구단",
      destination: { kind: "internal", href: "/teams" },
    },
    { id: "lg", label: "LG 트윈스" },
  ],
};

describe("Breadcrumb descriptor", () => {
  it("accepts a trail whose ancestors are destinations and last item is current", () => {
    expect(() => validateBreadcrumbDescriptor(trail)).not.toThrow();
  });

  it("accepts a single current-only item with no ancestors", () => {
    expect(() =>
      validateBreadcrumbDescriptor({ items: [{ id: "lg", label: "LG 트윈스" }] }),
    ).not.toThrow();
  });

  it("rejects an empty trail", () => {
    expect(() => validateBreadcrumbDescriptor({ items: [] })).toThrow(
      /at least one/,
    );
  });

  it("rejects a duplicate id", () => {
    expect(() =>
      validateBreadcrumbDescriptor({
        items: [
          { id: "home", label: "홈", destination: { kind: "internal", href: "/" } },
          { id: "home", label: "다시 홈" },
        ],
      }),
    ).toThrow(/Duplicate/);
  });

  it("rejects an empty label", () => {
    expect(() =>
      validateBreadcrumbDescriptor({ items: [{ id: "lg", label: " " }] }),
    ).toThrow(/label/);
  });

  it("rejects the current item carrying a destination", () => {
    expect(() =>
      validateBreadcrumbDescriptor({
        items: [
          {
            id: "lg",
            label: "LG 트윈스",
            destination: { kind: "internal", href: "/teams/lg" },
          },
        ],
      }),
    ).toThrow(/must not have a destination/);
  });

  it("rejects an ancestor item missing a destination", () => {
    expect(() =>
      validateBreadcrumbDescriptor({
        items: [{ id: "teams", label: "구단" }, { id: "lg", label: "LG 트윈스" }],
      }),
    ).toThrow(/needs a destination/);
  });

  it("delegates ancestor destination shape to the Link contract", () => {
    expect(() =>
      validateBreadcrumbDescriptor({
        items: [
          {
            id: "teams",
            label: "구단",
            destination: { kind: "internal", href: "relative/without/slash" },
          },
          { id: "lg", label: "LG 트윈스" },
        ],
      }),
    ).toThrow(/Internal Link href/);
  });

  it("resolves current:true only on the last item and strips no ancestor destination", () => {
    const resolved = resolveBreadcrumbDescriptor(trail);
    expect(resolved.items.map((item) => item.current)).toEqual([
      false,
      false,
      true,
    ]);
    expect(resolved.items[2]).toEqual({ id: "lg", label: "LG 트윈스", current: true });
    expect(resolved.items[0]).toMatchObject({
      destination: { kind: "internal", href: "/" },
    });
  });
});

describe("Breadcrumb visual and behavior identity", () => {
  it("keeps separators decorative and out of the accessibility tree", () => {
    expect(breadcrumbRecipe.separator.decorative).toBe(true);
    expect(breadcrumbRecipe.slots).toContain("separator");
  });

  it("never declares a selection, expansion, or open state axis", () => {
    expect(breadcrumbBehaviorSpec.stateAxes).toEqual({});
    expect(breadcrumbBehaviorSpec.controlled).toEqual([]);
  });

  it("is web-only: no native role, state, or action is declared", () => {
    expect(breadcrumbBehaviorSpec.native).toEqual({
      roles: [],
      states: [],
      actions: [],
    });
    expect(breadcrumbBehaviorSpec.web.roles).toContain("navigation");
  });
});
