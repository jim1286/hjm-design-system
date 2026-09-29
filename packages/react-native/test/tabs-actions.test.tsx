import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it } from "vitest";

import { Tabs } from "../src/navigation.js";
import { HjmNativeProvider, Text } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const tabsNativeActionCases = [{ componentId: "tabs" }] as const;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer;

afterEach(() => {
  act(() => renderer?.unmount());
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
