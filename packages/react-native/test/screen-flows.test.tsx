import {act,create,type ReactTestRenderer} from "react-test-renderer";
import {expect,it,vi} from "vitest";
import {HjmNativeProvider} from "../src/provider.js";
import {Button} from "../src/actions.js";
import {RadioGroup} from "../src/inputs.js";
import {AlertDialog} from "../src/overlays.js";
import {EditorScreen,ModerationScreen,PermissionScreen,OnboardingScreen,SearchScreen} from "../src/screen-flows.js";
import type {ReactNode} from "react";
function render(child:ReactNode){let tree:ReactTestRenderer;act(()=>{tree=create(<HjmNativeProvider theme="dark" textScale={2}>{child}</HjmNativeProvider>);});return tree!;}
it("keeps dirty draft mounted while native discard confirmation is shown",()=>{const leave=vi.fn();const tree=render(<EditorScreen title="작성" dirty submit={{label:"저장",onAction:()=>{}}} cancel={{label:"닫기",onAction:leave}} discard={{mode:"confirm",title:"버릴까요",description:"초안",confirmLabel:"버리기",cancelLabel:"유지",fallbackErrorMessage:"실패"}}>내용</EditorScreen>);act(()=>tree.root.findAllByType(Button).find(button=>button.props.children==="닫기")!.props.onPress());expect(leave).not.toHaveBeenCalled();expect(tree.root.findByType(AlertDialog).props.open).toBe(true);act(()=>tree.unmount());});
it("disables reporting without a selected reason and forwards valid selection",()=>{const select=vi.fn();const tree=render(<ModerationScreen title="신고" reasons={[{value:"spam",label:"스팸"}]} reason={null} onReasonChange={select} reasonLabel="사유" submit={{label:"신고하기",onAction:()=>{}}}/>);expect(tree.root.findAllByType(Button).find(button=>button.props.children==="신고하기")!.props.disabled).toBe(true);act(()=>tree.root.findByType(RadioGroup).props.onValueChange("spam"));expect(select).toHaveBeenCalledWith("spam");act(()=>tree.unmount());});
it("uses the settings callback only for denied permission",()=>{const request=vi.fn(),settings=vi.fn();const tree=render(<PermissionScreen title="알림" status="denied" explanation="안내" request={{label:"허용",onAction:request}} settings={{label:"설정",onAction:settings}} continueAction={{label:"계속",onAction:()=>{}}}/>);expect(request).not.toHaveBeenCalled();act(()=>tree.root.findByType(Button).props.onPress());expect(settings).toHaveBeenCalledOnce();act(()=>tree.unmount());});
it("completes a one-step onboarding without an invalid next cursor",()=>{const finish=vi.fn(),move=vi.fn();const tree=render(<OnboardingScreen steps={[{id:"one",title:"시작",description:"안내",content:"내용"}]} index={0} onIndexChange={move} nextLabel="다음" backLabel="이전" complete={{label:"완료",onAction:finish}} progressLabel={()=>"1/1"}/>);act(()=>tree.root.findByType(Button).props.onPress());expect(finish).toHaveBeenCalledOnce();expect(move).not.toHaveBeenCalled();act(()=>tree.unmount());});
it("cancels queued native search when unmounted",()=>{vi.useFakeTimers();const query=vi.fn();const tree=render(<SearchScreen title="검색" query="a" queryLabel="검색어" onQueryChange={()=>{}} onSearch={query}>{null}</SearchScreen>);act(()=>tree.unmount());act(()=>{vi.advanceTimersByTime(500);});expect(query).not.toHaveBeenCalled();vi.useRealTimers();});

it("uses product comment actions without inventing writes and preserves paging", async()=>{
 const {CommentThreadScreen}=await import("../src/screen-flows.js");
 const like=vi.fn(),reply=vi.fn(),page=vi.fn();
 const tree=render(<CommentThreadScreen title="댓글" items={[{id:"root",parentId:null,author:"작성자",body:"내용",timeLabel:"지금",likeCountLabel:"",likeIcon:null,likeLabel:"좋아요",likeAction:null,canReply:false,actions:<Button onPress={reply}>제품 답글</Button>}]} expandedIds={[]} onExpandedChange={()=>{}} onLike={like} onReply={reply} replyLabel="기본 답글" repliesLabel={()=>"더 보기"} threadFooter={<Button onPress={page}>다음 페이지</Button>}/>);
 expect(JSON.stringify(tree.toJSON())).not.toContain("기본 답글");
 expect(like).not.toHaveBeenCalled();expect(reply).not.toHaveBeenCalled();
 act(()=>tree.root.findAllByType(Button).find(node=>node.props.children==="다음 페이지")!.props.onPress());
 expect(page).toHaveBeenCalledOnce();
 act(()=>tree.unmount());
});

it("keeps author and plain comment together while preserving rich content and right action",async()=>{
 const {CommentThreadScreen}=await import("../src/screen-flows.js");
 const {Text}=await import("../src/primitives.js");
 const tree=render(<CommentThreadScreen title="댓글" items={[{id:"one",parentId:null,author:"작성자",bodyText:"긴 본문",body:<Button>사진 열기</Button>,timeLabel:"",likeCountLabel:"",likeIcon:null,likeLabel:"좋아요",likeAction:<Button>하트</Button>,canReply:false}]} expandedIds={[]} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="답글" repliesLabel={()=>"더 보기"}/>);
 const line=tree.root.findAllByType(Text).find(node=>Array.isArray(node.props.children)&&node.props.children.includes("긴 본문"));
 expect(line).toBeDefined();expect(line!.props.children[0].props.emphasis).toBe("strong");
 expect(tree.root.findAllByType(Button).map(node=>node.props.children)).toEqual(["사진 열기","하트"]);
 act(()=>tree.unmount());
});

it("starts native capture only after sheet dismissal and never selects on cancel",async()=>{
 const {PhotoSourceSheet}=await import("../src/screen-flows.js");
 const {Sheet}=await import("../src/overlays.js");
 const select=vi.fn(),close=vi.fn();
 const tree=render(<PhotoSourceSheet open onOpenChange={close} onSelect={select} labels={{title:"사진 추가",library:"앨범",camera:"촬영",cancel:"취소"}}/>);
 expect(select).not.toHaveBeenCalled();
 act(()=>tree.root.findAllByType(Button).find(node=>node.props.children==="촬영")!.props.onPress());
 expect(close).toHaveBeenCalledWith(false);expect(select).not.toHaveBeenCalled();
 act(()=>tree.root.findByType(Sheet).props.onDismissComplete({reason:"programmatic"}));
 expect(select).toHaveBeenCalledExactlyOnceWith("camera");
 act(()=>tree.root.findByType(Sheet).props.onDismissComplete({reason:"close-action"}));
 expect(select).toHaveBeenCalledOnce();act(()=>tree.unmount());
});
it("hides unavailable camera and suppresses disabled selection",async()=>{
 const {PhotoSourceSheet}=await import("../src/screen-flows.js");const select=vi.fn();
 const tree=render(<PhotoSourceSheet open disabled cameraAvailable={false} onOpenChange={()=>{}} onSelect={select} labels={{title:"사진",library:"앨범",camera:"촬영",cancel:"취소"}}/>);
 expect(tree.root.findAllByType(Button).map(node=>node.props.children)).not.toContain("촬영");
 act(()=>tree.root.findAllByType(Button).find(node=>node.props.children==="앨범")!.props.onPress());expect(select).not.toHaveBeenCalled();act(()=>tree.unmount());
});
