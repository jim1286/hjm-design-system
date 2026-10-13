import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { TextField } from "@hjmds/react-native/inputs";
import { Button } from "@hjmds/react-native/actions";
import { ProductBentoPreview } from "../../../showcase/native/src/reference-adoption-previews.js";
let tree: ReactTestRenderer;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
beforeEach(() => act(() => {tree=create(<HjmNativeProvider reducedMotion><ProductBentoPreview/></HjmNativeProvider>);}));
afterEach(() => act(() => tree.unmount()));
const cta=()=>tree.root.findByType(BottomCTA).props;
const primary=()=>act(()=>cta().primaryAction.onPress());
const secondary=()=>act(()=>cta().secondaryAction.onPress());
const input=(value:string)=>act(()=>tree.root.findByType(TextField).props.onValueChange(value));
const text=()=>JSON.stringify(tree.toJSON());
const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,400));});
it("opens guidance, preserves hidden draft and blocks empty submission",()=>{
 secondary();expect(text()).toContain("다른 사람에게 전송되지는 않아요");secondary();expect(text()).not.toContain("다른 사람에게 전송되지는 않아요");
 primary();expect(cta().primaryAction.disabled).toBe(true);input("임시 제목");secondary();expect(tree.root.findAllByType(TextField)).toHaveLength(0);primary();expect(tree.root.findByType(TextField).props.value).toBe("임시 제목");input("   ");expect(cta().primaryAction.disabled).toBe(true);
});
it("guards pending back/duplicate actions and distinguishes the new draft from saved snapshot",async()=>{
 primary();input(" 첫 제목 ");act(()=>{const save=cta().primaryAction.onPress;save();save();});expect(cta().secondaryAction.disabled).toBe(true);
 // A queued host callback still observes the current session lock.
 secondary();expect(tree.root.findAllByType(TextField)).toHaveLength(1);
 input("다음 제목");await settle();expect(text()).toContain("저장된 제목: ");expect(text()).toContain("첫 제목");expect(text()).toContain("현재 제목은 아직 저장하지 않았어요");
 primary();await settle();expect(cta().primaryAction.label).toBe("저장했어요");expect(cta().primaryAction.disabled).toBe(true);
});
it("keeps the last saved title on failure and saves the current retry draft",async()=>{
 primary();input("첫 제목");primary();await settle();input("실패할 제목");act(()=>tree.root.findAllByType(Button).find(node=>node.props.children==="다음 저장 실패 체험")!.props.onPress());primary();await settle();
 expect(text()).toContain("저장하지 못했어요");expect(text()).toContain("첫 제목");expect(tree.root.findByType(TextField).props.value).toBe("실패할 제목");
 input("다시 쓴 제목");primary();await settle();expect(text()).not.toContain("저장하지 못했어요");expect(text()).toContain("다시 쓴 제목");
});
