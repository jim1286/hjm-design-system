import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import inputSheet from "../../../showcase/native/src/InputSheet.stories";
import familyDrawer from "../../../showcase/native/src/FamilyDrawer.stories";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
const InputSheet = inputSheet.component, FamilyDrawer = familyDrawer.component;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); vi.useRealTimers(); });
const button = (label: string) => tree.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());
const close = () => act(() => tree.root.findByType(Sheet).props.onOpenChange(false));
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(420); });

it("keeps the native input sheet pending and retains its draft for failure recovery", async () => {
  vi.useFakeTimers();
  act(() => { tree = create(<HjmNativeProvider><InputSheet /></HjmNativeProvider>); });
  // The failure tool sits outside the sheet body (SELECTION.md 조립 규칙), so it is armed before opening.
  press("다음 저장 실패시키기"); expect(button("다음 저장 실패시키기").props.selected).toBe(true);
  press("입력 시트 열기"); expect(button("저장").props.disabled).toBe(true);
  act(() => tree.root.findByType(TextField).props.onValueChange("남길 이름"));
  press("저장");
  expect(tree.root.findByType(TextField).props.disabled).toBe(true);
  close(); expect(tree.root.findByType(Sheet).props.open).toBe(true);
  await settle(); expect(JSON.stringify(tree.toJSON())).toContain("저장하지 못했어요.");
  close(); await settle(); press("입력 시트 열기"); await settle();
  expect(tree.root.findByType(TextField).props.value).toBe("남길 이름");
  press("다시 저장"); await settle();
  expect(tree.root.findByType(Sheet).props.open).toBe(false);
  expect(JSON.stringify(tree.toJSON())).toContain("남길 이름");
});

it("resumes a failed native drawer and resets only after confirmed completion", async () => {
  vi.useFakeTimers();
  act(() => { tree = create(<HjmNativeProvider><FamilyDrawer /></HjmNativeProvider>); });
  press("다음 저장 실패시키기"); press("공간 설정하기"); press("계속"); press("계속");
  expect(button("다음 저장 실패시키기").props.selected).toBe(true); press("설정 마치기");
  expect(button("이전").props.disabled).toBe(true);
  close(); expect(tree.root.findByType(Sheet).props.open).toBe(true);
  await settle(); close(); await settle(); press("공간 설정하기"); await settle();
  expect(button("다시 저장")).toBeDefined();
  press("다시 저장"); await settle();
  expect(tree.root.findByType(Sheet).props.open).toBe(false);
  press("공간 설정하기"); await settle();
  expect(button("이전").props.disabled).toBe(true);
  expect(button("계속")).toBeDefined();
});
