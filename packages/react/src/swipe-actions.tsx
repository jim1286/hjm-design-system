import { useRef, type ReactNode } from "react";
import { validateActions, type RowAction } from "@hjmds/design-contracts/components/interaction-adapters";
import { Button } from "./actions.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type SwipeActionsProps = {
  children: ReactNode; label: string; actions: readonly RowAction[]; busy?: boolean;
  onAction(id: string): void | Promise<void>; onError(error: unknown): void;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
};
/** Desktop exposes the same actions directly; no hidden swipe-only functionality. */
export function SwipeActions({ children, label, actions, busy, onAction, onError, layoutStyle }: SwipeActionsProps) {
  validateActions(actions);
  const pending = useRef(false);
  async function run(action: RowAction) {
    if (busy || pending.current || action.disabled) return;
    pending.current = true;
    try { await onAction(action.id); } catch (error) { onError(error); } finally { pending.current = false; }
  }
  return <div role="group" aria-label={label} aria-busy={busy} style={layoutStyle}>
    {children}<div style={{ display: "flex", gap: "var(--hjm-space-xs)", flexWrap: "wrap" }}>
      {actions.map(action => <Button key={action.id} tone={action.intent === "danger" ? "danger" : "ghost"}
        disabled={Boolean(busy || action.disabled)} onClick={() => void run(action)}>{action.label}</Button>)}
    </div>
  </div>;
}
