import { act,create,type ReactTestRenderer } from "react-test-renderer";
import { afterEach,expect,it,vi } from "vitest";
import { ChatRoomProfile,ChatRoomCreate,ChatRoomActions,ExpandableSearch,ReplyMessage,ReplyComposer } from "../src/communication.js";
import { ChatMessage,MessageComposer } from "../src/screens.js";
import { SearchScreen } from "../src/screen-flows.js";
import { Progress } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;});
it("connects reply to the actual ID and chooses timestamp or reply gesture ownership",async()=>{
 const reply=vi.fn(),send=vi.fn().mockRejectedValue(new Error("failed"));act(()=>{tree=create(<HjmNativeProvider reducedMotion><ReplyMessage messageId="actual-9" onReply={reply} replyLabel="reply" swipeAction="timestamp" direction="incoming" author="A" timestamp="now">original</ReplyMessage><ReplyComposer value="draft" label="message" sendLabel="send" onValueChange={()=>undefined} onSend={send} replyTarget={{id:"actual-9",author:"A",excerpt:"original"}} onReplyCancel={()=>undefined} cancelReplyLabel="cancel" errorLabel="failed"/></HjmNativeProvider>);});
 const message=tree!.root.findByType(ChatMessage);expect(message.props.timestampPresentation).toBe("swipe");act(()=>message.props.replyAction.onPress());expect(reply).toHaveBeenCalledWith("actual-9");await act(async()=>tree!.root.findByType(MessageComposer).props.onSend("draft"));expect(send).toHaveBeenCalledWith("draft",{replyToId:"actual-9"});expect(tree!.root.findByType(MessageComposer).props.value).toBe("draft");expect(tree!.root.findAll(n=>n.props.accessibilityRole==="alert").length).toBeGreaterThan(0);
});
it("adds the actual near-limit ring without replacing native auto-height input",()=>{
 const render=(value:string)=><HjmNativeProvider reducedMotion><MessageComposer value={value} label="message" sendLabel="send" maxLength={10} lengthFeedback={{label:"length",formatCount:(n,max)=>`${n}/${max}`}} onValueChange={()=>undefined} onSend={()=>undefined}/></HjmNativeProvider>;
 act(()=>{tree=create(render("abc"));});expect(tree!.root.findAllByType(Progress)).toHaveLength(0);act(()=>tree!.update(render("abcdefgh")));expect(tree!.root.findByType(Progress).props).toMatchObject({shape:"circular",value:8,max:10,valueText:"8/10"});
});
it("uses the existing SearchScreen debounce and aborts actual requests on collapse",async()=>{
 let resolve!:(response:{result:string;suggestions:[]})=>void;let signal!:AbortSignal;const search=vi.fn((_q:string,context:{signal:AbortSignal})=>{signal=context.signal;return new Promise<{result:string;suggestions:[]}>(done=>{resolve=done;});});
 const render=(expanded:boolean)=><HjmNativeProvider reducedMotion><ExpandableSearch expanded={expanded} onExpandedChange={()=>undefined} query="real" onQueryChange={()=>undefined} onSearch={search} renderResult={value=>value} labels={{title:"Search",open:"Open",cancel:"Cancel",query:"Query",clear:"Clear",searching:"Searching",error:"Error",commit:q=>q,suggestionCount:String}}/></HjmNativeProvider>;
 act(()=>{tree=create(render(true));});await act(async()=>tree!.root.findByType(SearchScreen).props.onSearch("real",{signal:new AbortController().signal}));expect(search).toHaveBeenCalledOnce();act(()=>tree!.update(render(false)));expect(signal.aborted).toBe(true);await act(async()=>resolve({result:"late",suggestions:[]}));expect(tree!.root.findAllByType(SearchScreen)).toHaveLength(0);
});

import { Button } from "../src/actions.js";
import { ListRow } from "../src/data-display.js";
import { AlertDialog } from "../src/overlays.js";
const roomLabels={name:"Name",description:"Description",photo:"Photo",changePhoto:"Change",removePhoto:"Remove",save:"Save",error:"Failed",photoError:"Photo failed"};
it("gates native group creation and preserves failed profile drafts",async()=>{
 const value={name:"Draft",description:"About",photoUrl:null},createRoom=vi.fn(),save=vi.fn().mockRejectedValue(new Error("offline"));
 act(()=>{tree=create(<HjmNativeProvider><ChatRoomCreate title="새 채팅방" nextLabel="다음" backLabel="뒤로" search={{label:"참여자 검색",clearLabel:"검색 지우기",busyLabel:"검색 중"}} selection={{count:n=>`${n}`,remove:member=>`${member.name} 해제`}} value={{...value,name:""}} onValueChange={()=>undefined} labels={roomLabels} members={[]} onSelectionChange={()=>undefined} membersLabel="Members" emptyMembersLabel="Empty" onCreate={createRoom}/></HjmNativeProvider>);});
 expect(tree!.root.findAllByType(Button).find(node=>node.props.children==="다음")!.props.disabled).toBe(true);
 act(()=>tree!.update(<HjmNativeProvider><ChatRoomProfile value={value} onValueChange={()=>undefined} labels={roomLabels} onSave={save}/></HjmNativeProvider>));
 await act(async()=>tree!.root.findAllByType(Button).find(node=>node.props.children==="Save")!.props.onPress());expect(save).toHaveBeenCalledOnce();expect(tree!.root.findByType(ChatRoomProfile).props.value).toEqual(value);expect(tree!.root.findAll(node=>node.props.accessibilityRole==="alert").length).toBeGreaterThan(0);
});
it("native leave and history deletion stay separate behind confirmation",async()=>{
 const remove=vi.fn(),leave=vi.fn();const action={label:"Delete",title:"Delete history?",description:"Only my history",confirmLabel:"Confirm",cancelLabel:"Cancel",errorLabel:"Failed",onConfirm:remove};
 act(()=>{tree=create(<HjmNativeProvider><ChatRoomActions deleteHistory={action} leave={{...action,label:"Leave",onConfirm:leave}}/></HjmNativeProvider>);});
 act(()=>tree!.root.findAllByType(ListRow).find(node=>node.props.title==="Delete")!.props.onPress());expect(remove).not.toHaveBeenCalled();await act(async()=>tree!.root.findByType(AlertDialog).props.request.onConfirm());expect(remove).toHaveBeenCalledOnce();expect(leave).not.toHaveBeenCalled();
});
