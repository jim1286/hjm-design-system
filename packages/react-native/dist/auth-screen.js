import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { authScreenRecipe, resolveAuthScreenDescriptor, validateAuthScreenHeroDescriptor, validateAuthScreenPolicyLinks, } from "@hjmds/design-contracts/components/auth-screen";
import { createContext, Fragment, useContext, useMemo, useRef } from "react";
import { InheritedTextAlignContext } from "./internal/text-align.js";
import { resolveScreenBottomPadding } from "./internal/screen-footer.js";
import { useKeyboardOverlap } from "./keyboard.js";
import { Text } from "./primitives.js";
import { ActivityIndicator, Platform, Pressable, ScrollView, View, } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
// The hero follows the layout density without the product passing it twice (same as Web).
const AuthScreenDensityContext = createContext(undefined);
function AuthActionCard({ children, style }) {
    const theme = useHjmNativeTheme();
    return _jsx(View, { style: [{ width: "100%", backgroundColor: theme.colors.bg,
                // The login card uses the same lg surface role as Web; provider buttons keep
                // their separate branding recipe and pending keeps the mounted action block.
                borderRadius: theme.designProfile?.tokens.radius.lg ?? authScreenRecipe.mainCard.radius,
                padding: authScreenRecipe.mainCard.padding }, style], children: children });
}
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 * Review forms must accept submit taps while focused; iOS owns the keyboard scroll inset
 * so a product does not have to wrap this in another keyboard-avoiding view.
 * Safe areas follow ScreenLayout: the host owns the top edge and `safeAreaBottom` the bottom. iOS automatic content
 * inset adjustment is off because it added the home-indicator inset on iOS only, on top of paddingBlock, which made
 * every product add its own Android inset (spint) or wrap the layout (diairy, utilverse) — 2026-10-17.
 */
export function AuthScreenLayout({ hero, main, footer, density, hasFooter, pendingLabel, mainCard = false, safeAreaBottom = 0, layoutStyle, testID, }) {
    const MainContainer = mainCard ? AuthActionCard : View;
    const resolved = resolveAuthScreenDescriptor({
        ...(density === undefined ? {} : { density }),
        ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    const pending = pendingLabel !== undefined;
    if (pending && !pendingLabel.trim())
        throw new TypeError("AuthScreen pendingLabel must not be empty");
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0)
        throw new RangeError("AuthScreenLayout safeAreaBottom must be non-negative");
    const scrollRef = useRef(null);
    // Only a keyboard flag: automaticallyAdjustKeyboardInsets already pads the overlap, which clears the home indicator.
    // The ScrollView class exposes its host view (with measureInWindow) through getNativeScrollRef.
    const keyboardHost = useMemo(() => ({ get current() { return scrollRef.current?.getNativeScrollRef?.() ?? null; } }), []);
    const keyboardOpen = useKeyboardOverlap(keyboardHost) > 0;
    const paddingBottom = resolveScreenBottomPadding(resolved.paddingBlock, safeAreaBottom, keyboardOpen);
    return (_jsxs(ScrollView, { ref: scrollRef, style: [{ flex: 1 }, layoutStyle], testID: testID, keyboardShouldPersistTaps: "handled", keyboardDismissMode: Platform.OS === "ios" ? "interactive" : "on-drag", automaticallyAdjustKeyboardInsets: true, contentContainerStyle: {
            flexGrow: 1,
            paddingHorizontal: resolved.paddingInline,
            paddingTop: resolved.paddingBlock,
            paddingBottom,
        }, children: [_jsxs(View, { style: {
                    flexGrow: 1,
                    flexShrink: 0,
                    width: "100%",
                    maxWidth: resolved.maxWidth,
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: resolved.mainGap,
                }, children: [_jsx(AuthScreenDensityContext.Provider, { value: resolved.density, children: _jsx(InheritedTextAlignContext.Provider, { value: "center", children: _jsx(View, { style: { width: "100%", alignItems: "center", gap: resolved.heroGap }, children: hero }) }) }), _jsxs(MainContainer, { style: { width: "100%" }, children: [_jsx(View, { pointerEvents: pending ? "none" : "auto", accessibilityElementsHidden: pending, importantForAccessibility: pending ? "no-hide-descendants" : "auto", style: pending ? { opacity: 0 } : undefined, children: main }), pending ? _jsx(View, { accessible: true, accessibilityLabel: pendingLabel, accessibilityRole: "progressbar", accessibilityLiveRegion: "polite", accessibilityState: { busy: true }, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }, children: _jsx(ActivityIndicator, { accessible: false }) }) : null] })] }), showFooter ? (_jsx(View, { style: {
                    width: "100%",
                    maxWidth: resolved.maxWidth,
                    alignSelf: "center",
                    alignItems: "center",
                    marginTop: resolved.footerGap,
                }, children: footer })) : null] }));
}
/**
 * The `hero` slot content: mark, eyebrow, tagline and one description line. Type
 * steps, tones and gaps come from `authScreenRecipe.hero`, matching Web.
 */
export function AuthScreenHero({ mark, title, eyebrow, description, headingLevel = 1 }) {
    validateAuthScreenHeroDescriptor({ title, ...(eyebrow === undefined ? {} : { eyebrow }), ...(description === undefined ? {} : { description }), headingLevel });
    const theme = useHjmNativeTheme();
    const density = useContext(AuthScreenDensityContext);
    const variant = resolveAuthScreenDescriptor(density === undefined ? {} : { density }).titleVariant;
    const recipe = authScreenRecipe.hero;
    // Fragment: mark and copy are direct children of the hero so the recipe hero gap separates them.
    return (_jsxs(Fragment, { children: [mark ? _jsx(View, { children: mark }) : null, _jsxs(View, { style: { width: "100%", alignItems: "center" }, children: [eyebrow ? _jsx(Text, { variant: recipe.eyebrow.textVariant, tone: recipe.eyebrow.tone, style: { marginBottom: recipe.eyebrow.gapBelow }, children: eyebrow }) : null, _jsx(Text, { accessibilityRole: "header", variant: variant, tone: recipe.title.tone, style: { fontWeight: theme.tokens.typography[variant].fontWeight }, children: title }), description ? _jsx(Text, { variant: recipe.description.textVariant, tone: recipe.description.tone, style: { marginTop: recipe.description.gapAbove }, children: description }) : null] })] }));
}
/**
 * The `footer` slot content: consent notice plus dot-separated policy links. The
 * visible gap between links is `linkGap` + separator + `linkGap`; the 44pt touch
 * target comes from hitSlop, not visible padding (2026-10-17 user report: reduce the link gap).
 */
export function AuthScreenFooter({ notice, links, children }) {
    validateAuthScreenPolicyLinks(links);
    const recipe = authScreenRecipe.footer;
    // Height comes from a background-less minHeight (Android ignores hitSlop outside the parent row);
    // only the inline extension up to the separator uses hitSlop.
    const hitSlop = { left: recipe.linkGap, right: recipe.linkGap };
    return (_jsxs(View, { style: { width: "100%", alignItems: "center", gap: recipe.noticeGap }, children: [notice ? _jsx(Text, { variant: recipe.notice.textVariant, tone: recipe.notice.tone, children: notice }) : null, _jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", columnGap: recipe.linkGap }, children: links.map((link, index) => (_jsxs(Fragment, { children: [index > 0 ? _jsx(Text, { variant: recipe.link.textVariant, tone: recipe.notice.tone, accessible: false, importantForAccessibility: "no", children: recipe.separator }) : null, _jsx(Pressable, { accessibilityRole: "link", accessibilityLabel: link.label, ...(link.accessibilityHint === undefined ? {} : { accessibilityHint: link.accessibilityHint }), hitSlop: hitSlop, onPress: link.onPress, style: { minHeight: authScreenRecipe.footerMinTouchTarget, justifyContent: "center" }, children: _jsx(Text, { variant: recipe.link.textVariant, tone: recipe.link.tone, style: { textDecorationLine: recipe.link.underline ? "underline" : "none" }, children: link.label }) })] }, `${index}:${link.label}`))) }), children] }));
}
export { authScreenRecipe };
//# sourceMappingURL=auth-screen.js.map