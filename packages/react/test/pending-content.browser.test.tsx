import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { PendingContent } from "../src/feedback.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("retains draft and last ready bounds, excludes pending controls and centers one status", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  function Example({ pending }: { pending: boolean }) {
    const [draft, setDraft] = useState("saved draft");
    return <HjmProvider><PendingContent pending={pending} label="Connecting">
      <div style={{ height: pending ? 30 : 160 }}><input aria-label="Draft" value={draft} onChange={e => setDraft(e.target.value)} /><button>Connect</button></div>
    </PendingContent></HjmProvider>;
  }
  try {
    await act(() => root.render(<Example pending={false} />));
    const input = host.querySelector("input")!;
    const frame = input.parentElement!.parentElement!.parentElement!;
    const ready = frame.getBoundingClientRect();
    await act(() => root.render(<Example pending />));
    expect(host.querySelector("input")).toBe(input);
    expect(input.value).toBe("saved draft");
    expect(input.closest("[inert]")).not.toBeNull();
    expect(input.closest('[aria-hidden="true"]')).not.toBeNull();
    const status = host.querySelector<HTMLElement>('[role="status"]')!;
    expect(host.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(status.getAttribute("aria-label")).toBe("Connecting");
    const busy = frame.getBoundingClientRect(), spinner = status.getBoundingClientRect();
    expect(busy.height).toBe(ready.height);
    expect(Math.abs(spinner.left + spinner.width / 2 - (busy.left + busy.width / 2))).toBeLessThan(1);
    expect(Math.abs(spinner.top + spinner.height / 2 - (busy.top + busy.height / 2))).toBeLessThan(1);
    await act(() => root.render(<Example pending={false} />));
    expect(host.querySelector("input")).toBe(input);
    expect(input.closest("[inert]")).toBeNull();
    expect(host.querySelector('[role="status"]')).toBeNull();
  } finally { await act(() => root.unmount()); host.remove(); }
});
