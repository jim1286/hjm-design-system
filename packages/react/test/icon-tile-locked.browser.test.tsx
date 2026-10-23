import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { iconTileRecipe } from "@hjmds/design-contracts/screen-patterns";
import { IconTile } from "../src/screens.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const badge = <span data-badge="" style={{ display: "block", width: 16, height: 16 }} />;

it("keeps a locked tile pressable, dims icon and label but not the corner accessory, and names the lock", async () => {
  const activate = vi.fn();
  await act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion><div style={{ width: 96 }}>
    <IconTile label="날씨" icon={<span>☀</span>} onActivate={activate} locked lockedLabel="로그인 필요" accessory={badge} />
  </div></HjmProvider>));
  const button = host.querySelector("button")!;
  expect(button.disabled).toBe(false);
  expect(button.getAttribute("aria-label")).toBe("날씨, 로그인 필요");
  button.click();
  expect(activate).toHaveBeenCalledTimes(1);
  const frame = host.querySelector<HTMLElement>("[data-hjm-icon-tile] > span:first-child")!;
  expect(Number(getComputedStyle(frame).opacity)).toBeCloseTo(iconTileRecipe.locked.opacity);
  const mark = host.querySelector<HTMLElement>("[data-badge]")!;
  let node: HTMLElement | null = mark, opacity = 1;
  while (node) { opacity *= Number(getComputedStyle(node).opacity); node = node.parentElement; }
  expect(opacity).toBe(1);
  const frameBox = frame.getBoundingClientRect(), markBox = mark.getBoundingClientRect();
  expect(markBox.right).toBeCloseTo(frameBox.right + iconTileRecipe.accessory.offset);
  expect(markBox.top).toBeCloseTo(frameBox.top - iconTileRecipe.accessory.offset);
});

it("places the accessory on the bottom-end corner of a filling icon and rejects a lock without a reason", async () => {
  await act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion><div style={{ width: 60 }}>
    <IconTile label="도구" size="fill" icon={<span>A</span>} accessory={badge} accessoryPlacement="bottom-end" />
  </div></HjmProvider>));
  const frame = host.querySelector<HTMLElement>("[data-hjm-icon-tile] > span:first-child")!.getBoundingClientRect();
  const mark = host.querySelector<HTMLElement>("[data-badge]")!.getBoundingClientRect();
  expect(mark.right).toBeCloseTo(frame.right + iconTileRecipe.accessory.offset);
  expect(mark.bottom).toBeCloseTo(frame.bottom + iconTileRecipe.accessory.offset);
  expect(() => act(() => root.render(<IconTile label="x" icon="x" onActivate={() => {}} locked />))).toThrow(TypeError);
  expect(() => act(() => root.render(<IconTile label="x" icon="x" locked lockedLabel="잠김" />))).toThrow(TypeError);
});
