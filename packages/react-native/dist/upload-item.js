import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getUploadItemAvailableAction, resolveUploadItemAnnouncement, uploadItemRecipe, } from "@hjmds/design-contracts/components/upload-item";
import { Pressable, View } from "react-native";
import { Progress } from "./feedback.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function UploadItem({ descriptor, labels, onCancel, onRetry, leading, style }) {
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
    return (_jsxs(View, { accessibilityLabel: announcement.label, accessible: true, style: [{ alignItems: "center", borderColor: colors.border, borderRadius: 12, borderWidth: 1, direction: environment.direction, flexDirection: "row", gap: uploadItemRecipe.row.gap, minHeight: uploadItemRecipe.row.minHeight, paddingHorizontal: uploadItemRecipe.row.paddingHorizontal }, style], children: [leading === undefined ? null : _jsx(View, { accessible: false, children: leading }), _jsxs(View, { style: { flex: 1, gap: 2, minWidth: 0 }, children: [_jsx(Text, { children: descriptor.name }), descriptor.sizeLabel === undefined ? null : _jsx(Text, { tone: "muted", variant: "label", children: descriptor.sizeLabel }), _jsx(Text, { accessibilityLiveRegion: "polite", style: { color: statusColor }, variant: "label", children: announcement.description }), descriptor.state.status === "uploading" ? _jsx(Progress, { label: announcement.description, ...(descriptor.state.progress === null ? {} : { value: descriptor.state.progress }), valueText: announcement.description }) : null] }), action === null ? null : (_jsx(Pressable, { accessibilityLabel: action === "cancel" ? labels.cancel : labels.retry, accessibilityRole: "button", onPress: () => action === "cancel" ? onCancel?.(descriptor.id) : onRetry?.(descriptor.id), style: ({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }], children: _jsx(Text, { emphasis: "strong", style: { color: action === "cancel" ? colors.danger : colors.contentBrand }, variant: "label", children: action === "cancel" ? labels.cancel : labels.retry }) }))] }));
}
//# sourceMappingURL=upload-item.js.map