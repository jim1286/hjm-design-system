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
// A bottom sheet owns this boundary, including ScreenLayout/marked fields nested inside its body.
const EntryFocusEnabledContext = createContext(true);
/** Layer of the enclosing HJM overlay; null on the page itself. A ScreenLayout inside a sheet uses the sheet's. */
const ModalLayerContext = createContext(null);
/**
 * Screen scopes rendered inside an HJM overlay, keyed by that overlay's layer. Their fields register with the screen,
 * not the overlay, so the overlay's activation asks them for the entry field instead of focusing its first control
 * over them (BurnTok search: a ScreenLayout in a Sheet left focus on the close button, 2026-10-18).
 */
const nestedScopes = new WeakMap();
/**
 * Product modals (not on the HJM stack) layered above the scope. A product modal that contains the scope's own fields
 * wraps the screen rather than covering it, so it does not block (BurnTok search overlay, 2026-10-18).
 */
function productModalAbove(fields) {
    return [...document.querySelectorAll('[aria-modal="true"], dialog[open]')]
        .some(modal => !fields.some(field => modal.contains(field)));
}
function isEditable(element) {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement
        || (element instanceof HTMLElement && element.isContentEditable);
}
/**
 * Screen scopes enter on mount (Web has no enter transition to wait for); overlays pass `layer` and enter through
 * `useModalFocus`. User pointer, key, wheel or touch input while no modal is above the scope ends the entry window.
 */
export function useInitialFocusScope({ mode, active = true, layer: ownLayer, enabled = true }) {
    const inherited = useContext(ModalLayerContext);
    const inheritedEnabled = useContext(EntryFocusEnabledContext);
    // A separate overlay owns its policy; ordinary nested screens inherit their enclosing sheet's policy.
    const entryFocusEnabled = enabled && (ownLayer !== undefined || inheritedEnabled);
    const enabledRef = useRef(entryFocusEnabled);
    enabledRef.current = entryFocusEnabled;
    const layer = ownLayer ?? inherited;
    const overlay = ownLayer !== undefined;
    const modeRef = useRef(mode);
    modeRef.current = mode;
    const state = useRef({ phase: "inactive", entries: new Set(), fresh: new Set(), counter: 0, flushQueued: false });
    const scope = useMemo(() => {
        const s = state.current;
        const blocked = () => {
            const own = layer?.current ?? null;
            // Inside an HJM overlay that is not on the stack yet: its activation runs this scope's entry (`nestedScopes`).
            if (layer !== null && own === null)
                return true;
            const top = getTopModal();
            if (top)
                return top !== own;
            // A product's own modal above the page still covers it; overlay content is portaled outside product markup.
            if (layer !== null)
                return false;
            const fields = [...s.entries].map(entry => entry.element()).filter((element) => element !== null);
            return productModalAbove(fields);
        };
        const dispatch = (event) => {
            if (!enabledRef.current)
                return null;
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
        const settle = () => { s.phase = "settled"; };
        const enter = (explicit) => {
            s.fresh.clear();
            const nested = overlay && layer ? [...(nestedScopes.get(layer) ?? [])] : [];
            if (explicit) {
                settle();
                for (const scope of nested)
                    scope.settle();
                return null;
            }
            // A user can open a menu before the deferred entry runs. Never reset their settled entry window.
            if (s.phase === "settled")
                return null;
            if (s.phase === "inactive")
                dispatch({ kind: "activate" });
            const own = dispatch({ kind: s.phase === "open" ? "unblock" : "enter" });
            if (own)
                return own;
            for (const scope of nested) {
                const target = scope.enter();
                if (target)
                    return target;
            }
            return null;
        };
        return { registry, layer, dispatch, focus, enter, settle };
    }, [layer, overlay]);
    useEffect(() => {
        if (!active) {
            scope.dispatch({ kind: "deactivate" });
            return undefined;
        }
        // Observe interaction immediately; deferring activation too would lose a click before the entry microtask.
        scope.dispatch({ kind: "activate" });
        // After every effect of this commit, so a modal opening in the same commit (an app-root consent dialog) is
        // already on the stack and blocks entry instead of taking focus away and handing it back later.
        let cancelled = false;
        if (!overlay)
            queueMicrotask(() => { if (!cancelled)
                scope.focus(scope.enter(false)); });
        // A screen inside an overlay that activates later enters when the overlay does (see `enter`).
        let nested;
        const nestedEntry = { enter: () => scope.enter(false), settle: scope.settle };
        if (!overlay && scope.layer) {
            nested = nestedScopes.get(scope.layer) ?? new Set();
            nestedScopes.set(scope.layer, nested);
            nested.add(nestedEntry);
        }
        const interact = () => { scope.dispatch({ kind: "interact" }); };
        const events = ["pointerdown", "click", "contextmenu", "keydown", "wheel", "touchstart"];
        for (const type of events)
            document.addEventListener(type, interact, true);
        // A modal above closed (after its return focus ran): retry a pending entry.
        const unsubscribe = subscribeModalClose(() => scope.focus(scope.dispatch({ kind: "unblock" })));
        return () => {
            cancelled = true;
            nested?.delete(nestedEntry);
            for (const type of events)
                document.removeEventListener(type, interact, true);
            unsubscribe();
            scope.dispatch({ kind: "deactivate" });
        };
    }, [active, overlay, scope, entryFocusEnabled]);
    return useMemo(() => ({ registry: scope.registry, layer: scope.layer, enter: scope.enter, enabled: entryFocusEnabled }), [scope, entryFocusEnabled]);
}
export function InitialFocusProvider({ scope, children }) {
    return _jsx(EntryFocusEnabledContext.Provider, { value: scope.enabled, children: _jsx(ModalLayerContext.Provider, { value: scope.layer, children: _jsx(InitialFocusContext.Provider, { value: scope.registry, children: children }) }) });
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
/** Page footer inputs are bottom-anchored, so entry must not open their keyboard (2026-10-18 user request).
 * Keep the boundary through nested screens; a separately opened overlay owns its own focus policy.
 */
export function BottomEntryFocusBoundary({ children }) {
    return _jsx(EntryFocusEnabledContext.Provider, { value: false, children: _jsx(InitialFocusContext.Provider, { value: null, children: children }) });
}
//# sourceMappingURL=initial-focus.js.map