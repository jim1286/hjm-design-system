import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Path: View, Circle: View }; });
import { ToggleFeedbackButton } from "../src/toggle-feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { AnimatedStatistic } from "../src/statistic-motion.js";
import { AppState, startedAnimatedTimings } from "./react-native.mock.js";
import { toggleFeedbackRecipe } from "@hjmds/design-contracts/toggle-feedback";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const labels = { select: "선택", selected: "선택됨", pending: "처리 중", count: "인원", error: "변경 실패" };
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.restoreAllMocks(); AppState.currentState = "active"; });
it("guards pending presses and restores updated confirmed counts; entity changes detach old failures", async () => {
 let fail!: (error: Error) => void; const change = vi.fn(() => new Promise<void>((_, reject) => { fail = reject; }));
 const view = (id: string, count: number) => <HjmNativeProvider reducedMotion><ToggleFeedbackButton entityId={id} state={{ selected: false, count }} effect="burst" locale="ko-KR" labels={labels} onSelectedChange={change} /></HjmNativeProvider>;
 act(() => { tree = create(view("a", 10)); }); const press = tree!.root.findByType(Button).props.onPress; act(() => { press(); press(); }); expect(change).toHaveBeenCalledExactlyOnceWith(true); expect(tree!.root.findByType(AnimatedStatistic).props.value).toBe(11);
 act(() => tree!.update(view("a", 20))); expect(tree!.root.findByType(AnimatedStatistic).props.value).toBe(11); await act(async () => fail(new Error("failed"))); expect(tree!.root.findByType(AnimatedStatistic).props.value).toBe(20); expect(tree!.root.findByType(Button).props.selected).toBe(false);
 act(() => tree!.root.findByType(Button).props.onPress()); act(() => tree!.update(view("b", 2))); await act(async () => fail(new Error("old"))); expect(tree!.root.findAll(n => n.props.accessibilityRole === "alert")).toHaveLength(0);
});
it.each(["ripple", "ribbon", "burst"] as const)("starts %s host animation only for entering selection", effect => {
 const view = (selected: boolean, reduced = false, active = true) => <HjmNativeProvider reducedMotion={reduced}><ToggleFeedbackButton entityId="a" state={{ selected, count: selected ? 11 : 10 }} effect={effect} active={active} locale="ko-KR" labels={labels} onSelectedChange={() => undefined} /></HjmNativeProvider>;
 const started = () => startedAnimatedTimings.filter(item => item.duration === toggleFeedbackRecipe.duration).length;
 const before = started(); act(() => { tree = create(view(false)); }); expect(started()).toBe(before); act(() => tree!.update(view(true))); expect(started()).toBe(before + 1); act(() => tree!.update(view(false))); expect(started()).toBe(before + 1);
 act(() => tree!.update(view(true, true))); expect(started()).toBe(before + 1); act(() => tree!.update(view(true, false))); expect(started()).toBe(before + 1);
 act(() => tree!.update(view(false, false, false))); act(() => tree!.update(view(true, false, false))); expect(started()).toBe(before + 1);
});
it("clears SVG host transients on background and does not replay on foreground", () => {
 const listeners: ((state: string) => void)[] = [], setNativeProps = vi.fn();
 vi.spyOn(AppState, "addEventListener").mockImplementation((_event, listener) => { listeners.push(listener); return { remove: () => undefined }; });
 const view = (selected: boolean) => <HjmNativeProvider><ToggleFeedbackButton entityId="a" state={{ selected, count: selected ? 11 : 10 }} effect="burst" locale="ko-KR" labels={labels} onSelectedChange={() => undefined} /></HjmNativeProvider>;
 act(() => { tree = create(view(false), { createNodeMock: () => ({ setNativeProps }) }); }); act(() => tree!.update(view(true))); const before = startedAnimatedTimings.length; setNativeProps.mockClear(); act(() => listeners.forEach(listener => listener("background"))); expect(setNativeProps).toHaveBeenCalledWith(expect.objectContaining({ opacity: 0 })); act(() => listeners.forEach(listener => listener("active"))); expect(startedAnimatedTimings.length).toBe(before);
});
