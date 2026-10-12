import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { expect, it, vi } from "vitest";
import { Card } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("announces whole-card selection and guards disabled actions while allowing reapplication", () => {
  const onActivate = vi.fn();
  let renderer!: ReactTestRenderer;
  const card = (disabled: boolean) => <HjmNativeProvider theme="light"><Card accessibilityLabel="Timer" selected disabled={disabled} onActivate={onActivate} /></HjmNativeProvider>;
  act(() => { renderer = create(card(false)); });
  const action = renderer.root.findByType(Pressable);
  expect(action.props.accessibilityRole).toBe("button");
  expect(action.props.accessibilityState).toEqual({ selected: true, disabled: false });
  act(() => { action.props.onPress(); action.props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(2);
  act(() => { renderer.update(card(true)); });
  act(() => { renderer.root.findByType(Pressable).props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(2);
  act(() => { renderer.unmount(); });
});

it("keeps ordinary cards passive", () => {
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider theme="light"><Card title="Summary" /></HjmNativeProvider>); });
  expect(renderer.root.findAllByType(Pressable)).toHaveLength(0);
  act(() => { renderer.unmount(); });
});
