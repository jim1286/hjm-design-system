import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Component, useEffect, useId, useRef } from "react";
import { Animated, AppState, View, StyleSheet } from "react-native";
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop, Pattern, Rect, Mask, Image as SvgImage } from "react-native-svg";
import { resolveEffectSurface } from "@hjmds/design-contracts/effect-surface";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useHjmNativeTheme } from "./provider.js";
export function EffectSurface({ descriptor = {}, children, style, visible = true }) {
    const { palette } = useHjmNativeTheme();
    // Validate caller input outside the fallback; a broken descriptor is not a host failure.
    const effect = resolveEffectSurface(descriptor);
    return _jsxs(View, { style: [{ overflow: "hidden", backgroundColor: palette.theme.bg }, style], children: [_jsx(DecorationBoundary, { children: _jsx(EffectDecoration, { effect: effect, visible: visible }) }), children] });
}
// A failed optional SVG/Animated host must not unmount the product's content.
// Stay on the base surface until remount instead of repeatedly retrying a broken host.
class DecorationBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? null : this.props.children; }
}
function EffectDecoration({ effect, visible }) {
    const { palette, environment } = useHjmNativeTheme();
    const id = useId().replace(/:/g, "");
    const progress = useRef(new Animated.Value(0)).current;
    const hasAtmosphere = effect.layers.some(value => value !== "ruled");
    useEffect(() => {
        if (!hasAtmosphere || !effect.active || environment.reducedMotion || !visible) {
            progress.setValue(0);
            return;
        }
        // Core Animated avoids a GPU/Worklets dependency for a decorative transform.
        // Native list/screen owners pass visibility; AppState additionally suspends it.
        let animation;
        let failed = false;
        const sync = (state) => {
            animation?.stop();
            progress.setValue(0);
            if (state === "active" && !failed) {
                // AppState callbacks run outside React error boundaries. A failed start keeps
                // the static layer and must not crash when the app returns to the foreground.
                try {
                    animation = Animated.loop(Animated.sequence([
                        Animated.timing(progress, { toValue: 1, duration: effect.period * 500, useNativeDriver: true }),
                        Animated.timing(progress, { toValue: 0, duration: effect.period * 500, useNativeDriver: true }),
                    ]));
                    animation.start();
                }
                catch {
                    failed = true;
                    animation?.stop();
                    progress.setValue(0);
                }
            }
        };
        sync(AppState.currentState);
        const sub = AppState.addEventListener("change", sync);
        return () => { animation?.stop(); progress.setValue(0); sub.remove(); };
    }, [hasAtmosphere, effect.active, effect.period, environment.reducedMotion, visible, progress]);
    const colors = effect.colors.map(color => resolveColorReference(color, palette));
    return _jsxs(_Fragment, { children: [_jsx(Animated.View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: [StyleSheet.absoluteFill, { opacity: effect.intensity, transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1.12] }) }] }], children: _jsxs(Svg, { width: "100%", height: "100%", children: [_jsx(Defs, { children: effect.noise && _jsxs(_Fragment, { children: [_jsx(Pattern, { id: `${id}-noise-tile`, width: effect.noise.size, height: effect.noise.size, x: effect.noise.offset, patternUnits: "userSpaceOnUse", children: _jsx(SvgImage, { href: effect.noise.uri, width: effect.noise.size, height: effect.noise.size }) }), _jsx(Mask, { id: `${id}-noise-mask`, x: 0, y: 0, width: "100%", height: "100%", maskUnits: "userSpaceOnUse", children: _jsx(Rect, { width: "100%", height: "100%", fill: `url(#${id}-noise-tile)` }) })] }) }), effect.noise && _jsx(Rect, { width: "100%", height: "100%", fill: palette.theme.text, mask: `url(#${id}-noise-mask)` }), _jsxs(Svg, { width: "100%", height: "100%", viewBox: "0 0 100 100", preserveAspectRatio: "none", children: [_jsxs(Defs, { children: [colors.map((color, index) => _jsxs(RadialGradient, { id: `${id}-${index}`, children: [_jsx(Stop, { offset: "0%", stopColor: color }), _jsx(Stop, { offset: "100%", stopColor: color, stopOpacity: 0 })] }, index)), _jsx(Pattern, { id: `${id}-grain`, width: 4, height: 4, patternUnits: "userSpaceOnUse", children: effect.points.map((point, index) => _jsx(Circle, { cx: point.x / 25, cy: point.y / 25, r: point.radius / 10, fill: palette.theme.text, opacity: 0.28 }, index)) })] }), effect.layers.includes("mesh") && effect.anchors.map((anchor, index) => _jsx(Ellipse, { cx: anchor.x, cy: anchor.y, rx: 65, ry: 70, fill: `url(#${id}-${index})` }, index)), effect.layers.includes("glow") && _jsx(Ellipse, { cx: 50, cy: 10, rx: 70, ry: 95, fill: `url(#${id}-0)` }), effect.layers.includes("grain") && _jsx(Rect, { width: 100, height: 100, fill: `url(#${id}-grain)` })] })] }) }), effect.ruled && _jsxs(Svg, { testID: "hjm-effect-ruled", pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", width: "100%", height: "100%", style: [StyleSheet.absoluteFill, { opacity: effect.intensity }], children: [_jsx(Defs, { children: _jsx(Pattern, { id: `${id}-ruled`, width: 1, height: effect.ruled.spacing, patternUnits: "userSpaceOnUse", children: _jsx(Rect, { y: effect.ruled.spacing - effect.ruled.thickness, width: "100%", height: effect.ruled.thickness, fill: palette.theme.text }) }) }), _jsx(Rect, { width: "100%", height: "100%", fill: `url(#${id}-ruled)` })] })] });
}
//# sourceMappingURL=effect-surface.js.map