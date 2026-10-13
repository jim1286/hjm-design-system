import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ListRow } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("shows destructive title emphasis and preserves selected, disabled and activation behavior", async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host); const press = vi.fn();
  const view = (disabled = false) => <HjmProvider><ListRow title="Account" /><ListRow title="Delete account" tone="danger" selected disabled={disabled} onClick={press} /></HjmProvider>;
  try {
    await act(async () => root.render(view()));
    const ordinary = host.querySelector<HTMLElement>(".hjm-list-row__title")!;
    const row = host.querySelector<HTMLButtonElement>('[data-tone="danger"]')!;
    const title = row.querySelector<HTMLElement>(".hjm-list-row__title")!;
    expect(getComputedStyle(title).color).not.toBe(getComputedStyle(ordinary).color);
    expect(row.getAttribute("aria-pressed")).toBe("true");
    await act(async () => { row.focus(); row.click(); });
    expect(document.activeElement).toBe(row); expect(press).toHaveBeenCalledOnce();
    await act(async () => root.render(view(true)));
    expect(row.disabled).toBe(true); await act(async () => row.click()); expect(press).toHaveBeenCalledOnce();
  } finally { await act(async () => root.unmount()); host.remove(); }
});
