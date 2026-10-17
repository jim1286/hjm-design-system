import { jsx as _jsx } from "react/jsx-runtime";
import { resolveEntryFocus } from "@hjmds/design-contracts/screen-patterns";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { getTopModal, subscribeModalClose } from "../modal.js";
/**
 * Nearest screen/overlay scope that chooses the field focused on entry (rules: screen-patterns `resolveEntryFocus`,
 * shared with Native). Fields register by context, the same model as Native, instead of the scope querying the DOM; a
 * scope with mode "none" still owns its fields so they never reach an outer scope.
 */
const InitialFocusContext = createContext(null);
/** Layer of the enclosing HJM overlay; null on the page itself. A ScreenLayout inside a sheet uses the sheet's. */
const ModalLayerContext = createContext(null);
function isEditable(element) {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement
        || (element instanceof HTMLElement && element.isContentEditable);
}
/**
 * Screen scopes enter on mount (Web has no enter transition to wait for); overlays pass `layer` and enter through
 * `useModalFocus`. User pointer, key, wheel or touch input while no modal is above the scope ends the entry window.
 */
export function useInitialFocusScope({ mode, active = true, layer: ownLayer }) {
    const inherited = useContext(ModalLayerContext);
    const layer = ownLayer ?? inherited;
    const overlay = ownLayer !== undefined;
    const modeRef = useRef(mode);
    modeRef.current = mode;
    const state = useRef({ phase: "inactive", entries: new Set(), fresh: new Set(), counter: 0, flushQueued: false });
    const scope = useMemo(() => {
        const s = state.current;
        const blocked = () => {
            const top = getTopModal();
            if (top)
                return top !== (layer?.current ?? null);
            // A product's own modal (not on the HJM stack) still covers the page.
            return layer === null && document.querySelector('[aria-modal="true"], dialog[open]') !== null;
        };
        const dispatch = (event) => {
            const candidates = [...s.entries].map(entry => ({ entry, order: entry.order, preference: entry.preference, focusable: entry.focusable() }));
            const resolved = event.kind === "register" && "entry" in event
                ? { kind: "register", field: candidates.find(candidate => candidate.entry === event.entry) }
                : event;
            const result = resolveEntryFocus(s.phase, resolved, { mode: modeRef.current, candidates, blocked: blocked(), textEntryFocused: isEditable(document.activeElement) });
            s.phase = result.phase;
            return result.target?.entry.element() ?? null;
        };
        const focus = (target) => target?.focus({ preventScroll: true });
        // Fields mounting in one commit are judged together.
        const flush = () => {
            s.flushQueued = false;
            const fresh = [...s.fresh].filter(entry => s.entries.has(entry)).sort((a, b) => a.order - b.order);
            s.fresh.clear();
            const field = fresh.find(entry => entry.preference === true) ?? fresh[0];
            if (field)
                focus(dispatch({ kind: "register", entry: field }));
        };
        const registry = {
            nextOrder: () => s.counter++,
            register(entry, mounted) {
                s.entries.add(entry);
                if (mounted) {
                    s.fresh.add(entry);
                    if (!s.flushQueued) {
                        s.flushQueued = true;
                        queueMicrotask(flush);
                    }
                }
                return () => { s.entries.delete(entry); s.fresh.delete(entry); };
            },
        };
        const enter = (explicit) => {
            s.fresh.clear();
            dispatch({ kind: "activate" });
            if (explicit) {
                s.phase = "settled";
                return null;
            }
            return dispatch({ kind: "enter" });
        };
        return { registry, layer, dispatch, focus, enter };
    }, [layer]);
    useEffect(() => {
        if (!active) {
            scope.dispatch({ kind: "deactivate" });
            return undefined;
        }
        // After every effect of this commit, so a modal opening in the same commit (an app-root consent dialog) is
        // already on the stack and blocks entry instead of taking focus away and handing it back later.
        let cancelled = false;
        if (!overlay)
            queueMicrotask(() => { if (!cancelled)
                scope.focus(scope.enter(false)); });
        const interact = () => { scope.dispatch({ kind: "interact" }); };
        const events = ["pointerdown", "keydown", "wheel", "touchstart"];
        for (const type of events)
            document.addEventListener(type, interact, true);
        // A modal above closed (after its return focus ran): retry a pending entry.
        const unsubscribe = subscribeModalClose(() => scope.focus(scope.dispatch({ kind: "unblock" })));
        return () => {
            cancelled = true;
            for (const type of events)
                document.removeEventListener(type, interact, true);
            unsubscribe();
            scope.dispatch({ kind: "deactivate" });
        };
    }, [active, overlay, scope]);
    return useMemo(() => ({ registry: scope.registry, layer: scope.layer, enter: scope.enter }), [scope]);
}
export function InitialFocusProvider({ scope, children }) {
    return _jsx(ModalLayerContext.Provider, { value: scope.layer, children: _jsx(InitialFocusContext.Provider, { value: scope.registry, children: children }) });
}
/** Screen scope: focuses the chosen field on mount, never over a field the user is in or under an open modal. */
export function InitialFocusScope({ mode, children }) {
    const scope = useInitialFocusScope({ mode });
    return _jsx(InitialFocusProvider, { scope: scope, children: children });
}
/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export function useInitialFocusTarget(element, preference) {
    const registry = useContext(InitialFocusContext);
    // Tree order is fixed at first registration, so changing `preference` later does not move the field to the end.
    const order = useRef(null);
    useLayoutEffect(() => {
        if (!registry)
            return undefined;
        // Only the first registration of this field instance counts as "appeared"; a later `preference` change does not.
        const mounted = order.current === null;
        order.current ??= registry.nextOrder();
        return registry.register({
            order: order.current, preference, element: () => element.current,
            // Disabled and read-only fields are never focused on entry.
            focusable: () => { const node = element.current; return !!node && !node.disabled && !node.readOnly; },
        }, mounted);
    }, [registry, preference, element]);
}
//# sourceMappingURL=initial-focus.js.map