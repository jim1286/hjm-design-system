import type { ComponentProps, ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi, type MockInstance } from "vitest";

import {
  Checkbox,
  CheckboxGroup,
  Chip,
  Combobox,
  DatePicker,
  FilePicker,
  Form,
  HjmNativeProvider,
  Mentions,
  NumberField,
  OtpField,
  Radio,
  RadioGroup,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TagsInput,
  Text,
  ToggleGroup,
  TransferList,
} from "../src/index.js";

// Removed visual overrides cannot replace recipe appearance; canonical layout remains supported.

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type AnyProps = Readonly<Record<string, unknown>>;
const noop = () => undefined;
const calendarGrid = {
  cells: Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })),
  weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  todayDate: "2027-02-19",
} as const;

/**
 * [component, deprecated root-ish prop (or null when the component has no root alias),
 *  extra slot props that must warn, render]
 */
type Case = readonly [string, string | null, readonly string[], (props: AnyProps) => ReactElement];
const cases: readonly Case[] = [
  ["OtpField", null, ["slotStyle", "slotTextStyle"], (p) => <OtpField label="인증번호" length={4} {...p} />],
  ["Checkbox", "style", ["controlStyle", "labelStyle", "descriptionStyle"], (p) => <Checkbox description="설명" label="동의" {...p} />],
  ["Radio", "style", ["indicatorStyle", "contentStyle"], (p) => <Radio label="일반" {...p} />],
  ["RadioGroup", "style", ["labelStyle", "leadingStyle"], (p) => <RadioGroup items={[{ value: "a", label: "일반" }]} label="배송" {...p} />],
  ["CheckboxGroup", "style", ["controlStyle"], (p) => <CheckboxGroup items={[{ id: "a", label: "스포츠" }]} label="관심사" {...p} />],
  ["Switch", "style", [], (p) => <Switch label="알림" {...p} />],
  ["SegmentedControl", "style", [], (p) => <SegmentedControl items={[{ value: "list", label: "목록" }]} label="보기" {...p} />],
  ["Chip", null, ["labelStyle"], (p) => <Chip label="필터" onPress={noop} {...p} />],
  ["NumberField", "containerStyle", ["inputStyle"], (p) => <NumberField decrementLabel="감소" incrementLabel="증가" label="수량" max={10} min={0} {...p} />],
  ["Form", "style", [], (p) => (
    <Form fallbackErrorMessage="실패" label="프로필" onSubmit={noop} submitLabel="저장" values={{ name: "" }} {...p}>
      <Text>필드</Text>
    </Form>
  )],
  ["Select", "style", [], (p) => <Select dismissLabel="닫기" items={[{ id: "ko", label: "한국어", textValue: "한국어" }]} label="언어" placeholder="선택" {...p} />],
  ["Combobox", "style", [], (p) => (
    <Combobox clearLabel="지우기" dismissLabel="닫기" emptyMessage="없음" items={[{ id: "s", label: "서울", textValue: "서울" }]} label="도시" loadingMessage="검색 중" {...p} />
  )],
  ["Slider", "containerStyle", ["controlStyle"], (p) => <Slider decrementLabel="감소" incrementLabel="증가" label="음량" max={10} min={0} {...p} />],
  ["TagsInput", "style", [], (p) => <TagsInput composeRemoveLabel={(tag) => `${tag} 지우기`} defaultTags={["산책"]} label="관심사" {...p} />],
  ["ToggleGroup", "style", [], (p) => <ToggleGroup descriptor={{ accessibilityLabel: "꾸미기", items: [{ id: "bold", label: "굵게" }] }} {...p} />],
  ["DatePicker", "style", [], (p) => (
    <DatePicker
      clearLabel="지우기"
      closeLabel="닫기"
      composeAccessibleName={({ date }) => date}
      descriptor={{ grid: calendarGrid, displayValue: null, placeholder: "날짜 선택", label: "날짜", selectedDate: null, onSelectionChange: noop, open: false, onOpenChange: noop }}
      monthLabel="2027년 2월"
      {...p}
    />
  )],
  ["FilePicker", "style", [], (p) => (
    <FilePicker buttonLabel="파일 선택" descriptor={{ mode: "multiple", accept: ["image/*"] }} label="첨부" onPick={async () => null} onPickError={noop} onSelect={noop} {...p} />
  )],
  ["TransferList", "style", [], (p) => (
    <TransferList
      items={[{ id: "walk", label: "산책", textValue: "산책" }]}
      labels={{ source: "가능", target: "선택", toTarget: "추가", toSource: "빼기", selectAll: "모두", empty: "없음" }}
      {...p}
    />
  )],
  ["Mentions", null, ["listStyle"], (p) => (
    <Mentions accessibilityLabel="메모" candidates={[]} emptyMessage="없음" listLabel="추천" onValueChange={noop} triggers={[{ id: "user", trigger: "@" }]} value="" {...p} />
  )],
];

function render(node: ReactElement): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>);
  });
  return renderer!;
}

function flatten(style: unknown): Record<string, unknown> {
  const resolved = typeof style === "function" ? style({ pressed: false }) : style;
  if (!Array.isArray(resolved)) return (resolved ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...resolved.map(flatten));
}

function hasStyle(renderer: ReactTestRenderer, key: string, value: unknown): boolean {
  return renderer.root.findAll((node) => typeof node.type === "string" && node.props.style !== undefined)
    .some((node) => flatten(node.props.style)[key] === value);
}

let warn: MockInstance<typeof console.warn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe("Native input style removal", () => {
  it("excludes removed visual props from the public input types", () => {
    type PublicInputs = typeof Checkbox | typeof CheckboxGroup | typeof Radio | typeof RadioGroup
      | typeof Switch | typeof SegmentedControl | typeof Form | typeof Select | typeof Combobox
      | typeof DatePicker | typeof FilePicker | typeof TagsInput | typeof ToggleGroup | typeof TransferList;
    type RemovedChoiceKeys = "style" | "controlStyle" | "indicatorStyle" | "leadingStyle" | "contentStyle" | "labelStyle" | "descriptionStyle";
    type Keys<T extends PublicInputs> = T extends PublicInputs ? keyof ComponentProps<T> : never;
    expectTypeOf<Extract<Keys<PublicInputs>, RemovedChoiceKeys>>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof OtpField>, "slotStyle" | "slotTextStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof NumberField>, "inputStyle" | "containerStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof Slider>, "containerStyle" | "controlStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof Mentions>, "listStyle">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof ComponentProps<typeof Chip>, "labelStyle">>().toEqualTypeOf<never>();
  });
  it.each(cases)("%s preserves canonical root placement", (_name, _root, _slots, make) => {
    const renderer = render(make({ layoutStyle: { marginTop: 7 } }));
    expect(hasStyle(renderer, "marginTop", 7)).toBe(true);
    expect(warn).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  it.each(cases)("%s cannot apply a removed visual override", (name, root, slots, make) => {
    const removed = [...(root ? [root] : []), ...slots];
    const props = Object.fromEntries(removed.map(prop => [prop, { opacity: 0.1234, marginTop: 9137 }]));
    // Host rest-prop forwarding rejects legacy keys; explicit renderers ignore unknown JS props.
    if (["OtpField", "Switch", "NumberField", "Slider", "Mentions", "Select", "Combobox"].includes(name)) {
      expect(() => render(make(props))).toThrow(/were removed/);
      return;
    }
    const renderer = render(make(props));
    expect(hasStyle(renderer, "opacity", 0.1234)).toBe(false);
    expect(hasStyle(renderer, "marginTop", 9137)).toBe(false);
    expect(warn).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
});
