import { StrictMode } from "react";
import { TextInput, Pressable } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { TextField, SearchField } from "../src/inputs.js";
import { Combobox } from "../src/forms.js";
import { Mentions } from "../src/mentions.js";
import { NumberField } from "../src/number-field.js";
import { FilePicker } from "../src/file-picker.js";
let renderer: ReactTestRenderer | undefined;
beforeEach(()=> { (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true; });
afterEach(()=> { act(()=>renderer?.unmount()); renderer=undefined; });
function render(ui: React.ReactNode) { act(()=> { if(renderer) renderer.update(<HjmNativeProvider>{ui}</HjmNativeProvider>); else renderer=create(<HjmNativeProvider>{ui}</HjmNativeProvider>); }); }
it("honors editable=false through fields and hides readonly search clear",()=> {
 const changed=vi.fn(); render(<TextField label="Text" editable={false} onValueChange={changed} />);
 const input=renderer!.root.findByType(TextInput); expect(input.props.editable).toBe(false);
 act(()=>input.props.onChangeText("late input")); expect(changed).not.toHaveBeenCalled();
 render(<SearchField label="Search" defaultValue="saved" readOnly clearLabel="Clear" busyLabel="Loading" />);
 expect(renderer!.root.findAllByType(Pressable)).toHaveLength(0);
});
it("does not expose mention selection for a readOnly input",()=> {
 const changed=vi.fn(); render(<Mentions label="Text" value="@s" onValueChange={changed} readOnly triggers={[{id:"p",trigger:"@"}]} candidates={[{id:"s",label:"Seoul"}]} emptyMessage="Empty" listLabel="Results" />);
 expect(renderer!.root.findAllByType(Pressable)).toHaveLength(0);
});
it("does not commit hidden combobox options while async results are loading",()=> {
 const changed=vi.fn();
 const ui=(loading:boolean)=><Combobox label="City" items={[{id:"s",label:"Seoul",textValue:"Seoul"}]} defaultOpen onSelectionChange={changed} asyncState={loading?{status:"loading",message:"Loading"}:{status:"idle"}} emptyMessage="Empty" loadingMessage="Loading" clearLabel="Clear" dismissLabel="Close" />;
 render(ui(false)); act(()=>renderer!.root.findByType(TextInput).props.onKeyPress({nativeEvent:{key:"ArrowDown"}}));
 render(ui(true)); act(()=>renderer!.root.findByType(TextInput).props.onKeyPress({nativeEvent:{key:"Enter"}}));
 expect(changed).not.toHaveBeenCalled();
});
it("locks the native picker before rerender and ignores completion after unmount",async()=> {
 let resolve!: (value:any)=>void; const onPick=vi.fn(()=>new Promise<any>(r=>{resolve=r;})); const selected=vi.fn();
 render(<StrictMode><FilePicker label="Files" buttonLabel="Pick" descriptor={{}} onPick={onPick} onPickError={vi.fn()} onSelect={selected} /></StrictMode>);
 const trigger=renderer!.root.findByType(Pressable);
 act(()=> { trigger.props.onPress(); trigger.props.onPress(); });
 expect(onPick).toHaveBeenCalledOnce();
 act(()=>renderer!.unmount());
 await act(async()=>resolve([{id:"a",name:"a.txt",mimeType:"text/plain",sizeBytes:1}]));
 expect(selected).not.toHaveBeenCalled();
});
it("unlocks the native picker after a StrictMode completion",async()=> {
 const selected=vi.fn(); render(<StrictMode><FilePicker label="Files" buttonLabel="Pick" descriptor={{}} onPick={async()=>[]} onPickError={vi.fn()} onSelect={selected} /></StrictMode>);
 await act(async()=>renderer!.root.findByType(Pressable).props.onPress());
 expect(selected).toHaveBeenCalledOnce(); expect(renderer!.root.findByType(Pressable).props.disabled).toBe(false);
});

it("does not commit a NumberField draft after becoming readonly", () => {
 const changed=vi.fn();
 const ui=(readOnly:boolean)=><NumberField label="Amount" defaultValue={1} min={0} max={10} incrementLabel="More" decrementLabel="Less" readOnly={readOnly} onValueChange={changed} />;
 render(ui(false)); act(()=>renderer!.root.findByType(TextInput).props.onChangeText("2"));
 render(ui(true)); act(()=>renderer!.root.findByType(TextInput).props.onBlur({}));
 expect(changed).not.toHaveBeenCalled();
});
