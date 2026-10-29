import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ScrollView, TextInput, View } from "react-native";
import { expect, it } from "vitest";
import { SearchScreen } from "../src/screen-flows.js";
import { ScreenLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Sheet } from "../src/overlays.js";
(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;

it("uses the embedded host's navigation and scroll ownership, keeping the query during an error replacement",()=>{
 let tree!:ReactTestRenderer;
 const view=(scroll:'screen'|'content',error=false)=><HjmNativeProvider><SearchScreen embedded scroll={scroll}
  title="Search" queryLabel="Query" queryClearLabel="Clear" query="query" onQueryChange={()=>{}} onSearch={()=>{}}
  state={error?{kind:'error',title:'Search failed'}:{kind:'ready'}}><View testID="external-list" /></SearchScreen></HjmNativeProvider>;
 try{
  act(()=>{tree=create(view('content'));});
  expect(tree.root.findAllByType(ScreenLayout)).toHaveLength(0);
  expect(tree.root.findAllByType(ScrollView)).toHaveLength(0);
  expect(tree.root.findByType(TextInput).props.value).toBe('query');
  act(()=>tree.update(view('screen')));
  expect(tree.root.findAllByType(ScrollView)).toHaveLength(1);
  act(()=>tree.update(view('screen',true)));
  expect(tree.root.findByType(TextInput).props.value).toBe('query');
  expect(tree.root.findAllByType(View).filter(node=>node.props.accessibilityRole==='alert')).toHaveLength(1);
  expect(tree.root.findAllByProps({testID:'external-list'})).toHaveLength(0);
 }finally{act(()=>tree.unmount());}
});

// 2026-10-30 Spint city sheet: the results scroller in a plain Sheet body must drive the sheet pull itself, so a
// scrolled list scrolls back instead of dragging the sheet. A scrollable Sheet body keeps the pull to itself.
it("adopts a plain Sheet body's pull wiring for its results scroller, and not a scrollable body's",()=>{
 let tree!:ReactTestRenderer;
 const view=(scrollable:boolean)=><HjmNativeProvider reducedMotion><Sheet open scrollable={scrollable} title="Cities" closeLabel="Close">
  <SearchScreen embedded title="Search" queryLabel="Query" queryClearLabel="Clear" query="" onQueryChange={()=>{}} onSearch={()=>{}}><View /></SearchScreen></Sheet></HjmNativeProvider>;
 const adopted=()=>tree.root.findAll(node=>typeof node.props.onScrollBeginDrag==='function'&&typeof node.props.scrollEventThrottle==='number').length;
 try{
  act(()=>{tree=create(view(false));});
  expect(adopted()).toBeGreaterThan(0);
  expect(tree.root.findAll(node=>typeof node.props.onTouchStart==='function'&&node.props.style?.flex===1).length).toBeGreaterThan(0);
  act(()=>tree.update(view(true)));
  // Only the Sheet's own body carries the wiring; the nested results scroller is a plain ScrollView again.
  expect(tree.root.findAllByType(ScrollView).every(node=>node.props.onScrollBeginDrag===undefined)).toBe(true);
 }finally{act(()=>tree.unmount());}
});
