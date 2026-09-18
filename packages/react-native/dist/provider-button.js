import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { authProviderButtonRecipe, resolveAuthProviderSurface, validateAuthProviderButtonDescriptor, } from "@hjmds/design-contracts/components/provider-button";
import { ActivityIndicator, Pressable, View, } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function AuthProviderButton({ descriptor, logo, onPress, style }) {
    validateAuthProviderButtonDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    // The theme picks between the provider's own variants and nothing else.
    const surface = resolveAuthProviderSurface(descriptor.provider, theme.environment.theme === "dark" ? "dark" : "light");
    const busy = descriptor.busy === true;
    const disabled = descriptor.disabled === true || busy;
    return (_jsxs(Pressable, { accessibilityRole: "button", accessibilityState: { busy, disabled }, disabled: disabled, onPress: onPress, style: [
            {
                alignItems: "center",
                backgroundColor: surface.background,
                borderColor: surface.border ?? "transparent",
                borderRadius: authProviderButtonRecipe.radius,
                borderWidth: surface.border === null ? 0 : authProviderButtonRecipe.borderWidth,
                flexDirection: "row",
                gap: authProviderButtonRecipe.gap,
                justifyContent: "center",
                minHeight: Math.max(authProviderButtonRecipe.minHeight, authProviderButtonRecipe.minTouchTarget),
                opacity: disabled && !busy ? 0.5 : 1,
                paddingHorizontal: authProviderButtonRecipe.paddingHorizontal,
            },
            style,
        ], children: [_jsx(View, { style: {
                    alignItems: "center",
                    height: authProviderButtonRecipe.logoSize,
                    justifyContent: "center",
                    width: authProviderButtonRecipe.logoSize,
                }, children: logo }), _jsx(Text, { style: { color: surface.content, flexShrink: 1 }, variant: "body", children: descriptor.label }), busy ? _jsx(ActivityIndicator, { color: surface.content }) : null] }));
}
//# sourceMappingURL=provider-button.js.map