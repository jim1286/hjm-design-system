import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, type ComponentRef } from "react";
import { Animated, ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
import { SheetBodyScrollContext, SheetScrollOwnershipContext } from "./sheet-body-scroll.js";

export type SheetScrollViewProps = ScrollViewProps & Readonly<{
  /** Value-changing wheels and inner code panes keep the whole gesture, including at their top. */
  gestureRole?: "body" | "input";
}>;

/** A Sheet's primary scroller lends its offset to dismissal; deeper scrollers keep their own gesture. */
export const SheetScrollView = forwardRef<ComponentRef<typeof ScrollView>, SheetScrollViewProps>(function SheetScrollView(
  { gestureRole = "body", children, ...props }, ref,
) {
  const available = useContext(SheetBodyScrollContext);
  const ownership = useContext(SheetScrollOwnershipContext);
  const wiring = gestureRole === "body" ? available : null;
  const listener = useRef(props.onScroll);
  listener.current = props.onScroll;
  const forwardScroll = useCallback<NonNullable<ScrollViewProps["onScroll"]>>(event => listener.current?.(event), []);
  const nativeScroll = wiring?.scrollProps.onScroll;
  // Preserve AnimatedEvent itself so iOS offset/pinning remains on the native driver when callers track scrolling.
  const onScroll = useMemo(() => nativeScroll ? Animated.forkEvent(nativeScroll, forwardScroll) : undefined, [nativeScroll, forwardScroll]);
  useEffect(() => () => { if (nativeScroll) Animated.unforkEvent(nativeScroll, forwardScroll); }, [nativeScroll, forwardScroll]);
  if (!ownership) return <ScrollView {...props} ref={ref}>{children}</ScrollView>;
  // Only flex layout is mirrored onto the responder wrapper; all visual/scroll viewport props stay on the scroller.
  const layout = StyleSheet.flatten(props.style as StyleProp<Pick<ViewStyle, "flex" | "flexGrow" | "flexBasis">>);
  const ScrollHost = wiring ? Animated.ScrollView : ScrollView;
  return <View {...wiring?.wrapperProps}
    // Capture runs from outer to inner: the deepest scroller decides ownership before any responder claims it.
    onTouchStart={undefined}
    onTouchStartCapture={() => { if (wiring) wiring.wrapperProps.onTouchStart(); else ownership.keepScroll(); }}
    style={{ flexShrink: 1, minHeight: 0, ...(layout?.flex === undefined ? {} : { flex: layout.flex }),
      ...(layout?.flexGrow === undefined ? {} : { flexGrow: layout.flexGrow }),
      ...(layout?.flexBasis === undefined ? {} : { flexBasis: layout.flexBasis }) }}>
    <ScrollHost {...props} ref={ref}
      scrollEnabled={props.scrollEnabled !== false && wiring?.scrollProps.scrollEnabled !== false}
      onLayout={event => { wiring?.scrollProps.onLayout?.(event); props.onLayout?.(event); }}
      // RN's forkEvent returns AnimatedEvent at runtime; Animated.ScrollView accepts it, while its TS prop only lists functions.
      onScroll={(onScroll ?? props.onScroll) as ScrollViewProps["onScroll"]}
      scrollEventThrottle={wiring ? 16 : props.scrollEventThrottle}
      onScrollBeginDrag={event => { wiring?.scrollProps.onScrollBeginDrag?.(event); props.onScrollBeginDrag?.(event); }}
      onScrollEndDrag={event => { wiring?.scrollProps.onScrollEndDrag?.(event); props.onScrollEndDrag?.(event); }}>
      <SheetBodyScrollContext.Provider value={null}>
        {wiring ? <Animated.View style={[{ flexGrow: 1 }, wiring.contentStyle]}>{children}</Animated.View> : children}
      </SheetBodyScrollContext.Provider>
    </ScrollHost>
  </View>;
});
