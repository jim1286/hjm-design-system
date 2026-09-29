import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { VirtualList } from "../src/virtual-list.js";
import { Masonry } from "../src/masonry.js";
import { QRCode } from "../src/qr-code.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined; let host: HTMLDivElement;
afterEach(async () => { if (root) await act(async () => root!.unmount()); host?.remove(); root = undefined; });
async function mount(node: React.ReactNode) { host = document.createElement("div"); document.body.append(host); root = createRoot(host); await act(async () => root!.render(node)); }
it("windows a large list, reaches the last row by keyboard and clamps after filtering", async () => {
  const rows = Array.from({length:10000},(_,index)=>String(index));
  const render = (items: string[]) => <VirtualList items={items} keyExtractor={item=>item} rowHeight={40} height={200} label="Results" renderItem={item=><span>Row {item}</span>} />;
  await mount(render(rows));
  expect(host.querySelectorAll('[role="listitem"]').length).toBeLessThan(20);
  const list = host.querySelector<HTMLElement>('[role="list"]')!; list.focus();
  await userEvent.keyboard("{End}");
  expect(document.activeElement?.textContent).toBe("Row 9999");
  expect(list.scrollTop).toBe(399800);
  await act(async () => root!.render(render(rows.slice(0,2))));
  expect(list.scrollTop).toBe(0);
  expect(host.querySelectorAll('[role="listitem"]').length).toBe(2);
});
it("keeps masonry DOM order even when shorter columns accept later cards", async () => {
  await mount(<Masonry items={[100,50,80]} keyExtractor={String} label="Cards" width={210} columns={2} gap={10} getItemHeight={item=>item} renderItem={item=><span>{item}</span>} />);
  const items = [...host.querySelectorAll<HTMLElement>('[role="listitem"]')];
  expect(items.map(item=>item.textContent)).toEqual(["100","50","80"]);
  expect(items[2]!.style.top).toBe("60px");
  expect(items[2]!.style.insetInlineStart).toBe("110px");
});
it("keeps a non-QR route alongside the named, high contrast code", async () => {
  await mount(<QRCode value="https://example.com" label="Share code" fallback={<a href="https://example.com">Open directly</a>} />);
  expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Share code");
  expect(host.querySelector("rect")?.getAttribute("fill")).toBe("#ffffff");
  expect(host.querySelector("path")?.getAttribute("fill")).toBe("#000000");
  await page.getByRole("link",{name:"Open directly"}).element();
});
