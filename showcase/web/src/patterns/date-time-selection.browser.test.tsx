import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { DateTimeSelectionPreview } from "./date-time-selection-preview";
import { dateTimeCopy as copy } from "../../../shared/date-time-selection";
import { profileCopy } from "../../../shared/design-profile";
import "../../../../packages/react/src/styles.css";

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (initialStatus: "failed" | "pending" = "failed") => act(async () => { root.render(<DateTimeSelectionPreview initialStatus={initialStatus} />); });
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent === label)!;
const click = (label: string) => act(async () => page.getByRole("button", { name: label, exact: true }).click());

it("preserves an intentionally moved focus when the pending response settles", async () => {
  await render("pending");
  const theme = button(profileCopy.nextTheme);
  await act(async () => theme.focus());
  await act(async () => button(copy.respond).click());
  expect(host.textContent).toContain(copy.saved);
  expect(document.activeElement).toBe(theme);
});

it("restores focus from the response action and preserves the selection through failure and retry", async () => {
  await render(); await click(copy.fail); await click(copy.retry);
  expect(button(copy.pending).getAttribute("aria-disabled")).toBe("true");
  expect(button(copy.reset).disabled).toBe(true);
  const response = button(copy.respond);
  await act(async () => { response.focus(); response.click(); });
  expect(document.activeElement).toBe(button(copy.retry));
  expect(host.textContent).toContain(copy.failed);
  expect(host.textContent).toContain("2026-09-16 09:30");
  await click(copy.retry); await click(copy.respond);
  expect(host.textContent).toContain(copy.saved);
  expect(button(copy.respond).disabled).toBe(true);
  await click(copy.reset);
  expect(host.textContent).toContain(copy.missing);
  expect(button(copy.confirm).disabled).toBe(true);
  expect(host.textContent).not.toContain(copy.saved);
});

it("keeps picked values and the pending snapshot while switching visual profiles", async () => {
  await render(); await click(copy.retry);
  await click(profileCopy.nextTheme);
  expect(host.textContent).toContain("2026-09-16 09:30");
  expect(button(copy.pending).getAttribute("aria-disabled")).toBe("true");
  await click(copy.respond);
  expect(host.textContent).toContain(copy.saved);
  expect(host.textContent).toContain("2026-09-16 09:30");
});

it("keeps keyboard focus on confirmation while blocking repeated pending activation", async () => {
  await render();
  const confirm = button(copy.retry);
  await act(async () => confirm.focus());
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(document.activeElement).toBe(confirm);
  expect(confirm.getAttribute("aria-disabled")).toBe("true");
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(button(copy.pending)).toBe(confirm);
  await click(copy.respond);
  expect(host.textContent).toContain(copy.saved);
});
