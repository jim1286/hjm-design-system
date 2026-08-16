export const sheetBehaviorDefaults = {
    dismissible: true,
    dismissWhileBusy: false,
    outsideDismiss: true,
    escapeOrBackDismiss: true,
    swipeDismiss: false,
};
/**
 * Resolves an attempted close without platform knowledge. Programmatic close is
 * intentionally an owner override: a controlled `open={false}` cannot be vetoed
 * by a renderer, even while the Sheet is busy or not user-dismissible.
 */
export function canDismissSheet(reason, busy, policy = sheetBehaviorDefaults) {
    if (reason === "programmatic")
        return true;
    if (!policy.dismissible)
        return false;
    if (busy && !policy.dismissWhileBusy)
        return false;
    if (reason === "outside")
        return policy.outsideDismiss;
    if (reason === "escape" || reason === "back") {
        return policy.escapeOrBackDismiss;
    }
    if (reason === "swipe")
        return policy.swipeDismiss;
    return true;
}
/**
 * Makes persistent native Modal renderers settle each visible cycle once.
 * Platform adapters still decide when native dismissal has actually completed.
 */
export function createSheetLifecycle(initiallyVisible = false) {
    let sequence = initiallyVisible ? 1 : 0;
    let activeCycle = initiallyVisible ? sequence : null;
    let closeRequested = false;
    const dismissingCycles = new Set();
    return {
        open() {
            if (activeCycle !== null)
                return activeCycle;
            sequence += 1;
            activeCycle = sequence;
            closeRequested = false;
            return activeCycle;
        },
        beginDismiss() {
            if (activeCycle === null)
                return null;
            const cycle = activeCycle;
            activeCycle = null;
            closeRequested = false;
            dismissingCycles.add(cycle);
            return cycle;
        },
        requestClose(reason, busy, policy = sheetBehaviorDefaults) {
            if (activeCycle === null || closeRequested)
                return false;
            if (!canDismissSheet(reason, busy, policy))
                return false;
            closeRequested = true;
            return true;
        },
        completeDismiss(cycle) {
            return dismissingCycles.delete(cycle);
        },
    };
}
//# sourceMappingURL=sheet.js.map