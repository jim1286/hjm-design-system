import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { TextInput } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { UploadItem } from "../src/upload-item.js";
import { MediaSelectionScreen, type MediaSelectionItem, type MediaSelectionScreenProps } from "../src/screen-flows.js";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const item = (id: string): MediaSelectionItem => ({ descriptor: { id, name: `${id}.jpg`, state: { status: "success" } }, preview: <TextInput accessibilityLabel={`${id} 설명`} defaultValue="초안" /> });
const props = {
 title: "선택 사진", add: { label: "사진 추가", icon: "+", onAction: vi.fn() }, done: { label: "완료", onAction: vi.fn() },
 labels: { pending: "대기", uploading: "업로드", success: "완료됨", cancel: "업로드 취소", retry: "업로드 재시도" },
 actionLabels: { remove: "제거", moveUp: "앞으로", moveDown: "뒤로" },
 removeLabel: (item: MediaSelectionItem) => `${item.descriptor.id} 제거`, moveUpLabel: (item: MediaSelectionItem) => `${item.descriptor.id} 앞으로`, moveDownLabel: (item: MediaSelectionItem) => `${item.descriptor.id} 뒤로`,
 onRemove: vi.fn(), onMove: vi.fn(), onRetry: vi.fn(), onCancel: vi.fn(),
};
const render = (items: MediaSelectionItem[], extra: Partial<MediaSelectionScreenProps> = {}) => act(() => {
 const element = <HjmNativeProvider reducedMotion><MediaSelectionScreen {...props} items={items} {...extra} /></HjmNativeProvider>;
 if (tree) tree.update(element); else tree = create(element);
});
const button = (name: string) => tree!.root.findAllByType(Button).find(node => node.props.accessibilityLabel === name)!;
it("retains keyed native previews across reorder and applies boundary actions by current id", () => {
 const move = vi.fn(), remove = vi.fn();
 render([item("a"), item("b"), item("c")], { onMove: move, onRemove: remove });
 const input = tree!.root.findAllByType(TextInput).find(node => node.props.accessibilityLabel === "b 설명");
 expect(button("a 앞으로").props.disabled).toBe(true); expect(button("c 뒤로").props.disabled).toBe(true);
 act(() => button("b 앞으로").props.onPress()); expect(move).toHaveBeenCalledExactlyOnceWith("b", -1);
 render([item("b"), item("a"), item("c")], { onMove: move, onRemove: remove });
 expect(tree!.root.findAllByType(TextInput).find(node => node.props.accessibilityLabel === "b 설명")).toBe(input);
 expect(button("b 앞으로").props.disabled).toBe(true); expect(button("a 앞으로").props.disabled).toBe(false);
 act(() => button("a 제거").props.onPress()); expect(remove).toHaveBeenCalledExactlyOnceWith("a");
 expect(tree!.root.findAllByType(UploadItem)).toHaveLength(3);
});
it("keeps native library and completion policy under product control", () => {
 const done = vi.fn();
 render([item("a")], { done: { label: "완료", onAction: done, disabled: true } });
 const action = () => tree!.root.findAllByType(Button).find(node => node.props.children === "완료")!;
 expect(action().props.disabled).toBe(true); expect(done).not.toHaveBeenCalled();
 render([], { library: <TextInput accessibilityLabel="제품 라이브러리" />, done: { label: "완료", onAction: done } });
 expect(tree!.root.findAllByType(UploadItem)).toHaveLength(0);
 expect(tree!.root.findByType(TextInput).props.accessibilityLabel).toBe("제품 라이브러리");
 act(() => action().props.onPress()); expect(done).toHaveBeenCalledOnce();
});
// 2026-10-18 Utilverse photo tools: the screen's own cell renders standalone (FlatList renderItem) and can rotate.
it("renders the exported cell standalone with rotate before remove", async () => {
 const { MediaSelectionCell } = await import("../src/screen-flows.js");
 const onRotate = vi.fn();
 act(() => { tree = create(<HjmNativeProvider reducedMotion><MediaSelectionCell {...props} item={item("b")} index={4} count={5} rotate={{ label: "회전", itemLabel: entry => `${entry.descriptor.id} 회전`, onRotate }} /></HjmNativeProvider>); });
 expect(tree!.root.findAllByType(Button).map(node => node.props.accessibilityLabel)).toEqual(["b 앞으로", "b 뒤로", "b 회전", "b 제거"]);
 expect(button("b 뒤로").props.disabled).toBe(true);
 act(() => button("b 회전").props.onPress());
 expect(onRotate).toHaveBeenCalledExactlyOnceWith("b");
});
// 2026-10-18 Utilverse photo-to-PDF/strip: a running job locks move/rotate/remove; the upload's own actions stay live.
it("locks item edits on the screen and the standalone cell while the host job runs", async () => {
 const { MediaSelectionCell } = await import("../src/screen-flows.js");
 render([item("a"), item("b"), item("c")], { disabled: true, rotate: { label: "회전", itemLabel: entry => `${entry.descriptor.id} 회전`, onRotate: vi.fn() } });
 for (const name of ["b 앞으로", "b 뒤로", "b 회전", "b 제거"]) expect(button(name).props.disabled).toBe(true);
 act(() => tree!.unmount()); tree = undefined;
 const onCancel = vi.fn();
 const uploading: MediaSelectionItem = { descriptor: { id: "b", name: "b.jpg", state: { status: "uploading", progress: 0.5 } } };
 act(() => { tree = create(<HjmNativeProvider reducedMotion><MediaSelectionCell {...props} onCancel={onCancel} item={uploading} index={1} count={3} disabled /></HjmNativeProvider>); });
 for (const name of ["b 앞으로", "b 뒤로", "b 제거"]) expect(button(name).props.disabled).toBe(true);
 const cancel = tree!.root.findAllByType(Button).find(node => node.props.children === "업로드 취소" || node.props.accessibilityLabel === "업로드 취소");
 expect(cancel?.props.disabled).toBeFalsy();
});
