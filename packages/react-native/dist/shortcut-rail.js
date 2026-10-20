import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { chipRecipe } from "@hjmds/design-contracts/recipes";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { shortcutRailRecipe, validateShortcutRail, revealShortcut } from "@hjmds/design-contracts/shortcut-rail";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
export function ShortcutRail({ label, items, onAction, onRemove, removeLabel, removeIcon, isRemovable, leading, layout = shortcutRailRecipe.defaults.layout, size = chipRecipe.defaults.size, renderLeading, layoutStyle, testID }) {
    validateShortcutRail(items, label, layout);
    const { palette, tokens, environment } = useHjmNativeTheme();
    const scroll = useRef(null), viewport = useRef(0), offset = useRef(0);
    const frames = useRef(new Map());
    const leadingFrame = useRef(null);
    const hasLeading = leading != null && leading !== false;
    const metrics = chipRecipe.sizes[size], presentation = chipRecipe.states.idle;
    const visualHeight = visibleControlHeight(metrics.height, environment.minimumVisualTarget);
    const targetHeight = Math.max(visualHeight, shortcutRailRecipe.minTouchTarget);
    const paintInset = (targetHeight - visualHeight) / 2;
    const content = resolveColorReference(presentation.content, palette);
    function revealFrame(frame) {
        if (!frame || viewport.current <= 0)
            return;
        const x = revealShortcut(offset.current, viewport.current, frame.x, frame.width);
        if (x !== offset.current)
            scroll.current?.scrollTo({ x, animated: false });
    }
    function reveal(id) { revealFrame(frames.current.get(id)); }
    if (!items.length && !hasLeading)
        return null;
    const controls = hasLeading ? _jsx(View, { onLayout: event => { leadingFrame.current = event.nativeEvent.layout; }, onFocus: () => { if (layout === "scroll")
            revealFrame(leadingFrame.current); }, style: { flexDirection: "row", alignItems: "center", direction: environment.direction }, children: leading }) : null;
    const entries = items.map(item => _jsxs(View, { onLayout: event => { frames.current.set(item.id, event.nativeEvent.layout); }, onFocus: () => { if (layout === "scroll")
            reveal(item.id); }, style: { ...(layout === "wrap" ? { maxWidth: "100%" } : {}), flexDirection: "row", direction: environment.direction, alignItems: "stretch",
            opacity: item.disabled ? chipRecipe.states.disabledOpacity : 1 }, children: [_jsx(View, { pointerEvents: "none", accessible: false, style: { position: "absolute", top: paintInset, bottom: paintInset, left: 0, right: 0,
                    borderWidth: chipRecipe.borderWidth, borderRadius: tokens.radius[chipRecipe.radius],
                    borderColor: resolveColorReference(presentation.border, palette), backgroundColor: resolveColorReference(presentation.background, palette) } }), _jsxs(Pressable, { accessibilityRole: "button", accessibilityLabel: item.label, accessibilityHint: item.description, accessibilityState: { disabled: !!item.disabled }, disabled: item.disabled, testID: testID ? `${testID}-${item.id}` : undefined, onPress: () => { if (!item.disabled)
                    onAction(item); }, style: ({ pressed }) => ({ ...(layout === "wrap" ? { flexShrink: 1 } : {}), flexDirection: "row", alignItems: "center", gap: metrics.gap,
                    minWidth: shortcutRailRecipe.actionMinWidth, minHeight: targetHeight, paddingHorizontal: metrics.paddingHorizontal,
                    borderRadius: tokens.radius[chipRecipe.radius], opacity: pressed ? chipRecipe.states.pressedOpacity : 1 }), children: [renderLeading ? _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: renderLeading(item) }) : null, _jsx(Text, { fontRole: "ui", variant: metrics.textVariant, style: { ...(layout === "wrap" ? { flexShrink: 1, minWidth: 0 } : {}), color: content, fontWeight: chipRecipe.label.fontWeight }, children: item.label })] }), onRemove && isRemovable?.(item) !== false ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: removeLabel(item), accessibilityState: { disabled: !!item.disabled }, disabled: item.disabled, testID: testID ? `${testID}-remove-${item.id}` : undefined, onPress: () => { if (!item.disabled)
                    onRemove(item); }, style: ({ pressed }) => ({ width: shortcutRailRecipe.removeWidth, minHeight: targetHeight, alignItems: "center", justifyContent: "center",
                    borderRadius: tokens.radius[chipRecipe.radius], opacity: pressed ? chipRecipe.states.pressedOpacity : 1 }), children: _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: removeIcon ?? _jsx(FixedGlyph, { color: content, fontSize: shortcutRailRecipe.glyph, children: "\u00D7" }) }) }) : null] }, item.id));
    if (layout === "wrap")
        return _jsxs(View, { accessibilityRole: "list", accessibilityLabel: label, testID: testID, style: [{ flexDirection: "row", flexWrap: "wrap", gap: shortcutRailRecipe.gap, direction: environment.direction }, layoutStyle], children: [controls, entries] });
    return _jsxs(ScrollView, { horizontal: true, ref: scroll, accessibilityRole: "list", accessibilityLabel: label, testID: testID, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "handled", removeClippedSubviews: false, onLayout: event => { viewport.current = event.nativeEvent.layout.width; }, onScroll: event => { offset.current = event.nativeEvent.contentOffset.x; }, scrollEventThrottle: 16, style: [{ flexGrow: 0, direction: "ltr" }, layoutStyle], contentContainerStyle: { flexDirection: environment.direction === "rtl" ? "row-reverse" : "row", gap: shortcutRailRecipe.gap,
            paddingVertical: metrics.hitSlop }, children: [controls, entries] });
}
//# sourceMappingURL=shortcut-rail.js.map