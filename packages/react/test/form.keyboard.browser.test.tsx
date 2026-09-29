import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { Field, Form, HjmProvider } from "../src/index.js";

let container: HTMLDivElement;
let root: Root;

export const formKeyboardCases = [{ componentId: "form" }] as const;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
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

describe("Form browser interaction", () => {
  it("keeps field editing native and submits the changed value by Enter", async () => {
    expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/form.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
    let submittedValue: FormDataEntryValue | null = null;
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      submittedValue = new FormData(event.currentTarget).get("displayName");
    });
    await render(
      <HjmProvider systemTheme="light">
        <Form onSubmit={onSubmit}>
          <Field controlId="display-name" label="표시 이름" required>
            <input id="display-name" name="displayName" required defaultValue="민" />
          </Field>
          <button type="submit">저장</button>
        </Form>
      </HjmProvider>,
    );

    const input = container.querySelector<HTMLInputElement>('input[name="displayName"]')!;
    await userEvent.clear(input);
    await userEvent.type(input, "지민{Enter}");

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(submittedValue).toBe("지민");
    expect(document.activeElement).toBe(input);
  });
});
