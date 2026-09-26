import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { HjmProvider, Sheet, TextField } from "../src/index.js";
import "../src/styles.css";

/**
 * 1.5.0 aligns the Web API with Native where the same intent had two shapes:
 * TextField gains onValueChange(string) and Sheet gains the recipe `size`.
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

describe("Web API aligned with Native", () => {
  it("reports TextField values through onValueChange while keeping onChange", async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <TextField label="Name" onValueChange={onValueChange} onChange={onChange} />
      </HjmProvider>,
    ));
    const input = container.querySelector("input")!;
    await act(async () => userEvent.type(input, "Ada"));
    expect(onValueChange).toHaveBeenLastCalledWith("Ada");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("opens a Sheet at the recipe size", async () => {
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Sheet open onOpenChange={() => {}} title="Filter" closeLabel="Close" size="large" />
      </HjmProvider>,
    ));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
    const sheet = document.body.querySelector<HTMLElement>(".hjm-sheet")!;
    expect(sheet.dataset.detent).toBe("large");
    expect(sheet.getBoundingClientRect().height).toBeCloseTo(window.innerHeight * 0.85, -1);
  });
});
