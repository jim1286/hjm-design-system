import { page } from "vitest/browser";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HjmProvider } from "../src/provider.js";
import { Slider } from "../src/slider.js";
import "../src/styles.css";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

async function setNativeRangeValue(input: HTMLInputElement, value: number) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  await act(async () => {
    setter?.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function key(input: HTMLInputElement, type: "keydown" | "keyup", value: string) {
  await act(async () => {
    input.dispatchEvent(new KeyboardEvent(type, { bubbles: true, key: value }));
  });
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  container.style.width = "240px";
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Slider interaction", () => {
  it("separates repeated keyboard changes from one keyup commit in LTR and RTL", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    await render(
      <HjmProvider direction="rtl" systemTheme="light">
        <Slider
          defaultValue={20}
          label="점수"
          max={100}
          min={0}
          onValueChange={onValueChange}
          onValueChangeEnd={onValueChangeEnd}
          onKeyUp={(event) => event.preventDefault()}
          step={5}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="range"]')!;

    await key(input, "keydown", "ArrowRight");
    await key(input, "keydown", "ArrowRight");
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([25, 30]);
    expect(onValueChangeEnd).not.toHaveBeenCalled();
    await key(input, "keyup", "ArrowRight");
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(30);

    await key(input, "keydown", "PageUp");
    await key(input, "keyup", "PageUp");
    expect(input.value).toBe("80");
    await key(input, "keydown", "Home");
    await key(input, "keyup", "Home");
    expect(input.value).toBe("0");
    await key(input, "keydown", "End");
    await key(input, "keyup", "End");
    expect(input.value).toBe("100");
    expect(onValueChangeEnd.mock.calls.map(([value]) => value)).toEqual([30, 80, 0, 100]);

    await act(async () => input.blur());
    expect(onValueChangeEnd).toHaveBeenCalledTimes(4);
  });

  it("commits on lost capture or pointerup exactly once, with blur as an idempotent fallback", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Slider
          defaultValue={10}
          label="강도"
          max={100}
          min={0}
          onValueChange={onValueChange}
          onValueChangeEnd={onValueChangeEnd}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    Object.defineProperty(input, "setPointerCapture", { value: vi.fn() });

    await act(async () => {
      input.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 7 }));
    });
    await setNativeRangeValue(input, 35);
    expect(onValueChange).toHaveBeenLastCalledWith(35);
    expect(onValueChangeEnd).not.toHaveBeenCalled();
    await act(async () => {
      input.dispatchEvent(new PointerEvent("lostpointercapture", {
        bubbles: true,
        pointerId: 7,
      }));
      input.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 7 }));
      input.blur();
    });
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(35);

    await act(async () => {
      input.focus();
      input.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 8 }));
    });
    await setNativeRangeValue(input, 60);
    await act(async () => {
      input.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 8 }));
      input.blur();
    });
    expect(onValueChangeEnd).toHaveBeenCalledTimes(2);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(60);
  });

  it("finishes once when a change disables the active pointer or keyboard interaction", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    function DisableOnChangeSlider() {
      const [disabled, setDisabled] = useState(false);
      return (
        <Slider
          defaultValue={50}
          disabled={disabled}
          label="점수"
          max={100}
          min={0}
          onValueChange={(next) => {
            onValueChange(next);
            setDisabled(true);
          }}
          onValueChangeEnd={onValueChangeEnd}
        />
      );
    }

    await render(
      <HjmProvider systemTheme="light">
        <DisableOnChangeSlider key="pointer" />
      </HjmProvider>,
    );
    let input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    Object.defineProperty(input, "setPointerCapture", { value: vi.fn() });
    await act(async () => {
      input.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 9 }));
    });
    await setNativeRangeValue(input, 60);
    expect(input.disabled).toBe(true);
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(60);
    expect(container.querySelector(".hjm-slider")?.getAttribute("data-interaction")).toBe("idle");
    await act(async () => {
      input.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 9 }));
      input.blur();
    });
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);

    onValueChange.mockClear();
    onValueChangeEnd.mockClear();
    await render(
      <HjmProvider systemTheme="light">
        <DisableOnChangeSlider key="keyboard" />
      </HjmProvider>,
    );
    input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    await key(input, "keydown", "ArrowRight");
    expect(input.disabled).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith(51);
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(51);
    expect(container.querySelector(".hjm-slider")?.getAttribute("data-interaction")).toBe("idle");
    await key(input, "keyup", "ArrowRight");
    expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
  });

  it("keeps a real RTL native-range pointer value aligned with logical-inline fill", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    await render(
      <HjmProvider direction="rtl" systemTheme="light">
        <Slider
          defaultValue={0}
          label="밝기"
          max={100}
          min={0}
          onValueChange={onValueChange}
          onValueChangeEnd={onValueChangeEnd}
          step={10}
        />
      </HjmProvider>,
    );
    const slider = container.querySelector<HTMLElement>(".hjm-slider")!;
    const input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    const track = container.querySelector<HTMLElement>(".hjm-slider__track")!;
    const thumb = container.querySelector<HTMLElement>(".hjm-slider__thumb")!;
    expect(getComputedStyle(input).direction).toBe("rtl");
    expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);

    const inputRect = input.getBoundingClientRect();
    const clickX = inputRect.width * 0.25;
    await act(async () => {
      await page.elementLocator(input).click({ position: { x: clickX, y: 22 } });
    });

    const value = Number(input.value);
    expect(value).toBeGreaterThanOrEqual(70);
    expect(onValueChange).toHaveBeenLastCalledWith(value);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(value);
    expect(slider.style.getPropertyValue("--hjm-slider-fill")).toBe(`${value}%`);

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const thumbCenter = thumbRect.left + thumbRect.width / 2;
    const expectedCenter = trackRect.right - trackRect.width * value / 100;
    expect(Math.abs(thumbCenter - expectedCenter)).toBeLessThan(1);
    expect(Math.abs(thumbCenter - (inputRect.left + clickX))).toBeLessThanOrEqual(12);
  });

  it("reaches exact endpoints when max is off-grid without sanitizing the initial value", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Slider
          defaultValue={4}
          label="점수"
          max={10}
          min={0}
          onValueChange={onValueChange}
          onValueChangeEnd={onValueChangeEnd}
          step={3}
        />
      </HjmProvider>,
    );
    const slider = container.querySelector<HTMLElement>(".hjm-slider")!;
    const input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(input.step).toBe("any");
    expect(input.value).toBe("4");

    const { width } = input.getBoundingClientRect();
    await act(async () => {
      await page.elementLocator(input).click({ position: { x: width - 1, y: 22 } });
    });
    expect(input.value).toBe("10");
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(10);
    expect(slider.style.getPropertyValue("--hjm-slider-fill")).toBe("100%");

    await act(async () => {
      await page.elementLocator(input).click({ position: { x: 1, y: 22 } });
    });
    expect(input.value).toBe("0");
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(0);
    expect(slider.style.getPropertyValue("--hjm-slider-fill")).toBe("0%");
  });

  it("preserves a controlled off-grid DOM value while snapping proposed input", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Slider
          label="점수"
          max={10}
          min={0}
          onValueChange={onValueChange}
          onValueChangeEnd={onValueChangeEnd}
          step={3}
          value={4}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(input.step).toBe("any");
    expect(input.value).toBe("4");
    await setNativeRangeValue(input, 7.4);
    expect(onValueChange).toHaveBeenLastCalledWith(6);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(6);
    expect(input.value).toBe("4");
    await setNativeRangeValue(input, 10);
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(onValueChangeEnd).toHaveBeenLastCalledWith(10);
    expect(input.value).toBe("4");
    expect(input.getAttribute("aria-valuenow")).toBe("4");
    expect(container.querySelector<HTMLElement>(".hjm-slider")?.style
      .getPropertyValue("--hjm-slider-fill")).toBe("40%");
  });
});
