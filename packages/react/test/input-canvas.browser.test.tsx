import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { SearchField, TextArea } from "../src/forms.js";
import { Select } from "../src/select.js";
import { OtpField } from "../src/otp-field.js";
import { Checkbox, Chip, SegmentedControl } from "../src/selection.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

for (const theme of ["light", "dark"] as const) {
  it(`keeps ${theme} input and selection interiors on the canvas`, async () => {
    await act(async () => root.render(<HjmProvider theme={theme}>
      <Button tone="primary">Create draft</Button>
      <Button tone="secondary">Cancel</Button>
      <SearchField label="Search" clearLabel="Clear" />
      <TextArea label="Notes" />
      <OtpField label="Code" length={6} />
      <Checkbox label="Remember me" defaultChecked />
      <Chip label="Chosen" selectionMode="multiple" selected onSelectedChange={() => {}} />
      <SegmentedControl label="View" defaultValue="a" items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} />
      <Select label="Language" placeholder="Choose language" emptySelectionLabel="Clear language" items={[{ id: "ko", label: "Korean", textValue: "Korean" }]} />
    </HjmProvider>));
    const canvas = getComputedStyle(host.querySelector(".hjm-root")!).backgroundColor;
    if (theme === "light") expect(canvas).toBe("rgb(255, 255, 255)");
    // Pale selected-row fills can pass screenshot color tolerance; assert this
    // user-reported row directly rather than treating a matching PNG as proof.
    const rememberMe = page.getByRole("checkbox", { name: "Remember me" });
    await expect.element(rememberMe).toBeChecked();
    const rememberMeRow = rememberMe.element().closest(".hjm-choice");
    expect(rememberMeRow).not.toBeNull();
    expect(getComputedStyle(rememberMeRow!).backgroundColor).toBe(canvas);
    for (const element of host.querySelectorAll(".hjm-field__control, .hjm-otp-field__slot, .hjm-choice, .hjm-chip, .hjm-segmented__items, .hjm-segmented__item[data-state=checked]")) {
      expect(getComputedStyle(element).backgroundColor, element.className).toBe(canvas);
    }
    expect(getComputedStyle(host.querySelector('.hjm-button[data-tone="secondary"]')!).backgroundColor).toBe(canvas);
    expect(getComputedStyle(host.querySelector('.hjm-button[data-tone="primary"]')!).backgroundColor).not.toBe(canvas);
    // The request preserves Create draft primary fills and blue focus/selection affordances.
    await page.getByRole("searchbox", { name: "Search" }).click();
    const field = host.querySelector(".hjm-field__control")!;
    expect(getComputedStyle(field).backgroundColor).toBe(canvas);
    expect(getComputedStyle(field).boxShadow).not.toBe("none");
    await page.getByRole("combobox", { name: "Language" }).click();
    await expect.element(page.getByRole("listbox")).toBeVisible();
    expect(getComputedStyle(document.querySelector(".hjm-select__listbox")!).backgroundColor).toBe(canvas);
  });
}
