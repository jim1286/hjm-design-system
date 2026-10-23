"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, } from "react";
import { createAlertDialogQueue, } from "@hjmds/design-contracts/components/alert-dialog";
import { AlertDialog } from "./overlays.js";
const AlertDialogQueueContext = createContext(null);
/** `open` is bound to the provider scope this component rendered under; after that scope changes it settles `interrupted`. */
export function useAlertDialogQueue() {
    const context = useContext(AlertDialogQueueContext);
    if (context === null)
        throw new Error("useAlertDialogQueue must be used inside AlertDialogQueueProvider");
    const { open, scope } = context;
    return useMemo(() => ({ open: (request, options = {}) => open(request, options, scope) }), [open, scope]);
}
function resultOf(reason) {
    if (reason === "confirm")
        return { outcome: "confirmed" };
    return { outcome: "cancelled", reason: reason === "trigger" ? "programmatic" : reason };
}
export function AlertDialogQueueProvider({ children, scope, modalPriority, portalContainer }) {
    const [queue] = useState(() => createAlertDialogQueue());
    const entries = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);
    // The element focused when a run of questions began: every dialog of the run returns there, so the second dialog
    // does not return focus to the first one's removed button.
    const returnFocusRef = useRef(null);
    useEffect(() => {
        queue.setActive(true);
        return () => queue.setActive(false);
    }, [queue]);
    useEffect(() => { queue.retainScope(scope); }, [queue, scope, entries]);
    const open = useMemo(() => (request, options, requestScope) => {
        if (queue.getSnapshot().length === 0) {
            returnFocusRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
                ? document.activeElement : null;
        }
        return queue.enqueue(request, options, requestScope);
    }, [queue]);
    const context = useMemo(() => ({ open, scope }), [open, scope]);
    const head = entries[0];
    const visible = head !== undefined && head.scope === scope ? head : undefined;
    return (_jsxs(AlertDialogQueueContext.Provider, { value: context, children: [children, visible ? (_jsx(AlertDialog, { open: true, request: visible.request, returnFocusRef: returnFocusRef, ...(visible.options.icon === undefined ? {} : { icon: visible.options.icon }), ...(visible.options.size === undefined ? {} : { size: visible.options.size }), ...(modalPriority === undefined ? {} : { modalPriority }), ...(portalContainer === undefined ? {} : { portalContainer }), onOpenChange: (next, { reason }) => { if (!next)
                    queue.settle(visible.id, resultOf(reason)); } }, visible.id)) : null] }));
}
//# sourceMappingURL=alert-dialog-queue.js.map