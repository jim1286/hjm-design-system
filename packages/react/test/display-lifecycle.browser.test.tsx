import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Accordion, Avatar } from "../src/advanced-display.js";
import { Card, ListRow } from "../src/display.js";
import { Image, type ImageAdapterProps } from "../src/supplemental-display.js";
import { HjmProvider } from "../src/provider.js";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: React.ReactNode) => act(async () => root.render(<HjmProvider>{node}</HjmProvider>));
const items = ["a", "b", "c"].map(id => ({ id, title: id, panel: <input aria-label={`${id} content`} /> }));
it("prunes deleted uncontrolled accordion expansion and restores focus without reopening reinserted items", async () => {
 const change = vi.fn(); const view = (data: typeof items) => <Accordion items={data} defaultValue={["b"]} onValueChange={change} />;
 await render(view(items)); await act(async () => host.querySelector<HTMLInputElement>('[aria-label="b content"]')!.focus());
 await render(view([items[0]!, items[2]!]));
 expect(change).toHaveBeenCalledExactlyOnceWith([]);
 expect(document.activeElement?.textContent).toContain("c");
 await render(view(items)); expect(host.querySelectorAll('[aria-expanded="true"]')).toHaveLength(0);
});
it("moves focus from a newly disabled accordion trigger while preserving its expanded panel", async () => {
 await render(<Accordion items={items} defaultValue={["b"]} />); const triggers = () => host.querySelectorAll<HTMLButtonElement>('.hjm-accordion__trigger');
 await act(async () => triggers()[1]!.focus());
 await render(<Accordion items={items.map(item => ({ ...item, disabled: item.id === "b" }))} defaultValue={["b"]} />);
 expect(document.activeElement).toBe(triggers()[2]); expect(triggers()[1]!.getAttribute('aria-expanded')).toBe("true");
 await act(async () => triggers()[1]!.click()); expect(triggers()[1]!.getAttribute('aria-expanded')).toBe("true");
});
it("isolates avatar DOM requests across A to B to A", async () => {
 const error = vi.fn(); const view = (src: string) => <Avatar name="Kim" src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><text>${src}</text></svg>`)}`} imageProps={{onError:error}} />;
 await render(view("/old-a")); const oldA = host.querySelector('img')!;
 await render(view("/old-b")); const oldB = host.querySelector('img')!;
 expect(oldB).not.toBe(oldA);
 await render(view("/old-a"));
 await act(async () => { oldA.dispatchEvent(new Event('error')); oldB.dispatchEvent(new Event('error')); });
 expect(host.querySelector('.hjm-avatar')?.getAttribute('data-state')).toBe("image"); expect(error).not.toHaveBeenCalled();
 await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
 expect(host.querySelector('.hjm-avatar')?.getAttribute('data-state')).toBe("fallback"); expect(error).toHaveBeenCalledOnce();
});
it("keeps card and row activation disabled during pending/loading transitions", async () => {
 const action = vi.fn(); const view = (pending: boolean) => <><Card aria-label="Card" onActivate={action} disabled={pending} selected><span>Card</span></Card><ListRow title="Row" selected loading={pending} loadingLabel="Loading row" onClick={action} /></>;
 await render(view(false)); await act(async () => host.querySelector<HTMLButtonElement>('.hjm-card')!.click()); expect(action).toHaveBeenCalledOnce();
 await render(view(true)); await act(async () => { host.querySelector<HTMLButtonElement>('.hjm-card')!.click(); host.querySelector<HTMLElement>('.hjm-list-row')!.click(); });
 expect(action).toHaveBeenCalledOnce(); expect(host.querySelector('.hjm-list-row')?.getAttribute('aria-label')).toBe("Loading row");
 await render(view(false)); await act(async () => host.querySelector<HTMLButtonElement>('.hjm-list-row')!.click()); expect(action).toHaveBeenCalledTimes(2);
 await render(<ListRow title="Link" href="#detail" disabled />); expect(host.querySelector('a')?.hasAttribute('href')).toBe(false);
});
it("retries the same image URL through a keyed host remount and ignores retired reports", async () => {
 let adapter!: ImageAdapterProps; const change = vi.fn();
 const view = (attempt: number) => <Image key={attempt} src="/same" width={80} height={40} onLoadStatusChange={change} renderImage={props => { adapter = props; return <span data-image="asset" />; }} />;
 await render(view(0)); const retired = adapter; await act(async () => retired.onError({} as never));
 await render(view(1)); expect(host.querySelector('.hjm-image')?.getAttribute('data-status')).toBe("loading");
 await act(async () => { adapter.onLoad({} as never); retired.onError({} as never); });
 expect(host.querySelector('.hjm-image')?.getAttribute('data-status')).toBe("loaded"); expect(change.mock.calls).toEqual([["error"],["loaded"]]);
});
it.each(["default", "controlled"])("rejects invalid initial accordion %s values", async kind => {
 await expect(render(<Accordion items={items} {...(kind === "default" ? {defaultValue:["missing"]} : {value:["missing"]})} />)).rejects.toThrow(/Unknown Accordion/);
});
it("does not steal external focus after an accordion item is removed", async () => {
 const view=(data:typeof items)=><><button id="outside">Outside</button><Accordion items={data} defaultValue={["b"]}/></>;
 await render(view(items)); await act(async()=>{host.querySelector<HTMLInputElement>('[aria-label="b content"]')!.focus();host.querySelector<HTMLButtonElement>('#outside')!.focus();});
 await render(view([items[0]!,items[2]!])); expect(document.activeElement?.id).toBe("outside");
});
it("retries unchanged src when the adapter receives a new srcSet", async () => {
 let adapter!:ImageAdapterProps; const changed=vi.fn();
 const view=(srcSet:string)=><Image src="same" width={80} height={40} imageProps={{srcSet}} onLoadStatusChange={changed} renderImage={props=>{adapter=props;return <span data-adapted-image/>;}}/>;
 await render(view("old 2x")); const retired=adapter; await act(async()=>adapter.onError({} as never));
 await render(view("fresh 2x")); expect(host.querySelector('[data-adapted-image]')).not.toBeNull(); expect(host.querySelector('.hjm-image')?.getAttribute('data-status')).toBe("loading");
 await act(async()=>{adapter.onLoad({} as never);retired.onError({} as never);}); expect(changed.mock.calls).toEqual([["error"],["loaded"]]);
});
