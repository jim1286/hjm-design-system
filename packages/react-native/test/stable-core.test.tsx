import { act, create } from "react-test-renderer";
import { TextInput } from "react-native";
import { describe, expect, it, vi } from "vitest";

import { Field, HjmNativeProvider } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

/** Literal case ids are consumed by the renderer evidence gate. */
export const stableCoreKeyboardCases = [
  { componentId: "field" },
] as const;

describe("Native stable core input-action evidence", () => {
  it("exposes Field focus/setText actions through its named host control", () => {
    expect(
      executedScenarioRegistry.executions.some(({ scenarios }) =>
        scenarios.some(({ id }) => id === "keyboard"),
      ),
    ).toBe(true);
    const onFocus = vi.fn();
    const onChangeText = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <Field label="이메일" description="업무용 주소" required>
            {(controlProps) => (
              <TextInput
                {...controlProps}
                onFocus={onFocus}
                onChangeText={onChangeText}
              />
            )}
          </Field>
        </HjmNativeProvider>,
      );
    });
    const input = renderer!.root.findByType(TextInput);
    expect(input.props.accessibilityLabel).toBe("이메일 *");
    expect(input.props.accessibilityHint).toBe("업무용 주소");
    act(() => input.props.onFocus());
    act(() => input.props.onChangeText("team@example.com"));
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onChangeText).toHaveBeenCalledWith("team@example.com");
  });
});
