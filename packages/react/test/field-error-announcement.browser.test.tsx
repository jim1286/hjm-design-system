// Shared Field error contract (1.31, internal/field-error.tsx): every Field-based control keeps one assertive
// region mounted before the first error, links it from the control and hides the visible copy from assistive
// technology so the error is announced and read once.
import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { TextArea, TextField } from "../src/forms.js";
import { Select } from "../src/select.js";
import { NumberField } from "../src/number-field.js";
import { CheckboxGroup } from "../src/selection.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

let setError: (error: string | undefined) => void = () => {};
function Harness({ render }: Readonly<{ render: (error: string | undefined) => ReactNode }>) {
  const [error, set] = useState<string | undefined>();
  setError = set;
  return <>{render(error)}</>;
}

/** Nodes exposed to assistive technology whose own text includes the copy. */
function exposedTextNodes(text: string) {
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const found: Node[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent?.includes(text) && !node.parentElement?.closest('[aria-hidden="true"]')) found.push(node);
  }
  return found;
}

const controls: readonly [string, (error: string | undefined) => ReactNode, string][] = [
  ["TextField", (error) => <TextField label="이메일" {...(error ? { error } : {})} />, "input"],
  ["TextArea", (error) => <TextArea label="소개" {...(error ? { error } : {})} />, "textarea"],
  ["Select", (error) => <Select label="지역" placeholder="고르기" emptySelectionLabel="없음" items={[{ id: "seoul", label: "서울", textValue: "서울" }]} {...(error ? { error } : {})} />, "button"],
  ["NumberField", (error) => <NumberField label="수량" min={0} max={9} decrementLabel="빼기" incrementLabel="더하기" {...(error ? { error } : {})} />, "input"],
  ["CheckboxGroup", (error) => <CheckboxGroup label="관심사" items={[{ id: "one", label: "하나" }]} {...(error ? { error } : {})} />, "fieldset"],
];

it.each(controls)("%s announces its error from one linked region and reads it once", async (_name, render, controlSelector) => {
  await act(async () => root.render(<HjmProvider><Harness render={render} /></HjmProvider>));
  const regions = () => host.querySelectorAll('[role="alert"]');
  expect(regions()).toHaveLength(1);
  const region = regions()[0]!;
  expect(region.textContent).toBe("");

  await act(async () => setError("다시 확인해 주세요"));
  expect(regions()).toHaveLength(1);
  // Same node before and after: a region inserted together with its text is not announced.
  expect(regions()[0]).toBe(region);
  expect(region.textContent).toBe("다시 확인해 주세요");
  const describedBy = host.querySelector(`${controlSelector}[aria-describedby]`)?.getAttribute("aria-describedby")?.split(" ") ?? [];
  expect(describedBy).toContain(region.id);
  expect(host.querySelector(".hjm-field__error")!.getAttribute("aria-hidden")).toBe("true");
  expect(exposedTextNodes("다시 확인해 주세요")).toHaveLength(1);

  await act(async () => setError("숫자만 쓸 수 있어요"));
  expect(regions()[0]).toBe(region);
  expect(region.textContent).toBe("숫자만 쓸 수 있어요");

  await act(async () => setError(undefined));
  expect(region.textContent).toBe("");
  expect(host.querySelector(".hjm-field__error")).toBeNull();
});
