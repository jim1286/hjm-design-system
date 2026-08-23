import type { ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { TextInput } from "react-native";
import { describe, expect, it, vi } from "vitest";

import { HjmNativeProvider, OtpField, PasswordField } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(node: ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>,
      { createNodeMock: () => ({ setNativeProps: vi.fn() }) },
    );
  });
  return renderer!;
}

function byLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

describe("Native PasswordField", () => {
  it("translates autofill and toggles secure entry without changing value", () => {
    const onValueChange = vi.fn();
    const onRevealedChange = vi.fn();
    const renderer = render(
      <PasswordField
        autofillHint="new"
        concealLabel="비밀번호 숨기기"
        defaultValue="secret-value"
        label="비밀번호"
        onRevealedChange={onRevealedChange}
        onValueChange={onValueChange}
        revealLabel="비밀번호 보기"
      />,
    );
    const input = renderer.root.findByType(TextInput);
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.autoComplete).toBe("new-password");
    expect(input.props.textContentType).toBe("newPassword");

    act(() => byLabel(renderer, "비밀번호 보기").props.onPress());

    expect(renderer.root.findByType(TextInput).props.secureTextEntry).toBe(false);
    expect(renderer.root.findByType(TextInput).props.value).toBe("secret-value");
    expect(byLabel(renderer, "비밀번호 숨기기")).toBeTruthy();
    expect(onRevealedChange).toHaveBeenLastCalledWith(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Native OtpField", () => {
  it("uses one accessible TextInput and sanitizes the complete value", () => {
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    const renderer = render(
      <OtpField
        accessibilityLabel="인증번호"
        length={6}
        onComplete={onComplete}
        onValueChange={onValueChange}
      />,
    );
    expect(renderer.root.findAllByType(TextInput)).toHaveLength(1);
    const input = renderer.root.findByType(TextInput);
    expect(input.props.keyboardType).toBe("number-pad");
    expect(input.props.textContentType).toBe("oneTimeCode");

    act(() => input.props.onChangeText("12-3a4567"));

    expect(renderer.root.findByType(TextInput).props.value).toBe("123456");
    expect(onValueChange).toHaveBeenLastCalledWith("123456");
    expect(onComplete).toHaveBeenLastCalledWith("123456");
    expect(renderer.root.findAll((node) => node.props.accessible === false).length)
      .toBeGreaterThanOrEqual(6);
  });
});
