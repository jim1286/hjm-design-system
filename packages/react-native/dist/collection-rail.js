import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { collectionRailRecipe, validateCollectionRail, resolveCollectionRailLayout, resolveCollectionRailViewport, getCollectionRailTargetOffset, getCollectionRailItemOffset, getCollectionRailRevealOffset, getCollectionRailPhysicalOffset, } from "@hjmds/design-contracts/collection-rail";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
export function CollectionRail({ label, items, renderItem, labels, density = collectionRailRecipe.defaults.density, emptyContent, defaultStartKey, onStartKeyChange, layoutStyle, testID }) {
    validateCollectionRail(items);
    if (!label.trim() || Object.values(labels).some(value => !value.trim()))
        throw new TypeError("CollectionRail labels must not be empty");
    const { environment, tokens } = useHjmNativeTheme(), direction = environment.direction;
    const scroll = useRef(null);
    const [width, setWidth] = useState(0), [offset, setOffset] = useState(0);
    const layout = resolveCollectionRailLayout(items.length, width, density, tokens.spacing.md);
    const geometry = useRef(layout);
    geometry.current = layout;
    const logicalOffset = useRef(0);
    const pendingOffset = useRef(null);
    const anchor = useRef(defaultStartKey ?? items[0]?.id ?? null);
    const focusedKey = useRef(null);
    const initialized = useRef(false);
    if (!initialized.current) {
        validateCollectionRail(items, defaultStartKey);
        initialized.current = true;
    }
    const identity = JSON.stringify(items.map(item => item.id));
    function publish(next) {
        const state = resolveCollectionRailViewport(geometry.current, next);
        const key = items[state.startIndex]?.id ?? null;
        if (key !== anchor.current) {
            anchor.current = key;
            onStartKeyChange?.(key);
        }
        logicalOffset.current = state.offset;
        setOffset(state.offset);
    }
    function scrollToOffset(next, animated) {
        const x = getCollectionRailPhysicalOffset(geometry.current, next, direction);
        pendingOffset.current = animated && !environment.reducedMotion ? next : null;
        scroll.current?.scrollTo({ x, animated: animated && !environment.reducedMotion });
        // Native scrollTo also only delivers a command. The host's onScroll owns
        // observed anchors/end state; product callbacks must not report unseen items.
        if (!items.length)
            publish(0);
    }
    function alignAnchor() {
        const index = Math.max(0, items.findIndex(item => item.id === anchor.current));
        let target = items.length ? getCollectionRailItemOffset(geometry.current, index) : 0;
        const focusedIndex = items.findIndex(item => item.id === focusedKey.current);
        // Match Web: focused actions remain exposed when resize cannot retain both
        // the old leading item and the focused item's complete bounds.
        if (focusedIndex >= 0)
            target = getCollectionRailRevealOffset(geometry.current, target, focusedIndex);
        scrollToOffset(target, false);
    }
    useLayoutEffect(alignAnchor, [width, density, tokens.spacing.md, direction, identity]);
    function navigate(intent) {
        scrollToOffset(getCollectionRailTargetOffset(geometry.current, pendingOffset.current ?? logicalOffset.current, intent), true);
    }
    const state = resolveCollectionRailViewport(layout, offset);
    // Use one physical coordinate system on iOS/Android. Reverse only row
    // placement in RTL; keep data, reading order and child state keyed by ID.
    const contentWidth = useRef(0);
    return _jsxs(View, { testID: testID, style: [{ direction, minWidth: 0 }, layoutStyle], children: [_jsxs(ScrollView, { ref: scroll, horizontal: true, accessibilityRole: "list", accessibilityLabel: label, onLayout: event => setWidth(event.nativeEvent.layout.width), onContentSizeChange: nextWidth => {
                    // The physical scroll range exists after content layout. Re-align only
                    // for width changes; an edited card's height must not reset touch scroll.
                    if (nextWidth !== contentWidth.current) {
                        contentWidth.current = nextWidth;
                        alignAnchor();
                    }
                }, onTouchStart: () => { pendingOffset.current = null; }, onScroll: event => {
                    const next = direction === "rtl" ? geometry.current.maxOffset - event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.x;
                    if (pendingOffset.current !== null && Math.abs(next - pendingOffset.current) <= 0.5)
                        pendingOffset.current = null;
                    publish(next);
                }, scrollEventThrottle: 16, keyboardShouldPersistTaps: "handled", removeClippedSubviews: false, style: { direction: "ltr" }, contentContainerStyle: { direction: "ltr", flexDirection: direction === "rtl" ? "row-reverse" : "row",
                    gap: tokens.spacing.md, width: Math.max(layout.contentWidth, width), paddingVertical: tokens.spacing.xs }, children: [items.map((item, index) => _jsx(View, { style: { width: layout.itemWidth, direction }, onFocus: () => { focusedKey.current = item.id; scrollToOffset(getCollectionRailRevealOffset(geometry.current, logicalOffset.current, index), false); }, onBlur: () => { if (focusedKey.current === item.id)
                            focusedKey.current = null; }, children: renderItem(item) }, item.id)), items.length === 0 ? emptyContent : null] }), _jsxs(View, { accessibilityLabel: labels.navigation, style: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }, children: [_jsx(Button, { tone: "ghost", disabled: state.atStart, onPress: () => navigate("previous"), children: labels.previous }), _jsx(Button, { tone: "ghost", disabled: state.atEnd, onPress: () => navigate("next"), children: labels.next })] })] });
}
//# sourceMappingURL=collection-rail.js.map