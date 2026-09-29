import { useEffect, useRef, type ReactNode } from "react";
import { Animated, AppState } from "react-native";
import { motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";

export type ContentTransitionProps = { stateKey: string; children: ReactNode; motion?: "system" | "none" };
export function ContentTransition({ stateKey, children, motion: preference = "system" }: ContentTransitionProps) {
  const { environment } = useHjmNativeTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const previous = useRef(stateKey);
  useEffect(() => {
    opacity.stopAnimation();
    const changed = previous.current !== stateKey; previous.current = stateKey;
    if (!changed || environment.reducedMotion || preference === "none" || AppState.currentState !== "active") { opacity.setValue(1); return; }
    opacity.setValue(0);
    const animation = Animated.timing(opacity, { toValue: 1, duration: timing.normal, useNativeDriver: true });
    animation.start();
    const sub = AppState.addEventListener("change", state => { if (state !== "active") { animation.stop(); opacity.setValue(1); } });
    return () => { animation.stop(); sub.remove(); };
  }, [stateKey, opacity, environment.reducedMotion, preference]);
  // Keep only the current subtree; exit copies could remain touchable or spoken.
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
export function TextTransition({ text, motion: preference }: { text: string; motion?: "system" | "none" }) {
  return <ContentTransition stateKey={text} {...(preference ? { motion: preference } : {})}><Text>{text}</Text></ContentTransition>;
}
