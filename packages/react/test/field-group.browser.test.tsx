import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FieldGroup, type FieldGroupBinding } from "../src/field-group.js";
import { TextField } from "../src/forms.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "320px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const fields = [{ id: "a", label: "주소", description: "건물 번호" }, { id: "b", label: "도시", disabled: true }];
it("associates distinct group and field messages without repeated errors or duplicate ids", async () => {
  await act(async () => root.render(<HjmProvider><FieldGroup descriptor={{ label: "배송지", description: "받을 곳", fields, error: { message: "주소 확인", fieldIds: ["a"] } }}
    renderField={({ controlProps }) => <TextField {...controlProps} />} />
    <FieldGroup descriptor={{ label: "청구지", fields }} renderField={({ controlProps }) => <TextField {...controlProps} />} /></HjmProvider>));
  expect(host.querySelectorAll("fieldset > legend")).toHaveLength(2);
  expect(host.querySelectorAll('[role="alert"]')).toHaveLength(1);
  const inputs = [...host.querySelectorAll("input")];
  expect(new Set(inputs.map(input => input.id)).size).toBe(4);
  expect(inputs[0]!.getAttribute("aria-describedby")!.split(" ").map(id => document.getElementById(id)?.textContent)).toEqual(["받을 곳", "건물 번호", "주소 확인"]);
  expect(inputs[1]!.getAttribute("aria-invalid")).toBe("false");
});
it("keeps node identity and focus on reorder, skips disabled controls and guards retained callbacks", async () => {
  let binding: FieldGroupBinding | undefined;
  const change = vi.fn();
  const render = (disabled: boolean, reverse: boolean) => <HjmProvider><FieldGroup descriptor={{ label: "배송지", fields: reverse ? [...fields].reverse() : fields, disabled }}
    renderField={field => { if (field.id === "a") binding = field; return <TextField {...field.controlProps} onValueChange={field.guardChange(change)} />; }} /></HjmProvider>;
  await act(async () => root.render(render(false, false)));
  const saved = binding!.guardChange(change);
  await act(async () => page.getByRole("textbox", { name: "주소", exact: true }).fill("초안"));
  const input = document.activeElement;
  await act(async () => root.render(render(false, true)));
  expect(document.activeElement).toBe(input);
  expect(host.querySelectorAll("input")[1]).toBe(input);
  await act(async () => root.render(render(true, true)));
  change.mockClear(); saved("late"); expect(change).not.toHaveBeenCalled();
  await act(async () => root.render(render(false, false)));
  saved("unlocked"); expect(change).toHaveBeenCalledWith("unlocked");
  expect(host.querySelectorAll("input")[1]!.disabled).toBe(true);
  await act(async () => page.getByRole("textbox", { name: "주소", exact: true }).click());
  await act(async () => userEvent.keyboard("{Tab}"));
  expect(document.activeElement).not.toBe(host.querySelectorAll("input")[1]);
});
it("wraps long group copy at 320px with large text and RTL in both themes", async () => {
  for (const theme of ["light", "dark"] as const) for (const direction of ["ltr", "rtl"] as const) {
    await act(async () => root.render(<HjmProvider theme={theme} direction={direction} textScale={2}><FieldGroup
      descriptor={{ label: "매우 긴 배송지 설명과 연락처 입력 그룹", description: "긴 설명을 읽고 관련 입력을 확인합니다.", fields }}
      renderField={({ controlProps }) => <TextField {...controlProps} />} /></HjmProvider>));
    expect(host.scrollWidth).toBeLessThanOrEqual(320);
    expect(host.querySelector("input")!.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  }
});
