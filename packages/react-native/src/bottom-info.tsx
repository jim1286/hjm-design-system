import {
  bottomInfoRecipe,
  validateBottomInfoDescriptor,
  type BottomInfoDescriptor,
} from "@hjmds/design-contracts/components/bottom-info";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type BottomInfoProps = BottomInfoDescriptor &
  Readonly<{
    renderItem?: (item: string, index: number) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export function BottomInfo({ items, tone = bottomInfoRecipe.defaults.tone, renderItem, layoutStyle }: BottomInfoProps) {
  validateBottomInfoDescriptor({ items, tone });
  const theme = useHjmNativeTheme();
  const color = resolveColorReference(bottomInfoRecipe.tones[tone], theme.palette);
  // One line reads as a sentence; several read as a list. A bullet on a single
  // line is noise, which is why the threshold lives in the recipe.
  const asList = items.length >= bottomInfoRecipe.listMarkerFrom;
  return (
    <View style={[{ gap: bottomInfoRecipe.gap, paddingTop: bottomInfoRecipe.paddingTop }, layoutStyle]}>
      {items.map((item, index) => (
        <View key={item} style={{ flexDirection: "row", gap: 4 }}>
          {asList ? <Text style={{ color }} variant={bottomInfoRecipe.textVariant}>·</Text> : null}
          <Text style={{ color, flex: 1 }} variant={bottomInfoRecipe.textVariant}>
            {renderItem?.(item, index) ?? item}
          </Text>
        </View>
      ))}
    </View>
  );
}
