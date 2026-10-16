import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import dashboard from "../../../showcase/web/src/patterns/Dashboard.stories.js";
import gallery from "../../../showcase/web/src/patterns/DiscoveryGallery.stories.js";
import "../src/styles.css";
const Dashboard = dashboard.component, Gallery = gallery.component;
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (screen: "dashboard" | "gallery") => act(async () => root.render(<HjmProvider reducedMotion>{screen === "dashboard" ? <Dashboard/> : <Gallery/>}</HjmProvider>));
const named = (name: string) => [...(document.querySelector('[role="dialog"]') ?? document).querySelectorAll<HTMLButtonElement | HTMLInputElement>("button,input")].find(node => (node.getAttribute("aria-label") ?? (node instanceof HTMLInputElement ? node.labels?.[0]?.textContent : node.querySelector(".hjm-chip__label")?.textContent ?? node.textContent)) === name)!;
const click = (name: string) => act(async () => { expect(named(name)).toBeDefined(); named(name).focus(); named(name).click(); });
const close = async () => { await click("닫기"); await act(async () => { await new Promise(resolve => setTimeout(resolve, 80)); }); };
const stats = () => [...host.querySelectorAll(".hjm-statistic__value")].map(node => node.textContent);
it("keeps dashboard period totals, records and day views consistent through empty recovery", async () => {
 await render("dashboard"); expect(stats()).toEqual(["7","6","125"]);
 await click("최근 7일"); expect(stats()).toEqual(["4","3","80"]); expect(host.textContent).not.toContain("가을 산책"); expect(host.textContent).toContain("2026-09-24 — 2026-09-30");
 await click("날짜 목록으로 보기"); expect(host.textContent).toContain("2026-09-28 · 2개 기록");
 await click("8월"); expect(stats()).toEqual(["0","0","0"]); expect(host.textContent).toContain("아직 기록이 없는 달이에요");
 await click("9월 보기"); expect(document.activeElement).toBe(named("9월")); expect(stats()).toEqual(["7","6","125"]); expect(named("활동 달력으로 보기")).toBeDefined();
});
it("combines category and search, resets empty filters and keeps detail and card save state in sync", async () => {
 await render("gallery"); await click("최신순"); expect((named("최신순") as HTMLInputElement).checked).toBe(true); expect(host.querySelector("article")!.textContent).toContain("초록을 기록하는 하루"); await click("모바일"); expect(host.querySelectorAll("article")).toHaveLength(2);
 const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
 await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "없는 작품"); input.dispatchEvent(new Event("input", {bubbles:true})); });
 expect(host.textContent).toContain("찾는 작품이 없어요"); await click("필터 초기화"); expect(document.activeElement).toBe(input); expect(input.value).toBe(""); expect((named("최신순") as HTMLInputElement).checked).toBe(true); expect(host.querySelectorAll("article")).toHaveLength(6);
 await click("초록을 기록하는 하루 보기"); await click("초록을 기록하는 하루 저장"); await close(); expect(document.activeElement).toBe(named("초록을 기록하는 하루 보기"));
 expect(named("초록을 기록하는 하루 저장 취소").getAttribute("aria-pressed")).toBe("true"); expect(named("저장한 작품만 1").getAttribute("role")).toBe("checkbox");
});
it("recovers focus when unsaving removes the focused card or the detail return target", async () => {
 await render("gallery"); await click("초록을 기록하는 하루 저장"); await click("저장한 작품만 1"); await click("초록을 기록하는 하루 저장 취소");
 expect(document.activeElement).toBe(named("저장한 작품만 0"));
 await click("필터 초기화"); await click("초록을 기록하는 하루 저장"); await click("저장한 작품만 1"); await click("초록을 기록하는 하루 보기");
 const dialog = document.querySelector('[role="dialog"]')!;
 await act(async () => dialog.querySelector<HTMLButtonElement>('[aria-label="초록을 기록하는 하루 저장 취소"]')!.click());
 expect(document.querySelector('[role="dialog"]')).not.toBeNull(); await close(); expect(document.activeElement).toBe(named("저장한 작품만 0"));
});

it("applies every batched sort and saved-only activation", async () => {
 await render("gallery");
 await act(async () => { named("최신순").click(); named("인기순").click(); }); expect((named("인기순") as HTMLInputElement).checked).toBe(true); expect(host.querySelector("article")!.textContent).not.toContain("초록을 기록하는 하루");
 await act(async () => { const target=named("저장한 작품만 0"); target.click(); target.click(); }); expect(named("저장한 작품만 0").getAttribute("aria-checked")).toBe("false"); expect(host.querySelectorAll("article")).toHaveLength(6);
});
