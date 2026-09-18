import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, AppState, PanResponder, View } from "react-native";
import { carouselRecipe, resolveCarouselDescriptor, getCarouselNavigationTarget, isCarouselAutoplayActive, } from "@hjmds/design-contracts/components/carousel";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { useControllableState } from "./internal/state.js";
export function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay, currentKey, defaultCurrentKey, onCurrentKeyChange, style }) {
    const { environment, tokens } = useHjmNativeTheme();
    const [current, setCurrent] = useControllableState({
        ...(currentKey === undefined ? {} : { value: currentKey }),
        defaultValue: defaultCurrentKey ?? slides[0]?.id ?? "",
        ...(onCurrentKeyChange === undefined ? {} : { onChange: onCurrentKeyChange }),
    });
    const descriptor = { slides, currentKey: current, ...(autoplay ? { autoplay } : {}) };
    const resolved = resolveCarouselDescriptor(descriptor, { composeAccessibleName });
    if (!label.trim() || Object.values(labels).some((value) => !value.trim()))
        throw new TypeError("Carousel labels must not be empty");
    const [rotating, setRotating] = useState(autoplay !== undefined);
    const [foreground, setForeground] = useState(AppState.currentState === "active");
    // Wait for the platform's answer before rotating: a screen reader can explore
    // content without moving keyboard focus, so focus handlers alone are insufficient.
    const [screenReader, setScreenReader] = useState(true);
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => { if (alive.current)
            setScreenReader(enabled); }, () => { });
        const reader = AccessibilityInfo.addEventListener("screenReaderChanged", setScreenReader);
        const app = AppState.addEventListener("change", (state) => setForeground(state === "active"));
        return () => { alive.current = false; reader.remove(); app.remove(); };
    }, []);
    const last = current === slides.at(-1).id;
    const playing = isCarouselAutoplayActive(autoplay, { reducedMotion: environment.reducedMotion, paused: !rotating || !foreground || screenReader || last });
    useEffect(() => {
        if (!playing || !autoplay)
            return;
        const timer = setTimeout(() => setCurrent(getCarouselNavigationTarget(descriptor, "next")), autoplay.intervalMs);
        return () => clearTimeout(timer);
    }, [playing, autoplay?.intervalMs, current, slides, setCurrent]);
    function select(key) {
        setRotating(false);
        if (key === current)
            return;
        setCurrent(key);
        if (screenReader)
            AccessibilityInfo.announceForAccessibility(resolved.find((slide) => slide.id === key).accessibleName);
    }
    function move(intent) { select(getCarouselNavigationTarget(descriptor, intent)); }
    const swipe = PanResponder.create({
        // A horizontal, deliberate gesture yields vertical scrolling and simple taps
        // to card content. The control target token supplies the one-slide threshold.
        onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > carouselRecipe.dot.hitTarget / 2 && Math.abs(dx) > Math.abs(dy),
        onPanResponderGrant: () => setRotating(false),
        onPanResponderRelease: (_, { dx }) => {
            if (Math.abs(dx) >= carouselRecipe.dot.hitTarget)
                move((dx < 0) !== (environment.direction === "rtl") ? "next" : "previous");
        },
    });
    const selected = resolved.find((slide) => slide.current);
    return _jsxs(View, { style: [{ gap: carouselRecipe.sizes.medium.gap, direction: environment.direction }, style], children: [autoplay ? _jsx(Button, { tone: "ghost", disabled: environment.reducedMotion || screenReader, onPress: () => { if (last)
                    setCurrent(slides[0].id); setRotating(!rotating || last); }, children: rotating && !last && !environment.reducedMotion && !screenReader ? labels.pause : labels.resume }) : null, _jsx(View, { ...swipe.panHandlers, onTouchStart: () => setRotating(false), onFocus: () => setRotating(false), children: resolved.map((slide) => _jsx(View, { style: slide.inert ? { display: "none" } : undefined, accessibilityElementsHidden: slide.inert, importantForAccessibility: slide.inert ? "no-hide-descendants" : "auto", pointerEvents: slide.inert ? "none" : "auto", children: renderSlide(slide) }, slide.id)) }), _jsx(View, { accessible: true, accessibilityRole: "adjustable", accessibilityLabel: `${label}: ${selected.accessibleName}`, accessibilityValue: { min: 1, max: slides.length, now: selected.position, text: selected.accessibleName }, accessibilityActions: [{ name: "increment", label: labels.next }, { name: "decrement", label: labels.previous }], onAccessibilityAction: ({ nativeEvent }) => { if (nativeEvent.actionName === "increment")
                    move("next"); if (nativeEvent.actionName === "decrement")
                    move("previous"); }, children: _jsx(Text, { align: "center", variant: "caption", children: selected.accessibleName }) }), _jsxs(View, { accessibilityLabel: labels.navigation, onFocus: () => setRotating(false), style: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs, justifyContent: "center" }, children: [_jsx(Button, { tone: "ghost", disabled: current === slides[0].id, onPress: () => move("previous"), children: labels.previous }), resolved.map((slide) => _jsx(Button, { tone: slide.current ? "secondary" : "ghost", accessibilityLabel: slide.accessibleName, accessibilityState: { selected: slide.current }, onPress: () => select(slide.id), children: String(slide.position) }, slide.id)), _jsx(Button, { tone: "ghost", disabled: last, onPress: () => move("next"), children: labels.next })] })] });
}
//# sourceMappingURL=carousel.js.map