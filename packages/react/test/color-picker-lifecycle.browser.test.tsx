import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { ColorPicker } from "../src/color-picker.js";
import { HjmProvider } from "../src/provider.js";
let host: HTMLDivElement, root: Root;
const labels = { hue: "Hue", saturation: "Saturation", brightness: "Brightness", hex: "Hex", opacity: "Opacity", invalid: "Invalid" };
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const input = () => host.querySelector<HTMLInputElement>('input[type=text]')!;
async function render(change: (value: string) => void, disabled = false) { await act(async () => root.render(<HjmProvider><ColorPicker label="Accent" labels={labels} value="#112233" disabled={disabled} onValueChange={change}/><button>Outside</button></HjmProvider>)); }
async function draft(value: string) { await act(async () => { input().focus(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input(), value); input().dispatchEvent(new Event('input', { bubbles: true })); }); }
it("does not commit a color while IME Enter is composing", async () => {
 const change = vi.fn(); await render(change); await draft('#aabbcc');
 await act(async () => { input().dispatchEvent(new KeyboardEvent('keydown', {key:'Enter',isComposing:true,bubbles:true,cancelable:true})); });
 expect(change).not.toHaveBeenCalled();
 await userEvent.keyboard('{Enter}'); expect(change).toHaveBeenCalledExactlyOnceWith('#aabbcc');
});
it("does not duplicate an Enter request on blur when a controlled owner defers the value", async () => {
 const change = vi.fn(); await render(change); await draft('#aabbcc'); await userEvent.keyboard('{Enter}');
 await act(async () => host.querySelector<HTMLButtonElement>('button')!.focus());
 expect(change).toHaveBeenCalledExactlyOnceWith('#aabbcc');
});
it("does not commit a draft when disabling the focused color field causes blur", async () => {
 const change = vi.fn(); await render(change); await draft('#aabbcc'); await render(change,true);
 await act(async () => host.querySelector<HTMLButtonElement>('button')!.focus()); expect(change).not.toHaveBeenCalled();
});
