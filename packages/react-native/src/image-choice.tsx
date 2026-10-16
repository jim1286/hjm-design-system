import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { imageChoiceRecipe, resolveImageChoiceToggle, validateImageChoiceItems, type ImageChoiceItemDescriptor } from "@hjmds/design-contracts/components/image-choice";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";

export type ImageChoiceItem = ImageChoiceItemDescriptor & Readonly<{ image: ReactNode }>;
type Base = Readonly<{
  /** Localized group name read before the choices. */
  label: string;
  /** Visible caption above the tiles; omit when the screen heading already names the choice. */
  showLabel?: boolean;
  items: readonly ImageChoiceItem[];
  disabled?: boolean;
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
  const { label, showLabel = false, items, disabled = false } = props;
  validateImageChoiceItems(items);
  const { colors, tokens } = useHjmNativeTheme();
  const recipe = imageChoiceRecipe;
  const isSelected = (id: string) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
  const choose = (id: string) => {
    if (props.selectionMode === "single") props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
    else props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
  };
  const role = props.selectionMode === "single" ? "radio" : "checkbox";
  return <View style={{ gap: tokens.spacing.xs }}>
    {showLabel ? <Text variant="label">{label}</Text> : null}
    <View accessibilityLabel={label} accessibilityRole={props.selectionMode === "single" ? "radiogroup" : "list"} style={{ flexDirection: "row", flexWrap: "wrap", gap: recipe.gap }}>
      {items.map(item => {
        const selected = isSelected(item.id);
        const off = disabled || (item.disabled ?? false);
        return <Pressable key={item.id} accessibilityRole={role} accessibilityLabel={item.label} accessibilityState={{ checked: selected, disabled: off }} disabled={off} onPress={() => choose(item.id)}
          style={({ pressed }) => ({ width: recipe.tileSize + (recipe.ringWidth + recipe.ringOffset) * 2, height: recipe.tileSize + (recipe.ringWidth + recipe.ringOffset) * 2, padding: recipe.ringOffset, borderWidth: recipe.ringWidth, borderColor: selected ? colors.contentBrand : "transparent", borderRadius: recipe.radius + recipe.ringOffset + recipe.ringWidth, opacity: off ? 0.5 : pressed ? 0.8 : 1 })}>
          <View style={{ flex: 1, borderRadius: recipe.radius, overflow: "hidden", backgroundColor: colors.surface }}>{item.image}</View>
          {selected ? <View pointerEvents="none" style={{ position: "absolute", top: 0, end: 0, width: recipe.checkSize, height: recipe.checkSize, borderRadius: recipe.checkSize / 2, backgroundColor: colors.contentBrand, alignItems: "center", justifyContent: "center" }}>
            <FixedGlyph color={colors.onPrimary} fontSize={12} lineHeight={14}>✓</FixedGlyph>
          </View> : null}
        </Pressable>;
      })}
    </View>
  </View>;
}
