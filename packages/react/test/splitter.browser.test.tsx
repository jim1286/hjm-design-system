import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Splitter } from "../src/splitter.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const separator = () => document.querySelector<HTMLElement>('[role="separator"]')!;
const primary = () => document.querySelector<HTMLElement>('[data-pane="primary"]')!;
const key = async (value: string) => act(async () => separator().dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));
const pointer = async (type: string, clientX: number, clientY = 200) => act(async () => {
  separator().dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX, clientY, pointerId: 1, button: 0, isPrimary: true }));
});

function Fixture({ direction = "ltr", ...props }: Record<string, unknown> & { direction?: "ltr" | "rtl" }) {
  const [value, setValue] = useState(40);
  return (
    <HjmProvider reducedMotion direction={direction}>
      <div style={{ inlineSize: 400, blockSize: 400 }}>
        <Splitter label="패널 크기 조절" min={20} max={80} step={5} value={value}
          onValueChange={setValue} getValueText={(current) => `${current}%`}
          primaryPane={<p>목록</p>} secondaryPane={<p>상세</p>}
          style={{ blockSize: 400 }} {...props} />
      </div>
    </HjmProvider>
  );
}

it("exposes a separator whose orientation is perpendicular to the pane axis", async () => {
  await act(async () => root.render(<Fixture />));
  expect(separator().getAttribute("aria-orientation")).toBe("vertical");
  expect(separator().getAttribute("aria-valuenow")).toBe("40");
  expect(separator().getAttribute("aria-valuemin")).toBe("20");
  expect(separator().getAttribute("aria-valuemax")).toBe("80");
  expect(separator().getAttribute("aria-valuetext")).toBe("40%");
  expect(separator().tabIndex).toBe(0);
  // Thin visible line inside a 44px hit target, as the recipe splits them.
  expect(Math.round(separator().getBoundingClientRect().width)).toBe(44);
  expect(Math.round(document.querySelector<HTMLElement>(".hjm-splitter__handle")!.getBoundingClientRect().width)).toBe(1);

  await act(async () => root.render(<Fixture axis="vertical" />));
  expect(separator().getAttribute("aria-orientation")).toBe("horizontal");
});

it("steps with arrow keys, jumps to the boundary with Home and End, and stops there", async () => {
  const end = vi.fn();
  await act(async () => root.render(<Fixture onValueChangeEnd={end} />));
  await key("ArrowRight");
  expect(separator().getAttribute("aria-valuenow")).toBe("45");
  await key("ArrowLeft");
  await key("ArrowLeft");
  expect(separator().getAttribute("aria-valuenow")).toBe("35");
  // Arrow keys off the pane axis belong to the pane content, not the separator.
  await key("ArrowUp");
  expect(separator().getAttribute("aria-valuenow")).toBe("35");
  await key("End");
  expect(separator().getAttribute("aria-valuenow")).toBe("80");
  await key("ArrowRight");
  expect(separator().getAttribute("aria-valuenow")).toBe("80");
  await key("Home");
  expect(separator().getAttribute("aria-valuenow")).toBe("20");
  // Keyboard resize settles immediately; every committed step reports an end.
  expect(end.mock.calls.map(([value]) => value)).toEqual([45, 40, 35, 80, 20]);
});

it("snaps a drag to the same step grid the keyboard uses and reports one end per drag", async () => {
  const end = vi.fn();
  await act(async () => root.render(<Fixture onValueChangeEnd={end} />));
  const box = document.querySelector<HTMLElement>(".hjm-splitter")!.getBoundingClientRect();
  await pointer("pointerdown", box.left + box.width * 0.5);
  // 0.52 of a 20..80 range is 51.2, which must land on the 5-step grid.
  await pointer("pointermove", box.left + box.width * 0.52);
  expect(separator().getAttribute("aria-valuenow")).toBe("50");
  await pointer("pointermove", box.left + box.width * 0.95);
  expect(separator().getAttribute("aria-valuenow")).toBe("75");
  await pointer("pointerup", box.left + box.width * 0.95);
  expect(end).toHaveBeenCalledTimes(1);
  // A move after the release is not a resize.
  await pointer("pointermove", box.left + box.width * 0.2);
  expect(separator().getAttribute("aria-valuenow")).toBe("75");
});

it("grows the primary pane toward the logical start in RTL for both drag and keyboard", async () => {
  await act(async () => root.render(<Fixture direction="rtl" />));
  const box = document.querySelector<HTMLElement>(".hjm-splitter")!.getBoundingClientRect();
  // The primary pane is docked to the right in RTL, so pointer distance is
  // measured from that edge — the same inversion the arrow keys use.
  expect(Math.round(primary().getBoundingClientRect().right)).toBe(Math.round(box.right));
  await pointer("pointerdown", box.right - box.width * 0.5);
  await pointer("pointermove", box.right - box.width * 0.75);
  expect(separator().getAttribute("aria-valuenow")).toBe("65");
  await pointer("pointerup", box.right - box.width * 0.75);
  await key("ArrowLeft");
  expect(separator().getAttribute("aria-valuenow")).toBe("70");
  await key("ArrowRight");
  expect(separator().getAttribute("aria-valuenow")).toBe("65");
});

it("ignores pointer and keyboard resize while disabled and stays out of the tab order", async () => {
  const change = vi.fn();
  await act(async () => root.render(<Fixture disabled onValueChange={change} />));
  expect(separator().tabIndex).toBe(-1);
  expect(separator().getAttribute("aria-disabled")).toBe("true");
  await key("ArrowRight");
  const box = document.querySelector<HTMLElement>(".hjm-splitter")!.getBoundingClientRect();
  await pointer("pointerdown", box.left + box.width * 0.8);
  await pointer("pointermove", box.left + box.width * 0.8);
  expect(separator().getAttribute("aria-valuenow")).toBe("40");
  expect(change).not.toHaveBeenCalled();
});
