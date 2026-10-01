import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Animated, AppState, View } from "react-native";
import { gridRevealTiles, gridRevealDuration } from "@hjmds/design-contracts/grid-reveal";
import { useHjmNativeTheme } from "./provider.js";
/** Decorative mask only; the host Image owns load/error and the accessible description. */
export function GridReveal({ ready, active = true, children }) {
    const { colors, environment } = useHjmNativeTheme();
    const values = useRef(gridRevealTiles.map(() => new Animated.Value(0))).current;
    useEffect(() => {
        const clear = () => values.forEach(value => { value.stopAnimation(); value.setValue(0); });
        clear();
        if (!ready || !active || environment.reducedMotion || AppState.currentState !== "active")
            return;
        const animations = values.map((value, index) => { value.setValue(1); return Animated.timing(value, { toValue: 0, duration: gridRevealDuration, delay: gridRevealTiles[index].delay, useNativeDriver: true }); });
        animations.forEach(animation => animation.start());
        const stop = () => { animations.forEach(animation => animation.stop()); clear(); };
        const subscription = AppState.addEventListener("change", state => { if (state !== "active")
            stop(); });
        return () => { stop(); subscription.remove(); };
    }, [ready, active, environment.reducedMotion, values]);
    return _jsxs(View, { style: { position: "relative" }, children: [children, _jsx(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }, children: gridRevealTiles.map(tile => _jsx(Animated.View, { style: { position: "absolute", top: `${tile.row * 25}%`, left: `${tile.column * 25}%`, width: "25%", height: "25%", opacity: values[tile.id], backgroundColor: colors.bg } }, tile.id)) })] });
}
//# sourceMappingURL=grid-reveal.js.map