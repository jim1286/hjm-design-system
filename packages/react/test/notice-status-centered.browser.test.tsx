import "../src/styles.css";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Notice } from "../src/feedback.js";
import { HjmProvider } from "../src/provider.js";

// 2026-10-23 BurnTok welcome: a centered slot sizes the status Notice to its content; the badge must keep its label width.
it("keeps a centered, content-width status Notice at its label width", async () => {
 (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 const host = document.createElement("div");
 Object.assign(host.style, { width: "390px", display: "flex", flexDirection: "column", alignItems: "center" });
 document.body.append(host); const root = createRoot(host);
 try {
  await act(async () => root.render(<HjmProvider><Notice appearance="status" tone="success" title="프로필 사진을 변경했어요" /></HjmProvider>));
  const notice = host.firstElementChild!.querySelector<HTMLElement>(".hjm-notice")!;
  const label = [...notice.querySelectorAll<HTMLElement>("*")].find(node => node.textContent === "프로필 사진을 변경했어요" && node.children.length === 0)!;
  expect(label.getBoundingClientRect().width).toBeGreaterThan(80);
  const box = notice.getBoundingClientRect(), frame = host.getBoundingClientRect();
  expect(Math.abs((box.left - frame.left) - (frame.right - box.right))).toBeLessThan(2);
 } finally { await act(async () => root.unmount()); host.remove(); }
});
