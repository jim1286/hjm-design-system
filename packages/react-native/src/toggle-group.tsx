import {
  reconcileToggleGroupSelection,
  toggleGroupRecipe,
  toggleGroupSelection,
  validateToggleGroupDescriptor,
  type ToggleGroupDescriptor,
  type ToggleGroupSize,
} from "@hjmds/design-contracts/components/toggle-group";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useMemo, useState } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type ToggleGroupProps<Id extends string = string> = Readonly<{
  descriptor: ToggleGroupDescriptor<Id>;
  pressedIds?: ReadonlySet<Id>;
  defaultPressedIds?: ReadonlySet<Id>;
  onPressedIdsChange?: (ids: ReadonlySet<Id>) => void;
  size?: ToggleGroupSize;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * `toggleGroupRecipe` (`size`) owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
}>;

export function ToggleGroup<Id extends string = string>({
  descriptor,
  pressedIds: controlledPressed,
  defaultPressedIds,
  onPressedIdsChange,
  size = toggleGroupRecipe.defaults.size,
  layoutStyle,
  style,
}: ToggleGroupProps<Id>) {
  warnDeprecatedStyleProps("ToggleGroup", { style }, "layoutStyle for placement; toggleGroupRecipe (size) owns appearance");
  validateToggleGroupDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const [internal, setInternal] = useState<ReadonlySet<Id>>(defaultPressedIds ?? new Set<Id>());
  const raw = controlledPressed ?? internal;
  const pressed = useMemo(() => reconcileToggleGroupSelection(descriptor, raw), [descriptor, raw]);
  const metrics = toggleGroupRecipe.sizes[size];
  const commit = (next: ReadonlySet<Id>) => {
    if (controlledPressed === undefined) setInternal(next);
    onPressedIdsChange?.(next);
  };
  return (
    <View
      accessibilityLabel={descriptor.accessibilityLabel}
      style={[{ flexDirection: "row", flexWrap: "wrap", gap: toggleGroupRecipe.gap }, style, layoutStyle]}
    >
      {descriptor.items.map((item) => {
        const on = pressed.has(item.id);
        const tone = on ? toggleGroupRecipe.pressed : toggleGroupRecipe.idle;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            // Native announces a toggle through `selected`, the counterpart of
            // aria-pressed; colour alone would say nothing.
            accessibilityState={{ disabled: item.disabled === true, selected: on }}
            disabled={item.disabled === true}
            onPress={() => commit(toggleGroupSelection(descriptor, pressed, item.id))}
            style={{
              alignItems: "center",
              backgroundColor: resolveColorReference(tone.background, theme.palette),
              borderColor: resolveColorReference(tone.border, theme.palette),
              // Keep the neutral recipe fallback; product shapes use the same md
              // role as Web rather than freezing a second selection component.
              borderRadius: theme.designProfile?.tokens.radius.md ?? toggleGroupRecipe.radius,
              borderWidth: 1,
              justifyContent: "center",
              minHeight: metrics.minHeight,
              opacity: item.disabled === true ? 0.5 : 1,
              paddingHorizontal: metrics.paddingHorizontal,
            }}
          >
            <Text
              style={{ color: resolveColorReference(tone.color, theme.palette) }}
              variant={metrics.textVariant}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
