import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getUploadItemAvailableAction, resolveUploadItemAnnouncement, uploadItemRecipe, } from "@hjmds/design-contracts/components/upload-item";
import { glyph } from "@hjmds/design-contracts/foundations";
import { View } from "react-native";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { DrawnClose, DrawnRefresh } from "./internal/drawn-glyphs.js";
import { IconButton } from "./actions.js";
import { Progress } from "./feedback.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function UploadItem({ descriptor, labels, onCancel, onRetry, leading, layoutStyle }) {
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
    _jsxs(View, { style: [{ alignItems: "center", borderColor: colors.border, borderRadius: corner, borderWidth: 1, direction: environment.direction, flexDirection: "row", gap: uploadItemRecipe.row.gap, minHeight: uploadItemRecipe.row.minHeight, paddingHorizontal: uploadItemRecipe.row.paddingHorizontal, paddingVertical: uploadItemRecipe.row.paddingVertical }, layoutStyle], children: [leading === undefined ? null : _jsx(View, { accessible: false, importantForAccessibility: "no-hide-descendants", children: leading }), _jsxs(View, { accessibilityLabel: announcement.label, accessibilityState: { busy: descriptor.state.status === "uploading" }, accessibilityValue: { text: announcement.description }, accessible: true, style: { flex: 1, gap: 2, minWidth: 0 }, children: [_jsx(Text, { children: descriptor.name }), descriptor.sizeLabel === undefined ? null : _jsx(Text, { tone: "muted", variant: "label", children: descriptor.sizeLabel }), _jsx(Text, { accessibilityLiveRegion: "polite", style: { color: statusColor }, variant: "label", children: announcement.description }), descriptor.state.status === "uploading" ? _jsx(Progress, { accessibilityLabel: announcement.description, ...(descriptor.state.progress === null ? {} : { value: descriptor.state.progress * 100 }), valueText: announcement.description }) : null] }), action === null ? null : (
            // edge="end": the glyph slot ends on the row's md inset, mirroring the file text's start inset (2026-10-17 audit).
            _jsx(IconButton, { edge: "end", label: action === "cancel" ? labels.cancel : labels.retry, onPress: () => action === "cancel" ? onCancel?.(descriptor.id) : onRetry?.(descriptor.id), tone: "ghost", children: action === "cancel"
                    ? _jsx(DrawnClose, { size: glyph[iconButtonRecipe.sizes.medium.glyph], color: colors.textMuted })
                    : _jsx(DrawnRefresh, { size: glyph[iconButtonRecipe.sizes.medium.glyph], color: colors.textMuted }) }))] }));
}
//# sourceMappingURL=upload-item.js.map