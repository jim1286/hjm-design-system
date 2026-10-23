"use client";
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
    const activeEntry = useRef(null);
    const openEntry = useCallback((kind, request) => {
        // Reject before React commits so two requests in one event cannot orphan a promise.
        if (activeEntry.current)
            throw new Error("Wait for the current overlay.closed before opening another overlay");
        const id = (nextId.current += 1);
        let settle = () => undefined;
        const closed = new Promise((resolve) => { settle = resolve; });
        const next = { kind, id, request, settle };
        activeEntry.current = next;
        setEntry(next);
        setOpen(true);
        return {
            closed,
            close: () => { if (activeEntry.current?.id === id)
                setOpen(false); },
        };
    }, []);
    const api = useMemo(() => ({
        openDialog: (request) => openEntry("dialog", request),
        openSheet: (request) => openEntry("sheet", request),
    }), [openEntry]);
    // The promise resolves from the renderer's own completion signal, not from a
    // timer: that is the whole reason this layer exists.
    const complete = (completed, notify) => {
        if (activeEntry.current?.id !== completed.id)
            return;
        activeEntry.current = null;
        setEntry((current) => current?.id === completed.id ? null : current);
        // A consumer callback may open the next overlay or throw; either way this
        // session's completion promise must settle and must not clear its successor.
        try {
            notify();
        }
        finally {
            completed.settle();
        }
    };
    return (_jsxs(OverlayStackContext.Provider, { value: api, children: [children, entry?.kind === "dialog" ? (_createElement(Dialog, { ...entry.request, key: entry.id, open: open, onOpenChange: (next) => setOpen(next), onDismissComplete: (details) => complete(entry, () => entry.request.onDismissComplete?.(details)) })) : null, entry?.kind === "sheet" ? (_createElement(Sheet, { ...entry.request, key: entry.id, open: open, onOpenChange: (next) => setOpen(next), onDismissComplete: (details) => complete(entry, () => entry.request.onDismissComplete?.(details)) })) : null] }));
}
//# sourceMappingURL=overlay-stack.js.map