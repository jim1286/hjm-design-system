import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { authScreenRecipe, resolveAuthScreenDescriptor, } from "@hjmds/design-contracts/components/auth-screen";
import { ActivityIndicator, Platform, ScrollView, View, } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
function AuthActionCard({ children, style }) {
    const theme = useHjmNativeTheme();
    return _jsx(View, { style: [{ width: "100%", backgroundColor: theme.colors.bg,
                borderRadius: authScreenRecipe.mainCard.radius, padding: authScreenRecipe.mainCard.padding }, style], children: children });
}
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 * Review forms must accept submit taps while focused; iOS owns the scroll inset
 * so a product does not have to wrap this in another keyboard-avoiding view.
 */
export function AuthScreenLayout({ hero, main, footer, density, hasFooter, pendingLabel, mainCard = false, layoutStyle, testID, }) {
    const MainContainer = mainCard ? AuthActionCard : View;
    const resolved = resolveAuthScreenDescriptor({
        ...(density === undefined ? {} : { density }),
        ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    const pending = pendingLabel !== undefined;
    if (pending && !pendingLabel.trim())
        throw new TypeError("AuthScreen pendingLabel must not be empty");
    return (_jsxs(ScrollView, { style: [{ flex: 1 }, layoutStyle], testID: testID, keyboardShouldPersistTaps: "handled", keyboardDismissMode: Platform.OS === "ios" ? "interactive" : "on-drag", automaticallyAdjustKeyboardInsets: true, contentContainerStyle: {
            flexGrow: 1,
            paddingHorizontal: resolved.paddingInline,
            paddingVertical: resolved.paddingBlock,
        }, contentInsetAdjustmentBehavior: "automatic", children: [_jsxs(View, { style: {
                    flexGrow: 1,
                    flexShrink: 0,
                    width: "100%",
                    maxWidth: resolved.maxWidth,
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: resolved.mainGap,
                }, children: [_jsx(View, { style: { width: "100%", alignItems: "center", gap: resolved.heroGap }, children: hero }), _jsxs(MainContainer, { style: { width: "100%" }, children: [_jsx(View, { pointerEvents: pending ? "none" : "auto", accessibilityElementsHidden: pending, importantForAccessibility: pending ? "no-hide-descendants" : "auto", style: pending ? { opacity: 0 } : undefined, children: main }), pending ? _jsx(View, { accessible: true, accessibilityLabel: pendingLabel, accessibilityRole: "progressbar", accessibilityLiveRegion: "polite", accessibilityState: { busy: true }, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }, children: _jsx(ActivityIndicator, { accessible: false }) }) : null] })] }), showFooter ? (_jsx(View, { style: {
                    width: "100%",
                    maxWidth: resolved.maxWidth,
                    alignSelf: "center",
                    alignItems: "center",
                    marginTop: resolved.footerGap,
                }, children: footer })) : null] }));
}
export { authScreenRecipe };
//# sourceMappingURL=auth-screen.js.map