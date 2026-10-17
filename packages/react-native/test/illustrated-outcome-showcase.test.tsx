import { createRequire } from 'node:module';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { AccessibilityInfo, Image, Platform } from 'react-native';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button, IconButton } from '@hjmds/react-native/actions';
import { TextField } from '@hjmds/react-native/inputs';
import { OnboardingScreen } from '@hjmds/react-native/screen-flows';
import { Result } from '@hjmds/react-native/feedback';
import { Chip } from "@hjmds/react-native/inputs";
const nodeRequire=createRequire(import.meta.url);
const paths=['notebook','tick'].map(name=>nodeRequire.resolve(`../../../showcase/shared/assets/reference-icons/${name}.png`));
const previousPng=nodeRequire.extensions['.png'],previousAssets=paths.map(path=>nodeRequire.cache[path]);
let Preview:typeof import('../../../showcase/native/src/illustrated-outcome-preview').IllustratedOutcomePreview;
// Metro returns opaque image IDs. Keep real owner state and image error callbacks; do not decode PNGs in Node.
beforeAll(async()=>{nodeRequire.extensions['.png']=module=>{module.exports=1;};Preview=(await import('../../../showcase/native/src/illustrated-outcome-preview')).IllustratedOutcomePreview;});
afterAll(()=>{if(previousPng)nodeRequire.extensions['.png']=previousPng;else delete nodeRequire.extensions['.png'];paths.forEach((path,index)=>{const previous=previousAssets[index];if(previous)nodeRequire.cache[path]=previous;else delete nodeRequire.cache[path];});});
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;const originalOS=Platform.OS;
afterEach(async()=>{if(tree)await act(async()=>tree.unmount());vi.restoreAllMocks();Object.defineProperty(Platform,'OS',{value:originalOS,configurable:true,writable:true});});
const render=()=>act(async()=>{tree=create(<HjmNativeProvider reducedMotion><Preview/></HjmNativeProvider>);});
// Demo controls live in PreviewTools now: one-shot tools stay Buttons, toggles are Chips and tool actions are IconButtons.
const button=(label:string)=>tree.root.findAllByType(Button).find(node=>node.props.children===label)??tree.root.findAllByType(Chip).find(node=>node.props.label===label)??tree.root.findAllByType(IconButton).find(node=>node.props.label===label)!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const field=()=>tree.root.findByType(TextField);
const edit=(value:string)=>act(()=>field().props.onValueChange(value));
it('keeps the local draft across back, completion and a new walkthrough',async()=>{
 await render();press('기록 시작하기');press('다음');edit('  ');expect(tree.root.findByType(OnboardingScreen).props.complete.disabled).toBe(true);edit('첫 산책');press('이전');press('다음');expect(field().props.value).toBe('첫 산책');press('체험 완료');expect(tree.root.findByType(Result).props.description).toContain('첫 산책');expect(tree.root.findByType(Result).props.accessibilityLiveRegion).toBe('polite');press('다시 체험하기');press('기록 시작하기');press('다음');expect(field().props.value).toBe('첫 산책');
});
it('removes only failed decorative images and keeps artwork toggles independent from the draft',async()=>{
 await render();expect(tree.root.findByType(Image).props.accessible).toBe(false);act(()=>tree.root.findByType(Image).props.onError());expect(tree.root.findAllByType(Image)).toHaveLength(0);press('기록 시작하기');press('다음');edit('그림 없는 기록');press('그림 없이 보기');expect(field().props.value).toBe('그림 없는 기록');press('그림 없이 보기');press('체험 완료');act(()=>tree.root.findByType(Image).props.onError());expect(tree.root.findAllByType(Image)).toHaveLength(0);expect(tree.root.findByType(Result).props.description).toContain('그림 없는 기록');press('다시 체험하기');expect(Boolean(button('기록 시작하기'))).toBe(true);
});
it('announces a completed walkthrough once on iOS and keeps result actions individually accessible',async()=>{
 Object.defineProperty(Platform,'OS',{value:'ios',configurable:true,writable:true});const announce=vi.spyOn(AccessibilityInfo,'announceForAccessibilityWithOptions');await render();expect(announce).not.toHaveBeenCalled();press('기록 시작하기');press('다음');edit('알릴 기록');press('체험 완료');expect(announce).toHaveBeenCalledExactlyOnceWith('시작할 준비가 됐어요. 입력한 제목: 알릴 기록. 이 체험에서는 서버에 저장하지 않아요.',{queue:true});press('그림 없이 보기');expect(announce).toHaveBeenCalledOnce();expect(tree.root.findByType(Result).props.accessible).not.toBe(true);expect(Boolean(button('다시 체험하기'))).toBe(true);
});
