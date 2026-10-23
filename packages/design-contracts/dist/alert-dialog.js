export const alertDialogBehaviorDefaults = {
    initialFocus: { alert: "confirm", confirm: "cancel" },
    outsideDismiss: false,
    escapeOrBackOutcome: "cancelled",
    dismissWhileBusy: false,
};
function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`AlertDialog ${field} must not be empty`);
    }
}
export function validateAlertDialogRequest(request) {
    assertCopy(request.title, "title");
    assertCopy(request.description, "description");
    assertCopy(request.confirmLabel, "confirmLabel");
    if (request.mode === "alert") {
        if (request.tone === "danger") {
            throw new TypeError("AlertDialog danger tone requires confirm mode");
        }
        return;
    }
    assertCopy(request.cancelLabel, "cancelLabel");
    if (request.onConfirm)
        assertCopy(request.fallbackErrorMessage, "fallbackErrorMessage");
}
export function getAlertDialogInitialFocus(mode) {
    return alertDialogBehaviorDefaults.initialFocus[mode];
}
export function canDismissAlertDialog(reason, busy) {
    if (busy && !alertDialogBehaviorDefaults.dismissWhileBusy)
        return false;
    if (reason === "outside")
        return alertDialogBehaviorDefaults.outsideDismiss;
    return true;
}
function resolveFailureMessage(request, error) {
    if (!request.onConfirm)
        return "";
    try {
        const resolved = request.resolveErrorMessage?.(error).trim();
        return resolved || request.fallbackErrorMessage;
    }
    catch {
        return request.fallbackErrorMessage;
    }
}
/**
 * Owns a complete AlertDialog lifecycle, including side-effect de-duplication
 * and settling only after the renderer reports that exit motion completed.
 */
export function createAlertDialogSession(request) {
    validateAlertDialogRequest(request);
    let phase = { status: "idle" };
    let settleResult;
    let settled = false;
    const listeners = new Set();
    const result = new Promise((resolve) => {
        settleResult = resolve;
    });
    const notify = () => {
        for (const listener of listeners)
            listener();
    };
    const transition = (next) => {
        phase = next;
        notify();
    };
    const settle = (next) => {
        if (settled)
            return false;
        settled = true;
        settleResult(next);
        return true;
    };
    const session = {
        request,
        result,
        getSnapshot: () => phase,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        async confirm() {
            if (phase.status !== "idle" && phase.status !== "error")
                return false;
            if (request.mode === "alert" || !request.onConfirm) {
                transition({ status: "closing", result: { outcome: "confirmed" } });
                return true;
            }
            transition({ status: "busy" });
            try {
                await request.onConfirm();
                if (phase.status !== "busy")
                    return false;
                transition({ status: "closing", result: { outcome: "confirmed" } });
                return true;
            }
            catch (error) {
                if (phase.status !== "busy")
                    return false;
                transition({ status: "error", message: resolveFailureMessage(request, error) });
                return false;
            }
        },
        cancel(reason) {
            if (!canDismissAlertDialog(reason, phase.status === "busy"))
                return false;
            if (phase.status !== "idle" && phase.status !== "error")
                return false;
            transition({ status: "closing", result: { outcome: "cancelled", reason } });
            return true;
        },
        attemptOutsideDismiss() {
            return false;
        },
        completeExit() {
            if (phase.status !== "closing")
                return false;
            const finalResult = phase.result;
            transition({ status: "closed", result: finalResult });
            return settle(finalResult);
        },
        interrupt() {
            if (phase.status === "closed")
                return false;
            const interrupted = {
                outcome: "cancelled",
                reason: "interrupted",
            };
            transition({ status: "closed", result: interrupted });
            return settle(interrupted);
        },
    };
    return session;
}
const interruptedResult = { outcome: "cancelled", reason: "interrupted" };
export function createAlertDialogQueue() {
    let entries = [];
    let snapshot = [];
    let nextId = 1;
    let active = true;
    const listeners = new Set();
    // Resolve before notifying: the caller's `await` continuation is queued ahead of the renderer's re-render, so a
    // trigger it re-enables is focusable when the closing dialog returns focus.
    const commit = (next, settled) => {
        for (const [entry, result] of settled)
            entry.resolve(result);
        entries = next;
        snapshot = next.map(({ id, request, options, scope }) => ({ id, request, options, scope }));
        for (const listener of listeners)
            listener();
    };
    return {
        enqueue(request, options, scope) {
            validateAlertDialogRequest(request);
            if (!active)
                return Promise.resolve(interruptedResult);
            return new Promise((resolve) => {
                commit([...entries, { id: nextId++, request, options, scope, resolve }], []);
            });
        },
        getSnapshot: () => snapshot,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        settle(id, result) {
            const head = entries[0];
            if (head === undefined || head.id !== id)
                return false;
            commit(entries.slice(1), [[head, result]]);
            return true;
        },
        retainScope(scope) {
            const stale = entries.filter((entry) => entry.scope !== scope);
            if (stale.length === 0)
                return;
            commit(entries.filter((entry) => entry.scope === scope), stale.map((entry) => [entry, interruptedResult]));
        },
        setActive(next) {
            active = next;
            if (next || entries.length === 0)
                return;
            commit([], entries.map((entry) => [entry, interruptedResult]));
        },
    };
}
//# sourceMappingURL=alert-dialog.js.map