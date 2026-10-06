import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveImageComparison } from "@hjmds/design-contracts/reference-controls";
import { Slider } from "./slider.js";
import { Image } from "./data-display.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function ImageComparison(props) {
    const { before, after, label, value, onValueChange, getValueText, disabled = false, decrementLabel, incrementLabel } = props;
    const { aspectRatio, fraction } = resolveImageComparison(props);
    const { colors } = useHjmNativeTheme();
    const [width, setWidth] = useState(0);
    // Render both images at the full measured width. Resizing the clipped image
    // itself would zoom it and make before/after coordinates incomparable.
    const height = width / aspectRatio;
    return _jsxs(View, { style: { gap: spacing.xs }, children: [_jsxs(View, { style: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.sm }, children: [_jsx(Text, { children: before.label }), _jsx(Text, { children: after.label })] }), _jsx(View, { onLayout: event => setWidth(event.nativeEvent.layout.width), style: { aspectRatio, width: "100%", overflow: "hidden", backgroundColor: colors.surfaceAlt, direction: "ltr" }, children: width > 0 ? _jsxs(_Fragment, { children: [_jsx(Image, { src: after.src, width: width, height: height, decorative: false, accessibilityLabel: after.label }), _jsx(View, { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: width * fraction, overflow: "hidden" }, children: _jsx(Image, { src: before.src, width: width, height: height, decorative: false, accessibilityLabel: before.label }) }), _jsx(View, { pointerEvents: "none", accessible: false, style: { position: "absolute", left: width * fraction, top: 0, bottom: 0, borderLeftWidth: 2, borderColor: colors.border } })] }) : null }), _jsx(Slider, { label: label, min: 0, max: 100, step: 1, value: value, onValueChange: onValueChange, getValueText: getValueText, disabled: disabled, decrementLabel: decrementLabel, incrementLabel: incrementLabel })] });
}
//# sourceMappingURL=image-comparison.js.map