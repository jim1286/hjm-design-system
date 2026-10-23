"use client";

import { resolveEntryFocus, type EntryFocusEvent, type EntryFocusPhase, type InitialFocusCandidate, type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { getTopModal, subscribeModalClose, type ActiveModal } from "../modal.js";

type Entry = { order: number; preference: boolean | undefined; element(): HTMLElement | null; focusable(): boolean };
type Registry = { nextOrder(): number; register(entry: Entry, mounted: boolean): () => void };
/** The overlay's own entry on the shared modal stack while it is active (set by `useModalFocus`). */
export type ModalLayerRef = { current: ActiveModal | null };

/**
 * Nearest screen/overlay scope that chooses the field focused on entry (rules: screen-patterns `resolveEntryFocus`,
 * shared with Native). Fields register by context, the same model as Native, instead of the scope querying the DOM; a
 * scope with mode "none" still owns its fields so they never reach an outer scope.
 */
const InitialFocusContext = createContext<Registry | null>(null);
// A bottom sheet owns this boundary, including ScreenLayout/marked fields nested inside its body.
const EntryFocusEnabledContext = createContext(true);
/** Layer of the enclosing HJM overlay; null on the page itself. A ScreenLayout inside a sheet uses the sheet's. */
const ModalLayerContext = createContext<ModalLayerRef | null>(null);

type NestedScope = { enter(): HTMLElement | null; settle(): void };
/**
 * Screen scopes rendered inside an HJM overlay, keyed by that overlay's layer. Their fields register with the screen,
 * not the overlay, so the overlay's activation asks them for the entry field instead of focusing its first control
 * over them (BurnTok search: a ScreenLayout in a Sheet left focus on the close button, 2026-10-18).
 */
const nestedScopes = new WeakMap<ModalLayerRef, Set<NestedScope>>();

/**
 * Product modals (not on the HJM stack) layered above the scope. A product modal that contains the scope's own fields
 * wraps the screen rather than covering it, so it does not block (BurnTok search overlay, 2026-10-18).
 */
function productModalAbove(fields: readonly HTMLElement[]): boolean {
  return [...document.querySelectorAll('[aria-modal="true"], dialog[open]')]
    .some(modal => !fields.some(field => modal.contains(field)));
}

function isEditable(element: Element | null): boolean {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement
    || (element instanceof HTMLElement && element.isContentEditable);
}

type Candidate = InitialFocusCandidate & { entry: Entry };
export type InitialFocusScopeHandle = Readonly<{
  registry: Registry;
  layer: ModalLayerRef | null;
  enabled: boolean;
  /**
   * Overlays only: runs entry when the modal activates and returns the field for `useModalFocus` to focus. `explicit`
   * means the overlay already has an `initialFocusRef`, so entry settles without choosing a field.
   */
  enter(explicit: boolean): HTMLElement | null;
}>;

/**
 * Screen scopes enter on mount (Web has no enter transition to wait for); overlays pass `layer` and enter through
 * `useModalFocus`. User pointer, key, wheel or touch input while no modal is above the scope ends the entry window.
 */
export function useInitialFocusScope({ mode, active = true, layer: ownLayer, enabled = true }: { mode: InitialFocusMode; active?: boolean; layer?: ModalLayerRef; enabled?: boolean }): InitialFocusScopeHandle {
  const inherited = useContext(ModalLayerContext);
  const inheritedEnabled = useContext(EntryFocusEnabledContext);
  // A separate overlay owns its policy; ordinary nested screens inherit their enclosing sheet's policy.
  const entryFocusEnabled = enabled && (ownLayer !== undefined || inheritedEnabled);
  const enabledRef = useRef(entryFocusEnabled); enabledRef.current = entryFocusEnabled;
  const layer = ownLayer ?? inherited;
  const overlay = ownLayer !== undefined;
  const modeRef = useRef(mode); modeRef.current = mode;
  const state = useRef({ phase: "inactive" as EntryFocusPhase, entries: new Set<Entry>(), fresh: new Set<Entry>(), counter: 0, flushQueued: false });

  const scope = useMemo(() => {
    const s = state.current;
    const blocked = () => {
      const own = layer?.current ?? null;
      // Inside an HJM overlay that is not on the stack yet: its activation runs this scope's entry (`nestedScopes`).
      if (layer !== null && own === null) return true;
      const top = getTopModal();
      if (top) return top !== own;
      // A product's own modal above the page still covers it; overlay content is portaled outside product markup.
      if (layer !== null) return false;
      const fields = [...s.entries].map(entry => entry.element()).filter((element): element is HTMLElement => element !== null);
      return productModalAbove(fields);
    };
    const dispatch = (event: EntryFocusEvent<Candidate> | { kind: "register"; entry: Entry }): HTMLElement | null => {
      if (!enabledRef.current) return null;
      const candidates: Candidate[] = [...s.entries].map(entry => ({ entry, order: entry.order, preference: entry.preference, focusable: entry.focusable() }));
      const resolved = event.kind === "register" && "entry" in event
        ? { kind: "register" as const, field: candidates.find(candidate => candidate.entry === event.entry)! }
        : event as EntryFocusEvent<Candidate>;
      const result = resolveEntryFocus(s.phase, resolved, { mode: modeRef.current, candidates, blocked: blocked(), textEntryFocused: isEditable(document.activeElement) });
      s.phase = result.phase;
      return result.target?.entry.element() ?? null;
    };
    const focus = (target: HTMLElement | null) => target?.focus({ preventScroll: true });
    // Fields mounting in one commit are judged together.
    const flush = () => {
      s.flushQueued = false;
      const fresh = [...s.fresh].filter(entry => s.entries.has(entry)).sort((a, b) => a.order - b.order);
      s.fresh.clear();
      const field = fresh.find(entry => entry.preference === true) ?? fresh[0];
      if (field) focus(dispatch({ kind: "register", entry: field }));
    };
    const registry: Registry = {
      nextOrder: () => s.counter++,
      register(entry, mounted) {
        s.entries.add(entry);
        if (mounted) { s.fresh.add(entry); if (!s.flushQueued) { s.flushQueued = true; queueMicrotask(flush); } }
        return () => { s.entries.delete(entry); s.fresh.delete(entry); };
      },
    };
    const settle = () => { s.phase = "settled"; };
    const enter = (explicit: boolean) => {
      s.fresh.clear();
      const nested = overlay && layer ? [...(nestedScopes.get(layer) ?? [])] : [];
      if (explicit) { settle(); for (const scope of nested) scope.settle(); return null; }
      // A user can open a menu before the deferred entry runs. Never reset their settled entry window.
      if (s.phase === "settled") return null;
      if (s.phase === "inactive") dispatch({ kind: "activate" });
      const own = dispatch({ kind: s.phase === "open" ? "unblock" : "enter" });
      if (own) return own;
      for (const scope of nested) { const target = scope.enter(); if (target) return target; }
      return null;
    };
    return { registry, layer, dispatch, focus, enter, settle };
  }, [layer, overlay]);

  useEffect(() => {
    if (!active) { scope.dispatch({ kind: "deactivate" }); return undefined; }
    // Observe interaction immediately; deferring activation too would lose a click before the entry microtask.
    scope.dispatch({ kind: "activate" });
    // After every effect of this commit, so a modal opening in the same commit (an app-root consent dialog) is
    // already on the stack and blocks entry instead of taking focus away and handing it back later.
    let cancelled = false;
    if (!overlay) queueMicrotask(() => { if (!cancelled) scope.focus(scope.enter(false)); });
    // A screen inside an overlay that activates later enters when the overlay does (see `enter`).
    let nested: Set<NestedScope> | undefined;
    const nestedEntry: NestedScope = { enter: () => scope.enter(false), settle: scope.settle };
    if (!overlay && scope.layer) {
      nested = nestedScopes.get(scope.layer) ?? new Set();
      nestedScopes.set(scope.layer, nested);
      nested.add(nestedEntry);
    }
    const interact = () => { scope.dispatch({ kind: "interact" }); };
    const events = ["pointerdown", "click", "contextmenu", "keydown", "wheel", "touchstart"] as const;
    for (const type of events) document.addEventListener(type, interact, true);
    // A modal above closed (after its return focus ran): retry a pending entry.
    const unsubscribe = subscribeModalClose(() => scope.focus(scope.dispatch({ kind: "unblock" })));
    return () => {
      cancelled = true;
      nested?.delete(nestedEntry);
      for (const type of events) document.removeEventListener(type, interact, true);
      unsubscribe();
      scope.dispatch({ kind: "deactivate" });
    };
  }, [active, overlay, scope, entryFocusEnabled]);

  return useMemo(() => ({ registry: scope.registry, layer: scope.layer, enter: scope.enter, enabled: entryFocusEnabled }), [scope, entryFocusEnabled]);
}

export function InitialFocusProvider({ scope, children }: { scope: InitialFocusScopeHandle; children: ReactNode }) {
  return <EntryFocusEnabledContext.Provider value={scope.enabled}><ModalLayerContext.Provider value={scope.layer}><InitialFocusContext.Provider value={scope.registry}>{children}</InitialFocusContext.Provider></ModalLayerContext.Provider></EntryFocusEnabledContext.Provider>;
}

/** Screen scope: focuses the chosen field on mount, never over a field the user is in or under an open modal. */
export function InitialFocusScope({ mode, children }: { mode: InitialFocusMode; children: ReactNode }) {
  const scope = useInitialFocusScope({ mode });
  return <InitialFocusProvider scope={scope}>{children}</InitialFocusProvider>;
}

/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export function useInitialFocusTarget(element: RefObject<HTMLElement | null>, preference: boolean | undefined) {
  const registry = useContext(InitialFocusContext);
  // Tree order is fixed at first registration, so changing `preference` later does not move the field to the end.
  const order = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!registry) return undefined;
    // Only the first registration of this field instance counts as "appeared"; a later `preference` change does not.
    const mounted = order.current === null;
    order.current ??= registry.nextOrder();
    return registry.register({
      order: order.current, preference, element: () => element.current,
      // Disabled and read-only fields are never focused on entry.
      focusable: () => { const node = element.current as (HTMLInputElement | HTMLTextAreaElement | null); return !!node && !node.disabled && !node.readOnly; },
    }, mounted);
  }, [registry, preference, element]);
}

/** Page footer inputs are bottom-anchored, so entry must not open their keyboard (2026-10-18 user request).
 * Keep the boundary through nested screens; a separately opened overlay owns its own focus policy.
 */
export function BottomEntryFocusBoundary({ children }: { children: ReactNode }) {
  return <EntryFocusEnabledContext.Provider value={false}><InitialFocusContext.Provider value={null}>{children}</InitialFocusContext.Provider></EntryFocusEnabledContext.Provider>;
}
