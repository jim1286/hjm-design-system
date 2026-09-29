import { act, type ReactNode } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { HjmProvider, Tooltip } from "../src/index.js";
import "../src/styles.css";
// The evidence registry points to this focused keyboard proof; the shared scenario fixture omits tooltip trigger interactions.
// componentId: "tooltip"

let container: HTMLDivElement;
let root: Root;

async function render(node: ReactNode): Promise<void> {
  await act(async () => {
    root.render(node);
    await new Promise((resolve) => setTimeout(resolve, 60));
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
  await page.viewport(1280, 720);
});

describe("Tooltip renderer readiness", () => {
  it("opens on keyboard focus, exposes only a description, and dismisses on Escape without moving focus", async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <span id="existing-description">Existing description</span>
        <Tooltip
          trigger={
            <button
              type="button"
              aria-describedby="existing-description"
              onClick={onClick}
            >
              Help
            </button>
          }
          content="Additional explanation"
          onOpenChange={onOpenChange}
        />
        <button type="button">Next</button>
      </HjmProvider>,
    );

    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    await act(async () => userEvent.tab());
    expect(document.activeElement).toBe(trigger);

    const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]');
    expect(tooltip?.textContent).toBe("Additional explanation");
    expect(trigger.getAttribute("aria-describedby")?.split(" ")).toEqual([
      "existing-description",
      tooltip!.id,
    ]);
    expect(tooltip?.querySelector("a, button, input, [tabindex]")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await act(async () => userEvent.keyboard("{Escape}"));
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
    expect(trigger.getAttribute("aria-describedby")).toBe("existing-description");
    expect(document.activeElement).toBe(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "escape" });

    await act(async () => userEvent.click(trigger));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("wraps long plain-text content inside a narrow viewport", async () => {
    await page.viewport(320, 720);
    const longCopy =
      "An unusually long product sentence with verylongunbrokenidentifierlikewordsthatmustwrap and more explanatory text.";
    await render(
      <HjmProvider systemTheme="light">
        <Tooltip
          defaultOpen
          trigger={<button type="button">Help</button>}
          content={longCopy}
        />
      </HjmProvider>,
    );

    const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(tooltip.textContent).toBe(longCopy);
    expect(tooltip.scrollWidth).toBeLessThanOrEqual(tooltip.clientWidth + 1);
    // The 80vw content cap is 256px; content-box padding adds 32px.
    expect(tooltip.getBoundingClientRect().width).toBeLessThanOrEqual(289);
  });
});
