import { useEffect, useMemo } from "react";
import { Animated, AppState, View } from "react-native";
import { gravityLetterMotion, resolveGravityLetters } from "@hjmds/design-contracts/gravity-letters";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
export type GravityLettersProps = Readonly<{ glyphs: readonly string[]; active?: boolean; replayKey?: string | number }>;
/** Decorative only; keep a readable, static heading outside this hidden view. */
export function GravityLetters({ glyphs, active = false, replayKey = 0 }: GravityLettersProps) {
  const { environment } = useHjmNativeTheme();
  const units = resolveGravityLetters(glyphs);
  const signature = JSON.stringify(glyphs);
  const values = useMemo(() => (JSON.parse(signature) as string[]).map(() => new Animated.Value(1)), [signature]);
  useEffect(() => {
    const clear = () => values.forEach(value => { value.stopAnimation(); value.setValue(1); });
    clear();
    if (!active || environment.reducedMotion || AppState.currentState !== "active") return;
    const recipe = resolveGravityLetters(JSON.parse(signature) as string[]);
    const animations = values.map((value, index) => {
      value.setValue(0);
      return Animated.timing(value, { toValue: 1, duration: gravityLetterMotion.duration, delay: recipe[index]!.delay, useNativeDriver: true });
    });
    animations.forEach(animation => animation.start());
    const stop = () => { animations.forEach(animation => animation.stop()); clear(); };
    const subscription = AppState.addEventListener("change", state => { if (state !== "active") stop(); });
    return () => { stop(); subscription.remove(); };
  }, [signature, values, active, replayKey, environment.reducedMotion]);
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 36 }}>{units.map((unit, index) => <Animated.View key={index} style={{ transform: [
    { translateY: values[index]!.interpolate({ inputRange: [...gravityLetterMotion.input], outputRange: [...gravityLetterMotion.y] }) },
    { rotate: values[index]!.interpolate({ inputRange: [0, 0.55, 1], outputRange: [`${unit.rotation}deg`, "0deg", "0deg"] }) },
  ] }}><Text variant="heading">{unit.glyph}</Text></Animated.View>)}</View>;
}
