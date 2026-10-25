import { jsx as _jsx } from "react/jsx-runtime";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
// Interactive identity marks reserve the standard control target; navigation stays outside bubble gestures.
export function IdentityAction({ action, children, layoutStyle }) {
    if (!action.label.trim())
        throw new TypeError("Member profile action requires a localized label");
    return _jsx("button", { type: "button", className: "hjm-identity-action", style: { ...layoutStyle, minInlineSize: iconButtonRecipe.sizes.medium.diameter, minBlockSize: iconButtonRecipe.sizes.medium.diameter, opacity: action.disabled ? iconButtonRecipe.states.disabledOpacity : undefined, "--hjm-identity-pressed-opacity": iconButtonRecipe.states.pressedOpacity, "--hjm-identity-target": `${iconButtonRecipe.sizes.medium.diameter}px` }, disabled: action.disabled, "aria-label": action.label, title: action.label, onClick: event => { event.stopPropagation(); if (!action.disabled)
            action.onPress(); }, children: _jsx("span", { "aria-hidden": "true", children: children }) });
}
//# sourceMappingURL=identity-action.js.map