import {TopBar} from "../src/navigation.js";
import {act,create,type ReactTestRenderer} from "react-test-renderer";
import {it,expect,vi} from "vitest";
import {Pressable} from "react-native";
import {HjmNativeProvider} from "../src/provider.js";
import {SegmentedControl} from "../src/inputs.js";
import {ConversationRow} from "../src/conversation-row.js";
(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("text navigation retains radio activation and conversation metadata",()=>{
 let tree:ReactTestRenderer;const change=vi.fn();
 act(()=>{tree=create(<HjmNativeProvider><SegmentedControl label="Feed" presentation="text" items={[{value:"new",label:"New"},{value:"following",label:"Following"}]} onValueChange={change}/><ConversationRow title="Person" preview="Hello" metadata="now" avatar={null} unread/></HjmNativeProvider>);});
 const options=tree!.root.findAllByType(Pressable).filter(node=>node.props.accessibilityRole==="radio");
 expect(options).toHaveLength(2);act(()=>options[1]!.props.onPress());expect(change).toHaveBeenCalledWith("following");
 expect(JSON.stringify(tree!.toJSON())).toContain(" · now");act(()=>tree!.unmount());
});

it("preserves independent center control activation in TopBar",()=>{
 let tree:ReactTestRenderer;const toggle=vi.fn();
 act(()=>{tree=create(<HjmNativeProvider><TopBar titleContent={<Pressable accessibilityLabel="작업 상태" onPress={toggle}/>}/></HjmNativeProvider>);});
 const control=tree!.root.findAllByType(Pressable).find(node=>node.props.accessibilityLabel==="작업 상태")!;
 act(()=>control.props.onPress());expect(toggle).toHaveBeenCalledOnce();act(()=>tree!.unmount());
});

it.each([['', 'now'], ['  ', 'now'], ['hello', ''], ['', '']])('omits orphan separators around missing conversation fields: %j/%j', (preview, metadata) => {
 let tree:ReactTestRenderer;
 act(()=>{tree=create(<HjmNativeProvider><ConversationRow title="Peer" preview={preview} metadata={metadata} avatar={null}/></HjmNativeProvider>);});
 const rendered=JSON.stringify(tree!.toJSON());expect(rendered).not.toContain(' · ');if(metadata)expect(rendered).toContain(metadata);if(preview.trim())expect(rendered).toContain(preview);act(()=>tree!.unmount());
});
