import { jsx as _jsx } from "react/jsx-runtime";
import { resolveContentTransition } from "@hjmds/design-contracts/content-transition";
import { useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, View } from "react-native";
import { easing, motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
export function ContentTransition({ stateKey, children, motion: preference = "system", preset = "fade", animateHeight = false, enterOnMount = false }) {
    const { environment } = useHjmNativeTheme();
    const from = resolveContentTransition(preset, environment.direction);
    const opacity = useRef(new Animated.Value(1)).current;
    const height = useRef(new Animated.Value(0)).current;
    const targetHeight = useRef(null);
    const [measured, setMeasured] = useState(false);
    const heightEnabled = animateHeight && !environment.reducedMotion && preference !== "none";
    useEffect(() => {
        const settle = () => { height.stopAnimation(); if (targetHeight.current !== null)
            height.setValue(targetHeight.current); };
        if (!heightEnabled) {
            settle();
            return;
        }
        const sub = AppState.addEventListener("change", state => { if (state !== "active")
            settle(); });
        return () => { sub.remove(); settle(); };
    }, [height, heightEnabled]);
    const measureHeight = (event) => {
        const next = event.nativeEvent.layout.height;
        if (next === targetHeight.current)
            return;
        const firstMeasurement = targetHeight.current === null;
        targetHeight.current = next;
        setMeasured(true);
        height.stopAnimation();
        if (firstMeasurement || !heightEnabled || AppState.currentState !== "active") {
            height.setValue(next);
            return;
        }
        // Height is a layout property, so this opt-in uses the JS driver. The
        // opacity/transform path stays on the native driver and inputs stay unique.
        Animated.timing(height, { toValue: next, duration: timing.normal, easing: Easing.bezier(...easing.enter), useNativeDriver: false }).start();
    };
    const previous = useRef(null);
    useEffect(() => {
        opacity.stopAnimation();
        // A new data row can opt in without using a timer or changing an existing row's key.
        const changed = previous.current === null ? enterOnMount : previous.current !== stateKey;
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
    }, [stateKey, opacity, environment.reducedMotion, environment.direction, preference, preset, enterOnMount]);
    // Keep only the current subtree; exit copies could remain touchable or spoken.
    return _jsx(Animated.View, { style: heightEnabled && measured ? { height, overflow: "hidden" } : undefined, children: _jsx(View, { onLayout: animateHeight ? measureHeight : undefined, children: _jsx(Animated.View, { style: { opacity, transform: [{ translateX: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.translateX, 0] }) }, { translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.translateY, 0] }) }, { scale: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.scale, 1] }) }] }, children: children }) }) });
}
export function TextTransition({ text, motion: preference, preset }) {
    return _jsx(ContentTransition, { stateKey: text, ...(preset ? { preset } : {}), ...(preference ? { motion: preference } : {}), children: _jsx(Text, { children: text }) });
}
//# sourceMappingURL=content-transition.js.map