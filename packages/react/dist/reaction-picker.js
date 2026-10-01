import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { nextReaction, validateReactions } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
/** Controlled single reaction; counts and persistence belong to the product. */
export function ReactionPicker({ label, options, value, onValueChange, disabled = false }) {
    validateReactions(options, value);
    return _jsx("div", { role: "group", "aria-label": label, style: { display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-xs)" }, children: options.map(option => _jsx(Button, { tone: "ghost", shape: "pill", selected: value === option.id, disabled: disabled || option.disabled, "aria-label": option.label, onClick: () => onValueChange(nextReaction(options, value, option.id)), children: _jsxs("span", { "aria-hidden": "true", children: [option.emoji, option.count === undefined ? null : ` ${option.count}`] }) }, option.id)) });
}
//# sourceMappingURL=reaction-picker.js.map