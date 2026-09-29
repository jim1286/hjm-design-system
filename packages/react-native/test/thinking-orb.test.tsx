import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, AppState, View, type AppStateStatus } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { ThinkingOrb } from "../src/thinking-orb.js";
import { HjmNativeProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
export const thinkingOrbCases = [{ componentId: "thinking-orb" }] as const;
const records = vi.hoisted(() => ({ count: 0, paintsDisposed: 0, bounds: [] as Array<readonly [number, number]>, colors: [] as string[] }));
vi.mock("react-native-reanimated", async () => {
  const { useRef } = await import("react");
  return { useSharedValue: (value: unknown) => useRef({ value }).current };
});
vi.mock("@shopify/react-native-skia", async () => {
  const { View } = await import("react-native");
  return { Canvas: View, Picture: View, PaintStyle: { Stroke: 1 },
    Skia: { Paint: () => ({ setAntiAlias() {}, setStyle() {}, setColor(v: string) { records.colors.push(v); }, setAlphaf() {}, setStrokeWidth() {}, dispose() { records.paintsDisposed++; } }), Color: (v: string) => v, XYWHRect: (_x: number, _y: number, width: number, height: number) => [width, height] },
    createPicture: (draw: (canvas: unknown) => void, bounds: readonly [number, number]) => { records.count++; records.bounds.push(bounds); draw({ drawLine() {}, drawCircle() {} }); return {}; },
  };
});
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
afterEach(() => { if (renderer) act(() => renderer!.unmount()); renderer = undefined; vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it("renders every documented state and size with an accessible themed host", async () => {
  records.bounds.length = 0;
  records.colors.length = 0;
  vi.stubGlobal("requestAnimationFrame", () => 0);
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
  const states = ["working", "searching", "solving", "listening", "connecting", "weaving", "composing", "breathing", "shaping"] as const;
  const themeColors: string[] = [];
  for (const theme of ["light", "dark"] as const) {
    for (const state of states) {
      for (const size of [20, 64] as const) {
        const element = <HjmNativeProvider theme={theme}><ThinkingOrb state={state} size={size} label={`${theme} ${state}`} /></HjmNativeProvider>;
        if (renderer) act(() => renderer!.update(element));
        else await act(async () => { renderer = create(element); });
        const host = renderer!.root.findAllByType(View).find(node => node.props.accessibilityRole === "progressbar");
        expect(host?.props).toMatchObject({ accessible: true, accessibilityLabel: `${theme} ${state}`, accessibilityState: { busy: true } });
        const canvas = renderer!.root.findAllByType(View).find(node => node.props.importantForAccessibility === "no-hide-descendants");
        expect(canvas?.props.accessible).toBe(false);
        expect(records.bounds.at(-1)).toEqual([size, size]);
        if (state === "working" && size === 20) themeColors.push(records.colors.at(-1)!);
      }
    }
  }
  expect(records.bounds.filter(Boolean)).toHaveLength(states.length * 2 * 2);
  expect(themeColors[0]).not.toBe(themeColors[1]);
});
it("pauses for navigation, background and reduced motion without React commits per frame", async () => {
  let appChange: (s: AppStateStatus) => void = () => {};
  let motionChange: (s: boolean) => void = () => {};
  const remove = vi.fn();
  vi.spyOn(AppState, "addEventListener").mockImplementation((_e, fn) => { appChange = fn; return { remove }; });
  vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
  // RN declares overloads ending in announcementFinished; this test supplies the boolean motion event only.
  vi.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(((event: string, fn: (s: boolean) => void) => { if (event === "reduceMotionChanged") motionChange = fn; return { remove }; }) as unknown as typeof AccessibilityInfo.addEventListener);
  const frames = new Map<number, ((time: number) => void)>(); let id = 0;
  vi.stubGlobal("requestAnimationFrame", (fn: ((time: number) => void)) => { frames.set(++id, fn); return id; });
  vi.stubGlobal("cancelAnimationFrame", (key: number) => frames.delete(key));
  function tree(active = true, paused = false) { return <HjmNativeProvider theme="light"><ThinkingOrb label="검색 중" active={active} paused={paused} /></HjmNativeProvider>; }
  await act(async () => { renderer = create(tree()); });
  act(() => appChange("active"));
  expect(renderer!.root.findAllByType(View).some(n => n.props.accessibilityLabel === "검색 중")).toBe(true);
  expect(frames.size).toBe(1);
  const before = records.count;
  const next = [...frames.values()][0]!; frames.clear(); act(() => next(100)); expect(records.count).toBe(before + 1);
  act(() => renderer!.update(tree(false))); expect(frames.size).toBe(0);
  act(() => renderer!.update(tree())); expect(frames.size).toBe(1);
  act(() => appChange("background")); expect(frames.size).toBe(0);
  act(() => appChange("active")); expect(frames.size).toBe(1);
  act(() => motionChange(true)); expect(frames.size).toBe(0);
  act(() => motionChange(false)); expect(frames.size).toBe(1);
  act(() => renderer!.update(tree(true, true))); expect(frames.size).toBe(0);
  act(() => renderer!.unmount()); renderer = undefined;
  expect(remove).toHaveBeenCalled(); expect(records.paintsDisposed).toBeGreaterThan(0);
});

// Literal component id and registered environments join this proof to maturity evidence.
const thinkingOrbEnvironments = executedScenarioRegistry.executions.find(
  execution => execution.proofFile === "test/thinking-orb.test.tsx",
)!.scenarios;
it.each(thinkingOrbEnvironments)("thinking-orb $id environment", async environment => {
  const frame = vi.fn(() => 0);
  vi.stubGlobal("requestAnimationFrame", frame);
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
  const label = "검색 중 — 길이가 긴 작업 설명도 접근성 이름에 그대로 전달합니다";
  await act(async () => { renderer = create(
    <HjmNativeProvider theme={environment.theme as "light" | "dark"} direction={environment.direction as "ltr" | "rtl"} textScale={environment.textScale} reducedMotion={environment.reducedMotion}>
      <ThinkingOrb label={label} state="searching" />
    </HjmNativeProvider>,
  ); });
  const host = renderer!.root.findAllByType(View).find(node => node.props.accessibilityRole === "progressbar");
  expect(host?.props.accessibilityLabel).toBe(label);
  expect(records.bounds.at(-1)).toEqual([64, 64]);
  const canvas = renderer!.root.findAllByType(View).find(node => node.props.importantForAccessibility === "no-hide-descendants");
  expect(canvas?.props.accessible).toBe(false);
  if (environment.reducedMotion) expect(frame).not.toHaveBeenCalled();
});
