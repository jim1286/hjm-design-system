import type { ComponentRef } from "react";
import { useRef, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { chipRecipe } from "@hjmds/design-contracts/recipes";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { shortcutRailRecipe, validateShortcutRail, revealShortcut, type ShortcutRailItem } from "@hjmds/design-contracts/shortcut-rail";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type ShortcutRailProps<Item extends ShortcutRailItem = ShortcutRailItem> = Readonly<{
  // Infer payload from items; a product's base-typed handler must not erase extra fields.
  label: string; items: readonly Item[]; onAction(item: NoInfer<Item>): void;
  /** Controls before the item list, in the same scroll/wrap flow. */
  leading?: ReactNode;
  layout?: "scroll" | "wrap";
  size?: keyof typeof chipRecipe.sizes;
  renderLeading?(item: NoInfer<Item>): ReactNode;
  layoutStyle?: HjmCompositionStyleProp; testID?: string;
}> & (Readonly<{ onRemove(item: NoInfer<Item>): void; removeLabel(item: NoInfer<Item>): string; removeIcon?: ReactNode; isRemovable?(item: NoInfer<Item>): boolean }>
  | Readonly<{ onRemove?: never; removeLabel?: never; removeIcon?: never; isRemovable?: never }>);

export function ShortcutRail<Item extends ShortcutRailItem>({ label, items, onAction, onRemove, removeLabel, removeIcon, isRemovable, leading,
  layout = shortcutRailRecipe.defaults.layout, size = chipRecipe.defaults.size, renderLeading, layoutStyle, testID }: ShortcutRailProps<Item>) {
  validateShortcutRail(items, label, layout);
  const { palette, tokens, environment } = useHjmNativeTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null), viewport = useRef(0), offset = useRef(0);
  const frames = useRef(new Map<string, { x: number; width: number }>());
  const leadingFrame = useRef<{ x: number; width: number } | null>(null);
  const hasLeading = leading != null && leading !== false;
  const metrics = chipRecipe.sizes[size], presentation = chipRecipe.states.idle;
  const visualHeight = visibleControlHeight(metrics.height, environment.minimumVisualTarget);
  const targetHeight = Math.max(visualHeight, shortcutRailRecipe.minTouchTarget);
  const paintInset = (targetHeight - visualHeight) / 2;
  const content = resolveColorReference(presentation.content, palette);
  function revealFrame(frame: { x: number; width: number } | null | undefined) {
    if (!frame || viewport.current <= 0) return;
    const x = revealShortcut(offset.current, viewport.current, frame.x, frame.width);
    if (x !== offset.current) scroll.current?.scrollTo({ x, animated: false });
  }
  function reveal(id: string) { revealFrame(frames.current.get(id)); }
  if (!items.length && !hasLeading) return null;
  const controls = hasLeading ? <View onLayout={event => { leadingFrame.current = event.nativeEvent.layout; }}
    onFocus={() => { if (layout === "scroll") revealFrame(leadingFrame.current); }}
    style={{ flexDirection: "row", alignItems: "center", direction: environment.direction }}>{leading}</View> : null;
  const entries = items.map(item => <View key={item.id} onLayout={event => { frames.current.set(item.id, event.nativeEvent.layout); }}
      onFocus={() => { if (layout === "scroll") reveal(item.id); }} style={{ ...(layout === "wrap" ? { maxWidth: "100%" as const } : {}), flexDirection: "row", direction: environment.direction, alignItems: "stretch",
        opacity: item.disabled ? chipRecipe.states.disabledOpacity : 1 }}>
      <View pointerEvents="none" accessible={false} style={{ position: "absolute", top: paintInset, bottom: paintInset, left: 0, right: 0,
        borderWidth: chipRecipe.borderWidth, borderRadius: tokens.radius[chipRecipe.radius],
        borderColor: resolveColorReference(presentation.border, palette), backgroundColor: resolveColorReference(presentation.background, palette) }} />
      <Pressable accessibilityRole="button" accessibilityLabel={item.label} accessibilityHint={item.description} accessibilityState={{ disabled: !!item.disabled }}
        disabled={item.disabled} testID={testID ? `${testID}-${item.id}` : undefined} onPress={() => { if (!item.disabled) onAction(item); }}
        style={({ pressed }) => ({ ...(layout === "wrap" ? { flexShrink: 1 } : {}), flexDirection: "row", alignItems: "center", gap: metrics.gap,
          minWidth: shortcutRailRecipe.actionMinWidth, minHeight: targetHeight, paddingHorizontal: metrics.paddingHorizontal,
          borderRadius: tokens.radius[chipRecipe.radius], opacity: pressed ? chipRecipe.states.pressedOpacity : 1 })}>
        {renderLeading ? <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{renderLeading(item)}</View> : null}
        <Text fontRole="ui" variant={metrics.textVariant} style={{ ...(layout === "wrap" ? { flexShrink: 1, minWidth: 0 } : {}), color: content, fontWeight: chipRecipe.label.fontWeight }}>{item.label}</Text>
      </Pressable>
      {onRemove && isRemovable?.(item) !== false ? <Pressable accessibilityRole="button" accessibilityLabel={removeLabel(item)} accessibilityState={{ disabled: !!item.disabled }}
        disabled={item.disabled} testID={testID ? `${testID}-remove-${item.id}` : undefined} onPress={() => { if (!item.disabled) onRemove(item); }}
        style={({ pressed }) => ({ width: shortcutRailRecipe.removeWidth, minHeight: targetHeight, alignItems: "center", justifyContent: "center",
          borderRadius: tokens.radius[chipRecipe.radius], opacity: pressed ? chipRecipe.states.pressedOpacity : 1 })}>
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{removeIcon ?? <FixedGlyph color={content} fontSize={shortcutRailRecipe.glyph}>×</FixedGlyph>}</View>
      </Pressable> : null}
    </View>);
  if (layout === "wrap") return <View accessibilityRole="list" accessibilityLabel={label} testID={testID}
    style={[{ flexDirection: "row", flexWrap: "wrap", gap: shortcutRailRecipe.gap, direction: environment.direction }, layoutStyle]}>{controls}{entries}</View>;
  return <ScrollView horizontal ref={scroll} accessibilityRole="list" accessibilityLabel={label} testID={testID}
    showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" removeClippedSubviews={false}
    onLayout={event => { viewport.current = event.nativeEvent.layout.width; }}
    onScroll={event => { offset.current = event.nativeEvent.contentOffset.x; }} scrollEventThrottle={16}
    style={[{ flexGrow: 0, direction: "ltr" }, layoutStyle]}
    contentContainerStyle={{ flexDirection: environment.direction === "rtl" ? "row-reverse" : "row", gap: shortcutRailRecipe.gap,
      paddingVertical: metrics.hitSlop }}>
    {controls}{entries}
  </ScrollView>;
}
