import type { ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

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
import { resetDeprecatedStyleWarningsForTest } from "../src/internal/deprecated-style.js";

// 2026-10-06: input/form components kept raw visual style props after 1.11. They stay working for
// SemVer, warn once in development, and accept the canonical `layoutStyle` on the root instead.

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
  return renderer.root.findAll((node) => node.props.style !== undefined)
    .some((node) => flatten(node.props.style)[key] === value);
}

let warn: MockInstance<typeof console.warn>;
beforeEach(() => {
  resetDeprecatedStyleWarningsForTest();
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

function warnings(): string[] {
  return warn.mock.calls.map((call) => String(call[0]));
}

describe("Native deprecated input style props", () => {
  it.each(cases)("%s applies layoutStyle without a deprecation warning", (_name, _root, _slots, make) => {
    const renderer = render(make({ layoutStyle: { marginTop: 7 } }));
    expect(hasStyle(renderer, "marginTop", 7)).toBe(true);
    expect(warn).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  it.each(cases.filter(([, root]) => root !== null))(
    "%s keeps the legacy root style working and warns once",
    (name, root, _slots, make) => {
      const first = render(make({ [root!]: { marginTop: 9 } }));
      expect(hasStyle(first, "marginTop", 9)).toBe(true);
      act(() => first.unmount());
      const second = render(make({ [root!]: { marginTop: 9 } }));
      act(() => second.unmount());
      expect(warnings().filter((message) => message.includes(`${name}.${root} is deprecated`))).toHaveLength(1);
    },
  );

  it.each(cases.filter(([, , slots]) => slots.length > 0))(
    "%s warns once for each deprecated slot style",
    (name, _root, slots, make) => {
      const props = Object.fromEntries(slots.map((slot) => [slot, { opacity: 0.99 }]));
      const first = render(make(props));
      act(() => first.unmount());
      const second = render(make(props));
      act(() => second.unmount());
      for (const slot of slots) {
        expect(warnings().filter((message) => message.includes(`${name}.${slot} is deprecated`))).toHaveLength(1);
      }
    },
  );
});
