import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page as browser, userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { WebNavigationPreview } from "../../../showcase/web/src/patterns/WebNavigation.previews.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root, initialUrl: string;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;initialUrl=location.href;history.replaceState(history.state,"",location.pathname+location.search);host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();history.replaceState(history.state,"",initialUrl);});
const render=(twice=false)=>act(async()=>root.render(<HjmProvider reducedMotion><div data-preview="first"><WebNavigationPreview/></div>{twice&&<div data-preview="second"><WebNavigationPreview/></div>}</HjmProvider>));
const first=()=>host.querySelector<HTMLDivElement>('[data-preview="first"]')!;
const current=()=>first().querySelector<HTMLButtonElement>('.hjm-pagination [aria-current="page"]')!;
const content=()=>first().querySelector<HTMLDivElement>('div[tabindex="-1"]')!;
const changedHash=()=>new Promise<void>(resolve=>window.addEventListener("hashchange",()=>resolve(),{once:true}));
const click=(role:"link"|"button",name:string)=>act(async()=>{const changed=role==="link"?changedHash():undefined;await browser.getByRole(role,{name,exact:true}).click();await changed;});
const traverse=async(direction:"back"|"forward")=>{await act(async()=>{await new Promise<void>(resolve=>{window.addEventListener("hashchange",()=>resolve(),{once:true});history[direction]();});});};
it("restores the initial collection on browser back and follows forward with focus on the new content",async()=>{
 await render();expect(current().textContent).toBe("1");expect(document.activeElement).not.toBe(content());for(let index=0;index<4;index++)await click("button","다음 페이지");expect(current().textContent).toBe("5");await click("link","전체 보관함");expect(first().textContent).toContain("다시 보고 싶은 기록");expect(document.activeElement).toBe(content());
 await traverse("back");expect(first().textContent).toContain("걸었던 날을 모아봤어요");expect(current().textContent).toBe("1");expect(document.activeElement).toBe(content());await traverse("forward");expect(first().querySelector('.hjm-pagination')).toBeNull();
 await click("link","산책 기록 125개 보기");expect(current().textContent).toBe("1");expect(document.activeElement).toBe(content());
});
it("keeps page range, boundary controls and keyboard focus synchronized without a scroll jump",async()=>{
 host.style.paddingTop="400px";host.style.paddingBottom="800px";await render();first().querySelector<HTMLButtonElement>('.hjm-pagination__previous')!.focus();await act(async()=>userEvent.keyboard("{Enter}"));expect(current().textContent).toBe("1");expect(first().querySelector('.hjm-pagination__previous')?.getAttribute('aria-disabled')).toBe("true");
 await click("button","25페이지 중 25페이지로 이동");expect(first().textContent).toContain("121–125");expect(first().querySelector('.hjm-pagination__next')?.getAttribute('aria-disabled')).toBe("true");first().querySelector<HTMLButtonElement>('.hjm-pagination__next')!.focus();await act(async()=>userEvent.keyboard("{Enter}"));expect(current().textContent).toBe("25");
 const previous=first().querySelector<HTMLButtonElement>('.hjm-pagination__previous')!;previous.focus();const top=window.scrollY;await act(async()=>userEvent.keyboard("{Enter}"));expect(current().textContent).toBe("24");expect(first().textContent).toContain("116–120");expect(document.activeElement).toBe(previous);expect(window.scrollY).toBe(top);expect(first().querySelectorAll('.hjm-list-row')).toHaveLength(5);
});
it("isolates mounted previews and ignores unrelated or malformed fragments",async()=>{
 await render(true);const second=host.querySelector<HTMLDivElement>('[data-preview="second"]')!;const otherContent=second.querySelector('div[tabindex="-1"]')!;expect(otherContent.id).not.toBe(content().id);await act(async()=>second.querySelector<HTMLButtonElement>('.hjm-pagination__next')!.click());
 await act(async()=>{const changed=changedHash();first().querySelector<HTMLAnchorElement>('.hjm-breadcrumb a')!.click();await changed;});await expect.poll(()=>first().querySelector('.hjm-pagination')).toBeNull();expect(second.querySelector('.hjm-pagination [aria-current="page"]')?.textContent).toBe("2");
 await act(async()=>{const changed=changedHash();location.hash="%invalid";await changed;});expect(first().querySelector('.hjm-pagination')).toBeNull();expect(second.textContent).toContain("걸었던 날을");await traverse("back");await traverse("back");expect(first().querySelector('.hjm-pagination [aria-current="page"]')?.textContent).toBe("1");expect(second.querySelector('.hjm-pagination [aria-current="page"]')?.textContent).toBe("2");
});
