import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from "react-native";
import { conversationRowRecipe as recipe } from "@hjmds/design-contracts/conversation-row";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/** Presentation inside a router-owned pressable: the host supplies its full accessible name. */
export function ConversationRow({ title, preview, metadata, avatar, unread = false }) {
    const { colors } = useHjmNativeTheme();
    // Separators join visible fields; a missing preview must not leave a leading dot.
    const hasPreview = preview.trim().length > 0;
    const hasMetadata = metadata.trim().length > 0;
    return _jsxs(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flexDirection: "row", alignItems: "center", gap: recipe.gap, paddingHorizontal: recipe.paddingInline, paddingVertical: recipe.paddingBlock, minWidth: 0, width: "100%" }, children: [_jsx(View, { style: { alignItems: "center", justifyContent: "center", width: recipe.avatarSize, height: recipe.avatarSize, flexShrink: 0, borderRadius: recipe.avatarSize / 2, overflow: "hidden" }, children: avatar }), _jsxs(View, { style: { gap: recipe.contentGap, flex: 1, minWidth: 0 }, children: [_jsx(Text, { numberOfLines: 1, style: { fontWeight: unread ? recipe.unreadTitleWeight : recipe.titleWeight }, children: title }), _jsxs(View, { style: { flexDirection: "row", minWidth: 0 }, children: [hasPreview ? _jsx(Text, { numberOfLines: 1, variant: "label", tone: unread ? "primary" : "subtle", style: { flexShrink: 1, fontWeight: unread ? recipe.unreadPreviewWeight : recipe.titleWeight }, children: preview }) : null, hasMetadata ? _jsx(Text, { variant: "label", tone: unread ? "primary" : "subtle", style: { flexShrink: 0, fontWeight: unread ? recipe.unreadPreviewWeight : recipe.titleWeight }, children: hasPreview ? ` · ${metadata}` : metadata }) : null] })] }), unread ? _jsx(View, { style: { width: recipe.unreadSize, height: recipe.unreadSize, flexShrink: 0, borderRadius: recipe.unreadSize / 2, backgroundColor: colors.contentBrand } }) : null] });
}
//# sourceMappingURL=conversation-row.js.map