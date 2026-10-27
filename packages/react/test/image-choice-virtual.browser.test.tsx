import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { ImageChoiceGroup } from "../src/image-choice.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

// 2026-10-18 BurnTok share sheet: hundreds of recipients must not mount hundreds of tiles.
let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "376px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const people = Array.from({ length: 300 }, (_, index) => ({ id: `p${index}`, label: `친구 ${index}`, image: <span /> }));
function Fixture() {
  const [value, setValue] = useState<string[]>([]);
  return <HjmProvider><ImageChoiceGroup label="보낼 사람" showItemLabels virtualized={{ height: 300 }} selectionMode="multiple" value={value} onValueChange={setValue} items={people} /></HjmProvider>;
}
const settle = () => act(async () => { await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });

it("mounts only the rows near the viewport, follows scrolling and keeps selection on remounted tiles", async () => {
  await act(async () => root.render(<Fixture />));
  await settle();
  const viewport = host.querySelector<HTMLElement>(".hjm-image-choice__viewport")!;
  expect(viewport.getAttribute("role")).toBe("group");
  expect(viewport.clientHeight).toBe(300);
  const tiles = () => [...host.querySelectorAll<HTMLButtonElement>(".hjm-image-choice__tile")];
  // 376 − 2×4 inset = 368 → 4 tiles of 80 with 8 gaps per row.
  const firstRow = host.querySelector<HTMLElement>(".hjm-image-choice__row")!;
  expect(firstRow.children).toHaveLength(4);
  expect(tiles().length).toBeGreaterThan(0);
  expect(tiles().length).toBeLessThan(80);
  // Every tile in a row has the same reserved height, and rows are laid out at that stride.
  const rows = [...host.querySelectorAll<HTMLElement>(".hjm-image-choice__row")];
  expect(rows[1]!.offsetTop - rows[0]!.offsetTop).toBe(firstRow.offsetHeight + 8);
  await act(async () => { tiles()[0]!.click(); });
  expect(tiles()[0]!.getAttribute("aria-checked")).toBe("true");
  await act(async () => { viewport.scrollTop = viewport.scrollHeight; viewport.dispatchEvent(new Event("scroll")); });
  expect(tiles().some(tile => tile.getAttribute("aria-label") === "친구 299")).toBe(true);
  expect(tiles().some(tile => tile.getAttribute("aria-label") === "친구 0")).toBe(false);
  await act(async () => { viewport.scrollTop = 0; viewport.dispatchEvent(new Event("scroll")); });
  expect(tiles()[0]!.getAttribute("aria-checked")).toBe("true");
});

it("keeps a focused tile mounted after it scrolls out of the window", async () => {
  await act(async () => root.render(<Fixture />));
  await settle();
  const viewport = host.querySelector<HTMLElement>(".hjm-image-choice__viewport")!;
  const first = host.querySelector<HTMLButtonElement>('[aria-label="친구 0"]')!;
  await act(async () => { first.focus(); });
  await act(async () => { viewport.scrollTop = viewport.scrollHeight; viewport.dispatchEvent(new Event("scroll")); });
  expect(host.querySelector('[aria-label="친구 0"]')).toBe(first);
  expect(document.activeElement).toBe(first);
});

// Sparse decoration lists retain the same columns as a full row instead of stretching to both edges.
it.each([false, true])("keeps the second choice in its column with virtualization=%s", async (virtual) => {
  host.style.width = "280px";
  const render = async (count: number) => {
    await act(async () => root.render(<HjmProvider><ImageChoiceGroup label="장식" selectionMode="single"
      value={null} onValueChange={() => {}} items={people.slice(0, count)}
      virtualized={virtual ? { height: 200 } : undefined} /></HjmProvider>));
    await settle();
    return [...host.querySelectorAll<HTMLElement>(".hjm-image-choice__tile")].map(tile => tile.getBoundingClientRect().left);
  };
  const full = await render(3);
  const sparse = await render(2);
  expect(sparse[0]).toBeCloseTo(full[0]!, 1);
  expect(sparse[1]).toBeCloseTo(full[1]!, 1);
  expect(sparse[1]!).toBeLessThan(full[2]!);
});
