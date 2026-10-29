import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Image, Modal, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { circularPhotoCoverScale, circularPhotoCropRecipe, resolveCircularPhotoCrop, } from "@hjmds/design-contracts/components/image";
import { Button } from "../actions.js";
import { Stack, Text } from "../primitives.js";
import { HjmNativeProvider } from "../provider.js";
/**
 * Instagram-style circular framing for profile photos (2026-10-29 user rule, all apps): drag to move and pinch to zoom
 * inside a circular mask on the black photo surface. HJM owns the gestures, clamping and mask; the product owns picking,
 * cropping and upload.
 */
export function CircularPhotoCropper(props) {
    if (!props.open)
        return null;
    if ([props.title, props.confirmLabel, props.cancelLabel].some(label => !label.trim()) || !props.source.uri.trim() ||
        !(props.source.width > 0 && props.source.height > 0))
        throw new TypeError("CircularPhotoCropper needs labels and a sized source");
    // Same black surface as ImageViewer in every theme.
    return _jsx(HjmNativeProvider, { theme: "dark", brandPalette: { dark: { bg: "#000000" } }, children: _jsx(CropSession, { ...props }, props.source.uri) });
}
function CropSession({ source, title, hint, confirmLabel, cancelLabel, busy = false, safeAreaInsets, onCancel, onConfirm }) {
    const { width, height } = useWindowDimensions();
    const viewport = Math.max(1, Math.min(width - circularPhotoCropRecipe.gutter * 2, height * 0.55));
    const cover = circularPhotoCoverScale(source.width, source.height, viewport);
    const displayW = source.width * cover, displayH = source.height * cover;
    const maxZoom = circularPhotoCropRecipe.maxZoom;
    const zoom = useSharedValue(1), x = useSharedValue(0), y = useSharedValue(0);
    const start = useSharedValue({ zoom: 1, x: 0, y: 0 });
    const [measuredStage, setStage] = useState(false);
    // Worklet copy of clampCircularPhotoCrop (the contract function is plain JS and cannot run on the UI thread).
    const settle = () => {
        "worklet";
        const z = Math.min(maxZoom, Math.max(1, zoom.value));
        const limitX = Math.max(0, (displayW * z - viewport) / 2), limitY = Math.max(0, (displayH * z - viewport) / 2);
        zoom.value = withTiming(z);
        x.value = withTiming(Math.min(limitX, Math.max(-limitX, x.value)));
        y.value = withTiming(Math.min(limitY, Math.max(-limitY, y.value)));
    };
    const pan = Gesture.Pan().onStart(() => { start.value = { zoom: zoom.value, x: x.value, y: y.value }; })
        .onUpdate(event => { x.value = start.value.x + event.translationX; y.value = start.value.y + event.translationY; })
        .onEnd(settle);
    const pinch = Gesture.Pinch().onStart(() => { start.value = { zoom: zoom.value, x: x.value, y: y.value }; })
        .onUpdate(event => {
        const next = Math.min(maxZoom * 1.2, Math.max(0.8, start.value.zoom * event.scale));
        // Zoom around the circle centre: offsets scale with the photo.
        x.value = start.value.x * next / start.value.zoom;
        y.value = start.value.y * next / start.value.zoom;
        zoom.value = next;
    })
        .onEnd(settle);
    const photoStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { scale: zoom.value }] }));
    // A ring this wide covers the stage around the circle; its inner edge is the circle (no SVG peer needed).
    const ring = Math.max(width, height);
    return _jsx(Modal, { visible: true, transparent: false, animationType: "fade", onRequestClose: () => { if (!busy)
            onCancel(); }, statusBarTranslucent: true, children: _jsx(GestureHandlerRootView, { style: { flex: 1, backgroundColor: "#000000" }, children: _jsxs(View, { style: { flex: 1, paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }, children: [_jsx(View, { style: { paddingHorizontal: circularPhotoCropRecipe.gutter, paddingVertical: 12 }, children: _jsx(Text, { variant: "title", align: "center", accessibilityRole: "header", children: title }) }), _jsx(GestureDetector, { gesture: Gesture.Simultaneous(pan, pinch), children: _jsxs(View, { style: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" }, onLayout: () => setStage(true), accessible: true, accessibilityLabel: hint ?? title, children: [_jsx(Animated.View, { style: [{ width: displayW, height: displayH }, photoStyle], pointerEvents: "none", children: _jsx(Image, { source: { uri: source.uri }, style: { width: displayW, height: displayH }, accessible: false }) }), measuredStage ? _jsx(View, { pointerEvents: "none", style: {
                                        position: "absolute", width: viewport + ring * 2, height: viewport + ring * 2, borderRadius: viewport / 2 + ring,
                                        borderWidth: ring, borderColor: `rgba(0,0,0,${circularPhotoCropRecipe.maskOpacity})`,
                                    } }) : null, _jsx(View, { pointerEvents: "none", style: { position: "absolute", width: viewport, height: viewport, borderRadius: viewport / 2,
                                        borderWidth: circularPhotoCropRecipe.ringWidth, borderColor: "rgba(255,255,255,0.7)" } })] }) }), _jsx(View, { style: { paddingHorizontal: circularPhotoCropRecipe.gutter, paddingTop: 12 }, children: _jsxs(Stack, { gap: "sm", children: [hint ? _jsx(Text, { variant: "caption", tone: "muted", align: "center", children: hint }) : null, _jsxs(Stack, { axis: "inline", gap: "sm", children: [_jsx(View, { style: { flex: 1 }, children: _jsx(Button, { tone: "secondary", fullWidth: true, disabled: busy, onPress: onCancel, children: cancelLabel }) }), _jsx(View, { style: { flex: 1 }, children: _jsx(Button, { tone: "primary", fullWidth: true, loading: busy, disabled: busy, onPress: () => onConfirm(resolveCircularPhotoCrop({ zoom: zoom.value, x: x.value, y: y.value }, source.width, source.height, viewport)), children: confirmLabel }) })] })] }) })] }) }) });
}
//# sourceMappingURL=circular-photo-cropper.js.map