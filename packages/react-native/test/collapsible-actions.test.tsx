import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it } from "vitest";

import { Collapsible } from "../src/collapsible.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export const collapsibleNativeActionCases = [{ componentId: "collapsible" }] as const;

let renderer: ReactTestRenderer;

afterEach(() => {
  act(() => renderer?.unmount());
});

it("exposes expanded accessibility state and toggles content through the native host press action", () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/collapsible-actions.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
  act(() => {
    renderer = create(
      <HjmNativeProvider>
        <Collapsible trigger="배송 안내">
          <Text>영업일 기준 이틀 안에 도착합니다.</Text>
        </Collapsible>
      </HjmNativeProvider>,
    );
  });

  const trigger = () => renderer.root.findByType(Pressable);
  expect(trigger().props.accessibilityRole).toBe("button");
  expect(trigger().props.accessibilityState).toEqual({ expanded: false, disabled: false });
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual(["배송 안내", "▸"]);

  // The renderer test invokes the native Pressable host action; it makes no claim about physical keyboard input.
  act(() => trigger().props.onPress());
  expect(trigger().props.accessibilityState.expanded).toBe(true);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual([
    "배송 안내",
    "▾",
    "영업일 기준 이틀 안에 도착합니다.",
  ]);

  act(() => trigger().props.onPress());
  expect(trigger().props.accessibilityState.expanded).toBe(false);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual(["배송 안내", "▸"]);
});
