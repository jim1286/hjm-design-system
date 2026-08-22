import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NumberField } from "../src/number-field.js";
import { HjmProvider } from "../src/provider.js";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

async function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  await act(async () => {
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("NumberField interaction", () => {
  it("keeps partial drafts local, then snaps a complete draft on blur", async () => {
    const onValueChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <NumberField
          decrementLabel="감소"
          incrementLabel="증가"
          label="타율"
          max={1}
          min={0}
          step={0.001}
          defaultValue={0.3}
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('[role="spinbutton"]')!;

    await act(async () => input.focus());
    await type(input, "-");
    expect(onValueChange).not.toHaveBeenCalled();
    await act(async () => input.blur());
    expect(input.value).toBe("0.3");
    expect(onValueChange).not.toHaveBeenCalled();

    await act(async () => input.focus());
    await type(input, "0.3574");
    expect(onValueChange).not.toHaveBeenCalled();
    await act(async () => input.blur());
    expect(input.value).toBe("0.357");
    expect(onValueChange).toHaveBeenLastCalledWith(0.357);
  });

  it("uses the same resolver for steppers and Arrow keys", async () => {
    const onValueChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <NumberField
          decrementLabel="수량 감소"
          incrementLabel="수량 증가"
          label="수량"
          max={3}
          min={1}
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
    const decrement = container.querySelector<HTMLButtonElement>('[aria-label="수량 감소"]')!;
    const increment = container.querySelector<HTMLButtonElement>('[aria-label="수량 증가"]')!;

    await act(async () => increment.click());
    expect(input.value).toBe("1");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    expect(document.activeElement).toBe(input);
    expect(decrement.disabled).toBe(true);

    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });
    expect(input.value).toBe("2");
    expect(onValueChange).toHaveBeenLastCalledWith(2);

    await act(async () => increment.click());
    expect(input.value).toBe("3");
    expect(increment.disabled).toBe(true);
    const callsAtMax = onValueChange.mock.calls.length;
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });
    expect(onValueChange).toHaveBeenCalledTimes(callsAtMax);
  });

  it("moves an off-grid draft to the next boundary in the requested direction", async () => {
    const onValueChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <NumberField
          decrementLabel="감소"
          defaultValue={2}
          incrementLabel="증가"
          label="값"
          max={10}
          min={0}
          onValueChange={onValueChange}
          step={0.5}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
    const decrement = container.querySelector<HTMLButtonElement>('[aria-label="감소"]')!;
    const increment = container.querySelector<HTMLButtonElement>('[aria-label="증가"]')!;

    await type(input, "4.26");
    await act(async () => increment.click());
    expect(input.value).toBe("4.5");
    expect(onValueChange).toHaveBeenLastCalledWith(4.5);

    await type(input, "4.24");
    await act(async () => decrement.click());
    expect(input.value).toBe("4");
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it("updates stepper availability from the visible draft instead of stale committed bounds", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <NumberField
          decrementLabel="감소"
          defaultValue={10}
          incrementLabel="증가"
          label="값"
          max={10}
          min={0}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
    const decrement = container.querySelector<HTMLButtonElement>('[aria-label="감소"]')!;
    const increment = container.querySelector<HTMLButtonElement>('[aria-label="증가"]')!;
    expect(increment.disabled).toBe(true);

    await type(input, "4");
    expect(increment.disabled).toBe(false);
    await act(async () => increment.click());
    expect(input.value).toBe("5");

    await type(input, "0");
    expect(decrement.disabled).toBe(true);
    await type(input, "6");
    expect(decrement.disabled).toBe(false);
  });

  it("reports but does not visually accept a rejected controlled step", async () => {
    const onValueChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <NumberField
          decrementLabel="감소"
          incrementLabel="증가"
          label="수량"
          max={10}
          min={0}
          value={4}
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
    const increment = container.querySelector<HTMLButtonElement>('[aria-label="증가"]')!;
    await act(async () => increment.click());
    expect(onValueChange).toHaveBeenCalledWith(5);
    expect(input.value).toBe("4");
    expect(input.getAttribute("aria-valuenow")).toBe("4");
  });
});
