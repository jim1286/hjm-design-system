import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button, IconButton } from '@hjmds/react-native/actions';
import { TextField } from '@hjmds/react-native/inputs';
import { FilePicker } from '@hjmds/react-native/file-picker';
import { UploadItem } from '@hjmds/react-native/upload-item';
import { resolveFilePickerSelection } from '@hjmds/design-contracts/components/file-picker';
import { ActionFeedbackPreview, UploadRecoveryPreview } from '../../../showcase/native/src/reference-adoption-previews';
import { Chip } from "@hjmds/react-native/inputs";
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;afterEach(()=>{if(tree)act(()=>tree.unmount());});
const render=(ui:ReactNode)=>act(()=>{tree=create(<HjmNativeProvider reducedMotion>{ui}</HjmNativeProvider>);});
// Demo controls live in PreviewTools now: one-shot tools stay Buttons, toggles are Chips and tool actions are IconButtons.
const button=(label:string)=>tree.root.findAllByType(Button).find(node=>node.props.children===label)??tree.root.findAllByType(Chip).find(node=>node.props.label===label)??tree.root.findAllByType(IconButton).find(node=>node.props.label===label)!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,400));});
const fill=(value:string)=>act(()=>tree.root.findByType(TextField).props.onValueChange(value));
const text=()=>tree.root.findAll(node=>String(node.type)==='Text').map(node=>node.children.filter(child=>typeof child==='string').join('')).join(' ');
const file=(id:string)=>({id,name:id+'.jpg',mimeType:'image/jpeg',sizeBytes:5});
const pick=(ids:string[])=>{const props=tree.root.findByType(FilePicker).props;props.onSelect(resolveFilePickerSelection(ids.map(file),props.descriptor,props.existingCount));};
it('distinguishes native current draft from the completed snapshot and retries current edited value',async()=>{
 render(<ActionFeedbackPreview/>);fill('이전 제목');press('기록 저장');fill('현재 제목');await settle();expect(text()).toContain('현재 제목은 아직 저장하지 않았어요.');expect(text()).toContain('저장한 제목: 이전 제목');expect(button('✓ 다시 저장')).toBeUndefined();press('다음 저장 실패시키기');press('기록 저장');await settle();expect(text()).toContain('저장하지 못했어요.');fill('수정 제목');press('기록 저장');await settle();expect(text()).toContain('저장한 제목: 수정 제목');
});
it('deduplicates native accepted and count-rejected candidates before counting capacity',()=>{render(<UploadRecoveryPreview/>);act(()=>pick(['a','b']));act(()=>pick(['a','c']));expect(tree.root.findAllByType(UploadItem)).toHaveLength(3);expect(text()).toContain('c.jpg');});
it('bounds two synchronous native selection callbacks to three files',()=>{render(<UploadRecoveryPreview/>);act(()=>{pick(['a','b']);pick(['c','d']);});expect(tree.root.findAllByType(UploadItem)).toHaveLength(3);});
it('ignores late responses after cancel, retry and removing then reselecting the same file',()=>{
 render(<UploadRecoveryPreview/>);press('예제 사진 추가');press('전송 시작');const success=button('성공 응답 보내기').props.onPress;const upload=tree.root.findByType(UploadItem);act(()=>upload.props.onCancel(upload.props.descriptor.id));act(()=>success());expect(tree.root.findByType(UploadItem).props.descriptor.state.status).toBe('pending');
 press('전송 시작');press('실패 응답 보내기');const error=tree.root.findByType(UploadItem);act(()=>error.props.onRetry(error.props.descriptor.id));act(()=>success());expect(tree.root.findByType(UploadItem).props.descriptor.state.status).toBe('uploading');const current=tree.root.findByType(UploadItem);act(()=>current.props.onCancel(current.props.descriptor.id));press('선택에서 제거');press('예제 사진 추가');act(()=>success());expect(tree.root.findByType(UploadItem).props.descriptor.state.status).toBe('pending');
});
it('keeps native type and size rejections while preserving an active file across unrelated selection',()=>{
 render(<UploadRecoveryPreview/>);press('예제 사진 추가');press('전송 시작');const success=button('성공 응답 보내기').props.onPress;const props=tree.root.findByType(FilePicker).props;act(()=>props.onSelect(resolveFilePickerSelection([file('valid'),{...file('text'),mimeType:'text/plain'},{...file('large'),sizeBytes:5*1024*1024+1}],props.descriptor,props.existingCount)));expect(tree.root.findAllByType(UploadItem)).toHaveLength(2);expect(text()).toContain('추가하지 못한 파일');act(()=>success());expect(tree.root.findAllByType(UploadItem)[0]!.props.descriptor.state.status).toBe('success');
});
