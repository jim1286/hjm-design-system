import type { ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, ScrollView, Text as NativeText, View } from "react-native";
import { afterEach, describe, expect, it } from "vitest";
import { iconButtonRecipe, resolveIconButtonEdgeOverhang, sheetRecipe } from "@hjmds/design-contracts/recipes";
import { HjmNativeProvider } from "../src/provider.js";
import { ListRow } from "../src/data-display.js";
import { NotificationBell } from "../src/notification-bell.js";
import { Sheet } from "../src/overlays.js";

// 2026-10-17 1.27.2 adoption findings: rows inside a scrollable Sheet cut their surface bleed, and a top-bar-end NotificationBell could not put its glyph on the bar inset.
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function render(node: ReactNode, props: { minimumVisualTarget?: boolean } = {}) {
  act(() => { tree = create(<HjmNativeProvider reducedMotion {...props}>{node}</HjmNativeProvider>); });
  return tree!;
}
type Style = Record<string, unknown>;
function flat(style: unknown): Style {
  const value = typeof style === "function" ? style({ pressed: false }) : style;
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flat));
  return value && typeof value === "object" ? value as Style : {};
}

describe("scrollable Sheet keeps the ListRow bleed room", () => {
  it("extends the scroll viewport to the sheet's padding edge with the padding inside", () => {
    const scroll = render(<Sheet open scrollable title="테마" closeLabel="닫기"><ListRow title="라이트" selected /></Sheet>).root.findByType(ScrollView);
    expect(flat(scroll.props.style).marginHorizontal).toBe(-sheetRecipe.content.paddingHorizontal);
    expect(flat(scroll.props.contentContainerStyle).paddingHorizontal).toBe(sheetRecipe.content.paddingHorizontal);
  });
});

describe("NotificationBell edge", () => {
  // The bell is the small IconButton (035799a5); its root takes the small overhang.
  const overhang = resolveIconButtonEdgeOverhang(iconButtonRecipe.defaults.tone, "small");
  const bell = (edge?: "start" | "end" | "both") => <NotificationBell label="알림" count={3} icon={<NativeText>B</NativeText>} onPress={() => undefined} {...(edge ? { edge } : {})} />;
  const rootOf = (root: ReactTestRenderer) => root.root.findAllByType(View).find(node => flat(node.props.style).position === "relative")!;
  it("puts the IconButton overhang on the bell root so the badge keeps the icon corner", () => {
    const root = render(bell("end"));
    expect(flat(rootOf(root).props.style)).toMatchObject({ marginEnd: -overhang });
    expect(flat(rootOf(root).props.style).marginStart).toBeUndefined();
    const button = flat(root.root.findByType(Pressable).props.style);
    expect(button.marginEnd).toBeUndefined();
    expect(button.width).toBe(iconButtonRecipe.sizes.small.diameter);
  });
  it("mirrors start/both and stays put without edge", () => {
    expect(flat(rootOf(render(bell("both"))).props.style)).toMatchObject({ marginStart: -overhang, marginEnd: -overhang });
    act(() => tree?.unmount()); tree = undefined;
    const plain = flat(rootOf(render(bell())).props.style);
    expect(plain.marginStart).toBeUndefined();
    expect(plain.marginEnd).toBeUndefined();
  });
});
