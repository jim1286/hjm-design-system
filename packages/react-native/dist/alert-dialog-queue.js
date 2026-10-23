import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, } from "react";
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
export function AlertDialogQueueProvider({ children, scope }) {
    const [queue] = useState(() => createAlertDialogQueue());
    const entries = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);
    // The head stays mounted while its exit runs; `onResult` (after native dismissal) settles it.
    const [closingId, setClosingId] = useState(null);
    useEffect(() => {
        queue.setActive(true);
        return () => queue.setActive(false);
    }, [queue]);
    useEffect(() => { queue.retainScope(scope); }, [queue, scope, entries]);
    const context = useMemo(() => ({ open: (request, options, requestScope) => queue.enqueue(request, options, requestScope), scope }), [queue, scope]);
    const head = entries[0];
    const visible = head !== undefined && head.scope === scope ? head : undefined;
    return (_jsxs(AlertDialogQueueContext.Provider, { value: context, children: [children, visible ? (_jsx(AlertDialog, { open: closingId !== visible.id, request: visible.request, ...(visible.options.size === undefined ? {} : { size: visible.options.size }), ...(visible.options.returnFocusRef === undefined ? {} : { returnFocusRef: visible.options.returnFocusRef }), onOpenChange: (next) => { if (!next)
                    setClosingId(visible.id); }, onResult: (result) => { queue.settle(visible.id, result); } }, visible.id)) : null] }));
}
//# sourceMappingURL=alert-dialog-queue.js.map