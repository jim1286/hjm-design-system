import { page } from "vitest/browser";
import { Progress } from "../src/feedback.js";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { VirtualList } from "../src/virtual-list.js";
import { Image, type ImageAdapterProps } from "../src/supplemental-display.js";
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: React.ReactNode) => act(async () => root.render(node));
it("keeps the focused row mounted by key after it moves beyond the virtual window", async () => {
  const items = Array.from({ length: 100 }, (_, i) => String(i));
  const view = (values: string[]) => <VirtualList items={values} keyExtractor={String} rowHeight={40} height={200} label="Results" renderItem={value => <button>{value}</button>} />;
  await render(view(items));
  const button = [...host.querySelectorAll('button')].find(node => node.textContent === "1")!;
  await act(async () => button.focus());
  await render(view([...items.filter(value => value !== "1"), "1"]));
  expect(document.activeElement).toBe(button);
  expect(button.closest('[data-virtual-row]')?.getAttribute('aria-posinset')).toBe("100");
  expect(button.closest('[data-virtual-row]')?.getAttribute('tabindex')).toBe("0");
});
it("retires image adapter callbacks on replacement, including A to B to A", async () => {
  let adapter!: ImageAdapterProps;
  const changed = vi.fn(), failed = vi.fn();
  const view = (src: string) => <Image src={src} width={80} height={40} onLoadStatusChange={changed} onError={failed}
    renderImage={props => { adapter = props; return <span data-image={props.src} />; }} />;
  await render(view("a")); const oldA = adapter;
  await render(view("b"));
  await act(async () => adapter.onLoad({} as never));
  await act(async () => oldA.onError({} as never));
  expect(host.querySelector('.hjm-image')?.getAttribute('data-status')).toBe("loaded");
  expect(changed.mock.calls).toEqual([["loaded"]]); expect(failed).not.toHaveBeenCalled();
  await render(view("a"));
  expect(host.querySelector('.hjm-image')?.getAttribute('data-status')).toBe("loading");
  await act(async () => oldA.onError({} as never));
  expect(host.querySelector('[data-image="a"]')).not.toBeNull();
  await act(async () => adapter.onError({} as never));
  expect(host.querySelector('.hjm-image')?.getAttribute('data-status')).toBe("error");
});
it("ignores adapter callbacks after unmount", async () => {
  let adapter!: ImageAdapterProps; const changed = vi.fn();
  await render(<Image src="a" width={80} height={40} onLoadStatusChange={changed}
    renderImage={props => { adapter = props; return <span />; }} />);
  await render(null);
  await act(async () => adapter.onLoad({} as never));
  expect(changed).not.toHaveBeenCalled();
});

it("names the progress control from its visible label", async () => {
  await render(<Progress label="Upload progress" value={40} />);
  await expect.element(page.getByRole("progressbar", { name: "Upload progress" })).toBeVisible();
});

it.each([
  { focused: "b", remaining: ["a", "c", "d"], expected: "c" },
  { focused: "d", remaining: ["a", "b", "c"], expected: "c" },
  { focused: "b", remaining: [], expected: null },
])("recovers keyboard focus when row $focused is deleted from a live list", async ({ focused, remaining, expected }) => {
  const view = (items: string[]) => <VirtualList items={items} keyExtractor={String} rowHeight={40} height={120} label="Results" empty={<p>No results</p>} renderItem={value => <button>{value}</button>} />;
  await render(view(["a", "b", "c", "d"]));
  await act(async () => [...host.querySelectorAll('button')].find(node => node.textContent === focused)!.focus());
  await render(view(remaining));
  const list = host.querySelector<HTMLElement>('[role="list"]')!;
  if (expected === null) {
    expect(document.activeElement).toBe(list);
    expect(list.textContent).toBe("No results");
  } else {
    const row = [...list.querySelectorAll<HTMLElement>('[data-virtual-row]')].find(node => node.textContent === expected)!;
    expect(document.activeElement).toBe(row);
    expect(row.tabIndex).toBe(0);
    expect(list.scrollTop).toBeLessThanOrEqual(row.offsetTop);
    expect(list.scrollTop + list.clientHeight).toBeGreaterThanOrEqual(row.offsetTop + row.offsetHeight);
    await act(async () => row.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true })));
    expect(document.activeElement?.textContent).toBe(remaining[Math.max(0, remaining.indexOf(expected) - 1)]);
  }
});

it("does not reclaim external focus when a previously focused row is deleted", async () => {
  const view = (items: string[]) => <><button data-outside>Outside</button><VirtualList items={items} keyExtractor={String} rowHeight={40} height={120} label="Results" renderItem={value => <button>{value}</button>} /></>;
  await render(view(["a", "b"]));
  await act(async () => host.querySelector<HTMLButtonElement>('[data-virtual-row] button')!.focus());
  const outside = host.querySelector<HTMLButtonElement>('[data-outside]')!;
  await act(async () => outside.focus());
  await render(view(["b"]));
  expect(document.activeElement).toBe(outside);
});


it("recovers beside a removed row after its key was moved beyond the window", async () => {
  const items = Array.from({ length: 100 }, (_, i) => String(i));
  const view = (values: string[]) => <VirtualList items={values} keyExtractor={String} rowHeight={40} height={200} label="Results" renderItem={value => <button>{value}</button>} />;
  await render(view(items));
  await act(async () => [...host.querySelectorAll('button')].find(node => node.textContent === "1")!.focus());
  const remaining = items.filter(value => value !== "1");
  await render(view([...remaining, "1"]));
  await render(view(remaining));
  expect(document.activeElement?.textContent).toBe("99");
  expect(document.activeElement?.getAttribute("aria-posinset")).toBe("99");
  const list = host.querySelector<HTMLElement>('[role="list"]')!;
  expect(list.scrollTop).toBe(3760);
});
