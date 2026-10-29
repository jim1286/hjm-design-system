/**
 * Node stand-in for react-native-reanimated in suites that render animated HJM surfaces (ImageViewer's pull-to-close,
 * 2026-10-30): shared values are refs, animated styles are computed once, and timing lands immediately.
 */
import { useRef } from "react";
import { View } from "react-native";

export const ReduceMotion = { Always: "always", Never: "never", System: "system" };
export const useSharedValue = <T,>(value: T) => useRef({ value }).current;
export const useAnimatedStyle = <T,>(style: () => T) => style();
export const withTiming = <T,>(value: T) => value;
export const interpolate = (value: number, input: readonly number[], output: readonly number[]) => {
  const [a, b] = input as [number, number]; const [c, d] = output as [number, number];
  const t = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return c + (d - c) * t;
};
export default { View };
