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
