import { act, create } from "react-test-renderer";
import { useState } from "react";
import { AccessibilityInfo, TextInput } from "react-native";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field, Form, HjmNativeProvider } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const formInteractionCases = [{ componentId: "form" }] as const;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Form Native host actions", () => {
  it("submits the latest edited field value through its host action", async () => {
    expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/form.interaction.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
    const onSubmit = vi.fn(async (_values: { name: string }) => undefined);
    let renderer!: ReturnType<typeof create>;
    function Fixture() {
      const [name, setName] = useState("민");
      return (
        <HjmNativeProvider reducedMotion theme="light">
          <Form
            fallbackErrorMessage="저장하지 못했습니다."
            label="프로필"
            onSubmit={onSubmit}
            submitLabel="저장"
            values={{ name }}
          >
            <Field label="이름" required>
              {(props) => (
                <TextInput
                  {...props}
                  accessibilityRole="text"
                  onChangeText={setName}
                  value={name}
                />
              )}
            </Field>
          </Form>
        </HjmNativeProvider>
      );
    }

    await act(async () => {
      renderer = create(<Fixture />);
    });
    const input = renderer.root.findByType(TextInput);
    act(() => input.props.onChangeText("지민"));
    expect(renderer.root.findByType(TextInput).props.value).toBe("지민");

    await act(async () => {
      renderer.root.find((node) => node.props.accessibilityLabel === "저장").props.onPress();
    });

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({ name: "지민" });
  });

  it("focuses the product-selected first invalid field and skips submit", async () => {
    expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/form.interaction.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
    const focus = vi.fn();
    const setAccessibilityFocus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
    const onSubmit = vi.fn();
    const firstInvalidFieldRef = { current: { focus } } as unknown as RefObject<TextInput | null>;
    let renderer!: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(
        <HjmNativeProvider reducedMotion theme="light">
          <Form
            fallbackErrorMessage="저장하지 못했습니다."
            firstInvalidFieldRef={firstInvalidFieldRef}
            label="프로필"
            onSubmit={onSubmit}
            submitLabel="저장"
            values={{ name: "" }}
          >
            <Field label="이름" required>
              <TextInput accessibilityLabel="이름 *" />
            </Field>
          </Form>
        </HjmNativeProvider>,
      );
    });

    await act(async () => {
      renderer.root.find((node) => node.props.accessibilityLabel === "저장").props.onPress();
    });

    expect(focus).toHaveBeenCalledOnce();
    expect(setAccessibilityFocus).toHaveBeenCalledWith(1);
    expect(onSubmit).not.toHaveBeenCalled();
    setAccessibilityFocus.mockRestore();
  });
});
