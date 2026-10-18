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

it("keeps actions as sibling targets beside the whole-card activation", () => {
  const onActivate = vi.fn();
  const onDelete = vi.fn();
  let renderer!: ReactTestRenderer;
  const card = (disabled: boolean) => <HjmNativeProvider theme="light"><Card accessibilityLabel="KE123 Seoul to Tokyo" title="ICN → NRT" disabled={disabled} onActivate={onActivate}
    actions={<Pressable accessibilityRole="button" accessibilityLabel="Delete KE123" onPress={onDelete} />} /></HjmNativeProvider>;
  act(() => { renderer = create(card(false)); });
  const [activation, remove] = renderer.root.findAllByType(Pressable);
  expect(activation!.props.accessibilityLabel).toBe("KE123 Seoul to Tokyo");
  expect(activation!.props.accessibilityRole).toBe("button");
  // The delete control is not a descendant of the activation target, so screen readers reach it on its own.
  expect(activation!.findAllByType(Pressable).filter(node => node !== activation)).toHaveLength(0);
  expect(remove!.props.accessibilityLabel).toBe("Delete KE123");
  act(() => { activation!.props.onPress(); remove!.props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(1);
  expect(onDelete).toHaveBeenCalledTimes(1);
  act(() => { renderer.update(card(true)); });
  const [disabledActivation, stillRemove] = renderer.root.findAllByType(Pressable);
  expect(disabledActivation!.props.accessibilityState).toEqual({ selected: false, disabled: true });
  act(() => { disabledActivation!.props.onPress(); stillRemove!.props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(1);
  expect(onDelete).toHaveBeenCalledTimes(2);
  act(() => { renderer.unmount(); });
});
