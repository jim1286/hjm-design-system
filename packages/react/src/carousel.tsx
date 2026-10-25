"use client";

import { useEffect, useLayoutEffect, useRef, useState, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  resolveCarouselDescriptor, getCarouselNavigationTarget, isCarouselAutoplayActive,
  resolvePageIndicator, getPageIndicatorTarget,
  type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig,
  type ComposeCarouselAccessibleName, type ComposePageIndicatorAccessibleName, type ResolvedPageIndicatorDot,
} from "@hjmds/design-contracts/components/carousel";
import { Button, IconButton } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import { assignRef, classNames, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CarouselLabels = Readonly<{ previous: string; next: string; pause: string; resume: string; navigation: string }>;
export type CarouselProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & CarouselSelection & Readonly<{
  label: string;
  slides: readonly CarouselSlideDescriptor[];
  renderSlide: (slide: CarouselSlideDescriptor) => ReactNode;
  composeAccessibleName: ComposeCarouselAccessibleName;
  labels: CarouselLabels;
  autoplay?: CarouselAutoplayConfig;
  /** Available content height in a bounded host. Navigation stays outside the scrolling slide. */
  slideMaxHeight?: number;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export type PageIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & Readonly<{
  /** Name of the paged region (e.g. "Home pages"); the group's accessible name. */
  label: string;
  count: number;
  /** Zero-based current page; the product pager owns it. */
  currentIndex: number;
  /** Limit visible dots while retaining absolute page names and navigation. */
  maxVisibleDots?: number;
  /** Position-only dots when separate pager controls own navigation. Default true retains 44pt dot targets. */
  interactive?: boolean;
  /** Compact dots retain full target height with narrower, non-overlapping horizontal targets. */
  density?: "comfortable" | "compact";
  /** Requested page from a dot or an arrow key. It can repeat the current index. */
  onCurrentIndexChange: (index: number) => void;
  composeAccessibleName: ComposePageIndicatorAccessibleName;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** The dot buttons shared by Carousel and PageIndicator, so both rows keep one markup and one recipe. */
function PageDots({ dots, onSelect, dotClassName, keys }: Readonly<{
  dots: readonly ResolvedPageIndicatorDot[];
  onSelect: (index: number) => void;
  dotClassName: string;
  /** Carousel keys dots by slide id so removing a slide removes its own (possibly focused) dot. */
  keys?: readonly string[];
}>) {
  return <>{dots.map((dot) => <button key={keys?.[dot.index] ?? dot.index} type="button" aria-label={dot.accessibleName}
    aria-disabled={dot.current} data-current={dot.current} className={dotClassName}
    onClick={() => onSelect(dot.index)}><span aria-hidden="true" /></button>)}</>;
}

/**
 * Carousel's position dots for a product-owned pager (scroll-snap row, virtualized pager). Arrow keys on a dot move
 * one page in reading direction, as in Carousel's controls.
 */
export const PageIndicator = forwardRef<HTMLDivElement, PageIndicatorProps>(function PageIndicator({
  label, count, currentIndex, maxVisibleDots, interactive = true, density = "comfortable", onCurrentIndexChange, composeAccessibleName, className, onKeyDown, onFocusCapture, layoutStyle, ...props
}, ref) {
  const theme = useOptionalHjmTheme();
  const host = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    // Moving the bounded window can remove the focused dot. Recover within the same control only when
    // removal left focus on body; a user who moved elsewhere keeps that focus.
    if (interactive && lastFocused.current && !lastFocused.current.isConnected && document.activeElement === document.body) {
      host.current?.querySelector<HTMLButtonElement>('.hjm-page-indicator__dot[data-current="true"]')?.focus();
    }
  }, [interactive, count, currentIndex, maxVisibleDots]);
  if (!label.trim()) throw new TypeError("PageIndicator label must not be empty");
  const descriptor = { count, currentIndex, ...(maxVisibleDots === undefined ? {} : { maxVisibleDots }) };
  const dots = resolvePageIndicator(descriptor, composeAccessibleName);
  const current = dots.find(dot => dot.current)!;
  return <div {...props} ref={node => { host.current = node; assignRef(ref, node); }} style={{ ...props.style, ...layoutStyle }} role={interactive ? "group" : "img"} aria-label={interactive ? label : current.accessibleName} data-interactive={interactive} data-density={density}
    className={classNames("hjm-page-indicator", className)}
    onFocusCapture={event => {
      lastFocused.current = event.target instanceof HTMLElement ? event.target : null;
      onFocusCapture?.(event);
    }}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (!interactive || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      onCurrentIndexChange(getPageIndicatorTarget(descriptor,
        (event.key === "ArrowRight") !== (theme?.environment.direction === "rtl") ? "next" : "previous"));
    }}>
    {interactive ? <PageDots dots={dots} onSelect={onCurrentIndexChange} dotClassName="hjm-page-indicator__dot" />
      : dots.map(dot => <span key={dot.index} aria-hidden="true" data-current={dot.current} className="hjm-page-indicator__marker"><span /></span>)}
  </div>;
});

/** Finite keyed cards. Hidden slides stay mounted but cannot receive focus. */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel({
  label, slides, renderSlide, composeAccessibleName, labels, autoplay,
  currentKey, defaultCurrentKey, onCurrentKeyChange, className,
  onFocusCapture, onMouseEnter, onMouseLeave, onKeyDown, layoutStyle, slideMaxHeight, ...props
}, ref) {
  const theme = useOptionalHjmTheme();
  const [storedCurrent, setCurrent] = useControllableState({
    ...(currentKey === undefined ? {} : { value: currentKey }),
    defaultValue: defaultCurrentKey ?? slides[0]?.id ?? "",
    ...(onCurrentKeyChange === undefined ? {} : { onChange: onCurrentKeyChange }),
  });
  const previousIndex = useRef<number | null>(null);
  const host = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  // A host can delete the current uncontrolled slide after mount. Keep its place
  // in the collection (or the new last slide); explicit invalid keys still fail validation.
  const recovering = currentKey === undefined && previousIndex.current !== null && !slides.some(slide => slide.id === storedCurrent);
  const current = recovering ? slides[Math.min(previousIndex.current!, slides.length - 1)]?.id ?? storedCurrent : storedCurrent;
  useLayoutEffect(() => {
    previousIndex.current = slides.findIndex(slide => slide.id === current);
    if (recovering) {
      setCurrent(current);
      // A removed dot/card can strand focus on body; retained controls keep their focus.
      if (lastFocused.current && !lastFocused.current.isConnected && document.activeElement === document.body) {
        host.current?.querySelector<HTMLButtonElement>('.hjm-carousel__dot[data-current="true"]')?.focus();
      }
    }
  }, [current, recovering, slides, setCurrent]);
  const descriptor = { slides, currentKey: current, ...(autoplay ? { autoplay } : {}) };
  const resolved = resolveCarouselDescriptor(descriptor, { composeAccessibleName });
  if (!label.trim() || Object.values(labels).some((value) => !value.trim())) throw new TypeError("Carousel labels must not be empty");
  if (slideMaxHeight !== undefined && (!Number.isFinite(slideMaxHeight) || slideMaxHeight <= 0)) throw new TypeError("Carousel slideMaxHeight must be finite and positive");
  const [rotating, setRotating] = useState(autoplay !== undefined);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pointerRotation = useRef<boolean | null>(null);
  const last = current === slides.at(-1)!.id;
  const playing = isCarouselAutoplayActive(autoplay, {
    reducedMotion: theme?.environment.reducedMotion ?? false,
    paused: !rotating || hovered || hidden || last,
  });
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!playing || !autoplay) return;
    const timer = setTimeout(() => setCurrent(getCarouselNavigationTarget(descriptor, "next")), autoplay.intervalMs);
    return () => clearTimeout(timer);
  }, [playing, autoplay?.intervalMs, current, slides, setCurrent]);
  function select(key: string) { setRotating(false); if (key !== current) setCurrent(key); }
  function move(intent: "next" | "previous") { select(getCarouselNavigationTarget(descriptor, intent)); }
  const rotationRequested = rotating && !last && !theme?.environment.reducedMotion;
  return <div {...props} style={{ ...props.style, ...layoutStyle }} ref={node => { host.current = node; assignRef(ref, node); }} role="region" aria-label={label} aria-roledescription="carousel"
    className={classNames("hjm-carousel", className)} data-large-text={isLargeTextScale(theme?.environment.textScale ?? 1)}
    onFocusCapture={(event) => {
      lastFocused.current = event.target instanceof HTMLElement ? event.target : null;
      // APG: leaving focus must not silently restart rotation. Explicit resume is required.
      if (!event.currentTarget.contains(event.relatedTarget)) setRotating(false);
      onFocusCapture?.(event);
    }}
    onMouseEnter={(event) => { setHovered(true); onMouseEnter?.(event); }}
    onMouseLeave={(event) => { setHovered(false); onMouseLeave?.(event); }}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      // Do not steal editing/navigation keys from links, inputs or widgets inside a card.
      if (!(event.target instanceof Element) || !event.target.closest("[data-carousel-controls]")) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move((event.key === "ArrowRight") !== (theme?.environment.direction === "rtl") ? "next" : "previous");
    }}>
    {autoplay ? <Button tone="ghost" className="hjm-carousel__rotation" disabled={theme?.environment.reducedMotion}
      onPointerDown={() => { pointerRotation.current = !rotationRequested; }}
      onPointerCancel={() => { pointerRotation.current = null; }}
      onClick={(event) => {
        // An abandoned pointer gesture must not override a later keyboard activation.
        const next = event.detail > 0 ? pointerRotation.current ?? !rotationRequested : !rotationRequested;
        pointerRotation.current = null;
        if (next && last) setCurrent(slides[0]!.id);
        setRotating(next);
      }}>{rotationRequested ? labels.pause : labels.resume}</Button> : null}
    <div className="hjm-carousel__track" aria-live={playing ? "off" : "polite"} aria-atomic={false}>
      {resolved.map((slide) => <div key={slide.id} className="hjm-carousel__slide" role="group"
        aria-roledescription="slide" aria-label={slide.accessibleName} hidden={slide.inert} inert={slide.inert}
        tabIndex={slideMaxHeight === undefined ? undefined : 0}
        style={slideMaxHeight === undefined ? undefined : { maxHeight: slideMaxHeight, overflowY: "auto" }}>
        {renderSlide(slide)}
      </div>)}
    </div>
    <div className="hjm-carousel__controls" data-carousel-controls role="group" aria-label={labels.navigation}>
      {/* Previous/next are tool actions: icon buttons named by the localized label (2026-10-17 review E9). */}
      <IconButton label={labels.previous} tone="ghost" aria-disabled={current === slides[0]!.id} onClick={() => move("previous")}><Icon name="chevronStart" /></IconButton>
      <div className="hjm-carousel__dots">
        <PageDots dotClassName="hjm-carousel__dot" keys={slides.map((slide) => slide.id)} onSelect={(index) => select(slides[index]!.id)}
          dots={resolvePageIndicator({ count: slides.length, currentIndex: resolved.findIndex((slide) => slide.current) },
            ({ position }) => resolved[position - 1]!.accessibleName)} />
      </div>
      <IconButton label={labels.next} tone="ghost" aria-disabled={last} onClick={() => move("next")}><Icon name="chevronEnd" /></IconButton>
    </div>
  </div>;
});
