import { jsx as _jsx } from "react/jsx-runtime";
import { resolveEntryFocus } from "@hjmds/design-contracts/screen-patterns";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { InteractionManager, TextInput } from "react-native";
/**
 * Nearest screen/overlay scope that chooses the field focused on entry (rules: screen-patterns `resolveEntryFocus`).
 * Fields register by context rather than the scope searching the host tree, which Native cannot query; a scope with
 * mode "none" still provides a registry so its fields never reach an outer scope.
 */
const InitialFocusContext = createContext(null);
/*
 * Open HJM overlays in presentation order. An RN Modal covers every screen, so a scope is blocked while an overlay
 * presented after its own layer is open (the root screen layer is 0). Web reads its modal stack the same way.
 */
let lastLayer = 0;
const openLayers = new Set();
const layerListeners = new Set();
const rootLayer = { current: 0 };
/** Layer of the enclosing overlay, so a ScreenLayout rendered inside a sheet is blocked only by overlays above it. */
const OverlayLayerContext = createContext(rootLayer);
/**
 * Keeps an overlay on the open stack while `presented` (from opening until its exit and native dismissal finish, the
 * point where return focus also runs). Closing notifies the scopes below so a pending entry focus can run.
 */
export function useOverlayLayer(presented) {
    const layer = useRef(null);
    useLayoutEffect(() => {
        if (!presented)
            return undefined;
        const id = ++lastLayer;
        layer.current = id;
        openLayers.add(id);
        return () => {
            openLayers.delete(id);
            layer.current = null;
            for (const listener of [...layerListeners])
                listener();
        };
    }, [presented]);
    return layer;
}
function textEntryFocused() {
    const state = TextInput.State;
    return state?.currentlyFocusedInput?.() != null;
}
/**
 * Screen/overlay entry focus. The returned `onTouchStart` goes on the scope's root view: a touch there (bubbling from
 * any descendant, scrolls included) ends the entry window unless an overlay is above the scope.
 * `layer` is the overlay's own layer; screens inherit the enclosing one.
 */
export function useInitialFocusScope({ mode, active = true, layer: ownLayer }) {
    const inherited = useContext(OverlayLayerContext);
    const layer = ownLayer ?? inherited;
    const modeRef = useRef(mode);
    modeRef.current = mode;
    const state = useRef({ phase: "inactive", entries: new Set(), fresh: new Set(), counter: 0, flush: null });
    const scope = useMemo(() => {
        const s = state.current;
        const blocked = () => { const own = layer.current ?? 0; return [...openLayers].some(id => id > own); };
        const dispatch = (event) => {
            const candidates = [...s.entries].map(entry => ({ entry, order: entry.order, preference: entry.preference, focusable: entry.focusable() }));
            const resolved = event.kind === "register" && "entry" in event
                ? { kind: "register", field: candidates.find(candidate => candidate.entry === event.entry) }
                : event;
            const result = resolveEntryFocus(s.phase, resolved, { mode: modeRef.current, candidates, blocked: blocked(), textEntryFocused: textEntryFocused() });
            s.phase = result.phase;
            result.target?.entry.focus();
        };
        // Fields mounting in one commit are judged together, after their native views exist.
        const flush = () => {
            s.flush = null;
            const fresh = [...s.fresh].filter(entry => s.entries.has(entry)).sort((a, b) => a.order - b.order);
            s.fresh.clear();
            const field = fresh.find(entry => entry.preference === true) ?? fresh[0];
            if (field)
                dispatch({ kind: "register", entry: field });
        };
        const registry = {
            nextOrder: () => s.counter++,
            register(entry, mounted) {
                s.entries.add(entry);
                if (mounted) {
                    s.fresh.add(entry);
                    s.flush ??= setTimeout(flush, 0);
                }
                return () => { s.entries.delete(entry); s.fresh.delete(entry); };
            },
        };
        return { registry, dispatch, layer, onTouchStart: () => dispatch({ kind: "interact" }) };
    }, [layer]);
    useEffect(() => {
        const s = state.current;
        if (!active) {
            scope.dispatch({ kind: "deactivate" });
            return undefined;
        }
        scope.dispatch({ kind: "activate" });
        // After interactions, so the keyboard does not animate against a navigation or overlay enter transition.
        const enter = InteractionManager.runAfterInteractions(() => { s.fresh.clear(); scope.dispatch({ kind: "enter" }); });
        let unblock = null;
        // An overlay above closed: retry once its teardown interaction is over.
        const onLayerClosed = () => { unblock?.cancel(); unblock = InteractionManager.runAfterInteractions(() => scope.dispatch({ kind: "unblock" })); };
        layerListeners.add(onLayerClosed);
        return () => {
            enter.cancel();
            unblock?.cancel();
            layerListeners.delete(onLayerClosed);
            if (s.flush) {
                clearTimeout(s.flush);
                s.flush = null;
            }
            scope.dispatch({ kind: "deactivate" });
        };
    }, [active, scope]);
    return useMemo(() => ({ registry: scope.registry, layer: scope.layer, onTouchStart: scope.onTouchStart }), [scope]);
}
export function InitialFocusProvider({ scope, children }) {
    return _jsx(OverlayLayerContext.Provider, { value: scope.layer, children: _jsx(InitialFocusContext.Provider, { value: scope.registry, children: children }) });
}
/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export function useInitialFocusTarget(input, preference, focusable) {
    const registry = useContext(InitialFocusContext);
    const focusableRef = useRef(focusable);
    focusableRef.current = focusable;
    // Tree order is fixed at first registration, so changing `preference` later does not move the field to the end.
    const order = useRef(null);
    useLayoutEffect(() => {
        if (!registry)
            return undefined;
        // Only the first registration of this field instance counts as "appeared"; a later `preference` change does not.
        const mounted = order.current === null;
        order.current ??= registry.nextOrder();
        return registry.register({ order: order.current, preference, focusable: () => focusableRef.current(), focus: () => input.current?.focus() }, mounted);
    }, [registry, preference, input]);
}
//# sourceMappingURL=initial-focus.js.map