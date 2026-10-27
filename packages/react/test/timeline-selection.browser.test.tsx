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

function Harness({ initial, journal = false }: { initial: "a" | "b" | "c" | null; journal?: boolean }) {
  const [selected, setSelected] = useState<"a" | "b" | "c" | null>(initial);
  return <HjmProvider><Timeline variant={journal ? "journal" : "record"} aria-label="여정" items={items} composeAccessibleName={({ position, label }) => `${position}단계 ${label}`}
    selectedId={selected} onSelectedIdChange={id => { changes.push(id); setSelected(id); }} /></HjmProvider>;
}
const options = () => [...host.querySelectorAll<HTMLLIElement>("[role=option]")];
const press = (key: string) => act(async () => {
  document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
});

it("journal uses unfilled disclosure buttons and reopens external keyboard selection", async () => {
  changes.length = 0;
  await act(async () => root.render(<Harness initial="a" journal />));
  const buttons = () => [...host.querySelectorAll<HTMLButtonElement>("button[data-timeline-id]")];
  expect(host.querySelector('[role="listbox"]')).toBeNull();
  const first = buttons()[0]!;
  expect(first.getAttribute("aria-expanded")).toBe("true");
  expect(getComputedStyle(first).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(first).boxShadow).toBe("none");
  const details = document.getElementById(first.getAttribute("aria-controls")!)!;
  expect(details.hidden).toBe(false);
  await act(async () => first.click());
  expect(first.getAttribute("aria-expanded")).toBe("false");
  expect(details.hidden).toBe(true);
  expect(changes).toEqual([]);
  await press("ArrowDown");
  expect(buttons()[1]!.getAttribute("aria-expanded")).toBe("true");
  await press("Home");
  expect(first.getAttribute("aria-expanded")).toBe("true");
  expect(details.hidden).toBe(false);
  expect(changes).toEqual(["b", "a"]);
});

it("default passive journal preserves visible details, event tone and independent commands", async () => {
  let restored = false;
  await act(async () => root.render(<HjmProvider><Timeline aria-label="버전 기록"
    items={[{id: "a", label: "Version 1", tone: "success", description: "Saved content", timestamp: "Today", emphasized: true}]}
    composeAccessibleName={({label}) => label} renderMetadata={() => <span>Reviewed</span>}
    renderActions={() => <button onClick={() => { restored = true; }}>Restore</button>} /></HjmProvider>));
  const record = host.querySelector<HTMLElement>(".hjm-timeline__item")!;
  expect(host.querySelector("ol")!.dataset.variant).toBe("journal");
  expect(host.querySelectorAll("button")).toHaveLength(1);
  expect(getComputedStyle(record).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(host.querySelector<HTMLElement>(".hjm-timeline__details")!.hidden).toBe(false);
  expect(record.textContent).toContain("Saved content");
  expect(getComputedStyle(host.querySelector(".hjm-timeline__dot")!).backgroundColor).not.toBe(getComputedStyle(record).backgroundColor);
  await act(async () => host.querySelector("button")!.click());
  expect(restored).toBe(true);
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
