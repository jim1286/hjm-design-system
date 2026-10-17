import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, AppState, PanResponder, Pressable, View } from "react-native";
import {
  carouselRecipe, resolveCarouselDescriptor, getCarouselNavigationTarget, isCarouselAutoplayActive,
  type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig,
  type ComposeCarouselAccessibleName,
} from "@hjmds/design-contracts/components/carousel";
import { Button, IconButton } from "./actions.js";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { glyph } from "@hjmds/design-contracts/foundations";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay,
  currentKey, defaultCurrentKey, onCurrentKeyChange, layoutStyle }: CarouselProps) {
  const { environment, palette, tokens } = useHjmNativeTheme();
  const [storedCurrent, setCurrent] = useControllableState({
    ...(currentKey === undefined ? {} : { value: currentKey }),
    defaultValue: defaultCurrentKey ?? slides[0]?.id ?? "",
    ...(onCurrentKeyChange === undefined ? {} : { onChange: onCurrentKeyChange }),
  });
  const previousIndex = useRef<number | null>(null);
  // A host can delete the current uncontrolled slide after mount. Keep its place
  // in the collection (or the new last slide); explicit invalid keys still fail validation.
  const recovering = currentKey === undefined && previousIndex.current !== null && !slides.some(slide => slide.id === storedCurrent);
  const current = recovering ? slides[Math.min(previousIndex.current!, slides.length - 1)]?.id ?? storedCurrent : storedCurrent;
  useLayoutEffect(() => {
    previousIndex.current = slides.findIndex(slide => slide.id === current);
    if (recovering) setCurrent(current);
  }, [current, recovering, slides, setCurrent]);
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
  const chevronColor = resolveIconButtonPresentation("ghost", palette, false).content;
  return <View style={[{ gap: carouselRecipe.sizes.medium.gap, direction: environment.direction }, layoutStyle]}>
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
    {/* Same controls as Web: previous/next icon buttons around position dots (2026-10-17 review N6; Native showed a
        caption plus numbered buttons with the current page as a secondary button). The dot row is one adjustable
        element, like a platform page control, which also keeps interactive card children reachable. */}
    <View accessibilityLabel={labels.navigation} onFocus={() => setRotating(false)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: tokens.spacing.xs }}>
      <IconButton label={labels.previous} tone="ghost" disabled={current === slides[0]!.id} onPress={() => move("previous")}>
        <DrawnChevron direction="start" size={glyph[carouselRecipe.sizes.medium.controlIcon]} color={chevronColor} />
      </IconButton>
      <View accessible accessibilityRole="adjustable" accessibilityLabel={`${label}: ${selected.accessibleName}`}
        accessibilityValue={{ min: 1, max: slides.length, now: selected.position, text: selected.accessibleName }}
        accessibilityActions={[{ name: "increment", label: labels.next }, { name: "decrement", label: labels.previous }]}
        onAccessibilityAction={({ nativeEvent }) => { if (nativeEvent.actionName === "increment") move("next"); if (nativeEvent.actionName === "decrement") move("previous"); }}
        style={{ flexDirection: "row", flexShrink: 1, flexWrap: "wrap", justifyContent: "center" }}>
        {resolved.map((slide) => <Pressable key={slide.id} accessible={false} accessibilityLabel={slide.accessibleName} onPress={() => select(slide.id)}
          style={{ alignItems: "center", height: carouselRecipe.dot.hitTarget, justifyContent: "center", width: carouselRecipe.dot.hitTarget }}>
          <View style={{ backgroundColor: resolveColorReference(slide.current ? carouselRecipe.dot.color.current : carouselRecipe.dot.color.inactive, palette), borderRadius: carouselRecipe.dot.diameter / 2, height: carouselRecipe.dot.diameter, width: carouselRecipe.dot.diameter }} />
        </Pressable>)}
      </View>
      <IconButton label={labels.next} tone="ghost" disabled={last} onPress={() => move("next")}>
        <DrawnChevron direction="end" size={glyph[carouselRecipe.sizes.medium.controlIcon]} color={chevronColor} />
      </IconButton>
    </View>
  </View>;
}
