import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { chatMessageRecipe, screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { Text } from "../layout.js";
import { Popover } from "../popover.js";
import { ReactionPicker } from "../reaction-picker.js";
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export function MessageReactions({ children, closeLabel, menuAction, interactiveContent = false, triggerClassName = "hjm-chat-message__bubble", replyAction, menuTitle, menuActions = [], reportAction, menuRef, ...picker }) {
    // Reply leads and report trails; legacy single menuAction keeps its place before report.
    const rows = [
        ...(replyAction ? [{ id: "reply", ...replyAction }] : []),
        ...menuActions,
        ...(menuAction ? [{ id: "menu", ...menuAction }] : []),
        ...(reportAction ? [{ id: "report", ...reportAction, tone: "danger" }] : []),
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
    useImperativeHandle(menuRef, () => ({ open: () => { if (!picker.disabled)
            setOpen(true); } }), [picker.disabled]);
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
            } }, children: children }), children: [picker.options.length ? _jsx(ReactionPicker, { ...picker, layout: "strip", onValueChange: value => { picker.onValueChange(value); setOpen(false); } }) : null, menuTitle || rows.length ? _jsxs("div", { className: "hjm-message-menu", children: [menuTitle ? _jsx(Text, { variant: "caption", tone: "muted", className: "hjm-message-menu__title", children: menuTitle }) : null, rows.map(row => _jsxs("button", { type: "button", className: "hjm-message-menu__item", "data-tone": row.tone === "danger" ? "danger" : undefined, disabled: row.disabled, onClick: () => { setOpen(false); row.onPress(); }, children: [row.icon ? _jsx("span", { className: "hjm-message-menu__icon", "aria-hidden": "true", children: row.icon }) : null, _jsx("span", { className: "hjm-message-menu__label", children: row.label }), row.submenu ? _jsx("span", { className: "hjm-message-menu__chevron", "aria-hidden": "true", children: "\u203A" }) : null] }, row.id))] }) : null] });
}
/** ChatMessage strips its summary before spreading the rest into the hold menu. */
export function omitReactionSummary({ summary: _summary, ...rest }) {
    return rest;
}
/**
 * Current reactions as one button beside the time; pressing it opens the hold menu (the press target and its name
 * are the whole pill, so per-emoji parts are hidden from assistive tech). The pill shows the brand border when the
 * reader's own reaction is among the items.
 */
export function ReactionSummaryButton({ label, items, selected, disabled, onPress }) {
    const r = chatMessageRecipe.reactionSummary;
    const mine = items.some(item => item.id === selected);
    return _jsx("button", { type: "button", className: "hjm-chat-message__reaction-summary", "aria-label": label, disabled: disabled, "data-selected": mine || undefined, onClick: onPress, style: { minBlockSize: r.minHeight, paddingInline: r.paddingInline, gap: r.itemGap }, children: items.map(item => _jsxs("span", { "aria-hidden": "true", style: { display: "inline-flex", alignItems: "center", gap: r.emojiGap }, children: [_jsx("span", { children: item.emoji }), item.showCount ? _jsx(Text, { as: "span", variant: "caption", children: item.count }) : null] }, item.id)) });
}
//# sourceMappingURL=message-reactions.js.map