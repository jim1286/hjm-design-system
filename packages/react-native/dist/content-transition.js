import { jsx as _jsx } from "react/jsx-runtime";
import { resolveContentTransition } from "@hjmds/design-contracts/content-transition";
import { useEffect, useRef } from "react";
import { Animated, AppState, Easing } from "react-native";
import { easing, motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
export function ContentTransition({ stateKey, children, motion: preference = "system", preset = "fade" }) {
    const { environment } = useHjmNativeTheme();
    const from = resolveContentTransition(preset, environment.direction);
    const opacity = useRef(new Animated.Value(1)).current;
    const previous = useRef(stateKey);
    useEffect(() => {
        opacity.stopAnimation();
        const changed = previous.current !== stateKey;
        previous.current = stateKey;
        if (!changed || environment.reducedMotion || preference === "none" || AppState.currentState !== "active") {
            opacity.setValue(1);
            return;
        }
        opacity.setValue(0);
        // RN's implicit easing differs from Web. Translate the shared curve instead
        // of introducing another engine for a single opacity/transform transition.
        const animation = Animated.timing(opacity, { toValue: 1, duration: timing.normal, easing: Easing.bezier(...easing.enter), useNativeDriver: true });
        animation.start();
        const sub = AppState.addEventListener("change", state => { if (state !== "active") {
            animation.stop();
            opacity.setValue(1);
        } });
        return () => { animation.stop(); sub.remove(); };
        // A new preset/direction mid-flight must settle the current content rather
        // than bend an already running transform onto a different path.
    }, [stateKey, opacity, environment.reducedMotion, environment.direction, preference, preset]);
    // Keep only the current subtree; exit copies could remain touchable or spoken.
    return _jsx(Animated.View, { style: { opacity, transform: [{ translateX: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.translateX, 0] }) }, { translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.translateY, 0] }) }, { scale: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.scale, 1] }) }] }, children: children });
}
export function TextTransition({ text, motion: preference, preset }) {
    return _jsx(ContentTransition, { stateKey: text, ...(preset ? { preset } : {}), ...(preference ? { motion: preference } : {}), children: _jsx(Text, { children: text }) });
}
//# sourceMappingURL=content-transition.js.map