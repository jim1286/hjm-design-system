import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { Top } from "../src/top.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "720px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const title = "아이디어를 제품으로,\n제품을 오래 쓰이는 구조로.";

it("draws the intended break on two lines while the heading keeps a one-sentence name", async () => {
  await act(async () => root.render(<HjmProvider><Top descriptor={{ title, titleLineBreaks: "preserve" }} /></HjmProvider>));
  const heading = host.querySelector<HTMLElement>("h1")!;
  const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
  expect(Math.round(heading.getBoundingClientRect().height / lineHeight)).toBe(2);
  await expect.element(page.getByRole("heading", { level: 1, name: "아이디어를 제품으로, 제품을 오래 쓰이는 구조로." })).toBeInTheDocument();
});

it("collapses the break by default so a wide title stays on one line", async () => {
  await act(async () => root.render(<HjmProvider><Top descriptor={{ title }} /></HjmProvider>));
  const heading = host.querySelector<HTMLElement>("h1")!;
  expect(heading.textContent).toBe("아이디어를 제품으로, 제품을 오래 쓰이는 구조로.");
  expect(Math.round(heading.getBoundingClientRect().height / parseFloat(getComputedStyle(heading).lineHeight))).toBe(1);
});
