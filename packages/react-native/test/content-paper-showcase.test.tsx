// SVG rendering and native accessibility delivery are mocked host boundaries.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import { AccessibilityInfo, Platform } from 'react-native';
import { Button } from '@hjmds/react-native/actions';
import { Chip, TextField, SegmentedControl } from '@hjmds/react-native/inputs';
import { Tabs } from '@hjmds/react-native/navigation';
import { Dialog } from '@hjmds/react-native/overlays';
import { ContentTransitionComparison } from '../../../showcase/native/src/content-transition-comparison-preview.js';
import { PaperSurfacePreview } from '../../../showcase/native/src/paper-surface-preview.js';
vi.mock('react-native-svg',async()=>{const{View}=await import('react-native');return{default:View,Svg:View,Circle:View,Path:View,G:View,Rect:View,Line:View,Polyline:View,Polygon:View,Ellipse:View,Defs:View,RadialGradient:View,Stop:View,Pattern:View,Mask:View,Image:View};});
let tree:ReactTestRenderer;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(tree)await act(async()=>tree.unmount());vi.restoreAllMocks();});
const render=(mode:'tabs'|'steps')=>act(async()=>{tree=create(<ContentTransitionComparison mode={mode}/>);});
const button=(name:string)=>tree.root.findAllByType(Button).find(item=>item.props.children===name)!;
const press=(name:string)=>act(()=>button(name).props.onPress());
const field=()=>tree.root.findByType(TextField);
const edit=(value:string)=>act(()=>field().props.onValueChange(value));
const text=()=>JSON.stringify(tree.toJSON());
// Theme and failure are preview tools: a theme pill group and an on/off chip (2026-10-17 review).
const choose=(label:string,value:string)=>act(()=>tree.root.findAllByType(SegmentedControl).find(item=>item.props.label===label)!.props.onValueChange(value));
const toggle=(label:string)=>act(()=>tree.root.findAllByType(Chip).find(item=>item.props.label===label)!.props.onPress());
it('preserves one draft across tabs, appearance and theme changes',async()=>{
 await render('tabs');edit('이어 쓸 초안');act(()=>tree.root.findByType(Tabs).props.onValueChange('draft'));choose('전환 표현','none');choose('테마','forest');expect(field().props.value).toBe('이어 쓸 초안');expect(tree.root.findByType(Tabs).props.value).toBe('draft');
});
it('keeps failed draft, confirms on retry and resumes the first step without discarding it',async()=>{
 await render('steps');edit('확인할 초안');press('다음');press('다음');toggle('완료 실패 재현');press('기록 확인');expect(text()).toContain('확인하지 못했어요. 초안은 남아 있어요.');expect(field().props.value).toBe('확인할 초안');press('기록 확인');expect(text()).toContain('기록을 확인했어요');press('다시 비교');expect(field().props.value).toBe('확인할 초안');expect(text()).toContain('작은 계획부터');
});
it('keeps the confirmed snapshot when tabs edit a separate draft',async()=>{
 await render('steps');edit('확인된 기록');press('다음');press('다음');press('기록 확인');act(()=>tree.update(<ContentTransitionComparison mode="tabs"/>));edit('미확인 초안');act(()=>tree.update(<ContentTransitionComparison mode="steps"/>));expect(text()).toContain('확인된 기록');expect(text()).not.toContain('미확인 초안');press('다시 비교');expect(field().props.value).toBe('미확인 초안');
});
it('preserves paper input, local snapshot and dialog state while changing material',async()=>{
 await act(async()=>{tree=create(<PaperSurfacePreview/>);});edit('확인한 산책');press('기록 확인');edit('다음 산책 초안');act(()=>tree.root.findAllByType(SegmentedControl)[0]!.props.onValueChange('ruled'));act(()=>tree.root.findAllByType(SegmentedControl)[1]!.props.onValueChange('40'));choose('테마','forest');expect(field().props.value).toBe('다음 산책 초안');expect(text()).toContain('초안 확인: 확인한 산책');press('자세히 읽기');expect(tree.root.findByType(Dialog).props.open).toBe(true);act(()=>tree.root.findByType(Dialog).props.onOpenChange(false));expect(tree.root.findByType(Dialog).props.open).toBe(false);expect(field().props.value).toBe('다음 산책 초안');
});
it('announces a paper confirmation on iOS without an initial empty announcement',async()=>{
 const os=Platform.OS;Object.defineProperty(Platform,'OS',{value:'ios',configurable:true,writable:true});const announce=vi.spyOn(AccessibilityInfo,'announceForAccessibilityWithOptions');
 try{await act(async()=>{tree=create(<PaperSurfacePreview/>);});expect(announce).not.toHaveBeenCalled();edit('읽어 줄 산책');press('기록 확인');expect(announce).toHaveBeenCalledWith('초안 확인: 읽어 줄 산책',{queue:true});}
 finally{Object.defineProperty(Platform,'OS',{value:os,configurable:true,writable:true});}
});
