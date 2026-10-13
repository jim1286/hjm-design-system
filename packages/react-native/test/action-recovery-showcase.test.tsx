import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { SaveRecoveryPreview, OptimisticRecoveryPreview, UndoRecoveryPreview } from "../../../showcase/native/src/action-recovery-previews.js";
let tree: ReactTestRenderer;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(()=>act(()=>tree?.unmount()));
const render=(kind:"save"|"optimistic"|"undo")=>act(()=>{tree=create(<HjmNativeProvider reducedMotion>{kind==="save"?<SaveRecoveryPreview/>:kind==="optimistic"?<OptimisticRecoveryPreview/>:<UndoRecoveryPreview/>}</HjmNativeProvider>);});
const button=(label:string)=>tree.root.findAllByType(Button).find(node=>node.props.children===label)!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const fill=(value:string)=>act(()=>tree.root.findByType(TextField).props.onValueChange(value));
const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,400));});
const text=()=>JSON.stringify(tree.toJSON());
it("distinguishes saved snapshots from current edits and retries the failed snapshot",async()=>{
 render("save");fill("提出 A");press("저장");fill("編集中 B");await settle();expect(text()).toContain("提出 A");expect(text()).toContain("현재 입력은 아직 저장하지 않았어요");expect(tree.root.findByType(TextField).props.value).toBe("編集中 B");
 press("다음 요청 실패시키기");press("저장");await settle();fill("편집 C");press("실패한 내용 다시 저장");await settle();expect(text()).toContain("編集中 B");expect(tree.root.findByType(TextField).props.value).toBe("편집 C");
 press("저장");await settle();expect(text()).toContain("저장했어요.");
});
it("rolls back optimistic failure and discards a response superseded by refresh",async()=>{
 render("optimistic");press("다음 요청 실패시키기");press("북마크 추가");expect(button("북마크 해제").props.selected).toBe(true);await settle();expect(button("북마크 추가").props.selected).toBe(false);
 press("북마크 다시 반영");press("서버에서 새 상태 불러오기");await settle();expect(button("북마크 추가").props.selected).toBe(false);expect(button("북마크 다시 반영")).toBeUndefined();
});
it("keeps archived state until undo confirms and blocks same-render duplicate work",async()=>{
 render("undo");act(()=>{const action=button("보관").props.onPress;action();action();});expect(text()).toContain("목록: 리서치 메모");await settle();expect(text()).toContain("보관함: 리서치 메모");
 press("다음 요청 실패시키기");press("실행 취소");await settle();expect(text()).toContain("보관함: 리서치 메모");press("실패한 작업 다시 시도");await settle();expect(text()).toContain("목록: 리서치 메모");
});
