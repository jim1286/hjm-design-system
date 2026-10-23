import {
  resolveTopTitle,
  topDefaults,
  topRecipe,
  type TopDescriptor,
} from "@hjmds/design-contracts/components/top";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type TopProps = Readonly<{
  descriptor: TopDescriptor;
  /** Secondary action sharing the title row; stacks below it at large text. */
  trailing?: ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Top({ descriptor, trailing, layoutStyle }: TopProps) {
  const resolvedTitle = resolveTopTitle(descriptor);
  const theme = useHjmNativeTheme();
  const size = descriptor.size ?? topDefaults.size;
  const metrics = topRecipe.sizes[size];
  // Match the Web visual role without coupling it to the document heading level.
  const title = theme.designProfile
    ? size === "large" ? theme.designProfile.tokens.heading.level3 : theme.tokens.typography.titleLarge
    : metrics.title;
  // Large text stacks the trailing action instead of squeezing the title, the
  // same rule Section already applies to its own header row.
  const stack = theme.environment.textScale >= 1.6;
  return (
    <View
      style={[
        { gap: topRecipe.gap, paddingBottom: metrics.paddingBottom, paddingTop: metrics.paddingTop },
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
        {/* Native Text draws `\n` itself, so `collapse` removes it in the contract; the spoken name joins lines by a space. */}
        <Text
          accessibilityRole="header"
          accessibilityLabel={resolvedTitle.accessibleName}
          style={{
            color: resolveColorReference(topRecipe.title.color, theme.palette),
            // Web `flex: 1 1 auto`; RN `flex: 1` has a 0 basis, which collapsed the title inside a centred
            // hero and wrapped it early (2026-10-17 comparison).
            ...(stack ? {} : { flexGrow: 1, flexShrink: 1 }),
            fontSize: title.fontSize,
            fontWeight: title.fontWeight,
            lineHeight: title.lineHeight,
          }}
        >
          {resolvedTitle.text}
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
