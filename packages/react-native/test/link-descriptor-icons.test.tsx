import { glyph } from "@hjmds/design-contracts/foundations";
import { linkRecipe } from "@hjmds/design-contracts/recipes";
import type { ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import { HjmNativeProvider, Link, Text, type LinkProps } from "../src/index.js";
import { resetDeprecatedStyleWarningsForTest } from "../src/internal/deprecated-style.js";

// Regression: until 1.12 Native Link validated descriptor.leadingIcon/trailingIcon but never drew
// them (docs/link.md "Icon과 접근성"), so a descriptor shared with Web lost its chevron.

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(node: ReactElement, direction: "ltr" | "rtl" = "ltr"): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HjmNativeProvider direction={direction} reducedMotion theme="light">{node}</HjmNativeProvider>);
  });
  return renderer!;
}

function flatten(style: unknown): Record<string, unknown> {
  const resolved = typeof style === "function" ? style({ pressed: false }) : style;
  if (!Array.isArray(resolved)) return (resolved ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...resolved.map(flatten));
}

const base = {
  label: "프로필 보기",
  destination: { kind: "internal", href: "/u/jimin" },
} as const;

let warn: MockInstance<typeof console.warn>;
beforeEach(() => {
  resetDeprecatedStyleWarningsForTest();
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe("Native Link descriptor icons", () => {
  it("draws leading and trailing semantic icons through renderIcon with linkRecipe size and link tone", () => {
    const renderIcon = vi.fn<NonNullable<LinkProps["renderIcon"]>>(({ name }) => <View testID={`glyph-${name}`} />);
    const renderer = render(
      <Link
        descriptor={{ ...base, leadingIcon: { name: "info" }, trailingIcon: { name: "chevronEnd" } }}
        onNavigate={vi.fn()}
        renderIcon={renderIcon}
      />,
    );
    expect(renderIcon.mock.calls.map(([props]) => props.name)).toEqual(["info", "chevronEnd"]);
    const size = glyph[linkRecipe.icon.glyph];
    for (const [props] of renderIcon.mock.calls) expect(props.size).toBe(size);
    // The icon inherits the link tone, the same color as the visible label.
    const label = renderer.root.findAllByType(Text).find((node) => node.props.children === base.label)!;
    expect(renderIcon.mock.calls[0]![0].color).toBe(flatten(label.props.style).color);
    const order = renderer.root.findAll((node) =>
      node.props.testID === "glyph-info" || node.props.testID === "glyph-chevronEnd" || node.props.children === base.label)
      .filter((node) => typeof node.type === "string" || node.props.testID !== undefined)
      .map((node) => node.props.testID ?? "label");
    expect(order.indexOf("glyph-info")).toBeLessThan(order.indexOf("glyph-chevronEnd"));
    // Icons are decorative: the link keeps one accessible name.
    const link = renderer.root.find((node) => node.props.accessibilityRole === "link");
    expect(link.props.accessibilityLabel).toBe(base.label);
    expect(warn).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  it("mirrors logical chevrons in RTL through Icon", () => {
    const renderer = render(
      <Link
        descriptor={{ ...base, trailingIcon: { name: "chevronEnd" } }}
        onNavigate={vi.fn()}
        renderIcon={({ name }) => <View testID={`glyph-${name}`} />}
      />,
      "rtl",
    );
    const glyphNode = renderer.root.findByProps({ testID: "glyph-chevronEnd" });
    let frame = glyphNode.parent;
    let mirrored = false;
    while (frame) {
      const transform = flatten(frame.props.style).transform as ReadonlyArray<Record<string, number>> | undefined;
      if (transform?.some((entry) => entry.scaleX === -1)) mirrored = true;
      frame = frame.parent;
    }
    expect(mirrored).toBe(true);
    act(() => renderer.unmount());
  });

  it("warns once instead of crashing when an icon has no renderIcon", () => {
    const node = <Link descriptor={{ ...base, trailingIcon: { name: "chevronEnd" } }} onNavigate={vi.fn()} />;
    const first = render(node);
    act(() => first.unmount());
    const second = render(node);
    act(() => second.unmount());
    const messages = warn.mock.calls.map((call) => String(call[0]));
    expect(messages.filter((message) => message.includes("descriptor.trailingIcon needs renderIcon"))).toHaveLength(1);
  });

  it("lets the descriptor icon own the slot when a leading node is also passed", () => {
    const renderer = render(
      <Link
        descriptor={{ ...base, leadingIcon: { name: "info" } }}
        leading={<View testID="product-leading" />}
        onNavigate={vi.fn()}
        renderIcon={({ name }) => <View testID={`glyph-${name}`} />}
      />,
    );
    expect(renderer.root.findAllByProps({ testID: "product-leading" })).toHaveLength(0);
    expect(renderer.root.findAllByProps({ testID: "glyph-info" }).length).toBeGreaterThan(0);
    expect(warn.mock.calls.some((call) => String(call[0]).includes("descriptor icon wins"))).toBe(true);
    act(() => renderer.unmount());
  });
});
