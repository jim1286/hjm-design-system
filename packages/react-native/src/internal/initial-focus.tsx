import { resolveInitialFocusTarget, type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { InteractionManager, TextInput } from "react-native";

type Entry = { order: number; preference: boolean | undefined; focusable(): boolean; focus(): void };
type Registry = { nextOrder(): number; register(entry: Entry): () => void };

/**
 * Nearest screen/overlay scope that chooses the field focused on entry (rules: screen-patterns
 * `resolveInitialFocusTarget`). Fields register by context rather than the scope searching the host tree, which
 * Native cannot query; a scope with mode "none" still provides a registry so its fields never reach an outer scope.
 */
const InitialFocusContext = createContext<Registry | null>(null);

export function InitialFocusScope({ mode, active = true, children }: { mode: InitialFocusMode; active?: boolean; children: ReactNode }) {
  const entries = useRef(new Set<Entry>());
  const counter = useRef(0);
  const registry = useMemo<Registry>(() => ({
    nextOrder: () => counter.current++,
    register(entry) {
      entries.current.add(entry);
      return () => { entries.current.delete(entry); };
    },
  }), []);
  // Once per activation: a mounted screen focuses on its first entry only; an overlay again on every opening.
  const focused = useRef(false);
  useEffect(() => {
    if (!active) { focused.current = false; return undefined; }
    if (focused.current || mode === "none") return undefined;
    // After interactions, so the keyboard does not animate against a navigation or overlay enter transition.
    const task = InteractionManager.runAfterInteractions(() => {
      if (focused.current) return;
      focused.current = true;
      // Never take focus from a field the user already entered.
      const state = (TextInput as unknown as { State?: { currentlyFocusedInput?: () => unknown } }).State;
      if (state?.currentlyFocusedInput?.()) return;
      const candidates = [...entries.current].map(entry => ({ entry, order: entry.order, preference: entry.preference, focusable: entry.focusable() }));
      resolveInitialFocusTarget(candidates, mode)?.entry.focus();
    });
    return () => task.cancel();
  }, [active, mode]);
  return <InitialFocusContext.Provider value={registry}>{children}</InitialFocusContext.Provider>;
}

/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export function useInitialFocusTarget(input: RefObject<TextInput | null>, preference: boolean | undefined, focusable: () => boolean) {
  const registry = useContext(InitialFocusContext);
  const focusableRef = useRef(focusable); focusableRef.current = focusable;
  // Tree order is fixed at first registration, so changing `preference` later does not move the field to the end.
  const order = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!registry) return undefined;
    order.current ??= registry.nextOrder();
    return registry.register({ order: order.current, preference, focusable: () => focusableRef.current(), focus: () => input.current?.focus() });
  }, [registry, preference, input]);
}
