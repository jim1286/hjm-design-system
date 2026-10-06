import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Platform } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { DateEntry } from "../src/date-entry.js";
import { TextField } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const base = { value: { year: "20", month: "Feb", day: "29" }, order: ["year", "month", "day"] as const,
  labels: { label: "기록 날짜", year: "연도", month: "월", day: "일" },
  parse: () => ({ status: "incomplete" as const, code: "year", fields: ["year" as const] }),
  formatIssue: () => "연도를 확인해 주세요.", onValueChange: vi.fn() };
it("keeps partial values, exposes field group names and changes only the edited part", () => {
  act(() => { tree = create(<HjmNativeProvider><DateEntry {...base} purpose="birthdate" /></HjmNativeProvider>); });
  const fields = tree!.root.findAllByType(TextField);
  expect(fields.map(field => field.props.value)).toEqual(["20", "Feb", "29"]);
  expect(fields.map(field => field.props.autoComplete)).toEqual(["birthdate-year", "birthdate-month", "birthdate-day"]);
  expect(fields[1]!.props.inputMode).toBe("text");
  expect(fields[0]!.props.accessibilityLabel).toBe("기록 날짜, 연도");
  expect(fields.every(field => field.props.error === undefined)).toBe(true);
  act(() => fields[0]!.props.onValueChange("2024"));
  expect(base.onValueChange).toHaveBeenLastCalledWith({ year: "2024", month: "Feb", day: "29" });
});
it("reveals only affected errors and retains draft values when order changes", () => {
  act(() => { tree = create(<HjmNativeProvider><DateEntry {...base} showErrors /></HjmNativeProvider>); });
  expect(tree!.root.findAllByType(TextField).map(field => field.props.error)).toEqual(["연도를 확인해 주세요.", undefined, undefined]);
  act(() => tree!.update(<HjmNativeProvider><DateEntry {...base} showErrors order={["day", "month", "year"]} /></HjmNativeProvider>));
  expect(tree!.root.findAllByType(TextField).map(field => field.props.value)).toEqual(["29", "Feb", "20"]);
});
it("guards read-only and disabled callbacks even if the native host reports an edit", () => {
  const change = vi.fn();
  for (const state of [{ readOnly: true }, { disabled: true }]) {
    act(() => { const element = <HjmNativeProvider><DateEntry {...base} {...state} onValueChange={change} /></HjmNativeProvider>; if (tree) tree.update(element); else tree = create(element); });
    act(() => tree!.root.findAllByType(TextField)[0]!.props.onValueChange("bad"));
  }
  expect(change).not.toHaveBeenCalled();
});

it("sets explicit iOS birthdate content types across supported RN peer versions", () => {
  const originalOS = Platform.OS;
  Object.assign(Platform, { OS: "ios" });
  try {
    act(() => { tree = create(<HjmNativeProvider><DateEntry {...base} purpose="birthdate" /></HjmNativeProvider>); });
    expect(tree!.root.findAllByType(TextField).map(field => field.props.textContentType)).toEqual(["birthdateYear", "birthdateMonth", "birthdateDay"]);
    act(() => tree!.update(<HjmNativeProvider><DateEntry {...base} purpose="date" /></HjmNativeProvider>));
    expect(tree!.root.findAllByType(TextField).every(field => field.props.textContentType === "none")).toBe(true);
  } finally { Object.assign(Platform, { OS: originalOS }); }
});
