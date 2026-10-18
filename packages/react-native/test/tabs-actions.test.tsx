import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Pressable } from "react-native";
import { afterEach, expect, it, vi } from "vitest";

import { Tabs } from "../src/navigation.js";
import { HjmNativeProvider, Text } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const tabsNativeActionCases = [{ componentId: "tabs" }] as const;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer;

afterEach(() => {
  act(() => renderer?.unmount());
  vi.restoreAllMocks();
});

it("selects a long-label tab through its contract activate action and renders its panel", () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/tabs-actions.test.tsx")?.scenarios.map(({ id }) => id)).toEqual(expect.arrayContaining(["native-actions", "long-copy"]));
  const longLabel = "결제 및 배송에 관한 상세 정보와 주문 이후 변경할 수 있는 내용 전체 보기";
  act(() => {
    renderer = create(
      <HjmNativeProvider>
        <Tabs
          id="account"
          label="계정 정보"
          items={[
            { id: "profile", label: "프로필", panel: <Text>프로필 패널</Text> },
            { id: "details", label: longLabel, panel: <Text>상세 정보 패널</Text> },
          ]}
        />
      </HjmNativeProvider>,
    );
  });

  const trigger = (label: string) => renderer.root.findAllByType(Pressable)
    .find((node) => node.props.accessibilityLabel === label)!;
  const detailsTab = trigger(longLabel);
  expect(detailsTab.props.accessibilityActions).toContainEqual({ name: "activate" });
  expect(detailsTab.props.accessibilityState.selected).toBe(false);
  expect(detailsTab.findByType(Text).props.children).toBe(longLabel);
  expect(detailsTab.findByType(Text).props.numberOfLines).toBeUndefined();

  act(() => detailsTab.props.onAccessibilityAction({ nativeEvent: { actionName: "activate" } }));
  expect(trigger(longLabel).props.accessibilityState.selected).toBe(true);
  const panel = renderer.root.find((node) => node.props.nativeID === "account-panel-details");
  expect(panel.props).toMatchObject({
    accessibilityLabelledBy: "account-tab-details",
    role: "tabpanel",
  });
  expect(panel.findByType(Text).props.children).toBe("상세 정보 패널");
});


it("ignores disabled accessibility activation and recovers dynamic selection", () => {
  const change = vi.fn();
  const render = (disabled = false, remove = false) => <HjmNativeProvider><Tabs label="Dynamic" defaultValue="b" onValueChange={change} items={[{ id: "a", label: "A" }, ...(remove ? [] : [{ id: "b", label: "B", disabled }])]} /></HjmNativeProvider>;
  act(() => { renderer = create(render()); });
  act(() => renderer.update(render(true)));
  const tabs = () => renderer.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "tab");
  expect(tabs()[0]!.props.accessibilityState.selected).toBe(true);
  change.mockClear();
  act(() => tabs()[1]!.props.onAccessibilityAction({ nativeEvent: { actionName: "activate" } }));
  expect(change).not.toHaveBeenCalled();
  act(() => renderer.update(render(false, true)));
  expect(tabs()[0]!.props.accessibilityState.selected).toBe(true);
});

it("preserves controlled selection until owner accepts an accessibility action", () => {
  const change = vi.fn();
  const render = (value: "a" | "b") => <HjmNativeProvider direction="rtl"><Tabs label="Controlled" value={value} onValueChange={change} items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} /></HjmNativeProvider>;
  act(() => { renderer = create(render("a")); });
  const tabs = () => renderer.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "tab");
  act(() => tabs()[1]!.props.onAccessibilityAction({ nativeEvent: { actionName: "activate" } }));
  expect(change).toHaveBeenCalledWith("b");
  expect(tabs()[0]!.props.accessibilityState.selected).toBe(true);
  act(() => renderer.update(render("b")));
  expect(tabs()[1]!.props.accessibilityState.selected).toBe(true);
});


it("routes accessibility increment around disabled tabs without changing manual selection", async () => {
  const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
  const change = vi.fn();
  await act(async () => { renderer = create(<HjmNativeProvider direction="rtl"><Tabs label="Navigation" onValueChange={change} items={[{ id: "a", label: "A" }, { id: "b", label: "B", disabled: true }, { id: "c", label: "C" }]} /></HjmNativeProvider>, { createNodeMock: () => ({}) }); });
  const tabs = () => renderer.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "tab");
  await act(async () => tabs()[0]!.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  expect(focus).toHaveBeenCalledOnce();
  expect(change).not.toHaveBeenCalled();
  expect(tabs()[0]!.props.accessibilityState.selected).toBe(true);
  act(() => tabs()[2]!.props.onAccessibilityAction({ nativeEvent: { actionName: "activate" } }));
  expect(change).toHaveBeenCalledWith("c");
});

it("paints the filled indicator as a brand-tinted pill without the underline or list divider", async () => {
  const { ScrollView, View } = await import("react-native");
  const items = [{ id: "travelling", label: "Travelling" }, { id: "people", label: "People" }];
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <Tabs label="Sent" indicator="filled" layout="fitted" appearance="standard" items={items} defaultValue="people" />
      </HjmNativeProvider>,
    );
  });
  const tabs = renderer.root.findAllByType(Pressable);
  const style = (node: (typeof tabs)[number]) => node.props.style({ pressed: false }).flat().reduce((all: object, part: object) => ({ ...all, ...part }), {});
  expect(style(tabs[1]!).backgroundColor).toEqual(expect.any(String));
  expect(style(tabs[1]!).backgroundColor).not.toBe("transparent");
  expect(style(tabs[1]!).borderRadius).toBeGreaterThan(100);
  expect(style(tabs[0]!).backgroundColor).toBe("transparent");
  expect(renderer.root.findByType(ScrollView).props.contentContainerStyle[0].borderBottomWidth).toBe(0);
  // No absolutely placed underline bar under the selected tab.
  expect(tabs[1]!.findAll((node) => node.type === View && node.props.style?.position === "absolute")).toHaveLength(0);
  expect(() => act(() => {
    renderer.update(<HjmNativeProvider reducedMotion theme="light"><Tabs label="Sent" indicator={"boxed" as never} items={items} /></HjmNativeProvider>);
  })).toThrow("Unsupported Tabs indicator");
});
