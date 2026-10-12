import type { ReactNode } from "react";
import { Pressable, View, type GestureResponderEvent } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  activityChipRecipe,
  resolveActivityChipDescriptor,
  type ActivityChipEmphasis,
} from "@hjmds/design-contracts/activity-chip";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type { ActivityChipEmphasis } from "@hjmds/design-contracts/activity-chip";

export type ActivityChipProps = Readonly<{
  /** Short visible status, for example "Polishing". */
  label: string;
  /** Full spoken status; defaults to `label`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** `emphasis` marks a result waiting for the user. */
  emphasis?: ActivityChipEmphasis;
  /** Whether the panel this chip toggles is open (`accessibilityState.expanded`). */
  expanded?: boolean;
  /** Decorative leading visual (mascot, avatar); hidden from assistive technology. */
  media?: ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  testID?: string;
}>;

/**
 * Pressable status of one running task. It is a disclosure trigger for the matching panel toast
 * (composition `activity-status`), so it reports `expanded` instead of Chip's selection roles.
 */
export function ActivityChip({
  label,
  accessibilityLabel,
  accessibilityHint,
  emphasis,
  expanded,
  media,
  onPress,
  disabled = false,
  layoutStyle,
  testID,
}: ActivityChipProps) {
  const theme = useHjmNativeTheme();
  const resolved = resolveActivityChipDescriptor({
    label,
    ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
    ...(emphasis === undefined ? {} : { emphasis }),
    ...(expanded === undefined ? {} : { expanded }),
  });
  const { root } = activityChipRecipe;
  const colors = activityChipRecipe.emphasis[resolved.emphasis];
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={resolved.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded: resolved.expanded, disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        {
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: resolveColorReference(colors.background, theme.palette),
          borderColor: resolveColorReference(colors.border, theme.palette),
          borderRadius: theme.tokens.radius[root.radius],
          borderWidth: root.borderWidth,
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: root.gap,
          maxWidth: root.maxWidth,
          // A floor, not a fixed height, so large text grows the pill instead of clipping it (as Chip does).
          minHeight: root.minHeight,
          opacity: pressed ? root.pressedOpacity : 1,
          paddingEnd: root.paddingEnd,
          paddingStart: media === undefined || media === null ? root.paddingEnd : root.paddingStart,
        },
        layoutStyle,
      ]}
    >
      {media === undefined || media === null ? null : (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            alignItems: "center",
            borderRadius: theme.tokens.radius[activityChipRecipe.media.radius],
            flexShrink: 0,
            height: activityChipRecipe.media.size,
            justifyContent: "center",
            overflow: "hidden",
            width: activityChipRecipe.media.size,
          }}
        >
          {media}
        </View>
      )}
      <Text
        fontRole="ui"
        numberOfLines={activityChipRecipe.label.maxLines}
        style={{
          color: resolveColorReference(colors.foreground, theme.palette),
          flexShrink: 1,
          fontWeight: activityChipRecipe.label.fontWeight,
        }}
        variant={activityChipRecipe.label.textVariant}
      >
        {resolved.label}
      </Text>
    </Pressable>
  );
}
