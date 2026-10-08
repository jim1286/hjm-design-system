import { act, useState, type ReactNode } from "react";
import {createRoot,type Root} from "react-dom/client";
import {page,userEvent} from "vitest/browser";
import {beforeEach,afterEach,it,expect,vi} from "vitest";
import {HjmProvider} from "../src/provider.js";
import {EditorScreen,ListDetailScreen,SearchScreen,PermissionScreen,CommentThreadScreen} from "../src/screen-flows.js";
import "../src/styles.css";
it("keeps comment overflow beside the heart with separate keyboard actions at narrow width",async()=>{
 const {IconButton}=await import("../src/actions.js");
 const like=vi.fn(),more=vi.fn();host.style.width="320px";host.style.height="720px";
 for(const theme of ["light","dark"] as const)for(const direction of ["ltr","rtl"] as const){
  await act(async()=>root.render(<HjmProvider theme={theme} direction={direction} textScale={2}><CommentThreadScreen title="댓글" items={[{id:"one",parentId:null,author:"작성자가 긴 댓글",body:"본문을 읽은 뒤 답글을 작성할 수 있습니다.",timeLabel:"방금",likeCountLabel:"좋아요 3개",likeIcon:"♡",likeLabel:"댓글 좋아요",actions:<IconButton label="댓글 더보기" tone="ghost" onClick={more}>⋮</IconButton>}]} expandedIds={[]} onExpandedChange={()=>{}} onLike={like} onReply={()=>{}} replyLabel="답글" repliesLabel={()=>"답글 더 보기"}/></HjmProvider>));
  const heart=host.querySelector<HTMLButtonElement>('button[aria-label="댓글 좋아요"]')!,overflow=host.querySelector<HTMLButtonElement>('button[aria-label="댓글 더보기"]')!;
  expect(heart.parentElement).toBe(overflow.parentElement);
  expect([...heart.parentElement!.children]).toEqual([heart,overflow]);
  const h=heart.getBoundingClientRect(),m=overflow.getBoundingClientRect(),bounds=host.getBoundingClientRect();
  expect(Math.abs(h.y-m.y)).toBeLessThan(1);expect(h.width).toBeGreaterThanOrEqual(44);expect(m.width).toBeGreaterThanOrEqual(44);
  expect(m.left).toBeGreaterThanOrEqual(bounds.left);expect(m.right).toBeLessThanOrEqual(bounds.right+1);
  if(direction==="ltr")expect(m.x).toBeGreaterThan(h.x);else expect(m.x).toBeLessThan(h.x);
  await act(async()=>heart.focus());await userEvent.keyboard("{Enter}");expect(like).toHaveBeenLastCalledWith("one");
  await userEvent.keyboard("{Tab}");expect(document.activeElement).toBe(overflow);
  await userEvent.keyboard("{Enter}");expect(more).toHaveBeenCalledTimes(like.mock.calls.length);
 }
});
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
it("keeps list nodes and scroll position mounted across detail visits",async()=>{
 const props={title:"목록",list:<input aria-label="보존할 입력" defaultValue="초안"/>,back:{label:"돌아가기",onAction:vi.fn()}};
 await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props}/></HjmProvider>));const input=host.querySelector("input");input?.focus();
 await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props} detail={{title:"상세",content:"본문"}}/></HjmProvider>));expect(host.querySelector("input")).toBe(input);expect(input?.closest("[hidden]")).not.toBeNull();
 await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props}/></HjmProvider>));expect(host.querySelector("input")).toBe(input);expect(input?.value).toBe("초안");expect(document.activeElement).toBe(input);
});
it("requires confirmation before leaving dirty content and preserves it when cancelled",async()=>{
 const leave=vi.fn();await act(async()=>root.render(<HjmProvider><EditorScreen title="작성" dirty submit={{label:"저장",onAction:vi.fn()}} cancel={{label:"닫기",onAction:leave}} discard={{mode:"confirm",title:"버릴까요?",description:"초안이 사라져요",confirmLabel:"버리기",cancelLabel:"계속 작성",fallbackErrorMessage:"실패"}}><input aria-label="초안" defaultValue="유지"/></EditorScreen></HjmProvider>));
 await page.getByRole("button",{name:"닫기",exact:true}).click();expect(leave).not.toHaveBeenCalled();await page.getByRole("button",{name:"계속 작성",exact:true}).click();expect(host.querySelector("input")?.value).toBe("유지");
 await page.getByRole("button",{name:"닫기",exact:true}).click();await page.getByRole("button",{name:"버리기",exact:true}).click();expect(leave).toHaveBeenCalledTimes(1);
});
it("debounces latest search and aborts the previous host request on edits/unmount",async()=>{
 const calls:{query:string;signal:AbortSignal}[]=[];
 function Fixture(){const [query,setQuery]=useState("");return <SearchScreen queryClearLabel="검색어 지우기" title="검색" queryLabel="검색어" query={query} onQueryChange={setQuery} debounceMs={30} onSearch={(value,{signal})=>calls.push({query:value,signal})}>{null}</SearchScreen>;}
 await act(async()=>root.render(<HjmProvider><Fixture/></HjmProvider>));await page.getByRole("searchbox",{name:"검색어"}).fill("첫 검색");await expect.poll(()=>calls.at(-1)?.query).toBe("첫 검색");const first=calls.at(-1)!;
 await page.getByRole("searchbox",{name:"검색어"}).fill("마지막");expect(first.signal.aborted).toBe(true);await expect.poll(()=>calls.at(-1)?.query).toBe("마지막");const last=calls.at(-1)!;await act(async()=>root.render(null));expect(last.signal.aborted).toBe(true);
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

it("renders the host search field slot and applies the large search recipe", async () => {
 const {SearchField} = await import("../src/forms.js");
 await act(async () => root.render(<HjmProvider><SearchScreen queryClearLabel="검색어 지우기" title="검색" query="" queryLabel="기본 입력" onQueryChange={()=>{}} onSearch={()=>{}}
   queryField={<SearchField label="직접 고른 검색" size="large" clearLabel="지우기"/>}>{null}</SearchScreen></HjmProvider>));
 const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
 expect(input).not.toBeNull();
 expect(host.querySelectorAll("input")).toHaveLength(1);
 expect(getComputedStyle(input.closest(".hjm-field__control")!).minBlockSize).toBe("52px");
 expect(host.textContent).not.toContain("기본 입력");
});

it("clears the complete search query and returns focus to the input", async () => {
 const searches = vi.fn();
 function Fixture(){const [query,setQuery]=useState("한글 전체 검색어");return <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="검색어 지우기"
 query={query} onQueryChange={setQuery} onSearch={searches} debounceMs={0}>{null}</SearchScreen>;}
 await act(async () => root.render(<HjmProvider><Fixture/></HjmProvider>));
 const clear = page.getByRole("button",{name:"검색어 지우기"});
 await clear.click();
 const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
 expect(input.value).toBe("");
 expect(document.activeElement).toBe(input);
 expect(host.querySelector(".hjm-search-field__clear")).toBeNull();
 await expect.poll(() => searches.mock.calls.at(-1)?.[0]).toBe("");
});
it("does not steal focus when the detail is already open on first mount (deep link)",async()=>{
 // Review 2026-10-06: wasOpen started false, so a deep link mounting with detail open moved focus
 // to the back button. Only a user transition from list to detail may move focus.
 const outside=document.createElement("button");outside.textContent="밖";document.body.append(outside);outside.focus();
 const props={title:"목록",list:<button type="button">항목</button>,back:{label:"돌아가기",onAction:vi.fn()}};
 try{
  await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props} detail={{title:"상세",content:"본문"}}/></HjmProvider>));
  expect(document.activeElement).toBe(outside);
  await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props}/></HjmProvider>));
  host.querySelector<HTMLButtonElement>("button")!.focus();
  await act(async()=>root.render(<HjmProvider><ListDetailScreen {...props} detail={{title:"상세",content:"본문"}}/></HjmProvider>));
  expect(document.activeElement?.textContent).toBe("돌아가기");
 }finally{outside.remove();}
});

// 2026-10-06 search redesign: onSubmit is the "commit" signal (recent searches, suggestions → results).
it("commits the default search field on Enter but not while an IME is composing", async () => {
 const submit = vi.fn();
 function Fixture(){const [query,setQuery]=useState("");return <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="검색어 지우기"
 query={query} onQueryChange={setQuery} onSearch={()=>{}} onSubmit={submit}>{null}</SearchScreen>;}
 await act(async () => root.render(<HjmProvider><Fixture/></HjmProvider>));
 const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
 expect(input.getAttribute("enterkeyhint")).toBe("search");
 await page.getByRole("searchbox",{name:"검색어"}).fill("산책");
 // Korean IME: the Enter that confirms the last syllable arrives with isComposing and must not commit.
 await act(async () => { input.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",isComposing:true,bubbles:true})); });
 expect(submit).not.toHaveBeenCalled();
 await act(async () => { input.dispatchEvent(new KeyboardEvent("keydown",{key:"a",bubbles:true})); });
 expect(submit).not.toHaveBeenCalled();
 input.focus();await act(async()=>userEvent.keyboard("{Enter}"));
 expect(submit).toHaveBeenCalledExactlyOnceWith("산책");
});

it("leaves the default field without a submit hint unless onSubmit is supplied, and never wires a custom queryField", async () => {
 const {SearchField} = await import("../src/forms.js");const submit=vi.fn();
 await act(async () => root.render(<HjmProvider><SearchScreen queryClearLabel="검색어 지우기" title="검색" query="" queryLabel="검색어" onQueryChange={()=>{}} onSearch={()=>{}}>{null}</SearchScreen></HjmProvider>));
 expect(host.querySelector('input[type="search"]')!.hasAttribute("enterkeyhint")).toBe(false);
 await act(async () => root.render(<HjmProvider><SearchScreen title="검색" query="" queryLabel="검색어" onQueryChange={()=>{}} onSearch={()=>{}} onSubmit={submit}
   queryField={<SearchField label="직접 고른 검색" clearLabel="지우기" defaultValue="값"/>}>{null}</SearchScreen></HjmProvider>));
 const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
 expect(input.hasAttribute("enterkeyhint")).toBe(false);
 input.focus();await act(async()=>userEvent.keyboard("{Enter}"));
 expect(submit).not.toHaveBeenCalled();
});

it("keeps scroll-mode filters on one edge-to-edge line while the default still wraps", async () => {
 const chips=Array.from({length:8},(_,index)=><button key={index} type="button">{`조건 ${index+1}`}</button>);
 const render=(overflow?:"scroll")=>act(async () => root.render(<HjmProvider><div style={{inlineSize:"320px",blockSize:"600px"}}><SearchScreen queryClearLabel="검색어 지우기" title="검색" query="" queryLabel="검색어" onQueryChange={()=>{}} onSearch={()=>{}}
   {...(overflow?{filtersOverflow:overflow}:{})} filters={<div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>{chips}</div>}>{null}</SearchScreen></div></HjmProvider>));
 await render();
 expect(host.querySelector(".hjm-search-screen__filters")).toBeNull();
 const wrappedTops=new Set(Array.from(host.querySelectorAll("button")).filter(button=>button.textContent?.startsWith("조건")).map(button=>Math.round(button.getBoundingClientRect().top)));
 expect(wrappedTops.size).toBeGreaterThan(1);
 await render("scroll");
 const rail=host.querySelector<HTMLElement>('.hjm-search-screen__filters[data-overflow="scroll"]')!;
 const screen=host.querySelector<HTMLElement>(".hjm-screen")!;
 const tops=new Set(Array.from(rail.querySelectorAll("button")).map(button=>Math.round(button.getBoundingClientRect().top)));
 expect(tops.size).toBe(1);
 expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
 // Bleeds over the 16px notice padding so the last visible chip is cut by the screen edge, not mid-padding.
 expect(Math.round(rail.getBoundingClientRect().left)).toBe(Math.round(screen.getBoundingClientRect().left));
 expect(Math.round(rail.getBoundingClientRect().right)).toBe(Math.round(screen.getBoundingClientRect().right));
 const field=host.querySelector<HTMLElement>(".hjm-field")!;
 expect(Math.round(rail.querySelector("button")!.getBoundingClientRect().left)).toBe(Math.round(field.getBoundingClientRect().left));
 // Tabbing to an off-screen chip scrolls it into view instead of leaving focus hidden.
 const last=rail.querySelectorAll("button")[7]!;await act(async()=>{last.focus();});
 expect(rail.scrollLeft).toBeGreaterThan(0);
});

// 2026-10-06 platform parity review: Native already exposed accessibilityState.expanded on this toggle.
it("announces whether a reply group is expanded with aria-expanded",async()=>{
 const items=[{id:"root",parentId:null,author:"작성자",body:"내용",timeLabel:"지금",likeCountLabel:"",likeIcon:null,likeLabel:"좋아요",likeAction:null},{id:"child",parentId:"root",author:"답글러",body:"답글",timeLabel:"지금",likeCountLabel:"",likeIcon:null,likeLabel:"좋아요",likeAction:null}];
 const thread=(expandedIds:string[])=><HjmProvider><CommentThreadScreen title="댓글" items={items} expandedIds={expandedIds} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="답글" repliesLabel={(count,open)=>open?"답글 숨기기":`답글 ${count}개`}/></HjmProvider>;
 await act(async()=>root.render(thread([])));
 expect(Array.from(host.querySelectorAll("button")).find(button=>button.textContent==="답글 1개")?.getAttribute("aria-expanded")).toBe("false");
 await act(async()=>root.render(thread(["root"])));
 expect(Array.from(host.querySelectorAll("button")).find(button=>button.textContent==="답글 숨기기")?.getAttribute("aria-expanded")).toBe("true");
});

// 2026-10-06 SearchScreen public API (user-delegated decision): the search preview's phases, commit routing,
// applied filters, draft/applied filter sheet and announcements moved into SearchScreen so products stop
// copying Showcase code. Each test drives only public props.
type Filters={photo:boolean;saved?:boolean};
function TwoStep({initialQuery="",initialCommitted="",initialApplied={photo:false},count=3,recents:seedRecents=["카페","아침"],submit=()=>{},search=()=>{},sortChange=()=>{},sheetOpenChange=()=>{},apply=()=>{},extra={},results=<p>결과 목록</p>}:{
 initialQuery?:string;initialCommitted?:string;initialApplied?:Filters;count?:number|null;recents?:string[];submit?:(query:string)=>void;search?:(query:string)=>void;
 sortChange?:(id:string)=>void;sheetOpenChange?:(open:boolean)=>void;apply?:(next:Filters)=>void;extra?:Record<string,unknown>;results?:ReactNode}){
 const [query,setQuery]=useState(initialQuery),[committed,setCommitted]=useState(initialCommitted),[recents,setRecents]=useState(seedRecents);
 const [applied,setApplied]=useState(initialApplied),[open,setOpen]=useState(false),[sort,setSort]=useState("relevance");
 return <SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="검색어 지우기" query={query} onQueryChange={setQuery} debounceMs={0}
  onSearch={value=>search(value)} committedQuery={committed} onSubmit={value=>{submit(value);setCommitted(value);setRecents(items=>[value,...items.filter(item=>item!==value)]);}}
  recentQueries={{items:recents,title:"최근 검색",clearAllLabel:"전체 삭제",onClearAll:()=>setRecents([]),removeLabel:item=>`${item} 삭제`,onRemove:item=>setRecents(items=>items.filter(value=>value!==item))}}
  suggestedQueries={{title:"자주 찾는 주제",items:["산책","책"]}}
  suggestions={{items:[{query:"산책",match:{start:0,end:1}},{query:"산책길"}],commitLabel:value=>`‘${value}’ 검색`,countLabel:value=>`제안 ${value}개`}}
  resultSummary={{count,countLabel:value=>`결과 ${value}개`,loadingLabel:"불러오는 중",empty:{title:"결과 없음",description:"다른 단어로 찾아보세요"},
   sort:{label:"정렬",triggerLabel:`정렬: ${sort}`,value:sort,options:[{id:"relevance",label:"관련도순"},{id:"newest",label:"최신순"}],onChange:id=>{sortChange(id);setSort(id);}}}}
  appliedFilters={{items:[...(applied.photo?[{key:"photo",label:"사진 있음"}]:[]),...(applied.saved?[{key:"saved",label:"저장함"}]:[])],removeLabel:label=>`${label} 필터 해제`,onRemove:key=>setApplied(value=>({...value,[key]:false})),clearAllLabel:"모두 해제",onClearAll:()=>setApplied({photo:false})}}
  filterSheet={{open,onOpenChange:next=>{sheetOpenChange(next);setOpen(next);},title:"필터",value:applied,onApply:next=>{apply(next);setApplied(next);},
   count:draft=>draft.photo?0:5,reset:()=>({photo:false}),isDefault:draft=>!draft.photo,
   renderContent:(draft,setDraft)=><button type="button" aria-pressed={draft.photo} onClick={()=>setDraft({photo:!draft.photo})}>사진만</button>,
   labels:{close:"닫기",reset:"초기화",apply:value=>value===0?"결과 없음":`${value}개 결과 보기`},trigger:{label:value=>value?`필터 ${value}`:"필터",accessibilityLabel:value=>value?`필터, ${value}개 적용됨`:"필터"}}}
  filters={<button type="button">빠른 조건</button>} {...extra}>
  {results}
 </SearchScreen>;
}
const texts=()=>host.textContent??"";
it("hides the visible query label but keeps the field named and described by its placeholder", async () => {
 await act(async()=>root.render(<HjmProvider><SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="지우기" query="" onQueryChange={()=>{}} onSearch={()=>{}} queryLabelVisibility="hidden">{null}</SearchScreen></HjmProvider>));
 expect(host.querySelector("label")).toBeNull();
 const input=host.querySelector<HTMLInputElement>('input[type="search"]')!;
 expect(input.getAttribute("placeholder")).toBe("기록 검색");
 await expect.element(page.getByRole("searchbox",{name:"기록 검색"})).toBeInTheDocument();
 await act(async()=>root.render(<HjmProvider><SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="지우기" query="" onQueryChange={()=>{}} onSearch={()=>{}}>{null}</SearchScreen></HjmProvider>));
 expect(host.querySelector("label")?.textContent).toBe("기록 검색");
 expect(host.querySelector('input[type="search"]')!.hasAttribute("placeholder")).toBe(false);
});
it("shows default-field progress with one prop and announces the localized searching label", async () => {
 const screen=(searching:boolean)=><HjmProvider><SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="지우기" query="산책" onQueryChange={()=>{}} onSearch={()=>{}} searching={searching} searchingLabel="찾는 중">{null}</SearchScreen></HjmProvider>;
 await act(async()=>root.render(screen(true)));
 const input=host.querySelector<HTMLInputElement>('input[type="search"]')!;
 expect(input.getAttribute("aria-busy")).toBe("true");
 expect(host.querySelector(".hjm-search-field__spinner")).not.toBeNull();
 expect(host.querySelector('[role="status"]')?.textContent).toBe("찾는 중");
 await act(async()=>root.render(screen(false)));
 expect(input.hasAttribute("aria-busy")).toBe(false);
 expect(host.querySelector('[role="status"]')?.textContent).toBe("");
});
it("shows recent and suggested queries before typing, suggestions while typing and results only once committed", async () => {
 await act(async()=>root.render(<HjmProvider><TwoStep/></HjmProvider>));
 expect(texts()).toContain("최근 검색");expect(texts()).toContain("자주 찾는 주제");
 expect(texts()).not.toContain("결과 목록");expect(texts()).not.toContain("빠른 조건");
 await page.getByRole("searchbox",{name:"기록 검색"}).fill("산");
 expect(texts()).toContain("‘산’ 검색");expect(texts()).toContain("산책길");
 expect(texts()).not.toContain("결과 목록");expect(texts()).not.toContain("빠른 조건");expect(texts()).not.toContain("최근 검색");
 expect(host.querySelector('[role="status"]')?.textContent).toBe("제안 2개");
 // The match is bolded by weight, not color.
 expect(Array.from(host.querySelectorAll("strong, [data-emphasis='strong'], .hjm-text")).some(node=>node.textContent==="산"&&getComputedStyle(node).fontWeight>="600")).toBe(true);
 await page.getByRole("button",{name:"산책길"}).click();
 expect(host.querySelector<HTMLInputElement>('input[type="search"]')!.value).toBe("산책길");
 expect(texts()).toContain("결과 목록");expect(texts()).toContain("결과 3개");expect(texts()).toContain("빠른 조건");
 expect(host.querySelector('[role="status"]')?.textContent).toBe("결과 3개");
});
it("routes every commit through onSubmit and never commits debounced typing or a blank Enter", async () => {
 const submit=vi.fn(),search=vi.fn();
 await act(async()=>root.render(<HjmProvider><TwoStep submit={submit} search={search}/></HjmProvider>));
 await page.getByRole("searchbox",{name:"기록 검색"}).fill("산책 ");
 await expect.poll(()=>search.mock.calls.at(-1)?.[0]).toBe("산책 ");
 expect(submit).not.toHaveBeenCalled();
 const input=host.querySelector<HTMLInputElement>('input[type="search"]')!;input.focus();
 await act(async()=>userEvent.keyboard("{Enter}"));
 expect(submit).toHaveBeenLastCalledWith("산책");
 await page.getByRole("button",{name:"검색어 지우기"}).click();
 await page.getByRole("button",{name:"카페",exact:true}).click();
 expect(submit).toHaveBeenLastCalledWith("카페");
 await page.getByRole("button",{name:"검색어 지우기"}).click();
 await page.getByRole("button",{name:"책",exact:true}).click();
 expect(submit).toHaveBeenLastCalledWith("책");
 await page.getByRole("button",{name:"검색어 지우기"}).click();
 await page.getByRole("searchbox",{name:"기록 검색"}).fill("   ");
 input.focus();await act(async()=>userEvent.keyboard("{Enter}"));
 expect(submit).toHaveBeenCalledTimes(3);
});
it("moves focus to the next recent row after removing one and to the field when none remain", async () => {
 await act(async()=>root.render(<HjmProvider><TwoStep/></HjmProvider>));
 await page.getByRole("button",{name:"카페 삭제"}).click();
 expect(document.activeElement?.getAttribute("aria-label")).toBe("아침 삭제");
 await page.getByRole("button",{name:"아침 삭제"}).click();
 expect(document.activeElement).toBe(host.querySelector('input[type="search"]'));
 expect(texts()).not.toContain("최근 검색");
});
it("removes applied filters one at a time with focus kept on the chip row, then on the filter trigger", async () => {
 await act(async()=>root.render(<HjmProvider><TwoStep initialQuery="산책" initialCommitted="산책" initialApplied={{photo:true,saved:true}}/></HjmProvider>));
 await expect.element(page.getByRole("button",{name:"필터, 2개 적용됨"})).toBeInTheDocument();
 await page.getByRole("button",{name:"사진 있음 필터 해제"}).click();
 expect(document.activeElement?.getAttribute("aria-label")).toBe("저장함 필터 해제");
 await page.getByRole("button",{name:"저장함 필터 해제"}).click();
 expect(document.activeElement?.getAttribute("aria-label")).toBe("필터");
 await act(async()=>root.render(<HjmProvider><TwoStep key="again" initialQuery="산책" initialCommitted="산책" initialApplied={{photo:true,saved:true}}/></HjmProvider>));
 await page.getByRole("button",{name:"모두 해제"}).click();
 expect(document.activeElement?.getAttribute("aria-label")).toBe("필터");
});
it("edits a draft in the filter sheet, discards it on close and applies it only from the primary action", async () => {
 const apply=vi.fn();
 await act(async()=>root.render(<HjmProvider><TwoStep initialQuery="산책" initialCommitted="산책" apply={apply}/></HjmProvider>));
 await page.getByRole("button",{name:"필터",exact:true}).click();
 const sheet=page.getByRole("dialog");
 await expect.element(sheet.getByRole("button",{name:"5개 결과 보기"})).toBeEnabled();
 await expect.element(sheet.getByRole("button",{name:"초기화"})).toBeDisabled();
 await sheet.getByRole("button",{name:"사진만"}).click();
 await expect.element(sheet.getByRole("button",{name:"결과 없음"})).toBeDisabled();
 await expect.element(sheet.getByRole("button",{name:"초기화"})).toBeEnabled();
 await sheet.getByRole("button",{name:"닫기"}).click();
 await expect.poll(()=>document.querySelector('[role="dialog"]')).toBeNull();
 expect(apply).not.toHaveBeenCalled();
 await page.getByRole("button",{name:"필터",exact:true}).click();
 await expect.element(page.getByRole("dialog").getByRole("button",{name:"사진만"})).toHaveAttribute("aria-pressed","false");
 await page.getByRole("dialog").getByRole("button",{name:"사진만"}).click();
 await page.getByRole("dialog").getByRole("button",{name:"초기화"}).click();
 await page.getByRole("dialog").getByRole("button",{name:"5개 결과 보기"}).click();
 expect(apply).toHaveBeenCalledExactlyOnceWith({photo:false});
});
it("keeps the rail and offers clear-all for a filter-caused zero, but hides it and suggests queries for a query-caused zero", async () => {
 await act(async()=>root.render(<HjmProvider><TwoStep initialQuery="산책" initialCommitted="산책" initialApplied={{photo:true,saved:true}} count={0}/></HjmProvider>));
 expect(texts()).toContain("결과 없음");expect(texts()).toContain("빠른 조건");
 // The zero count is announced once through the status region, not drawn above the empty state.
 expect(host.querySelector('[role="status"]')?.textContent).toBe("결과 0개");
 expect(texts().split("결과 0개")).toHaveLength(2);
 expect(page.getByRole("button",{name:"모두 해제"}).elements()).toHaveLength(2);
 expect(texts()).not.toContain("자주 찾는 주제");
 await act(async()=>root.render(<HjmProvider><TwoStep key="query" initialQuery="없는말" initialCommitted="없는말" count={0}/></HjmProvider>));
 expect(texts()).toContain("결과 없음");expect(texts()).not.toContain("빠른 조건");expect(host.querySelector('[aria-label="필터"]')).toBeNull();
 expect(texts()).toContain("자주 찾는 주제");
});
it("replaces results with loading rows while the count is unknown and scrolls to the top after a sort change", async () => {
 await act(async()=>root.render(<HjmProvider><div style={{blockSize:"400px"}}><TwoStep initialQuery="산책" initialCommitted="산책" count={null}/></div></HjmProvider>));
 expect(texts()).not.toContain("결과 목록");expect(host.querySelector('[aria-busy="true"], .hjm-list-row[data-loading]')).not.toBeNull();
 const sortChange=vi.fn();
 await act(async()=>root.render(<HjmProvider><div style={{blockSize:"400px"}}><TwoStep key="ready" initialQuery="산책" initialCommitted="산책" sortChange={sortChange} results={<div style={{blockSize:"2000px"}}>긴 결과</div>}/></div></HjmProvider>));
 const body=host.querySelector<HTMLElement>(".hjm-screen__body")!;body.scrollTop=500;expect(body.scrollTop).toBeGreaterThan(0);
 await page.getByRole("button",{name:"정렬: relevance"}).click();
 await page.getByRole("menuitemradio",{name:"최신순"}).click();
 expect(sortChange).toHaveBeenCalledExactlyOnceWith("newest");
 expect(body.scrollTop).toBe(0);
});

it("keeps the thread introduction in the comment scroll body and replaces it with state", async()=>{
 const fixture=(restricted=false)=><HjmProvider><CommentThreadScreen title="Comments" header={<nav>Back</nav>} threadHeader={<div data-testid="thread-intro">Place filters</div>} items={[{id:"root",parentId:null,author:"Author",body:<div data-testid="thread-content">Comment</div>,timeLabel:"Now",likeCountLabel:"",likeIcon:null,likeLabel:"Like",likeAction:null}]} expandedIds={[]} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="Reply" repliesLabel={()=>"More"} composer={<input aria-label="Write"/>} {...(restricted?{state:{kind:"restricted" as const,title:"Sign in"}}:{})}/></HjmProvider>;
 await act(async()=>root.render(fixture()));
 const body=host.querySelector(".hjm-screen__body")!;
 expect(body.querySelector('[data-testid="thread-intro"]')).not.toBeNull();
 expect(body.querySelector('[data-testid="thread-content"]')).not.toBeNull();
 expect(body.querySelector("input")).toBeNull();
 expect(host.querySelector(".hjm-screen__footer input")).not.toBeNull();
 await act(async()=>root.render(fixture(true)));
 expect(host.querySelector('[data-testid="thread-intro"]')).toBeNull();
 expect(host.querySelector("input")).toBeNull();
});
