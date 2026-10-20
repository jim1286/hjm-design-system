import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccessibilityInfo, AppState, PanResponder, Pressable, ScrollView, View } from "react-native";
import { carouselRecipe, resolveCarouselDescriptor, getCarouselNavigationTarget, isCarouselAutoplayActive, resolvePageIndicator, getPageIndicatorTarget, } from "@hjmds/design-contracts/components/carousel";
import { Button, IconButton } from "./actions.js";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { glyph } from "@hjmds/design-contracts/foundations";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { useControllableState } from "./internal/state.js";
/**
 * Carousel's position dots for a product-owned pager. The row is one adjustable element, like a platform page
 * control, so a screen reader hears "label: page name" and swipes up/down to move; each dot is a 44pt target.
 */
export function PageIndicator({ label, count, currentIndex, maxVisibleDots, interactive = true, onCurrentIndexChange, composeAccessibleName, labels, layoutStyle, testID }) {
    const { palette } = useHjmNativeTheme();
    if (!label.trim() || !labels.previous.trim() || !labels.next.trim())
        throw new TypeError("PageIndicator labels must not be empty");
    const descriptor = { count, currentIndex, ...(maxVisibleDots === undefined ? {} : { maxVisibleDots }) };
    const dots = resolvePageIndicator(descriptor, composeAccessibleName);
    const current = dots.find(dot => dot.current);
    const move = (intent) => onCurrentIndexChange(getPageIndicatorTarget(descriptor, intent));
    if (!interactive)
        return _jsx(View, { testID: testID, accessible: true, accessibilityRole: "image", accessibilityLabel: current.accessibleName, style: [{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: carouselRecipe.dot.compactGap }, layoutStyle], children: dots.map(dot => _jsx(View, { accessible: false, style: { width: carouselRecipe.dot.diameter, height: carouselRecipe.dot.diameter,
                    borderRadius: carouselRecipe.dot.diameter / 2,
                    backgroundColor: resolveColorReference(dot.current ? carouselRecipe.dot.color.current : carouselRecipe.dot.color.inactive, palette) } }, dot.index)) });
    return _jsx(View, { testID: testID, accessible: true, accessibilityRole: "adjustable", accessibilityLabel: `${label}: ${current.accessibleName}`, accessibilityValue: { min: 1, max: count, now: current.position, text: current.accessibleName }, accessibilityActions: [{ name: "increment", label: labels.next }, { name: "decrement", label: labels.previous }], onAccessibilityAction: ({ nativeEvent }) => { if (nativeEvent.actionName === "increment")
            move("next"); if (nativeEvent.actionName === "decrement")
            move("previous"); }, style: [{ flexDirection: "row", flexShrink: 1, flexWrap: "wrap", justifyContent: "center" }, layoutStyle], children: dots.map((dot) => _jsx(Pressable, { accessible: false, accessibilityLabel: dot.accessibleName, onPress: () => onCurrentIndexChange(dot.index), style: { alignItems: "center", height: carouselRecipe.dot.hitTarget, justifyContent: "center", width: carouselRecipe.dot.hitTarget }, children: _jsx(View, { style: { backgroundColor: resolveColorReference(dot.current ? carouselRecipe.dot.color.current : carouselRecipe.dot.color.inactive, palette), borderRadius: carouselRecipe.dot.diameter / 2, height: carouselRecipe.dot.diameter, width: carouselRecipe.dot.diameter } }) }, dot.index)) });
}
export function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay, currentKey, defaultCurrentKey, onCurrentKeyChange, layoutStyle, swipeEnabled = true, slideMaxHeight }) {
    const { environment, palette, tokens } = useHjmNativeTheme();
    const [storedCurrent, setCurrent] = useControllableState({
        ...(currentKey === undefined ? {} : { value: currentKey }),
        defaultValue: defaultCurrentKey ?? slides[0]?.id ?? "",
        ...(onCurrentKeyChange === undefined ? {} : { onChange: onCurrentKeyChange }),
    });
    const previousIndex = useRef(null);
    // A host can delete the current uncontrolled slide after mount. Keep its place
    // in the collection (or the new last slide); explicit invalid keys still fail validation.
    const recovering = currentKey === undefined && previousIndex.current !== null && !slides.some(slide => slide.id === storedCurrent);
    const current = recovering ? slides[Math.min(previousIndex.current, slides.length - 1)]?.id ?? storedCurrent : storedCurrent;
    useLayoutEffect(() => {
        previousIndex.current = slides.findIndex(slide => slide.id === current);
        if (recovering)
            setCurrent(current);
    }, [current, recovering, slides, setCurrent]);
    const descriptor = { slides, currentKey: current, ...(autoplay ? { autoplay } : {}) };
    const resolved = resolveCarouselDescriptor(descriptor, { composeAccessibleName });
    if (!label.trim() || Object.values(labels).some((value) => !value.trim()))
        throw new TypeError("Carousel labels must not be empty");
    if (slideMaxHeight !== undefined && (!Number.isFinite(slideMaxHeight) || slideMaxHeight <= 0))
        throw new TypeError("Carousel slideMaxHeight must be finite and positive");
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
    const chevronColor = resolveIconButtonPresentation("ghost", palette, false).content;
    return _jsxs(View, { style: [{ gap: carouselRecipe.sizes.medium.gap, direction: environment.direction }, layoutStyle], children: [autoplay ? _jsx(Button, { tone: "ghost", disabled: environment.reducedMotion || screenReader, onPress: () => { if (last)
                    setCurrent(slides[0].id); setRotating(!rotating || last); }, children: rotating && !last && !environment.reducedMotion && !screenReader ? labels.pause : labels.resume }) : null, _jsx(View, { ...(swipeEnabled ? swipe.panHandlers : {}), onTouchStart: () => setRotating(false), onFocus: () => setRotating(false), children: resolved.map((slide) => _jsx(View, { style: slide.inert ? { display: "none" } : undefined, accessibilityElementsHidden: slide.inert, importantForAccessibility: slide.inert ? "no-hide-descendants" : "auto", pointerEvents: slide.inert ? "none" : "auto", children: slideMaxHeight === undefined ? renderSlide(slide) : _jsx(ScrollView, { style: { maxHeight: slideMaxHeight, flexGrow: 0 }, children: renderSlide(slide) }) }, slide.id)) }), _jsxs(View, { accessibilityLabel: labels.navigation, onFocus: () => setRotating(false), style: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: tokens.spacing.xs }, children: [_jsx(IconButton, { label: labels.previous, tone: "ghost", disabled: current === slides[0].id, onPress: () => move("previous"), children: _jsx(DrawnChevron, { direction: "start", size: glyph[carouselRecipe.sizes.medium.controlIcon], color: chevronColor }) }), _jsx(PageIndicator, { label: label, count: slides.length, currentIndex: selected.position - 1, composeAccessibleName: ({ position }) => resolved[position - 1].accessibleName, labels: { previous: labels.previous, next: labels.next }, onCurrentIndexChange: (index) => select(slides[index].id) }), _jsx(IconButton, { label: labels.next, tone: "ghost", disabled: last, onPress: () => move("next"), children: _jsx(DrawnChevron, { direction: "end", size: glyph[carouselRecipe.sizes.medium.controlIcon], color: chevronColor }) })] })] });
}
//# sourceMappingURL=carousel.js.map