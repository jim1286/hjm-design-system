import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AccessibilityInfo } from "react-native";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Switch, TextField } from "@hjmds/react-native/inputs";
import { Button } from "@hjmds/react-native/actions";
import { FirstTask, RecoverableSettings, SelectionReview } from "../../../showcase/native/src/reference-flow-previews.js";
let tree: ReactTestRenderer;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const focus=vi.fn();
beforeEach(()=>{focus.mockClear();vi.stubGlobal("requestAnimationFrame",(callback:()=>void)=>setTimeout(callback,0));vi.stubGlobal("cancelAnimationFrame",clearTimeout);});
afterEach(()=>{if(tree)act(()=>tree.unmount());vi.unstubAllGlobals();vi.restoreAllMocks();});
const render=(Component:typeof FirstTask)=>act(()=>{tree=create(<HjmNativeProvider reducedMotion><Component/></HjmNativeProvider>,{createNodeMock:()=>({focus})});});
const button=(label:string)=>tree.root.findAllByType(Button).find(node=>node.props.children===label)!;
const press=(label:string)=>act(()=>{const target=button(label);if(!target)throw new Error(`Missing ${label}: ${tree.root.findAllByType(Button).map(node=>node.props.children).join(",")}`);target.props.onPress();});
const field=()=>tree.root.findByType(TextField);
const input=(value:string)=>act(()=>field().props.onValueChange(value));
const text=()=>JSON.stringify(tree.toJSON());
const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,420));});
const notification=()=>tree.root.findByType(Switch);
it("first task bounds repeated back and composes repeated notification toggles",()=>{
 render(FirstTask);press("이 주제로 기록하기");expect(notification().props.checked).toBe(true);act(()=>{const toggle=notification().props.onCheckedChange;toggle(false);toggle(true);});expect(notification().props.checked).toBe(true);act(()=>notification().props.onCheckedChange(false));expect(notification().props.checked).toBe(false);
 act(()=>{const back=button("이전 단계").props.onPress;back();back();});expect(text()).toContain("1단계 · 주제");
});
it("settings protects submitted data from queued editing, revert and leave callbacks",async()=>{
 render(RecoverableSettings);input("제출 제목");const edit=field().props.onValueChange, leave=button("설정 나가기").props.onPress,revert=button("변경 되돌리기").props.onPress,save=button("변경 내용 저장").props.onPress;
 act(()=>{save();save();edit("늦은 제목");revert();leave();});expect(field().props.value).toBe("제출 제목");expect(field().props.disabled).toBe(true);await settle();expect(text()).toContain("변경 내용을 저장했어요");expect(text()).toContain("제출 제목");press("계속 수정하기");expect(field().props.value).toBe("제출 제목");
 input("폐기 제목");press("설정 나가기");press("계속 수정");await settle();expect(field().props.value).toBe("폐기 제목");press("설정 나가기");press("변경 버리고 나가기");press("이어하기");expect(field().props.value).toBe("제출 제목");
});
it("review retains draft across pause, failed submission and edited retry",async()=>{
 render(SelectionReview);press("기록 확인");expect(field().props.error).toBe("이름이나 내용을 입력해 주세요.");expect(focus).toHaveBeenCalledOnce();input("첫 제목");press("초안 남기고 쉬기");press("이어하기");expect(field().props.value).toBe("첫 제목");press("기록 확인");press("다음 저장 실패시키기");press("이 내용으로 확정");await settle();expect(text()).toContain("저장하지 못했어요");press("내용 수정");input("새 제목");press("기록 확인");press("이 내용으로 확정");await settle();expect(text()).toContain("선택한 내용을 확정했어요");expect(text()).toContain("새 제목");press("저장한 기록 보기");expect(text()).toContain("저장한 기록의 상세 내용입니다");
});

it("moves native accessibility focus after navigation and cancels the frame on unmount",async()=>{
 const focusAccessibility=vi.spyOn(AccessibilityInfo,"setAccessibilityFocus");render(FirstTask);press("이 주제로 기록하기");await act(async()=>{await new Promise(resolve=>setTimeout(resolve,10));});expect(focusAccessibility).toHaveBeenCalledWith(1);focusAccessibility.mockClear();press("초안 남기고 쉬기");act(()=>tree.unmount());await new Promise(resolve=>setTimeout(resolve,10));expect(focusAccessibility).not.toHaveBeenCalled();
});
