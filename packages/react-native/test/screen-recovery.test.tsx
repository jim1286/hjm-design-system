import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { TextInput } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { Button, IconButton } from "../src/actions.js";
import { ChatScreen, ScreenLayout } from "../src/screens.js";
import { CommentThreadScreen, ListDetailScreen, OnboardingScreen, type CommentThreadItem } from "../src/screen-flows.js";
import type { ReactNode } from "react";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(child: ReactNode) { let tree: ReactTestRenderer; act(() => {tree=create(<HjmNativeProvider>{child}</HjmNativeProvider>);}); return tree!; }
it("allows a first message in empty state but hides input in unavailable states", () => {
  for (const kind of ["empty","ready","loading","error","restricted"] as const) {
    const tree=render(<ChatScreen title="Conversation" state={kind==="ready"?{kind}:{kind,title:kind}} composer={<TextInput accessibilityLabel="Message"/>}>Messages</ChatScreen>);
    expect(tree.root.findAllByType(TextInput)).toHaveLength(kind==="empty"||kind==="ready"?1:0); act(()=>tree.unmount());
  }
});
it("keeps the list mounted through detail failure and recovery", () => {
  const retry=vi.fn();
  const props={title:"List",list:<TextInput value="kept"/>,back:{label:"Back",onAction:vi.fn()}};
  const tree=render(<ListDetailScreen {...props} detail={{title:"Detail",content:"Private content",state:{kind:"error",title:"Failed"},stateAction:<Button onPress={retry}>Retry</Button>}}/>);
  const input=tree.root.findByType(TextInput); expect(JSON.stringify(tree.toJSON())).not.toContain("Private content");
  act(()=>tree.root.findAllByType(Button).find(button=>button.props.children==="Retry")!.props.onPress()); expect(retry).toHaveBeenCalledOnce();
  act(()=>tree.update(<HjmNativeProvider><ListDetailScreen {...props} detail={{title:"Detail",content:"Recovered",notice:"Updated"}}/></HjmNativeProvider>));
  expect(tree.root.findByType(TextInput)).toBe(input); expect(tree.root.findAllByType(ScreenLayout)[1]!.props.notice).toBe("Updated");
  act(()=>tree.update(<HjmNativeProvider><ListDetailScreen {...props}/></HjmNativeProvider>)); expect(tree.root.findByType(TextInput)).toBe(input); act(()=>tree.unmount());
});
it("locks all onboarding navigation during completion or skip and unlocks afterward", () => {
  for (const saving of ["complete","skip","none"] as const) {
    const tree=render(<OnboardingScreen steps={[{id:"one",title:"One",description:"",content:null},{id:"two",title:"Two",description:"",content:null}]} index={1} onIndexChange={()=>{}} nextLabel="Next" backLabel="Back" complete={{label:"Finish",onAction:()=>{},pending:saving==="complete"}} skip={{label:"Skip",onAction:()=>{},pending:saving==="skip"}} progressLabel={()=>"2 / 2"}/>);
    expect(tree.root.findAllByType(Button).every(button=>button.props.disabled)).toBe(saving!=="none"); act(()=>tree.unmount());
  }
});
it("preserves root and reply order independently of the source interleaving", () => {
  const item=(id:string,parentId:string|null):CommentThreadItem=>({id,parentId,author:id,body:null,timeLabel:"",likeCountLabel:"",likeIcon:"♥",likeLabel:`Like ${id}`,canReply:false});
  const tree=render(<CommentThreadScreen title="Comments" items={[item("rb","b"),item("a",null),item("ra2","a"),item("b",null),item("ra1","a")]} expandedIds={["a","b"]} onExpandedChange={()=>{}} onLike={()=>{}} onReply={()=>{}} replyLabel="Reply" repliesLabel={n=>`${n} replies`}/>);
  expect(tree.root.findAllByType(IconButton).map(button=>button.props.label)).toEqual(["Like a","Like ra2","Like ra1","Like b","Like rb"]); act(()=>tree.unmount());
});
it("uses the shared centered state for empty saved items without replacing an explicit error", async () => {
  const {SavedItemsScreen}=await import("../src/saved-items.js");
  const props={title:"Saved",items:[],collections:[],labels:{allItems:"All",back:"Back",createCollection:"Create",privateNotice:"Private",empty:"No saved items"},onOpenCollection:()=>{},onOpenItem:()=>{},onBack:()=>{},onCreateCollection:()=>{},renderThumbnail:()=>null,renderDetail:()=>null};
  const tree=render(<SavedItemsScreen {...props} collectionId={null}/>);
  expect(tree.root.findByType(ScreenLayout).props.state).toEqual({kind:"empty",title:"No saved items"});
  act(()=>tree.update(<HjmNativeProvider><SavedItemsScreen {...props} collectionId={null} state={{kind:"error",title:"Failed"}}/></HjmNativeProvider>));
  expect(tree.root.findByType(ScreenLayout).props.state).toEqual({kind:"error",title:"Failed"});
  act(()=>tree.update(<HjmNativeProvider><SavedItemsScreen {...props}/></HjmNativeProvider>));
  expect(tree.root.findByType(ScreenLayout).props.state).toEqual({kind:"ready"}); act(()=>tree.unmount());
});
