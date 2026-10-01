import { useEffect, useRef, type ReactNode } from "react";
import { View } from "react-native";
import { Carousel, type CarouselRef } from "react-native-reanimated-carousel";
import { scheduleOnRN } from "react-native-worklets";
import type { SortableItem } from "@hjmds/design-contracts/components/interaction-adapters";
import { resolveCarouselDescriptor, getCarouselNavigationTarget, type ComposeCarouselAccessibleName } from "@hjmds/design-contracts/components/carousel";
import { motion as timing } from "@hjmds/design-contracts/foundations";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";

/** Fraction of a slide past which a slow release still pages (platform paging uses half). */
const carouselReleasePageFraction = 0.5;
/** Opposite release speed (px/s) treated as a deliberate fling back, not a pause. */
const carouselReleaseFlingBack = 300;

export type CarouselMotionProps = {
  slides: readonly SortableItem[]; currentKey: string; onCurrentKeyChange(key: string): void;
  /** Optional localized position/name composer shared with the base Carousel. */
  composeAccessibleName?: ComposeCarouselAccessibleName;
  renderSlide(item: SortableItem): ReactNode; label: string; previousLabel: string; nextLabel: string;
  /** Measured host space, not a device-width assumption. */
  width: number; height: number;
};
export function CarouselMotion(props: CarouselMotionProps) {
  const descriptor = { slides: props.slides, currentKey: props.currentKey };
  // Share finite keyed selection and names with Carousel; the optional peer owns
  // only swipe/motion. No autoplay is implied by this controlled presentation.
  const resolved = resolveCarouselDescriptor(descriptor, {
    composeAccessibleName: props.composeAccessibleName ?? ((info) => info.label),
  });
  const index = resolved.findIndex(slide => slide.current);
  if (![props.label, props.previousLabel, props.nextLabel].every(label => label.trim())) {
    throw new TypeError("CarouselMotion labels must not be empty");
  }
  if (![props.width, props.height].every(value => Number.isFinite(value) && value > 0)) throw new TypeError("Carousel needs positive measured dimensions");
  const { environment } = useHjmNativeTheme();
  const ref = useRef<CarouselRef>(null);
  const latest = useRef({ index, props }); latest.current = { index, props };
  const rtl = environment.direction === "rtl";
  const { width } = props;
  // JS side of the release fallback below; reads the latest index so a stale
  // gesture closure cannot page from an old slide.
  const pageBy = (delta: 1 | -1) => {
    const { props: live } = latest.current;
    const target = getCarouselNavigationTarget({ slides: live.slides, currentKey: live.currentKey }, delta === 1 ? "next" : "previous");
    if (target !== live.currentKey) live.onCurrentKeyChange(target);
  };
  useEffect(() => { if (ref.current?.getCurrentIndex() !== index) ref.current?.scrollTo({ index, animated: !environment.reducedMotion }); }, [index, environment.reducedMotion]);
  return <View accessibilityLabel={props.label}>
    <Carousel ref={ref} data={[...props.slides]} defaultIndex={index} keyExtractor={item => item.id}
      style={{ width: props.width, height: props.height, direction: environment.direction }} loop={false} autoplay={false}
      animation={{ type: "timing", duration: environment.reducedMotion ? 0 : timing.normal }}
      // A deliberate horizontal move wins; vertical intent stays with the parent scroll view.
      // The library's "page" snap only advances when the release velocity points the
      // way of the drag. A finger that slowed or paused before lifting (velocity ~0)
      // snapped back even from 74% of a slide: 2026-09-30 Android audit D6, reproduced
      // at 450-600 ms swipes under host load. Past half a slide with no fling back, we
      // page one slide ourselves. Rejected: snapMode "nearest", which lets a fling skip
      // several slides; a lower activeOffsetX, which does not touch the release rule.
      onConfigurePanGesture={gesture => gesture.activeOffsetX([-10, 10]).failOffsetY([-10, 10]).onEnd(event => {
        "worklet";
        const dx = event.translationX;
        const vx = event.velocityX;
        if (Math.abs(dx) < width * carouselReleasePageFraction) return;
        if (vx !== 0 && Math.sign(vx) === Math.sign(dx)) return;
        if (Math.abs(vx) > carouselReleaseFlingBack) return;
        const forward = dx < 0 ? 1 : -1;
        scheduleOnRN(pageBy, (rtl ? -forward : forward) as 1 | -1);
      })}
      onSnapToItem={next => { const slide = props.slides[next]; if (slide && slide.id !== props.currentKey) props.onCurrentKeyChange(slide.id); }}
      renderItem={({ item, index: i }) => <View accessibilityLabel={resolved[i]!.accessibleName} accessibilityElementsHidden={resolved[i]!.inert} importantForAccessibility={i === index ? "auto" : "no-hide-descendants"}
        pointerEvents={i === index ? "auto" : "none"}>{props.renderSlide(item)}</View>} />
    <Button tone="ghost" disabled={index === 0} onPress={() => props.onCurrentKeyChange(getCarouselNavigationTarget(descriptor, "previous"))}>{props.previousLabel}</Button>
    <Button tone="ghost" disabled={index === props.slides.length - 1} onPress={() => props.onCurrentKeyChange(getCarouselNavigationTarget(descriptor, "next"))}>{props.nextLabel}</Button>
  </View>;
}
