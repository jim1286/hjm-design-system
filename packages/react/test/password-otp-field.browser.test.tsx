import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HjmProvider, OtpField, PasswordField } from "../src/index.js";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

function replaceInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
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

describe("PasswordField", () => {
  it("toggles presentation without changing value and preserves selection", async () => {
    const onValueChange = vi.fn();
    const onRevealedChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <PasswordField
          autofillHint="current"
          concealLabel="Hide password"
          defaultValue="secret-value"
          label="Password"
          onRevealedChange={onRevealedChange}
          onValueChange={onValueChange}
          revealLabel="Show password"
        />
      </HjmProvider>,
    );

    const input = container.querySelector<HTMLInputElement>(".hjm-password-field__input")!;
    const toggle = container.querySelector<HTMLButtonElement>(".hjm-password-field__toggle")!;
    await act(async () => {
      input.focus();
      input.setSelectionRange(2, 7);
    });
    expect(input.type).toBe("password");
    expect(input.autocomplete).toBe("current-password");
    expect(toggle.getAttribute("aria-label")).toBe("Show password");

    await act(async () => toggle.click());

    expect(input.type).toBe("text");
    expect(input.value).toBe("secret-value");
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(7);
    expect(toggle.getAttribute("aria-label")).toBe("Hide password");
    expect(onRevealedChange).toHaveBeenLastCalledWith(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("OtpField", () => {
  it("keeps one textbox while sanitizing paste and rendering decorative slots", async () => {
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <OtpField
          aria-label="Verification code"
          length={6}
          onComplete={onComplete}
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    );

    const inputs = container.querySelectorAll<HTMLInputElement>(".hjm-otp-field__input");
    expect(inputs).toHaveLength(1);
    expect(container.querySelectorAll(".hjm-otp-field__slot")).toHaveLength(6);
    expect(container.querySelector(".hjm-otp-field__slots")?.getAttribute("aria-hidden"))
      .toBe("true");

    await act(async () => replaceInputValue(inputs[0]!, "12-3a4567"));

    expect(inputs[0]!.value).toBe("123456");
    expect(onValueChange).toHaveBeenLastCalledWith("123456");
    expect(onComplete).toHaveBeenLastCalledWith("123456");
    expect([...container.querySelectorAll(".hjm-otp-field__slot")].map((slot) => slot.textContent))
      .toEqual(["1", "2", "3", "4", "5", "6"]);
  });
});
