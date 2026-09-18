import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { moveTransferListSelection, reconcileTransferListSelection, resolveTransferListFocusAfterMove, resolveTransferListPanels, resolveTransferListSelectAllState, toggleTransferListSelectAll, toggleTransferListSelection, } from "@hjmds/design-contracts/components/transfer-list";
import { forwardRef, useMemo, useRef, useState, } from "react";
import { Button } from "./actions.js";
import { classNames, composeRefs, useControllableState } from "./internal.js";
const emptySelection = () => ({
    source: new Set(),
    target: new Set(),
});
export const TransferList = forwardRef(function TransferList({ items, labels, targetKeys: controlledTargetKeys, defaultTargetKeys, onTargetKeysChange, onMove, className, }, forwardedRef) {
    const [targetKeys, setTargetKeys] = useControllableState({
        ...(controlledTargetKeys === undefined ? {} : { value: controlledTargetKeys }),
        defaultValue: defaultTargetKeys ?? new Set(),
        ...(onTargetKeysChange === undefined ? {} : { onChange: onTargetKeysChange }),
    });
    const [rawSelection, setSelection] = useState((emptySelection));
    const descriptor = useMemo(() => ({ items, targetKeys }), [items, targetKeys]);
    // A row that left the list entirely must not keep a pending check mark.
    const selection = useMemo(() => reconcileTransferListSelection(descriptor, rawSelection), [descriptor, rawSelection]);
    const panels = resolveTransferListPanels(descriptor);
    const rootRef = useRef(null);
    const [focused, setFocused] = useState({ source: null, target: null });
    const focusRow = (panel, id) => {
        setFocused((previous) => ({ ...previous, [panel]: id }));
        if (id === null)
            return;
        rootRef.current?.querySelector(`[data-hjm-transfer-row="${panel}:${CSS.escape(id)}"]`)?.focus();
    };
    const move = (direction) => {
        const from = direction === "toTarget" ? "source" : "target";
        const before = panels[from];
        const result = moveTransferListSelection(descriptor, selection, direction);
        if (result.movedIds.length === 0)
            return;
        const removedIndex = before.findIndex((item) => item.id === result.movedIds[0]);
        const remaining = before.filter((item) => !result.movedIds.includes(item.id));
        setTargetKeys(result.targetKeys);
        setSelection(result.selection);
        onMove?.(result.movedIds, direction);
        // Focus lands on the row that slid into the first removed position, or on
        // the panel's empty state — never on the document body.
        const next = resolveTransferListFocusAfterMove(remaining, removedIndex);
        queueMicrotask(() => {
            if (next !== null)
                focusRow(from, next);
            else
                rootRef.current?.querySelector(`[data-hjm-transfer-empty="${from}"]`)?.focus();
        });
    };
    const moveSingle = (panel, id) => {
        // A focused row moves on its own: a single move must not require first
        // building a multi-selection.
        const single = { ...emptySelection(), [panel]: new Set([id]) };
        const direction = panel === "source" ? "toTarget" : "toSource";
        const result = moveTransferListSelection(descriptor, single, direction);
        if (result.movedIds.length === 0)
            return;
        const before = panels[panel];
        const removedIndex = before.findIndex((item) => item.id === id);
        const remaining = before.filter((item) => item.id !== id);
        setTargetKeys(result.targetKeys);
        setSelection((current) => ({ ...current, [panel]: new Set([...current[panel]].filter((key) => key !== id)) }));
        onMove?.(result.movedIds, direction);
        const next = resolveTransferListFocusAfterMove(remaining, removedIndex);
        queueMicrotask(() => {
            if (next !== null)
                focusRow(panel, next);
            else
                rootRef.current?.querySelector(`[data-hjm-transfer-empty="${panel}"]`)?.focus();
        });
    };
    const renderPanel = (panel) => {
        const panelItems = panels[panel];
        const selected = selection[panel];
        const selectAllState = resolveTransferListSelectAllState(descriptor, selection, panel);
        const activeId = panelItems.some((item) => item.id === focused[panel])
            ? focused[panel]
            : panelItems.find((item) => !item.disabled)?.id ?? panelItems[0]?.id ?? null;
        const onKeyDown = (event, item) => {
            const index = panelItems.findIndex((candidate) => candidate.id === item.id);
            const goto = (nextIndex) => {
                const target = panelItems[Math.min(Math.max(nextIndex, 0), panelItems.length - 1)];
                if (target) {
                    event.preventDefault();
                    focusRow(panel, target.id);
                }
            };
            if (event.key === "ArrowDown")
                goto(index + 1);
            else if (event.key === "ArrowUp")
                goto(index - 1);
            else if (event.key === "Home")
                goto(0);
            else if (event.key === "End")
                goto(panelItems.length - 1);
            else if (event.key === " ") {
                event.preventDefault();
                setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id));
            }
            else if (event.key === "Enter") {
                event.preventDefault();
                moveSingle(panel, item.id);
            }
        };
        return (_jsxs("div", { className: "hjm-transfer-list__panel", role: "group", "aria-label": labels[panel], children: [_jsxs("div", { className: "hjm-transfer-list__header", children: [_jsx("span", { className: "hjm-transfer-list__title", children: labels[panel] }), _jsx("button", { type: "button", role: "checkbox", "aria-checked": selectAllState === "mixed" ? "mixed" : String(selectAllState === true), "aria-label": `${labels[panel]} ${labels.selectAll}`, className: "hjm-transfer-list__select-all", onClick: () => setSelection(toggleTransferListSelectAll(descriptor, selection, panel)), children: selectAllState === true ? "✓" : selectAllState === "mixed" ? "–" : "" })] }), panelItems.length === 0 ? (_jsx("p", { className: "hjm-transfer-list__empty", "data-hjm-transfer-empty": panel, tabIndex: -1, children: labels.empty })) : (_jsx("div", { role: "listbox", "aria-multiselectable": "true", "aria-label": labels[panel], className: "hjm-transfer-list__options", children: panelItems.map((item) => (_jsxs("div", { role: "option", "data-hjm-transfer-row": `${panel}:${item.id}`, "aria-selected": selected.has(item.id), "aria-disabled": item.disabled || undefined, tabIndex: item.id === activeId ? 0 : -1, className: "hjm-transfer-list__option", onFocus: () => setFocused((previous) => ({ ...previous, [panel]: item.id })), onClick: () => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id)), onKeyDown: (event) => onKeyDown(event, item), children: [_jsx("span", { "aria-hidden": "true", className: "hjm-transfer-list__mark", "data-checked": selected.has(item.id) || undefined, children: selected.has(item.id) ? "✓" : "" }), _jsx("span", { children: item.label })] }, item.id))) }))] }));
    };
    return (_jsxs("div", { ref: composeRefs(rootRef, forwardedRef), className: classNames("hjm-transfer-list", className), children: [renderPanel("source"), _jsxs("div", { className: "hjm-transfer-list__actions", children: [_jsx(Button, { tone: "secondary", disabled: selection.source.size === 0, onClick: () => move("toTarget"), children: labels.toTarget }), _jsx(Button, { tone: "secondary", disabled: selection.target.size === 0, onClick: () => move("toSource"), children: labels.toSource })] }), renderPanel("target")] }));
});
//# sourceMappingURL=transfer-list.js.map