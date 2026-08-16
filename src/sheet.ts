/** Why an open Sheet is being asked to close. */
export type SheetDismissReason =
  | "close-action"
  | "escape"
  | "back"
  | "outside"
  | "swipe"
  | "programmatic";

/**
 * `trigger` only opens a Sheet. Every close reports the concrete dismiss reason
 * so renderers and product analytics do not have to infer it from platform events.
 */
export type SheetOpenChangeDetails = Readonly<{
  reason: "trigger" | SheetDismissReason;
}>;

/** User-dismiss policy. A controlled owner may always close programmatically. */
export type SheetDismissPolicy = Readonly<{
  dismissible: boolean;
  dismissWhileBusy: boolean;
  outsideDismiss: boolean;
  escapeOrBackDismiss: boolean;
  swipeDismiss: boolean;
}>;

export type SheetOpenState =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange(open: boolean, detail: SheetOpenChangeDetails): void;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean, detail: SheetOpenChangeDetails) => void;
    }>;

export const sheetBehaviorDefaults = {
  dismissible: true,
  dismissWhileBusy: false,
  outsideDismiss: true,
  escapeOrBackDismiss: true,
  swipeDismiss: false,
} as const satisfies SheetDismissPolicy;

/**
 * Resolves an attempted close without platform knowledge. Programmatic close is
 * intentionally an owner override: a controlled `open={false}` cannot be vetoed
 * by a renderer, even while the Sheet is busy or not user-dismissible.
 */
export function canDismissSheet(
  reason: SheetDismissReason,
  busy: boolean,
  policy: SheetDismissPolicy = sheetBehaviorDefaults,
): boolean {
  if (reason === "programmatic") return true;
  if (!policy.dismissible) return false;
  if (busy && !policy.dismissWhileBusy) return false;
  if (reason === "outside") return policy.outsideDismiss;
  if (reason === "escape" || reason === "back") {
    return policy.escapeOrBackDismiss;
  }
  if (reason === "swipe") return policy.swipeDismiss;
  return true;
}

export type SheetLifecycle = Readonly<{
  open(): number;
  beginDismiss(): number | null;
  requestClose(
    reason: SheetDismissReason,
    busy: boolean,
    policy?: SheetDismissPolicy,
  ): boolean;
  completeDismiss(cycle: number): boolean;
}>;

/**
 * Makes persistent native Modal renderers settle each visible cycle once.
 * Platform adapters still decide when native dismissal has actually completed.
 */
export function createSheetLifecycle(
  initiallyVisible = false,
): SheetLifecycle {
  let sequence = initiallyVisible ? 1 : 0;
  let activeCycle: number | null = initiallyVisible ? sequence : null;
  let closeRequested = false;
  const dismissingCycles = new Set<number>();

  return {
    open() {
      if (activeCycle !== null) return activeCycle;
      sequence += 1;
      activeCycle = sequence;
      closeRequested = false;
      return activeCycle;
    },
    beginDismiss() {
      if (activeCycle === null) return null;
      const cycle = activeCycle;
      activeCycle = null;
      closeRequested = false;
      dismissingCycles.add(cycle);
      return cycle;
    },
    requestClose(reason, busy, policy = sheetBehaviorDefaults) {
      if (activeCycle === null || closeRequested) return false;
      if (!canDismissSheet(reason, busy, policy)) return false;
      closeRequested = true;
      return true;
    },
    completeDismiss(cycle) {
      return dismissingCycles.delete(cycle);
    },
  };
}
