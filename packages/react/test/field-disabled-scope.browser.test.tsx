import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { searchFieldRecipe, selectRecipe } from "@hjmds/design-contracts/recipes";
import { numberFieldRecipe } from "@hjmds/design-contracts/components/number-field";
import { otpFieldRecipe } from "@hjmds/design-contracts/components/otp-field";
import { passwordFieldRecipe } from "@hjmds/design-contracts/components/password-field";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Combobox, NativeSelect } from "../src/advanced-forms.js";
import { DatePicker } from "../src/date-picker.js";
import { Field, OtpField, PasswordField, SearchField, TextArea, TextField } from "../src/forms.js";
import { Mentions } from "../src/mentions.js";
import { NumberField } from "../src/number-field.js";
import { HjmProvider } from "../src/provider.js";
import { Select } from "../src/select.js";
import { TagsInput } from "../src/tags-input.js";
import "../src/styles.css";

// 2026-10-06 decision (fieldRecipe.disabledScope): a disabled field dims its label and control only.
// Before, `.hjm-field[data-state="disabled"]` faded the whole frame, so the hint and the error — the text
// that says why the field is locked or what to fix — dropped to 0.6 × their contrast; DatePicker had no
// disabled dimming at all and TagsInput dimmed its frame but not its label.
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

/** Product of every ancestor's opacity: what the eye sees, not the element's own declaration. */
function effectiveOpacity(element: Element) {
  let value = 1;
  for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) {
    value *= Number(getComputedStyle(node).opacity);
  }
  return value;
}
/** Deepest element whose text is exactly `text`. */
function byText(text: string) {
  const matches = [...container.querySelectorAll("*")].filter((node) => node.textContent?.trim() === text);
  const found = matches.at(-1);
  if (!found) throw new Error(`no element with text ${text}`);
  return found;
}
function one(selector: string) {
  const found = container.querySelector(selector);
  if (!found) throw new Error(`no element for ${selector}`);
  return found;
}

const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-0${index + 1}` })), weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const, todayDate: "2026-09-01" };

type Copy = Readonly<{ description: string; error?: string }>;
// NumberField and Select show the hint only without an error, so each case renders both ways.
const cases: ReadonlyArray<{ name: string; opacity: number; control: string; node: (copy: Copy) => ReactNode; error?: false }> = [
  { name: "TextField", opacity: fieldRecipe.disabledOpacity, control: ".hjm-field__control",
    node: (copy) => <TextField label="L" {...copy} disabled /> },
  { name: "TextArea", opacity: fieldRecipe.disabledOpacity, control: ".hjm-field__control",
    node: (copy) => <TextArea label="L" {...copy} disabled /> },
  { name: "Mentions", opacity: fieldRecipe.disabledOpacity, control: ".hjm-field__control",
    node: (copy) => <Mentions label="L" {...copy} disabled value="" onValueChange={() => undefined}
      triggers={[{ id: "user", trigger: "@" }]} candidates={[]} emptyMessage="none" listLabel="list" /> },
  { name: "Field", opacity: fieldRecipe.disabledOpacity, control: "#custom",
    node: (copy) => <Field controlId="custom" label="L" {...copy} disabled>{(control) => <input {...control} />}</Field> },
  { name: "SearchField", opacity: searchFieldRecipe.states.disabledOpacity, control: ".hjm-field__control",
    node: (copy) => <SearchField label="L" {...copy} disabled clearLabel="clear" /> },
  { name: "PasswordField", opacity: passwordFieldRecipe.states.disabledOpacity, control: ".hjm-field__control",
    node: (copy) => <PasswordField label="L" {...copy} disabled autofillHint="current" revealLabel="show" concealLabel="hide" /> },
  { name: "OtpField", opacity: otpFieldRecipe.states.disabledOpacity, control: ".hjm-otp-field__control",
    node: (copy) => <OtpField label="L" {...copy} length={6} disabled /> },
  { name: "NumberField", opacity: numberFieldRecipe.states.disabledOpacity, control: ".hjm-number-field__control",
    node: (copy) => <NumberField label="L" {...copy} min={0} max={9} decrementLabel="-" incrementLabel="+" disabled /> },
  { name: "Select", opacity: selectRecipe.states.disabledOpacity, control: ".hjm-select__trigger",
    node: (copy) => <Select label="L" {...copy} placeholder="Choose" emptySelectionLabel="None" disabled
      items={[{ id: "one", label: "One", textValue: "One" }]} /> },
  { name: "NativeSelect", opacity: fieldRecipe.disabledOpacity, control: ".hjm-field__control",
    node: (copy) => <NativeSelect label="L" {...copy} disabled options={[{ value: "one", label: "One" }]} /> },
  { name: "Combobox", opacity: fieldRecipe.disabledOpacity, control: ".hjm-field__control",
    node: (copy) => <Combobox label="L" {...copy} disabled items={[{ value: "one", label: "One" }]}
      emptyMessage="none" loadingMessage="loading" selectionRequiredMessage="required" /> },
  { name: "DatePicker", opacity: fieldRecipe.disabledOpacity, control: ".hjm-date-picker__trigger",
    node: (copy) => <DatePicker {...copy} descriptor={{ grid, label: "L", displayValue: null, placeholder: "선택", disabled: true }}
      monthLabel="9월" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} /> },
  { name: "TagsInput", opacity: fieldRecipe.disabledOpacity, control: ".hjm-tags-input__frame", error: false,
    node: (copy) => <TagsInput label="L" description={copy.description} disabled composeRemoveLabel={(tag) => `${tag} 지우기`} /> },
];

for (const testCase of cases) {
  it(`${testCase.name}: disabled dims label and control, keeps hint and error at full contrast`, async () => {
    for (const copy of testCase.error === false ? [{ description: "D" }] : [{ description: "D" }, { description: "D", error: "E" }]) {
      await act(async () => root.render(<HjmProvider reducedMotion>{testCase.node(copy)}</HjmProvider>));
      expect(effectiveOpacity(byText("L"))).toBeCloseTo(testCase.opacity, 3);
      expect(effectiveOpacity(one(testCase.control))).toBeCloseTo(testCase.opacity, 3);
      expect(effectiveOpacity(byText(copy.error ?? "D"))).toBe(1);
    }
  });
}

it("fieldRecipe owns the scope: label and control dim, hint and error keep their contrast", () => {
  expect(fieldRecipe.disabledScope.dimmed).toEqual(["label", "control"]);
  expect(fieldRecipe.disabledScope.unchanged).toEqual(["hint", "error"]);
});
