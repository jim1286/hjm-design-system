import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu as Bloom } from "bloom-menu";
import { useEffect, useRef, useState } from "react";
import { Menu } from "./overlays.js";
import { useHjmTheme } from "./provider.js";
/** Action-only morph presentation. Selection/async menus retain the full Menu. */
export function MorphingMenu({ label, items, onAction, disabled = false, open: controlled, onOpenChange }) {
    const theme = useHjmTheme();
    const [localOpen, setLocalOpen] = useState(false);
    const open = controlled ?? localOpen;
    const root = useRef(null);
    const previousOpen = useRef(false);
    const restoreFocus = useRef(true);
    const search = useRef({ text: "", time: 0 });
    const change = (value) => { if (value)
        restoreFocus.current = true; setLocalOpen(value); onOpenChange?.(value); };
    if (!label.trim() || !items.length || new Set(items.map(item => item.id)).size !== items.length ||
        items.some(item => !item.id.trim() || !(item.textValue ?? (typeof item.label === "string" ? item.label : "")).trim())) {
        throw new TypeError("MorphingMenu needs a label and unique, named items");
    }
    useEffect(() => {
        const host = root.current;
        if (open) {
            host?.querySelector('[role="menu"]')?.setAttribute("aria-label", label);
            host?.querySelector('[role="menuitem"]:not([disabled])')?.focus();
        }
        else if (previousOpen.current && restoreFocus.current && (host?.contains(document.activeElement) || document.activeElement === document.body))
            host?.querySelector('[role="button"]')?.focus();
        previousOpen.current = open;
    }, [open, label]);
    // The canonical Menu owns static/RTL behavior; Bloom's left/right geometry is physical.
    if (theme.environment.reducedMotion || theme.environment.direction === "rtl") {
        return _jsx(Menu, { label: label, trigger: _jsx("button", { type: "button", children: label }), items: items, disabled: disabled, open: open, onOpenChange: change, ...(onAction ? { onAction } : {}) });
    }
    const keyDown = (event) => {
        if (!open) {
            if (!disabled && ["ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
                change(true);
            }
            return;
        }
        const nodes = Array.from(root.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? []);
        const index = nodes.indexOf(document.activeElement);
        let next;
        if (event.key === "ArrowDown")
            next = (index + 1) % nodes.length;
        if (event.key === "ArrowUp")
            next = (index - 1 + nodes.length) % nodes.length;
        if (event.key === "Home")
            next = 0;
        if (event.key === "End")
            next = nodes.length - 1;
        if (event.key === "Escape" || event.key === "Tab") {
            if (event.key === "Tab")
                restoreFocus.current = false;
            change(false);
            if (event.key === "Escape")
                event.preventDefault();
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== " ") {
            const now = Date.now();
            search.current = { text: (now - search.current.time < 600 ? search.current.text : "") + event.key.toLocaleLowerCase(), time: now };
            next = nodes.findIndex(node => node.textContent?.trim().toLocaleLowerCase().startsWith(search.current.text));
        }
        if (next !== undefined && next >= 0) {
            event.preventDefault();
            event.stopPropagation();
            nodes[next]?.focus();
        }
    };
    return _jsx("div", { ref: root, className: "hjm-menu-morph", onKeyDownCapture: keyDown, children: _jsx(Bloom.Root, { direction: "bottom", open: open, onOpenChange: change, modal: false, children: _jsxs(Bloom.Container, { buttonSize: { width: 160, height: 44 }, menuWidth: 240, style: { background: theme.palette.theme.bg, color: theme.palette.theme.text }, children: [_jsx(Bloom.Trigger, { disabled: disabled, children: label }), _jsx(Bloom.Content, { children: items.map(item => _jsxs("button", { type: "button", role: "menuitem", tabIndex: -1, className: "hjm-menu-morph__item", disabled: !open || (item.disabled ?? false), "data-tone": item.tone, "aria-label": item.textValue, onClick: () => { if (!item.disabled) {
                                change(false);
                                item.onSelect?.();
                                onAction?.(item.id);
                            } }, children: [item.leading, item.label, item.trailing] }, item.id)) })] }) }) });
}
//# sourceMappingURL=menu-morph.js.map