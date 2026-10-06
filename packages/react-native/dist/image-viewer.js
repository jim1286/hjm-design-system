import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccessibilityInfo, Image, Modal, Platform, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery } from "react-native-zoom-toolkit";
import { containerDefaults, containerRecipe } from "@hjmds/design-contracts/components/container";
import { Button } from "./actions.js";
import { SegmentedControl } from "./inputs.js";
import { ImageInspection } from "./internal/image-inspection.js";
import { Surface, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function ViewerImage({ item, width, height, renderImage, onImageStatusChange }) {
    const [status, setStatus] = useState("loading");
    const currentStatus = useRef("loading");
    const alive = useRef(false);
    const notify = useRef(onImageStatusChange);
    useLayoutEffect(() => { notify.current = onImageStatusChange; });
    useLayoutEffect(() => {
        alive.current = true;
        return () => { alive.current = false; };
    }, []);
    useEffect(() => { notify.current?.({ item, status }); }, [item.id, item.uri, status]);
    const report = (next) => {
        // Failure is terminal until explicit retry. Some native hosts can emit both
        // load/display and error callbacks for an old request; the last one must not win.
        if (!alive.current || currentStatus.current === "error" || currentStatus.current === next)
            return;
        currentStatus.current = next;
        setStatus(next);
    };
    const onReady = () => report("ready");
    const onError = () => report("error");
    return _jsx(View, { style: { width, height, justifyContent: "center" }, children: renderImage ? renderImage({ item, width, height, onReady, onError }) :
            _jsx(Image, { source: { uri: item.uri }, accessibilityLabel: item.label, resizeMode: "contain", style: { width, height }, onLoad: onReady, onError: onError }) });
}
/** Unmount the session on close so every open starts at the requested image. */
export function ImageViewer(props) {
    if (!props.open)
        return null;
    if (!props.items.length || new Set(props.items.map(item => item.id)).size !== props.items.length ||
        props.items.some(item => !item.id.trim() || !item.uri.trim() || !item.label.trim()) ||
        [props.closeLabel, props.previousLabel, props.nextLabel, props.loadingLabel, props.errorLabel, props.retryLabel].some(label => !label.trim()) ||
        !Number.isInteger(props.initialIndex ?? 0) || (props.initialIndex ?? 0) < 0 || (props.initialIndex ?? 0) >= props.items.length) {
        throw new TypeError("ImageViewer needs named images, localized controls and a valid index");
    }
    if (props.inspection) {
        if (!["fit", "double", "pixels"].includes(props.inspection.mode) ||
            Object.values(props.inspection.labels).some(label => !label.trim()) ||
            props.items.some(item => !Number.isFinite(item.width) || !Number.isFinite(item.height) || (item.width ?? 0) <= 0 || (item.height ?? 0) <= 0)) {
            throw new TypeError("Image inspection requires a valid mode, labels and intrinsic image sizes");
        }
    }
    // Structured identity avoids delimiter collisions in product IDs/URIs. A replaced
    // collection must retire image callbacks as well as reset the gesture engine.
    return _jsx(ImageViewerSession, { ...props }, JSON.stringify(props.items.map(item => [item.id, item.uri, item.width, item.height])));
}
function ImageViewerSession(props) {
    const theme = useHjmNativeTheme();
    const gutter = containerRecipe.gutters[containerDefaults.gutter];
    // Landscape cutouts are physical edges, independent of text direction. Keep
    // controls inside them while the photograph can use the full gallery width.
    const controlInsets = {
        paddingLeft: gutter + (props.safeAreaInsets.left ?? 0),
        paddingRight: gutter + (props.safeAreaInsets.right ?? 0),
    };
    const { width, height } = useWindowDimensions();
    // Measure remaining space after controls and safe areas; a screen-height ratio clips large text.
    const [viewport, setViewport] = useState({ width, height: height * 0.6 });
    const [index, setIndex] = useState(props.initialIndex ?? 0);
    const [galleryKey, setGalleryKey] = useState(0);
    const [statuses, setStatuses] = useState(new Map());
    const currentIndex = Math.min(index, props.items.length - 1);
    const change = (next) => { setIndex(next); props.onIndexChange?.(next); };
    // Accessible buttons remount at the selected index; paging must not require a swipe.
    // Gallery uses a short paging transition; reduced motion removes it entirely.
    const resetImages = () => { setStatuses(new Map()); setGalleryKey(value => value + 1); };
    const navigate = (next) => { change(next); resetImages(); };
    const currentStatus = statuses.get(props.items[currentIndex].id) ?? "loading";
    useEffect(() => {
        if (currentStatus === "error" && Platform.OS === "ios")
            AccessibilityInfo.announceForAccessibility(props.errorLabel);
    }, [currentStatus, currentIndex, props.errorLabel]);
    const reportImageStatus = (event) => {
        setStatuses(previous => new Map(previous).set(event.item.id, event.status));
        props.onImageStatusChange?.(event);
    };
    return _jsx(Modal, { visible: true, presentationStyle: "fullScreen", supportedOrientations: props.supportedOrientations, animationType: theme.environment.reducedMotion ? "none" : "fade", onRequestClose: props.onClose, children: _jsx(GestureHandlerRootView, { style: { flex: 1, backgroundColor: theme.colors.bg }, children: _jsxs(View, { accessibilityViewIsModal: true, style: { flex: 1, paddingTop: props.safeAreaInsets.top, paddingBottom: props.safeAreaInsets.bottom }, children: [_jsx(View, { style: controlInsets, children: _jsx(Button, { growWithContent: true, onPress: props.onClose, children: props.closeLabel }) }), props.inspection ? _jsx(View, { style: controlInsets, children: _jsx(SegmentedControl, { label: props.inspection.labels.mode, value: props.inspection.mode, onValueChange: props.inspection.onModeChange, items: [{ value: "fit", label: props.inspection.labels.fit }, { value: "double", label: props.inspection.labels.double }, { value: "pixels", label: props.inspection.labels.pixels }] }) }) : null, props.inspection ? _jsx(ImageInspection, { config: props.inspection, imageSize: { width: props.items[currentIndex].width, height: props.items[currentIndex].height }, controlsInset: controlInsets, feedbackLabels: { loading: props.loadingLabel, error: props.errorLabel, retry: props.retryLabel }, renderImage: (width, height, report) => _jsx(ViewerImage, { item: props.items[currentIndex], width: width, height: height, renderImage: props.renderImage, onImageStatusChange: event => { report(event.status); reportImageStatus(event); } }) }, `${currentIndex}:${props.inspection.mode}`) : _jsxs(View, { style: { flex: 1 }, onLayout: event => { const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout; if (measuredWidth > 0 && measuredHeight > 0)
                            setViewport({ width: measuredWidth, height: measuredHeight }); }, children: [_jsx(Gallery, { data: [...props.items], initialIndex: currentIndex, keyExtractor: item => item.id, rtl: theme.environment.direction === "rtl", onIndexChange: change, snapTimingConfig: { duration: theme.environment.reducedMotion ? 0 : 250 }, renderItem: item => _jsx(ViewerImage, { item: item, width: viewport.width, height: viewport.height, renderImage: props.renderImage, onImageStatusChange: reportImageStatus }, item.uri) }, galleryKey), currentStatus !== "ready" ? _jsx(View, { pointerEvents: "box-none", style: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", ...controlInsets }, children: _jsx(Surface, { padding: "md", children: currentStatus === "error" ? _jsxs(View, { children: [_jsx(Text, { accessibilityLiveRegion: "assertive", children: props.errorLabel }), _jsx(Button, { growWithContent: true, onPress: resetImages, children: props.retryLabel })] })
                                        : _jsx(Text, { accessibilityLiveRegion: "polite", children: props.loadingLabel }) }) }) : null] }), _jsxs(View, { style: { gap: theme.tokens.spacing.xs, ...controlInsets, paddingTop: theme.tokens.spacing.sm }, children: [_jsx(Text, { accessibilityLiveRegion: "polite", children: props.items[currentIndex]?.label }), (!props.inspection || props.items.length > 1) ? _jsxs(_Fragment, { children: [_jsx(Button, { growWithContent: true, disabled: currentIndex === 0, onPress: () => navigate(currentIndex - 1), children: props.previousLabel }), _jsx(Button, { growWithContent: true, disabled: currentIndex >= props.items.length - 1, onPress: () => navigate(currentIndex + 1), children: props.nextLabel })] }) : null] })] }) }) });
}
//# sourceMappingURL=image-viewer.js.map