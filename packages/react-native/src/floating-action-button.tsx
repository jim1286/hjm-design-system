import { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import {
  floatingActionButtonRecipe as recipe, resolveFloatingActionButtonDescriptor,
  resolveFloatingActionButtonLayoutMode, resolveFloatingActionButtonContentClearance,
  type FloatingActionButtonDescriptor, type FloatingActionButtonLayoutMode,
} from "@hjmds/design-contracts/components/floating-action-button";
import { glyph, easing } from "@hjmds/design-contracts/foundations";
import { Button, type ButtonProps } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";

export { resolveFloatingActionButtonContentClearance };
export type FloatingActionButtonProps = Pick<ButtonProps, "onPress" | "onFocus" | "onBlur" | "testID"> & Readonly<{
  descriptor: FloatingActionButtonDescriptor;
  renderIcon: (icon: Readonly<{ name: string; size: number; color: string; decorative: true }>) => ReactNode;
  safeAreaBottomInset?: number;
  onContentClearanceChange: (clearance: number) => void;
}>;

/** Place after the ScrollView in a positioned screen; reserve the reported content clearance. */
export const FloatingActionButton = forwardRef<View, FloatingActionButtonProps>(function FloatingActionButton({
  descriptor, renderIcon, safeAreaBottomInset = 0, onContentClearanceChange, ...props
}, ref) {
  const { colors, environment } = useHjmNativeTheme();
  const { width } = useWindowDimensions();
  const resolved = resolveFloatingActionButtonDescriptor(descriptor);
  const minimumClearance = resolveFloatingActionButtonContentClearance(safeAreaBottomInset);
  const collapsed = resolved.layoutMode === "collapsed";
  const labelOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (collapsed || environment.reducedMotion) { labelOpacity.setValue(1); return; }
    labelOpacity.setValue(0);
    const animation = Animated.timing(labelOpacity, { toValue: 1, duration: recipe.transition.duration,
      easing: Easing.bezier(...easing[recipe.transition.easing]), useNativeDriver: true });
    animation.start(); return () => animation.stop();
  }, [collapsed, environment.reducedMotion, labelOpacity]);
  return <Button {...props} ref={ref} size="large" tone="primary" shape="pill" growWithContent
    accessibilityLabel={resolved.resolvedAccessibilityLabel}
    onLayout={({ nativeEvent }) => onContentClearanceChange(Math.max(minimumClearance,
      nativeEvent.layout.height + recipe.margin * 2 + safeAreaBottomInset))}
    style={{ position: "absolute", bottom: recipe.margin + safeAreaBottomInset,
      ...(environment.direction === "rtl" ? { left: recipe.margin } : { right: recipe.margin }),
      maxWidth: width - recipe.margin * 2, minHeight: recipe.circle.diameter,
      shadowColor: recipe.shadow.color, shadowOpacity: recipe.shadow.opacity,
      shadowRadius: recipe.shadow.radius, shadowOffset: { width: 0, height: recipe.shadow.offsetY },
      // Android elevation has no blur-radius contract; use the reviewed floating
      // radius tier rather than inventing a separate FAB shadow strength.
      elevation: recipe.shadow.radius,
      ...(collapsed ? { width: recipe.circle.diameter, paddingHorizontal: 0 } : { paddingVertical: recipe.margin / 2 }),
    }}>
    <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1, gap: collapsed ? 0 : recipe.margin / 2 }}>
      <View accessible={false} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {renderIcon({ name: resolved.icon.name, size: glyph[recipe.circle.glyph], color: colors.onPrimary, decorative: true })}
      </View>
      {collapsed ? null : <Animated.View style={{ opacity: labelOpacity, flexShrink: 1 }}><Text variant="bodyLarge" emphasis="medium" style={{ color: colors.onPrimary }}>{resolved.label}</Text></Animated.View>}
    </View>
  </Button>;
});

export function useFloatingActionButtonScroll() {
  const [layoutMode, setLayoutMode] = useState<FloatingActionButtonLayoutMode>("expanded");
  const anchor = useRef(0);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = Math.max(0, event.nativeEvent.contentOffset.y);
    const delta = offset - anchor.current;
    if (offset > 0 && Math.abs(delta) < recipe.margin / 2) return;
    anchor.current = offset;
    setLayoutMode((mode) => resolveFloatingActionButtonLayoutMode(offset === 0 || delta < 0 ? "toward-start" : "away-from-start", mode));
  }, []);
  return { layoutMode, onScroll };
}
