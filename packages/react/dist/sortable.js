import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState, useMemo } from "react";
import { Accessibility } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { reorderIntent, validateItems } from "@hjmds/design-contracts/components/interaction-adapters";
import { Button } from "./actions.js";
import { useHjmTheme } from "./provider.js";
function Row({ item, index, children, disabled, reduced, labels, move, count }) {
    const { ref, handleRef } = useSortable({ id: item.id, index, disabled: disabled || item.disabled === true,
        ...(reduced ? { transition: null } : {}) });
    return _jsxs("li", { ref: ref, "data-item-id": item.id, style: { display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", alignItems: "center", gap: "var(--hjm-space-sm)", paddingBlock: "var(--hjm-space-xs)" }, children: [_jsx(Button, { ref: handleRef, tone: "ghost", type: "button", disabled: disabled || item.disabled, "aria-label": labels.handle(item), style: { minWidth: 44, minHeight: 44, touchAction: "none", cursor: "grab" }, children: "\u283F" }), _jsx("div", { style: { minWidth: 0, overflowWrap: "anywhere" }, children: children }), _jsxs("div", { style: { gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-xs)" }, children: [_jsx(Button, { tone: "ghost", disabled: disabled || item.disabled || index === 0, onClick: () => move(index - 1), children: labels.previous(item) }), _jsx(Button, { tone: "ghost", disabled: disabled || item.disabled || index === count - 1, onClick: () => move(index + 1), children: labels.next(item) })] })] });
}
/** Small controlled collections only; persistence and rollback belong to the host. */
export function SortableCollection(props) {
    validateItems(props.items);
    if (!props.label.trim())
        throw new TypeError("SortableCollection needs a label");
    const { environment } = useHjmTheme();
    const [announcement, setAnnouncement] = useState("");
    const latest = useRef(props);
    latest.current = props;
    const accessibility = useMemo(() => Accessibility.configure({
        screenReaderInstructions: { draggable: props.labels.instructions },
        announcements: {
            dragstart: ({ operation }) => {
                const item = latest.current.items.find(i => i.id === operation.source?.id);
                return item ? latest.current.labels.dragStart(item) : undefined;
            },
            dragend: ({ canceled }) => canceled ? latest.current.labels.dragCancel : undefined,
            // HJM emits the accepted controlled position, never raw upstream IDs.
            dragover: () => undefined, dragmove: () => undefined,
        },
    }), [props.labels.instructions]);
    const plugins = useCallback((defaults) => [...defaults.filter(plugin => plugin !== Accessibility), accessibility], 
    // A fresh function every render made the provider reassign manager.plugins on each render (2026-09-30 review).
    [accessibility]);
    const list = useRef(null);
    // Moving a row re-parents its DOM node, and an edge move disables the pressed button: both dropped focus to
    // <body> after a keyboard reorder. Refocus the moved row once the host has accepted the new order.
    const refocus = useRef(null);
    const snapshot = useRef("");
    const signature = JSON.stringify(props.items);
    useLayoutEffect(() => {
        const pending = refocus.current;
        if (!pending)
            return;
        const row = list.current?.querySelector(`[data-item-id="${CSS.escape(pending.id)}"]`);
        if (!row)
            return;
        refocus.current = null;
        const [handle, previous, next] = [...row.querySelectorAll("button")];
        const preferred = pending.direction === "previous" ? previous : next;
        const fallback = pending.direction === "previous" ? next : previous;
        (preferred && !preferred.disabled ? preferred : fallback && !fallback.disabled ? fallback : handle)?.focus();
        // Announce only once the controlled order reflects the move, never a proposed position.
        const index = props.items.findIndex(item => item.id === pending.id);
        if (index >= 0)
            setAnnouncement(props.labels.position(props.items[index], index + 1, props.items.length));
    }, [signature]); // eslint-disable-line react-hooks/exhaustive-deps
    const commit = (id, to, source) => {
        if (props.disabled)
            return;
        const intent = reorderIntent(props.items, id, to, source);
        if (!intent) {
            // A rejected drag (fixed row in range, same index) must still end the host's drag session.
            if (source === "drag")
                props.onCancel?.();
            return;
        }
        if (source === "keyboard")
            refocus.current = { id, direction: intent.toIndex < intent.fromIndex ? "previous" : "next" };
        else
            refocus.current = { id, direction: "next" };
        props.onCommit(intent);
    };
    return _jsxs(DragDropProvider, { plugins: plugins, onDragStart: () => { snapshot.current = signature; }, onDragEnd: event => {
            if (event.canceled || snapshot.current !== signature) {
                props.onCancel?.();
                return;
            }
            const source = event.operation.source;
            if (source && isSortable(source))
                commit(String(source.id), source.index, "drag");
        }, children: [_jsx("ul", { ref: list, "aria-label": props.label, style: { listStyle: "none", margin: 0, padding: 0, ...props.layoutStyle }, children: props.items.map((item, index) => _jsx(Row, { item: item, index: index, count: props.items.length, disabled: props.disabled ?? false, reduced: environment.reducedMotion, labels: props.labels, move: to => commit(item.id, to, "keyboard"), children: props.renderItem(item) }, item.id)) }), _jsx("span", { role: "status", style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }, children: announcement })] });
}
//# sourceMappingURL=sortable.js.map