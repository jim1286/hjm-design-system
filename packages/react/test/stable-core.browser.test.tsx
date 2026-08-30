import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Field, HjmProvider } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

let container: HTMLDivElement;
let root: Root;

/** Literal case ids are consumed by the renderer evidence gate. */
export const stableCoreKeyboardCases = [
  { componentId: "field" },
] as const;

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

describe("stable core keyboard evidence", () => {
  it("connects Field label activation, Tab focus, and invalid relationships", async () => {
    expect(
      executedScenarioRegistry.executions.some(({ scenarios }) =>
        scenarios.some(({ id }) => id === "keyboard"),
      ),
    ).toBe(true);
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Field
          controlId="stable-email"
          error="이메일을 확인하세요"
          label="이메일"
          required
        >
          {(controlProps) => <input {...controlProps} />}
        </Field>
      </HjmProvider>,
    ));

    const input = container.querySelector<HTMLInputElement>("#stable-email")!;
    const label = container.querySelector<HTMLLabelElement>('label[for="stable-email"]')!;
    expect(input.tabIndex).toBe(0);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("stable-email-error");

    label.click();
    expect(document.activeElement).toBe(input);
  });
});
