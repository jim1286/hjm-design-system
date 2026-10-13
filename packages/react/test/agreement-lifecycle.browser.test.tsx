import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Agreement } from "../src/agreement.js";
import { HjmProvider } from "../src/provider.js";
let host: HTMLDivElement, root: Root;
const items = [{ id: "terms", label: "Terms", required: true }, { id: "news", label: "News" }];
const descriptor = { accessibilityLabel: "Consent", allLabel: "All", items };
const labels = { requiredLabel: "required", optionalLabel: "optional" };
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = async (ui: React.ReactNode) => { await act(async () => root.render(<HjmProvider>{ui}</HjmProvider>)); };
it("reports actual controlled consent after rejection and external required changes", async () => {
 const states = vi.fn(), changes = vi.fn();
 const ui = (checked: ReadonlySet<string>, required = true) => <Agreement {...labels} descriptor={{ ...descriptor, items: [{ ...items[0]!, required }, items[1]!] }} checkedIds={checked} onCheckedIdsChange={changes} onStateChange={states}/>;
 await render(ui(new Set()));
 await act(async () => host.querySelector<HTMLButtonElement>('[role=checkbox]')!.click());
 expect(changes).toHaveBeenCalledTimes(1); expect(states.mock.lastCall?.[0].satisfied).toBe(false);
 await render(ui(new Set(), false)); expect(states.mock.lastCall?.[0].satisfied).toBe(true);
 await render(ui(new Set(), true)); expect(states.mock.lastCall?.[0].satisfied).toBe(false);
 await render(ui(new Set(["terms"]))); expect(states.mock.lastCall?.[0].satisfied).toBe(true);
});
it("permanently drops removed uncontrolled consent and updates derived submit state", async () => {
 const states = vi.fn(), changes = vi.fn();
 const ui = (next: typeof items) => <Agreement {...labels} descriptor={{ ...descriptor, items: next }} defaultCheckedIds={new Set(["terms"])} onCheckedIdsChange={changes} onStateChange={states}/>;
 await render(ui(items)); await render(ui([items[1]!])); await render(ui(items));
 expect(host.querySelectorAll('[role=checkbox]')[1]!.getAttribute('aria-checked')).toBe('false');
 expect(changes).toHaveBeenLastCalledWith(new Set()); expect(states.mock.lastCall?.[0].satisfied).toBe(false);
});
