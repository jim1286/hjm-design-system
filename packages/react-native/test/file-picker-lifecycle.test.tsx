import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {Pressable} from 'react-native';
import {afterEach,expect,it,vi} from 'vitest';
import {FilePicker,type FilePickerProps} from '../src/file-picker.js';
import {HjmNativeProvider} from '../src/provider.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;});
const file={id:'photo',name:'photo.png',mimeType:'image/png',sizeBytes:10};
const render=(props:Omit<FilePickerProps,'label'|'buttonLabel'>)=>act(()=>{const element=<HjmNativeProvider reducedMotion><FilePicker label="Attachments" buttonLabel="Choose" {...props}/></HjmNativeProvider>;if(tree)tree.update(element);else tree=create(element);});
const press=()=>tree!.root.findByType(Pressable).props.onPress();
it('ignores pending selection while the owner has locked the picker',async()=>{
 let finish!:(value:readonly typeof file[])=>void;const onPick=()=>new Promise<readonly typeof file[]>(resolve=>{finish=resolve;});const onSelect=vi.fn(),onPickError=vi.fn();const props={descriptor:{},onPick,onSelect,onPickError};render(props);act(press);render({...props,disabled:true});await act(async()=>finish([file]));expect(onSelect).not.toHaveBeenCalled();expect(tree!.root.findByType(Pressable).props.accessibilityState).toMatchObject({busy:false,disabled:true});
});
it('judges against current limits and count and delivers to the current selection handler',async()=>{
 let finish!:(value:readonly typeof file[])=>void;const onPick=()=>new Promise<readonly typeof file[]>(resolve=>{finish=resolve;});const old=vi.fn(),current=vi.fn(),onPickError=vi.fn();render({descriptor:{mode:'multiple',maxCount:2},onPick,onSelect:old,onPickError});act(press);render({descriptor:{mode:'multiple',maxCount:1},existingCount:1,onPick,onSelect:current,onPickError});await act(async()=>finish([file]));expect(old).not.toHaveBeenCalled();expect(current).toHaveBeenCalledExactlyOnceWith({accepted:[],rejected:[{file,reason:'count-exceeded',maxCount:1}]});
 render({descriptor:{mode:'multiple',maxCount:1},existingCount:0,onPick:async()=>[file],onSelect:current,onPickError});await act(async()=>press());expect(current.mock.calls.at(-1)?.[0]).toEqual({accepted:[file],rejected:[]});
});
it('recovers after cancellation and picker rejection and uses the current error callback',async()=>{
 const selected=vi.fn(),oldError=vi.fn(),currentError=vi.fn();let fail!:(reason:unknown)=>void;const error=new Error('Picker denied');let attempt=0;const onPick=()=>++attempt===1?Promise.resolve(null):attempt===2?new Promise<readonly typeof file[]>((_resolve,reject)=>{fail=reject;}):Promise.resolve([file]);const props={descriptor:{},onPick,onSelect:selected};render({...props,onPickError:oldError});await act(async()=>press());expect(selected).not.toHaveBeenCalled();act(press);render({...props,onPickError:currentError});await act(async()=>fail(error));expect(currentError).toHaveBeenCalledExactlyOnceWith(error);expect(oldError).not.toHaveBeenCalled();expect(tree!.root.findByType(Pressable).props.disabled).toBe(false);await act(async()=>press());expect(selected).toHaveBeenCalledExactlyOnceWith({accepted:[file],rejected:[]});
});
