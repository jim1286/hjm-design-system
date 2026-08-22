import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, TextInput, View } from "react-native";
import { describe, expect, it, vi } from "vitest";

import * as inputs from "../src/inputs-public.js";
import * as root from "../src/index.js";
import { NumberField } from "../src/number-field.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function render(node: React.ReactNode, direction: "ltr" | "rtl" = "ltr"): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider direction={direction} reducedMotion textScale={1.6} theme="light">
        {node}
      </HjmNativeProvider>,
    );
  });
  return renderer!;
}

function byLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (typeof style === "function") return flattenStyle(style({ pressed: false }));
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

describe("Native NumberField", () => {
  it("is public from the root, inputs family, and dedicated implementation", () => {
    expect(root.NumberField).toBe(NumberField);
    expect(inputs.NumberField).toBe(NumberField);
  });

  it("steps from empty, disables at boundaries, and exposes named 44pt actions", () => {
    const onValueChange = vi.fn();
    const renderer = render(
      <NumberField
        decrementLabel="인원 줄이기"
        incrementLabel="인원 늘리기"
        label="인원"
        max={3}
        min={1}
        onValueChange={onValueChange}
      />,
    );
    const decrement = byLabel(renderer, "인원 줄이기");
    const increment = byLabel(renderer, "인원 늘리기");
    expect(decrement.type).toBe(Pressable);
    expect(increment.type).toBe(Pressable);
    expect(flattenStyle(decrement.props.style)).toMatchObject({ minHeight: 44, minWidth: 44 });

    act(() => increment.props.onPress());
    expect(renderer.root.findByType(TextInput).props.value).toBe("1");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    expect(byLabel(renderer, "인원 줄이기").props.accessibilityState.disabled).toBe(true);

    act(() => byLabel(renderer, "인원 늘리기").props.onPress());
    act(() => byLabel(renderer, "인원 늘리기").props.onPress());
    expect(renderer.root.findByType(TextInput).props.value).toBe("3");
    expect(byLabel(renderer, "인원 늘리기").props.accessibilityState.disabled).toBe(true);
    const callsAtMax = onValueChange.mock.calls.length;
    act(() => renderer.root.findByType(TextInput).props.onAccessibilityAction({
      nativeEvent: { actionName: "increment" },
    }));
    expect(onValueChange).toHaveBeenCalledTimes(callsAtMax);
  });

  it("keeps drafts local and shares blur snapping with Web", () => {
    const onValueChange = vi.fn();
    const renderer = render(
      <NumberField
        decrementLabel="감소"
        incrementLabel="증가"
        label="타율"
        max={1}
        min={0}
        step={0.001}
        defaultValue={0.3}
        onValueChange={onValueChange}
      />,
    );
    let input = renderer.root.findByType(TextInput);
    act(() => input.props.onChangeText("-"));
    expect(renderer.root.findByType(TextInput).props.value).toBe("-");
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => renderer.root.findByType(TextInput).props.onBlur({}));
    expect(renderer.root.findByType(TextInput).props.value).toBe("0.3");

    input = renderer.root.findByType(TextInput);
    act(() => input.props.onChangeText("0.3574"));
    act(() => renderer.root.findByType(TextInput).props.onBlur({}));
    expect(renderer.root.findByType(TextInput).props.value).toBe("0.357");
    expect(onValueChange).toHaveBeenLastCalledWith(0.357);
  });

  it("announces a valid draft and steps to the next directional boundary", () => {
    const onValueChange = vi.fn();
    const renderer = render(
      <NumberField
        decrementLabel="감소"
        defaultValue={2}
        getValueText={(value) => `${value}점`}
        incrementLabel="증가"
        label="값"
        max={10}
        min={0}
        onValueChange={onValueChange}
        step={0.5}
      />,
    );

    act(() => renderer.root.findByType(TextInput).props.onChangeText("4.26"));
    expect(renderer.root.findByType(TextInput).props.accessibilityValue).toEqual({
      min: 0,
      max: 10,
      now: 4.26,
      text: "4.26점",
    });
    act(() => byLabel(renderer, "증가").props.onPress());
    expect(renderer.root.findByType(TextInput).props.value).toBe("4.5");
    expect(onValueChange).toHaveBeenLastCalledWith(4.5);

    act(() => renderer.root.findByType(TextInput).props.onChangeText("4.24"));
    act(() => byLabel(renderer, "감소").props.onPress());
    expect(renderer.root.findByType(TextInput).props.value).toBe("4");
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it("updates stepper availability from the visible draft", () => {
    const renderer = render(
      <NumberField
        decrementLabel="감소"
        defaultValue={10}
        incrementLabel="증가"
        label="값"
        max={10}
        min={0}
      />,
    );
    expect(byLabel(renderer, "증가").props.accessibilityState.disabled).toBe(true);

    act(() => renderer.root.findByType(TextInput).props.onChangeText("4"));
    expect(byLabel(renderer, "증가").props.accessibilityState.disabled).toBe(false);
    act(() => byLabel(renderer, "증가").props.onPress());
    expect(renderer.root.findByType(TextInput).props.value).toBe("5");

    act(() => renderer.root.findByType(TextInput).props.onChangeText("0"));
    expect(byLabel(renderer, "감소").props.accessibilityState.disabled).toBe(true);
    act(() => renderer.root.findByType(TextInput).props.onChangeText("6"));
    expect(byLabel(renderer, "감소").props.accessibilityState.disabled).toBe(false);
  });

  it("uses accessibility increment/decrement and does not double-scale type", () => {
    const onValueChange = vi.fn();
    const renderer = render(
      <NumberField
        decrementLabel="감소"
        getValueText={(value) => `${value}명`}
        incrementLabel="증가"
        label="인원"
        max={8}
        min={1}
        defaultValue={2}
        onValueChange={onValueChange}
      />,
      "rtl",
    );
    const input = renderer.root.findByType(TextInput);
    expect(input.props.accessibilityActions).toEqual([
      { name: "increment", label: "증가" },
      { name: "decrement", label: "감소" },
    ]);
    expect(input.props.accessibilityValue).toEqual({ min: 1, max: 8, now: 2, text: "2명" });
    expect(flattenStyle(input.props.style)).toMatchObject({
      fontSize: 14,
      fontVariant: ["tabular-nums"],
    });
    const mirroredFrame = renderer.root.findAllByType(View).find(
      (view) => flattenStyle(view.props.style).flexDirection === "row-reverse",
    );
    expect(mirroredFrame).toBeDefined();

    act(() => input.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(renderer.root.findByType(TextInput).props.value).toBe("3");
  });

  it("keeps a rejected controlled action on the supplied value", () => {
    const onValueChange = vi.fn();
    const renderer = render(
      <NumberField
        decrementLabel="감소"
        incrementLabel="증가"
        label="수량"
        max={10}
        min={0}
        value={4}
        onValueChange={onValueChange}
      />,
    );
    act(() => byLabel(renderer, "증가").props.onPress());
    expect(onValueChange).toHaveBeenCalledWith(5);
    expect(renderer.root.findByType(TextInput).props.value).toBe("4");
  });
});
