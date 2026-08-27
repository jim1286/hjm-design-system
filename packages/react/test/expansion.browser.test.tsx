import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DatePicker } from "../src/date-picker.js";
import { FilePicker } from "../src/file-picker.js";
import { HjmProvider } from "../src/provider.js";
import { Steps } from "../src/steps.js";
import { UploadItem } from "../src/upload-item.js";

const grid = {
  cells: [
    ...Array.from({ length: 3 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })),
    ...Array.from({ length: 4 }, () => ({})),
  ],
  weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  todayDate: "2027-02-19",
} as const;

let container: HTMLDivElement;
let root: Root;

async function render(node: React.ReactNode) {
  await act(async () => root.render(<HjmProvider systemTheme="light">{node}</HjmProvider>));
}

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

describe("Web expansion renderers", () => {
  it("commits an enabled DatePicker cell and requests selection close", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    await render(
      <DatePicker
        clearLabel="Clear"
        closeLabel="Close"
        composeAccessibleName={({ date }) => date}
        descriptor={{ grid, displayValue: null, placeholder: "Choose", label: "Date", selectedDate: null, onSelectionChange, open: true, onOpenChange }}
        monthLabel="February 2027"
      />,
    );
    const date = container.querySelector<HTMLButtonElement>('[data-date="2027-02-05"]')!;
    await act(async () => date.click());
    expect(onSelectionChange).toHaveBeenCalledWith("2027-02-05", "activate");
    expect(onOpenChange).toHaveBeenCalledWith(false, "selection");
  });

  it("moves DatePicker focus by one day with ArrowRight", async () => {
    await render(
      <DatePicker
        clearLabel="Clear"
        closeLabel="Close"
        composeAccessibleName={({ date }) => date}
        descriptor={{ grid, displayValue: "February 5", placeholder: "Choose", label: "Date", defaultSelectedDate: "2027-02-05", defaultOpen: true }}
        monthLabel="February 2027"
      />,
    );
    const current = container.querySelector<HTMLButtonElement>('[data-date="2027-02-05"]')!;
    await act(async () => current.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })));
    expect(document.activeElement).toBe(container.querySelector('[data-date="2027-02-06"]'));
  });

  it("judges browser files through the canonical FilePicker resolver", async () => {
    const onSelect = vi.fn();
    await render(<FilePicker buttonLabel="Choose" descriptor={{ accept: ["image/*"] }} dropzoneLabel="Drop" label="Files" onSelect={onSelect} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(["image"], "photo.png", { type: "image/png" });
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
    expect(onSelect.mock.calls[0]?.[0].accepted[0]).toMatchObject({ name: "photo.png", mimeType: "image/png" });
    expect(onSelect.mock.calls[0]?.[0].rejected).toEqual([]);
  });

  it("derives Steps and UploadItem actions without local status flags", async () => {
    const onCancel = vi.fn();
    await render(
      <>
        <Steps composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`} descriptor={{ steps: [{ id: "a", label: "A" }, { id: "b", label: "B" }], currentStepId: "b" }} statusLabels={{ pending: "Pending", current: "Current", complete: "Complete", error: "Error" }} />
        <UploadItem descriptor={{ id: "photo", name: "photo.png", state: { status: "uploading", progress: 0.5 } }} labels={{ pending: "Pending", uploading: "Uploading", success: "Complete", cancel: "Cancel", retry: "Retry" }} onCancel={onCancel} />
      </>,
    );
    expect(container.querySelectorAll('.hjm-steps__step[data-status="complete"]')).toHaveLength(1);
    const cancel = container.querySelector<HTMLButtonElement>('[data-action="cancel"]')!;
    await act(async () => cancel.click());
    expect(onCancel).toHaveBeenCalledWith("photo");
    expect(container.querySelector('[data-action="retry"]')).toBeNull();
  });
});
