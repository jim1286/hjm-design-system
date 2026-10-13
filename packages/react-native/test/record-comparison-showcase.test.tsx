import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { SearchField, SegmentedControl } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { RecordComparison } from "../../../showcase/native/src/reference-flow-previews.js";
import { records } from "../../../showcase/shared/reference-flows.js";
let tree: ReactTestRenderer; let hostId=0;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => act(() => tree?.unmount()));
const render = () => act(() => { tree=create(<HjmNativeProvider reducedMotion><RecordComparison/></HjmNativeProvider>, {createNodeMock: element => String(element.type) === "View" ? { hostId: ++hostId } : null}); });
const button = (name: string) => tree.root.findAllByType(Button).find(node => node.props.children === name)!;
const press = (name: string) => act(() => button(name).props.onPress());
const query = (value: string) => act(() => tree.root.findByType(SearchField).props.onValueChange(value));
const mode = (value: string) => act(() => tree.root.findByType(SegmentedControl).props.onValueChange(value));
const text = () => JSON.stringify(tree.toJSON());
it("preserves query and saves in every mode, including the record without an image", () => {
 render(); press("책에서 만난 한 문장 저장"); query("  책에서   문장  ");
 for (const display of ["reading","image","list"]) {
  mode(display); expect(tree.root.findByType(SearchField).props.value).toBe("  책에서   문장  "); expect(button("책에서 만난 한 문장 저장 취소").props.selected).toBe(true);
  expect(text().includes(records[1].body)).toBe(display !== "list");
 }
 query("없는 기록"); expect(text()).toContain("찾는 기록이 없어요"); press("검색 초기화"); expect(tree.root.findByType(SearchField).props.value).toBe(""); expect(text()).toContain("목록 중심 · 3개의 기록 · 1개 저장");
});
it("freezes the detail return host across its footer action and keeps search and saves", () => {
 render(); query("바다"); press("바다가 보이는 자리 저장"); press("바다가 보이는 자리 읽기");
 const sheet=tree.root.findByType(Sheet), origin=sheet.props.returnFocusRef.current; expect(origin).not.toBeNull(); expect(text()).toContain(records[2].body);
 press("읽기 마치기"); expect(tree.root.findByType(Sheet).props.open).toBe(false); expect(tree.root.findByType(Sheet).props.returnFocusRef.current).toBe(origin);
 expect(tree.root.findByType(SearchField).props.value).toBe("바다"); expect(button("바다가 보이는 자리 저장 취소").props.selected).toBe(true);
 press("바다가 보이는 자리 읽기"); act(() => tree.root.findByType(Sheet).props.onOpenChange(false)); expect(tree.root.findByType(Sheet).props.open).toBe(false);
});
it("applies every same-render saved toggle", () => {
 render(); act(() => { const callback=button("비 온 뒤의 산책 저장").props.onPress; callback(); callback(); }); expect(button("비 온 뒤의 산책 저장").props.selected).toBe(false); expect(text()).toContain("0개 저장");
});
