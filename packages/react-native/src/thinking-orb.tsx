import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, AppState, View, type StyleProp, type ViewStyle } from "react-native";
import { Canvas, Picture, Skia, PaintStyle, createPicture, type SkPicture } from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-reanimated";
import { buildThinkingOrbFrame, createThinkingOrbClock, thinkingOrbRecipe, validateThinkingOrb, type ThinkingOrbOptions } from "@hjmds/design-contracts/components/thinking-orb";
import { useHjmNativeTheme } from "./provider.js";

export type ThinkingOrbProps = ThinkingOrbOptions & Readonly<{ style?: StyleProp<ViewStyle>; testID?: string }>;
/** Skia is isolated to this entry; hosts must forward navigation/list visibility via active. */
export function ThinkingOrb({ state = "working", appearance = "state", size = 64, label, speed = 1, paused = false, active = true, style, testID }: ThinkingOrbProps) {
  validateThinkingOrb({ state, appearance, size, speed, label });
  const theme = useHjmNativeTheme();
  // Default to static until the asynchronous OS preference resolves to avoid an initial motion flash.
  const [osReduced, setOsReduced] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  const clock = useRef(createThinkingOrbClock());
  const [emptyPicture] = useState(() => createPicture(() => {}));
  const picture = useSharedValue<SkPicture>(emptyPicture);
  const reduced = theme.environment.reducedMotion || osReduced;
  const ink = theme.colors.text;
  useEffect(() => {
    let mounted = true;
    let observed = false;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted && !observed) setOsReduced(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", value => { observed = true; setOsReduced(value); });
    const app = AppState.addEventListener("change", value => setForeground(value === "active"));
    return () => { mounted = false; motion.remove(); app.remove(); };
  }, []);
  useEffect(() => {
    const fill = Skia.Paint(), stroke = Skia.Paint();
    fill.setAntiAlias(true); stroke.setAntiAlias(true); stroke.setStyle(PaintStyle.Stroke);
    fill.setColor(Skia.Color(ink)); stroke.setColor(Skia.Color(ink));
    const draw = () => {
      const frame = buildThinkingOrbFrame(state, size, reduced ? thinkingOrbRecipe.motion.staticTime : clock.current.time, appearance);
      // A shared picture updates Skia directly; no React setState/commit per animation frame.
      // Pictures are GC-owned: disposing a replaced picture here can race UI-thread consumption.
      picture.value = createPicture(canvas => {
        for (const line of frame.lines) {
          stroke.setAlphaf((1 - Math.min(1, Math.max(0, line.white))) * (line.a ?? 1)); stroke.setStrokeWidth(line.w);
          canvas.drawLine(line.x1, line.y1, line.x2, line.y2, stroke);
        }
        for (const dot of frame.dots) {
          fill.setAlphaf((1 - Math.min(1, Math.max(0, dot.white))) * (dot.a ?? 1));
          canvas.drawCircle(dot.x, dot.y, dot.r, fill);
        }
      }, Skia.XYWHRect(0, 0, size, size));
    };
    let raf = 0, disposed = false;
    draw(); clock.current.resetDelta();
    const loop = (now: number) => {
      if (disposed) return;
      clock.current.sample(now, speed); draw(); raf = requestAnimationFrame(loop);
    };
    if (active && !paused && !reduced && foreground) raf = requestAnimationFrame(loop);
    return () => { disposed = true; cancelAnimationFrame(raf); clock.current.resetDelta(); fill.dispose(); stroke.dispose(); };
  }, [state, appearance, size, speed, active, paused, reduced, foreground, ink, picture]);
  return <View testID={testID} accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityLiveRegion="polite" accessibilityState={{ busy: true }} style={[{ width: size, height: size }, style]}>
    <Canvas accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      <Picture picture={picture} />
    </Canvas>
  </View>;
}
