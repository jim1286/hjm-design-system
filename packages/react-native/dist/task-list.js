import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { validateTasks } from '@hjmds/design-contracts/task-list';
import { Checkbox } from './inputs.js';
import { List } from './data-display.js';
import { View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
/** Canonical Checkbox/List own semantics; optional collection composition keeps drag peers out of this entry. */
export function TaskList({ label, items, onCompletedChange, disabled = false, emptyContent, renderCollection }) {
    validateTasks(items);
    if (!label.trim())
        throw new TypeError('TaskList needs a localized label');
    const renderItem = (item) => { const control = _jsx(Checkbox, { label: item.label, checked: item.completed, disabled: disabled || item.disabled === true, onCheckedChange: completed => onCompletedChange(item.id, completed), ...(item.description === undefined ? {} : { description: item.description }) }); return _jsx(View, { style: { padding: spacing.md }, children: control }); };
    if (items.length === 0)
        return _jsx(List, { label: label, children: emptyContent });
    if (renderCollection)
        return _jsx(_Fragment, { children: renderCollection({ items, renderItem }) });
    return _jsx(List, { label: label, appearance: "grouped", children: items.map(item => _jsx(View, { children: renderItem(item) }, item.id)) });
}
//# sourceMappingURL=task-list.js.map