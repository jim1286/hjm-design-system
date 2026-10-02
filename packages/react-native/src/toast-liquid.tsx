import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, PanResponder, View } from "react-native";
import { Canvas, Group, Paint, Blur, ColorMatrix, RoundedRect, Shadow } from "@shopify/react-native-skia";
import Animated, { cancelAnimation, interpolateColor, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { shadow, stroke } from "@hjmds/design-contracts/foundations";
import { withAlpha } from "@hjmds/design-contracts/colors";
import { buildLiquidToastGeometry, liquidToastRecipe as recipe, resolveLiquidToastLayout, validateLiquidToastAnchor, type LiquidToastAnchor } from "@hjmds/design-contracts/components/toast";
import { useHjmNativeTheme } from "./provider.js";
import type { NativeToastPresentationProps, ToastPresentationAdapter } from "./internal/toast-presentation.js";

export type LiquidToastOptions = Readonly<{ anchor?: LiquidToastAnchor }>;

// 2026-10-02: a floating shadow plus the goo-filtered settled card looked inflated.
// Use the shallow shared elevation; reserve the liquid filter for the transition only.
const cardShadow = shadow.raised;
// Skia blur uses sigma; halve the shared radius and include the token opacity.
const shadowColor = withAlpha(cardShadow.color, cardShadow.opacity);
const shadowBlur = cardShadow.radius / 2;
// The halo reaches about three sigmas past the card. The canvas grows by that much on each side; a canvas exactly as wide
// as the region clipped it into straight left/right/bottom edges on phones where the card fills the width.
const canvasBleed = Math.ceil(shadowBlur * 3 + Math.abs(cardShadow.offsetY));

/** Optional entry: requires Skia 2.6, Reanimated 4.5 and Worklets 0.10 in the host. */
export function createLiquidToastPresentation(options: LiquidToastOptions = {}): ToastPresentationAdapter {
  const anchor: LiquidToastAnchor = options.anchor?.kind === "island"
    ? { kind: "island", frame: { ...options.anchor.frame } }
    : options.anchor ?? { kind: "capsule" };
  validateLiquidToastAnchor(anchor);
  return Object.freeze({ kind: "liquid", anchor, Surface: LiquidSurface });
}

function LiquidSurface({ anchor, ...props }: NativeToastPresentationProps) {
  const theme = useHjmNativeTheme();
  const [height, setHeight] = useState(0);
  const [reader, setReader] = useState(false);
  const [osReduced, setOsReduced] = useState(false);
  const callbacks = useRef(props);
  callbacks.current = props;
  const generation = useRef(0);
  const entered = useRef(false);
  const layout = resolveLiquidToastLayout({
    width: props.width, height, availableHeight: props.availableHeight, anchor,
    ...(props.windowOrigin === undefined ? {} : { windowOrigin: props.windowOrigin }),
  });
  // Accessibility and constrained layouts keep the same store entry with standard chrome.
  const fallback = reader || osReduced || theme.environment.reducedMotion || (height > 0 && !layout.fits);
  const drop = useSharedValue(0), expand = useSharedValue(0), reveal = useSharedValue(0), tint = useSharedValue(0), drag = useSharedValue(0);
  const geometry = useDerivedValue(() => buildLiquidToastGeometry(drop.value, expand.value, layout), [layout]);
  // 2026-10-02: the neutral fill looked muddy. Use clean white in the default light
  // theme and a blue-tinted dark surface; keep the outline so white-on-white stays legible.
  const cardColor = theme.environment.theme === "dark" ? theme.colors.surfaceAccent : theme.colors.bg;
  const cardBorder = theme.colors.borderControl;
  const anchorColor = anchor.kind === "island" ? "#000000" : theme.colors.text;
  // Black is a physical occlusion match only for an explicitly supplied hardware frame.
  const dropletColor = useDerivedValue(() => interpolateColor(tint.value, [0, 1], [anchorColor, cardColor]));
  const x = useDerivedValue(() => geometry.value.x);
  const y = useDerivedValue(() => geometry.value.y - layout.canvasTop + drag.value);
  const w = useDerivedValue(() => geometry.value.width);
  const h = useDerivedValue(() => geometry.value.height);
  const r = useDerivedValue(() => geometry.value.radius);
  const nx = useDerivedValue(() => geometry.value.neckX);
  const ny = useDerivedValue(() => geometry.value.neckY - layout.canvasTop);
  const nw = useDerivedValue(() => geometry.value.neckWidth);
  const nh = useDerivedValue(() => geometry.value.neckHeight);
  const nr = useDerivedValue(() => geometry.value.neckWidth / 2);
  const opacity = useDerivedValue(() => Math.max(0, Math.min(1, expand.value)));
  const liquidOpacity = useDerivedValue(() => 1 - Math.max(0, Math.min(1, expand.value)));
  // An in-app circle is only the starting point. Left on screen after the card settled it read as a second, floating
  // Dynamic Island under the real one (2026-09-30 capture), so it fades out as the card expands and returns on exit.
  // A verified island frame stays: it covers the hardware cutout.
  const anchorOpacity = useDerivedValue(() => anchor.kind === "island"
    ? 1
    : Math.max(0, Math.min(1, drop.value * 4)) * (1 - Math.max(0, Math.min(1, expand.value))));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    // Keep text at its final scale so the card does not appear to inflate during reveal.
    transform: [{ translateY: geometry.value.offsetY + drag.value }],
  }));
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isScreenReaderEnabled().then(value => { if (active) setReader(value); });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setOsReduced(value); });
    const screen = AccessibilityInfo.addEventListener("screenReaderChanged", setReader);
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setOsReduced);
    return () => { active = false; screen.remove(); motion.remove(); };
  }, []);

  useEffect(() => {
    const token = ++generation.current;
    const values = [drop, expand, reveal, tint, drag];
    values.forEach(cancelAnimation);
    const phase = props.snapshot.phase;
    const settle = () => {
      entered.current = true;
      drop.value = expand.value = reveal.value = tint.value = 1;
      drag.value = 0;
      callbacks.current.onResume("presentation");
    };
    if (fallback || props.suspended) {
      settle();
      if (phase === "closing" && props.suspended) callbacks.current.onExitComplete();
    } else if (phase === "closing") {
      const complete = () => { if (generation.current === token) callbacks.current.onExitComplete(); };
      reveal.value = withSpring(0, recipe.spring.fade);
      expand.value = withDelay(recipe.delay.collapse, withSpring(0, recipe.spring.collapse));
      tint.value = withDelay(recipe.delay.return, withSpring(0, recipe.spring.return));
      drop.value = withDelay(recipe.delay.return, withSpring(0, recipe.spring.return, finished => {
        "worklet";
        if (finished) scheduleOnRN(complete);
      }));
    } else if (height > 0 && props.width > 0 && !entered.current) {
      callbacks.current.onPause("presentation");
      const finishedStages = new Set<string>();
      const finish = (stage: string) => {
        if (generation.current !== token) return;
        finishedStages.add(stage);
        if (finishedStages.size === 3) settle();
      };
      drop.value = withSpring(1, recipe.spring.drop, finished => { "worklet"; if (finished) scheduleOnRN(finish, "drop"); });
      tint.value = withDelay(recipe.delay.tint, withSpring(1, recipe.spring.tint));
      expand.value = withDelay(recipe.delay.expand, withSpring(1, recipe.spring.expand, finished => { "worklet"; if (finished) scheduleOnRN(finish, "expand"); }));
      reveal.value = withDelay(recipe.delay.reveal, withSpring(1, recipe.spring.reveal, finished => { "worklet"; if (finished) scheduleOnRN(finish, "reveal"); }));
    } else if (entered.current) settle();
    return () => { generation.current++; values.forEach(cancelAnimation); };
  }, [drop, expand, reveal, tint, drag, fallback, props.suspended, props.snapshot.phase, height, props.width]);

  const gesture = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, state) => state.dy < -6 && Math.abs(state.dy) > Math.abs(state.dx),
    onPanResponderGrant: () => callbacks.current.onPause("gesture"),
    onPanResponderMove: (_event, state) => { drag.value = Math.max(-120, Math.min(24, state.dy)); },
    onPanResponderRelease: (_event, state) => {
      callbacks.current.onResume("gesture");
      // A responder takeover may suppress the child's touch-end; release its pause as well.
      callbacks.current.onResume("pointer");
      if (state.dy < recipe.swipe.distance || state.vy * 1000 < recipe.swipe.velocity) callbacks.current.onDismiss("swipe");
      else drag.value = withSpring(0, recipe.spring.drag);
    },
    onPanResponderTerminate: () => { callbacks.current.onResume("gesture"); callbacks.current.onResume("pointer"); drag.value = withSpring(0, recipe.spring.drag); },
  }), [drag]);

  if (fallback) return props.fallback;
  // Only decoration is rasterized. RN text and its independent action/close stay accessible.
  return <View pointerEvents="box-none" style={{ width: "100%", paddingTop: layout.cardTop, alignItems: "center" }}>
    {height > 0 ? <Canvas pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", top: layout.canvasTop, left: -canvasBleed, width: props.width + canvasBleed * 2, height: layout.canvasHeight + canvasBleed }}>
      <Group transform={[{ translateX: canvasBleed }]}>
      {/* Keep the input fill: shadowOnly left only a gray blur after the goo layer faded,
          making the dark card disappear (2026-10-02 user device capture). */}
      <Group opacity={opacity}><RoundedRect x={x} y={y} width={w} height={h} r={r} color={cardColor}>
        <Shadow dx={0} dy={cardShadow.offsetY} blur={shadowBlur} color={shadowColor} />
      </RoundedRect>
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color={cardBorder} style="stroke" strokeWidth={stroke.subtle} />
      </Group>
      <Group opacity={liquidOpacity} layer={<Paint><Blur blur={recipe.blur} /><ColorMatrix matrix={[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,recipe.gain,-recipe.gain*recipe.threshold]} /></Paint>}>
        <Group opacity={anchorOpacity}><RoundedRect x={layout.anchorX + 4} y={layout.anchorY - layout.canvasTop + 4} width={Math.max(0, layout.anchorWidth - 8)} height={Math.max(0, layout.anchorHeight - 8)} r={layout.anchorHeight / 2} color={anchorColor} /></Group>
        <RoundedRect x={nx} y={ny} width={nw} height={nh} r={nr} color={anchorColor} />
        <RoundedRect x={x} y={y} width={w} height={h} r={r} color={dropletColor} />
      </Group>
      <Group opacity={anchorOpacity}><RoundedRect x={layout.anchorX} y={layout.anchorY - layout.canvasTop} width={layout.anchorWidth} height={layout.anchorHeight} r={layout.anchorHeight / 2} color={anchorColor} /></Group>
      </Group>
    </Canvas> : null}
    <Animated.View {...gesture.panHandlers} onLayout={event => setHeight(event.nativeEvent.layout.height)}
      style={[{ width: "100%", maxWidth: recipe.maxWidth }, contentStyle]}>
      {props.body}
    </Animated.View>
  </View>;
}
