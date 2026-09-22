import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { authScreenRecipe, resolveAuthScreenDescriptor, } from "@hjmds/design-contracts/components/auth-screen";
import { Platform, ScrollView, View } from "react-native";
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 * Review forms must accept submit taps while focused; iOS owns the scroll inset
 * so a product does not have to wrap this in another keyboard-avoiding view.
 */
export function AuthScreenLayout({ hero, main, footer, density, hasFooter, style, layoutStyle, testID, }) {
    const resolved = resolveAuthScreenDescriptor({
        ...(density === undefined ? {} : { density }),
        ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    return (_jsxs(ScrollView, { style: [{ flex: 1 }, style, layoutStyle], testID: testID, keyboardShouldPersistTaps: "handled", keyboardDismissMode: Platform.OS === "ios" ? "interactive" : "on-drag", automaticallyAdjustKeyboardInsets: true, contentContainerStyle: {
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
                }, children: [_jsx(View, { style: { width: "100%", alignItems: "center", gap: resolved.heroGap }, children: hero }), _jsx(View, { style: { width: "100%" }, children: main })] }), showFooter ? (_jsx(View, { style: {
                    width: "100%",
                    maxWidth: resolved.maxWidth,
                    alignSelf: "center",
                    alignItems: "center",
                    marginTop: resolved.footerGap,
                }, children: footer })) : null] }));
}
export { authScreenRecipe };
//# sourceMappingURL=auth-screen.js.map