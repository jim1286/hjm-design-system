// 1.13.1 patch: gaps found while utilverse adopted HJM 1.13.0 (2026-10-06, utilverse 077b190 and its
// docs/qa/2026-10-06-hjm-1.13-adoption.md). Each case failed on 1.13.0 and the product shipped a workaround.
import { useState, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { containerRecipe } from "@hjmds/design-contracts/components/container";
import { HjmNativeProvider } from "../src/provider.js";
import { Chip, SegmentedControl } from "../src/inputs.js";
import { Sheet, type SheetSize } from "../src/overlays.js";
import { Text } from "../src/primitives.js";
import { SearchScreen } from "../src/screen-flows.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
function render(node: ReactNode, textScale = 2) {
  act(() => { tree = create(<HjmNativeProvider reducedMotion textScale={textScale}>{node}</HjmNativeProvider>); });
  return tree!;
}
// The react-native mock's StyleSheet.flatten is identity; merge nested style arrays here.
type Style = Record<string, unknown>;
function flat(style: unknown): Style {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return style && typeof style === "object" ? style as Style : {};
}
const StyleSheet = { flatten: flat };
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.restoreAllMocks(); });

describe("SegmentedControl pills at large text", () => {
  const items = ["전체", "시간", "계산", "사진", "글자", "단위", "생활"].map((label, index) => ({ value: `t${index}`, label }));
  it("keeps the pills in a row (one line inside a rail) instead of stacking a column", () => {
    const root = render(<SegmentedControl label="주제" presentation="pills" size="small" items={items} defaultValue="t0" />);
    const group = root.root.findAllByType(View).find((node) => node.props.accessibilityRole === "radiogroup")!;
    expect(StyleSheet.flatten(group.props.style).flexDirection).toBe("row");
    const pill = StyleSheet.flatten(root.root.findAllByType(Pressable)[0]!.props.style({ pressed: false }));
    expect(pill.width).toBeUndefined();
    // Selection state and targets are unchanged by the layout.
    expect(pill.minHeight).toBeGreaterThanOrEqual(44);
    act(() => root.root.findAllByType(Pressable)[2]!.props.onPress());
    expect(root.root.findAllByType(Pressable)[2]!.props.accessibilityState.checked).toBe(true);
  });
  it("still stacks the connected track at the same scale", () => {
    const root = render(<SegmentedControl label="보기" items={items.slice(0, 3)} defaultValue="t0" />);
    const group = root.root.findAllByType(View).find((node) => node.props.accessibilityRole === "radiogroup")!;
    expect(StyleSheet.flatten(group.props.style).flexDirection).toBe("column");
  });
});

describe("Chip at large text", () => {
  it("uses the recipe height as a floor so a scaled label is not clipped", () => {
    const root = render(<Chip label="필터" onPress={() => {}} />);
    const style = StyleSheet.flatten(root.root.findByType(Pressable).props.style({ pressed: false }));
    expect(style.height).toBeUndefined();
    expect(style.minHeight).toBe(36);
  });
});

describe("fixed-size Sheet body", () => {
  // The body container is the host View right above the product's child.
  const body = (root: ReactTestRenderer) => root.root.findByProps({ testID: "fill" }).parent!.parent!;
  const sheet = (size: SheetSize, scrollable = false) => <Sheet open title="도구 선택" closeLabel="닫기" size={size} scrollable={scrollable} footer={<Text>저장</Text>}>
    <View testID="fill" style={{ flex: 1 }}><Text>본문</Text></View>
  </Sheet>;
  it("lets the body take the remaining height so a flex:1 child fills it", () => {
    const style = StyleSheet.flatten(body(render(sheet("large"))).props.style as never) as Record<string, unknown>;
    expect(style.flexGrow).toBe(1);
    expect(style.minHeight).toBe(0);
  });
  it("grows the scroll body the same way without making its content fill", () => {
    const root = render(sheet("medium", true));
    const scroll = root.root.findByType(ScrollView);
    expect(StyleSheet.flatten(scroll.props.style).flexGrow).toBe(1);
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle).flexGrow).toBeUndefined();
  });
  it("keeps an auto sheet content-sized", () => {
    const style = StyleSheet.flatten(body(render(sheet("auto"))).props.style as never) as Record<string, unknown>;
    expect(style.flexGrow ?? 0).toBe(0);
  });
});

describe("SearchScreen commits", () => {
  function Fixture({ onSubmit }: { onSubmit?: (query: string) => void }) {
    const [query, setQuery] = useState("");
    const shared = { title: "검색", queryLabel: "검색어", queryClearLabel: "지우기", query, onQueryChange: setQuery, onSearch: () => {},
      recentQueries: { items: ["카페"], title: "최근 검색", clearAllLabel: "전체 삭제", onClearAll: () => {}, removeLabel: (item: string) => `${item} 삭제`, onRemove: () => {} },
      suggestedQueries: { title: "추천", items: ["산책"] } };
    return onSubmit ? <SearchScreen {...shared} committedQuery="" onSubmit={onSubmit}>{null}</SearchScreen> : <SearchScreen {...shared}>{null}</SearchScreen>;
  }
  it("closes the keyboard when a recent or suggested query is picked, in two-step and one-step search", async () => {
    const { ListRow } = await import("../src/data-display.js");
    const dismiss = vi.spyOn(Keyboard, "dismiss");
    const submit = vi.fn();
    let root = render(<Fixture onSubmit={submit} />);
    act(() => root.root.findAllByType(ListRow).find((row) => row.props.title === "카페")!.props.onPress());
    expect(submit).toHaveBeenCalledWith("카페");
    expect(dismiss).toHaveBeenCalledTimes(1);
    act(() => tree?.unmount());
    root = render(<Fixture />);
    act(() => root.root.findAllByType(Chip).find((chip) => chip.props.label === "산책")!.props.onPress());
    expect(dismiss).toHaveBeenCalledTimes(2);
  });
});

describe("SearchScreen scroll rail inside an inset host", () => {
  const rail = (root: ReactTestRenderer) => root.root.findAllByType(ScrollView).find((view) => view.props.horizontal)!;
  const screen = (extra: Record<string, unknown>) => <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기" query="" onQueryChange={() => {}} onSearch={() => {}}
    filtersOverflow="scroll" filters={<Chip label="조건" onPress={() => {}} />} {...extra}>{null}</SearchScreen>;
  it("bleeds over the host gutter with contentInset none, keeping the first chip on the gutter", () => {
    const root = render(screen({ contentInset: "none", hostGutter: "regular" }));
    expect(StyleSheet.flatten(rail(root).props.style).marginHorizontal).toBe(-containerRecipe.gutters.regular);
    expect(StyleSheet.flatten(rail(root).props.contentContainerStyle).paddingHorizontal).toBe(containerRecipe.gutters.regular);
  });
  it("adds the host gutter to the screen padding and keeps the old bleed without it", () => {
    let root = render(screen({ hostGutter: "compact" }));
    expect(StyleSheet.flatten(rail(root).props.style).marginHorizontal).toBe(-(16 + containerRecipe.gutters.compact));
    act(() => tree?.unmount());
    root = render(screen({}));
    expect(StyleSheet.flatten(rail(root).props.style).marginHorizontal).toBe(-16);
  });
});
