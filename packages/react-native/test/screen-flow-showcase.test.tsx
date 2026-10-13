import { createRequire } from 'node:module';
import { act,create,type ReactTestRenderer } from 'react-test-renderer';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import type {ReactNode} from 'react';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { EditorScreen,ListDetailScreen,ProfileScreen,OnboardingScreen,ModerationScreen } from '@hjmds/react-native/screen-flows';
import { Button,IconButton } from '@hjmds/react-native/actions';
import { TextField,TextArea } from '@hjmds/react-native/inputs';
import { Text } from '@hjmds/react-native/primitives';
import { ListRow } from '@hjmds/react-native/data-display';
import { Sheet,AlertDialog } from '@hjmds/react-native/overlays';
vi.mock('react-native-svg',async()=>{const {View}=await import('react-native');return {default:View,Svg:View,Circle:View,Path:View,G:View,Rect:View,Line:View,Polyline:View,Polygon:View,Ellipse:View};});
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
// Media picking is a separate flow; retain the real shared profile/photo UI with opaque Metro image sources.
vi.mock('../../../showcase/native/src/media-picker-preview',()=>({MediaPickerPreview:()=>null}));
const nodeRequire=createRequire(import.meta.url),previousJpg=nodeRequire.extensions['.jpg'];nodeRequire.extensions['.jpg']=module=>{module.exports=1;};
const {AccountFlowPreview,CollectionFlowPreview,EditorFlowPreview,OnboardingFlowPreview,ModerationFlowPreview}=await import('../../../showcase/native/src/screen-flow-previews');
if(previousJpg)nodeRequire.extensions['.jpg']=previousJpg;else delete nodeRequire.extensions['.jpg'];
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;beforeEach(()=>vi.useFakeTimers());afterEach(()=>{if(tree)act(()=>tree.unmount());vi.useRealTimers();});
const render=(ui:ReactNode)=>act(()=>{tree=create(<HjmNativeProvider reducedMotion>{ui}</HjmNativeProvider>,{createNodeMock:()=>({focus:vi.fn()})});});
const button=(label:string)=>tree.root.findAllByType(Button).find(n=>n.props.children===label)!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const text=()=>tree.root.findAllByType(Text).map(n=>n.props.children).join(' ');
const tick=()=>act(async()=>{await vi.advanceTimersByTimeAsync(450);});
const field=(label:string)=>[...tree.root.findAllByType(TextField),...tree.root.findAllByType(TextArea)].find(n=>n.props.label===label)!;
const fill=(label:string,value:string)=>act(()=>field(label).props.onValueChange(value));
it('creates a blank native record once despite queued save callbacks and preserves separate bodies',async()=>{
 render(<CollectionFlowPreview/>);press('새 기록');expect(field('제목').props.value).toBe('');fill('제목','첫 새 기록');fill('내용','첫 본문');const save=tree.root.findByType(EditorScreen).props.submit.onAction;act(()=>{save();save();});await tick();expect(tree.root.findAllByType(ListRow).filter(n=>n.props.title==='첫 새 기록')).toHaveLength(1);press('새 기록');fill('제목','다른 기록');fill('내용','다른 본문');act(()=>tree.root.findByType(EditorScreen).props.submit.onAction());await tick();act(()=>tree.root.findAllByType(ListRow).find(n=>n.props.title==='첫 새 기록')!.props.onPress());expect(text()).toContain('첫 본문');expect(text()).not.toContain('다른 본문');
});
it('serializes native save callbacks and ignores a failure toggle queued during pending',async()=>{
 render(<CollectionFlowPreview tools initialEditing/>);fill('제목','한 번 저장');fill('내용','내용');const save=tree.root.findByType(EditorScreen).props.submit.onAction,arm=button('다음 저장 실패').props.onPress;act(()=>{save();arm();save();});await tick();expect(tree.root.findAllByType(ListRow).filter(n=>n.props.title==='한 번 저장')).toHaveLength(1);press('새 기록');fill('제목','다음 저장');fill('내용','내용');act(()=>tree.root.findByType(EditorScreen).props.submit.onAction());await tick();expect(tree.root.findAllByType(ListRow).some(n=>n.props.title==='다음 저장')).toBe(true);
});
it('keeps native collection failure notice and exits empty state after successful creation',async()=>{
 render(<CollectionFlowPreview tools/>);press('다음 저장 실패');act(()=>tree.root.findByType(ListDetailScreen).props.refresh.onAction());await tick();expect(text()).toContain('목록을 새로 불러오지 못했어요.');act(()=>tree.update(<HjmNativeProvider reducedMotion><CollectionFlowPreview key="empty" stateKind="empty"/></HjmNativeProvider>));press('새 기록');fill('제목','새 항목');fill('내용','본문');act(()=>tree.root.findByType(EditorScreen).props.submit.onAction());await tick();expect(tree.root.findByType(ListDetailScreen).props.state.kind).toBe('ready');
});
it('locks native editor input, preserves failed draft and restores saved snapshot when discarding',async()=>{
 render(<EditorFlowPreview tools/>);fill('제목','저장한 제목');press('다음 저장 실패');act(()=>tree.root.findByType(EditorScreen).props.submit.onAction());expect(field('제목').props.disabled).toBe(true);await tick();expect(field('제목').props.value).toBe('저장한 제목');act(()=>tree.root.findByType(EditorScreen).props.submit.onAction());await tick();fill('제목','버릴 제목');act(()=>tree.root.findByType(EditorScreen).props.cancel.onAction());press('다시 열기');expect(field('제목').props.value).toBe('저장한 제목');
});
it('retains native profile edits on failure and closes logout state before reopening the account',async()=>{
 render(<AccountFlowPreview tools/>);act(()=>tree.root.findByType(ProfileScreen).props.edit.onAction());fill('이름','새 이름');press('다음 저장 실패');act(()=>tree.root.findByType(EditorScreen).props.submit.onAction());await tick();expect(field('이름').props.value).toBe('새 이름');act(()=>tree.root.findByType(EditorScreen).props.submit.onAction());await tick();expect(text()).toContain('새 이름');act(()=>tree.root.findAllByType(IconButton).find(n=>n.props.label==='계정 메뉴')!.props.onPress());expect(tree.root.findByType(Sheet).props.returnFocusRef?.current).toBeTruthy();press('로그아웃');const alert=tree.root.findAllByType(AlertDialog).find(n=>n.props.open)!;act(()=>alert.props.onOpenChange(false));await tick();act(()=>tree.root.findAllByType(IconButton).find(n=>n.props.label==='계정 메뉴')!.props.onPress());press('로그아웃');act(()=>tree.root.findAllByType(AlertDialog).find(n=>n.props.open)!.props.request.onConfirm());press('다시 열기');expect(tree.root.findAllByType(AlertDialog).some(n=>n.props.open)).toBe(false);
});
it('retains shared native onboarding and moderation retry behavior',async()=>{
 render(<OnboardingFlowPreview tools initialStep={2}/>);press('다음 저장 실패');act(()=>tree.root.findByType(OnboardingScreen).props.complete.onAction());await tick();expect(text()).toContain('저장하지 못했어요.');press('다시 시도');await tick();expect(text()).toContain('시작할 준비가 됐어요');act(()=>tree.update(<HjmNativeProvider reducedMotion><ModerationFlowPreview tools/></HjmNativeProvider>));act(()=>tree.root.findByType(ModerationScreen).props.onReasonChange('spam'));press('다음 저장 실패');act(()=>tree.root.findByType(ModerationScreen).props.submit.onAction());await tick();expect(text()).toContain('저장하지 못했어요.');act(()=>tree.root.findByType(ModerationScreen).props.submit.onAction());await tick();expect(text()).toContain('신고를 접수했어요');
});
