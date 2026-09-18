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
import { useHjmNativeTheme } from "./provider.js";

export type ToggleGroupProps<Id extends string = string> = Readonly<{
  descriptor: ToggleGroupDescriptor<Id>;
  pressedIds?: ReadonlySet<Id>;
  defaultPressedIds?: ReadonlySet<Id>;
  onPressedIdsChange?: (ids: ReadonlySet<Id>) => void;
  size?: ToggleGroupSize;
  style?: StyleProp<ViewStyle>;
}>;

export function ToggleGroup<Id extends string = string>({
  descriptor,
  pressedIds: controlledPressed,
  defaultPressedIds,
  onPressedIdsChange,
  size = toggleGroupRecipe.defaults.size,
  style,
}: ToggleGroupProps<Id>) {
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
      style={[{ flexDirection: "row", flexWrap: "wrap", gap: toggleGroupRecipe.gap }, style]}
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
              borderRadius: toggleGroupRecipe.radius,
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
