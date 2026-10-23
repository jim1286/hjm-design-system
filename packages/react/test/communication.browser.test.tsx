import { act,useState } from "react";
import { createRoot,type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach,beforeEach,expect,it,vi } from "vitest";
import { ChatRoomProfile,ChatRoomCreate,ChatRoomActions,ExpandableSearch,ReplyComposer,ReplyMessage } from "../src/communication.js";
import { MessageComposer } from "../src/screens.js";
import { HjmProvider } from "../src/provider.js";
import type { SearchResponse } from "@hjmds/design-contracts/communication";
import "../src/styles.css";
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="375px";document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const labels={title:"검색",open:"펼치기",cancel:"검색 취소",query:"검색어",clear:"지우기",searching:"검색 중",error:"검색 실패",commit:(q:string)=>`${q} 검색`,suggestionCount:(n:number)=>`${n}개`};
// Search open/close are icon buttons named by aria-label.
function button(label:string){return [...host.querySelectorAll("button")].find(n=>n.textContent===label||n.getAttribute("aria-label")===label)!;}
it("expands the existing SearchScreen, ignores late results and aborts on collapse with focus restored",async()=>{
 const requests:{q:string;signal:AbortSignal;resolve:(value:SearchResponse<string>)=>void}[]=[];
 function Demo(){const [expanded,setExpanded]=useState(false),[query,setQuery]=useState("");return <ExpandableSearch<string> expanded={expanded} onExpandedChange={setExpanded} query={query} onQueryChange={setQuery} debounceMs={0} labels={labels} renderResult={result=><p>{result}</p>} onSearch={(q,{signal})=>new Promise(resolve=>requests.push({q,signal,resolve}))}/>;}
 await act(async()=>root.render(<HjmProvider><Demo/></HjmProvider>));await act(async()=>button("펼치기").click());expect(document.activeElement).toBe(host.querySelector("input"));
 await act(async()=>page.getByRole("searchbox").fill("old"));await expect.poll(()=>requests.length).toBe(1);await act(async()=>page.getByRole("searchbox").fill("new"));await expect.poll(()=>requests.length).toBe(2);expect(requests[0]!.signal.aborted).toBe(true);
 await act(async()=>requests[1]!.resolve({result:"current result",suggestions:[{query:"new suggestion"}]}));expect(host.textContent).toContain("new suggestion");await act(async()=>requests[0]!.resolve({result:"stale result",suggestions:[{query:"stale suggestion"}]}));expect(host.textContent).not.toContain("stale suggestion");
 await act(async()=>button("검색 취소").click());expect(requests[1]!.signal.aborted).toBe(true);expect(host.querySelector("input")).toBeNull();expect(document.activeElement).toBe(button("펼치기"));
});
it("replies to actual IDs, preserves failed drafts and serializes sends",async()=>{
 let fail!:(error:Error)=>void;const send=vi.fn(()=>new Promise<void>((_,reject)=>{fail=reject;}));
 function Demo(){const [id,setId]=useState<string|null>(null);return <><ReplyMessage messageId="actual-72" onReply={setId} replyLabel="답장" direction="incoming" author="A" timestamp="now">원본</ReplyMessage><ReplyComposer value="보존할 초안" label="메시지" sendLabel="보내기" onValueChange={()=>undefined} onSend={send} replyTarget={id?{id,author:"A",excerpt:"원본"}:null} onReplyCancel={()=>setId(null)} cancelReplyLabel="답장 취소" errorLabel="전송 실패"/></>;}
 await act(async()=>root.render(<HjmProvider><Demo/></HjmProvider>));await act(async()=>{const article=host.querySelector("article")!;article.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,button:0,pointerId:7,clientX:0,clientY:0}));article.dispatchEvent(new PointerEvent("pointerup",{bubbles:true,button:0,pointerId:7,clientX:90,clientY:0}));});expect(host.querySelector('button[aria-label="답장 취소"]')).not.toBeNull();await act(async()=>host.querySelector("article")!.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",altKey:true,bubbles:true,cancelable:true})));expect(host.textContent).toContain("원본");await act(async()=>{button("보내기").click();button("보내기").click();});expect(send).toHaveBeenCalledOnce();expect(send.mock.lastCall).toEqual(["보존할 초안",{replyToId:"actual-72"}]);await act(async()=>fail(new Error("failed")));expect(host.querySelector("textarea")!.value).toBe("보존할 초안");expect(host.textContent).toContain("전송 실패");
});
it("opts into near-limit circular feedback while retaining the existing composer and controlled draft",async()=>{
 const render=(value:string)=><HjmProvider><MessageComposer value={value} label="메시지" sendLabel="전송" maxLength={10} lengthFeedback={{label:"입력 길이",formatCount:(n,max)=>`${n}/${max}`}} onValueChange={()=>undefined} onSend={()=>undefined}/></HjmProvider>;
 await act(async()=>root.render(render("abc")));expect(host.querySelector('[data-shape="circular"]')).toBeNull();await act(async()=>root.render(render("abcdefgh")));expect(host.querySelector('[data-shape="circular"]')).not.toBeNull();expect(host.textContent).toContain("8/10");await act(async()=>root.render(render("abcdefghijk")));expect(host.querySelector("textarea")!.value).toBe("abcdefghijk");expect(button("전송").disabled).toBe(true);
});

const roomLabels={name:"Room name",description:"Description",photo:"Room photo",changePhoto:"Change photo",removePhoto:"Remove photo",save:"Save room",error:"Save failed",photoError:"Photo failed"};
it("retains a room draft after failure and serializes duplicate saves",async()=>{
 let reject!:(error:Error)=>void;const save=vi.fn(()=>new Promise<void>((_,fail)=>{reject=fail;}));
 await act(async()=>root.render(<HjmProvider><ChatRoomProfile title="Room" value={{name:"Draft room",description:"Draft description",photoUrl:null}} onValueChange={()=>undefined} onSave={save} labels={roomLabels}/></HjmProvider>));
 await act(async()=>{button("Save room").click();button("Save room").click();});expect(save).toHaveBeenCalledOnce();
 await act(async()=>reject(new Error("offline")));expect((host.querySelector("input") as HTMLInputElement).value).toBe("Draft room");expect(host.textContent).toContain("Save failed");expect(button("Save room").disabled).toBe(false);
});
it("requires a selected member before creating a group and sends real IDs",async()=>{
 const create=vi.fn();function Demo(){const [selected,setSelected]=useState(false);return <ChatRoomCreate title="새 채팅방" nextLabel="다음" backLabel="뒤로" search={{label:"참여자 검색",clearLabel:"검색 지우기",busyLabel:"검색 중"}} selection={{count:n=>`${n}명`,remove:member=>`${member.name} 선택 해제`}} value={{name:"Group",description:"",photoUrl:null}} onValueChange={()=>undefined} labels={roomLabels} members={[{id:"real-user-2",name:"Friend",selected}]} onSelectionChange={(_,value)=>setSelected(value)} membersLabel="Members" emptyMembersLabel="Empty" onCreate={create}/>;}
 await act(async()=>root.render(<HjmProvider><Demo/></HjmProvider>));expect(button("다음").disabled).toBe(true);
 await act(async()=>page.getByRole("checkbox",{name:"Friend"}).click());expect(button("다음").disabled).toBe(false);
 await act(async()=>button("Friend 선택 해제").click());expect(button("다음").disabled).toBe(true);await act(async()=>page.getByRole("checkbox",{name:"Friend"}).click());await act(async()=>button("다음").click());await act(async()=>button("Save room").click());expect(create).toHaveBeenCalledWith({name:"Group",description:"",photoUrl:null},["real-user-2"]);
});
it("requires confirmation for history deletion and does not call leave",async()=>{
 const remove=vi.fn(),leave=vi.fn();const action={label:"Delete history",title:"Delete my history?",description:"Other members keep their messages.",confirmLabel:"Delete now",cancelLabel:"Cancel",errorLabel:"Failed",onConfirm:remove};
 await act(async()=>root.render(<HjmProvider><ChatRoomActions deleteHistory={action} leave={{...action,label:"Leave room",onConfirm:leave}}/></HjmProvider>));
 await act(async()=>button("Delete history").click());expect(remove).not.toHaveBeenCalled();await act(async()=>page.getByRole("button",{name:"Delete now",exact:true}).click());expect(remove).toHaveBeenCalledOnce();expect(leave).not.toHaveBeenCalled();
});
it("reports a failed photo upload apart from a failed save",async()=>{
 await act(async()=>root.render(<HjmProvider><ChatRoomProfile title="Room" value={{name:"Room",description:"",photoUrl:null}} onValueChange={()=>undefined} onSave={()=>undefined} onPickPhoto={()=>Promise.reject(new Error("upload"))} labels={roomLabels}/></HjmProvider>));
 await act(async()=>button("Change photo").click());expect(host.textContent).toContain("Photo failed");expect(host.textContent).not.toContain("Save failed");
});
