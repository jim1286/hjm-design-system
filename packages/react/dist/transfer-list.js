import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { moveTransferListSelection, reconcileTransferListSelection, resolveTransferListFocusAfterMove, resolveTransferListPanels, resolveTransferListSelectAllState, toggleTransferListSelectAll, toggleTransferListSelection, validateTransferListDescriptor, } from "@hjmds/design-contracts/components/transfer-list";
import { reconcileCheckboxSelection } from "@hjmds/design-contracts/behaviors";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { Button } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { classNames, composeRefs, useControllableState } from "./internal.js";
const emptySelection = () => ({
    source: new Set(),
    target: new Set(),
});
// Rows are multi-select: Checkbox's indicator, not a 16px rounded box that read as a radio.
function SelectionMark({ state }) {
    return _jsx("span", { "aria-hidden": "true", className: "hjm-choice__indicator", "data-kind": "checkbox", "data-state": state === "mixed" ? "mixed" : state ? "checked" : "unchecked" });
}
// The panels sit side by side or stack depending on width (CSS), so both directions are drawn and CSS shows the one
// that points at the destination panel; products no longer bake "→" into the label.
function MoveIcon({ inline, stacked }) {
    return _jsxs(_Fragment, { children: [_jsx(Icon, { name: inline, size: "sm", className: "hjm-transfer-list__move-icon", "data-orientation": "inline" }), _jsx(Icon, { name: stacked, size: "sm", className: "hjm-transfer-list__move-icon", "data-orientation": "stacked" })] });
}
export const TransferList = forwardRef(function TransferList({ items, labels, targetKeys: controlledTargetKeys, defaultTargetKeys, onTargetKeysChange, onMove, className, layoutStyle, }, forwardedRef) {
    const [storedTargetKeys, setTargetKeys] = useControllableState({
        ...(controlledTargetKeys === undefined ? {} : { value: controlledTargetKeys }),
        defaultValue: defaultTargetKeys ?? new Set(),
        ...(onTargetKeysChange === undefined ? {} : { onChange: onTargetKeysChange }),
    });
    const validatedInitialTargets = useRef(false);
    if (!validatedInitialTargets.current) {
        validateTransferListDescriptor({ items, targetKeys: storedTargetKeys });
        validatedInitialTargets.current = true;
    }
    const targetKeys = useMemo(() => controlledTargetKeys === undefined
        ? reconcileCheckboxSelection(items, storedTargetKeys) : storedTargetKeys, [controlledTargetKeys, items, storedTargetKeys]);
    useEffect(() => {
        if (controlledTargetKeys === undefined && targetKeys !== storedTargetKeys)
            setTargetKeys(targetKeys);
    }, [controlledTargetKeys, setTargetKeys, storedTargetKeys, targetKeys]);
    const [rawSelection, setSelection] = useState((emptySelection));
    const descriptor = useMemo(() => ({ items, targetKeys }), [items, targetKeys]);
    // A row that left the list entirely must not keep a pending check mark.
    const selection = useMemo(() => reconcileTransferListSelection(descriptor, rawSelection), [descriptor, rawSelection]);
    useEffect(() => {
        if (selection !== rawSelection)
            setSelection(selection);
    }, [rawSelection, selection]);
    const panels = resolveTransferListPanels(descriptor);
    const canMove = (panel) => panels[panel].some(item => !item.disabled && selection[panel].has(item.id));
    const rootRef = useRef(null);
    const [focused, setFocused] = useState({ source: null, target: null });
    const focusWithin = useRef(false);
    const focusedPanel = useRef(null);
    const previousPanels = useRef(panels);
    useLayoutEffect(() => {
        const before = previousPanels.current;
        previousPanels.current = panels;
        const panel = focusedPanel.current;
        if (!focusWithin.current || panel === null || document.activeElement !== document.body)
            return;
        const id = focused[panel];
        if (id === null || panels[panel].some(item => item.id === id))
            return;
        // External removals bypass the move handler, but must not drop row focus onto body.
        const next = resolveTransferListFocusAfterMove(panels[panel], before[panel].findIndex(item => item.id === id));
        if (next !== null)
            focusRow(panel, next);
        else
            rootRef.current?.querySelector(`[data-hjm-transfer-empty="${panel}"]`)?.focus();
    }, [focused, panels]);
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
        // Controlled owners may refuse or defer the move; keep checks until the rows actually leave.
        if (controlledTargetKeys === undefined)
            setSelection(result.selection);
        onMove?.(result.movedIds, direction);
        // Focus lands on the row that slid into the first removed position, or on
        // the panel's empty state — never on the document body.
        const next = resolveTransferListFocusAfterMove(remaining, removedIndex);
        queueMicrotask(() => {
            if (result.movedIds.some(id => rootRef.current?.querySelector(`[data-hjm-transfer-row="${from}:${CSS.escape(id)}"]`)))
                return;
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
        if (controlledTargetKeys === undefined) {
            setSelection((current) => ({ ...current, [panel]: new Set([...current[panel]].filter((key) => key !== id)) }));
        }
        onMove?.(result.movedIds, direction);
        const next = resolveTransferListFocusAfterMove(remaining, removedIndex);
        queueMicrotask(() => {
            if (rootRef.current?.querySelector(`[data-hjm-transfer-row="${panel}:${CSS.escape(id)}"]`))
                return;
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
        return (_jsxs("div", { className: "hjm-transfer-list__panel", role: "group", "aria-label": labels[panel], children: [_jsxs("div", { className: "hjm-transfer-list__header", children: [_jsx("span", { className: "hjm-transfer-list__title", children: labels[panel] }), _jsx("button", { type: "button", role: "checkbox", "aria-checked": selectAllState === "mixed" ? "mixed" : String(selectAllState === true), "aria-label": `${labels[panel]} ${labels.selectAll}`, className: "hjm-transfer-list__select-all", disabled: !panelItems.some(item => !item.disabled), onClick: () => setSelection(toggleTransferListSelectAll(descriptor, selection, panel)), children: _jsx(SelectionMark, { state: selectAllState }) })] }), panelItems.length === 0 ? (_jsx("p", { className: "hjm-transfer-list__empty", "data-hjm-transfer-empty": panel, tabIndex: -1, children: labels.empty })) : (_jsx("div", { role: "listbox", "aria-multiselectable": "true", "aria-label": labels[panel], className: "hjm-transfer-list__options", children: panelItems.map((item) => (_jsxs("div", { role: "option", "data-hjm-transfer-row": `${panel}:${item.id}`, "aria-selected": selected.has(item.id), "aria-disabled": item.disabled || undefined, tabIndex: item.id === activeId ? 0 : -1, className: "hjm-transfer-list__option", onFocus: () => { focusedPanel.current = panel; setFocused((previous) => ({ ...previous, [panel]: item.id })); }, onClick: () => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id)), onKeyDown: (event) => onKeyDown(event, item), children: [_jsx(SelectionMark, { state: selected.has(item.id) }), _jsx("span", { children: item.label })] }, item.id))) }))] }));
    };
    return (_jsxs("div", { ref: composeRefs(rootRef, forwardedRef), style: layoutStyle, className: classNames("hjm-transfer-list", className), onFocusCapture: () => { focusWithin.current = true; }, onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget))
            focusWithin.current = false; }, children: [renderPanel("source"), _jsxs("div", { className: "hjm-transfer-list__actions", children: [_jsx(Button, { tone: "secondary", disabled: !canMove("source"), onClick: () => move("toTarget"), leading: _jsx(MoveIcon, { inline: "chevronEnd", stacked: "chevronDown" }), children: labels.toTarget }), _jsx(Button, { tone: "secondary", disabled: !canMove("target"), onClick: () => move("toSource"), leading: _jsx(MoveIcon, { inline: "chevronStart", stacked: "chevronUp" }), children: labels.toSource })] }), renderPanel("target")] }));
});
//# sourceMappingURL=transfer-list.js.map