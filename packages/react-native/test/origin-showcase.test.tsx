import { act,create,type ReactTestRenderer } from 'react-test-renderer';
import { afterEach,expect,it,vi } from 'vitest';
import { AccessibilityInfo, Platform } from 'react-native';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button } from '@hjmds/react-native/actions';
import { Dialog } from '@hjmds/react-native/overlays';
import { Chip, TextField } from '@hjmds/react-native/inputs';
import { Text } from '@hjmds/react-native/primitives';
import { OriginDialogPreview } from '../../../showcase/native/src/origin-dialog-preview';
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;afterEach(()=>{if(tree)act(()=>tree.unmount());vi.restoreAllMocks();});
type Measure=(x:number,y:number,width:number,height:number)=>void;
const render=(measureInWindow?: (callback:Measure)=>void)=>act(()=>{tree=create(<HjmNativeProvider reducedMotion><OriginDialogPreview/></HjmNativeProvider>,{createNodeMock:()=>measureInWindow?{measureInWindow}:{}});});
const dialog=()=>tree.root.findByType(Dialog);
const button=(label:string)=>tree.root.findAllByType(Button).find(n=>n.props.children===label)!;
const press=(label:string)=>act(async()=>{button(label).props.onPress();});
// 미리보기 도구 on/off tools are selection chips, not buttons.
const tool=(label:string)=>act(async()=>{tree.root.findAllByType(Chip).find(n=>n.props.label===label)!.props.onPress();});
const fill=(value:string)=>act(()=>tree.root.findByType(TextField).props.onValueChange(value));
const text=()=>tree.root.findAllByType(Text).map(n=>n.props.children).join(' ');
const close=()=>act(()=>dialog().props.onOpenChange(false));
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,90));});
it('retains native failed draft across close and reopen, then saves it through the real dialog action',async()=>{
 const focus=vi.spyOn(AccessibilityInfo,'setAccessibilityFocus');render(callback=>callback(10,20,100,40));await tool('다음 저장 실패시키기');await press('메모 편집');fill('수정한 여행 메모');await press('저장');expect(dialog().props.open).toBe(true);expect(text()).toContain('저장하지 못했어요.');close();await settle();expect(focus).toHaveBeenCalled();await press('메모 편집');expect(tree.root.findByType(TextField).props.value).toBe('수정한 여행 메모');await press('저장');await settle();expect(dialog().props.open).toBe(false);expect(text()).toContain('수정한 여행 메모');
});
it('ignores an older native measurement after a newer opening was already closed',async()=>{
 const callbacks:Measure[]=[];render(callback=>callbacks.push(callback));await press('메모 편집');await press('메모 편집');act(()=>callbacks[1]!(20,30,100,40));expect(dialog().props.open).toBe(true);close();act(()=>callbacks[0]!(1,2,80,30));expect(dialog().props.open).toBe(false);
});
it('never replaces the latest native origin with an older measurement',async()=>{
 const callbacks:Measure[]=[];render(callback=>callbacks.push(callback));await press('메모 편집');await press('메모 편집');act(()=>callbacks[1]!(20,30,100,40));act(()=>callbacks[0]!(1,2,80,30));expect(dialog().props.motionOrigin).toEqual({x:20,y:30,width:100,height:40});
});
it('reports a deliberately cleared memo as saved rather than never saved',async()=>{
 render();await press('메모 편집');fill('');await press('저장');await settle();expect(dialog().props.open).toBe(false);expect(text()).toContain('빈 메모를 저장했어요.');expect(text()).not.toContain('아직 저장하지 않았어요.');
});
it('announces the confirmed memo through the native status adapter',async()=>{
 const originalPlatform=Platform.OS;Object.defineProperty(Platform,'OS',{configurable:true,value:'ios'});
 try { const announce=vi.spyOn(AccessibilityInfo,'announceForAccessibilityWithOptions');render();announce.mockClear();await press('메모 편집');fill('확정 메모');await press('저장');await settle();expect(announce).toHaveBeenCalledWith('저장한 메모: 확정 메모',{queue:true}); } finally { Object.defineProperty(Platform,'OS',{configurable:true,value:originalPlatform}); }
});
