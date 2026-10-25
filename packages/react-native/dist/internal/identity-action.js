import { jsx as _jsx } from "react/jsx-runtime";
import { Pressable, View } from "react-native";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
// Interactive identity marks reserve the standard control target; the image keeps its own size.
export function IdentityAction({ action, children, layoutStyle }) {
    if (!action.label.trim())
        throw new TypeError("Member profile action requires a localized label");
    return _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: action.label, accessibilityState: { disabled: action.disabled === true }, disabled: action.disabled, onPress: event => { event.stopPropagation(); if (!action.disabled)
            action.onPress(); }, style: ({ pressed }) => [layoutStyle, { minWidth: iconButtonRecipe.sizes.medium.diameter, minHeight: iconButtonRecipe.sizes.medium.diameter, alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: action.disabled ? iconButtonRecipe.states.disabledOpacity : pressed ? iconButtonRecipe.states.pressedOpacity : 1 }], children: _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: children }) });
}
//# sourceMappingURL=identity-action.js.map