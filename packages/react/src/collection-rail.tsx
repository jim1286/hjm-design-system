import { useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import {
  collectionRailRecipe, validateCollectionRail, resolveCollectionRailLayout, resolveCollectionRailViewport,
  getCollectionRailTargetOffset, getCollectionRailItemOffset, getCollectionRailRevealOffset,
  getCollectionRailKeyboardIntent, type CollectionRailItem, type CollectionRailDensity, type CollectionRailLayout,
} from "@hjmds/design-contracts/collection-rail";
import { Button } from "./actions.js";
import { useOptionalHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CollectionRailLabels = Readonly<{ previous: string; next: string; navigation: string }>;
export type CollectionRailProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
  label: string; items: readonly CollectionRailItem[]; renderItem: (item: CollectionRailItem) => ReactNode;
  labels: CollectionRailLabels; density?: CollectionRailDensity; emptyContent?: ReactNode;
  /** Initial scroll anchor, not selection. Later collection changes reconcile by stable ID. */
  defaultStartKey?: string;
  /** Observed leading item, independent of product selection/detail state. Empty lists report null. */
  onStartKeyChange?: (key: string | null) => void;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Finite all-mounted list placement; Card, inputs and Dialog keep their own state. */
export function CollectionRail({ label, items, renderItem, labels, density = collectionRailRecipe.defaults.density,
  emptyContent, defaultStartKey, onStartKeyChange, layoutStyle, ...props }: CollectionRailProps) {
  validateCollectionRail(items);
  if (!label.trim() || Object.values(labels).some(value => !value.trim())) throw new TypeError("CollectionRail labels must not be empty");
  const theme = useOptionalHjmTheme(), direction = theme?.environment.direction ?? "ltr";
  const gap = collectionRailRecipe.gap;
  const viewportRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<string | null>(defaultStartKey ?? items[0]?.id ?? null);
  const initialized = useRef(false);
  if (!initialized.current) { validateCollectionRail(items, defaultStartKey); initialized.current = true; }
  const callback = useRef(onStartKeyChange); callback.current = onStartKeyChange;
  const current = useRef({ layout: resolveCollectionRailLayout(items.length, 0, density, gap), offset: 0 });
  const pendingOffset = useRef<number | null>(null);
  const [position, setPosition] = useState(current.current);
  const identity = JSON.stringify(items.map(item => item.id));
  const itemsRef = useRef(items); itemsRef.current = items;

  function publish(layout: CollectionRailLayout, offset: number) {
    const resolved = resolveCollectionRailViewport(layout, offset);
    const key = itemsRef.current[resolved.startIndex]?.id ?? null;
    if (key !== anchor.current) { anchor.current = key; callback.current?.(key); }
    current.current = { layout, offset: resolved.offset };
    setPosition(current.current);
  }
  function scrollToOffset(offset: number, animated: boolean) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const resolved = resolveCollectionRailViewport(current.current.layout, offset);
    // CSS RTL scrollLeft is negative; clamp Safari rubber-banding through the
    // shared logical resolver rather than reversing data or selection keys.
    viewport.scrollTo({ left: direction === "rtl" ? -resolved.offset : resolved.offset,
      behavior: animated && !theme?.environment.reducedMotion ? "smooth" : "instant" });
    pendingOffset.current = animated && !theme?.environment.reducedMotion ? resolved.offset : null;
    // Smooth scroll is a request, not an observed viewport. Publishing its
    // destination now would disable the end action and report an unseen anchor.
    publish(current.current.layout, direction === "rtl" ? -viewport.scrollLeft : viewport.scrollLeft);
  }
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let initialMeasurement = true;
    function measure() {
      const next = resolveCollectionRailLayout(itemsRef.current.length, viewport!.clientWidth, density, gap);
      // ResizeObserver also delivers an initial unchanged box. Re-aligning then
      // would undo a focus reveal that happened after the layout effect.
      if (!initialMeasurement && next.viewport === current.current.layout.viewport) return;
      initialMeasurement = false;
      pendingOffset.current = null;
      const index = Math.max(0, itemsRef.current.findIndex(item => item.id === anchor.current));
      let offset = next.count ? getCollectionRailItemOffset(next, index) : 0;
      const focused = document.activeElement?.closest("[data-collection-rail-item]");
      const focusedIndex = focused && viewport!.contains(focused)
        ? itemsRef.current.findIndex(item => item.id === focused.getAttribute("data-collection-rail-item")) : -1;
      // A narrower viewport cannot keep a distant focused action and the old
      // leading item visible together; focus exposure takes priority over anchor alignment.
      if (focusedIndex >= 0) offset = getCollectionRailRevealOffset(next, offset, focusedIndex);
      current.current = { layout: next, offset };
      // Width/direction changes keep the leading item's identity, and never
      // key/remount its input or detail owner (docs/collection-rail.md).
      viewport!.scrollTo({ left: direction === "rtl" ? -offset : offset, behavior: "instant" });
      publish(next, offset);
    }
    measure();
    const observer = new ResizeObserver(measure); observer.observe(viewport);
    return () => observer.disconnect();
  }, [identity, density, gap, direction]);

  function navigate(intent: "previous" | "next" | "first" | "last") {
    scrollToOffset(getCollectionRailTargetOffset(current.current.layout, pendingOffset.current ?? current.current.offset, intent), true);
  }
  const resolved = resolveCollectionRailViewport(position.layout, position.offset);
  return <div {...props} style={{ ...props.style, ...layoutStyle, minWidth: 0 }}
    data-collection-rail data-start-key={items[resolved.startIndex]?.id} dir={direction}
    onKeyDown={event => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      // Item widgets own arrows/Home/End. Rail navigation belongs only to its
      // viewport and explicit controls, not an input nested in a visible card.
      if (event.target !== viewportRef.current && !(event.target instanceof Element && event.target.closest("[data-collection-rail-controls]"))) return;
      const intent = getCollectionRailKeyboardIntent(event.key, direction);
      if (intent) { event.preventDefault(); navigate(intent); }
    }}>
    <div ref={viewportRef} role="list" aria-label={label} tabIndex={0} data-collection-rail-viewport
      style={{ overflowX: "auto", overscrollBehaviorX: "contain", minWidth: 0 }}
      onPointerDown={() => { pendingOffset.current = null; }} onWheel={() => { pendingOffset.current = null; }}
      onScroll={event => {
        const offset = direction === "rtl" ? -event.currentTarget.scrollLeft : event.currentTarget.scrollLeft;
        if (pendingOffset.current !== null && Math.abs(offset - pendingOffset.current) <= 0.5) pendingOffset.current = null;
        publish(current.current.layout, offset);
      }}>
      <div style={{ display: "flex", gap, width: "max-content", minWidth: "100%", paddingBlock: "var(--hjm-space-xs)" }}>
        {items.map((item, index) => <div key={item.id} role="listitem" data-collection-rail-item={item.id}
          style={{ flex: "0 0 auto", width: position.layout.itemWidth || "auto", minWidth: 0 }}
          onFocusCapture={() => scrollToOffset(getCollectionRailRevealOffset(current.current.layout, current.current.offset, index), false)}>
          {renderItem(item)}
        </div>)}
      </div>
      {items.length === 0 ? emptyContent : null}
    </div>
    <div data-collection-rail-controls role="group" aria-label={labels.navigation}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "var(--hjm-space-sm)", marginBlockStart: "var(--hjm-space-sm)" }}>
      <Button tone="ghost" aria-disabled={resolved.atStart} onClick={() => navigate("previous")}>{labels.previous}</Button>
      <Button tone="ghost" aria-disabled={resolved.atEnd} onClick={() => navigate("next")}>{labels.next}</Button>
    </div>
  </div>;
}
