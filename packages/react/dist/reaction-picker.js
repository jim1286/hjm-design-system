import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { nextReaction, validateReactions, resolveReactionOptions } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
/** Controlled single reaction; counts and persistence belong to the product. */
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more }) {
    const [expanded, setExpanded] = useState(false);
    const all = resolveReactionOptions(options, more);
    validateReactions(all, value);
    const showingAll = expanded && !!more;
    const visible = showingAll ? all : options;
    const choose = (id) => { if (!disabled) {
        onValueChange(nextReaction(all, value, id));
        setExpanded(false);
    } };
    return _jsxs("div", { "data-expanded": showingAll || undefined, style: { display: "flex", flexDirection: showingAll ? "column" : "row", minWidth: 0 }, children: [_jsx("div", { role: "group", "aria-label": label, style: { display: "flex", minWidth: 0, flex: 1, flexWrap: showingAll || layout === "wrap" ? "wrap" : "nowrap", overflowX: showingAll ? undefined : "auto", overflowY: showingAll ? "auto" : undefined, maxHeight: showingAll ? "15rem" : undefined, width: showingAll ? "min(20rem, 100%)" : undefined, gap: "var(--hjm-space-xs)" }, children: visible.map(option => _jsx(Button, { tone: "ghost", shape: "pill", selected: value === option.id, disabled: disabled || option.disabled, "aria-label": option.label, onClick: () => choose(option.id), children: _jsxs("span", { "aria-hidden": "true", style: { fontSize: "1.5em" }, children: [option.emoji, option.count === undefined ? null : ` ${option.count}`] }) }, option.id)) }), _jsx("div", { style: { flexShrink: 0 }, children: more ? _jsx(Button, { tone: "ghost", shape: "pill", "aria-label": more.label, "aria-expanded": showingAll, disabled: disabled, onClick: () => setExpanded(current => !current), children: _jsx("span", { "aria-hidden": "true", style: { fontSize: "1.5em" }, children: showingAll ? "−" : "+" }) }) : null })] });
}
//# sourceMappingURL=reaction-picker.js.map