/// <reference path="./media-picker-showcase.assets.d.ts" />
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { spacing } from "@hjmds/design-contracts/foundations";
import { HjmProvider } from "@hjmds/react/provider";
import { MediaPickerPreview } from "../../../showcase/web/src/patterns/media-picker-preview.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });
const render = (tools = false) => act(async () => root.render(<HjmProvider reducedMotion><MediaPickerPreview tools={tools}/></HjmProvider>));
const named = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => (node.getAttribute("aria-label") ?? node.textContent) === label)!;
const click = (label: string) => act(async () => { expect(named(label)).toBeDefined(); named(label).click(); });
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 400)); });
it("keeps completion immutable and restarts with an empty selection", async () => {
 await render(); await click("강과 산 1"); await click("1장 선택 완료"); await settle();
 // Supports the old one-step completion long enough to reproduce its mutable result.
 if (named("1장 추가 완료")) await click("1장 추가 완료");
 expect(host.textContent).toContain("사진을 선택했어요");
 expect(named("강과 산 1 선택 해제")).toBeUndefined();
 await click("새로 선택"); expect(named("0장 선택 완료").disabled).toBe(true);
});
it("retries only the failed photo, preserves order and blocks incomplete completion", async () => {
 await render(true); await click("강과 산 1"); await click("푸른 계곡 2"); await click("2장 선택 완료");
 expect(named("업로드 중").disabled).toBe(true); await settle();
 expect(named("2장 추가 완료").disabled).toBe(true); expect(host.textContent).toContain("업로드하지 못했어요");
 await click("푸른 계곡 2 앞으로");
 expect([...host.querySelectorAll<HTMLElement>("[data-hjm-media-item]")].map(node => node.dataset.hjmMediaItem)).toEqual(["1","0"]);
 const success = host.querySelector('[data-hjm-media-item="1"]')!; expect(success.textContent).toContain("업로드 완료");
 await click("재시도"); expect(success.textContent).toContain("업로드 완료"); await settle();
 await click("2장 추가 완료"); expect([...host.querySelectorAll('img[alt$="선택 완료"]')].map(node => node.getAttribute("alt"))).toEqual(["푸른 계곡 2 선택 완료","강과 산 1 선택 완료"]);
});
it("does not restore a removed pending upload and lets an empty review return to selection", async () => {
 await render(); await click("강과 산 1"); await click("1장 선택 완료"); await click("강과 산 1 삭제"); await settle();
 expect(host.querySelectorAll("[data-hjm-media-item]")).toHaveLength(0); expect(named("0장 추가 완료").disabled).toBe(true);
 await click("선택으로 돌아가기"); expect(named("강과 산 1").getAttribute("aria-checked")).toBe("false");
});

it("keeps selection order across albums and returns focus from a removed thumbnail to its library tile", async () => {
 await render(); await click("강아지 4"); await click("강과 산 1");
 const remove = named("강과 산 1 선택 해제"); remove.focus(); await click("강과 산 1 선택 해제");
 expect(document.activeElement).toBe(named("강과 산 1")); await click("강과 산 1");
 await click("최근 항목 ▾");
 const landscape = [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(node => node.value === "풍경")!;
 await act(async () => landscape.click());
 expect(named("강아지 4")).toBeUndefined(); expect(named("강아지 4 선택 해제")).toBeDefined();
 await click("강아지 4 선택 해제"); expect(document.activeElement).toBe(named("풍경 ▾"));
 expect(named("강과 산 1").textContent).toBe("1");
});

it("keeps five completed photos at token size in a horizontally scrolling strip on a 390px viewport", async () => {
 await page.viewport(390, 844); await render();
 for (const name of ["강과 산 1","푸른 계곡 2","붉은 협곡 3","강아지 4","숲속 동물 5"]) await click(name);
 await click("5장 선택 완료"); await settle(); await click("5장 추가 완료");
 const images = [...host.querySelectorAll<HTMLImageElement>('img[alt$="선택 완료"]')];
 expect(images).toHaveLength(5);
 for (const image of images) { expect(image.getBoundingClientRect().width).toBe(spacing.xxxl * 2); expect(getComputedStyle(image).flexShrink).toBe("0"); }
 const strip = images[0]!.parentElement!;
 expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth); strip.scrollLeft = strip.scrollWidth;
 expect(strip.scrollLeft).toBeGreaterThan(0);
});
