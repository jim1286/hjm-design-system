import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { Agreement } from "../src/agreement.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const items = [{ id: "terms", label: "Terms", required: true }, { id: "news", label: "News" }];
const descriptor = { accessibilityLabel: "Consent", allLabel: "All", items };
const labels = { requiredLabel: "required", optionalLabel: "optional" };
function render(ui: React.ReactNode) { act(() => { const node = <HjmNativeProvider>{ui}</HjmNativeProvider>; if (tree) tree.update(node); else tree = create(node); }); }
const boxes = () => tree!.root.findAll(node => String(node.type) === 'Pressable' && node.props.accessibilityRole === 'checkbox');
it("reports actual controlled consent after rejection and external required changes", () => {
 const states = vi.fn(), changes = vi.fn();
 const ui = (checked: ReadonlySet<string>, required = true) => <Agreement {...labels} descriptor={{ ...descriptor, items: [{ ...items[0]!, required }, items[1]!] }} checkedIds={checked} onCheckedIdsChange={changes} onStateChange={states}/>;
 render(ui(new Set())); act(() => boxes()[0]!.props.onPress());
 expect(changes).toHaveBeenCalledTimes(1); expect(states.mock.lastCall?.[0].satisfied).toBe(false);
 render(ui(new Set(), false)); expect(states.mock.lastCall?.[0].satisfied).toBe(true);
 render(ui(new Set(), true)); expect(states.mock.lastCall?.[0].satisfied).toBe(false);
 render(ui(new Set(["terms"]))); expect(states.mock.lastCall?.[0].satisfied).toBe(true);
});
it("permanently drops removed uncontrolled consent and updates derived submit state", () => {
 const states = vi.fn(), changes = vi.fn();
 const ui = (next: typeof items) => <Agreement {...labels} descriptor={{ ...descriptor, items: next }} defaultCheckedIds={new Set(["terms"])} onCheckedIdsChange={changes} onStateChange={states}/>;
 render(ui(items)); render(ui([items[1]!])); render(ui(items));
 expect(boxes()[1]!.props.accessibilityState.checked).toBe(false); expect(changes).toHaveBeenLastCalledWith(new Set()); expect(states.mock.lastCall?.[0].satisfied).toBe(false);
});
