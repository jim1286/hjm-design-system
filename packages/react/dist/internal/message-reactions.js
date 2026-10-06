import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { Button } from "../actions.js";
import { Popover } from "../popover.js";
import { ReactionPicker } from "../reaction-picker.js";
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export function MessageReactions({ children, closeLabel, menuAction, interactiveContent = false, ...picker }) {
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
            setOpen(false); }, title: picker.label, closeLabel: closeLabel, descriptor: { placement: "top", align: "start" }, className: "hjm-message-reactions", trigger: _jsx("div", { className: "hjm-chat-message__bubble", tabIndex: picker.disabled ? -1 : 0, role: interactiveContent ? "group" : "button", "aria-label": picker.label, "aria-disabled": picker.disabled, onContextMenu: event => { event.preventDefault(); cancel(); if (!picker.disabled)
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
            } }, children: children }), children: [_jsx(ReactionPicker, { ...picker, layout: "strip", onValueChange: value => { picker.onValueChange(value); setOpen(false); } }), menuAction ? _jsx(Button, { tone: "ghost", disabled: menuAction.disabled, onClick: () => { setOpen(false); menuAction.onPress(); }, children: menuAction.label }) : null] });
}
//# sourceMappingURL=message-reactions.js.map