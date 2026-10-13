import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ChatScreen } from "../src/screens.js";
import { CommentThreadScreen, ListDetailScreen, OnboardingScreen, type CommentThreadItem } from "../src/screen-flows.js";
import "../src/styles.css";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it("keeps the first-message composer through empty to ready and hides it for unavailable content", async () => {
  for (const kind of ["empty", "ready", "loading", "error", "restricted"] as const) {
    await act(async () => root.render(<HjmProvider><ChatScreen title="Conversation" state={kind === "ready" ? {kind} : {kind, title: kind}} composer={<input aria-label="Message" defaultValue="Draft"/>}>Messages</ChatScreen></HjmProvider>));
    expect(host.querySelector("input") !== null).toBe(kind === "empty" || kind === "ready");
  }
});
it("recovers detail independently and restores the unchanged list input and focus", async () => {
  const retry = vi.fn();
  const props = {title: "List", list: <input aria-label="Filter" defaultValue="kept"/>, back: {label: "Back", onAction: vi.fn()}};
  const render = (detail?: Parameters<typeof ListDetailScreen>[0]["detail"]) => act(async () => root.render(<HjmProvider><ListDetailScreen {...props} {...(detail ? {detail} : {})}/></HjmProvider>));
  await render(); const input = host.querySelector("input")!; input.focus();
  await render({title: "Detail", content: "Private content", state: {kind: "error", title: "Try again"}, stateAction: <button onClick={retry}>Retry detail</button>});
  expect(host.textContent).not.toContain("Private content");
  expect(input.closest("[hidden]")).not.toBeNull();
  await act(async () => [...host.querySelectorAll("button")].find(button => button.textContent === "Retry detail")!.click());
  expect(retry).toHaveBeenCalledOnce();
  await render({title: "Detail", content: "Recovered content", notice: "Up to date"});
  expect(host.textContent).toContain("Recovered content"); expect(host.textContent).toContain("Up to date");
  await render(); expect(host.querySelector("input")).toBe(input); expect(input.value).toBe("kept"); expect(document.activeElement).toBe(input);
});
it.each(["removed", "disabled"] as const)("restores focus when a content-scrolling detail trigger is %s", async state => {
  const render = (open: boolean, removed = false) => act(async () => root.render(<HjmProvider><ListDetailScreen title="List" scroll="content" list={removed && state === "removed" ? "No remaining items" : <button disabled={removed}>Open item</button>} back={{label:"Back",onAction:()=>{}}} {...(open ? {detail:{title:"Detail",content:"Details"}} : {})}/></HjmProvider>));
  await render(false); host.querySelector<HTMLButtonElement>("button")!.focus();
  await render(true); await render(true, true); await render(false, true);
  const list = host.querySelector(".hjm-screen")!;
  expect(document.activeElement === list || list.contains(document.activeElement) || document.activeElement?.contains(list)).toBe(true);
  expect(document.activeElement).not.toBe(document.body);
});
it("locks onboarding navigation during completion or skip and unlocks after failure", async () => {
  const move = vi.fn(), skip = vi.fn(), complete = vi.fn();
  for (const saving of ["complete", "skip", "none"] as const) {
    await act(async () => root.render(<HjmProvider><OnboardingScreen steps={[{id:"one",title:"One",description:"",content:null},{id:"two",title:"Two",description:"",content:"Chosen topics"}]} index={1} onIndexChange={move} nextLabel="Next" backLabel="Back" complete={{label:"Finish",onAction:complete,pending:saving==="complete"}} skip={{label:"Skip",onAction:skip,pending:saving==="skip"}} progressLabel={()=>"2 / 2"}/></HjmProvider>));
    expect([...host.querySelectorAll("button")].every(button => button.disabled)).toBe(saving !== "none");
    if (saving !== "none") await act(async () => { host.querySelectorAll("button").forEach(button => button.click()); });
  }
  expect(move).not.toHaveBeenCalled(); expect(skip).not.toHaveBeenCalled(); expect(complete).not.toHaveBeenCalled();
});
it("preserves server root and reply order when replies precede their roots", async () => {
  const item = (id: string, parentId: string|null): CommentThreadItem => ({id,parentId,author:id,body:null,timeLabel:"",likeCountLabel:"",likeIcon:"♥",likeLabel:`Like ${id}`,canReply:false});
  const items = [item("reply-b","b"),item("a",null),item("reply-a-2","a"),item("b",null),item("reply-a-1","a")];
  for (const expandedIds of [["a","b"],[]]) {
    await act(async () => root.render(<HjmProvider><CommentThreadScreen title="Comments" items={items} expandedIds={expandedIds} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="Reply" repliesLabel={n=>`${n} replies`}/></HjmProvider>));
    expect([...host.querySelectorAll('button[aria-label^="Like "]')].map(button=>button.getAttribute("aria-label"))).toEqual(expandedIds.length ? ["Like a","Like reply-a-2","Like reply-a-1","Like b","Like reply-b"] : ["Like a","Like b"]);
  }
});
it("centers an empty saved collection while keeping explicit failures and home creation", async () => {
  const {SavedItemsScreen}=await import("../src/saved-items.js");
  const props={title:"Saved",items:[],collections:[],labels:{allItems:"All",back:"Back",createCollection:"Create",privateNotice:"Private",empty:"No saved items"},onOpenCollection:()=>{},onOpenItem:()=>{},onBack:()=>{},onCreateCollection:()=>{},renderThumbnail:()=>null,renderDetail:()=>null};
  await act(async()=>root.render(<HjmProvider><SavedItemsScreen {...props} collectionId={null}/></HjmProvider>));
  expect(host.querySelector(".hjm-screen__state")?.textContent).toBe("No saved items");
  await act(async()=>root.render(<HjmProvider><SavedItemsScreen {...props} collectionId={null} state={{kind:"error",title:"Failed"}}/></HjmProvider>));
  expect(host.querySelector(".hjm-screen__state")?.textContent).toBe("Failed");
  await act(async()=>root.render(<HjmProvider><SavedItemsScreen {...props}/></HjmProvider>));
  expect(host.querySelector(".hjm-screen__state")).toBeNull(); expect(host.textContent).toContain("Create");
});
