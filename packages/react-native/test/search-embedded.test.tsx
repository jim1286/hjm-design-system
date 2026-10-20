import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ScrollView, TextInput, View } from "react-native";
import { expect, it } from "vitest";
import { SearchScreen } from "../src/screen-flows.js";
import { ScreenLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";
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
