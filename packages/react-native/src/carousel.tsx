import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, AppState, PanResponder, View, type StyleProp, type ViewStyle } from "react-native";
import {
  carouselRecipe, resolveCarouselDescriptor, getCarouselNavigationTarget, isCarouselAutoplayActive,
  type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig,
  type ComposeCarouselAccessibleName,
} from "@hjmds/design-contracts/components/carousel";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { useControllableState } from "./internal/state.js";

export type CarouselLabels = Readonly<{ previous: string; next: string; pause: string; resume: string; navigation: string }>;
export type CarouselProps = CarouselSelection & Readonly<{
  label: string;
  slides: readonly CarouselSlideDescriptor[];
  renderSlide: (slide: CarouselSlideDescriptor) => ReactNode;
  composeAccessibleName: ComposeCarouselAccessibleName;
  labels: CarouselLabels;
  autoplay?: CarouselAutoplayConfig;
  style?: StyleProp<ViewStyle>;
}>;

export function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay,
  currentKey, defaultCurrentKey, onCurrentKeyChange, style }: CarouselProps) {
  const { environment, tokens } = useHjmNativeTheme();
  const [current, setCurrent] = useControllableState({
    ...(currentKey === undefined ? {} : { value: currentKey }),
    defaultValue: defaultCurrentKey ?? slides[0]?.id ?? "",
    ...(onCurrentKeyChange === undefined ? {} : { onChange: onCurrentKeyChange }),
  });
  const descriptor = { slides, currentKey: current, ...(autoplay ? { autoplay } : {}) };
  const resolved = resolveCarouselDescriptor(descriptor, { composeAccessibleName });
  if (!label.trim() || Object.values(labels).some((value) => !value.trim())) throw new TypeError("Carousel labels must not be empty");
  const [rotating, setRotating] = useState(autoplay !== undefined);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  // Wait for the platform's answer before rotating: a screen reader can explore
  // content without moving keyboard focus, so focus handlers alone are insufficient.
  const [screenReader, setScreenReader] = useState(true);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => { if (alive.current) setScreenReader(enabled); }, () => {});
    const reader = AccessibilityInfo.addEventListener("screenReaderChanged", setScreenReader);
    const app = AppState.addEventListener("change", (state) => setForeground(state === "active"));
    return () => { alive.current = false; reader.remove(); app.remove(); };
  }, []);
  const last = current === slides.at(-1)!.id;
  const playing = isCarouselAutoplayActive(autoplay, { reducedMotion: environment.reducedMotion, paused: !rotating || !foreground || screenReader || last });
  useEffect(() => {
    if (!playing || !autoplay) return;
    const timer = setTimeout(() => setCurrent(getCarouselNavigationTarget(descriptor, "next")), autoplay.intervalMs);
    return () => clearTimeout(timer);
  }, [playing, autoplay?.intervalMs, current, slides, setCurrent]);
  function select(key: string) {
    setRotating(false);
    if (key === current) return;
    setCurrent(key);
    if (screenReader) AccessibilityInfo.announceForAccessibility(resolved.find((slide) => slide.id === key)!.accessibleName);
  }
  function move(intent: "next" | "previous") { select(getCarouselNavigationTarget(descriptor, intent)); }
  const swipe = PanResponder.create({
    // A horizontal, deliberate gesture yields vertical scrolling and simple taps
    // to card content. The control target token supplies the one-slide threshold.
    onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > carouselRecipe.dot.hitTarget / 2 && Math.abs(dx) > Math.abs(dy),
    onPanResponderGrant: () => setRotating(false),
    onPanResponderRelease: (_, { dx }) => {
      if (Math.abs(dx) >= carouselRecipe.dot.hitTarget) move((dx < 0) !== (environment.direction === "rtl") ? "next" : "previous");
    },
  });
  const selected = resolved.find((slide) => slide.current)!;
  return <View style={[{ gap: carouselRecipe.sizes.medium.gap, direction: environment.direction }, style]}>
    {autoplay ? <Button tone="ghost" disabled={environment.reducedMotion || screenReader}
      onPress={() => { if (last) setCurrent(slides[0]!.id); setRotating(!rotating || last); }}>
      {rotating && !last && !environment.reducedMotion && !screenReader ? labels.pause : labels.resume}
    </Button> : null}
    <View {...swipe.panHandlers} onTouchStart={() => setRotating(false)} onFocus={() => setRotating(false)}>
      {resolved.map((slide) => <View key={slide.id} style={slide.inert ? { display: "none" } : undefined}
        accessibilityElementsHidden={slide.inert} importantForAccessibility={slide.inert ? "no-hide-descendants" : "auto"}
        pointerEvents={slide.inert ? "none" : "auto"}>
        {renderSlide(slide)}
      </View>)}
    </View>
    {/* A separate adjustable position preserves access to interactive card children. */}
    <View accessible accessibilityRole="adjustable" accessibilityLabel={`${label}: ${selected.accessibleName}`}
      accessibilityValue={{ min: 1, max: slides.length, now: selected.position, text: selected.accessibleName }}
      accessibilityActions={[{ name: "increment", label: labels.next }, { name: "decrement", label: labels.previous }]}
      onAccessibilityAction={({ nativeEvent }) => { if (nativeEvent.actionName === "increment") move("next"); if (nativeEvent.actionName === "decrement") move("previous"); }}>
      <Text align="center" variant="caption">{selected.accessibleName}</Text>
    </View>
    <View accessibilityLabel={labels.navigation} onFocus={() => setRotating(false)} style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs, justifyContent: "center" }}>
      <Button tone="ghost" disabled={current === slides[0]!.id} onPress={() => move("previous")}>{labels.previous}</Button>
      {resolved.map((slide) => <Button key={slide.id} tone={slide.current ? "secondary" : "ghost"}
        accessibilityLabel={slide.accessibleName} accessibilityState={{ selected: slide.current }} onPress={() => select(slide.id)}>{String(slide.position)}</Button>)}
      <Button tone="ghost" disabled={last} onPress={() => move("next")}>{labels.next}</Button>
    </View>
  </View>;
}
