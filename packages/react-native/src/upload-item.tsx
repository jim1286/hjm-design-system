import {
  getUploadItemAvailableAction,
  resolveUploadItemAnnouncement,
  uploadItemRecipe,
  type UploadItemDescriptor,
  type UploadItemLabels,
} from "@hjmds/design-contracts/components/upload-item";
import type { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { Progress } from "./feedback.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type UploadItemProps = Readonly<{
  descriptor: UploadItemDescriptor;
  labels: UploadItemLabels;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function UploadItem({ descriptor, labels, onCancel, onRetry, leading, style }: UploadItemProps) {
  const { colors, environment } = useHjmNativeTheme();
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
    <View accessibilityLabel={announcement.label} accessible style={[{ alignItems: "center", borderColor: colors.border, borderRadius: 12, borderWidth: 1, direction: environment.direction, flexDirection: "row", gap: uploadItemRecipe.row.gap, minHeight: uploadItemRecipe.row.minHeight, paddingHorizontal: uploadItemRecipe.row.paddingHorizontal }, style]}>
      {leading === undefined ? null : <View accessible={false}>{leading}</View>}
      <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
        <Text>{descriptor.name}</Text>
        {descriptor.sizeLabel === undefined ? null : <Text tone="muted" variant="label">{descriptor.sizeLabel}</Text>}
        <Text accessibilityLiveRegion="polite" style={{ color: statusColor }} variant="label">{announcement.description}</Text>
        {descriptor.state.status === "uploading" ? <Progress label={announcement.description} {...(descriptor.state.progress === null ? {} : { value: descriptor.state.progress })} valueText={announcement.description} /> : null}
      </View>
      {action === null ? null : (
        <Pressable
          accessibilityLabel={action === "cancel" ? labels.cancel : labels.retry}
          accessibilityRole="button"
          onPress={() => action === "cancel" ? onCancel?.(descriptor.id) : onRetry?.(descriptor.id)}
          style={({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }]}
        >
          <Text emphasis="strong" style={{ color: action === "cancel" ? colors.danger : colors.contentBrand }} variant="label">{action === "cancel" ? labels.cancel : labels.retry}</Text>
        </Pressable>
      )}
    </View>
  );
}
