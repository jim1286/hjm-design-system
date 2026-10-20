import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, AppState, PanResponder, Pressable, ScrollView, View } from "react-native";
import {
  carouselRecipe, resolveCarouselDescriptor, getCarouselNavigationTarget, isCarouselAutoplayActive,
  resolvePageIndicator, getPageIndicatorTarget,
  type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig,
  type ComposeCarouselAccessibleName, type ComposePageIndicatorAccessibleName,
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
  /** Available content height in a bounded host, such as a map overlay. Navigation stays outside the scrolling slide. */
  slideMaxHeight?: number;
  /** Disable the slide gesture when content owns horizontal gestures, such as an interactive map. Buttons and accessibility navigation remain available. */
  swipeEnabled?: boolean;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export type PageIndicatorLabels = Readonly<{ previous: string; next: string }>;
export type PageIndicatorProps = Readonly<{
  /** Name of the paged region, read before the current page name (e.g. "Home pages"). */
  label: string;
  count: number;
  /** Zero-based current page; the product pager owns it. */
  currentIndex: number;
  /** Limit visible dots while retaining absolute page names and navigation. */
  maxVisibleDots?: number;
  /** Position-only dots when separate pager controls own navigation. Default true retains 44pt dot targets. */
  interactive?: boolean;
  /** Requested page from a dot press or an adjustable action. It can repeat the current index. */
  onCurrentIndexChange: (index: number) => void;
  composeAccessibleName: ComposePageIndicatorAccessibleName;
  /** Localized names of the adjustable increment/decrement actions. */
  labels: PageIndicatorLabels;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  testID?: string;
}>;

/**
 * Carousel's position dots for a product-owned pager. The row is one adjustable element, like a platform page
 * control, so a screen reader hears "label: page name" and swipes up/down to move; each dot is a 44pt target.
 */
export function PageIndicator({ label, count, currentIndex, maxVisibleDots, interactive = true, onCurrentIndexChange, composeAccessibleName, labels,
  layoutStyle, testID }: PageIndicatorProps) {
  const { palette } = useHjmNativeTheme();
  if (!label.trim() || !labels.previous.trim() || !labels.next.trim()) throw new TypeError("PageIndicator labels must not be empty");
  const descriptor = { count, currentIndex, ...(maxVisibleDots === undefined ? {} : { maxVisibleDots }) };
  const dots = resolvePageIndicator(descriptor, composeAccessibleName);
  const current = dots.find(dot => dot.current)!;
  const move = (intent: "next" | "previous") => onCurrentIndexChange(getPageIndicatorTarget(descriptor, intent));
  if (!interactive) return <View testID={testID} accessible accessibilityRole="image" accessibilityLabel={current.accessibleName}
    style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: carouselRecipe.dot.compactGap }, layoutStyle]}>
    {dots.map(dot => <View key={dot.index} accessible={false} style={{ width: carouselRecipe.dot.diameter, height: carouselRecipe.dot.diameter,
      borderRadius: carouselRecipe.dot.diameter / 2,
      backgroundColor: resolveColorReference(dot.current ? carouselRecipe.dot.color.current : carouselRecipe.dot.color.inactive, palette) }} />)}
  </View>;
  return <View testID={testID} accessible accessibilityRole="adjustable" accessibilityLabel={`${label}: ${current.accessibleName}`}
    accessibilityValue={{ min: 1, max: count, now: current.position, text: current.accessibleName }}
    accessibilityActions={[{ name: "increment", label: labels.next }, { name: "decrement", label: labels.previous }]}
    onAccessibilityAction={({ nativeEvent }) => { if (nativeEvent.actionName === "increment") move("next"); if (nativeEvent.actionName === "decrement") move("previous"); }}
    style={[{ flexDirection: "row", flexShrink: 1, flexWrap: "wrap", justifyContent: "center" }, layoutStyle]}>
    {dots.map((dot) => <Pressable key={dot.index} accessible={false} accessibilityLabel={dot.accessibleName} onPress={() => onCurrentIndexChange(dot.index)}
      style={{ alignItems: "center", height: carouselRecipe.dot.hitTarget, justifyContent: "center", width: carouselRecipe.dot.hitTarget }}>
      <View style={{ backgroundColor: resolveColorReference(dot.current ? carouselRecipe.dot.color.current : carouselRecipe.dot.color.inactive, palette), borderRadius: carouselRecipe.dot.diameter / 2, height: carouselRecipe.dot.diameter, width: carouselRecipe.dot.diameter }} />
    </Pressable>)}
  </View>;
}

export function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay,
  currentKey, defaultCurrentKey, onCurrentKeyChange, layoutStyle, swipeEnabled = true, slideMaxHeight }: CarouselProps) {
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
  if (slideMaxHeight !== undefined && (!Number.isFinite(slideMaxHeight) || slideMaxHeight <= 0)) throw new TypeError("Carousel slideMaxHeight must be finite and positive");
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
    <View {...(swipeEnabled ? swipe.panHandlers : {})} onTouchStart={() => setRotating(false)} onFocus={() => setRotating(false)}>
      {resolved.map((slide) => <View key={slide.id} style={slide.inert ? { display: "none" } : undefined}
        accessibilityElementsHidden={slide.inert} importantForAccessibility={slide.inert ? "no-hide-descendants" : "auto"}
        pointerEvents={slide.inert ? "none" : "auto"}>
        {slideMaxHeight === undefined ? renderSlide(slide) : <ScrollView style={{ maxHeight: slideMaxHeight, flexGrow: 0 }}>
          {renderSlide(slide)}
        </ScrollView>}
      </View>)}
    </View>
    {/* Same controls as Web: previous/next icon buttons around position dots (2026-10-17 review N6; Native showed a
        caption plus numbered buttons with the current page as a secondary button). The dot row is one adjustable
        element, like a platform page control, which also keeps interactive card children reachable. */}
    <View accessibilityLabel={labels.navigation} onFocus={() => setRotating(false)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: tokens.spacing.xs }}>
      <IconButton label={labels.previous} tone="ghost" disabled={current === slides[0]!.id} onPress={() => move("previous")}>
        <DrawnChevron direction="start" size={glyph[carouselRecipe.sizes.medium.controlIcon]} color={chevronColor} />
      </IconButton>
      <PageIndicator label={label} count={slides.length} currentIndex={selected.position - 1}
        composeAccessibleName={({ position }) => resolved[position - 1]!.accessibleName}
        labels={{ previous: labels.previous, next: labels.next }}
        onCurrentIndexChange={(index) => select(slides[index]!.id)} />
      <IconButton label={labels.next} tone="ghost" disabled={last} onPress={() => move("next")}>
        <DrawnChevron direction="end" size={glyph[carouselRecipe.sizes.medium.controlIcon]} color={chevronColor} />
      </IconButton>
    </View>
  </View>;
}
