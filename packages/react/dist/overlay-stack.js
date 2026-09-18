import { jsxs as _jsxs } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, } from "react";
import { Dialog } from "./overlays.js";
import { Sheet } from "./overlays.js";
const OverlayStackContext = createContext(null);
export function useOverlayStack() {
    const value = useContext(OverlayStackContext);
    if (value === null)
        throw new Error("useOverlayStack must be used inside OverlayStackProvider");
    return value;
}
/** Convenience wrappers so a call site reads as the thing it opens. */
export function useDialog() {
    return useOverlayStack().openDialog;
}
export function useSheet() {
    return useOverlayStack().openSheet;
}
export function OverlayStackProvider({ children }) {
    const [entry, setEntry] = useState(null);
    const [open, setOpen] = useState(false);
    const nextId = useRef(0);
    const openEntry = useCallback((kind, request) => {
        const id = (nextId.current += 1);
        let settle = () => undefined;
        const closed = new Promise((resolve) => { settle = resolve; });
        setEntry({ kind, id, request, settle });
        setOpen(true);
        return {
            closed,
            close: () => setOpen(false),
        };
    }, []);
    const api = useMemo(() => ({
        openDialog: (request) => openEntry("dialog", request),
        openSheet: (request) => openEntry("sheet", request),
    }), [openEntry]);
    // The promise resolves from the renderer's own completion signal, not from a
    // timer: that is the whole reason this layer exists.
    const complete = () => {
        entry?.settle();
        setEntry(null);
    };
    return (_jsxs(OverlayStackContext.Provider, { value: api, children: [children, entry?.kind === "dialog" ? (_createElement(Dialog, { ...entry.request, key: entry.id, open: open, onOpenChange: (next) => setOpen(next), onDismissComplete: () => complete() })) : null, entry?.kind === "sheet" ? (_createElement(Sheet, { ...entry.request, key: entry.id, open: open, onOpenChange: (next) => setOpen(next), onDismissComplete: () => complete() })) : null] }));
}
//# sourceMappingURL=overlay-stack.js.map