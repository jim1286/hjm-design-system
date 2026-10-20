import { act, type AriaAttributes } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { TextArea, TextField } from "../src/forms.js";
import { NumberField } from "../src/number-field.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it.each(["single", "multiline", "number"] as const)("%s uses a thicker invalid frame with an external message, including while disabled, and clears it on recovery", async kind => {
  async function draw(invalid: AriaAttributes["aria-invalid"], disabled = false) {
    const props = { label: "Draft", disabled, "aria-invalid": invalid === false ? undefined : invalid, "aria-describedby": "validation-note" };
    await act(async () => root.render(<HjmProvider>
      {kind === "multiline" ? <TextArea {...props} /> : kind === "number" ? <NumberField {...props} min={0} max={10} incrementLabel="Increase" decrementLabel="Decrease" /> : <TextField {...props} />}
      <span id="validation-note" role="status">External validation message</span>
    </HjmProvider>));
  }
  await draw(false);
  const input = host.querySelector<HTMLInputElement | HTMLTextAreaElement>("input,textarea")!;
  const frame = host.querySelector<HTMLElement>(".hjm-field__control")!;
  expect(getComputedStyle(frame).borderTopWidth).toBe("1px");
  const height = frame.getBoundingClientRect().height;
  await act(async () => input.focus());
  await draw(true);
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(frame.closest(".hjm-field")!.getAttribute("data-invalid")).toBe("true");
  expect(getComputedStyle(frame).borderTopWidth).toBe("2px");
  if (kind !== "number") expect(frame.getBoundingClientRect().height).toBe(height);
  expect(host.querySelectorAll('[role="status"]')).toHaveLength(1);
  expect(host.querySelector('[data-hjm-field-error]')?.textContent ?? "").toBe("");
  await draw(true, true);
  expect(input.disabled).toBe(true);
  expect(getComputedStyle(frame).borderTopWidth).toBe("2px");
  expect(Number(getComputedStyle(frame).opacity)).toBeLessThan(1);
  await draw("spelling");
  expect(getComputedStyle(frame).borderTopWidth).toBe("2px");
  await draw("false");
  expect(getComputedStyle(frame).borderTopWidth).toBe("1px");
  await draw(false);
  expect(input.getAttribute("aria-invalid")).toBeNull();
  expect(getComputedStyle(frame).borderTopWidth).toBe("1px");
});
