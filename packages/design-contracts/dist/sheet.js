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
export const sheetDetentOrder = ["medium", "large", "full"];
export function validateSheetDetents(detents) {
    if (detents.length === 0) {
        throw new RangeError("Sheet detents must not be empty");
    }
    const seen = new Set();
    for (const detent of detents) {
        if (!sheetDetentOrder.includes(detent)) {
            throw new TypeError(`Unsupported Sheet detent: ${String(detent)}`);
        }
        if (seen.has(detent))
            throw new TypeError(`Duplicate Sheet detent: ${detent}`);
        seen.add(detent);
    }
    const ordered = [...detents].sort((left, right) => sheetDetentOrder.indexOf(left) - sheetDetentOrder.indexOf(right));
    if (ordered.some((detent, index) => detent !== detents[index])) {
        /*
          정렬을 대신 해 주지 않는 이유: 순서가 곧 "다음 단계"의 의미라서, 제품이 적은 순서와
          실제 이동 순서가 다르면 디버깅할 수 없는 화면이 된다.
        */
        throw new TypeError("Sheet detents must be listed from smallest to largest");
    }
}
export function resolveNextSheetDetent(detents, current, direction) {
    validateSheetDetents(detents);
    const index = detents.indexOf(current);
    if (index === -1) {
        throw new RangeError(`Sheet current detent is not in the list: ${current}`);
    }
    const next = direction === "expand" ? index + 1 : index - 1;
    /** 끝에서는 `null`이다 — renderer가 "더 갈 수 없다"를 컨트롤 상태로 표현한다. */
    return next < 0 || next >= detents.length ? null : detents[next];
}
//# sourceMappingURL=sheet.js.map