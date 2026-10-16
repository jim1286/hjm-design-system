import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { Text } from "../layout.js";
import { Popover } from "../popover.js";
import { ReactionPicker } from "../reaction-picker.js";
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export function MessageReactions({ children, closeLabel, menuAction, interactiveContent = false, triggerClassName = "hjm-chat-message__bubble", replyAction, menuTitle, menuActions = [], reportAction, ...picker }) {
    // Reply leads and report trails; legacy single menuAction keeps its place before report.
    const rows = [
        ...(replyAction ? [{ id: "reply", ...replyAction }] : []),
        ...menuActions,
        ...(menuAction ? [{ id: "menu", ...menuAction }] : []),
        ...(reportAction ? [{ id: "report", ...reportAction, danger: true }] : []),
    ];
    const [open, setOpen] = useState(false);
    const press = useRef(null);
    const held = useRef(false);
    const cancel = () => { if (press.current)
        clearTimeout(press.current.timer); press.current = null; };
    useEffect(() => () => { if (press.current)
        clearTimeout(press.current.timer); }, []);
    useEffect(() => { if (picker.disabled) {
        cancel();
        setOpen(false);
    } }, [picker.disabled]);
    return _jsxs(Popover, { open: open && !picker.disabled, onOpenChange: (next) => { if (!next)
            setOpen(false); }, title: picker.label, closeLabel: closeLabel, descriptor: { placement: "top", align: "start" }, className: "hjm-message-reactions", trigger: _jsx("div", { className: triggerClassName, tabIndex: picker.disabled ? -1 : 0, role: interactiveContent ? "group" : "button", "aria-label": picker.label, "aria-disabled": picker.disabled, onContextMenu: event => { event.preventDefault(); cancel(); if (!picker.disabled)
                setOpen(true); }, 
            // Only the bubble itself opens reactions: with interactiveContent, Enter/Space on a nested
            // link or button must keep its native activation instead of being swallowed here.
            onKeyDown: event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ") && !picker.disabled) {
                event.preventDefault();
                setOpen(true);
            } }, onPointerDown: event => {
                if (picker.disabled || event.button !== 0 || event.target.closest("button,a,input,textarea"))
                    return;
                cancel();
                held.current = false;
                const { clientX: x, clientY: y } = event;
                press.current = { x, y, timer: setTimeout(() => { held.current = true; press.current = null; setOpen(true); }, screenPatternRecipe.reactionHoldMs) };
            }, onPointerMove: event => { const start = press.current; if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > screenPatternRecipe.reactionMoveTolerance)
                cancel(); }, onPointerCancel: cancel, onPointerLeave: cancel, onPointerUp: cancel, onClickCapture: event => { if (held.current) {
                event.preventDefault();
                event.stopPropagation();
                held.current = false;
            } }, children: children }), children: [picker.options.length ? _jsx(ReactionPicker, { ...picker, layout: "strip", onValueChange: value => { picker.onValueChange(value); setOpen(false); } }) : null, menuTitle || rows.length ? _jsxs("div", { className: "hjm-message-menu", children: [menuTitle ? _jsx(Text, { variant: "caption", tone: "muted", className: "hjm-message-menu__title", children: menuTitle }) : null, rows.map(row => _jsxs("button", { type: "button", className: "hjm-message-menu__item", "data-tone": row.danger ? "danger" : undefined, disabled: row.disabled, onClick: () => { setOpen(false); row.onPress(); }, children: [row.icon ? _jsx("span", { className: "hjm-message-menu__icon", "aria-hidden": "true", children: row.icon }) : null, row.label] }, row.id))] }) : null] });
}
//# sourceMappingURL=message-reactions.js.map