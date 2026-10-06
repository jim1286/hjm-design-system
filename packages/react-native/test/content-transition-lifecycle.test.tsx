import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, AppState, Easing, type AppStateStatus } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { easing, motion } from "@hjmds/design-contracts/foundations";
import { ContentTransition, type ContentTransitionProps } from "../src/content-transition.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.restoreAllMocks(); });
function render(key: string, options: { enterOnMount?: boolean; reduced?: boolean; direction?: "ltr" | "rtl"; preset?: ContentTransitionProps["preset"]; preference?: "system" | "none" } = {}) {
  act(() => {
    const view = <HjmNativeProvider reducedMotion={options.reduced ?? false} direction={options.direction ?? "ltr"}>
      <ContentTransition enterOnMount={options.enterOnMount ?? false} stateKey={key} preset={options.preset ?? "rise"} motion={options.preference ?? "system"}>{key}</ContentTransition>
    </HjmNativeProvider>;
    if (tree) tree.update(view); else tree = create(view);
  });
}
function observeAnimation() {
  const runs: { stop: ReturnType<typeof vi.fn>; value: Animated.Value }[] = [];
  const timing = vi.spyOn(Animated, "timing").mockImplementation(value => {
    const stop = vi.fn();
    runs.push({ stop, value: value as Animated.Value });
    // Leave the animation unfinished: the normal host mock settles immediately
    // and cannot expose interruption bugs or dependencies on completion.
    return { start: vi.fn(), stop, reset: vi.fn() };
  });
  return { runs, timing };
}
it("updates content before completion, cancels prior runs and never replays an unchanged key", () => {
  const { runs, timing } = observeAnimation();
  const curve = vi.spyOn(Easing, "bezier");
  render("first"); expect(timing).not.toHaveBeenCalled();
  render("second"); render("third");
  expect(runs[0]!.stop).toHaveBeenCalledOnce();
  expect(JSON.stringify(tree!.toJSON())).toContain("third");
  expect(JSON.stringify(tree!.toJSON())).not.toContain("second");
  render("third"); expect(timing).toHaveBeenCalledTimes(2);
  expect(curve).toHaveBeenCalledWith(...easing.enter);
  expect(timing.mock.calls[0]![1]).toMatchObject({ duration: motion.normal, useNativeDriver: true });
  act(() => tree!.unmount()); tree = undefined;
  expect(runs[1]!.stop).toHaveBeenCalledOnce();
});
it.each(["reduced", "preference", "preset", "direction"] as const)("settles an in-flight transition when %s changes", option => {
  const { runs, timing } = observeAnimation();
  render("first"); render("latest");
  const settle = vi.spyOn(runs[0]!.value, "setValue");
  render("latest", { [option]: option === "reduced" ? true : option === "preference" ? "none" : option === "preset" ? "scale" : "rtl" });
  expect(runs[0]!.stop).toHaveBeenCalledOnce();
  expect(settle).toHaveBeenLastCalledWith(1);
  expect(timing).toHaveBeenCalledOnce();
});
it("backgrounding settles content and unregisters the listener without needing completion", () => {
  const { runs, timing } = observeAnimation();
  let change: ((state: AppStateStatus) => void) | undefined;
  const remove = vi.fn();
  vi.spyOn(AppState, "addEventListener").mockImplementation((_event, callback) => {
    change = callback; return { remove };
  });
  render("first"); render("latest");
  const settle = vi.spyOn(runs[0]!.value, "setValue");
  act(() => change!("background"));
  expect(runs[0]!.stop).toHaveBeenCalledOnce();
  expect(settle).toHaveBeenLastCalledWith(1);
  act(() => change!("active")); expect(timing).toHaveBeenCalledOnce();
  act(() => tree!.unmount()); tree = undefined;
  expect(remove).toHaveBeenCalledOnce();
});
it("reduced motion renders new content immediately without starting the driver", () => {
  const { timing } = observeAnimation();
  render("first", { reduced: true }); render("latest", { reduced: true });
  expect(timing).not.toHaveBeenCalled();
  expect(JSON.stringify(tree!.toJSON())).toContain("latest");
});

it('animates a newly inserted row once, and disabling/re-enabling motion never replays it', () => {
 const { timing, runs } = observeAnimation();
 render('new-row', { enterOnMount: true });
 expect(timing).toHaveBeenCalledOnce();
 expect(JSON.stringify(tree!.toJSON())).toContain('new-row');
 render('new-row', { enterOnMount: true });
 expect(timing).toHaveBeenCalledOnce();
 render('new-row', { enterOnMount: true, preference: 'none' });
 expect(runs[0]!.stop).toHaveBeenCalledOnce();
 render('new-row', { enterOnMount: true });
 expect(timing).toHaveBeenCalledOnce();
});
it('does not animate an inserted row under reduced motion', () => {
 const { timing } = observeAnimation();
 render('new-row', { enterOnMount: true, reduced: true });
 expect(timing).not.toHaveBeenCalled();
 expect(JSON.stringify(tree!.toJSON())).toContain('new-row');
});
