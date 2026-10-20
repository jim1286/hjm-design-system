import * as React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it } from "vitest";

import { Collapsible } from "../src/collapsible.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { DrawnChevron } from "../src/internal/drawn-glyphs.js";

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
  // The open/closed mark is a drawn chevron (no text glyph), hidden from assistive technology.
  expect(renderer.root.findAllByType(DrawnChevron).map((node) => node.props.direction)).toEqual(["end"]);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual(["배송 안내"]);

  // The renderer test invokes the native Pressable host action; it makes no claim about physical keyboard input.
  act(() => trigger().props.onPress());
  expect(trigger().props.accessibilityState.expanded).toBe(true);
  expect(renderer.root.findAllByType(DrawnChevron).map((node) => node.props.direction)).toEqual(["down"]);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual([
    "배송 안내",
    "영업일 기준 이틀 안에 도착합니다.",
  ]);

  act(() => trigger().props.onPress());
  expect(trigger().props.accessibilityState.expanded).toBe(false);
  expect(renderer.root.findAllByType(Text).map((node) => node.props.children)).toEqual(["배송 안내"]);
});

it("retains local content on collapse and expands inline tools without an accessible trigger", () => {
  let mounts = 0;
  function Draft() { React.useEffect(() => { mounts += 1; }, []); return <Text>초안</Text>; }
  act(() => { renderer = create(<HjmNativeProvider><Collapsible trigger="도구" defaultOpen keepMounted><Draft /></Collapsible></HjmNativeProvider>); });
  act(() => renderer.root.findByType(Pressable).props.onPress());
  expect(mounts).toBe(1);
  expect(renderer.root.findAll(node => node.props.importantForAccessibility === "no-hide-descendants").length).toBeGreaterThan(0);
  act(() => renderer.update(<HjmNativeProvider><Collapsible trigger="도구" pendingLabel="Preparing" keepMounted><Draft /></Collapsible></HjmNativeProvider>));
  expect(mounts).toBe(1);
  expect(renderer.root.findAllByType(Pressable)).toHaveLength(0);
  expect(renderer.root.findAll(node => node.props.importantForAccessibility === "no-hide-descendants").length).toBeGreaterThan(0);
  act(() => renderer.update(<HjmNativeProvider><Collapsible trigger="도구" presentation="inline" keepMounted><Draft /></Collapsible></HjmNativeProvider>));
  expect(mounts).toBe(1);
  expect(renderer.root.findByType(Pressable).props.style.display).toBe("none");
});
it("blocks a host activation after the disclosure becomes disabled",()=>{
 let changes=0;const view=(disabled:boolean)=><HjmNativeProvider><Collapsible trigger="Details" disabled={disabled} onOpenChange={()=>changes++}><Text>Content</Text></Collapsible></HjmNativeProvider>;
 act(()=>{renderer=create(view(false));});act(()=>renderer.update(view(true)));act(()=>renderer.root.findByType(Pressable).props.onPress());expect(changes).toBe(0);expect(renderer.root.findByType(Pressable).props.accessibilityState.expanded).toBe(false);
});

it("names an artwork disclosure independently of its decorative trigger", () => {
  act(() => { renderer = create(<HjmNativeProvider>
    <Collapsible trigger={<Text accessibilityElementsHidden>Artwork</Text>} triggerLabel="Show proportions" marker="none">
      <Text>Blue 66.7%</Text>
    </Collapsible>
  </HjmNativeProvider>); });
  const action = () => renderer.root.findByType(Pressable);
  expect(action().props.accessibilityLabel).toBe("Show proportions");
  expect(renderer.root.findAllByType(DrawnChevron)).toHaveLength(0);
  expect(renderer.root.findAllByType(Text).some(node => node.props.children === "Blue 66.7%")).toBe(false);
  act(() => action().props.onPress());
  expect(action().props.accessibilityState.expanded).toBe(true);
  expect(renderer.root.findAllByType(Text).some(node => node.props.children === "Blue 66.7%")).toBe(true);
});

it("places a pending indicator beside the static title and returns a closed actionable disclosure", () => {
  const render = (pending: boolean) => <HjmNativeProvider><Collapsible title={<Text>Evaluation</Text>}
    trigger="Open" {...(pending ? { pendingLabel: "Measuring" } : {})}><Text>Scores</Text></Collapsible></HjmNativeProvider>;
  act(() => { renderer = create(render(true)); });
  expect(renderer.root.findAllByType(Pressable)).toHaveLength(0);
  expect(renderer.root.findAllByType(Text).some(node => node.props.children === "Evaluation")).toBe(true);
  expect(renderer.root.findAllByType(Text).some(node => node.props.children === "Scores")).toBe(false);
  expect(renderer.root.findAll(node => node.props.accessibilityLabel === "Measuring").length).toBeGreaterThan(0);
  act(() => renderer.update(render(false)));
  const trigger = renderer.root.findByType(Pressable);
  expect(trigger.props.accessibilityState.expanded).toBe(false);
  act(() => trigger.props.onPress());
  expect(renderer.root.findAllByType(Text).some(node => node.props.children === "Scores")).toBe(true);
});
