import { jsx as _jsx } from "react/jsx-runtime";
import { resolveInitialFocusTarget } from "@hjmds/design-contracts/screen-patterns";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
/**
 * Nearest screen/overlay scope that chooses the field focused on entry (rules: screen-patterns
 * `resolveInitialFocusTarget`, shared with Native). Fields register by context, the same model as Native, instead of
 * the scope querying the DOM; a scope with mode "none" still owns its fields so they never reach an outer scope.
 */
export const InitialFocusContext = createContext(null);
export function useInitialFocusRegistry() {
    const entries = useRef(new Set());
    const counter = useRef(0);
    return useMemo(() => ({
        nextOrder: () => counter.current++,
        register(entry) { entries.current.add(entry); return () => { entries.current.delete(entry); }; },
        resolve(mode) {
            const candidates = [...entries.current].map(entry => ({ entry, order: entry.order, preference: entry.preference, focusable: entry.focusable() }));
            return resolveInitialFocusTarget(candidates, mode)?.entry.element() ?? null;
        },
    }), []);
}
function isEditable(element) {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement
        || (element instanceof HTMLElement && element.isContentEditable);
}
/**
 * Screen scope: focuses the chosen field once per mount, right after mount (Web has no enter transition to wait for).
 * It never takes focus from a field the user is already in, and never reaches under an open modal dialog.
 */
export function InitialFocusScope({ mode, children }) {
    const registry = useInitialFocusRegistry();
    const done = useRef(false);
    useEffect(() => {
        if (done.current || mode === "none")
            return;
        done.current = true;
        const target = registry.resolve(mode);
        if (!target)
            return;
        const current = target.ownerDocument.activeElement;
        if (current && current !== target.ownerDocument.body && isEditable(current))
            return;
        const modal = target.ownerDocument.querySelector('[aria-modal="true"], dialog[open]');
        if (modal && !modal.contains(target))
            return;
        target.focus({ preventScroll: true });
    }, [mode, registry]);
    return _jsx(InitialFocusContext.Provider, { value: registry, children: children });
}
/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export function useInitialFocusTarget(element, preference) {
    const registry = useContext(InitialFocusContext);
    // Tree order is fixed at first registration, so changing `preference` later does not move the field to the end.
    const order = useRef(null);
    useLayoutEffect(() => {
        if (!registry)
            return undefined;
        order.current ??= registry.nextOrder();
        return registry.register({
            order: order.current, preference, element: () => element.current,
            // Disabled and read-only fields are never focused on entry.
            focusable: () => { const node = element.current; return !!node && !node.disabled && !node.readOnly; },
        });
    }, [registry, preference, element]);
}
//# sourceMappingURL=initial-focus.js.map