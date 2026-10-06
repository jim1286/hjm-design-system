import { resolveContentTransition, type ContentTransitionPreset } from "@hjmds/design-contracts/content-transition";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, AppState, Easing, View, type LayoutChangeEvent } from "react-native";
import { easing, motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";

export type ContentTransitionProps = { preset?: ContentTransitionPreset; stateKey: string; children: ReactNode; motion?: "system" | "none"; animateHeight?: boolean };
export function ContentTransition({ stateKey, children, motion: preference = "system", preset = "fade", animateHeight = false }: ContentTransitionProps) {
  const { environment } = useHjmNativeTheme();
  const from = resolveContentTransition(preset, environment.direction);
  const opacity = useRef(new Animated.Value(1)).current;
  const height = useRef(new Animated.Value(0)).current;
  const targetHeight = useRef<number | null>(null);
  const [measured, setMeasured] = useState(false);
  const heightEnabled = animateHeight && !environment.reducedMotion && preference !== "none";
  useEffect(() => {
    const settle = () => { height.stopAnimation(); if (targetHeight.current !== null) height.setValue(targetHeight.current); };
    if (!heightEnabled) { settle(); return; }
    const sub = AppState.addEventListener("change", state => { if (state !== "active") settle(); });
    return () => { sub.remove(); settle(); };
  }, [height, heightEnabled]);
  const measureHeight = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height;
    if (next === targetHeight.current) return;
    const firstMeasurement = targetHeight.current === null;
    targetHeight.current = next;
    setMeasured(true);
    height.stopAnimation();
    if (firstMeasurement || !heightEnabled || AppState.currentState !== "active") { height.setValue(next); return; }
    // Height is a layout property, so this opt-in uses the JS driver. The
    // opacity/transform path stays on the native driver and inputs stay unique.
    Animated.timing(height, { toValue: next, duration: timing.normal, easing: Easing.bezier(...easing.enter), useNativeDriver: false }).start();
  };
  const previous = useRef(stateKey);
  useEffect(() => {
    opacity.stopAnimation();
    const changed = previous.current !== stateKey; previous.current = stateKey;
    if (!changed || environment.reducedMotion || preference === "none" || AppState.currentState !== "active") { opacity.setValue(1); return; }
    opacity.setValue(0);
    // RN's implicit easing differs from Web. Translate the shared curve instead
    // of introducing another engine for a single opacity/transform transition.
    const animation = Animated.timing(opacity, { toValue: 1, duration: timing.normal, easing: Easing.bezier(...easing.enter), useNativeDriver: true });
    animation.start();
    const sub = AppState.addEventListener("change", state => { if (state !== "active") { animation.stop(); opacity.setValue(1); } });
    return () => { animation.stop(); sub.remove(); };
    // A new preset/direction mid-flight must settle the current content rather
    // than bend an already running transform onto a different path.
  }, [stateKey, opacity, environment.reducedMotion, environment.direction, preference, preset]);
  // Keep only the current subtree; exit copies could remain touchable or spoken.
  return <Animated.View style={heightEnabled && measured ? { height, overflow: "hidden" } : undefined}><View onLayout={animateHeight ? measureHeight : undefined}><Animated.View style={{ opacity, transform: [{ translateX: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.translateX, 0] }) }, { translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.translateY, 0] }) }, { scale: opacity.interpolate({ inputRange: [0, 1], outputRange: [from.scale, 1] }) }] }}>{children}</Animated.View></View></Animated.View>;
}
export function TextTransition({ text, motion: preference, preset }: { preset?: ContentTransitionPreset; text: string; motion?: "system" | "none" }) {
  return <ContentTransition stateKey={text} {...(preset ? { preset } : {})} {...(preference ? { motion: preference } : {})}><Text>{text}</Text></ContentTransition>;
}
