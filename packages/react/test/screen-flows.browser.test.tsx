import { act, useState } from "react";
import {createRoot,type Root} from "react-dom/client";
import {page} from "vitest/browser";
import {beforeEach,afterEach,it,expect,vi} from "vitest";
import {HjmProvider} from "../src/provider.js";
import {EditorScreen,ListDetailScreen,SearchScreen,PermissionScreen,CommentThreadScreen} from "../src/screen-flows.js";
import "../src/styles.css";
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
it("keeps list nodes and scroll position mounted across detail visits",async()=>{
 const props={title:"목록",list:<input aria-label="보존할 입력" defaultValue="초안"/>,back:{label:"돌아가기",onAction:vi.fn()}};
 await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props}/></HjmProvider>));const input=host.querySelector("input");
 await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props} detail={{title:"상세",content:"본문"}}/></HjmProvider>));expect(host.querySelector("input")).toBe(input);expect(input?.closest("[hidden]")).not.toBeNull();
 await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props}/></HjmProvider>));expect(host.querySelector("input")).toBe(input);expect(input?.value).toBe("초안");
});
it("requires confirmation before leaving dirty content and preserves it when cancelled",async()=>{
 const leave=vi.fn();await act(async()=>root.render(<HjmProvider><EditorScreen title="작성" dirty submit={{label:"저장",onAction:vi.fn()}} cancel={{label:"닫기",onAction:leave}} discard={{mode:"confirm",title:"버릴까요?",description:"초안이 사라져요",confirmLabel:"버리기",cancelLabel:"계속 작성",fallbackErrorMessage:"실패"}}><input aria-label="초안" defaultValue="유지"/></EditorScreen></HjmProvider>));
 await page.getByRole("button",{name:"닫기",exact:true}).click();expect(leave).not.toHaveBeenCalled();await page.getByRole("button",{name:"계속 작성",exact:true}).click();expect(host.querySelector("input")?.value).toBe("유지");
 await page.getByRole("button",{name:"닫기",exact:true}).click();await page.getByRole("button",{name:"버리기",exact:true}).click();expect(leave).toHaveBeenCalledTimes(1);
});
it("debounces latest search and aborts the previous host request on edits/unmount",async()=>{
 const calls:{query:string;signal:AbortSignal}[]=[];
 function Fixture(){const [query,setQuery]=useState("");return <SearchScreen title="검색" queryLabel="검색어" query={query} onQueryChange={setQuery} debounceMs={30} onSearch={(value,{signal})=>calls.push({query:value,signal})}>{null}</SearchScreen>;}
 await act(async()=>root.render(<HjmProvider><Fixture/></HjmProvider>));await page.getByRole("textbox",{name:"검색어"}).fill("첫 검색");await expect.poll(()=>calls.at(-1)?.query).toBe("첫 검색");const first=calls.at(-1)!;
 await page.getByRole("textbox",{name:"검색어"}).fill("마지막");expect(first.signal.aborted).toBe(true);await expect.poll(()=>calls.at(-1)?.query).toBe("마지막");const last=calls.at(-1)!;await act(async()=>root.render(null));expect(last.signal.aborted).toBe(true);
});
it("never requests permission on render and routes denied state to settings",async()=>{
 const request=vi.fn(),settings=vi.fn();await act(async()=>root.render(<HjmProvider><PermissionScreen title="권한" status="denied" explanation="안내" request={{label:"허용",onAction:request}} settings={{label:"설정 열기",onAction:settings}} continueAction={{label:"계속",onAction:vi.fn()}}/></HjmProvider>));expect(request).not.toHaveBeenCalled();await page.getByRole("button",{name:"설정 열기"}).click();expect(settings).toHaveBeenCalledOnce();expect(request).not.toHaveBeenCalled();
});
it("suppresses private comments and composer in restricted state",async()=>{
 await act(async()=>root.render(<HjmProvider><CommentThreadScreen title="댓글" state={{kind:"restricted",title:"로그인 필요"}} items={[]} expandedIds={[]} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="답글" repliesLabel={()=>"더 보기"} composer={<input aria-label="댓글 초안"/>}/></HjmProvider>));expect(host.querySelector("input")).toBeNull();
});

it("renders compact author and body in one text block and keeps the product attachment",async()=>{
 await act(async()=>root.render(<HjmProvider><CommentThreadScreen title="댓글" items={[{id:"one",parentId:null,author:"작성자",bodyText:"긴 본문",body:<a href="#photo">사진 열기</a>,timeLabel:"",likeCountLabel:"",likeIcon:null,likeLabel:"좋아요",likeAction:<button>하트</button>,canReply:false}]} expandedIds={[]} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="답글" repliesLabel={()=>"더 보기"}/></HjmProvider>));
 const line=Array.from(host.querySelectorAll(".hjm-text")).find(node=>node.textContent==="작성자 긴 본문");expect(line).toBeDefined();
 expect(host.querySelector("a")?.textContent).toBe("사진 열기");expect(host.querySelectorAll("button")).toHaveLength(1);
});

it("selects web capture synchronously in the click and cancel never opens a source",async()=>{
 const {PhotoSourceSheet}=await import("../src/screen-flows.js");const select=vi.fn(),close=vi.fn();
 await act(async()=>root.render(<HjmProvider><PhotoSourceSheet open onOpenChange={close} onSelect={select} labels={{title:"사진 추가",library:"앨범",camera:"촬영",cancel:"취소"}}/></HjmProvider>));
 expect(select).not.toHaveBeenCalled();
 const camera=document.querySelector<HTMLButtonElement>('button[aria-label="촬영"]')??Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(button=>button.textContent==="촬영")!;
 act(()=>camera.click());expect(select).toHaveBeenCalledExactlyOnceWith("camera");expect(close).toHaveBeenCalledWith(false);
 select.mockClear();await page.getByRole("button",{name:"취소",exact:true}).click();expect(select).not.toHaveBeenCalled();
});
