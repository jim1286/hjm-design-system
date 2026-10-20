import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ListDetailScreen } from "../src/screen-flows.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("keeps detail tools and CTA outside the scrolling body, then restores the retained list", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host), tool = vi.fn(), run = vi.fn();
  const frame = (open: boolean) => <HjmProvider reducedMotion><div style={{ height: 560, width: 360 }}>
    <ListDetailScreen title="List" initialFocus="none" list={<input aria-label="Retained note" defaultValue="Keep me" />}
      back={{ label: "Back", onAction() {} }}
      {...(open ? { detail: { title: "Detail", actions: <button onClick={tool}>Share</button>,
        footer: <button onClick={run}>Run</button>, content: <div style={{ height: 1600 }}>Long content</div> } } : {})} />
  </div></HjmProvider>;
  try {
    await act(async () => root.render(frame(false)));
    const retained = host.querySelector("input")!;
    await act(async () => root.render(frame(true)));
    const screen = host.querySelectorAll<HTMLElement>(".hjm-screen")[1]!;
    const body = screen.querySelector<HTMLElement>(".hjm-screen__body")!;
    const footer = screen.querySelector<HTMLElement>(".hjm-screen__footer")!;
    const share = Array.from(screen.querySelectorAll("button")).find(button => button.textContent === "Share")!;
    const primary = footer.querySelector("button")!;
    expect(body.contains(share)).toBe(false); expect(body.contains(primary)).toBe(false);
    const top = footer.getBoundingClientRect().top;
    body.scrollTop = 700;
    expect(body.scrollTop).toBeGreaterThan(0);
    expect(footer.getBoundingClientRect().top).toBe(top);
    await act(async () => { share.click(); primary.click(); });
    expect(tool).toHaveBeenCalledOnce(); expect(run).toHaveBeenCalledOnce();
    await act(async () => root.render(frame(false)));
    expect(host.querySelector("input")).toBe(retained);
    expect(retained.value).toBe("Keep me");
    expect(host.textContent).not.toContain("Share"); expect(host.textContent).not.toContain("Run");
  } finally { await act(async () => root.unmount()); host.remove(); }
});
