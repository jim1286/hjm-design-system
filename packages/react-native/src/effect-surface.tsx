import { Component, useEffect, useId, useRef, type ReactNode } from "react";
import { Animated, AppState, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop, Pattern, Rect, Mask, Image as SvgImage } from "react-native-svg";
import { resolveEffectSurface, type EffectSurfaceDescriptor } from "@hjmds/design-contracts/effect-surface";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useHjmNativeTheme } from "./provider.js";
export type EffectSurfaceProps = Readonly<{ descriptor?: EffectSurfaceDescriptor; children: ReactNode; style?: StyleProp<ViewStyle>; /** Host screen/list visibility; false freezes decoration. */ visible?: boolean }>;
export function EffectSurface({ descriptor = {}, children, style, visible = true }: EffectSurfaceProps) {
  const { palette } = useHjmNativeTheme();
  // Validate caller input outside the fallback; a broken descriptor is not a host failure.
  const effect = resolveEffectSurface(descriptor);
  return <View style={[{ overflow: "hidden", backgroundColor: palette.theme.bg }, style]}>
    <DecorationBoundary><EffectDecoration effect={effect} visible={visible} /></DecorationBoundary>
    {children}
  </View>;
}
// A failed optional SVG/Animated host must not unmount the product's content.
// Stay on the base surface until remount instead of repeatedly retrying a broken host.
class DecorationBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? null : this.props.children; }
}
function EffectDecoration({ effect, visible }: { effect: ReturnType<typeof resolveEffectSurface>; visible: boolean }) {
  const { palette, environment } = useHjmNativeTheme();
  const id = useId().replace(/:/g, "");
  const progress = useRef(new Animated.Value(0)).current;
  const hasAtmosphere = effect.layers.some(value => value !== "ruled");
  useEffect(() => {
    if (!hasAtmosphere || !effect.active || environment.reducedMotion || !visible) { progress.setValue(0); return; }
    // Core Animated avoids a GPU/Worklets dependency for a decorative transform.
    // Native list/screen owners pass visibility; AppState additionally suspends it.
    let animation: Animated.CompositeAnimation | undefined;
    let failed = false;
    const sync = (state: string) => { animation?.stop(); progress.setValue(0); if (state === "active" && !failed) {
      // AppState callbacks run outside React error boundaries. A failed start keeps
      // the static layer and must not crash when the app returns to the foreground.
      try {
      animation = Animated.loop(Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: effect.period * 500, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: effect.period * 500, useNativeDriver: true }),
      ])); animation.start(); } catch { failed = true; animation?.stop(); progress.setValue(0); }
    } };
    sync(AppState.currentState); const sub = AppState.addEventListener("change", sync);
    return () => { animation?.stop(); progress.setValue(0); sub.remove(); };
  }, [hasAtmosphere, effect.active, effect.period, environment.reducedMotion, visible, progress]);
  const colors = effect.colors.map(color => resolveColorReference(color, palette));
  return <><Animated.View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { opacity: effect.intensity, transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1.12] }) }] }]}>
      <Svg width="100%" height="100%">
        {/* Noise uses physical units so a wide surface cannot stretch its grains. */}
        <Defs>{effect.noise && <><Pattern id={`${id}-noise-tile`} width={effect.noise.size} height={effect.noise.size} x={effect.noise.offset} patternUnits="userSpaceOnUse"><SvgImage href={effect.noise.uri} width={effect.noise.size} height={effect.noise.size} /></Pattern><Mask id={`${id}-noise-mask`} x={0} y={0} width="100%" height="100%" maskUnits="userSpaceOnUse"><Rect width="100%" height="100%" fill={`url(#${id}-noise-tile)`} /></Mask></>}</Defs>
        {effect.noise && <Rect width="100%" height="100%" fill={palette.theme.text} mask={`url(#${id}-noise-mask)`} />}
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>{colors.map((color, index) => <RadialGradient id={`${id}-${index}`} key={index}><Stop offset="0%" stopColor={color} /><Stop offset="100%" stopColor={color} stopOpacity={0} /></RadialGradient>)}
          <Pattern id={`${id}-grain`} width={4} height={4} patternUnits="userSpaceOnUse">{effect.points.map((point, index) => <Circle key={index} cx={point.x / 25} cy={point.y / 25} r={point.radius / 10} fill={palette.theme.text} opacity={0.28} />)}</Pattern>
        </Defs>
        {effect.layers.includes("mesh") && effect.anchors.map((anchor, index) => <Ellipse key={index} cx={anchor.x} cy={anchor.y} rx={65} ry={70} fill={`url(#${id}-${index})`} />)}
        {effect.layers.includes("glow") && <Ellipse cx={50} cy={10} rx={70} ry={95} fill={`url(#${id}-0)`} />}
        {effect.layers.includes("grain") && <Rect width={100} height={100} fill={`url(#${id}-grain)`} />}
        </Svg>
      </Svg>
    </Animated.View>
    {/* Physical-unit ruling stays outside Animated's scale, like the Web layer. */}
    {effect.ruled && <Svg testID="hjm-effect-ruled" pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" width="100%" height="100%" style={[StyleSheet.absoluteFill, { opacity: effect.intensity }]}>
      {/* Match the physical tile width explicitly: a percent Rect inside a
          one-unit native tile can disappear during iOS pattern rasterization. */}
      <Defs><Pattern id={`${id}-ruled`} width={effect.ruled.spacing} height={effect.ruled.spacing} patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse"><Rect y={effect.ruled.spacing - effect.ruled.thickness} width={effect.ruled.spacing} height={effect.ruled.thickness} fill={palette.theme.text} /></Pattern></Defs>
      <Rect width="100%" height="100%" fill={`url(#${id}-ruled)`} />
    </Svg>}</>;
}
