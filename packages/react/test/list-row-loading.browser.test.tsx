import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ListRow } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("keeps the two-line row height, hides duplicate statuses and enables commands only after loading", async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); host.style.width = "400px"; document.body.append(host);
  const root = createRoot(host); const activate = vi.fn();
  const view = (loading: boolean) => <HjmProvider><ListRow title="Title" description="Description" loading={loading} loadingLabel="Loading" onClick={activate} /><ListRow loading title="" description="Reserved" /></HjmProvider>;
  try {
    await act(async () => root.render(view(true)));
    const row = host.querySelector<HTMLElement>(".hjm-list-row")!;
    const height = row.getBoundingClientRect().height;
    expect(host.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(host.querySelectorAll('[aria-hidden="true"].hjm-list-row')).toHaveLength(1);
    expect(host.querySelector("button")).toBeNull();
    await act(async () => row.click()); expect(activate).not.toHaveBeenCalled();
    await act(async () => root.render(view(false)));
    const button = host.querySelector<HTMLButtonElement>("button.hjm-list-row")!;
    expect(button.getBoundingClientRect().height).toBe(height);
    await act(async () => button.click()); expect(activate).toHaveBeenCalledOnce();
  } finally { await act(async () => root.unmount()); host.remove(); }
});
