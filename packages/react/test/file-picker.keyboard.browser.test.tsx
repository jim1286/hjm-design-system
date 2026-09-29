import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FilePicker } from "../src/file-picker.js";
import { HjmProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import "../src/styles.css";

export const filePickerKeyboardCases = [{ componentId: "file-picker" }] as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("opens the file input from the keyboard trigger and reports its chosen file", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/file-picker.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
  const onSelect = vi.fn();
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <FilePicker
        buttonLabel="Choose image"
        descriptor={{ accept: ["image/*"] }}
        dropzoneLabel="Drop an image here"
        label="Profile image"
        onSelect={onSelect}
      />
    </HjmProvider>,
  ));

  const button = host.querySelector<HTMLButtonElement>(".hjm-file-picker__dropzone button")!;
  const input = host.querySelector<HTMLInputElement>('input[type="file"]')!;
  const openPicker = vi.spyOn(input, "click");
  expect(input.accept).toBe("image/*");
  expect(input.multiple).toBe(false);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(button);
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(openPicker).toHaveBeenCalledOnce();

  const selected = new File(["image"], "avatar.png", { type: "image/png" });
  Object.defineProperty(input, "files", { configurable: true, value: [selected] });
  await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
  expect(onSelect.mock.calls[0]?.[0]).toMatchObject({
    accepted: [{ name: "avatar.png", mimeType: "image/png", sizeBytes: 5 }],
    rejected: [],
  });
  expect(input.value).toBe("");
});
