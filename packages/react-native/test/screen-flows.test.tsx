import {act,create,type ReactTestRenderer} from "react-test-renderer";
import {describe,expect,it,vi} from "vitest";
import {HjmNativeProvider} from "../src/provider.js";
import {Button} from "../src/actions.js";
import {RadioGroup} from "../src/inputs.js";
import {AlertDialog} from "../src/overlays.js";
import {EditorScreen,ModerationScreen,PermissionScreen,OnboardingScreen,SearchScreen} from "../src/screen-flows.js";
import {useState, type ReactNode} from "react";
import {ScrollView,StyleSheet,TextInput} from "react-native";
function render(child:ReactNode){let tree:ReactTestRenderer;act(()=>{tree=create(<HjmNativeProvider theme="dark" textScale={2}>{child}</HjmNativeProvider>);});return tree!;}
it("keeps dirty draft mounted while native discard confirmation is shown",()=>{const leave=vi.fn();const tree=render(<EditorScreen title="작성" dirty submit={{label:"저장",onAction:()=>{}}} cancel={{label:"닫기",onAction:leave}} discard={{mode:"confirm",title:"버릴까요",description:"초안",confirmLabel:"버리기",cancelLabel:"유지",fallbackErrorMessage:"실패"}}>내용</EditorScreen>);act(()=>tree.root.findAllByType(Button).find(button=>button.props.children==="닫기")!.props.onPress());expect(leave).not.toHaveBeenCalled();expect(tree.root.findByType(AlertDialog).props.open).toBe(true);act(()=>tree.unmount());});
it("disables reporting without a selected reason and forwards valid selection",()=>{const select=vi.fn();const tree=render(<ModerationScreen title="신고" reasons={[{value:"spam",label:"스팸"}]} reason={null} onReasonChange={select} reasonLabel="사유" submit={{label:"신고하기",onAction:()=>{}}}/>);expect(tree.root.findAllByType(Button).find(button=>button.props.children==="신고하기")!.props.disabled).toBe(true);act(()=>tree.root.findByType(RadioGroup).props.onValueChange("spam"));expect(select).toHaveBeenCalledWith("spam");act(()=>tree.unmount());});
it("uses the settings callback only for denied permission",()=>{const request=vi.fn(),settings=vi.fn();const tree=render(<PermissionScreen title="알림" status="denied" explanation="안내" request={{label:"허용",onAction:request}} settings={{label:"설정",onAction:settings}} continueAction={{label:"계속",onAction:()=>{}}}/>);expect(request).not.toHaveBeenCalled();act(()=>tree.root.findByType(Button).props.onPress());expect(settings).toHaveBeenCalledOnce();act(()=>tree.unmount());});
it("completes a one-step onboarding without an invalid next cursor",()=>{const finish=vi.fn(),move=vi.fn();const tree=render(<OnboardingScreen steps={[{id:"one",title:"시작",description:"안내",content:"내용"}]} index={0} onIndexChange={move} nextLabel="다음" backLabel="이전" complete={{label:"완료",onAction:finish}} progressLabel={()=>"1/1"}/>);act(()=>tree.root.findByType(Button).props.onPress());expect(finish).toHaveBeenCalledOnce();expect(move).not.toHaveBeenCalled();act(()=>tree.unmount());});
it("cancels queued native search when unmounted",()=>{vi.useFakeTimers();const query=vi.fn();const tree=render(<SearchScreen queryClearLabel="검색어 지우기" title="검색" query="a" queryLabel="검색어" onQueryChange={()=>{}} onSearch={query}>{null}</SearchScreen>);act(()=>tree.unmount());act(()=>{vi.advanceTimersByTime(500);});expect(query).not.toHaveBeenCalled();vi.useRealTimers();});

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

it("shows a clear action only for nonempty search and clears the whole query", () => {
 function Fixture(){const [query,setQuery]=useState("한글 전체 검색어");return <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="검색어 지우기" query={query} onQueryChange={setQuery} onSearch={()=>{}}>{null}</SearchScreen>;}
 const tree=render(<Fixture/>);
 act(()=>tree.root.find(node=>node.props.accessibilityLabel==="검색어 지우기").props.onPress());
 expect(tree.root.findByType(TextInput).props.value).toBe("");
 expect(tree.root.findAll(node=>node.props.accessibilityLabel==="검색어 지우기")).toHaveLength(0);
 act(()=>tree.unmount());
});

it("announces whether a reply group is expanded", async () => {
 const {CommentThreadScreen}=await import("../src/screen-flows.js");
 const items=[{id:"root",parentId:null,author:"작성자",body:"내용",timeLabel:"지금",likeCountLabel:"",likeIcon:null,likeLabel:"좋아요",likeAction:null},{id:"child",parentId:"root",author:"답글러",body:"답글",timeLabel:"지금",likeCountLabel:"",likeIcon:null,likeLabel:"좋아요",likeAction:null}];
 const thread=(expandedIds:string[])=><CommentThreadScreen title="댓글" items={items} expandedIds={expandedIds} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="답글" repliesLabel={(count,open)=>open?"답글 숨기기":`답글 ${count}개`}/>;
 const tree=render(thread([]));
 const toggle=()=>tree.root.findAllByType(Button).find(button=>String(button.props.children).startsWith("답글 ")||button.props.children==="답글 숨기기")!;
 expect(toggle().props.accessibilityState).toEqual({expanded:false});
 act(()=>tree.update(<HjmNativeProvider theme="dark" textScale={2}>{thread(["root"])}</HjmNativeProvider>));
 expect(toggle().props.accessibilityState).toEqual({expanded:true});
 act(()=>tree.unmount());
});

// 2026-10-06 search redesign: onSubmit is the commit signal; filtersOverflow="scroll" is the one-line chip rail.
it("commits the default native search field from the keyboard search key only when onSubmit is supplied", () => {
 const submit=vi.fn();
 const field=(extra:{onSubmit?:(query:string)=>void})=><SearchScreen title="검색" queryLabel="검색어" queryClearLabel="검색어 지우기" query="산책" onQueryChange={()=>{}} onSearch={()=>{}} {...extra}>{null}</SearchScreen>;
 const tree=render(field({}));
 expect(tree.root.findByType(TextInput).props.returnKeyType).toBeUndefined();
 expect(tree.root.findByType(TextInput).props.onSubmitEditing).toBeUndefined();
 act(()=>tree.update(<HjmNativeProvider theme="dark" textScale={2}>{field({onSubmit:submit})}</HjmNativeProvider>));
 const input=tree.root.findByType(TextInput);
 expect(input.props.returnKeyType).toBe("search");
 act(()=>input.props.onSubmitEditing({nativeEvent:{text:"산책"}}));
 expect(submit).toHaveBeenCalledExactlyOnceWith("산책");
 act(()=>tree.unmount());
});

it("does not wire onSubmit into a product queryField", async () => {
 const {SearchField}=await import("../src/inputs.js");const submit=vi.fn();
 const tree=render(<SearchScreen title="검색" queryLabel="검색어" query="" onQueryChange={()=>{}} onSearch={()=>{}} onSubmit={submit} queryField={<SearchField label="직접" clearLabel="지우기" busyLabel="찾는 중"/>}>{null}</SearchScreen>);
 expect(tree.root.findByType(TextInput).props.returnKeyType).toBeUndefined();
 act(()=>tree.unmount());
});

it("puts scroll-mode filters in one horizontal rail that bleeds over the screen padding", () => {
 const chips=<Button onPress={()=>{}}>조건</Button>;
 const screen=(extra:{filtersOverflow?:"wrap"|"scroll";contentInset?:"none"})=><SearchScreen title="검색" queryLabel="검색어" queryClearLabel="검색어 지우기" query="" onQueryChange={()=>{}} onSearch={()=>{}} filters={chips} {...extra}>{null}</SearchScreen>;
 const horizontal=(tree:ReactTestRenderer)=>tree.root.findAllByType(ScrollView).filter(view=>view.props.horizontal);
 const tree=render(screen({}));
 expect(horizontal(tree)).toHaveLength(0);
 act(()=>tree.update(<HjmNativeProvider theme="dark" textScale={2}>{screen({filtersOverflow:"scroll"})}</HjmNativeProvider>));
 const [rail]=horizontal(tree);
 expect(rail).toBeDefined();
 expect(rail!.findAllByType(Button)).toHaveLength(1);
 expect(StyleSheet.flatten(rail!.props.style).marginHorizontal).toBe(-16);
 expect(StyleSheet.flatten(rail!.props.contentContainerStyle).paddingHorizontal).toBe(16);
 expect(rail!.props.keyboardShouldPersistTaps).toBe("handled");
 act(()=>tree.update(<HjmNativeProvider theme="dark" textScale={2}>{screen({filtersOverflow:"scroll",contentInset:"none"})}</HjmNativeProvider>));
 expect(Math.abs(StyleSheet.flatten(horizontal(tree)[0]!.props.style).marginHorizontal as number)).toBe(0);
 act(()=>tree.unmount());
});

// 2026-10-06 platform parity review: Web places layoutStyle on the outer root of these screens.
it("places OnboardingScreen layoutStyle on the screen root",async()=>{
 const {ScreenLayout}=await import("../src/screens.js");
 const tree=render(<OnboardingScreen steps={[{id:"one",title:"시작",description:"안내",content:"내용"}]} index={0} onIndexChange={()=>{}} nextLabel="다음" backLabel="이전" complete={{label:"완료",onAction:()=>{}}} progressLabel={()=>"1/1"} layoutStyle={{marginTop:314}}/>);
 expect(tree.root.findByType(ScreenLayout).props.layoutStyle).toEqual({marginTop:314});
 act(()=>tree.unmount());
});
it("places ListDetailScreen and SavedItemsScreen layoutStyle on the host that owns list and detail",async()=>{
 const {ListDetailScreen}=await import("../src/screen-flows.js");
 const {SavedItemsScreen}=await import("../src/saved-items.js");
 const {ScreenLayout}=await import("../src/screens.js");
 const {View}=await import("react-native");
 // The test mock's StyleSheet.flatten is identity, so merge style arrays here.
 const flat=(style:unknown):Record<string,unknown>=>Array.isArray(style)?Object.assign({},...style.map(flat)):style&&typeof style==="object"?style as Record<string,unknown>:{};
 const placed=(tree:ReactTestRenderer)=>tree.root.findAllByType(View).filter(view=>flat(view.props.style).marginTop===307);
 const check=(tree:ReactTestRenderer,screens:number)=>{
  const hosts=placed(tree);
  expect(hosts).toHaveLength(1);
  expect(hosts[0]!.findAllByType(ScreenLayout)).toHaveLength(screens);
  expect(tree.root.findAllByType(ScreenLayout).every(layout=>layout.props.layoutStyle===undefined)).toBe(true);
 };
 const list=(detail?:{title:string;content:ReactNode})=><HjmNativeProvider theme="dark" textScale={2}><ListDetailScreen title="목록" list={null} back={{label:"뒤로",onAction:()=>{}}} layoutStyle={{marginTop:307}} {...(detail?{detail}:{})}/></HjmNativeProvider>;
 const tree=render(null);
 act(()=>tree.update(list()));check(tree,1);
 act(()=>tree.update(list({title:"상세",content:"본문"})));check(tree,2);
 const saved=(selectedItemId?:string)=><HjmNativeProvider theme="dark" textScale={2}><SavedItemsScreen title="저장됨" items={[{id:"a",title:"항목"}]} collections={[]} collectionId={null} {...(selectedItemId?{selectedItemId}:{})} labels={{allItems:"전체",back:"뒤로",createCollection:"새 컬렉션",privateNotice:"나만 보기",empty:"없음"}} onOpenCollection={()=>{}} onOpenItem={()=>{}} onBack={()=>{}} onCreateCollection={()=>{}} renderThumbnail={()=>null} renderDetail={item=>item.title} layoutStyle={{marginTop:307}}/></HjmNativeProvider>;
 act(()=>tree.update(saved()));check(tree,1);
 act(()=>tree.update(saved("a")));check(tree,2);
 act(()=>tree.unmount());
});

// 2026-10-06 SearchScreen public API (user-delegated decision): Native twin of the Web phase/commit/filter tests.
describe("SearchScreen two-step search", () => {
 type Filters={photo:boolean;saved?:boolean};
 type Spies={submit?:(query:string)=>void;apply?:(next:Filters)=>void;sortChange?:(id:string)=>void};
 function TwoStep({initialQuery="",initialCommitted="",initialApplied={photo:false},count=3,spies={}}:{initialQuery?:string;initialCommitted?:string;initialApplied?:Filters;count?:number|null;spies?:Spies}){
  const [query,setQuery]=useState(initialQuery),[committed,setCommitted]=useState(initialCommitted),[recents,setRecents]=useState(["카페","아침"]);
  const [applied,setApplied]=useState(initialApplied),[open,setOpen]=useState(false),[sort,setSort]=useState("relevance");
  return <SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="검색어 지우기" query={query} onQueryChange={setQuery} debounceMs={0} onSearch={()=>{}}
   committedQuery={committed} onSubmit={value=>{spies.submit?.(value);setCommitted(value);}}
   recentQueries={{items:recents,title:"최근 검색",clearAllLabel:"전체 삭제",onClearAll:()=>setRecents([]),removeLabel:item=>`${item} 삭제`,onRemove:item=>setRecents(items=>items.filter(value=>value!==item))}}
   suggestedQueries={{title:"자주 찾는 주제",items:["산책","책"]}}
   suggestions={{items:[{query:"산책"},{query:"산책길"}],commitLabel:value=>`‘${value}’ 검색`,countLabel:value=>`제안 ${value}개`}}
   resultSummary={{count,countLabel:value=>`결과 ${value}개`,loadingLabel:"불러오는 중",empty:{title:"결과 없음"},
    sort:{label:"정렬",triggerLabel:`정렬: ${sort}`,value:sort,dismissLabel:"닫기",options:[{id:"relevance",label:"관련도순"},{id:"newest",label:"최신순"}],onChange:id=>{spies.sortChange?.(id);setSort(id);}}}}
   appliedFilters={{items:[...(applied.photo?[{key:"photo",label:"사진 있음"}]:[]),...(applied.saved?[{key:"saved",label:"저장함"}]:[])],removeLabel:label=>`${label} 필터 해제`,onRemove:key=>setApplied(value=>({...value,[key]:false})),clearAllLabel:"모두 해제",onClearAll:()=>setApplied({photo:false})}}
   filterSheet={{open,onOpenChange:setOpen,title:"필터",value:applied,onApply:next=>{spies.apply?.(next);setApplied(next);},count:draft=>draft.photo?0:5,reset:()=>({photo:false}),isDefault:draft=>!draft.photo,
    renderContent:(draft,setDraft)=><Button accessibilityState={{selected:draft.photo}} onPress={()=>setDraft({photo:!draft.photo})}>사진만</Button>,
    labels:{close:"닫기",reset:"초기화",apply:value=>value===0?"결과 없음":`${value}개 결과 보기`},trigger:{label:value=>value?`필터 ${value}`:"필터",accessibilityLabel:value=>value?`필터, ${value}개 적용됨`:"필터"}}}
   filters={<Button onPress={()=>{}}>빠른 조건</Button>}>
   <Button onPress={()=>{}}>결과 목록</Button>
  </SearchScreen>;
 }
 const wrap=(node:ReactNode)=><HjmNativeProvider theme="dark" textScale={2}>{node}</HjmNativeProvider>;
 const buttons=(tree:ReactTestRenderer)=>tree.root.findAllByType(Button).map(node=>String(node.props.children));
 const rowTitles=async(tree:ReactTestRenderer)=>{const {ListRow}=await import("../src/data-display.js");return tree.root.findAllByType(ListRow).map(node=>node.props.title as string);};
 const pressRow=async(tree:ReactTestRenderer,title:string)=>{const {ListRow}=await import("../src/data-display.js");act(()=>tree.root.findAllByType(ListRow).find(node=>node.props.title===title)!.props.onPress());};
 const labelled=(tree:ReactTestRenderer,label:string)=>tree.root.findAll(node=>typeof node.type!=="string"&&node.props.accessibilityLabel===label);

 it("hides the visible query label but keeps the field named, with the label as placeholder", () => {
  const tree=render(<SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="지우기" query="" onQueryChange={()=>{}} onSearch={()=>{}} queryLabelVisibility="hidden">{null}</SearchScreen>);
  const input=tree.root.findByType(TextInput);
  expect(input.props.accessibilityLabel).toBe("기록 검색");
  expect(input.props.placeholder).toBe("기록 검색");
  // Visible copy is any host Text child; placeholder and accessibilityLabel are props, not text.
  const visible=(t:ReactTestRenderer)=>t.root.findAll(node=>(node.type as unknown)==="Text"&&[node.props.children].flat().includes("기록 검색"));
  expect(visible(tree)).toHaveLength(0);
  act(()=>tree.update(wrap(<SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="지우기" query="" onQueryChange={()=>{}} onSearch={()=>{}}>{null}</SearchScreen>)));
  expect(tree.root.findByType(TextInput).props.placeholder).toBeUndefined();
  expect(visible(tree).length).toBeGreaterThan(0);
  act(()=>tree.unmount());
 });
 it("shows default-field progress with searching/searchingLabel and announces the label", async () => {
  const {AccessibilityInfo}=await import("react-native");const announce=vi.spyOn(AccessibilityInfo,"announceForAccessibilityWithOptions");
  const tree=render(<SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="지우기" query="산책" onQueryChange={()=>{}} onSearch={()=>{}} searching searchingLabel="찾는 중">{null}</SearchScreen>);
  expect(tree.root.findAll(node=>(node.type as unknown)==="View"&&node.props.accessibilityRole==="progressbar"&&node.props.accessibilityLabel==="찾는 중")).toHaveLength(1);
  expect(announce).toHaveBeenCalledWith("찾는 중",{queue:true});
  act(()=>tree.unmount());announce.mockRestore();
 });
 it("splits idle, typing and committed results and routes every commit through onSubmit", async () => {
  const submit=vi.fn();
  const tree=render(<TwoStep spies={{submit}}/>);
  expect(await rowTitles(tree)).toEqual(["카페","아침"]);
  expect(buttons(tree)).not.toContain("결과 목록");expect(buttons(tree)).not.toContain("빠른 조건");
  act(()=>tree.root.findByType(TextInput).props.onChangeText("산"));
  expect(await rowTitles(tree)).toEqual(["‘산’ 검색","산책","산책길"]);
  expect(buttons(tree)).not.toContain("빠른 조건");
  await pressRow(tree,"산책길");
  expect(submit).toHaveBeenLastCalledWith("산책길");
  expect(tree.root.findByType(TextInput).props.value).toBe("산책길");
  expect(buttons(tree)).toContain("결과 목록");expect(buttons(tree)).toContain("빠른 조건");
  act(()=>tree.root.findByType(TextInput).props.onChangeText("   "));
  act(()=>tree.root.findByType(TextInput).props.onSubmitEditing({nativeEvent:{text:"   "}}));
  expect(submit).toHaveBeenCalledTimes(1);
  act(()=>tree.unmount());
 });
 it("removes recent searches and applied filters through product callbacks", () => {
  const tree=render(<TwoStep/>);
  act(()=>labelled(tree,"카페 삭제")[0]!.props.onPress());
  expect(labelled(tree,"카페 삭제")).toHaveLength(0);
  act(()=>tree.update(wrap(<TwoStep key="results" initialQuery="산책" initialCommitted="산책" initialApplied={{photo:true,saved:true}}/>)));
  expect(labelled(tree,"필터, 2개 적용됨")).not.toHaveLength(0);
  act(()=>labelled(tree,"사진 있음 필터 해제")[0]!.props.onPress());
  expect(labelled(tree,"사진 있음 필터 해제")).toHaveLength(0);
  expect(labelled(tree,"필터, 1개 적용됨")).not.toHaveLength(0);
  act(()=>tree.unmount());
 });
 it("edits a draft in the filter sheet, discards it on dismissal and applies it only from the primary action", async () => {
  const {Sheet}=await import("../src/overlays.js");const apply=vi.fn();
  const tree=render(<TwoStep initialQuery="산책" initialCommitted="산책" spies={{apply}}/>);
  act(()=>labelled(tree,"필터")[0]!.props.onPress());
  const button=(label:string)=>tree.root.findAllByType(Button).find(node=>node.props.children===label)!;
  expect(button("5개 결과 보기").props.disabled).toBe(false);
  expect(button("초기화").props.disabled).toBe(true);
  act(()=>button("사진만").props.onPress());
  expect(button("결과 없음").props.disabled).toBe(true);
  act(()=>tree.root.findByType(Sheet).props.onOpenChange(false));
  expect(apply).not.toHaveBeenCalled();
  // Sheet reopens only after the native Modal reports its dismissal; the mock never fires it on its own.
  for(const modal of tree.root.findAll(node=>typeof node.type!=="string"&&typeof node.props.onDismiss==="function"))act(()=>modal.props.onDismiss());
  act(()=>labelled(tree,"필터")[0]!.props.onPress());
  expect(button("사진만").props.accessibilityState).toEqual({selected:false});
  act(()=>button("사진만").props.onPress());act(()=>button("초기화").props.onPress());
  act(()=>button("5개 결과 보기").props.onPress());
  expect(apply).toHaveBeenCalledExactlyOnceWith({photo:false});
  expect(tree.root.findByType(Sheet).props.open).toBe(false);
  act(()=>tree.unmount());
 });
 it("keeps the rail for a filter-caused zero and swaps it for suggested queries on a query-caused zero", () => {
  const tree=render(<TwoStep initialQuery="산책" initialCommitted="산책" initialApplied={{photo:true}} count={0}/>);
  expect(buttons(tree)).toContain("빠른 조건");expect(buttons(tree)).toContain("모두 해제");
  act(()=>tree.update(wrap(<TwoStep key="query" initialQuery="없는말" initialCommitted="없는말" count={0}/>)));
  expect(buttons(tree)).not.toContain("빠른 조건");expect(labelled(tree,"필터")).toHaveLength(0);
  expect(tree.root.findAll(node=>(node.type as unknown)==="Text"&&node.props.children==="자주 찾는 주제").length).toBeGreaterThan(0);
  act(()=>tree.unmount());
 });
 it("replaces results with skeleton rows while loading and scrolls to the top after a sort change", async () => {
  const {Menu}=await import("../src/navigation.js");
  const scrollTo=vi.fn(),sortChange=vi.fn(),productRef=vi.fn();
  const tree=render(<TwoStep initialQuery="산책" initialCommitted="산책" count={null}/>);
  expect(buttons(tree)).not.toContain("결과 목록");
  act(()=>tree.unmount());
  let ready!:ReactTestRenderer;
  act(()=>{ready=create(wrap(<TwoStep initialQuery="산책" initialCommitted="산책" spies={{sortChange}}/>),{createNodeMock:element=>element.type==="ScrollView"?{scrollTo}:null});});
  act(()=>ready.root.findByType(Menu).props.selection.onSelectionChange("newest"));
  expect(sortChange).toHaveBeenCalledExactlyOnceWith("newest");
  expect(scrollTo).toHaveBeenCalledWith({y:0,animated:false});
  act(()=>ready.update(wrap(<SearchScreen title="검색" queryLabel="기록 검색" queryClearLabel="지우기" query="" onQueryChange={()=>{}} onSearch={()=>{}} scrollRef={productRef}>{null}</SearchScreen>)));
  expect(productRef).toHaveBeenCalled();
  act(()=>ready.unmount());
 });
});
