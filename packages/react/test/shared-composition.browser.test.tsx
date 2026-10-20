import { TopBar } from "../src/top-bar.js";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { CompositionLayout, ScreenLayout } from "../src/screens.js";
import { CommentThreadRow, CommentThreadScreen } from "../src/screen-flows.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it("preserves an edited input on nonblocking failure and replaces only content on access loss", async () => {
  const render = (restricted: boolean, failed: boolean) => root.render(<HjmProvider><CompositionLayout
    title="설정" badge={<span>2</span>} notice={failed ? <span>저장 실패</span> : null}
    state={restricted ? {kind: "restricted", title: "접근 제한"} : {kind: "ready"}}
    stateAction={<button>다시 확인</button>} footer={<button>닫기</button>}>
    <input aria-label="초안" defaultValue="원본" />
  </CompositionLayout></HjmProvider>);
  await act(async () => render(false, false));
  const input = host.querySelector("input")!; input.value = "아직 저장하지 않은 값"; input.focus();
  await act(async () => render(false, true));
  expect(host.querySelector("input")).toBe(input); expect(input.value).toBe("아직 저장하지 않은 값");
  await act(async () => render(true, true));
  expect(host.querySelector("input")).toBeNull();
  expect(host.textContent).toContain("접근 제한"); expect(host.textContent).toContain("닫기");
});
it("uses one comment row for both the built-in list and a virtualized host", async () => {
  const like = vi.fn(), reply = vi.fn();
  const item = {id: "one", parentId: null, author: "작성자", body: "내용", timeLabel: "방금", likeCountLabel: "3", likeIcon: "♡", likeLabel: "좋아요"};
  await act(async () => root.render(<HjmProvider><CommentThreadRow item={item} onLike={like} onReply={reply} replyLabel="답글" /></HjmProvider>));
  const rowText = host.textContent;
  await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="좋아요"]')!.click());
  expect(like).toHaveBeenCalledWith("one");
  await act(async () => [...host.querySelectorAll("button")].find(b => b.textContent === "답글")!.click());
  expect(reply).toHaveBeenCalledWith("one");
  await act(async () => root.render(<HjmProvider><CommentThreadScreen title="댓글" titleVisibility="hidden" items={[item]} expandedIds={[]} onExpandedChange={() => {}} onLike={like} onReply={reply} replyLabel="답글" repliesLabel={() => "펼침"}/></HjmProvider>));
  expect(host.textContent).toBe(rowText);
});
it("owns title badge placement and omits it with a replaced or hidden header", async () => {
  await act(async () => root.render(<HjmProvider><ScreenLayout title="목록" titleBadge={<span>12</span>}>내용</ScreenLayout></HjmProvider>));
  expect(host.querySelector("h1")?.parentElement?.textContent).toBe("목록12");
  await act(async () => root.render(<HjmProvider><ScreenLayout title="목록" titleVisibility="hidden" titleBadge={<span>12</span>}>내용</ScreenLayout></HjmProvider>));
  expect(host.textContent).not.toContain("12");
});
it("centers a ready prompt without losing overflow and preserves the host canvas", async () => {
  host.style.height = "300px";
  await act(async () => root.render(<HjmProvider host="contents"><ScreenLayout title="안내" titleVisibility="hidden" contentAlignment="center" surface="transparent"><button>로그인</button></ScreenLayout></HjmProvider>));
  const body = host.querySelector<HTMLElement>(".hjm-screen__body")!;
  const prompt = host.querySelector<HTMLElement>(".hjm-screen__centered-content")!;
  expect(Math.abs((body.getBoundingClientRect().top + body.getBoundingClientRect().bottom) / 2 - (prompt.getBoundingClientRect().top + prompt.getBoundingClientRect().bottom) / 2)).toBeLessThan(2);
  expect(getComputedStyle(host.querySelector(".hjm-screen")!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  await act(async () => root.render(<HjmProvider host="contents"><ScreenLayout title="안내" titleVisibility="hidden" contentAlignment="center"><div style={{height: 700}}>긴 안내</div></ScreenLayout></HjmProvider>));
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  expect(body.querySelector(".hjm-screen__centered-content")!.getBoundingClientRect().top).toBeGreaterThanOrEqual(body.getBoundingClientRect().top);
});
it("announces custom loading artwork with shared copy and returns to real content", async () => {
  const render = (loading: boolean) => root.render(<HjmProvider><CompositionLayout state={loading ? {kind:"loading",title:"찾는 중"} : {kind:"ready"}} loadingIndicator={<svg data-brand-loader />}>결과</CompositionLayout></HjmProvider>);
  await act(async () => render(true));
  expect(host.querySelector('[role="status"]')?.getAttribute("aria-label")).toBe("찾는 중");
  expect(host.textContent).not.toContain("찾는 중");
  expect(host.querySelector('[data-brand-loader]')?.parentElement?.getAttribute("aria-hidden")).toBe("true");
  await act(async () => render(false));
  expect(host.querySelector('[data-brand-loader]')).toBeNull(); expect(host.textContent).toBe("결과");
});
it("preserves a named title action while omitting the retired toolbar subtitle", async () => {
  const open = vi.fn();
  await act(async () => root.render(<HjmProvider><TopBar title="도구" subtitle="설명" onTitleClick={open} titleAccessibilityLabel="도구 상세" /></HjmProvider>));
  expect(host.querySelector(".hjm-top-bar__subtitle")).toBeNull();
  expect(host.textContent).not.toContain("설명");
  await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="도구 상세"]')!.click());
  expect(open).toHaveBeenCalledOnce();
});

it("keeps a product title control interactive in the common title slot", async () => {
  const toggle=vi.fn();
  await act(async () => root.render(<HjmProvider><TopBar titleContent={<button onClick={toggle}>작업 상태</button>}/></HjmProvider>));
  const button=host.querySelector<HTMLButtonElement>(".hjm-top-bar__title button")!;
  expect(button).not.toBeNull(); await act(async()=>button.click()); expect(toggle).toHaveBeenCalledOnce();
});

import { ProfileSummary } from '../src/screen-flows.js';
import { NotificationRow } from '../src/screens.js';
it('keeps profile commands independent and inbox previews under one named router target', async () => {
  const followers = vi.fn(), edit = vi.fn();
  await act(async () => root.render(<HjmProvider><ProfileSummary name="Person" headingLevel={1} avatar={<span>portrait</span>}
    stats={[{id:'followers',value:'12',label:'Followers',onPress:followers},{id:'posts',value:'3',label:'Posts'}]}
    nameActions={<button onClick={edit}>Edit</button>} />
    <a href="/entry" aria-label="Person replied. Now. Unread"><NotificationRow preview={<><strong>Person</strong> replied</>} metadata="Now" avatar={<span>portrait</span>} avatarBadge={<span>reply</span>} thumbnail={<span>subject</span>} unread /></a></HjmProvider>));
  expect(host.querySelector('h1')?.textContent).toBe('Person');
  const count = host.querySelector<HTMLButtonElement>('button[aria-label="12 Followers"]')!;
  await act(async () => count.click()); expect(followers).toHaveBeenCalledOnce(); expect(edit).not.toHaveBeenCalled();
  expect(host.querySelectorAll('a')).toHaveLength(1);
  expect(host.querySelector('a button')).toBeNull();
  expect(host.querySelector('[data-hjm-notification-row]')?.getAttribute('aria-hidden')).toBe('true');
  expect(host.querySelector('[data-hjm-unread-dot]')).not.toBeNull();
});
it('names loading status and keeps retry inside the announced failure group', async () => {
  await act(async () => root.render(<ScreenLayout title="Search" state={{kind:'loading',title:'Loading'}} />));
  expect(host.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Loading');
  await act(async () => root.render(<ScreenLayout title="Search" state={{kind:'error',title:'Failed'}} stateAction={<button>Retry</button>} />));
  expect(host.querySelector('[role="alert"] button')?.textContent).toBe('Retry');
});
