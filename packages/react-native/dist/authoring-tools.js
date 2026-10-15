import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Animated, AppState, Easing, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { validateBezier } from "@hjmds/design-contracts/authoring-tools";
import { Button } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/** ShortcutRecorder is Web-only: Native has no portable browser keyboard registration surface. */
export const authoringToolsCapabilities = Object.freeze({ bezierEditor: true, shortcutRecorder: false });
export function BezierEditor(props) {
    validateBezier(props.value);
    const range = props.yRange ?? [-2, 2], duration = props.duration ?? 1000;
    if (!Number.isFinite(duration) || duration <= 0 || !range.every(Number.isFinite) || range[0] >= range[1] || props.value[1] < range[0] || props.value[1] > range[1] || props.value[3] < range[0] || props.value[3] > range[1])
        throw new RangeError("Invalid Bezier preview duration or y range");
    const theme = useHjmNativeTheme(), position = useRef(new Animated.Value(0)).current;
    useEffect(() => { position.stopAnimation(); position.setValue(0); return () => position.stopAnimation(); }, [...props.value, duration, props.active, props.disabled, theme.environment.reducedMotion, position]);
    useEffect(() => { const app = AppState.addEventListener("change", state => { if (state !== "active")
        position.stopAnimation(); }); return () => app.remove(); }, [position]);
    const [x1, y1, x2, y2] = props.value;
    // Fit the selected controls and both endpoints; the allowed edit range would shrink the default curve.
    const curveMin = Math.min(0, 1, y1, y2), curveMax = Math.max(0, 1, y1, y2);
    const preview = () => { position.stopAnimation(); position.setValue(0); if (props.disabled || theme.environment.reducedMotion || props.active === false || AppState.currentState !== "active")
        return; Animated.timing(position, { toValue: 120, duration, easing: Easing.bezier(x1, y1, x2, y2), useNativeDriver: true }).start(); };
    return _jsxs(Stack, { gap: "md", children: [_jsxs(Svg, { accessible: true, accessibilityRole: "image", accessibilityLabel: props.labels.curve, width: "100%", height: 180, viewBox: `-10 ${100 - curveMax * 100 - 10} 120 ${(curveMax - curveMin) * 100 + 20}`, children: [_jsx(Path, { d: "M0 100 L100 0", fill: "none", stroke: theme.colors.textMuted, opacity: .2 }), _jsx(Path, { d: `M0 100 L${x1 * 100} ${100 - y1 * 100} M100 0 L${x2 * 100} ${100 - y2 * 100}`, fill: "none", stroke: theme.colors.textMuted }), _jsx(Path, { d: `M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`, fill: "none", stroke: theme.colors.contentBrand, strokeWidth: 2 }), _jsx(Circle, { cx: x1 * 100, cy: 100 - y1 * 100, r: 3, fill: theme.colors.contentBrand }), _jsx(Circle, { cx: x2 * 100, cy: 100 - y2 * 100, r: 3, fill: theme.colors.contentBrand })] }), props.value.map((value, index) => _jsx(Slider, { label: props.labels.coordinates[index], min: index % 2 === 0 ? 0 : range[0], max: index % 2 === 0 ? 1 : range[1], step: .01, value: value, disabled: props.disabled === true, getValueText: props.formatCoordinate, decrementLabel: props.labels.decrement, incrementLabel: props.labels.increment, onValueChange: next => { const values = [...props.value]; values[index] = next; props.onValueChange(values); } }, index)), _jsx(View, { accessible: false, style: { height: 24, paddingHorizontal: 4, overflow: "hidden" }, children: _jsx(Animated.View, { style: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.contentBrand, transform: [{ translateX: position }] } }) }), _jsx(Button, { disabled: props.disabled || props.active === false, onPress: preview, children: props.labels.preview })] });
}
//# sourceMappingURL=authoring-tools.js.map