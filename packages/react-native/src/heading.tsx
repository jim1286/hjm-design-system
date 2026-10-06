import {
  headingRecipe,
  resolveHeadingSemanticLevel,
  validateHeadingDescriptor,
  type HeadingDescriptor,
} from "@hjmds/design-contracts/components/heading";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type HeadingProps = HeadingDescriptor &
  Readonly<{
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw text style bypasses `headingRecipe`. Use `layoutStyle` for placement and
     * `level` for size/weight. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<TextStyle>;
  }>;

export function Heading({ level, semanticLevel, children, layoutStyle, style }: HeadingProps) {
  warnDeprecatedStyleProps("Heading", { style }, "layoutStyle for placement and level for typography");
  const descriptor: HeadingDescriptor = {
    level,
    ...(semanticLevel === undefined ? {} : { semanticLevel }),
  };
  validateHeadingDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const metrics = headingRecipe.levels[level];
  return (
    <Text
      accessibilityRole="header"
      // Native exposes one heading role, so the document level rides along as
      // an accessibility value instead of disappearing.
      aria-level={resolveHeadingSemanticLevel(descriptor)}
      style={[
        {
          color: resolveColorReference(headingRecipe.color, theme.palette),
          fontSize: metrics.fontSize,
          fontWeight: metrics.fontWeight,
          lineHeight: metrics.lineHeight,
        },
        style,
      ]}
      {...(layoutStyle === undefined ? {} : { layoutStyle })}
    >
      {children}
    </Text>
  );
}
