import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { Switch } from "@hjmds/react-native/inputs";
import meta from "../../../showcase/native/src/NotificationSettings.stories.js";
const Screen = meta.component;
let tree: ReactTestRenderer;
beforeEach(() => {
 (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 act(() => { tree = create(<HjmNativeProvider reducedMotion><Screen/></HjmNativeProvider>); });
});
afterEach(() => act(() => tree.unmount()));
const action = () => tree.root.findByType(BottomCTA).props.primaryAction;
const toggle = (label: string) => act(() => { const control = tree.root.findAllByType(Switch).find(node => node.props.label === label)!; control.props.onCheckedChange(!control.props.checked); });
const text = () => JSON.stringify(tree.toJSON());
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 400)); });
it("restores clean state on revert and guards duplicate host saves while preserving newer draft", async () => {
 expect(action().disabled).toBe(true);
 toggle("주간 모아보기"); expect(action().disabled).toBe(false);
 toggle("주간 모아보기"); expect(action().disabled).toBe(true);
 toggle("주간 모아보기"); act(() => { const press = action().onPress; press(); press(); });
 expect(action().loading).toBe(true); expect(action().label).toBe("저장 중");
 expect(tree.root.findAllByType(Switch).find(node => node.props.label === "다음 저장 실패시키기")!.props.disabled).toBe(true);
 toggle("내 활동 알림"); await settle();
 expect(text()).toContain("저장된 설정: 내 활동 켜짐 · 주간 모아보기 켜짐");
 expect(text()).toContain("새로 바꾼 설정은 아직 저장하지 않았어요"); expect(action().disabled).toBe(false);
 act(() => action().onPress()); await settle();
 expect(text()).toContain("저장된 설정: 내 활동 꺼짐 · 주간 모아보기 켜짐"); expect(action().disabled).toBe(true);
});
it("retains selected values after failure and retries current draft through the bottom action", async () => {
 toggle("주간 모아보기"); toggle("다음 저장 실패시키기"); act(() => action().onPress()); await settle();
 expect(text()).toContain("저장하지 못했어요"); expect(text()).toContain("저장된 설정: 내 활동 켜짐 · 주간 모아보기 꺼짐");
 toggle("내 활동 알림"); act(() => action().onPress()); await settle();
 expect(text()).not.toContain("저장하지 못했어요"); expect(text()).toContain("저장된 설정: 내 활동 꺼짐 · 주간 모아보기 켜짐"); expect(action().disabled).toBe(true);
});
