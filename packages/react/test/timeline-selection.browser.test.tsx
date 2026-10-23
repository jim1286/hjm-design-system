import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Timeline } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const items = [
  { id: "a", label: "출발", description: "서울", timestamp: "9:00" },
  { id: "b", label: "경유" },
  { id: "c", label: "도착" },
] as const;
const changes: string[] = [];

function Harness({ initial }: { initial: "a" | "b" | "c" | null }) {
  const [selected, setSelected] = useState<"a" | "b" | "c" | null>(initial);
  return <HjmProvider><Timeline aria-label="여정" items={items} composeAccessibleName={({ position, label }) => `${position}단계 ${label}`}
    selectedId={selected} onSelectedIdChange={id => { changes.push(id); setSelected(id); }} /></HjmProvider>;
}
const options = () => [...host.querySelectorAll<HTMLLIElement>("[role=option]")];
const press = (key: string) => act(async () => {
  document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
});

it("exposes a named vertical listbox with one roving tab stop and the neutral selection surface", async () => {
  changes.length = 0;
  await act(async () => root.render(<Harness initial={null} />));
  const list = host.querySelector("ol")!;
  expect(list.getAttribute("role")).toBe("listbox");
  expect(list.getAttribute("aria-orientation")).toBe("vertical");
  expect(options().map(option => option.tabIndex)).toEqual([0, -1, -1]);
  expect(options().map(option => option.getAttribute("aria-selected"))).toEqual(["false", "false", "false"]);
  // Description and timestamp stay readable as the option's description, the name stays the composed one.
  expect(options()[0]!.getAttribute("aria-label")).toBe("1단계 출발");
  const described = options()[0]!.getAttribute("aria-describedby")!.split(" ").map(id => document.getElementById(id)!.textContent);
  expect(described).toEqual(["서울", "9:00"]);

  await act(async () => options()[1]!.click());
  expect(changes).toEqual(["b"]);
  expect(options()[1]!.getAttribute("aria-selected")).toBe("true");
  expect(options()[1]!.tabIndex).toBe(0);
  expect(getComputedStyle(options()[1]!).boxShadow).not.toBe("none");
  expect(getComputedStyle(options()[1]!).backgroundColor).not.toBe(getComputedStyle(options()[0]!).backgroundColor);
});

it("moves selection with ArrowDown/ArrowUp/Home/End without wrapping and selects with Enter", async () => {
  changes.length = 0;
  await act(async () => root.render(<Harness initial="a" />));
  options()[0]!.focus();
  await press("ArrowUp");
  expect(changes).toEqual([]);
  await press("ArrowDown");
  expect(document.activeElement).toBe(options()[1]);
  expect(options()[1]!.getAttribute("aria-selected")).toBe("true");
  await press("End");
  await press("ArrowDown");
  expect(changes).toEqual(["b", "c"]);
  expect(document.activeElement).toBe(options()[2]);
  await press("Home");
  expect(changes).toEqual(["b", "c", "a"]);
  await press("Enter");
  expect(changes).toEqual(["b", "c", "a"]);
});

it("keeps the passive record and rejects incomplete or conflicting selection props", async () => {
  await act(async () => root.render(<HjmProvider><Timeline items={items} composeAccessibleName={({ label }) => label} /></HjmProvider>));
  expect(host.querySelector("ol")!.getAttribute("role")).toBeNull();
  expect(host.querySelector("[tabindex]")).toBeNull();
  const noop = () => {};
  const messages = [/supplied together/, /does not match/, /aria-label or aria-labelledby/, /per-record actions/];
  for (const [index, node] of [
    <Timeline key="1" items={items} composeAccessibleName={({ label }) => label} selectedId="a" />,
    <Timeline key="2" aria-label="여정" items={items} composeAccessibleName={({ label }) => label} selectedId={"z" as "a"} onSelectedIdChange={noop} />,
    <Timeline key="3" items={items} composeAccessibleName={({ label }) => label} selectedId={null} onSelectedIdChange={noop} />,
    <Timeline key="4" aria-label="여정" items={items} composeAccessibleName={({ label }) => label} selectedId={null} onSelectedIdChange={noop} renderActions={() => <button type="button">x</button>} />,
  ].entries()) {
    const errorRoot = createRoot(document.createElement("div"));
    await expect(act(async () => errorRoot.render(node))).rejects.toThrow(messages[index]!);
    errorRoot.unmount();
  }
});
