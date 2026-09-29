import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, View } from "react-native";
import ReanimatedSwipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { validateActions, type RowAction } from "@hjmds/design-contracts/components/interaction-adapters";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";

export type SwipeActionsProps = {
  rowId: string; children: ReactNode; label: string; actions: readonly RowAction[]; busy?: boolean;
  /** Share this controlled ID across a list to reveal only one row at a time. */
  openRowId: string | null; onOpenRowChange(id: string | null): void; actionsLabel: string;
  onAction(id: string): void | Promise<void>; onError(error: unknown): void;
};
export function SwipeActions(props: SwipeActionsProps) {
  validateActions(props.actions);
  const theme = useHjmNativeTheme();
  const ref = useRef<SwipeableMethods>(null);
  const pending = useRef(false);
  const [accessibleActions, setAccessibleActions] = useState(false);
  const latest = useRef(props); latest.current = props;
  useEffect(() => {
    if (props.openRowId !== props.rowId || theme.environment.reducedMotion) ref.current?.reset();
  }, [props.rowId, props.openRowId, theme.environment.reducedMotion]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state !== "active") { ref.current?.reset(); if (latest.current.openRowId === latest.current.rowId) latest.current.onOpenRowChange(null); }
    });
    return () => subscription.remove();
  }, []);
  // A recycled row view (FlashList) keeps component state across rowIds; `key` only resets the swipeable.
  // Clear the pending guard and the explicit menu so row B never inherits row A's in-flight action.
  useEffect(() => { pending.current = false; setAccessibleActions(false); }, [props.rowId]);
  async function run(action: RowAction) {
    if (props.busy || pending.current || action.disabled) return;
    pending.current = true;
    try { await props.onAction(action.id); }
    catch (error) { props.onError(error); }
    finally {
      pending.current = false; ref.current?.reset();
      // Only close this row. Another row may have been opened while the action was pending (2026-09-30 review).
      if (latest.current.openRowId === latest.current.rowId) latest.current.onOpenRowChange(null);
    }
  }
  // `direction` mirrors the action row under HJM RTL; it stayed LTR before (2026-09-30 audit).
  // Swipeable retains its offscreen actions after reset; keep those out of focus
  // and hit testing, and expose only one copy when the explicit menu is open.
  const actions = (hidden = false) => <View accessibilityElementsHidden={hidden} importantForAccessibility={hidden ? "no-hide-descendants" : "auto"} pointerEvents={hidden ? "none" : "auto"} style={{ direction: theme.environment.direction, flexDirection: "row", flexWrap: "wrap", gap: theme.tokens.spacing.xs }}>
    {props.actions.map(action => <Button key={action.id} tone={action.intent === "danger" ? "danger" : "ghost"}
      disabled={Boolean(props.busy || action.disabled)} onPress={() => void run(action)}>{action.label}</Button>)}
  </View>;
  return <View accessibilityLabel={props.label}>
    <ReanimatedSwipeable key={props.rowId} ref={ref} enabled={!props.busy && !theme.environment.reducedMotion && !accessibleActions}
      overshootLeft={false} overshootRight={false}
      {...(theme.environment.direction === "rtl" ? { renderLeftActions: () => actions(props.openRowId !== props.rowId || accessibleActions || theme.environment.reducedMotion) } : { renderRightActions: () => actions(props.openRowId !== props.rowId || accessibleActions || theme.environment.reducedMotion) })}
      onSwipeableWillOpen={() => props.onOpenRowChange(props.rowId)}
      onSwipeableClose={() => { if (props.openRowId === props.rowId) props.onOpenRowChange(null); }}>
      <View style={{ backgroundColor: theme.colors.bg }}>{props.children}</View>
    </ReanimatedSwipeable>
    <Button tone="ghost" onPress={() => setAccessibleActions(value => !value)}>{props.actionsLabel}</Button>
    {accessibleActions || theme.environment.reducedMotion ? actions() : null}
  </View>;
}
