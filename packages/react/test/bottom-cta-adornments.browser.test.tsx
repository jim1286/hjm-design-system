import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { BottomCTA } from "../src/bottom-cta.js";
import { HjmProvider } from "../src/provider.js";
import { ScreenLayout } from "../src/screens.js";
import "../src/styles.css";

it("aligns a standalone footer action with the screen body at phone and tablet widths", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await act(async () => root.render(<HjmProvider>
      <ScreenLayout title="Search" initialFocus="none"><div data-testid="body-edge">Results</div></ScreenLayout>
      <BottomCTA primaryAction={{label: "Find", onClick: () => {}}} />
    </HjmProvider>));
    for (const width of [390, 768, 1200]) {
      host.style.width = `${width}px`;
      const body = host.querySelector('[data-testid="body-edge"]')!.getBoundingClientRect();
      const action = host.querySelector(".hjm-bottom-cta button")!.getBoundingClientRect();
      expect(action.left, `left edge at ${width}px`).toBeCloseTo(body.left, 1);
      expect(action.right, `right edge at ${width}px`).toBeCloseTo(body.right, 1);
    }
  } finally { await act(async () => root.unmount()); host.remove(); }
});

it("keeps decorated footer actions independent and blocks only the busy action", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host), run = vi.fn(), remix = vi.fn();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const frame = (loading: boolean) => <HjmProvider><BottomCTA
    primaryAction={{ label: "Run", onClick: run, leading: <svg data-testid="run-icon" />, trailing: <svg data-testid="end-icon" /> }}
    secondaryAction={{ label: "Remix", onClick: remix, loading, leading: <svg data-testid="remix-icon" /> }} /></HjmProvider>;
  try {
    await act(async () => root.render(frame(false)));
    const buttons = host.querySelectorAll("button"), secondary = buttons[0]!, primary = buttons[1]!;
    expect(buttons).toHaveLength(2);
    expect(primary.querySelector('[data-testid="run-icon"]')).not.toBeNull();
    expect(primary.querySelector('[data-testid="end-icon"]')).not.toBeNull();
    expect(secondary.querySelector('[data-testid="remix-icon"]')).not.toBeNull();
    await act(async () => { primary.click(); secondary.click(); });
    expect(run).toHaveBeenCalledOnce(); expect(remix).toHaveBeenCalledOnce();
    await act(async () => root.render(frame(true)));
    await act(async () => { secondary.click(); primary.click(); });
    expect(remix).toHaveBeenCalledOnce(); expect(run).toHaveBeenCalledTimes(2);
    expect(secondary.getAttribute("aria-busy")).toBe("true");
  } finally { await act(async () => root.unmount()); host.remove(); }
});
