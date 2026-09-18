import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getTreeArrowKeyIntent, getTreeArrowResult, getVisibleTreeNavigationTarget, getVisibleTreeTypeaheadMatch, reconcileTreeExpansion, resolveTreeDescriptor, treeRecipe, } from "@hjmds/design-contracts/components/tree";
import { forwardRef, useMemo, useRef, useState, } from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
const typeaheadResetMs = 500;
function selectedIds(selection) {
    if (!selection || selection.mode === "none")
        return new Set();
    if (selection.mode === "single") {
        const key = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
        return key === null ? new Set() : new Set([key]);
    }
    return selection.selectedKeys ?? selection.defaultSelectedKeys ?? new Set();
}
export const Tree = forwardRef(function Tree({ label, nodes, composeAccessibleName, expandedKeys: controlledExpanded, defaultExpandedKeys, onExpandedKeysChange, selection, checkedStates, onCheckedToggle, asyncState = { status: "idle" }, renderToggle, className, }, forwardedRef) {
    const [expandedKeys, setExpandedKeys] = useControllableState({
        ...(controlledExpanded === undefined ? {} : { value: controlledExpanded }),
        defaultValue: defaultExpandedKeys ?? new Set(),
        ...(onExpandedKeysChange === undefined ? {} : { onChange: onExpandedKeysChange }),
    });
    const direction = useOptionalHjmTheme()?.environment.direction ?? "ltr";
    // Expansion keys survive a node list change only where the node still exists
    // and can still hold children; the contract owns that reconciliation.
    const liveExpanded = useMemo(() => reconcileTreeExpansion(nodes, expandedKeys), [nodes, expandedKeys]);
    const resolved = useMemo(() => resolveTreeDescriptor(nodes, liveExpanded, { composeAccessibleName }), [nodes, liveExpanded, composeAccessibleName]);
    const visible = useMemo(() => resolved.filter((node) => node.visible), [resolved]);
    const selected = selectedIds(selection);
    const [focusedId, setFocusedId] = useState(null);
    // Roving tab stop: one node is tabbable, and it must stay a real visible node
    // after a collapse removed the previously focused descendant.
    const activeId = visible.some((node) => node.id === focusedId) ? focusedId : visible[0]?.id ?? null;
    const rootRef = useRef(null);
    const typeahead = useRef({ query: "", at: 0 });
    const focusNode = (id) => {
        setFocusedId(id);
        rootRef.current?.querySelector(`[data-hjm-tree-node="${CSS.escape(id)}"]`)?.focus();
    };
    const setExpanded = (id, expanded) => {
        const next = new Set(liveExpanded);
        if (expanded)
            next.add(id);
        else
            next.delete(id);
        setExpandedKeys(next);
    };
    const toggleSelection = (node) => {
        if (node.disabled || !selection || selection.mode === "none")
            return;
        if (selection.mode === "single") {
            const current = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
            const next = current === node.id && selection.disallowEmptySelection !== true ? null : node.id;
            selection.onSelectionChange?.(next);
            return;
        }
        const next = new Set(selection.selectedKeys ?? selection.defaultSelectedKeys ?? []);
        if (next.has(node.id))
            next.delete(node.id);
        else
            next.add(node.id);
        selection.onSelectionChange?.(next);
    };
    const onKeyDown = (event, node) => {
        const key = event.key;
        const arrow = getTreeArrowKeyIntent(key, direction);
        if (arrow) {
            const result = getTreeArrowResult(visible, node.id, arrow);
            if (result.action === "none")
                return;
            event.preventDefault();
            if (result.action === "moveFocus")
                focusNode(result.targetId);
            else
                setExpanded(node.id, result.action === "expand");
            return;
        }
        if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
            const intent = key === "ArrowDown" ? "next" : key === "ArrowUp" ? "previous" : key === "Home" ? "first" : "last";
            const target = getVisibleTreeNavigationTarget(visible, node.id, intent);
            if (target === undefined)
                return;
            event.preventDefault();
            focusNode(target);
            return;
        }
        if (key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (checkedStates && onCheckedToggle) {
                if (!node.disabled)
                    onCheckedToggle(node.id);
            }
            else
                toggleSelection(node);
            return;
        }
        if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey)
            return;
        const now = Date.now();
        const query = now - typeahead.current.at > typeaheadResetMs ? event.key : typeahead.current.query + event.key;
        typeahead.current = { query, at: now };
        const match = getVisibleTreeTypeaheadMatch(visible, query, { startsAfterKey: node.id });
        if (match !== undefined) {
            event.preventDefault();
            focusNode(match);
        }
    };
    return (_jsxs("div", { ref: composeRefs(rootRef, forwardedRef), role: "tree", "aria-label": label, "aria-busy": asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined, "aria-multiselectable": selection?.mode === "multiple" || undefined, className: classNames("hjm-tree", className), style: { "--hjm-tree-indent": `${treeRecipe.indentPerLevel}px` }, children: [asyncState.status === "empty" || asyncState.status === "error" || asyncState.status === "loading" ? (_jsx("p", { className: "hjm-tree__state", role: asyncState.status === "error" ? "alert" : "status", children: asyncState.message })) : null, visible.map((node) => (_jsxs("div", { role: "treeitem", "data-hjm-tree-node": node.id, "aria-level": node.depth, "aria-posinset": node.position, "aria-setsize": node.siblingCount, "aria-expanded": node.hasChildren ? node.expanded : undefined, "aria-selected": selection && selection.mode !== "none" ? selected.has(node.id) : undefined, "aria-checked": checkedStates ? (checkedStates.get(node.id) === "mixed" ? "mixed" : String(checkedStates.get(node.id) === true)) : undefined, "aria-disabled": node.disabled || undefined, "aria-label": node.accessibleName, 
                // One tab stop for the whole tree; the glyph is decorative, not a
                // nested control, so a node is the only focusable thing in a row.
                tabIndex: node.id === activeId ? 0 : -1, className: "hjm-tree__node", style: { "--hjm-tree-depth": node.depth - 1 }, onClick: () => {
                    setFocusedId(node.id);
                    if (checkedStates && onCheckedToggle) {
                        if (!node.disabled)
                            onCheckedToggle(node.id);
                    }
                    else
                        toggleSelection(node);
                }, onFocus: () => setFocusedId(node.id), onKeyDown: (event) => onKeyDown(event, node), children: [_jsx("span", { "aria-hidden": "true", className: "hjm-tree__indent" }), checkedStates ? (_jsx("span", { "aria-hidden": "true", className: "hjm-tree__check", "data-state": String(checkedStates.get(node.id) ?? false), children: checkedStates.get(node.id) === true ? "✓" : checkedStates.get(node.id) === "mixed" ? "–" : "" })) : null, _jsx("span", { "aria-hidden": "true", className: "hjm-tree__toggle", "data-visible": node.hasChildren || undefined, children: node.hasChildren ? renderToggle?.({ expanded: node.expanded }) ?? (node.expanded ? "▾" : "▸") : null }), _jsxs("span", { "aria-hidden": "true", className: "hjm-tree__label", children: [node.label, node.description ? _jsx("span", { className: "hjm-tree__description", children: node.description }) : null] })] }, node.id))), asyncState.status === "loadingMore" ? _jsx("p", { className: "hjm-tree__state", role: "status", children: asyncState.message }) : null] }));
});
//# sourceMappingURL=tree.js.map