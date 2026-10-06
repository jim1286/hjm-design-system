import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from "react";
import { nextReaction, validateReactions, resolveReactionOptions } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
/** Controlled single reaction; counts and persistence belong to the product. */
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more, layoutStyle }) {
    const [expanded, setExpanded] = useState(false);
    const root = useRef(null);
    const toggle = useRef(null);
    const refocus = useRef(false);
    const all = resolveReactionOptions(options, more);
    validateReactions(all, value);
    const showingAll = expanded && !!more;
    const visible = showingAll ? all : options;
    const choose = (id) => { if (!disabled) {
        refocus.current = !!root.current?.contains(document.activeElement);
        onValueChange(nextReaction(all, value, id));
        setExpanded(false);
    } };
    // A catalog-only button unmounts on collapse: refocus the toggle, not <body>. Inert hosts restore their own trigger.
    useLayoutEffect(() => { const node = root.current; if (refocus.current && !showingAll && node && !node.closest("[inert]") && !node.contains(document.activeElement))
        toggle.current?.focus(); refocus.current = false; });
    return _jsxs("div", { ref: root, role: "group", "aria-label": label, className: "hjm-reaction-picker", "data-layout": layout, "data-expanded": showingAll || undefined, style: layoutStyle, children: [_jsx("div", { className: "hjm-reaction-picker__options", children: visible.map(option => _jsx(Button, { tone: "ghost", shape: "pill", selected: value === option.id, disabled: disabled || option.disabled, "aria-label": option.label, onClick: () => choose(option.id), children: _jsxs("span", { "aria-hidden": "true", className: "hjm-reaction-picker__glyph", children: [option.emoji, option.count === undefined ? null : ` ${option.count}`] }) }, option.id)) }), _jsx("div", { children: more ? _jsx(Button, { ref: toggle, tone: "ghost", shape: "pill", "aria-label": more.label, "aria-expanded": showingAll, disabled: disabled, onClick: () => setExpanded(current => !current), children: _jsx("span", { "aria-hidden": "true", className: "hjm-reaction-picker__glyph", children: showingAll ? "−" : "+" }) }) : null })] });
}
//# sourceMappingURL=reaction-picker.js.map