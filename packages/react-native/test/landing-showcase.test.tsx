import * as Native from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button } from '@hjmds/react-native/actions';
import { TextField } from '@hjmds/react-native/inputs';
import { Sheet } from '@hjmds/react-native/overlays';
import { Collapsible } from '@hjmds/react-native/collapsible';
import { ListRow } from '@hjmds/react-native/data-display';
import { LandingPreview } from '../../../showcase/native/src/landing-preview.js';
import { landingCopy as copy } from '../../../showcase/shared/landing-pattern.js';
vi.mock('react-native-svg',async()=>{const {View}=await import('react-native');return {default:View,Circle:View,Defs:View,Ellipse:View,RadialGradient:View,Stop:View,Pattern:View,Rect:View,Mask:View,Image:View};});
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;afterEach(()=>{if(tree)act(()=>tree.unmount());vi.restoreAllMocks();});
let nextHostId=0;const inputFocus=vi.fn();
const render=()=>act(()=>{inputFocus.mockClear();tree=create(<HjmNativeProvider reducedMotion><LandingPreview/></HjmNativeProvider>,{createNodeMock:element=>({id:++nextHostId,focus:element.type==='TextInput'?inputFocus:vi.fn()})});});
const buttons=(label:string)=>tree.root.findAllByType(Button).filter(node=>node.props.children===label);
const settled=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,60));});
const press=(label:string,index=0)=>act(()=>buttons(label)[index]!.props.onPress());
it('retains native draft on dismissal, commits once and clears only after saving',async()=>{
 render();press(copy.cta);act(()=>tree.root.findByType(TextField).props.onValueChange('  내 기록  '));act(()=>tree.root.findByType(Sheet).props.onOpenChange(false));await settled();press(copy.cta,1);expect(tree.root.findByType(TextField).props.value).toBe('  내 기록  ');
 const save=buttons(copy.submit)[0]!.props.onPress;act(()=>{save();save();});expect(tree.root.findByType(Sheet).props.open).toBe(false);expect(tree.root.findAllByType(ListRow).filter(node=>node.props.title==='내 기록')).toHaveLength(1);await settled();press(copy.cta);expect(tree.root.findByType(TextField).props.value).toBe('');
});
it('keeps native validation editable and saves through keyboard submit',()=>{
 render();press(copy.cta);press(copy.submit);expect(tree.root.findByType(Sheet).props.open).toBe(true);expect(tree.root.findByType(TextField).props.error).toBe(copy.error);expect(inputFocus).toHaveBeenCalledTimes(1);act(()=>tree.root.findByType(TextField).props.onValueChange('키보드 저장'));expect(tree.root.findByType(TextField).props.error).toBeUndefined();act(()=>tree.root.findByType(TextField).props.onSubmitEditing());expect(tree.root.findByType(Sheet).props.open).toBe(false);
});
it('toggles native FAQ host presses independently',()=>{
 render();const items=tree.root.findAllByType(Collapsible);const trigger=(index:number)=>items[index]!.findAll(node=>String(node.type)==='Pressable')[0]!;act(()=>trigger(0).props.onPress());expect(trigger(0).props.accessibilityState.expanded).toBe(true);act(()=>trigger(1).props.onPress());expect(trigger(0).props.accessibilityState.expanded).toBe(true);expect(trigger(1).props.accessibilityState.expanded).toBe(true);act(()=>trigger(0).props.onPress());expect(trigger(0).props.accessibilityState.expanded).toBe(false);
});

it('commits only one native note for two synchronous save events',()=>{render();press(copy.cta);act(()=>tree.root.findByType(TextField).props.onValueChange('중복 방지'));const save=buttons(copy.submit)[0]!.props.onPress;act(()=>{save();save();});expect(tree.root.findAllByType(ListRow).filter(node=>node.props.title==='중복 방지')).toHaveLength(1);});

it('returns native accessibility focus to the actual top or bottom CTA after dismissal',async()=>{
 const focus=vi.spyOn(Native.AccessibilityInfo,'setAccessibilityFocus');vi.spyOn(Native,'findNodeHandle').mockImplementation(node=>(node as unknown as {id:number}).id);render();let previous:number|undefined;
 for(const index of [0,1]){press(copy.cta,index);const sheet=tree.root.findByType(Sheet);const target=sheet.props.returnFocusRef.current;expect(target).not.toBeNull();if(previous)expect(target.id).not.toBe(previous);previous=target.id;act(()=>sheet.props.onOpenChange(false));await settled();expect(focus).toHaveBeenLastCalledWith(target.id);}
});
