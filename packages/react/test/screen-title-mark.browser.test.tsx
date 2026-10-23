import "../src/styles.css";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ScreenLayout } from "../src/screens.js";

// 2026-10-23: the title row wraps, so a long title dropped under a lone title mark (same fault as CompositionLayout).
it.each(["center", "start"] as const)("keeps a long %s title on the mark's line, wrapping beside it", async (headerAlignment) => {
 (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 const host = document.createElement("div"); host.style.width = "320px"; document.body.append(host); const root = createRoot(host);
 try {
  await act(async () => root.render(<HjmProvider><div style={{ height: 400 }}><ScreenLayout headerAlignment={headerAlignment} title={"아주 긴 화면 제목 ".repeat(4)}
   titleLeading={<span style={{ display: "block", width: 28, height: 28 }} />}><p>본문</p></ScreenLayout></div></HjmProvider>));
  const mark = host.querySelector<HTMLElement>(".hjm-screen__title-leading")!.getBoundingClientRect();
  const heading = host.querySelector<HTMLElement>("h1")!.getBoundingClientRect();
  expect(heading.height).toBeGreaterThan(mark.height); // the title wraps instead of overflowing
  expect(heading.left).toBeGreaterThanOrEqual(mark.right - 0.5);
  expect(heading.top).toBeLessThan(mark.bottom);
  expect(heading.right).toBeLessThanOrEqual(host.getBoundingClientRect().right + 0.5);
 } finally { await act(async () => root.unmount()); host.remove(); }
});
