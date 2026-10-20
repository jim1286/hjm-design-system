import "../src/styles.css";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SegmentedControl } from "../src/selection.js";
import { Card } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";

let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: ReactNode) => act(async () => root.render(<HjmProvider>{node}</HjmProvider>));
const hit = (element: Element, xRatio = 0.5, yRatio = 0.5) => {
  const box = element.getBoundingClientRect();
  return document.elementFromPoint(box.left + box.width * xRatio, box.top + box.height * yRatio);
};

it("centers short and wrapped header copy beside an independent command", async () => {
  for (const description of ["Organize your apps", "Organize your apps and folders with a long instruction that wraps across several lines"]) {
    host.style.width = "240px";
    await render(<Card description={description} headerActions={<button style={{ width: 44, height: 44 }}>Edit</button>} />);
    const copy = host.querySelector(".hjm-card__copy")!.getBoundingClientRect();
    const action = host.querySelector(".hjm-card__header-actions")!.getBoundingClientRect();
    expect(Math.abs(copy.top + copy.height / 2 - action.top - action.height / 2)).toBeLessThan(1);
  }
});

it("fills a passive card's allocated height without stretching its header", async () => {
  for (const height of [240, 320]) {
    await render(<div style={{ height, display: "flex", flexDirection: "column" }}>
      <Card title="Journey" layoutStyle={{ flex: 1 }}><div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span>Summary</span><span data-testid="bottom" style={{ marginTop: "auto" }}>Route progress</span>
      </div></Card>
    </div>);
    const cardElement = host.querySelector(".hjm-card")!;
    const card = cardElement.getBoundingClientRect();
    const body = host.querySelector(".hjm-card__body")!;
    const bottom = host.querySelector('[data-testid="bottom"]')!.getBoundingClientRect();
    const padding = Number.parseFloat(getComputedStyle(body).paddingBottom);
    const border = Number.parseFloat(getComputedStyle(cardElement).borderBottomWidth);
    expect(Math.abs(card.bottom - border - padding - bottom.bottom)).toBeLessThan(1);
    expect(host.querySelector(".hjm-card__header")!.getBoundingClientRect().height).toBeLessThan(44);
  }
});

it("keeps a max-content filter inside a narrow passive card", async () => {
  host.style.width = "240px";
  await render(<Card><SegmentedControl label="Filter" presentation="pills" items={[
    { value: "one", label: "First category" }, { value: "two", label: "Second category" }, { value: "three", label: "Third category" },
  ]} defaultValue="one" /></Card>);
  const card = host.querySelector(".hjm-card")!.getBoundingClientRect();
  const content = host.querySelector(".hjm-card__content")!;
  expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(card.right);
  expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth + 1);
});

it("opens the card from its body and action gaps while the action button stays independent", async () => {
  const open = vi.fn(), remove = vi.fn();
  await render(<Card aria-label="KE123 Seoul to Tokyo" title="ICN → NRT" description="KE123" onActivate={open}
    actions={<button type="button" aria-label="Delete KE123" onClick={remove}>Delete</button>}>Departs 09:10</Card>);
  const card = host.querySelector(".hjm-card")!;
  const activator = host.querySelector<HTMLButtonElement>(".hjm-card__activator")!;
  const action = host.querySelector<HTMLButtonElement>('[aria-label="Delete KE123"]')!;
  // Pointer hit testing proves the layering: body text and the empty end of the actions row reach the activator.
  expect(hit(host.querySelector(".hjm-card__title")!)).toBe(activator);
  expect(hit(host.querySelector(".hjm-card__actions")!, 0.95)).toBe(activator);
  expect(hit(action)).toBe(action);
  await act(async () => { (hit(host.querySelector(".hjm-card__title")!) as HTMLElement).click(); action.click(); });
  expect(open).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledOnce();
  // Keyboard order: card first, then its action.
  const focusable = [...card.querySelectorAll<HTMLElement>("button")];
  expect(focusable).toEqual([activator, action]);
});

it("activates only a cover and leaves author/footer actions independent", async () => {
 const open=vi.fn(), author=vi.fn(), comment=vi.fn();
 const card=(disabled:boolean)=><Card title="Title" disabled={disabled} media={<div style={{height:120}}>Cover</div>}
  mediaAction={{label:"Play",onActivate:open,icon:({color,size})=><svg width={size} stroke={color}/>}}
  actions={<button onClick={comment}>Comment</button>}><button onClick={author}>Author</button></Card>;
 await render(card(false));
 const play=host.querySelector<HTMLButtonElement>('button[aria-label="Play"]')!;
 expect(play.querySelectorAll("button")).toHaveLength(0);
 expect(play.querySelector('[aria-hidden="true"]')).not.toBeNull();
 await act(async()=>{play.click();host.querySelector<HTMLButtonElement>('.hjm-card__content button')!.click();host.querySelector<HTMLButtonElement>('.hjm-card__actions button')!.click();});
 expect(open).toHaveBeenCalledOnce();expect(author).toHaveBeenCalledOnce();expect(comment).toHaveBeenCalledOnce();
 await render(card(true));await act(async()=>host.querySelector<HTMLButtonElement>('button[aria-label="Play"]')!.click());
 expect(open).toHaveBeenCalledOnce();
});

it("keeps cover contrast, artwork layout, and independent hit targets across themes and palettes", async () => {
  for (const theme of ["light", "dark"] as const) {
    for (const onPrimary of ["#102030", "#ffffff"]) {
      const open = vi.fn();
      await act(async () => root.render(<HjmProvider theme={theme} brandPalette={{ light: { onPrimary }, dark: { onPrimary } }}>
        <div style={{ height: 300, display: "flex" }}><Card layoutStyle={{ flex: 1 }} title="Readable title" description="Readable description"
          backgroundMedia={<div style={{ display: "flex", alignItems: "center", background: "white" }}>Artwork</div>}
          actions={<button onClick={open}>Open</button>} /></div>
      </HjmProvider>));
      const card = host.querySelector<HTMLElement>(".hjm-card")!;
      const title = card.querySelector<HTMLElement>(".hjm-card__title")!;
      const artwork = card.querySelector<HTMLElement>(".hjm-card__background > :first-child")!;
      const command = card.querySelector<HTMLButtonElement>("button")!;
      expect(getComputedStyle(title).color).toBe("rgb(255, 255, 255)");
      expect(getComputedStyle(artwork).display).toBe("flex");
      expect(getComputedStyle(card.querySelector(".hjm-card__scrim")!).backgroundColor).toBe("rgba(0, 0, 0, 0.6)");
      expect(title.getBoundingClientRect().top).toBeGreaterThan(card.getBoundingClientRect().top + 150);
      expect(hit(command)).toBe(command);
      await act(async () => command.click()); expect(open).toHaveBeenCalledOnce();
    }
  }
});
