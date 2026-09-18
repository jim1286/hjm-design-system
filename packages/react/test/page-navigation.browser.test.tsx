import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Breadcrumb } from "../src/breadcrumb.js";
import { Pagination } from "../src/pagination.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });
const labels = { previous: "이전 페이지", next: "다음 페이지" };
const name = ({ page, totalPages }: { page: number; totalPages: number }) => `${totalPages}페이지 중 ${page}페이지`;
it("keeps current breadcrumb text out of the tab order and preserves real ancestor URLs", async () => {
  await act(async () => root.render(<HjmProvider><Breadcrumb label="현재 위치" items={[{ id: "all", label: "기록", destination: { kind: "internal", href: "#records" } }, { id: "current", label: "일상" }]} /></HjmProvider>));
  expect(host.querySelectorAll("nav ol li")).toHaveLength(2);
  expect(host.querySelector("a")?.getAttribute("href")).toBe("#records");
  expect(host.querySelector('[aria-current="page"]')?.tagName).toBe("SPAN");
  expect(host.querySelector('[aria-current="page"]')?.getAttribute("tabindex")).toBeNull();
  expect(host.querySelector(".hjm-breadcrumb__separator")?.getAttribute("aria-hidden")).toBe("true");
});
it.each(["ltr", "rtl"] as const)("wraps long paths and four-digit page numbers at 320px/2x in %s", async (direction) => {
  await page.viewport(320, 720);
  await act(async () => root.render(<HjmProvider textScale={2} direction={direction}><Breadcrumb label="현재 위치" items={[{ id: "all", label: "아주긴기록모음으로돌아가는경로", destination: { kind: "internal", href: "#records" } }, { id: "current", label: "최근에쓴아주긴일상기록모음" }]} /><Pagination label="기록 페이지" descriptor={{ currentPage: 1000, totalPages: 1001 }} labels={labels} composeAccessibleName={name} onPageChange={() => {}} /></HjmProvider>));
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  for (const button of host.querySelectorAll(".hjm-pagination__item")) expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
  expect(host.querySelectorAll('.hjm-pagination [aria-current="page"]')).toHaveLength(1);
  const arrow = host.querySelector(".hjm-pagination__next > span")!;
  expect(getComputedStyle(arrow).transform).toBe(direction === "rtl" ? "matrix(-1, 0, 0, 1, 0, 0)" : "none");
});
it("retains focus and blocks repeated activation when next reaches the last page", async () => {
  const change = vi.fn();
  function Fixture() { const [current, setCurrent] = useState(1); return <Pagination label="페이지" descriptor={{ currentPage: current, totalPages: 2 }} labels={labels} composeAccessibleName={name} onPageChange={(value, reason) => { change(value, reason); setCurrent(value); }} />; }
  await act(async () => root.render(<Fixture />)); const next = host.querySelector<HTMLButtonElement>(".hjm-pagination__next")!;
  next.focus(); await act(async () => next.click()); expect(document.activeElement).toBe(next);
  expect(next.getAttribute("aria-disabled")).toBe("true"); await act(async () => next.click()); expect(change).toHaveBeenCalledTimes(1);
  expect(change).toHaveBeenCalledWith(2, "next");
});
it("keeps an empty result set on its one non-actionable page", async () => {
  const change = vi.fn(); await act(async () => root.render(<Pagination label="페이지" descriptor={{ currentPage: 1, totalCount: 0, pageSize: 10 }} labels={labels} composeAccessibleName={name} onPageChange={change} />));
  await act(async () => { host.querySelectorAll<HTMLButtonElement>("button").forEach((button) => button.click()); });
  expect(change).not.toHaveBeenCalled(); expect(host.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
});
