import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it } from "vitest";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

import { Accordion } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { LucideGlyph } from "../src/internal/lucide-glyph.js";
import Minus from "lucide-react-native/icons/minus";
import Plus from "lucide-react-native/icons/plus";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer;

export const accordionNativeActionCases = [{ componentId: "accordion" }] as const;

afterEach(() => {
  act(() => renderer?.unmount());
});

it("expands and collapses the native Accordion through its named press action", () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/accordion-actions.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
  act(() => {
    renderer = create(
      <HjmNativeProvider>
        <Accordion
          label="도움말"
          items={[{
            value: "shipping",
            title: "배송 안내",
            content: <Text>주문 후 이틀 안에 도착합니다.</Text>,
            accessibilityLabel: "배송 안내",
          }]}
        />
      </HjmNativeProvider>,
    );
  });

  const trigger = () => renderer.root.findAllByType(Pressable)
    .find((node) => node.props.accessibilityLabel === "배송 안내")!;
  expect(trigger().props.accessibilityState.expanded).toBe(false);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual(["배송 안내"]);
  expect(renderer.root.findAllByType(LucideGlyph).map((node) => node.props.icon)).toEqual([Plus]);

  act(() => trigger().props.onPress());
  expect(trigger().props.accessibilityState.expanded).toBe(true);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual([
    "배송 안내",
    "주문 후 이틀 안에 도착합니다.",
  ]);
  expect(renderer.root.findAllByType(LucideGlyph).map((node) => node.props.icon)).toEqual([Minus]);

  act(() => trigger().props.onPress());
  expect(trigger().props.accessibilityState.expanded).toBe(false);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual(["배송 안내"]);
  expect(renderer.root.findAllByType(LucideGlyph).map((node) => node.props.icon)).toEqual([Plus]);
});
