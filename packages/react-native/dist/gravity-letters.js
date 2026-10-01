import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo } from "react";
import { Animated, AppState, View } from "react-native";
import { gravityLetterMotion, resolveGravityLetters } from "@hjmds/design-contracts/gravity-letters";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
/** Decorative only; keep a readable, static heading outside this hidden view. */
export function GravityLetters({ glyphs, active = false, replayKey = 0 }) {
    const { environment } = useHjmNativeTheme();
    const units = resolveGravityLetters(glyphs);
    const signature = JSON.stringify(glyphs);
    const values = useMemo(() => JSON.parse(signature).map(() => new Animated.Value(1)), [signature]);
    useEffect(() => {
        const clear = () => values.forEach(value => { value.stopAnimation(); value.setValue(1); });
        clear();
        if (!active || environment.reducedMotion || AppState.currentState !== "active")
            return;
        const recipe = resolveGravityLetters(JSON.parse(signature));
        const animations = values.map((value, index) => {
            value.setValue(0);
            return Animated.timing(value, { toValue: 1, duration: gravityLetterMotion.duration, delay: recipe[index].delay, useNativeDriver: true });
        });
        animations.forEach(animation => animation.start());
        const stop = () => { animations.forEach(animation => animation.stop()); clear(); };
        const subscription = AppState.addEventListener("change", state => { if (state !== "active")
            stop(); });
        return () => { stop(); subscription.remove(); };
    }, [signature, values, active, replayKey, environment.reducedMotion]);
    return _jsx(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flexDirection: "row", flexWrap: "wrap", paddingTop: 36 }, children: units.map((unit, index) => _jsx(Animated.View, { style: { transform: [
                    { translateY: values[index].interpolate({ inputRange: [...gravityLetterMotion.input], outputRange: [...gravityLetterMotion.y] }) },
                    { rotate: values[index].interpolate({ inputRange: [0, 0.55, 1], outputRange: [`${unit.rotation}deg`, "0deg", "0deg"] }) },
                ] }, children: _jsx(Text, { variant: "heading", children: unit.glyph }) }, index)) });
}
//# sourceMappingURL=gravity-letters.js.map