import { useState, type ReactNode } from "react";
import { FlatList, Pressable, View } from "react-native";
import {
  imageChoiceRecipe, resolveImageChoiceCaptionLines, resolveImageChoiceColumns, resolveImageChoiceOuterSize, resolveImageChoiceTileHeight,
  resolveImageChoiceToggle, validateImageChoiceItemLabelLines, validateImageChoiceItems, type ImageChoiceItemDescriptor, type ImageChoiceItemLabelLines,
} from "@hjmds/design-contracts/components/image-choice";
import { resolveVirtualWindow, virtualListRecipe } from "@hjmds/design-contracts/components/virtual-list";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";

export type ImageChoiceItem = ImageChoiceItemDescriptor & Readonly<{ image: ReactNode }>;
export type ImageChoiceVirtualization = Readonly<{
  /** Height of the scrolling viewport in dp. The group scrolls itself (a FlatList): do not nest it in a ScrollView. */
  height: number;
  /** Rows rendered beyond the visible window on first mount. */
  overscan?: number;
}>;
type Base = Readonly<{
  /** Localized group name read before the choices. */
  label: string;
  /** Visible caption above the tiles; omit when the screen heading already names the choice. */
  showLabel?: boolean;
  /**
   * Shows each item's `label` under its tile (one ellipsized line), e.g. a person's name in a recipient picker.
   * The tile keeps the same accessible name, so turning this on does not change what screen readers announce.
   */
  showItemLabels?: boolean;
  /** Lines the visible item label wraps to before the ellipsis (default 1). Every tile reserves the same height. */
  itemLabelLines?: ImageChoiceItemLabelLines;
  items: readonly ImageChoiceItem[];
  disabled?: boolean;
  /**
   * Long lists (hundreds of people): rows are recycled by a FlatList. Tiles keep their size; the column count follows
   * the measured width.
   */
  virtualized?: ImageChoiceVirtualization;
}>;
export type ImageChoiceGroupProps = Base & (
  | Readonly<{ selectionMode: "single"; value: string | null; onValueChange(value: string): void }>
  | Readonly<{ selectionMode: "multiple"; value: readonly string[]; onValueChange(value: string[]): void }>
);

/**
 * Picks avatars or photos by image (2026-10-16). Tiles are square, wrap to the available width, and show
 * a brand ring plus a check when chosen; screen readers hear radios (single) or checkboxes (multiple).
 */
export function ImageChoiceGroup(props: ImageChoiceGroupProps) {
  const { label, showLabel = false, showItemLabels = false, itemLabelLines = imageChoiceRecipe.itemLabelLines, items, disabled = false, virtualized } = props;
  validateImageChoiceItems(items);
  validateImageChoiceItemLabelLines(itemLabelLines);
  const { colors, textScaling, tokens } = useHjmNativeTheme();
  const [width, setWidth] = useState(0);
  const recipe = imageChoiceRecipe;
  const isSelected = (id: string) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
  const choose = (id: string) => {
    if (props.selectionMode === "single") props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
    else props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
  };
  const role = props.selectionMode === "single" ? "radio" : "checkbox";
  const groupRole = props.selectionMode === "single" ? "radiogroup" : "list";
  const outer = resolveImageChoiceOuterSize();
  const captionLines = resolveImageChoiceCaptionLines({ showItemLabels, itemLabelLines, hasDescription: items.some(item => item.description !== undefined) });
  // Rendered caption line height: Text scales the token by the Provider's controlled or OS text scale.
  const captionLineHeight = tokens.typography[recipe.itemLabelVariant].lineHeight * textScaling.scale;
  const tileHeight = resolveImageChoiceTileHeight(captionLines, captionLineHeight);
  const renderTile = (item: ImageChoiceItem) => {
    const selected = isSelected(item.id);
    const off = disabled || (item.disabled ?? false);
    // The ring lives on an inner frame so an item label can sit below it inside the same Pressable: Android does
    // not deliver touches to children drawn outside their parent's bounds, so the name must not overflow the tile.
    return <Pressable key={item.id} accessibilityRole={role} accessibilityLabel={item.label} accessibilityHint={item.description} accessibilityState={{ checked: selected, disabled: off }} disabled={off} onPress={() => choose(item.id)}
      style={({ pressed }) => ({ width: outer, minHeight: tileHeight, gap: recipe.itemLabelGap, opacity: off ? 0.5 : pressed ? 0.8 : 1 })}>
      <View style={{ width: outer, height: outer, padding: recipe.ringOffset, borderWidth: recipe.ringWidth, borderColor: selected ? colors.contentBrand : "transparent", borderRadius: recipe.radius + recipe.ringOffset + recipe.ringWidth }}>
        <View style={{ flex: 1, borderRadius: recipe.radius, overflow: "hidden", backgroundColor: colors.surface }}>{item.image}</View>
        {selected ? <View pointerEvents="none" style={{ position: "absolute", top: 0, end: 0, width: recipe.checkSize, height: recipe.checkSize, borderRadius: recipe.checkSize / 2, backgroundColor: colors.contentBrand, alignItems: "center", justifyContent: "center" }}>
          <FixedGlyph color={colors.onPrimary} fontSize={12} lineHeight={14}>✓</FixedGlyph>
        </View> : null}
      </View>
      {/* The tile height reserves the same caption block in every tile, so wrapped rows stay even and virtual rows
          share one height. The label is the accessible name and the description the hint, so neither is read twice. */}
      {showItemLabels ? <Text variant={recipe.itemLabelVariant} align="center" numberOfLines={itemLabelLines} accessible={false} importantForAccessibility="no">{item.label}</Text> : null}
      {item.description === undefined ? null : <Text variant={recipe.itemDescriptionVariant} tone={recipe.itemDescriptionTone} align="center" numberOfLines={recipe.itemDescriptionLines} accessible={false} importantForAccessibility="no">{item.description}</Text>}
    </Pressable>;
  };
  if (virtualized) {
    // Validates the viewport and overscan with the VirtualList window contract before the first layout.
    const overscan = virtualized.overscan ?? virtualListRecipe.overscan;
    const stride = tileHeight + recipe.gap;
    resolveVirtualWindow(0, stride, virtualized.height, 0, overscan);
    const columns = width > 0 ? resolveImageChoiceColumns(width) : 0;
    const rows = columns ? Array.from({ length: Math.ceil(items.length / columns) }, (_, row) => items.slice(row * columns, row * columns + columns)) : [];
    // A FlatList of tile rows, not VirtualList: VirtualList exposes a plain list, and this group must stay the
    // radiogroup/list that names its radio/checkbox tiles. Row height is fixed, so getItemLayout skips measuring.
    return <View style={{ gap: tokens.spacing.xs }}>
      {showLabel ? <Text variant="label">{label}</Text> : null}
      <View style={{ height: virtualized.height }} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        {columns ? <FlatList data={rows} keyExtractor={(row) => row[0]!.id} accessibilityLabel={label} accessibilityRole={groupRole}
          style={{ height: virtualized.height, flexGrow: 0 }} initialNumToRender={Math.ceil(virtualized.height / stride) + overscan}
          getItemLayout={(_data, index) => ({ length: stride, offset: index * stride, index })}
          renderItem={({ item: row }) => <View style={{ flexDirection: "row", gap: recipe.gap, height: stride, paddingBottom: recipe.gap }}>{row.map(renderTile)}</View>} /> : null}
      </View>
    </View>;
  }
  return <View style={{ gap: tokens.spacing.xs }}>
    {showLabel ? <Text variant="label">{label}</Text> : null}
    <View accessibilityLabel={label} accessibilityRole={groupRole} style={{ flexDirection: "row", flexWrap: "wrap", gap: recipe.gap }}>
      {items.map(renderTile)}
    </View>
  </View>;
}
