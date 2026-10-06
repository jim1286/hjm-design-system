import {
  topDefaults,
  topRecipe,
  validateTopDescriptor,
  type TopDescriptor,
} from "@hjmds/design-contracts/components/top";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type TopProps = Readonly<{
  descriptor: TopDescriptor;
  /** Secondary action sharing the title row; stacks below it at large text. */
  trailing?: ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * `topRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
}>;

export function Top({ descriptor, trailing, layoutStyle, style }: TopProps) {
  warnDeprecatedStyleProps("Top", { style }, "layoutStyle for placement; topRecipe owns appearance");
  validateTopDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const size = descriptor.size ?? topDefaults.size;
  const metrics = topRecipe.sizes[size];
  // Large text stacks the trailing action instead of squeezing the title, the
  // same rule Section already applies to its own header row.
  const stack = theme.environment.textScale >= 1.6;
  return (
    <View
      style={[
        { gap: topRecipe.gap, paddingBottom: metrics.paddingBottom, paddingTop: metrics.paddingTop },
        style,
        layoutStyle,
      ]}
    >
      {descriptor.eyebrow ? (
        <Text
          style={{ color: resolveColorReference(topRecipe.eyebrow.color, theme.palette) }}
          variant={topRecipe.eyebrow.textVariant}
        >
          {descriptor.eyebrow}
        </Text>
      ) : null}
      <View
        style={{
          alignItems: stack ? "stretch" : "center",
          flexDirection: stack ? "column" : "row",
          gap: topRecipe.trailing.gap,
        }}
      >
        {/*
          `header` is the Native counterpart of a real heading element — the
          rotor lands here, which is the whole point of this block.
        */}
        <Text
          accessibilityRole="header"
          style={{
            color: resolveColorReference(topRecipe.title.color, theme.palette),
            flex: stack ? undefined : 1,
            fontSize: metrics.title.fontSize,
            fontWeight: metrics.title.fontWeight,
            lineHeight: metrics.title.lineHeight,
          }}
        >
          {descriptor.title}
        </Text>
        {trailing ? <View>{trailing}</View> : null}
      </View>
      {descriptor.description ? (
        <Text
          style={{ color: resolveColorReference(topRecipe.description.color, theme.palette) }}
          variant={topRecipe.description.textVariant}
        >
          {descriptor.description}
        </Text>
      ) : null}
    </View>
  );
}
