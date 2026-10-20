import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, View } from "react-native";
import { control } from "@hjmds/design-contracts/foundations";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { sheetRecipe } from "@hjmds/design-contracts/recipes";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useHjmNativeTheme } from "../provider.js";
/** Shared native screen dismissal; navigation, reverse artwork and pending exit remain product-owned. */
export function useScreenPullDismiss(enabled, onClose, testID) {
    const { environment, palette, tokens } = useHjmNativeTheme();
    const [offset] = useState(() => new Animated.Value(0));
    const held = useRef(false);
    const startedAtTop = useRef(false);
    const current = useRef({ enabled, onClose, reduced: environment.reducedMotion });
    current.current = { enabled, onClose, reduced: environment.reducedMotion };
    const recipe = screenPatternRecipe.pullDismiss;
    const close = () => { if (current.current.enabled)
        current.current.onClose?.(); };
    const settle = () => Animated.timing(offset, { toValue: 0, duration: current.current.reduced ? 0 : recipe.settleDuration, useNativeDriver: true }).start();
    const deliberate = (distance, velocity = 0) => distance >= recipe.distance || (distance >= recipe.flickDistance && velocity >= recipe.flickVelocity);
    const vertical = (dy, dx) => dy > recipe.activationDistance && dy > Math.abs(dx);
    const responder = useMemo(() => enabled ? PanResponder.create({
        // This dedicated handle owns touch from the start; movement still requires a downward axis.
        onStartShouldSetPanResponderCapture: () => current.current.enabled,
        onMoveShouldSetPanResponder: (_, gesture) => current.current.enabled && vertical(gesture.dy, gesture.dx),
        onPanResponderGrant: () => { held.current = current.current.enabled; },
        onPanResponderMove: (_, gesture) => { if (held.current && current.current.enabled && vertical(gesture.dy, gesture.dx))
            offset.setValue(Math.max(0, Math.min(gesture.dy, recipe.maxOffset))); },
        onPanResponderRelease: (_, gesture) => {
            if (!held.current)
                return;
            held.current = false;
            settle();
            if ((vertical(gesture.dy, gesture.dx) && deliberate(gesture.dy, gesture.vy)) || (Math.abs(gesture.dy) < recipe.activationDistance && Math.abs(gesture.dx) < recipe.activationDistance))
                close();
        },
        onPanResponderTerminate: () => { held.current = false; settle(); },
    }) : null, [enabled, offset]);
    useEffect(() => {
        if (enabled)
            return;
        held.current = false;
        startedAtTop.current = false;
        offset.setValue(0);
    }, [enabled, offset]);
    const onScrollBeginDrag = event => {
        startedAtTop.current = current.current.enabled && event.nativeEvent.contentOffset.y <= recipe.topTolerance;
    };
    const onScrollEndDrag = event => {
        const beganAtTop = startedAtTop.current;
        startedAtTop.current = false;
        // Returning from a long letter to its top is scrolling, not a new dismissal gesture.
        if (beganAtTop && deliberate(-event.nativeEvent.contentOffset.y))
            close();
    };
    return {
        offset, close, onScrollBeginDrag, onScrollEndDrag,
        handle: enabled ? _jsx(View, { ...responder?.panHandlers, children: _jsx(Pressable, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", testID: `${testID ?? "hjm-screen"}-dismiss-handle`, onPress: close, style: { minHeight: control.minTouchTarget, alignItems: "center", justifyContent: "center" }, children: _jsx(View, { style: { width: sheetRecipe.handle.width, height: sheetRecipe.handle.height, borderRadius: tokens.radius[sheetRecipe.handle.radius], backgroundColor: resolveColorReference(sheetRecipe.handle.color, palette) } }) }) }) : null,
    };
}
//# sourceMappingURL=screen-dismiss.js.map