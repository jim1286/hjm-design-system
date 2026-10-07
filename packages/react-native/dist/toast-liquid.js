import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, PanResponder, View } from "react-native";
import { Canvas, Group, Paint, Blur, ColorMatrix, RoundedRect, Shadow } from "@shopify/react-native-skia";
import Animated, { cancelAnimation, interpolateColor, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { shadow, stroke } from "@hjmds/design-contracts/foundations";
import { withAlpha } from "@hjmds/design-contracts/colors";
import { buildLiquidToastGeometry, liquidToastRecipe as recipe, resolveLiquidToastLayout, validateLiquidToastAnchor } from "@hjmds/design-contracts/components/toast";
import { toastRecipe } from "@hjmds/design-contracts/recipes";
import { useHjmNativeTheme } from "./provider.js";
/** Optional entry: requires Skia 2.6, Reanimated 4.5 and Worklets 0.10 in the host. */
export function createLiquidToastPresentation(options = {}) {
    const anchor = options.anchor?.kind === "island"
        ? { kind: "island", frame: { ...options.anchor.frame } }
        : options.anchor ?? { kind: "capsule" };
    validateLiquidToastAnchor(anchor);
    return Object.freeze({ kind: "liquid", anchor, Surface: LiquidSurface });
}
function LiquidSurface({ anchor, ...props }) {
    const theme = useHjmNativeTheme();
    // The settled surface keeps the shallow raised role (2026-10-02 depth review),
    // resolved from the nearest profile instead of restoring a fixed floating shadow.
    const cardShadow = theme.designProfile?.tokens.shadow.raised ?? shadow.raised;
    const cardRadius = theme.designProfile?.tokens.radius[toastRecipe.surface.radius] ?? recipe.radius;
    // Skia blur uses sigma. Reserve three sigmas plus either signed offset on all
    // canvas edges; an upward product shadow otherwise clips against the fixed origin.
    const shadowColor = withAlpha(cardShadow.color, cardShadow.opacity);
    const shadowBlur = cardShadow.radius / 2;
    const canvasBleed = cardShadow.opacity === 0 ? 0 : Math.ceil(shadowBlur * 3 + Math.abs(cardShadow.offsetY));
    const [height, setHeight] = useState(0);
    const [reader, setReader] = useState(false);
    const [osReduced, setOsReduced] = useState(false);
    const callbacks = useRef(props);
    callbacks.current = props;
    const generation = useRef(0);
    const entered = useRef(false);
    const layout = resolveLiquidToastLayout({
        width: props.width, height, availableHeight: props.availableHeight, anchor,
        ...(props.windowOrigin === undefined ? {} : { windowOrigin: props.windowOrigin }),
    });
    // Accessibility and constrained layouts keep the same store entry with standard chrome.
    const fallback = reader || osReduced || theme.environment.reducedMotion || (height > 0 && !layout.fits);
    const drop = useSharedValue(0), expand = useSharedValue(0), reveal = useSharedValue(0), tint = useSharedValue(0), drag = useSharedValue(0);
    const geometry = useDerivedValue(() => buildLiquidToastGeometry(drop.value, expand.value, layout, cardRadius), [layout, cardRadius]);
    // 2026-10-02: the neutral fill looked muddy. Use clean white in the default light
    // theme and a blue-tinted dark surface; keep the outline so white-on-white stays legible.
    const cardColor = theme.environment.theme === "dark" ? theme.colors.surfaceAccent : theme.colors.bg;
    const cardBorder = theme.colors.borderControl;
    const anchorColor = anchor.kind === "island" ? "#000000" : theme.colors.text;
    // Black is a physical occlusion match only for an explicitly supplied hardware frame.
    const dropletColor = useDerivedValue(() => interpolateColor(tint.value, [0, 1], [anchorColor, cardColor]));
    const x = useDerivedValue(() => geometry.value.x);
    const y = useDerivedValue(() => geometry.value.y - layout.canvasTop + drag.value);
    const w = useDerivedValue(() => geometry.value.width);
    const h = useDerivedValue(() => geometry.value.height);
    const r = useDerivedValue(() => geometry.value.radius);
    const nx = useDerivedValue(() => geometry.value.neckX);
    const ny = useDerivedValue(() => geometry.value.neckY - layout.canvasTop);
    const nw = useDerivedValue(() => geometry.value.neckWidth);
    const nh = useDerivedValue(() => geometry.value.neckHeight);
    const nr = useDerivedValue(() => geometry.value.neckWidth / 2);
    const opacity = useDerivedValue(() => Math.max(0, Math.min(1, expand.value)));
    const liquidOpacity = useDerivedValue(() => 1 - Math.max(0, Math.min(1, expand.value)));
    // An in-app circle is only the starting point. Left on screen after the card settled it read as a second, floating
    // Dynamic Island under the real one (2026-09-30 capture), so it fades out as the card expands and returns on exit.
    // A verified island frame stays: it covers the hardware cutout.
    const anchorOpacity = useDerivedValue(() => anchor.kind === "island"
        ? 1
        : Math.max(0, Math.min(1, drop.value * 4)) * (1 - Math.max(0, Math.min(1, expand.value))));
    const contentStyle = useAnimatedStyle(() => ({
        opacity: reveal.value,
        // Keep text at its final scale so the card does not appear to inflate during reveal.
        transform: [{ translateY: geometry.value.offsetY + drag.value }],
    }));
    useEffect(() => {
        let active = true;
        void AccessibilityInfo.isScreenReaderEnabled().then(value => { if (active)
            setReader(value); });
        void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active)
            setOsReduced(value); });
        const screen = AccessibilityInfo.addEventListener("screenReaderChanged", setReader);
        const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setOsReduced);
        return () => { active = false; screen.remove(); motion.remove(); };
    }, []);
    useEffect(() => {
        const token = ++generation.current;
        const values = [drop, expand, reveal, tint, drag];
        values.forEach(cancelAnimation);
        const phase = props.snapshot.phase;
        const settle = () => {
            entered.current = true;
            drop.value = expand.value = reveal.value = tint.value = 1;
            drag.value = 0;
            callbacks.current.onResume("presentation");
        };
        if (fallback || props.suspended) {
            settle();
            if (phase === "closing" && props.suspended)
                callbacks.current.onExitComplete();
        }
        else if (phase === "closing") {
            const complete = () => { if (generation.current === token)
                callbacks.current.onExitComplete(); };
            reveal.value = withSpring(0, recipe.spring.fade);
            expand.value = withDelay(recipe.delay.collapse, withSpring(0, recipe.spring.collapse));
            tint.value = withDelay(recipe.delay.return, withSpring(0, recipe.spring.return));
            drop.value = withDelay(recipe.delay.return, withSpring(0, recipe.spring.return, finished => {
                "worklet";
                if (finished)
                    scheduleOnRN(complete);
            }));
        }
        else if (height > 0 && props.width > 0 && !entered.current) {
            callbacks.current.onPause("presentation");
            const finishedStages = new Set();
            const finish = (stage) => {
                if (generation.current !== token)
                    return;
                finishedStages.add(stage);
                if (finishedStages.size === 3)
                    settle();
            };
            drop.value = withSpring(1, recipe.spring.drop, finished => {
                "worklet";
                if (finished)
                    scheduleOnRN(finish, "drop");
            });
            tint.value = withDelay(recipe.delay.tint, withSpring(1, recipe.spring.tint));
            expand.value = withDelay(recipe.delay.expand, withSpring(1, recipe.spring.expand, finished => {
                "worklet";
                if (finished)
                    scheduleOnRN(finish, "expand");
            }));
            reveal.value = withDelay(recipe.delay.reveal, withSpring(1, recipe.spring.reveal, finished => {
                "worklet";
                if (finished)
                    scheduleOnRN(finish, "reveal");
            }));
        }
        else if (entered.current)
            settle();
        return () => { generation.current++; values.forEach(cancelAnimation); };
    }, [drop, expand, reveal, tint, drag, fallback, props.suspended, props.snapshot.phase, height, props.width]);
    const gesture = useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponder: (_event, state) => state.dy < -6 && Math.abs(state.dy) > Math.abs(state.dx),
        onPanResponderGrant: () => callbacks.current.onPause("gesture"),
        onPanResponderMove: (_event, state) => { drag.value = Math.max(-120, Math.min(24, state.dy)); },
        onPanResponderRelease: (_event, state) => {
            callbacks.current.onResume("gesture");
            // A responder takeover may suppress the child's touch-end; release its pause as well.
            callbacks.current.onResume("pointer");
            if (state.dy < recipe.swipe.distance || state.vy * 1000 < recipe.swipe.velocity)
                callbacks.current.onDismiss("swipe");
            else
                drag.value = withSpring(0, recipe.spring.drag);
        },
        onPanResponderTerminate: () => { callbacks.current.onResume("gesture"); callbacks.current.onResume("pointer"); drag.value = withSpring(0, recipe.spring.drag); },
    }), [drag]);
    if (fallback)
        return props.fallback;
    // Only decoration is rasterized. RN text and its independent action/close stay accessible.
    return _jsxs(View, { pointerEvents: "box-none", style: { width: "100%", paddingTop: layout.cardTop, alignItems: "center" }, children: [height > 0 ? _jsx(Canvas, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", top: layout.canvasTop - canvasBleed, left: -canvasBleed, width: props.width + canvasBleed * 2, height: layout.canvasHeight + canvasBleed * 2 }, children: _jsxs(Group, { transform: [{ translateX: canvasBleed }, { translateY: canvasBleed }], children: [_jsxs(Group, { opacity: opacity, children: [_jsx(RoundedRect, { x: x, y: y, width: w, height: h, r: r, color: cardColor, children: _jsx(Shadow, { dx: 0, dy: cardShadow.offsetY, blur: shadowBlur, color: shadowColor }) }), _jsx(RoundedRect, { x: x, y: y, width: w, height: h, r: r, color: cardBorder, style: "stroke", strokeWidth: stroke.subtle })] }), _jsxs(Group, { opacity: liquidOpacity, layer: _jsxs(Paint, { children: [_jsx(Blur, { blur: recipe.blur }), _jsx(ColorMatrix, { matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, recipe.gain, -recipe.gain * recipe.threshold] })] }), children: [_jsx(Group, { opacity: anchorOpacity, children: _jsx(RoundedRect, { x: layout.anchorX + 4, y: layout.anchorY - layout.canvasTop + 4, width: Math.max(0, layout.anchorWidth - 8), height: Math.max(0, layout.anchorHeight - 8), r: layout.anchorHeight / 2, color: anchorColor }) }), _jsx(RoundedRect, { x: nx, y: ny, width: nw, height: nh, r: nr, color: anchorColor }), _jsx(RoundedRect, { x: x, y: y, width: w, height: h, r: r, color: dropletColor })] }), _jsx(Group, { opacity: anchorOpacity, children: _jsx(RoundedRect, { x: layout.anchorX, y: layout.anchorY - layout.canvasTop, width: layout.anchorWidth, height: layout.anchorHeight, r: layout.anchorHeight / 2, color: anchorColor }) })] }) }) : null, _jsx(Animated.View, { ...gesture.panHandlers, onLayout: event => setHeight(event.nativeEvent.layout.height), style: [{ width: "100%", maxWidth: recipe.maxWidth }, contentStyle], children: props.body })] });
}
//# sourceMappingURL=toast-liquid.js.map