import { jsx as _jsx } from "react/jsx-runtime";
import { Pressable, Text, View } from "react-native";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
// Interactive identity marks reserve the standard control target; the image keeps its own size.
export function IdentityAction({ action, children, layoutStyle }) {
    if (!action.label.trim())
        throw new TypeError("Member profile action requires a localized label");
    return _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: action.label, accessibilityState: { disabled: action.disabled === true }, disabled: action.disabled, onPress: event => { event.stopPropagation(); if (!action.disabled)
            action.onPress(); }, style: ({ pressed }) => [layoutStyle, { minWidth: iconButtonRecipe.sizes.medium.diameter, minHeight: iconButtonRecipe.sizes.medium.diameter, alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: action.disabled ? iconButtonRecipe.states.disabledOpacity : pressed ? iconButtonRecipe.states.pressedOpacity : 1 }], children: _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: children }) });
}
/**
 * The member's name as the same profile action as their picture (2026-10-25 avatar rule extended to names on
 * 2026-10-29: Spint users tapped the nickname and nothing happened). A nested Text press keeps the name inline,
 * including the `bodyText` sentence where the name opens the comment.
 */
export function IdentityNameAction({ action, children }) {
    if (!action.label.trim())
        throw new TypeError("Member profile action requires a localized label");
    return _jsx(Text, { accessibilityRole: "button", accessibilityLabel: action.label, accessibilityState: { disabled: action.disabled === true }, suppressHighlighting: true, ...(action.disabled ? {} : { onPress: (event) => { event.stopPropagation(); action.onPress(); } }), children: children });
}
//# sourceMappingURL=identity-action.js.map