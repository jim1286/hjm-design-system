import { useEffect, useMemo } from "react";
import { Animated, AppState, View } from "react-native";
import { gravityLetterMotion, resolveGravityLetters } from "@hjmds/design-contracts/gravity-letters";
import { headingRecipe } from "@hjmds/design-contracts/components/heading";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { HeadingLevel } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
export type GravityLettersProps = Readonly<{
  glyphs: readonly string[]; active?: boolean; replayKey?: string | number;
  /**
   * Heading scale for the glyphs. Web glyphs inherit a surrounding Heading's typography, but RN Text styles do not
   * cross the Animated.View per glyph, so Native takes the level explicitly (2026-10-17 review F N12).
   */
  level?: HeadingLevel;
}>;
/** Decorative only; keep a readable, static heading outside this hidden view. */
export function GravityLetters({ glyphs, active = false, replayKey = 0, level }: GravityLettersProps) {
  const theme = useHjmNativeTheme();
  const { environment } = theme;
  const metrics = level === undefined ? null : theme.designProfile?.tokens.heading[level] ?? headingRecipe.levels[level];
  const units = resolveGravityLetters(glyphs);
  const signature = JSON.stringify(glyphs);
  const values = useMemo(() => (JSON.parse(signature) as string[]).map(() => new Animated.Value(1)), [signature]);
  useEffect(() => {
    const clear = () => values.forEach(value => { value.stopAnimation(); value.setValue(1); });
    clear();
    if (!active || environment.reducedMotion || AppState.currentState !== "active") return;
    const recipe = resolveGravityLetters(JSON.parse(signature) as string[]);
    const animations: ReturnType<typeof Animated.timing>[] = [];
    const stop = () => { animations.forEach(animation => animation.stop()); clear(); };
    // A partial native animation failure must leave the decorative text settled.
    try {
      values.forEach((value, index) => {
        value.setValue(0);
        animations.push(Animated.timing(value, { toValue: 1, duration: gravityLetterMotion.duration, delay: recipe[index]!.delay, useNativeDriver: true }));
      });
      animations.forEach(animation => animation.start());
    } catch { stop(); return; }
    const subscription = AppState.addEventListener("change", state => { if (state !== "active") stop(); });
    return () => { stop(); subscription.remove(); };
  }, [signature, values, active, replayKey, environment.reducedMotion]);
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 36 }}>{units.map((unit, index) => <Animated.View key={index} style={{ transform: [
    { translateY: values[index]!.interpolate({ inputRange: [...gravityLetterMotion.input], outputRange: [...gravityLetterMotion.y] }) },
    { rotate: values[index]!.interpolate({ inputRange: [0, 0.55, 1], outputRange: [`${unit.rotation}deg`, "0deg", "0deg"] }) },
  ] }}>{metrics ? <Text fontRole="display" style={{ color: resolveColorReference(headingRecipe.color, theme.palette), fontSize: metrics.fontSize, fontWeight: metrics.fontWeight, lineHeight: metrics.lineHeight }}>{unit.glyph}</Text> : <Text variant="heading">{unit.glyph}</Text>}</Animated.View>)}</View>;
}
