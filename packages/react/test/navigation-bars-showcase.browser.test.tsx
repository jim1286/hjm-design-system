import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { ReferenceBar, NavigationBehaviorPreview, ReferenceNavigationBars } from "../../../showcase/web/src/patterns/reference-navigation-bars.js";
import { navigationBarReferences } from "../../../showcase/shared/navigation-bar-references.js";
import "../src/styles.css";
let host:HTMLDivElement,root:Root,url:string;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;url=location.href;history.replaceState(history.state,"",location.pathname+location.search);host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();history.replaceState(history.state,"",url);});
const changed=()=>new Promise<void>(resolve=>window.addEventListener("hashchange",()=>resolve(),{once:true}));
const link=async(name:string)=>act(async()=>{const done=changed();await page.getByRole("link",{name,exact:true}).click();await done;});
const selected=(scope:ParentNode=host)=>scope.querySelector<HTMLAnchorElement>('a[aria-current="page"]')!;
it("keeps link history and the current destination synchronized through browser back",async()=>{
 await act(async()=>root.render(<HjmProvider reducedMotion><ReferenceBar reference={navigationBarReferences[0]}/></HjmProvider>));expect(selected().textContent).toContain("홈");await link("공간");await link("스토어");expect(selected().textContent).toContain("스토어");await act(async()=>{const done=changed();history.back();await done;});expect(selected().textContent).toContain("공간");await act(async()=>{const done=changed();history.back();await done;});expect(selected().textContent).toContain("홈");
});
it("uses independent fragment routes when the same preview is mounted twice",async()=>{
 await act(async()=>root.render(<HjmProvider reducedMotion><div data-copy="a"><ReferenceBar reference={navigationBarReferences[0]}/></div><div data-copy="b"><ReferenceBar reference={navigationBarReferences[0]}/></div></HjmProvider>));const a=host.querySelector('[data-copy="a"]')!,b=host.querySelector('[data-copy="b"]')!;const first=a.querySelector<HTMLAnchorElement>('a')!,second=b.querySelector<HTMLAnchorElement>('a')!;expect(first.hash).not.toBe(second.hash);
 await act(async()=>{const done=changed();a.querySelectorAll<HTMLAnchorElement>('a')[1]!.click();await done;});expect(selected(a).textContent).toContain("공간");expect(selected(b).textContent).toContain("홈");
});
it("changes presets and counts primary actions separately from keyboard destination selection",async()=>{
 await act(async()=>root.render(<HjmProvider reducedMotion><NavigationBehaviorPreview behavior="center"/></HjmProvider>));await act(async()=>page.getByRole("radio",{name:"소셜",exact:true}).click());expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe("중앙 작성 버튼");const destination=host.querySelectorAll<HTMLAnchorElement>('nav a')[2]!;destination.focus();await act(async()=>{const done=changed();await userEvent.keyboard("{Enter}");await done;});expect(selected()).toBe(destination);expect(document.activeElement).toBe(destination);
 await act(async()=>{const action=host.querySelector<HTMLButtonElement>('button[aria-label="게시물 작성"]')!;action.click();action.click();});expect(host.textContent).toContain("좋아요 선택 · 게시물 작성 2회");expect(selected()).toBe(destination);await act(async()=>page.getByRole("radio",{name:"로봇 청소기",exact:true}).click());expect(host.textContent).toContain("홈 선택 · 전원 전환 0회");
 await act(async()=>root.render(<HjmProvider reducedMotion><ReferenceNavigationBars/></HjmProvider>));expect(host.querySelectorAll('nav')).toHaveLength(4);expect([...host.querySelectorAll('a[aria-current="page"]')].map(item=>item.textContent)).toEqual(["홈","홈","홈","프로젝트"]);
});
