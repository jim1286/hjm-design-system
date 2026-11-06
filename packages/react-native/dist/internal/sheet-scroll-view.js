import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { SheetBodyScrollContext, SheetScrollOwnershipContext } from "./sheet-body-scroll.js";
/** A Sheet's primary scroller lends its offset to dismissal; deeper scrollers keep their own gesture. */
export const SheetScrollView = forwardRef(function SheetScrollView({ gestureRole = "body", children, ...props }, ref) {
    const available = useContext(SheetBodyScrollContext);
    const ownership = useContext(SheetScrollOwnershipContext);
    const wiring = gestureRole === "body" ? available : null;
    const listener = useRef(props.onScroll);
    listener.current = props.onScroll;
    const forwardScroll = useCallback(event => listener.current?.(event), []);
    const nativeScroll = wiring?.scrollProps.onScroll;
    // Preserve AnimatedEvent itself so iOS offset/pinning remains on the native driver when callers track scrolling.
    const onScroll = useMemo(() => nativeScroll ? Animated.forkEvent(nativeScroll, forwardScroll) : undefined, [nativeScroll, forwardScroll]);
    useEffect(() => () => { if (nativeScroll)
        Animated.unforkEvent(nativeScroll, forwardScroll); }, [nativeScroll, forwardScroll]);
    if (!ownership)
        return _jsx(ScrollView, { ...props, ref: ref, children: children });
    // Only flex layout is mirrored onto the responder wrapper; all visual/scroll viewport props stay on the scroller.
    const layout = StyleSheet.flatten(props.style);
    const ScrollHost = wiring ? Animated.ScrollView : ScrollView;
    return _jsx(View, { ...wiring?.wrapperProps, 
        // Capture runs from outer to inner: the deepest scroller decides ownership before any responder claims it.
        onTouchStart: undefined, onTouchStartCapture: () => { if (wiring)
            wiring.wrapperProps.onTouchStart();
        else
            ownership.keepScroll(); }, style: { flexShrink: 1, minHeight: 0, ...(layout?.flex === undefined ? {} : { flex: layout.flex }),
            ...(layout?.flexGrow === undefined ? {} : { flexGrow: layout.flexGrow }),
            ...(layout?.flexBasis === undefined ? {} : { flexBasis: layout.flexBasis }) }, children: _jsx(ScrollHost, { ...props, ref: ref, scrollEnabled: props.scrollEnabled !== false && wiring?.scrollProps.scrollEnabled !== false, onLayout: event => { wiring?.scrollProps.onLayout?.(event); props.onLayout?.(event); }, 
            // RN's forkEvent returns AnimatedEvent at runtime; Animated.ScrollView accepts it, while its TS prop only lists functions.
            onScroll: (onScroll ?? props.onScroll), scrollEventThrottle: wiring ? 16 : props.scrollEventThrottle, onScrollBeginDrag: event => { wiring?.scrollProps.onScrollBeginDrag?.(event); props.onScrollBeginDrag?.(event); }, onScrollEndDrag: event => { wiring?.scrollProps.onScrollEndDrag?.(event); props.onScrollEndDrag?.(event); }, children: _jsx(SheetBodyScrollContext.Provider, { value: null, children: wiring ? _jsx(Animated.View, { style: [{ flexGrow: 1 }, wiring.contentStyle], children: children }) : children }) }) });
});
//# sourceMappingURL=sheet-scroll-view.js.map