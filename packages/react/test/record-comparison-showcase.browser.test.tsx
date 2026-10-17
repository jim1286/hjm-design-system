import { act } from "react";
import { page } from "vitest/browser";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import { RecordComparison } from "../../../showcase/web/src/patterns/reference-flow-previews.js";
import { records } from "../../../showcase/shared/reference-flows.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(async () => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); await act(async () => root.render(<HjmProvider reducedMotion><RecordComparison/></HjmProvider>)); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const named = (name: string) => [...(document.querySelector('[role="dialog"]') ?? host).querySelectorAll<HTMLButtonElement | HTMLInputElement>('button,input[type="radio"]')].find(node => (node.getAttribute("aria-label") ?? (node instanceof HTMLInputElement ? node.labels?.[0]?.textContent : node.textContent)) === name)!;
const click = (name: string) => act(async () => { const target = named(name); expect(target).toBeDefined(); target.focus(); target.click(); });
const search = () => host.querySelector<HTMLInputElement>('input[type="search"]')!;
const query = (value: string) => act(async () => { const input=search(); input.focus(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,value); input.dispatchEvent(new Event("input",{bubbles:true})); });
const close = async (name: string) => { await click(name); await act(async () => { await new Promise(resolve => setTimeout(resolve,80)); }); };
it("keeps saved records and normalized search through all display modes, including text-only records", async () => {
 expect(host.textContent).toContain("목록 중심 · 3개의 기록 · 0개 저장");
 await click("책에서 만난 한 문장 저장"); await query("  책에서   문장  "); const input=search();
 expect(host.textContent).toContain("1개의 기록 · 1개 저장");
 for (const mode of ["읽기 중심","이미지 중심","목록 중심"]) {
  await click(mode); expect(search()).toBe(input); expect(input.value).toBe("  책에서   문장  "); expect(named("책에서 만난 한 문장 저장").getAttribute("aria-pressed")).toBe("true");
  expect(host.textContent!.includes(records[1].body)).toBe(mode !== "목록 중심");
 }
 await query(""); await click("이미지 중심"); expect(host.querySelectorAll('[role="img"]')).toHaveLength(2); expect(host.textContent).toContain(records[1].body);
});
it("restores search focus after empty recovery while preserving mode and saves", async () => {
 await click("비 온 뒤의 산책 저장"); await click("읽기 중심"); await query("없는 기록"); expect(host.textContent).toContain("찾는 기록이 없어요");
 const input=search(); await click("검색 초기화"); expect(document.activeElement).toBe(input); expect(input.value).toBe(""); expect(host.textContent).toContain("읽기 중심 · 3개의 기록 · 1개 저장");
});
it("returns from each detail close path to the origin without changing search or saved state", async () => {
 await query("바다"); await click("바다가 보이는 자리 저장");
 for (const exit of ["읽기 마치기", "닫기"]) {
  const trigger=named("바다가 보이는 자리 읽기"); await click("바다가 보이는 자리 읽기"); expect(document.querySelector('[role="dialog"]')!.textContent).toContain(records[2].body);
  await close(exit); expect(document.activeElement).toBe(trigger); expect(search().value).toBe("바다"); expect(named("바다가 보이는 자리 저장").getAttribute("aria-pressed")).toBe("true");
 }
});
it("applies every same-render save activation", async () => {
 await act(async () => { const target=named("비 온 뒤의 산책 저장"); target.click(); target.click(); });
 expect(host.textContent).toContain("0개 저장"); expect(named("비 온 뒤의 산책 저장").getAttribute("aria-pressed")).toBe("false");
});

it("returns a pointer-opened detail to its actual reading button", async () => {
 const trigger=named("비 온 뒤의 산책 읽기");
 await act(async () => page.getByRole("button",{name:"비 온 뒤의 산책 읽기",exact:true}).click());
 await act(async () => page.getByRole("button",{name:"읽기 마치기",exact:true}).click());
 await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
 await expect.poll(() => document.activeElement).toBe(trigger);
});
