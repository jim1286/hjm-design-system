import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import {
  collectionRailRecipe, validateCollectionRail, resolveCollectionRailLayout, resolveCollectionRailViewport,
  getCollectionRailTargetOffset, getCollectionRailItemOffset, getCollectionRailRevealOffset, getCollectionRailPhysicalOffset,
  type CollectionRailItem, type CollectionRailDensity,
} from "@hjmds/design-contracts/collection-rail";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CollectionRailLabels = Readonly<{ previous: string; next: string; navigation: string }>;
export type CollectionRailProps = Readonly<{
  label: string; items: readonly CollectionRailItem[]; renderItem: (item: CollectionRailItem) => ReactNode;
  labels: CollectionRailLabels; density?: CollectionRailDensity; emptyContent?: ReactNode;
  /** Initial scroll anchor, not a selected item or an open detail target. */
  defaultStartKey?: string; onStartKeyChange?: (key: string | null) => void;
  layoutStyle?: HjmCompositionStyleProp; testID?: string;
}>;

export function CollectionRail({ label, items, renderItem, labels, density = collectionRailRecipe.defaults.density,
  emptyContent, defaultStartKey, onStartKeyChange, layoutStyle, testID }: CollectionRailProps) {
  validateCollectionRail(items);
  if (!label.trim() || Object.values(labels).some(value => !value.trim())) throw new TypeError("CollectionRail labels must not be empty");
  const { environment, tokens } = useHjmNativeTheme(), direction = environment.direction;
  const scroll = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0), [offset, setOffset] = useState(0);
  const layout = resolveCollectionRailLayout(items.length, width, density, tokens.spacing.md);
  const geometry = useRef(layout); geometry.current = layout;
  const logicalOffset = useRef(0);
  const pendingOffset = useRef<number | null>(null);
  const anchor = useRef<string | null>(defaultStartKey ?? items[0]?.id ?? null);
  const focusedKey = useRef<string | null>(null);
  const initialized = useRef(false);
  if (!initialized.current) { validateCollectionRail(items, defaultStartKey); initialized.current = true; }
  const identity = JSON.stringify(items.map(item => item.id));
  function publish(next: number) {
    const state = resolveCollectionRailViewport(geometry.current, next);
    const key = items[state.startIndex]?.id ?? null;
    if (key !== anchor.current) { anchor.current = key; onStartKeyChange?.(key); }
    logicalOffset.current = state.offset; setOffset(state.offset);
  }
  function scrollToOffset(next: number, animated: boolean) {
    const x = getCollectionRailPhysicalOffset(geometry.current, next, direction);
    pendingOffset.current = animated && !environment.reducedMotion ? next : null;
    scroll.current?.scrollTo({ x, animated: animated && !environment.reducedMotion });
    // Native scrollTo also only delivers a command. The host's onScroll owns
    // observed anchors/end state; product callbacks must not report unseen items.
    if (!items.length) publish(0);
  }
  function alignAnchor() {
    const index = Math.max(0, items.findIndex(item => item.id === anchor.current));
    let target = items.length ? getCollectionRailItemOffset(geometry.current, index) : 0;
    const focusedIndex = items.findIndex(item => item.id === focusedKey.current);
    // Match Web: focused actions remain exposed when resize cannot retain both
    // the old leading item and the focused item's complete bounds.
    if (focusedIndex >= 0) target = getCollectionRailRevealOffset(geometry.current, target, focusedIndex);
    scrollToOffset(target, false);
  }
  useLayoutEffect(alignAnchor, [width, density, tokens.spacing.md, direction, identity]);
  function navigate(intent: "previous" | "next") {
    scrollToOffset(getCollectionRailTargetOffset(geometry.current, pendingOffset.current ?? logicalOffset.current, intent), true);
  }
  const state = resolveCollectionRailViewport(layout, offset);
  // Use one physical coordinate system on iOS/Android. Reverse only row
  // placement in RTL; keep data, reading order and child state keyed by ID.
  const contentWidth = useRef(0);
  return <View testID={testID} style={[{ direction, minWidth: 0 }, layoutStyle]}>
    <ScrollView ref={scroll} horizontal accessibilityRole="list" accessibilityLabel={label}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onContentSizeChange={nextWidth => {
        // The physical scroll range exists after content layout. Re-align only
        // for width changes; an edited card's height must not reset touch scroll.
        if (nextWidth !== contentWidth.current) { contentWidth.current = nextWidth; alignAnchor(); }
      }}
      onTouchStart={() => { pendingOffset.current = null; }}
      onScroll={event => {
        const next = direction === "rtl" ? geometry.current.maxOffset - event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.x;
        if (pendingOffset.current !== null && Math.abs(next - pendingOffset.current) <= 0.5) pendingOffset.current = null;
        publish(next);
      }}
      scrollEventThrottle={16} keyboardShouldPersistTaps="handled" removeClippedSubviews={false}
      style={{ direction: "ltr" }}
      contentContainerStyle={{ direction: "ltr", flexDirection: direction === "rtl" ? "row-reverse" : "row",
        gap: tokens.spacing.md, width: Math.max(layout.contentWidth, width), paddingVertical: tokens.spacing.xs }}>
      {items.map((item, index) => <View key={item.id} style={{ width: layout.itemWidth, direction }}
        onFocus={() => { focusedKey.current = item.id; scrollToOffset(getCollectionRailRevealOffset(geometry.current, logicalOffset.current, index), false); }}
        onBlur={() => { if (focusedKey.current === item.id) focusedKey.current = null; }}>
        {renderItem(item)}
      </View>)}
      {items.length === 0 ? emptyContent : null}
    </ScrollView>
    <View accessibilityLabel={labels.navigation} style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }}>
      <Button tone="ghost" disabled={state.atStart} onPress={() => navigate("previous")}>{labels.previous}</Button>
      <Button tone="ghost" disabled={state.atEnd} onPress={() => navigate("next")}>{labels.next}</Button>
    </View>
  </View>;
}
