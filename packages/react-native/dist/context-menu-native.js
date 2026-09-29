import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as ContextMenu from "zeego/context-menu";
/** OS-owned long-press actions; the default Menu remains free of native modules. */
export function NativeContextMenu({ children, items, onAction, onOpenChange }) {
    if (!items.length || new Set(items.map(item => item.id)).size !== items.length ||
        items.some(item => !item.id.trim() || !item.label.trim()))
        throw new TypeError("NativeContextMenu needs unique, named items");
    return _jsxs(ContextMenu.Root, { ...(onOpenChange ? { onOpenChange } : {}), children: [_jsx(ContextMenu.Trigger, { asChild: true, children: children }), _jsx(ContextMenu.Content, { children: items.map(item => _jsx(ContextMenu.Item, { textValue: item.label, disabled: item.disabled ?? false, destructive: item.tone === "danger", onSelect: () => { if (!item.disabled)
                        onAction(item.id); }, children: _jsx(ContextMenu.ItemTitle, { children: item.label }) }, item.id)) })] });
}
//# sourceMappingURL=context-menu-native.js.map