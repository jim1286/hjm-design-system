import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../src/actions.js";
import { Chip } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

/**
 * Regression for the 1.4.0 focus ring: rules that read the then-undefined
 * --hjm-color-focus were invalid at computed-value time, so a keyboard user saw
 * no outline at all on Chip and twenty other families. The SSR variable test
 * proves the name is emitted; this proves a real browser draws the ring.
 */
let container: HTMLDivElement;
let root: Root;

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

describe("keyboard focus indicator", () => {
  it.each(["light", "dark"] as const)("draws the shared focus ring on Chip and Button in %s mode", async (theme) => {
    await act(async () => root.render(
      <HjmProvider theme={theme} systemTheme={theme}>
        <Chip label="Filter" />
        <Button>Save</Button>
      </HjmProvider>,
    ));
    const provider = container.querySelector<HTMLElement>("[data-hjm-provider]")!;
    const focusColor = getComputedStyle(provider).getPropertyValue("--hjm-color-focus").trim();
    expect(focusColor).not.toBe("");

    for (const name of ["Filter", "Save"]) {
      await act(async () => userEvent.tab());
      const focused = document.activeElement as HTMLElement;
      expect(focused.textContent).toContain(name);
      const style = getComputedStyle(focused);
      expect(style.outlineStyle, name).toBe("solid");
      expect(style.outlineWidth, name).toBe("2px");
      expect(style.outlineColor, name).not.toBe("rgba(0, 0, 0, 0)");
    }
  });
});
