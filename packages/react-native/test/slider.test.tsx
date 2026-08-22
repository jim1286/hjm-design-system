import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text, View } from "react-native";
import { describe, expect, it, vi } from "vitest";

import * as inputs from "../src/inputs-public.js";
import * as root from "../src/index.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Slider } from "../src/slider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function provider(node: React.ReactNode, direction: "ltr" | "rtl" = "ltr") {
  return (
    <HjmNativeProvider direction={direction} reducedMotion textScale={1.6} theme="light">
      {node}
    </HjmNativeProvider>
  );
}

function render(node: React.ReactNode, direction: "ltr" | "rtl" = "ltr"): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(provider(node, direction));
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

function layout(renderer: ReactTestRenderer, width = 100) {
  act(() => byLabel(renderer, "점수").props.onLayout({
    nativeEvent: { layout: { width } },
  }));
}

describe("Native Slider", () => {
  it("is public from root, inputs family, and its dedicated implementation", () => {
    expect(root.Slider).toBe(Slider);
    expect(inputs.Slider).toBe(Slider);
  });

  it("emits continuous drag changes and one release commit through the shared resolver", () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    const renderer = render(
      <Slider
        decrementLabel="점수 낮추기"
        incrementLabel="점수 높이기"
        label="점수"
        max={100}
        min={0}
        defaultValue={50}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />,
    );
    layout(renderer);
    let slider = byLabel(renderer, "점수");
    expect(flattenStyle(slider.props.style)).toMatchObject({ minHeight: 44, minWidth: 44 });

    act(() => slider.props.onResponderGrant({ nativeEvent: { locationX: 30 } }));
    slider = byLabel(renderer, "점수");
    act(() => slider.props.onResponderMove({ nativeEvent: { locationX: 70 } }));
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([25, 75]);
    expect(onValueChangeEnd).not.toHaveBeenCalled();
    act(() => byLabel(renderer, "점수").props.onResponderRelease());
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(75);
    expect(byLabel(renderer, "점수").props.accessibilityValue.now).toBe(75);

    const thumb = renderer.root.findAllByType(View).find((view) => {
      const style = flattenStyle(view.props.style);
      return style.width === 20 && style.height === 20 && style.borderWidth === 2;
    });
    expect(flattenStyle(thumb?.props.style)).toMatchObject({ left: 60, opacity: 1 });
  });

  it("mirrors physical drag and fill in RTL without reversing logical accessibility actions", () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    const renderer = render(
      <Slider
        decrementLabel="감소"
        incrementLabel="증가"
        label="점수"
        max={100}
        min={0}
        defaultValue={25}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />,
      "rtl",
    );
    layout(renderer);
    act(() => byLabel(renderer, "점수").props.onResponderGrant({
      nativeEvent: { locationX: 30 },
    }));
    expect(onValueChange).toHaveBeenLastCalledWith(75);
    act(() => byLabel(renderer, "점수").props.onResponderRelease());
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(75);

    act(() => byLabel(renderer, "점수").props.onAccessibilityAction({
      nativeEvent: { actionName: "increment" },
    }));
    expect(onValueChange).toHaveBeenLastCalledWith(76);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(76);
  });

  it("exposes localized atomic adjustable actions and product-owned value text", () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    const renderer = render(
      <Slider
        decrementLabel="밝기 낮추기"
        getValueText={(value) => `${value}퍼센트`}
        incrementLabel="밝기 높이기"
        label="점수"
        max={10}
        min={0}
        step={2.5}
        defaultValue={5}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />,
    );
    let slider = byLabel(renderer, "점수");
    expect(slider.props.accessibilityRole).toBe("adjustable");
    expect(slider.props.accessibilityActions).toEqual([
      { name: "increment", label: "밝기 높이기" },
      { name: "decrement", label: "밝기 낮추기" },
    ]);
    expect(slider.props.accessibilityValue).toEqual({
      min: 0,
      max: 10,
      now: 5,
      text: "5퍼센트",
    });
    act(() => slider.props.onAccessibilityAction({
      nativeEvent: { actionName: "increment" },
    }));
    expect(onValueChange).toHaveBeenLastCalledWith(7.5);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(7.5);

    slider = byLabel(renderer, "점수");
    act(() => slider.props.onAccessibilityAction({
      nativeEvent: { actionName: "increment" },
    }));
    const changeCallsAtMax = onValueChange.mock.calls.length;
    const endCallsAtMax = onValueChangeEnd.mock.calls.length;
    act(() => byLabel(renderer, "점수").props.onAccessibilityAction({
      nativeEvent: { actionName: "increment" },
    }));
    expect(onValueChange).toHaveBeenCalledTimes(changeCallsAtMax);
    expect(onValueChangeEnd).toHaveBeenCalledTimes(endCallsAtMax);
  });

  it("keeps rejected controlled changes visualized at the supplied value", () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    const renderer = render(
      <Slider
        decrementLabel="감소"
        incrementLabel="증가"
        label="점수"
        max={10}
        min={0}
        step={3}
        value={4}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />,
    );
    act(() => byLabel(renderer, "점수").props.onAccessibilityAction({
      nativeEvent: { actionName: "increment" },
    }));
    expect(onValueChange).toHaveBeenCalledWith(6);
    expect(onValueChangeEnd).toHaveBeenCalledWith(6);
    expect(byLabel(renderer, "점수").props.accessibilityValue.now).toBe(4);
  });

  it("reaches both exact endpoints when max is not divisible by step", () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    const renderer = render(
      <Slider
        decrementLabel="감소"
        incrementLabel="증가"
        label="점수"
        max={10}
        min={0}
        step={3}
        defaultValue={4}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />,
    );
    layout(renderer);
    expect(byLabel(renderer, "점수").props.accessibilityValue.now).toBe(4);

    act(() => byLabel(renderer, "점수").props.onResponderGrant({
      nativeEvent: { locationX: 100 },
    }));
    act(() => byLabel(renderer, "점수").props.onResponderRelease());
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(10);
    expect(byLabel(renderer, "점수").props.accessibilityValue.now).toBe(10);

    act(() => byLabel(renderer, "점수").props.onResponderGrant({
      nativeEvent: { locationX: 0 },
    }));
    act(() => byLabel(renderer, "점수").props.onResponderRelease());
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(0);
    expect(byLabel(renderer, "점수").props.accessibilityValue.now).toBe(0);
  });

  it("finishes once when disabled during drag and ignores stale responder events", () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    const slider = (disabled = false) => (
      <Slider
        decrementLabel="감소"
        disabled={disabled}
        incrementLabel="증가"
        label="점수"
        max={100}
        min={0}
        defaultValue={50}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />
    );
    const renderer = render(slider());
    layout(renderer);
    act(() => byLabel(renderer, "점수").props.onResponderGrant({
      nativeEvent: { locationX: 30 },
    }));
    expect(onValueChange).toHaveBeenLastCalledWith(25);

    act(() => renderer.update(provider(slider(true))));
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(25);
    const changeCalls = onValueChange.mock.calls.length;
    act(() => byLabel(renderer, "점수").props.onResponderMove({
      nativeEvent: { locationX: 70 },
    }));
    act(() => byLabel(renderer, "점수").props.onResponderRelease());
    act(() => byLabel(renderer, "점수").props.onResponderTerminate());
    expect(onValueChange).toHaveBeenCalledTimes(changeCalls);
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    expect(byLabel(renderer, "점수").props.accessibilityValue.now).toBe(25);
  });

  it("keeps one PanResponder while using updated range props and callbacks", () => {
    const firstChange = vi.fn();
    const firstEnd = vi.fn();
    const secondChange = vi.fn();
    const secondEnd = vi.fn();
    const renderer = render(
      <Slider
        decrementLabel="감소"
        incrementLabel="증가"
        label="점수"
        max={100}
        min={0}
        step={10}
        defaultValue={0}
        onValueChange={firstChange}
        onValueChangeEnd={firstEnd}
      />,
    );
    layout(renderer);
    const originalGrant = byLabel(renderer, "점수").props.onResponderGrant;

    act(() => renderer.update(provider(
      <Slider
        decrementLabel="감소"
        incrementLabel="증가"
        label="점수"
        max={200}
        min={0}
        step={20}
        defaultValue={0}
        onValueChange={secondChange}
        onValueChangeEnd={secondEnd}
      />,
    )));
    expect(byLabel(renderer, "점수").props.onResponderGrant).toBe(originalGrant);
    act(() => byLabel(renderer, "점수").props.onResponderGrant({
      nativeEvent: { locationX: 50 },
    }));
    act(() => byLabel(renderer, "점수").props.onResponderRelease());
    expect(firstChange).not.toHaveBeenCalled();
    expect(firstEnd).not.toHaveBeenCalled();
    expect(secondChange).toHaveBeenCalledWith(100);
    expect(secondEnd).toHaveBeenCalledWith(100);
  });

  it("uses recipe typography with native scaling once and removes actions when disabled", () => {
    const renderer = render(
      <Slider
        decrementLabel="감소"
        disabled
        incrementLabel="증가"
        label="점수"
        max={10}
        min={0}
      />,
    );
    const slider = byLabel(renderer, "점수");
    expect(slider.props.accessibilityState).toEqual({ disabled: true });
    expect(slider.props.accessibilityValue.now).toBe(0);
    expect(slider.props.accessibilityActions).toBeUndefined();
    expect(slider.props.onStartShouldSetResponder()).toBe(false);
    const textStyles = renderer.root.findAllByType(Text).map((text) => flattenStyle(text.props.style));
    expect(textStyles[0]).toMatchObject({ fontSize: 14, lineHeight: 20 });
    expect(textStyles[1]).toMatchObject({ fontSize: 12, lineHeight: 18 });
    expect(renderer.root.findAllByType(Text).every((text) => text.props.allowFontScaling)).toBe(true);
    expect(renderer.root.findAllByType(View).some(
      (view) => view.props.importantForAccessibility === "no-hide-descendants",
    )).toBe(true);
  });
});
