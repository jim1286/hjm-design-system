import {
  headingRecipe,
  resolveHeadingSemanticLevel,
  validateHeadingDescriptor,
  type HeadingDescriptor,
} from "@hjmds/design-contracts/components/heading";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type HeadingProps = HeadingDescriptor &
  Readonly<{
    children: ReactNode;
    style?: StyleProp<TextStyle>;
  }>;

export function Heading({ level, semanticLevel, children, style }: HeadingProps) {
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
    >
      {children}
    </Text>
  );
}
