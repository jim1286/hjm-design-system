import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi, type Mock } from 'vitest';
import { AppState, AccessibilityInfo, type AppStateStatus } from 'react-native';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button } from '@hjmds/react-native/actions';
import { Dialog } from '@hjmds/react-native/overlays';
import { TextField } from '@hjmds/react-native/inputs';
import { VideoDialogPreview } from '../../../showcase/native/src/video-dialog-preview';
type Player={playing:boolean;status:string;version:number;listeners:Set<()=>void>;play:Mock<()=>void>;pause:Mock<()=>void>;release:Mock<()=>void>;emit:()=>void;subscribe:(fn:()=>void)=>()=>void};
const fixture=vi.hoisted(()=>({available:true,players:[] as Player[],rejectPlay:false}));
vi.mock('../../../showcase/native/src/video-dialog-host',async()=>{
 const React=await import('react');
 const playerModule={VideoView:(props:object)=>React.createElement('MockVideoView',props),useVideoPlayer:(source:unknown)=>{
  const player=React.useMemo(()=>{const item:Player={playing:false,status:'readyToPlay',version:0,listeners:new Set(),play:vi.fn<()=>void>(),pause:vi.fn<()=>void>(),release:vi.fn<()=>void>(),emit(){this.version++;this.listeners.forEach(fn=>fn());},subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}};item.subscribe=item.subscribe.bind(item);item.play.mockImplementation(()=>{if(fixture.rejectPlay)throw new Error('blocked');item.playing=true;item.emit();});item.pause.mockImplementation(()=>{item.playing=false;item.emit();});fixture.players.push(item);return item;},[source]);React.useEffect(()=>()=>player.release(),[player]);return player;
 }};
 return {videoDialogHost:{get player(){return fixture.available?playerModule:null;},clip:1,useEvent:(player:Player)=>{React.useSyncExternalStore(player.subscribe,()=>player.version);return {isPlaying:player.playing,status:player.status};}}};
});
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
beforeEach(()=>{fixture.available=true;fixture.players=[];fixture.rejectPlay=false;});
afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;vi.restoreAllMocks();});
const render=()=>act(()=>{tree=create(<HjmNativeProvider reducedMotion><VideoDialogPreview/></HjmNativeProvider>,{createNodeMock:()=>({})});});
const button=(label:string)=>tree!.root.findAllByType(Button).find(node=>node.props.children===label)!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const close=()=>act(()=>tree!.root.findByType(Dialog).props.onOpenChange(false));
const text=()=>tree!.root.findAll(node=>String(node.type)==='Text').map(node=>node.children.filter(child=>typeof child==='string').join('')).join(' ');
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,60));});
it('keeps equivalent text and closing available when the native player module is missing',async()=>{
 fixture.available=false;render();act(()=>tree!.root.findByType(TextField).props.onValueChange('초안'));press('영상 미리보기');expect(text()).toContain('영상 재생 모듈이 없습니다');expect(text()).toContain('영상 설명: 여러 색의 패턴이 6초 동안 움직입니다. 소리는 없습니다.');close();await settle();expect(tree!.root.findByType(TextField).props.value).toBe('초안');expect(fixture.players).toHaveLength(0);
});
it('pauses on app background, releases immediately on close and reopens a clean host without autoplay',async()=>{
 let listener!:(state:AppStateStatus)=>void;const remove=vi.fn();vi.spyOn(AppState,'addEventListener').mockImplementation((_event,callback)=>{listener=callback;return {remove};});const focus=vi.spyOn(AccessibilityInfo,'setAccessibilityFocus');render();press('영상 미리보기');const first=fixture.players[0]!;expect(first.play).not.toHaveBeenCalled();press('재생');expect(button('일시 정지')).toBeDefined();act(()=>listener('background'));expect(first.pause).toHaveBeenCalledTimes(1);expect(button('재생')).toBeDefined();act(()=>listener('active'));expect(first.play).toHaveBeenCalledTimes(1);close();expect(first.release).toHaveBeenCalledTimes(1);expect(remove).toHaveBeenCalled();await settle();expect(focus).toHaveBeenCalled();press('영상 미리보기');expect(fixture.players).toHaveLength(2);expect(fixture.players[1]!.play).not.toHaveBeenCalled();
});
it('replaces an errored native host on retry and retains the text alternative',()=>{
 render();press('영상 미리보기');const first=fixture.players[0]!;act(()=>{first.status='error';first.emit();});expect(text()).toContain('영상을 불러오지 못했어요.');expect(text()).toContain('영상 설명:');press('다시 시도');expect(first.release).toHaveBeenCalledTimes(1);expect(fixture.players).toHaveLength(2);expect(button('재생')).toBeDefined();expect(text()).not.toContain('영상을 불러오지 못했어요.');
});
it('reports native play rejection and clears it only after a successful user retry',()=>{
 render();press('영상 미리보기');fixture.rejectPlay=true;press('재생');expect(text()).toContain('재생을 시작하지 못했어요.');fixture.rejectPlay=false;press('재생');expect(button('일시 정지')).toBeDefined();expect(text()).not.toContain('재생을 시작하지 못했어요.');const current=fixture.players[0]!;act(()=>{current.playing=false;current.emit();});expect(button('재생')).toBeDefined();
});
