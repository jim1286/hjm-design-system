// 2026-10-06 decision (fieldRecipe.disabledScope): a disabled field dims its label and control only, the same rule as
// Web. Before, TextField/SearchField/OtpField faded their whole frame (hint and error included), NumberField and
// Select faded only the control, Combobox and DatePicker did not dim at all, and TagsInput used a literal 0.5.
import type { ReactElement } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { TextInput } from "react-native";
import { afterEach, expect, it } from "vitest";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { searchFieldRecipe, selectRecipe } from "@hjmds/design-contracts/recipes";
import { numberFieldRecipe } from "@hjmds/design-contracts/components/number-field";
import { otpFieldRecipe } from "@hjmds/design-contracts/components/otp-field";
import { passwordFieldRecipe } from "@hjmds/design-contracts/components/password-field";
import { DatePicker } from "../src/date-picker.js";
import { Combobox, Field, Select } from "../src/forms.js";
import { OtpField, PasswordField, SearchField, TextArea, TextField } from "../src/inputs.js";
import { Mentions } from "../src/mentions.js";
import { NumberField } from "../src/number-field.js";
import { HjmNativeProvider } from "../src/provider.js";
import { TagsInput } from "../src/tags-input.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => {
  if (tree) act(() => tree!.unmount());
  tree = undefined;
});
function flat(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flat));
  return style && typeof style === "object" ? style as Record<string, unknown> : {};
}
/** Product of the opacity of every host ancestor (composites forward style, so they would double-count). */
function effectiveOpacity(node: ReactTestInstance) {
  let value = 1;
  for (let current: ReactTestInstance | null = node; current; current = current.parent) {
    if (typeof current.type !== "string") continue;
    const opacity = flat(current.props.style).opacity;
    if (typeof opacity === "number") value *= opacity;
  }
  return value;
}
/** The RN mock renders string host types; the library's ElementType does not list them. */
const isHost = (node: ReactTestInstance, name: string) => (node.type as unknown) === name;
function textOf(node: ReactTestInstance): string {
  return node.children.map((child) => typeof child === "string" ? child : textOf(child)).join("");
}
function hostText(text: string) {
  const found = tree!.root.findAll((node) => isHost(node, "Text") && textOf(node).trim() === text);
  if (found.length === 0) throw new Error(`no Text ${text}`);
  return found.at(-1)!;
}
const hostInput = () => tree!.root.findAll((node) => isHost(node, "TextInput"))[0]!;
const trigger = () => tree!.root.findAll((node) => isHost(node, "Pressable") && node.props.accessibilityState?.expanded === false)[0]!;

const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-0${index + 1}` })), weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const, todayDate: "2026-09-01" };
type Copy = Readonly<{ description: string; error?: string }>;
const cases: ReadonlyArray<{ name: string; opacity: number; control: () => ReactTestInstance; node: (copy: Copy) => ReactElement; error?: false }> = [
  { name: "TextField", opacity: fieldRecipe.disabledOpacity, control: hostInput, node: (copy) => <TextField label="L" {...copy} disabled /> },
  { name: "TextArea", opacity: fieldRecipe.disabledOpacity, control: hostInput, node: (copy) => <TextArea label="L" {...copy} disabled /> },
  { name: "Mentions", opacity: fieldRecipe.disabledOpacity, control: hostInput,
    node: (copy) => <Mentions label="L" {...copy} disabled value="" onValueChange={() => undefined} triggers={[{ id: "user", trigger: "@" }]}
      candidates={[]} emptyMessage="없음" listLabel="추천" /> },
  { name: "SearchField", opacity: searchFieldRecipe.states.disabledOpacity, control: hostInput,
    node: (copy) => <SearchField label="L" {...copy} disabled clearLabel="지우기" busyLabel="검색 중" /> },
  { name: "PasswordField", opacity: passwordFieldRecipe.states.disabledOpacity, control: hostInput,
    node: (copy) => <PasswordField label="L" {...copy} disabled autofillHint="current" revealLabel="보기" concealLabel="숨기기" /> },
  { name: "OtpField", opacity: otpFieldRecipe.states.disabledOpacity, control: hostInput, node: (copy) => <OtpField label="L" {...copy} length={4} disabled /> },
  { name: "NumberField", opacity: numberFieldRecipe.states.disabledOpacity, control: hostInput,
    node: (copy) => <NumberField label="L" {...copy} disabled min={0} max={9} decrementLabel="감소" incrementLabel="증가" /> },
  { name: "Select", opacity: selectRecipe.states.disabledOpacity, control: trigger,
    node: (copy) => <Select label="L" {...copy} disabled dismissLabel="닫기" placeholder="선택" items={[{ id: "ko", label: "한국어", textValue: "한국어" }]} /> },
  { name: "Combobox", opacity: fieldRecipe.disabledOpacity, control: hostInput,
    node: (copy) => <Combobox label="L" {...copy} disabled clearLabel="지우기" dismissLabel="닫기" emptyMessage="없음" loadingMessage="검색 중"
      items={[{ id: "s", label: "서울", textValue: "서울" }]} /> },
  { name: "DatePicker", opacity: fieldRecipe.disabledOpacity, control: trigger,
    node: (copy) => <DatePicker {...copy} descriptor={{ grid, label: "L", displayValue: null, placeholder: "선택", disabled: true }}
      monthLabel="9월" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} /> },
  { name: "TagsInput", opacity: fieldRecipe.disabledOpacity, control: hostInput, error: false,
    node: (copy) => <TagsInput label="L" description={copy.description} disabled composeRemoveLabel={(tag) => `${tag} 지우기`} /> },
];

for (const testCase of cases) {
  it(`${testCase.name}: disabled dims label and control, keeps hint and error at full contrast`, () => {
    for (const copy of testCase.error === false ? [{ description: "D" }] : [{ description: "D" }, { description: "D", error: "E" }]) {
      act(() => { tree = create(<HjmNativeProvider reducedMotion>{testCase.node(copy)}</HjmNativeProvider>); });
      expect(effectiveOpacity(hostText("L"))).toBeCloseTo(testCase.opacity, 3);
      expect(effectiveOpacity(testCase.control())).toBeCloseTo(testCase.opacity, 3);
      expect(effectiveOpacity(hostText(copy.error ?? "D"))).toBe(1);
      act(() => tree!.unmount()); tree = undefined;
    }
  });
}

it("custom Field: the frame dims its label; the consumer control keeps its own opacity and reads accessibilityState.disabled", () => {
  act(() => { tree = create(<HjmNativeProvider reducedMotion>
    <Field label="L" description="D" disabled>{(control) => <TextInput {...control} />}</Field>
  </HjmNativeProvider>); });
  expect(effectiveOpacity(hostText("L"))).toBeCloseTo(fieldRecipe.disabledOpacity, 3);
  expect(effectiveOpacity(hostText("D"))).toBe(1);
  expect(effectiveOpacity(hostInput())).toBe(1);
  expect(hostInput().props.accessibilityState).toEqual({ disabled: true });
});
