import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { selectionControlRecipe } from "@hjmds/design-contracts/recipes";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { AgreementDescriptor } from "@hjmds/design-contracts/components/agreement";
import { TextInput } from "react-native";

import { Agreement } from "../src/agreement.js";
import { DatePicker } from "../src/date-picker.js";
import { Combobox, Select } from "../src/forms.js";
import { NumberField } from "../src/number-field.js";
import { Sheet } from "../src/overlays.js";
import { HjmNativeProvider, useHjmNativeTheme } from "../src/provider.js";
import { TagsInput } from "../src/tags-input.js";
import { TransferList } from "../src/transfer-list.js";
import { UploadItem } from "../src/upload-item.js";

/**
 * Mock regressions for the 2026-09-30 installed iOS/Android audit
 * (docs/evidence/full-audit-2026-09-30). On-screen results are in native-fixes/FIXES.md.
 */
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
});

function render(node: React.ReactNode, nodeMock: () => unknown = () => ({})) {
  act(() => {
    renderer = create(<HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>, { createNodeMock: nodeMock });
  });
  return renderer!;
}
const flat = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : ((style ?? {}) as Record<string, unknown>);
const hosts = (predicate: (node: ReactTestInstance) => boolean) =>
  renderer!.root.findAll((node) => typeof node.type === "string" && predicate(node));

const agreement: AgreementDescriptor = {
  accessibilityLabel: "Sign-up terms",
  allLabel: "Agree to everything",
  items: [
    { id: "terms", label: "Terms of service", required: true },
    { id: "news", label: "News" },
  ],
};

it("Agreement: on-brand check glyph, stable all-row name and a rebuildable mixed state", () => {
  let palette: ReturnType<typeof useHjmNativeTheme>["palette"] | undefined;
  function Probe() { palette = useHjmNativeTheme().palette; return null; }
  render(<><Probe /><Agreement descriptor={agreement} requiredLabel="(required)" optionalLabel="(optional)" /></>);
  const rows = () => hosts((node) => String(node.type) === "Pressable" && node.props.accessibilityRole === "checkbox");
  act(() => rows()[0]!.props.onPress());
  const glyph = hosts((node) => String(node.type) === "Text" && node.props.children === "✓")[0]!;
  expect(flat(glyph.props.style).color).toBe(resolveColorReference(selectionControlRecipe.states.indicator, palette!));
  expect(glyph.props.accessible).toBe(false);

  act(() => rows()[1]!.props.onPress());
  expect(rows()[0]!.props.accessibilityLabel).toBe("Agree to everything");
  expect(rows()[0]!.props.accessibilityState).toEqual({ checked: "mixed", busy: false });
  act(() => rows()[0]!.props.onPress());
  // busy:false forces RN Android to rebuild the description when mixed ends.
  expect(rows()[0]!.props.accessibilityState).toEqual({ checked: true, busy: false });
  expect(rows()[0]!.props.accessibilityLabel).toBe("Agree to everything");
  expect(rows()[1]!.props.accessibilityLabel).toBe("Terms of service (required)");
});

it("UploadItem: Cancel is its own accessible element, not swallowed by the row", () => {
  const onCancel = vi.fn();
  render(
    <UploadItem
      descriptor={{ id: "photo", name: "profile-photo.png", state: { status: "uploading", progress: 0.4, progressLabel: "Uploading 40%" } }}
      labels={{ pending: "Waiting", uploading: "Uploading", success: "Done", cancel: "Cancel", retry: "Retry" }}
      onCancel={onCancel}
    />,
  );
  const cancel = hosts((node) => node.props.accessibilityRole === "button" && node.props.accessibilityLabel === "Cancel")[0]!;
  let ancestor = cancel.parent;
  while (ancestor) {
    expect(ancestor.props.accessible).not.toBe(true);
    ancestor = ancestor.parent;
  }
  const info = hosts((node) => node.props.accessibilityLabel === "profile-photo.png")[0]!;
  expect(info.props.accessible).toBe(true);
  expect(info.props.accessibilityState).toEqual({ busy: true });
  expect(info.props.accessibilityValue).toEqual({ text: "Uploading 40%" });
  act(() => cancel.props.onPress());
  expect(onCancel).toHaveBeenCalledWith("photo");
});

it("NumberField: accessibilityValue carries the number as text, not a range percentage", () => {
  render(<NumberField decrementLabel="Less" incrementLabel="More" label="Quantity" min={0} max={10} defaultValue={2} />);
  const input = renderer!.root.findByType(TextInput);
  expect(input.props.accessibilityValue).toEqual({ min: 0, max: 10, now: 2, text: "2" });
  act(() => input.props.onChangeText("3"));
  expect(renderer!.root.findByType(TextInput).props.accessibilityValue.text).toBe("3");
});

it("Sheet, DatePicker, Select and Combobox apply the provider's bottom inset by default", () => {
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion safeAreaInsets={{ top: 47, bottom: 34 }}>
        <Sheet open title="Sheet" closeLabel="Close"><></></Sheet>
      </HjmNativeProvider>,
    );
  });
  const padded = () => hosts((node) => typeof flat(node.props.style).paddingBottom === "number")
    .map((node) => flat(node.props.style).paddingBottom as number);
  const sheetPadding = padded();
  expect(sheetPadding.some((value) => value >= 34)).toBe(true);
  act(() => renderer!.unmount());

  // A call-site value still wins over the provider.
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion safeAreaInsets={{ bottom: 34 }}>
        <DatePicker
          descriptor={{ grid: { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-10-0${index + 1}` })), weekdayLabels: ["S", "M", "T", "W", "T", "F", "S"] as const, todayDate: "2026-10-01" }, label: "Visit", displayValue: null, placeholder: "Pick", open: true, onOpenChange: () => {}, selectedDate: null, onSelectionChange: () => {} }}
          monthLabel="October" clearLabel="Clear" closeLabel="Close" composeAccessibleName={({ date }) => date}
          safeAreaInsets={{ bottom: 63 }}
        />
      </HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  const sheet = renderer!.root.findByType(Sheet);
  expect(sheet.props.safeAreaInsets).toEqual({ bottom: 63 });
  expect(padded().some((value) => value >= 63)).toBe(true);
  act(() => renderer!.unmount());

  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion safeAreaInsets={{ bottom: 34 }}>
        <Select label="Language" placeholder="Choose" dismissLabel="Close" defaultOpen items={[{ id: "ko", label: "Korean", textValue: "Korean" }]} />
      </HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  const group = hosts((node) => node.props.accessibilityRole === "radiogroup")[0]!;
  expect(flat(group.props.style).paddingBottom).toBeGreaterThanOrEqual(34);
  renderer = undefined;
});

it("Combobox: choosing a result blurs the input so the keyboard does not cover the value", () => {
  const blur = vi.fn();
  render(
    <Combobox clearLabel="Clear" dismissLabel="Close" emptyMessage="None" loadingMessage="Loading" label="City"
      items={[{ id: "busan", label: "Busan", textValue: "Busan" }]} />,
    () => ({ blur }),
  );
  act(() => renderer!.root.findByType(TextInput).props.onChangeText("Bu"));
  const option = hosts((node) => String(node.type) === "Pressable" && node.props.accessibilityRole === "radio")[0]!;
  act(() => option.props.onPress());
  expect(blur).toHaveBeenCalled();
  expect(renderer!.root.findByType(TextInput).props.value).toBe("Busan");
});

it("TagsInput: Return adds a tag without dismissing the keyboard", () => {
  render(<TagsInput label="Interests" composeRemoveLabel={(tag) => `Remove ${tag}`} />);
  const input = renderer!.root.findByType(TextInput);
  expect(input.props.submitBehavior).toBe("submit");
  act(() => input.props.onChangeText("42"));
  act(() => renderer!.root.findByType(TextInput).props.onSubmitEditing());
  expect(hosts((node) => node.props.accessibilityLabel === "Remove 42")).not.toHaveLength(0);
});

it("TransferList: select-all leaves mixed with a state Android rebuilds", () => {
  render(
    <TransferList
      items={[{ id: "walk", label: "Walk", textValue: "Walk" }, { id: "meal", label: "Meal", textValue: "Meal" }]}
      labels={{ source: "Available", target: "Chosen", toTarget: "Add", toSource: "Remove", selectAll: "Select all", empty: "Empty" }}
    />,
  );
  const selectAll = () => hosts((node) => node.props.accessibilityLabel === "Available, Select all")[0]!;
  const row = (label: string) => hosts((node) => String(node.type) === "Pressable" && node.props.accessibilityLabel === label)[0]!;
  act(() => row("Walk").props.onPress());
  expect(selectAll().props.accessibilityState).toEqual({ checked: "mixed", busy: false });
  act(() => row("Meal").props.onPress());
  expect(selectAll().props.accessibilityState).toEqual({ checked: true, busy: false });
  act(() => row("Walk").props.onPress());
  act(() => row("Meal").props.onPress());
  expect(selectAll().props.accessibilityState).toEqual({ checked: false, busy: false });
});
