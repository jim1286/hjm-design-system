import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Dialog, AlertDialog } from "@hjmds/react-native/overlays";
import { DialogExample, AlertDialogExample } from "../../../showcase/native/src/dialog-examples.js";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });
const text = () => JSON.stringify(tree.toJSON());
const button = (label: string) => tree.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(async () => {
 const target = button(label) ?? tree.root.findAll(node => String(node.type) === 'Pressable' && node.props.accessibilityLabel === label)[0]!;
 await target.props.onPress();
});
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 40)); });
it("previews native rename cancellation, retained draft, empty guard and saved result", async () => {
 act(() => { tree = create(<HjmNativeProvider reducedMotion><DialogExample/></HjmNativeProvider>); });
 await press('이름 바꾸기'); expect(tree.root.findByType(Dialog).props.primaryAction.disabled).toBe(true);
 act(() => tree.root.findByType(TextField).props.onValueChange('새 앨범')); await press('취소');
 expect(tree.root.findByType(Dialog).props.open).toBe(false); expect(text()).toContain('주말 산책'); expect(text()).toContain('저장하지 않았어요.');
 await press('이름 바꾸기'); expect(tree.root.findByType(TextField).props.value).toBe('새 앨범');
 act(() => tree.root.findByType(TextField).props.onValueChange('   ')); expect(tree.root.findByType(Dialog).props.primaryAction.disabled).toBe(true);
 act(() => tree.root.findByType(TextField).props.onValueChange('  새 앨범  ')); await press('저장');
 expect(tree.root.findByType(Dialog).props.open).toBe(false); expect(text()).toContain('새 앨범'); expect(text()).toContain('이름을 저장했어요.');
});
it("previews native cancel and confirm with a named deletion and repeatable example", async () => {
 act(() => { tree = create(<HjmNativeProvider reducedMotion><AlertDialogExample/></HjmNativeProvider>); });
 await press('기록 삭제하기'); expect(tree.root.findByType(AlertDialog).props.request.title).toBe('주말 산책 기록을 삭제할까요?'); await press('취소'); await settle();
 expect(text()).toContain('보관된 기록: 주말 산책'); expect(text()).toContain('삭제를 취소했어요.');
 await press('기록 삭제하기'); await press('기록 삭제'); await settle();
 expect(tree.root.findByType(AlertDialog).props.open).toBe(false); expect(text()).toContain('보관된 기록이 없어요.'); expect(text()).toContain('주말 산책 기록을 삭제했어요.');
 await press('예제 기록 다시 만들기'); expect(text()).toContain('보관된 기록: 주말 산책');
});
