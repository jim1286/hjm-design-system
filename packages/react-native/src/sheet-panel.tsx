import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { cancelAnimation, clamp, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { control } from "@hjmds/design-contracts/foundations";
import { sheetRecipe } from "@hjmds/design-contracts/recipes";
import { sheetPanelBehavior } from "@hjmds/design-contracts/components/sheet";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useHjmNativeTheme } from "./provider.js";
import { resolveNativeShadowElevation } from "./internal/styles.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type SheetPanelProps = Readonly<{
  children: ReactNode;
  /** Localized name for the always-visible fold/unfold control. */
  handleLabel: string;
  /** Map/canvas layout owns the available height, not the panel's content. */
  maximumHeight?: number;
  height?: number;
  onHeightChange?: (height: number) => void;
  layoutStyle?: HjmCompositionStyleProp;
  /** Product artwork above the scrolling body; it must not replace the handle. */
  overlay?: ReactNode;
  /** Domain navigation, such as horizontal letter paging; vertical ownership remains here. */
  contentGesture?: Parameters<typeof Gesture.Exclusive>[number];
  handleActions?: ViewProps["accessibilityActions"];
  onHandleAction?: ViewProps["onAccessibilityAction"];
  testID?: string;
}>;

/** A nonmodal, bottom-anchored sheet. The map behind it keeps pointer and accessibility access. */
export function SheetPanel({ children, handleLabel, maximumHeight, height, onHeightChange,
  layoutStyle, overlay, contentGesture, handleActions, onHandleAction, testID }: SheetPanelProps) {
  const theme = useHjmNativeTheme();
  const { tokens, palette, designProfile, environment } = theme;
  const reduced = environment.reducedMotion;
  const [expanded, setExpanded] = useState(true);
  const translateY = useSharedValue(0);
  const collapsedBy = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  const bodyDragging = useSharedValue(false);
  if (!handleLabel.trim() || [maximumHeight, height].some(value => value !== undefined && (!Number.isFinite(value) || value <= 0))) {
    throw new TypeError("SheetPanel requires a handle label and positive finite heights");
  }
  const settle = (velocityY: number, success: boolean) => {
    "worklet";
    const collapse = velocityY > sheetPanelBehavior.collapseVelocity ||
      (velocityY >= -sheetPanelBehavior.collapseVelocity && translateY.value > collapsedBy.value * sheetPanelBehavior.collapseDistanceRatio);
    const destination = !success ? dragStart.value : collapse ? collapsedBy.value : 0;
    translateY.value = reduced ? withTiming(destination, { duration: 0 }) : withSpring(destination, sheetPanelBehavior.spring);
    scheduleOnRN(setExpanded, destination === 0);
  };
  const start = () => { "worklet"; cancelAnimation(translateY); dragStart.value = translateY.value; };
  const update = (translationY: number) => { "worklet"; translateY.value = clamp(dragStart.value + translationY, 0, collapsedBy.value); };
  const drag = Gesture.Pan().maxPointers(1).onStart(start)
    .onUpdate(event => update(event.translationY)).onEnd((event, success) => settle(event.velocityY, success));
  // Decide ownership before the native scroll begins; reaching the top mid-scroll never folds the sheet.
  const bodyDrag = Gesture.Pan().maxPointers(1).manualActivation(true)
    .onTouchesDown((event, manager) => {
      bodyDragging.value = false;
      const touch = event.allTouches[0];
      if (!touch || event.numberOfTouches !== 1 || scrollY.value > 0) { manager.fail(); return; }
      touchX.value = touch.absoluteX; touchY.value = touch.absoluteY;
    }).onTouchesMove((event, manager) => {
      if (bodyDragging.value) return;
      const touch = event.allTouches[0];
      if (!touch || event.numberOfTouches !== 1) { manager.fail(); return; }
      const dx = touch.absoluteX - touchX.value, dy = touch.absoluteY - touchY.value;
      if (Math.abs(dx) > sheetPanelBehavior.activationDistance || dy < -sheetPanelBehavior.activationDistance) manager.fail();
      else if (dy > sheetPanelBehavior.activationDistance) manager.activate();
    }).onTouchesUp((_event, manager) => { if (!bodyDragging.value) manager.fail(); })
    .onStart(() => { bodyDragging.value = true; start(); })
    .onUpdate(event => update(event.translationY))
    .onEnd((event, success) => settle(event.velocityY, success))
    .onFinalize(() => { bodyDragging.value = false; });
  const bodyGesture = contentGesture ? Gesture.Exclusive(bodyDrag, contentGesture, Gesture.Native()) : Gesture.Exclusive(bodyDrag, Gesture.Native());
  const onScroll = useAnimatedScrollHandler(event => { scrollY.value = Math.max(0, event.contentOffset.y); });
  const motion = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  useEffect(() => () => cancelAnimation(translateY), [translateY]);
  const shadow = designProfile?.tokens.shadow.floating ?? sheetRecipe.content.shadow;
  const radius = tokens.radius[sheetRecipe.content.radius];
  const toggle = () => {
    cancelAnimation(translateY);
    const nextExpanded = translateY.get() > collapsedBy.get() / 2;
    translateY.set(reduced ? withTiming(nextExpanded ? 0 : collapsedBy.get(), { duration: 0 }) : withSpring(nextExpanded ? 0 : collapsedBy.get(), sheetPanelBehavior.spring));
    setExpanded(nextExpanded);
  };
  return <Animated.View testID={testID} style={[{ flexShrink: 1, maxHeight: maximumHeight ?? "100%", height,
    borderTopLeftRadius: radius, borderTopRightRadius: radius,
    backgroundColor: resolveColorReference(sheetRecipe.content.background, palette),
    shadowColor: shadow.color, shadowOpacity: shadow.opacity, shadowRadius: shadow.radius,
    shadowOffset: { width: 0, height: shadow.offsetY }, ...resolveNativeShadowElevation(shadow, designProfile !== undefined, 8),
  }, layoutStyle, motion]} onLayout={event => {
    const measuredHeight = event.nativeEvent.layout.height;
    const previous = collapsedBy.get();
    const wasCollapsed = previous > 0 && translateY.get() > previous / 2;
    const next = Math.max(0, measuredHeight - control.minTouchTarget);
    cancelAnimation(translateY);
    collapsedBy.set(next); translateY.set(wasCollapsed ? next : 0); setExpanded(!wasCollapsed);
    onHeightChange?.(measuredHeight);
  }}>
    <GestureDetector gesture={drag}><Pressable testID={testID ? `${testID}-handle` : undefined}
      accessibilityRole={handleActions?.length ? "adjustable" : "button"} accessibilityLabel={handleLabel}
      accessibilityState={{ expanded }} accessibilityActions={[{ name: "activate" }, ...(handleActions ?? [])]}
      onAccessibilityAction={event => { if (event.nativeEvent.actionName === "activate") toggle(); else onHandleAction?.(event); }}
      onPress={toggle} style={{ height: control.minTouchTarget, alignSelf: "stretch", alignItems: "center", justifyContent: "center" }}>
      <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: sheetRecipe.handle.width, height: sheetRecipe.handle.height,
        borderRadius: tokens.radius[sheetRecipe.handle.radius], backgroundColor: resolveColorReference(sheetRecipe.handle.color, palette) }} />
    </Pressable></GestureDetector>
    {/* Folded panels expose only their handle; keep product artwork mounted but out of view and hit testing. */}
    {overlay ? <View pointerEvents={expanded ? "box-none" : "none"} style={[StyleSheet.absoluteFill, { opacity: expanded ? 1 : 0 }]}
      accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}>{overlay}</View> : null}
    <GestureDetector gesture={bodyGesture}><Animated.ScrollView testID={testID ? `${testID}-scroll` : undefined}
      accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      style={{ flexGrow: height === undefined ? 0 : 1, flexShrink: 1, overflow: "hidden" }}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: sheetRecipe.content.paddingHorizontal, paddingBottom: sheetRecipe.content.paddingBottom }}
      onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator bounces={false} overScrollMode="never" contentInsetAdjustmentBehavior="never">
      {children}
    </Animated.ScrollView></GestureDetector>
  </Animated.View>;
}
