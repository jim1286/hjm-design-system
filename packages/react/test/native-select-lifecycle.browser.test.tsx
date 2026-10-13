import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NativeSelect, type SelectOption } from "../src/advanced-forms.js";
import { HjmProvider } from "../src/provider.js";
let host: HTMLDivElement, root: Root;
const options: readonly SelectOption[] = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it.each(["removed", "disabled"] as const)("reconciles a %s uncontrolled option and does not revive it", async mode => {
 const changes = vi.fn();
 const render = async (next: typeof options) => { await act(async () => root.render(<HjmProvider><NativeSelect label="Choice" options={next} defaultValue="b" onValueChange={changes}/></HjmProvider>)); };
 await render(options);
 await render(mode === "removed" ? [options[0]!] : [options[0]!, { ...options[1]!, disabled: true }]);
 expect(host.querySelector('select')!.value).toBe('a'); expect(changes).toHaveBeenCalledExactlyOnceWith('a');
 await render(options); expect(host.querySelector('select')!.value).toBe('a');
});
it("retains invalid initial defaults and controlled value validation", () => {
 expect(() => renderToStaticMarkup(<HjmProvider><NativeSelect label="Choice" options={options} defaultValue="missing"/></HjmProvider>)).toThrow(/enabled option/);
 expect(() => renderToStaticMarkup(<HjmProvider><NativeSelect label="Choice" options={options} value="missing"/></HjmProvider>)).toThrow(/enabled option/);
});
it("returns to a supplied empty placeholder when the selected option disappears", async () => {
 const changes = vi.fn(); const render = async (next: typeof options) => { await act(async () => root.render(<HjmProvider><NativeSelect label="Choice" placeholder="Choose" options={next} defaultValue="b" onValueChange={changes}/></HjmProvider>)); };
 await render(options); await render([options[0]!]); expect(host.querySelector('select')!.value).toBe(''); expect(changes).toHaveBeenCalledExactlyOnceWith('');
});
