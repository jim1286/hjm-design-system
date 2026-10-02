import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Menu } from "../src/overlays.js";
import { MorphingMenu } from "../src/menu-morph.js";
import { ContextMenu } from "../src/context-menu.js";
import { Table } from "../src/advanced-display.js";
import { DataTable } from "../src/data-table.js";
import { CarouselMotion } from "../src/carousel-motion.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement;
afterEach(async () => { if (root) await act(() => root!.unmount()); root = undefined; host?.remove(); vi.restoreAllMocks(); });
async function render(child: ReactNode) {
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  await act(() => root!.render(<HjmProvider reducedMotion={false}>{child}</HjmProvider>));
}
function key(node: Element, value: string) { node.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })); }
const items = [
  { id: "z", label: "Zed", textValue: "Zed" },
  { id: "a", label: <span>First decorated label</span>, textValue: "Alpha" },
  { id: "disabled", label: "Locked", textValue: "Alpine", disabled: true },
  { id: "b", label: <span>Second decorated label</span>, textValue: "Amber" },
];
for (const presentation of ["base", "morph"] as const) {
  it(`${presentation} menu searches declared text, skips disabled choices and cycles repeated letters`, async () => {
    await render(presentation === "base"
      ? <Menu label="Actions" trigger={<button>Open</button>} items={items} open onOpenChange={() => {}} />
      : <MorphingMenu label="Actions" items={items} open onOpenChange={() => {}} />);
    vi.spyOn(Date, "now").mockReturnValue(1000);
    const first = document.querySelector<HTMLElement>('[role="menuitem"]')!;
    first.focus();
    await act(() => key(first, "a"));
    expect(document.activeElement?.textContent).toContain("First decorated label");
    await act(() => key(document.activeElement!, "a"));
    expect(document.activeElement?.textContent).toContain("Second decorated label");
    // A reset uses one letter again, rather than carrying an unmatched prefix.
    vi.mocked(Date.now).mockReturnValue(1500);
    await act(() => key(document.activeElement!, "a"));
    expect(document.activeElement?.textContent).toContain("First decorated label");
  });
}
it("context menu uses the same circular repeated-letter search without changing its trigger", async () => {
  await render(<ContextMenu accessibilityLabel="Actions" items={items.map(item => ({ ...item, label: item.id }))} onAction={() => {}}><button>Target</button></ContextMenu>);
  await act(() => host.querySelector("button")!.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 30, clientY: 30 })));
  vi.spyOn(Date, "now").mockReturnValue(1000);
  const menu = document.querySelector('[role="menu"]')!;
  await act(() => key(menu, "a"));
  expect(document.querySelector('[data-active]')?.textContent).toBe("a");
  await act(() => key(menu, "a"));
  expect(document.querySelector('[data-active]')?.textContent).toBe("b");
});
it("shared sorting preserves Table's two-state cycle and DataTable's sort-clearing cycle", async () => {
  const tableChange = vi.fn(); const dataChange = vi.fn();
  function Demo() {
    const [direction, setDirection] = useState<"ascending" | "descending" | undefined>();
    const [sortState, setSortState] = useState<{ columnId: string; direction: "ascending" | "descending" } | null>(null);
    return <>
      <Table columns={[{ id: "name", header: "Legacy name", cell: (row: string) => row, sortable: true, ...(direction ? { sortDirection: direction } : {}) }]}
        rows={["A"]} getRowKey={row => row} caption="People" emptyState="Empty"
        onSortChange={(id, next) => { tableChange(id, next); setDirection(next); }} />
      <DataTable columns={[{ id: "name", header: "Data name", sortable: true }]} rows={[{ id: "a" }]} renderCell={() => "A"}
        labels={{ table: "Data", selectAll: "All", selectRow: id => id, sortColumn: text => text }} sortState={sortState}
        onSortChange={next => { dataChange(next); setSortState(next); }} />
    </>;
  }
  await render(<Demo />);
  for (let i = 0; i < 3; i++) await act(() => host.querySelector<HTMLButtonElement>(".hjm-table__sort")!.click());
  expect(tableChange.mock.calls.map(call => call[1])).toEqual(["ascending", "descending", "ascending"]);
  expect(host.querySelector("caption")?.textContent).toBe("People");
  for (let i = 0; i < 3; i++) await act(() => host.querySelector<HTMLButtonElement>(".hjm-data-table__sort")!.click());
  expect(dataChange.mock.calls.map(call => call[0])).toEqual([{ columnId: "name", direction: "ascending" }, { columnId: "name", direction: "descending" }, null]);
});
it("motion carousel shares localized names, selected inert state and finite navigation", async () => {
  const change = vi.fn();
  await render(<CarouselMotion slides={[{ id: "a", label: "One" }, { id: "b", label: "Two" }]} currentKey="a" onCurrentKeyChange={change}
    label="Gallery" previousLabel="Previous" nextLabel="Next" composeAccessibleName={({ position, total, label }) => `${position}/${total}: ${label}`} renderSlide={slide => <button>{slide.label}</button>} />);
  const slides = [...host.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]')];
  expect(slides.map(slide => slide.getAttribute("aria-label"))).toEqual(["1/2: One", "2/2: Two"]);
  expect(slides.map(slide => slide.inert)).toEqual([false, true]);
  expect([...host.querySelectorAll("button")].find(button => button.textContent === "Previous")!.disabled).toBe(true);
  await act(() => [...host.querySelectorAll("button")].find(button => button.textContent === "Next")!.click());
  expect(change).toHaveBeenCalledExactlyOnceWith("b");
});
