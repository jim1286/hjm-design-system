import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { TransferList } from "../src/transfer-list.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const items = [
  { id: "walk", label: "느리게 걸었던 오후", textValue: "느리게 걸었던 오후" },
  { id: "meal", label: "함께 먹은 저녁", textValue: "함께 먹은 저녁" },
  { id: "view", label: "창밖으로 본 풍경", textValue: "창밖으로 본 풍경" },
  { id: "locked", label: "잠긴 기록", textValue: "잠긴 기록", disabled: true },
];
const labels = { source: "전체 기록", target: "고른 기록", toTarget: "담기", toSource: "빼기", selectAll: "모두 선택", empty: "여기에는 아직 없어요" };

const row = (label: string) => [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((node) => node.textContent?.includes(label))!;
const panel = (name: string) => [...document.querySelectorAll<HTMLElement>('[role="group"]')].find((node) => node.getAttribute("aria-label") === name)!;
const rowsOf = (name: string) => [...panel(name).querySelectorAll<HTMLElement>('[role="option"]')].map((node) => node.textContent);
const button = (text: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
const key = async (value: string) => act(async () => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));

function Fixture({ onMove }: { onMove?: (ids: readonly string[], direction: string) => void }) {
  const [target, setTarget] = useState<ReadonlySet<string>>(new Set());
  return (
    <HjmProvider reducedMotion>
      <TransferList items={items} labels={labels} targetKeys={target} onTargetKeysChange={setTarget}
        onMove={(ids, direction) => onMove?.(ids, direction)} />
    </HjmProvider>
  );
}

it("moves a multi-selection entirely by keyboard and reports which ids moved", async () => {
  const onMove = vi.fn();
  await act(async () => root.render(<Fixture onMove={onMove} />));
  await act(async () => row("느리게 걸었던 오후").focus());
  await key(" ");
  await key("ArrowDown");
  await key(" ");
  expect(row("함께 먹은 저녁").getAttribute("aria-selected")).toBe("true");
  await act(async () => button("담기").click());
  expect(rowsOf("고른 기록")).toEqual(["느리게 걸었던 오후", "함께 먹은 저녁"]);
  expect(onMove.mock.calls).toEqual([[["walk", "meal"], "toTarget"]]);
  // A move commits a value; it does not also pre-select the rows at the destination.
  expect(row("느리게 걸었던 오후").getAttribute("aria-selected")).toBe("false");
});

it("moves the focused row on its own, without first building a selection", async () => {
  const onMove = vi.fn();
  await act(async () => root.render(<Fixture onMove={onMove} />));
  await act(async () => row("창밖으로 본 풍경").focus());
  await key("Enter");
  expect(rowsOf("고른 기록")).toEqual(["창밖으로 본 풍경"]);
  expect(onMove.mock.calls).toEqual([[["view"], "toTarget"]]);
});

it("lands focus on the row that slid into the removed position, then on the empty state", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => row("느리게 걸었던 오후").focus());
  await key("Enter");
  await expect.poll(() => document.activeElement?.textContent).toContain("함께 먹은 저녁");
  // Emptying a panel parks focus on its empty state, never on the document body.
  await act(async () => row("느리게 걸었던 오후").focus());
  await key("Enter");
  await expect.poll(() => document.activeElement?.textContent).toBe(labels.empty);
  expect(document.activeElement).not.toBe(document.body);
});

it("excludes disabled rows from select-all and never moves them", async () => {
  const onMove = vi.fn();
  await act(async () => root.render(<Fixture onMove={onMove} />));
  const selectAll = () => panel("전체 기록").querySelector<HTMLElement>('[role="checkbox"]')!;
  expect(selectAll().getAttribute("aria-checked")).toBe("false");
  await act(async () => selectAll().click());
  // Three enabled rows are the whole denominator, so select-all reads as fully checked.
  expect(selectAll().getAttribute("aria-checked")).toBe("true");
  expect(row("잠긴 기록").getAttribute("aria-selected")).toBe("false");
  await act(async () => button("담기").click());
  expect(onMove.mock.calls).toEqual([[["walk", "meal", "view"], "toTarget"]]);
  expect(rowsOf("전체 기록")).toEqual(["잠긴 기록"]);
  await act(async () => row("잠긴 기록").click());
  expect(row("잠긴 기록").getAttribute("aria-selected")).toBe("false");
  expect(button("담기").hasAttribute("disabled")).toBe(true);
});

it("moves rows back and keeps one tab stop per panel", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => row("함께 먹은 저녁").focus());
  await key("Enter");
  const tabbable = (name: string) => [...panel(name).querySelectorAll<HTMLElement>('[role="option"]')].filter((node) => node.tabIndex === 0);
  expect(tabbable("전체 기록")).toHaveLength(1);
  expect(tabbable("고른 기록")).toHaveLength(1);
  await act(async () => row("함께 먹은 저녁").focus());
  await key(" ");
  await act(async () => button("빼기").click());
  expect(rowsOf("고른 기록")).toEqual([]);
  expect(rowsOf("전체 기록")).toEqual(["느리게 걸었던 오후", "함께 먹은 저녁", "창밖으로 본 풍경", "잠긴 기록"]);
});
