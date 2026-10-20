import { useState, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, ScrollView, TextInput, View, StyleSheet } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Button, IconButton } from "../src/actions.js";
import { NotificationInboxScreen, ScreenLayout, SettingsScreen } from "../src/screens.js";
import { Text } from "../src/primitives.js";
import { screenHeaderRecipe, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;});
function render(ui:ReactNode){act(()=>{const node=<HjmNativeProvider reducedMotion>{ui}</HjmNativeProvider>;if(tree)tree.update(node);else tree=create(node);});}
const button=(label:string)=>tree!.root.findAllByType(Button).find(n=>n.props.children===label)!;
it("keeps inbox filter state and actions through replacement and notice transitions",()=>{
 const retry=vi.fn();function Filter(){const[count,setCount]=useState(0);return <Pressable accessibilityLabel="Unread" onPress={()=>setCount(n=>n+1)}><Text>Filter {count}</Text></Pressable>;}
 let first:ReturnType<ReactTestRenderer['root']['findByType']>|undefined;
 for(const kind of ['loading','error','empty'] as const){
  render(<NotificationInboxScreen title="Inbox" notice={kind === "error" ? <Text>Read update failed</Text> : null} filters={<Filter/>} footer={<Button>Compose</Button>} state={{kind,title:'State'}} stateAction={<Button onPress={retry}>Recover</Button>}><TextInput accessibilityLabel="Private"/></NotificationInboxScreen>);
  const filter=tree!.root.findAllByType(Pressable).find(n=>n.props.accessibilityLabel==='Unread')!;if(first)expect(filter).toBe(first);first=filter;act(()=>filter.props.onPress());
  expect(tree!.root.findAllByType(TextInput)).toHaveLength(0);expect(JSON.stringify(tree!.toJSON()).includes('Read update failed')).toBe(kind === 'error');act(()=>button('Recover').props.onPress());
 }
 expect(retry).toHaveBeenCalledTimes(3);expect(tree!.root.findAllByType(Text).find(n=>Array.isArray(n.props.children)&&n.props.children[0]==='Filter ')!.props.children[1]).toBe(3);
});
it("keeps local settings drafts and section identity during reorder and refresh failure",()=>{
 function Draft(){const[value,setValue]=useState('saved');return <TextInput accessibilityLabel="Nickname" value={value} onChangeText={setValue}/>;}
 const sections=[{id:'account',title:'Account',children:<Draft/>},{id:'preferences',title:'Preferences',children:<Text>Other</Text>}];
 render(<SettingsScreen title="Settings" sections={sections}/>);const input=tree!.root.findByType(TextInput);act(()=>input.props.onChangeText('unsaved'));
 render(<SettingsScreen title="Settings" notice={<Text>Save failed</Text>} sections={[sections[1]!,sections[0]!]}/>);
 expect(tree!.root.findByType(TextInput)).toBe(input);expect(input.props.value).toBe('unsaved');expect(JSON.stringify(tree!.toJSON())).toContain('Save failed');
});
it("keeps host refresh and keyboard ownership when content scrolling is replaced and restored",()=>{
 const refresh=<Text>Refresh</Text>,retry=vi.fn();const ui=(state:ScreenContentState)=><ScreenLayout title="Results" scroll="content" header={<Text>Host header</Text>} contentInset="none" state={state} scrollProps={{refreshControl:refresh,keyboardDismissMode:'interactive'}} stateAction={<Button onPress={retry}>Retry</Button>}><Text>List owns scrolling</Text></ScreenLayout>;
 render(ui({kind:'ready'}));expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
 render(ui({kind:'error',title:'Failed'}));const scroll=tree!.root.findByType(ScrollView);expect(scroll.props.refreshControl).toBe(refresh);expect(scroll.props.keyboardDismissMode).toBe('interactive');expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');act(()=>button('Retry').props.onPress());expect(retry).toHaveBeenCalledTimes(1);
 render(ui({kind:'ready'}));expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);expect(JSON.stringify(tree!.toJSON())).toContain('List owns scrolling');
});

it("keeps hidden route identity accessible and balances unequal navigation controls", () => {
 const back=vi.fn();
 render(<ScreenLayout title="Route name" titleVisibility="hidden" description="2026.10.14" exit={{kind:"back",label:"Back",onPress:back}} actions={<Text>Two actions</Text>}><Text>Body</Text></ScreenLayout>);
 expect(tree!.root.findAllByType(View).some(node=>node.props.accessibilityLabel==='Route name')).toBe(true);
 expect(tree!.root.findAllByType(Text).some(node=>node.props.children==='Route name')).toBe(false);
 const measures=tree!.root.findAllByType(View).filter(node=>node.props.onLayout);
 expect(measures).toHaveLength(2);
 act(()=>{measures[0]!.props.onLayout({nativeEvent:{layout:{width:44}}});measures[1]!.props.onLayout({nativeEvent:{layout:{width:96}}});});
 const centered=tree!.root.findAllByType(View).find(node=>StyleSheet.flatten(node.props.style)?.minHeight===screenHeaderRecipe.compactMinHeight)!;
 // Equal side columns (the wider measured control, 96) keep the title centered; controls stay in flow
 // so their height counts toward the header (centered header rework, 2026-10-17).
 const sides=centered.props.children.filter((child: unknown)=>child&&typeof child==='object').map((child: {props:{style:Parameters<typeof StyleSheet.flatten>[0]}})=>StyleSheet.flatten(child.props.style)).filter((style: {minWidth?:unknown;flexShrink?:number})=>style?.flexShrink===0 && typeof style.minWidth==='number');
 expect(sides.map((style: {minWidth:number})=>style.minWidth)).toEqual([96,96]);
 expect(measures.every(node=>StyleSheet.flatten(node.props.style).position!=='absolute')).toBe(true);
 // Supporting header copy was retired; required content belongs in the body.
 expect(tree!.root.findAllByType(Text).some(node=>node.props.children==='2026.10.14')).toBe(false);
 act(()=>tree!.root.findByType(IconButton).props.onPress());expect(back).toHaveBeenCalledOnce();
});
