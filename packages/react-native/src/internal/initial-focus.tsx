import type { ComponentRef } from "react";
import { resolveEntryFocus, type EntryFocusEvent, type EntryFocusPhase, type InitialFocusCandidate, type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { TextInput } from "react-native";

type Entry = { order: number; preference: boolean | undefined; focusable(): boolean; focus(): void };
type Registry = { nextOrder(): number; register(entry: Entry, mounted: boolean): () => void };
type LayerRef = { readonly current: number | null };

/**
 * Nearest screen/overlay scope that chooses the field focused on entry (rules: screen-patterns `resolveEntryFocus`).
 * Fields register by context rather than the scope searching the host tree, which Native cannot query; a scope with
 * mode "none" still provides a registry so its fields never reach an outer scope.
 */
const InitialFocusContext = createContext<Registry | null>(null);
// A bottom sheet owns this boundary, including ScreenLayout/marked fields nested inside its body.
const EntryFocusEnabledContext = createContext(true);

/*
 * Open HJM overlays in presentation order. An RN Modal covers every screen, so a scope is blocked while an overlay
 * presented after its own layer is open (the root screen layer is 0). Web reads its modal stack the same way.
 */
let lastLayer = 0;
const openLayers = new Set<number>();
const layerListeners = new Set<() => void>();
const rootLayer: LayerRef = { current: 0 };
/** Layer of the enclosing overlay, so a ScreenLayout rendered inside a sheet is blocked only by overlays above it. */
const OverlayLayerContext = createContext<LayerRef>(rootLayer);
/**
 * Whether the enclosing scope is active. A screen inside an overlay enters with the overlay (after its native
 * presentation), not on mount: focusing a TextInput before the Modal is shown is dropped (BurnTok search, 2026-10-18).
 */
const ScopeActiveContext = createContext(true);

/**
 * Keeps an overlay on the open stack while `presented` (from opening until its exit and native dismissal finish, the
 * point where return focus also runs). Closing notifies the scopes below so a pending entry focus can run.
 */
export function useOverlayLayer(presented: boolean): LayerRef {
  const layer = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!presented) return undefined;
    const id = ++lastLayer;
    layer.current = id;
    openLayers.add(id);
    return () => {
      openLayers.delete(id);
      layer.current = null;
      for (const listener of [...layerListeners]) listener();
    };
  }, [presented]);
  return layer;
}

function textEntryFocused(): boolean {
  const state = (TextInput as unknown as { State?: { currentlyFocusedInput?: () => unknown } }).State;
  return state?.currentlyFocusedInput?.() != null;
}

type Candidate = InitialFocusCandidate & { entry: Entry };
export type InitialFocusScopeHandle = Readonly<{ registry: Registry; layer: LayerRef; active: boolean; enabled: boolean; onTouchStart(): void }>;

/**
 * Screen/overlay entry focus. The returned `onTouchStart` goes on the scope's root view: a touch there (bubbling from
 * any descendant, scrolls included) ends the entry window unless an overlay is above the scope.
 * `layer` is the overlay's own layer; screens inherit the enclosing one.
 */
export function useInitialFocusScope({ mode, active: ownActive = true, layer: ownLayer, enabled = true }: { mode: InitialFocusMode; active?: boolean; layer?: LayerRef; enabled?: boolean }): InitialFocusScopeHandle {
  const inherited = useContext(OverlayLayerContext);
  const inheritedEnabled = useContext(EntryFocusEnabledContext);
  const entryFocusEnabled = enabled && (ownLayer !== undefined || inheritedEnabled);
  const enabledRef = useRef(entryFocusEnabled); enabledRef.current = entryFocusEnabled;
  const enclosingActive = useContext(ScopeActiveContext);
  const layer = ownLayer ?? inherited;
  // Overlays own their activation; screens follow the scope they are rendered in.
  const active = ownActive && (ownLayer !== undefined || enclosingActive);
  const modeRef = useRef(mode); modeRef.current = mode;
  const state = useRef({ phase: "inactive" as EntryFocusPhase, entries: new Set<Entry>(), fresh: new Set<Entry>(), counter: 0, flush: null as ReturnType<typeof setTimeout> | null });

  const scope = useMemo(() => {
    const s = state.current;
    const blocked = () => { const own = layer.current ?? 0; return [...openLayers].some(id => id > own); };
    const dispatch = (event: EntryFocusEvent<Candidate> | { kind: "register"; entry: Entry }) => {
      if (!enabledRef.current) return;
      const candidates: Candidate[] = [...s.entries].map(entry => ({ entry, order: entry.order, preference: entry.preference, focusable: entry.focusable() }));
      const resolved = event.kind === "register" && "entry" in event
        ? { kind: "register" as const, field: candidates.find(candidate => candidate.entry === event.entry)! }
        : event as EntryFocusEvent<Candidate>;
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
      if (field) dispatch({ kind: "register", entry: field });
    };
    const registry: Registry = {
      nextOrder: () => s.counter++,
      register(entry, mounted) {
        s.entries.add(entry);
        if (mounted) { s.fresh.add(entry); s.flush ??= setTimeout(flush, 0); }
        return () => { s.entries.delete(entry); s.fresh.delete(entry); };
      },
    };
    return { registry, dispatch, layer, onTouchStart: () => dispatch({ kind: "interact" }) };
  }, [layer]);

  useEffect(() => {
    const s = state.current;
    if (!active) { scope.dispatch({ kind: "deactivate" }); return undefined; }
    scope.dispatch({ kind: "activate" });
    // RN 0.88 removed InteractionManager; browser hosts also lack setImmediate.
    // Use the shared timer turn on both hosts; overlays still wait for native onShow.
    const enter = setTimeout(() => { s.fresh.clear(); scope.dispatch({ kind: "enter" }); }, 0);
    let unblock: ReturnType<typeof setTimeout> | undefined;
    // An overlay above closed: retry on the turn after its teardown.
    const onLayerClosed = () => { if (unblock !== undefined) clearTimeout(unblock); unblock = setTimeout(() => scope.dispatch({ kind: "unblock" }), 0); };
    layerListeners.add(onLayerClosed);
    return () => {
      clearTimeout(enter); if (unblock !== undefined) clearTimeout(unblock); layerListeners.delete(onLayerClosed);
      if (s.flush) { clearTimeout(s.flush); s.flush = null; }
      scope.dispatch({ kind: "deactivate" });
    };
  }, [active, scope, entryFocusEnabled]);

  return useMemo(() => ({ registry: scope.registry, layer: scope.layer, active, enabled: entryFocusEnabled, onTouchStart: scope.onTouchStart }), [scope, active, entryFocusEnabled]);
}

export function InitialFocusProvider({ scope, children }: { scope: InitialFocusScopeHandle; children: ReactNode }) {
  return <EntryFocusEnabledContext.Provider value={scope.enabled}><OverlayLayerContext.Provider value={scope.layer}><ScopeActiveContext.Provider value={scope.active}><InitialFocusContext.Provider value={scope.registry}>{children}</InitialFocusContext.Provider></ScopeActiveContext.Provider></OverlayLayerContext.Provider></EntryFocusEnabledContext.Provider>;
}

/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export function useInitialFocusTarget(input: RefObject<ComponentRef<typeof TextInput> | null>, preference: boolean | undefined, focusable: () => boolean) {
  const registry = useContext(InitialFocusContext);
  const focusableRef = useRef(focusable); focusableRef.current = focusable;
  // Tree order is fixed at first registration, so changing `preference` later does not move the field to the end.
  const order = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!registry) return undefined;
    // Only the first registration of this field instance counts as "appeared"; a later `preference` change does not.
    const mounted = order.current === null;
    order.current ??= registry.nextOrder();
    return registry.register({ order: order.current, preference, focusable: () => focusableRef.current(), focus: () => input.current?.focus() }, mounted);
  }, [registry, preference, input]);
}

/** Page footer inputs are bottom-anchored, so entry must not open their keyboard (2026-10-18 user request).
 * Keep the boundary through nested screens; a separately opened overlay owns its own focus policy.
 */
export function BottomEntryFocusBoundary({ children }: { children: ReactNode }) {
  return <EntryFocusEnabledContext.Provider value={false}><InitialFocusContext.Provider value={null}>{children}</InitialFocusContext.Provider></EntryFocusEnabledContext.Provider>;
}
