import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { BottomNavigation, HjmNativeProvider, Text } from "../src/index.js";
import type { BottomNavigationActivation } from "@hjmds/design-contracts/components/bottom-navigation";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const bottomNavigationActionCases = [{ componentId: "bottom-navigation" }] as const;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("emits navigate and reselect host actions while leaving route selection to the navigator", () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/bottom-navigation.interaction.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
  const onActivate = vi.fn<(activation: BottomNavigationActivation<"home" | "search">) => void>();
  const label = "주변의 새로운 소식과 업데이트";
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <BottomNavigation
          descriptor={{
            accessibilityLabel: "주요 탐색",
            items: [
              { id: "home", label: "홈", icon: { name: "home" } },
              { id: "search", label, icon: { name: "search" } },
            ],
            selectedKey: "home",
          }}
          getItemTestID={(item) => `destination-${item.id}`}
          onActivate={onActivate}
          renderIcon={({ name }) => <Text>{name}</Text>}
        />
      </HjmNativeProvider>,
    );
  });

  const home = renderer.root.findByProps({ testID: "destination-home" });
  const search = renderer.root.findByProps({ testID: "destination-search" });
  expect(home.props.accessibilityState.selected).toBe(true);
  expect(search.props.accessibilityState.selected).toBe(false);
  expect(search.props.accessibilityLabel).toBe(label);
  expect(renderer.root.findAllByType(Text).some((node) => node.props.children === label)).toBe(true);

  act(() => search.props.onPress());
  expect(onActivate).toHaveBeenLastCalledWith({ key: "search", reason: "navigate" });
  expect(renderer.root.findByProps({ testID: "destination-home" }).props.accessibilityState.selected)
    .toBe(true);
  expect(renderer.root.findByProps({ testID: "destination-search" }).props.accessibilityState.selected)
    .toBe(false);

  act(() => home.props.onPress());
  expect(onActivate).toHaveBeenLastCalledWith({ key: "home", reason: "reselect" });
  expect(onActivate).toHaveBeenCalledTimes(2);
});

it("keeps hidden capsule destinations named and restores visible labels at large text", () => {
  const items = [{ id: "home", label: "홈", icon: { name: "home" } }, { id: "search", label: "검색", icon: { name: "search" } }];
  const activate = vi.fn();
  let tree!: ReturnType<typeof create>;
  const render = (scale: number) => <HjmNativeProvider theme="light" textScale={scale}>
    <BottomNavigation descriptor={{ accessibilityLabel: "탐색", selectedKey: "home", items }} configuration={{ presentation: "capsule", direction: "rtl" }} renderIcon={() => null} onActivate={activate} getItemTestID={item => `capsule-${item.id}`}/>
  </HjmNativeProvider>;
  act(() => { tree = create(render(1)); });
  expect(tree.root.findAllByType(Text).some(node => node.props.children === "검색")).toBe(false);
  const search = tree.root.findByProps({ testID: "capsule-search" });
  expect(search.props.accessibilityLabel).toBe("검색");
  act(() => search.props.onPress());
  expect(activate).toHaveBeenCalledWith({ key: "search", reason: "navigate" });
  expect(tree.root.findByProps({ testID: "capsule-home" }).props.accessibilityState.selected).toBe(true);
  act(() => tree.update(render(2)));
  expect(tree.root.findAllByType(Text).some(node => node.props.children === "검색")).toBe(true);
  act(() => tree.unmount());
});
