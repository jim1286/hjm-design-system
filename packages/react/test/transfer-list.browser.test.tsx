import { act, useState } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { TransferList } from "../src/transfer-list.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
import { hasHitArea } from "./touch-tap.js";
// The evidence registry points to this focused keyboard proof; the shared scenario fixture omits TransferList moves.
// componentId: "transfer-list"

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

it("keeps long localized row copy visible and wrapped at a narrow viewport", async () => {
  await page.viewport(360, 720);
  const longLabel = "배송 및 결제 내역에서 변경할 수 있는 주문 항목과 매우긴식별자문자열도잘리지않고끝까지읽을수있어야합니다";
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <TransferList
        items={[{ id: "long", label: longLabel, textValue: longLabel }]}
        labels={{
          source: "아직 선택하지 않은 항목 전체 목록",
          target: "최종 선택한 항목 전체 목록",
          toTarget: "선택한 항목을 최종 목록에 담기",
          toSource: "최종 목록에서 선택 항목 빼기",
          selectAll: "현재 목록의 선택 가능한 항목 모두 선택하기",
          empty: "이 목록에는 아직 선택된 항목이 없습니다",
        }}
      />
    </HjmProvider>,
  ));

  const longRow = row(longLabel);
  expect(longRow.textContent).toBe(longLabel);
  expect(getComputedStyle(longRow).overflowWrap).toBe("anywhere");
  expect(longRow.scrollWidth).toBeLessThanOrEqual(longRow.clientWidth + 1);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth + 1);
});

// 2026-09-30 responsive audit WR-0930-7: the select-all marks hit 16x16.
it("gives each select-all checkbox a 44px hit area", async () => {
  // Keep the marks away from the iframe edge so every sampled point is on screen.
  await page.viewport(900, 720);
  host.style.padding = "32px";
  await act(async () => root.render(<Fixture />));
  const marks = [...document.querySelectorAll<HTMLElement>(".hjm-transfer-list__select-all")];
  expect(marks).toHaveLength(2);
  for (const mark of marks) expect(hasHitArea(mark)).toBe(true);
});
