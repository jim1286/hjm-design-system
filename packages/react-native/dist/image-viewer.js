import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Image, Modal, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery } from "react-native-zoom-toolkit";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function ViewerImage({ item, width, height, loadingLabel, errorLabel, retryLabel }) {
    const [status, setStatus] = useState("loading");
    const [attempt, setAttempt] = useState(0);
    let feedback = null;
    if (status === "loading")
        feedback = _jsx(Text, { accessibilityLiveRegion: "polite", children: loadingLabel });
    if (status === "error")
        feedback = _jsxs(View, { children: [_jsx(Text, { children: errorLabel }), _jsx(Button, { onPress: () => { setStatus("loading"); setAttempt(value => value + 1); }, children: retryLabel })] });
    return _jsxs(View, { style: { width, height, justifyContent: "center" }, children: [_jsx(Image, { source: { uri: item.uri }, accessibilityLabel: item.label, resizeMode: "contain", style: { width, height }, onLoad: () => setStatus("ready"), onError: () => setStatus("error") }, `${item.uri}:${attempt}`), feedback ? _jsx(View, { style: { position: "absolute", alignSelf: "center" }, children: feedback }) : null] });
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
    // A replaced collection starts a fresh session; stale indexes must not reach the gesture engine.
    return _jsx(ImageViewerSession, { ...props }, props.items.map(item => `${item.id}:${item.uri}`).join("|"));
}
function ImageViewerSession(props) {
    const theme = useHjmNativeTheme();
    const { width, height } = useWindowDimensions();
    // Measure remaining space after controls and safe areas; a screen-height ratio clips large text.
    const [viewport, setViewport] = useState({ width, height: height * 0.6 });
    const [index, setIndex] = useState(props.initialIndex ?? 0);
    const [galleryKey, setGalleryKey] = useState(0);
    const currentIndex = Math.min(index, props.items.length - 1);
    const change = (next) => { setIndex(next); props.onIndexChange?.(next); };
    // Accessible buttons remount at the selected index; paging must not require a swipe.
    // Gallery uses a short paging transition; reduced motion removes it entirely.
    const navigate = (next) => { change(next); setGalleryKey(value => value + 1); };
    return _jsx(Modal, { visible: true, animationType: theme.environment.reducedMotion ? "none" : "fade", onRequestClose: props.onClose, children: _jsx(GestureHandlerRootView, { style: { flex: 1, backgroundColor: theme.colors.bg }, children: _jsxs(View, { accessibilityViewIsModal: true, style: { flex: 1, paddingTop: props.safeAreaInsets.top, paddingBottom: props.safeAreaInsets.bottom }, children: [_jsx(Button, { onPress: props.onClose, children: props.closeLabel }), _jsx(View, { style: { flex: 1 }, onLayout: event => { const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout; if (measuredWidth > 0 && measuredHeight > 0)
                            setViewport({ width: measuredWidth, height: measuredHeight }); }, children: _jsx(Gallery, { data: [...props.items], initialIndex: currentIndex, keyExtractor: item => item.id, rtl: theme.environment.direction === "rtl", onIndexChange: change, snapTimingConfig: { duration: theme.environment.reducedMotion ? 0 : 250 }, renderItem: item => _jsx(ViewerImage, { item: item, width: viewport.width, height: viewport.height, loadingLabel: props.loadingLabel, errorLabel: props.errorLabel, retryLabel: props.retryLabel }, item.uri) }, galleryKey) }), _jsx(Text, { accessibilityLiveRegion: "polite", children: props.items[currentIndex]?.label }), _jsx(Button, { disabled: currentIndex === 0, onPress: () => navigate(currentIndex - 1), children: props.previousLabel }), _jsx(Button, { disabled: currentIndex >= props.items.length - 1, onPress: () => navigate(currentIndex + 1), children: props.nextLabel })] }) }) });
}
//# sourceMappingURL=image-viewer.js.map