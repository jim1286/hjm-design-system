import {
  headingRecipe,
  resolveHeadingSemanticLevel,
  validateHeadingDescriptor,
  type HeadingDescriptor,
} from "@hjmds/design-contracts/components/heading";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type HeadingProps = HeadingDescriptor &
  Readonly<{
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /** Text alignment inside the heading box; Web inherits it from the container's text-align. */
    align?: "start" | "center";
  }>;

export function Heading({ level, semanticLevel, children, layoutStyle, align }: HeadingProps) {
  const descriptor: HeadingDescriptor = {
    level,
    ...(semanticLevel === undefined ? {} : { semanticLevel }),
  };
  validateHeadingDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const metrics = theme.designProfile?.tokens.heading[level] ?? headingRecipe.levels[level];
  return (
    <Text
      fontRole="display"
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
      ]}
      {...(layoutStyle === undefined ? {} : { layoutStyle })}
      {...(align === "center" ? { align: "center" as const } : {})}
    >
      {children}
    </Text>
  );
}
