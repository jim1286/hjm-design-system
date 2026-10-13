import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { SegmentedControl, SearchField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { AnimatedStatistic } from "@hjmds/react-native/statistic-motion";
import { ActivityHeatmap } from "@hjmds/react-native/activity-heatmap";
import dashboard from "../../../showcase/native/src/Dashboard.stories.js";
import gallery from "../../../showcase/native/src/DiscoveryGallery.stories.js";
const Dashboard = dashboard.component, Gallery = gallery.component;
let tree: ReactTestRenderer;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => act(() => tree?.unmount()));
const render = (screen: "dashboard" | "gallery") => act(() => { tree = create(<HjmNativeProvider reducedMotion>{screen === "dashboard" ? <Dashboard/> : <Gallery/>}</HjmNativeProvider>, {createNodeMock: element => String(element.type) === "Pressable" ? { label: typeof element.props === "object" && element.props !== null && "accessibilityLabel" in element.props ? element.props.accessibilityLabel : undefined } : null}); });
const button = (name: string) => tree.root.findAllByType(Button).find(node => (node.props.accessibilityLabel ?? node.props.children) === name)!;
const press = (name: string) => act(() => button(name).props.onPress());
const text = () => JSON.stringify(tree.toJSON());
it("updates dashboard totals and day view with period and recovers the empty month", () => {
 render("dashboard"); const stats = () => tree.root.findAllByType(AnimatedStatistic).map(node => node.props.value);
 expect(stats()).toEqual([7,6,125]); act(() => tree.root.findByType(SegmentedControl).props.onValueChange("week")); expect(stats()).toEqual([4,3,80]);
 expect(tree.root.findByType(ActivityHeatmap).props.descriptor.days).toHaveLength(7);
 press("날짜 목록으로 보기"); expect(tree.root.findByType(ActivityHeatmap).props.view).toBe("list");
 act(() => tree.root.findByType(SegmentedControl).props.onValueChange("empty")); expect(stats()).toEqual([0,0,0]); expect(text()).toContain("아직 기록이 없는 달이에요");
 press("9월 보기"); expect(stats()).toEqual([7,6,125]); expect(tree.root.findByType(ActivityHeatmap).props.view).toBe("list");
});
it("combines filters, resets empty results and shares saving between detail and cards", () => {
 render("gallery"); act(() => tree.root.findByType(SegmentedControl).props.onValueChange("모바일")); expect(text()).toContain("2개의 작품");
 act(() => tree.root.findByType(SearchField).props.onValueChange("없는 작품")); expect(text()).toContain("찾는 작품이 없어요"); press("필터 초기화");
 expect(tree.root.findByType(SearchField).props.value).toBe(""); expect(text()).toContain("6개의 작품");
 press("초록을 기록하는 하루 보기"); const sheet = tree.root.findByType(Sheet);
 act(() => sheet.props.footer.props.onPress()); expect(button("저장한 작품 1")).toBeDefined(); expect(tree.root.findByType(Sheet).props.footer.props.selected).toBe(true);
 act(() => sheet.props.onOpenChange(false)); press("저장한 작품 1"); expect(text()).toContain("1개의 작품"); press("초록을 기록하는 하루 저장 취소"); expect(text()).toContain("찾는 작품이 없어요");
});
it("applies each rapid sort and saved-only host toggle rather than reusing an old captured value", () => {
 render("gallery"); act(() => { const callback = button("정렬: 인기순").props.onPress; callback(); callback(); }); expect(button("정렬: 인기순")).toBeDefined();
 act(() => { const callback = button("저장한 작품 0").props.onPress; callback(); callback(); }); expect(button("저장한 작품 0").props.selected).toBe(false); expect(text()).toContain("6개의 작품");
});

it("provides a stable sheet return target after its saved-only origin disappears", () => {
 render("gallery"); press("초록을 기록하는 하루 저장"); press("저장한 작품 1"); press("초록을 기록하는 하루 보기");
 const sheet = tree.root.findByType(Sheet); expect(sheet.props.returnFocusRef.current.label).toBe("초록을 기록하는 하루 보기");
 act(() => sheet.props.footer.props.onPress()); act(() => sheet.props.onOpenChange(false));
 expect(tree.root.findByType(Sheet).props.returnFocusRef.current).not.toBeNull();
 expect(tree.root.findByType(Sheet).props.returnFocusRef.current.label).toBe("저장한 작품 0");
 expect(button("저장한 작품 0").props.selected).toBe(true);
});
