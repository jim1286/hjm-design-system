// Regression proofs for the last Web/Native/recipe drifts closed before the 1.13 release (2026-10-06). Each case
// failed before its fix; the comment names the old value.
import type { ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, TextInput, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { datePickerRecipe } from "@hjmds/design-contracts/components/date-picker";
import { radius } from "@hjmds/design-contracts/foundations";
import { comboboxRecipe } from "@hjmds/design-contracts/recipes";
import { DatePicker } from "../src/date-picker.js";
import { Mentions } from "../src/mentions.js";
import { HjmNativeProvider } from "../src/provider.js";
import { SearchScreen } from "../src/screen-flows.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => {
  if (tree) act(() => tree!.unmount());
  tree = undefined;
});
function render(node: ReactElement) {
  act(() => { tree = create(<HjmNativeProvider reducedMotion>{node}</HjmNativeProvider>); });
  return tree!;
}
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-0${index + 1}` })), weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const, todayDate: "2026-09-01" };

it("DatePicker trigger heights and insets come from datePickerRecipe.sizes", () => {
  for (const size of ["medium", "large"] as const) {
    render(<DatePicker size={size} descriptor={{ grid, label: "날짜", displayValue: null, placeholder: "선택" }} monthLabel="9월" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} />);
    const trigger = tree!.root.findAllByType(Pressable).find((node) => node.props.accessibilityState?.expanded === false)!;
    const style = flat(trigger.props.style({ pressed: false }));
    // Before: 48 (medium) and 56 (large); Web drew 44 and 56.
    expect(style.minHeight).toBe(datePickerRecipe.sizes[size].minHeight);
    expect(style.paddingHorizontal).toBe(datePickerRecipe.sizes[size].paddingHorizontal);
    act(() => tree!.unmount()); tree = undefined;
  }
});

it("Mentions candidate list uses the Combobox popover padding and radius", () => {
  render(<Mentions label="기록" value="@" onValueChange={() => undefined} triggers={[{ id: "person", trigger: "@" }]}
    candidates={[{ id: "mina", label: "미나" }]} emptyMessage="없어요" listLabel="사람" />);
  act(() => tree!.root.findByType(TextInput).props.onSelectionChange({ nativeEvent: { selection: { start: 1, end: 1 } } }));
  const list = tree!.root.findAllByType(View).find((node) => node.props.accessibilityLabel === "사람")!;
  // Before: padding 4 (space-xxs).
  expect(flat(list.props.style).padding).toBe(comboboxRecipe.popover.padding);
  expect(flat(list.props.style).borderRadius).toBe(radius[comboboxRecipe.popover.radius]);
});

it("SearchScreen keeps taking input while searching (Web parity)", () => {
  const onQueryChange = vi.fn();
  render(<SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기" query="산" onQueryChange={onQueryChange} onSearch={() => undefined}
    searching searchingLabel="찾는 중">{null}</SearchScreen>);
  const input = tree!.root.findByType(TextInput);
  // Before: SearchField busy set editable=false and dropped the change, so suggestions could not refresh while typing.
  expect(input.props.editable).toBe(true);
  act(() => input.props.onChangeText("산책"));
  expect(onQueryChange).toHaveBeenCalledWith("산책");
});
