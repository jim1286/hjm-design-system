import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { validateTasks } from '@hjmds/design-contracts/task-list';
import { Checkbox } from './selection.js';
import { List } from './advanced-display.js';
/** Canonical Checkbox/List own semantics; optional collection composition keeps drag peers out of this entry. */
export function TaskList({ label, items, onCompletedChange, disabled = false, emptyContent, renderItemAction, renderCollection, layoutStyle }) {
    validateTasks(items);
    if (!label.trim())
        throw new TypeError('TaskList needs a localized label');
    const renderItem = (item) => {
        const control = _jsx(Checkbox, { label: item.label, checked: item.completed, disabled: disabled || item.disabled === true, onCheckedChange: completed => onCompletedChange(item.id, completed), ...(item.description === undefined ? {} : { description: item.description }) });
        const action = renderItemAction?.({ item, disabled: disabled || item.disabled === true });
        // The action sits beside Checkbox, never inside its label (pressing it must not toggle completion); long labels wrap
        // inside the checkbox column. A separate action line made each task two to three lines tall (2026-10-17 review).
        return _jsxs("div", { style: { display: "grid", gridTemplateColumns: action == null ? "minmax(0, 1fr)" : "minmax(0, 1fr) auto", alignItems: "center", gap: "var(--hjm-space-sm)" }, children: [control, action] });
    };
    if (items.length === 0)
        return _jsx(List, { label: label, ...(layoutStyle === undefined ? {} : { layoutStyle }), children: emptyContent });
    if (renderCollection)
        return _jsx(_Fragment, { children: renderCollection({ items, renderItem }) });
    return _jsx(List, { label: label, appearance: "grouped", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: items.map(item => _jsx("div", { style: { padding: "var(--hjm-space-md)" }, children: renderItem(item) }, item.id)) });
}
//# sourceMappingURL=task-list.js.map