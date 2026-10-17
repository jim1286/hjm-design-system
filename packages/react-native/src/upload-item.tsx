import {
  getUploadItemAvailableAction,
  resolveUploadItemAnnouncement,
  uploadItemRecipe,
  type UploadItemDescriptor,
  type UploadItemLabels,
} from "@hjmds/design-contracts/components/upload-item";
import type { ReactNode } from "react";
import { glyph } from "@hjmds/design-contracts/foundations";
import { View } from "react-native";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { DrawnClose, DrawnRefresh } from "./internal/drawn-glyphs.js";

import { IconButton } from "./actions.js";

import { Progress } from "./feedback.js";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type UploadItemProps = Readonly<{
  descriptor: UploadItemDescriptor;
  labels: UploadItemLabels;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  leading?: ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function UploadItem({ descriptor, labels, onCancel, onRetry, leading, layoutStyle }: UploadItemProps) {
  const { colors, environment, designProfile } = useHjmNativeTheme();
  // The row md role follows the nearest profile; retain the pre-profile 12px frame.
  const corner = designProfile?.tokens.radius[uploadItemRecipe.row.radius] ?? 12;
  const announcement = resolveUploadItemAnnouncement(descriptor, labels);
  const action = getUploadItemAvailableAction(descriptor.state);
  if (action === "cancel" && onCancel === undefined) {
    throw new TypeError("UploadItem requires onCancel while status is uploading");
  }
  if (action === "retry" && onRetry === undefined) {
    throw new TypeError("UploadItem requires onRetry while status is error");
  }
  const statusColor = descriptor.state.status === "error"
    ? colors.danger
    : descriptor.state.status === "success" || descriptor.state.status === "uploading"
      ? colors.contentBrand
      : colors.textMuted;
  return (
    // The row itself is a plain container. When the root was one accessible
    // element, VoiceOver and TalkBack swallowed Cancel/Retry into it and the
    // action was unreachable (2026-09-30 audit). The file text is one grouped
    // element and the action is a separate button, as the contract's slots list.
    <View style={[{ alignItems: "center", borderColor: colors.border, borderRadius: corner, borderWidth: 1, direction: environment.direction, flexDirection: "row", gap: uploadItemRecipe.row.gap, minHeight: uploadItemRecipe.row.minHeight, paddingHorizontal: uploadItemRecipe.row.paddingHorizontal, paddingVertical: uploadItemRecipe.row.paddingVertical }, layoutStyle]}>
      {leading === undefined ? null : <View accessible={false} importantForAccessibility="no-hide-descendants">{leading}</View>}
      {/* Native exposes only a busy state for this lifecycle; success and error remain
          distinguishable through the live status sentence, as documented by the contract. */}
      <View accessibilityLabel={announcement.label} accessibilityState={{ busy: descriptor.state.status === "uploading" }} accessibilityValue={{ text: announcement.description }} accessible style={{ flex: 1, gap: 2, minWidth: 0 }}>
        <Text>{descriptor.name}</Text>
        {descriptor.sizeLabel === undefined ? null : <Text tone="muted" variant="label">{descriptor.sizeLabel}</Text>}
        <Text accessibilityLiveRegion="polite" style={{ color: statusColor }} variant="label">{announcement.description}</Text>
        {/* The live sentence already displays progress; keep the bar named without repeating that sentence twice visually. */}
        {descriptor.state.status === "uploading" ? <Progress accessibilityLabel={announcement.description} {...(descriptor.state.progress === null ? {} : { value: descriptor.state.progress * 100 })} valueText={announcement.description} /> : null}
      </View>
      {/* Row tool actions are icon buttons named by the localized label, matching Web. Cancelling an upload is not
          destructive, so the glyph stays muted instead of the danger text it used to be (2026-10-17 review). */}
      {action === null ? null : (
        // edge="end": the glyph slot ends on the row's md inset, mirroring the file text's start inset (2026-10-17 audit).
        <IconButton
          edge="end"
          label={action === "cancel" ? labels.cancel : labels.retry}
          onPress={() => action === "cancel" ? onCancel?.(descriptor.id) : onRetry?.(descriptor.id)}
          tone="ghost"
        >
          {action === "cancel"
            ? <DrawnClose size={glyph[iconButtonRecipe.sizes.medium.glyph]} color={colors.textMuted} />
            : <DrawnRefresh size={glyph[iconButtonRecipe.sizes.medium.glyph]} color={colors.textMuted} />}
        </IconButton>
      )}
    </View>
  );
}
