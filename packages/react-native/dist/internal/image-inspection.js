import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { ResumableZoom } from "react-native-zoom-toolkit";
import { resolveImageInspectionGeometry } from "@hjmds/design-contracts/components/image";
import { Button } from "../actions.js";
import { Surface, Text } from "../primitives.js";
/** Internal exact-size viewport; the parent owns lifetime, modes, feedback and image readiness. */
export function ImageInspection({ imageSize, config, controlsInset, feedbackLabels, renderImage }) {
    const ref = useRef(null);
    const [viewport, setViewport] = useState({ width: 0, height: 0 });
    const [attempt, setAttempt] = useState(0);
    const geometry = viewport.width > 0 && viewport.height > 0
        ? resolveImageInspectionGeometry(imageSize, viewport, config.mode) : null;
    const key = JSON.stringify([viewport.width, viewport.height, config.mode, attempt]);
    const identity = useMemo(() => ({}), [key]);
    const active = useRef(null);
    useLayoutEffect(() => {
        active.current = identity;
        return () => { active.current = null; };
    }, [identity]);
    const [reported, setReported] = useState(null);
    const [position, setPosition] = useState({ identity, x: 0, y: 0 });
    const status = reported?.identity === identity ? reported.status : "loading";
    const ready = status === "ready";
    function commitPosition(x, y) {
        if (active.current !== identity)
            return;
        setPosition({ identity, x, y });
        // iOS does not read React Native live regions; announce only completed user
        // movements, never every animation frame or initial layout measurement.
        if (Platform.OS === "ios")
            AccessibilityInfo.announceForAccessibility(config.getPositionText({
                x, y, maxX: geometry?.panBounds.x ?? 0, maxY: geometry?.panBounds.y ?? 0,
            }));
    }
    function move(dx, dy) {
        const current = ref.current?.getState();
        if (!current || !ready || !geometry)
            return;
        // Viewport-sized steps retain 20% context for inspecting seams; stepping a
        // whole image width would skip detail. Physical directions do not mirror in RTL.
        const x = Math.max(-geometry.panBounds.x, Math.min(geometry.panBounds.x, current.translateX - dx * viewport.width * 0.8));
        const y = Math.max(-geometry.panBounds.y, Math.min(geometry.panBounds.y, current.translateY - dy * viewport.height * 0.8));
        ref.current?.setTransformState({ translateX: x, translateY: y, scale: 1 }, false);
        commitPosition(-x, -y);
    }
    function center() {
        if (!ready)
            return;
        ref.current?.reset(false);
        commitPosition(0, 0);
    }
    const positionText = config.getPositionText({ x: position.identity === identity ? position.x : 0,
        y: position.identity === identity ? position.y : 0,
        maxX: geometry?.panBounds.x ?? 0, maxY: geometry?.panBounds.y ?? 0 });
    if (!positionText.trim())
        throw new TypeError("Image inspection position text must not be empty");
    return _jsxs(View, { style: { flex: 1, minHeight: 0 }, children: [_jsxs(View, { style: { flex: 1, minHeight: 0, overflow: "hidden" }, onLayout: event => {
                    const { width, height } = event.nativeEvent.layout;
                    if (width >= 0 && height >= 0)
                        setViewport({ width, height });
                }, children: [geometry ? _jsx(ResumableZoom, { ref: ref, style: { flex: 1 }, minScale: 1, maxScale: 1, pinchEnabled: false, tapsEnabled: false, panEnabled: ready, panMode: "clamp", onGestureEnd: () => {
                            const current = ref.current?.getState();
                            if (current)
                                commitPosition(-current.translateX, -current.translateY);
                        }, children: renderImage(geometry.width, geometry.height, status => setReported({ identity, status })) }, key) : null, status !== "ready" ? _jsx(View, { pointerEvents: "box-none", style: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", ...controlsInset }, children: _jsxs(Surface, { padding: "md", children: [_jsx(Text, { accessibilityLiveRegion: status === "error" ? "assertive" : "polite", children: status === "error" ? feedbackLabels.error : feedbackLabels.loading }), status === "error" ? _jsx(Button, { growWithContent: true, onPress: () => setAttempt(value => value + 1), children: feedbackLabels.retry }) : null] }) }) : null] }), _jsxs(View, { style: controlsInset, children: [_jsxs(View, { style: { flexDirection: "row", flexWrap: "wrap" }, children: [_jsx(Button, { growWithContent: true, tone: "ghost", disabled: !ready || !geometry?.panBounds.x, onPress: () => move(-1, 0), children: config.labels.left }), _jsx(Button, { growWithContent: true, tone: "ghost", disabled: !ready || !geometry?.panBounds.x, onPress: () => move(1, 0), children: config.labels.right }), _jsx(Button, { growWithContent: true, tone: "ghost", disabled: !ready || !geometry?.panBounds.y, onPress: () => move(0, -1), children: config.labels.up }), _jsx(Button, { growWithContent: true, tone: "ghost", disabled: !ready || !geometry?.panBounds.y, onPress: () => move(0, 1), children: config.labels.down }), _jsx(Button, { growWithContent: true, tone: "ghost", disabled: !ready, onPress: center, children: config.labels.center })] }), _jsx(Text, { accessibilityLiveRegion: "polite", accessibilityLabel: positionText, numberOfLines: 1, variant: "caption", children: positionText })] })] });
}
//# sourceMappingURL=image-inspection.js.map