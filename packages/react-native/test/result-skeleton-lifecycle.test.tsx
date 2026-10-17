import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {AccessibilityInfo,Animated,Platform,Pressable} from 'react-native';
import {afterEach,expect,it,vi} from 'vitest';
import {Result,Skeleton} from '../src/feedback.js';
import {HjmNativeProvider} from '../src/provider.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;const initialOS=Platform.OS;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;vi.restoreAllMocks();vi.unstubAllGlobals();Object.defineProperty(Platform,'OS',{value:initialOS,writable:true,configurable:true});});
const render=(node:React.ReactNode,reduced=true)=>act(()=>{const view=<HjmNativeProvider reducedMotion={reduced}>{node}</HjmNativeProvider>;if(tree)tree.update(view);else tree=create(view);});
it('uses current primary and secondary handlers after a result is replaced',()=>{
 const old=vi.fn(),primary=vi.fn(),secondary=vi.fn();render(<Result status="success" title="Saved" actions={[{label:'Done',onAction:old},{label:'Later',onAction:secondary}]}/>);let buttons=tree!.root.findAllByType(Pressable);expect(buttons.map(node=>node.props.accessibilityLabel)).toEqual(['Later','Done']);act(()=>buttons[0]!.props.onPress());expect(secondary).toHaveBeenCalledOnce();render(<Result status="info" title="Complete" actions={[{label:'Close',onAction:primary}]}/>);buttons=tree!.root.findAllByType(Pressable);expect(buttons).toHaveLength(1);act(()=>buttons[0]!.props.onPress());expect(primary).toHaveBeenCalledOnce();expect(old).not.toHaveBeenCalled();
});
it('cancels obsolete iOS failure announcements on state change and unmount',()=>{
 Object.defineProperty(Platform,'OS',{value:'ios',writable:true,configurable:true});const frames=new Map<number,(time:number)=>void>();let id=0;vi.stubGlobal('requestAnimationFrame',(callback:(time:number)=>void)=>{frames.set(++id,callback);return id;});vi.stubGlobal('cancelAnimationFrame',(key:number)=>frames.delete(key));const announce=vi.spyOn(AccessibilityInfo,'announceForAccessibilityWithOptions');
 render(<Result status="failure" title="Old failure"/>);expect(frames.size).toBe(1);render(<Result status="failure" title="New failure" description="Retry later"/>);expect(frames.size).toBe(1);act(()=>{for(const callback of frames.values())callback(0);frames.clear();});expect(announce).toHaveBeenCalledExactlyOnceWith('New failure. Retry later',{queue:false});
 render(<Result status="failure" title="Retired failure"/>);expect(frames.size).toBe(1);render(<Result status="success" title="Saved"/>);expect(frames.size).toBe(0);render(<Result status="failure" title="Final failure"/>);act(()=>tree!.unmount());tree=undefined;expect(frames.size).toBe(0);expect(announce).toHaveBeenCalledOnce();
});
it('stops skeleton loops on reduced motion, explicit inactivity and unmount',()=>{
 const loops:{start:ReturnType<typeof vi.fn>;stop:ReturnType<typeof vi.fn>;reset:ReturnType<typeof vi.fn>}[]=[];vi.spyOn(Animated,'loop').mockImplementation(()=>{const loop={start:vi.fn(),stop:vi.fn(),reset:vi.fn()};loops.push(loop);return loop;});
 render(<Skeleton accessibilityLabel="Loading"/>,false);expect(loops).toHaveLength(1);expect(loops[0]!.start).toHaveBeenCalledOnce();render(<Skeleton accessibilityLabel="Loading"/>,true);expect(loops[0]!.stop).toHaveBeenCalledOnce();expect(loops).toHaveLength(1);
 render(<Skeleton accessibilityLabel="Loading"/>,false);expect(loops).toHaveLength(2);render(<Skeleton animated={false} accessibilityLabel="Loading"/>,false);expect(loops[1]!.stop).toHaveBeenCalledOnce();render(<Skeleton/>,false);expect(loops).toHaveLength(3);act(()=>tree!.unmount());tree=undefined;expect(loops[2]!.stop).toHaveBeenCalledOnce();
});
// 2026-10-17 BurnTok: pill-button products need pill button placeholders from the same Button shape axis and theme radius.
it('takes the button skeleton corner from the Button shape axis',()=>{
 const radiusOf=(element:React.ReactElement)=>{let t!:ReactTestRenderer;act(()=>{t=create(<HjmNativeProvider reducedMotion>{element}</HjmNativeProvider>);});
  const node=t.root.findAll(n=>typeof n.type==='string'&&[n.props.style].flat(3).some((s:{borderRadius?:number}|undefined)=>s?.borderRadius!==undefined))[0]!;
  const r=Object.assign({},...[node.props.style].flat(3).filter(Boolean)).borderRadius;act(()=>t.unmount());return r;};
 expect(radiusOf(<Skeleton shape="button"/>)).toBe(radiusOf(<Skeleton shape="block"/>));
 expect(radiusOf(<Skeleton shape="button" buttonShape="pill"/>)).toBe(radiusOf(<Skeleton shape="circle"/>));
});
