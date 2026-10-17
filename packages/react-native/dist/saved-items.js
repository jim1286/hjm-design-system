import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Pressable, View } from "react-native";
import { ListDetailScreen } from "./screen-flows.js";
import { Stack, Text, Grid } from "./primitives.js";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveSavedItems } from "@hjmds/design-contracts/screen-patterns";
/** Same controlled collection contract as Web, composed with the native screen and grid hosts. */
export function SavedItemsScreen({ items, collections, collectionId, selectedItemId, labels, onOpenCollection, onOpenItem, onBack, onCreateCollection, renderThumbnail, renderDetail, ...screen }) {
    const { colors, tokens } = useHjmNativeTheme();
    const { home, collection, visible, selected } = resolveSavedItems(items, collections, collectionId, selectedItemId);
    const groups = [{ id: null, title: labels.allItems, itemIds: items.map(item => item.id) }, ...collections];
    // Empty is a full body state, not a short text row at the top of the grid.
    const state = (screen.state?.kind ?? "ready") === "ready" && !home && !visible.length
        ? { kind: "empty", title: labels.empty } : screen.state ?? { kind: "ready" };
    // Resolve each cover once; four thumbnails must not each rescan membership.
    const covers = new Map(groups.map(group => { const ids = new Set(group.itemIds); return [group.id, items.filter(item => ids.has(item.id)).slice(0, 4)]; }));
    return _jsx(ListDetailScreen, { ...screen, state: state, title: home ? screen.title : collection?.title ?? labels.allItems, ...(home ? (screen.exit ? { exit: screen.exit } : {}) : { exit: { kind: "back", label: labels.back, onPress: onBack } }), actions: home ? _jsx(Button, { tone: "ghost", onPress: onCreateCollection, children: labels.createCollection }) : screen.actions, back: { label: labels.back, onAction: onBack }, ...(selected ? { detail: { title: selected.title, content: renderDetail(selected) } } : {}), list: _jsx(Stack, { gap: "md", children: home ? _jsxs(_Fragment, { children: [_jsx(Text, { variant: "caption", tone: "muted", children: labels.privateNotice }), _jsx(Grid, { columns: { compact: 2 }, gap: { compact: "md" }, minColumnWidth: { compact: 80 }, children: groups.map(group => _jsxs(Pressable, { accessibilityRole: "button", accessibilityLabel: group.title, onPress: () => onOpenCollection(group.id), style: { gap: spacing.sm }, children: [_jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { aspectRatio: 1, borderRadius: tokens.radius.md, overflow: "hidden", backgroundColor: colors.surfaceAlt, flexDirection: "row", flexWrap: "wrap" }, children: Array.from({ length: 4 }, (_, index) => { const item = covers.get(group.id)?.[index]; return _jsx(View, { style: { width: "50%", height: "50%", padding: spacing.xxs / 2 }, children: item ? renderThumbnail(item) : null }, index); }) }), _jsx(Text, { emphasis: "strong", children: group.title })] }, group.id === null ? "all" : `collection:${group.id}`)) })] }) : visible.length ? _jsx(Grid, { columns: { compact: 3 }, gap: { compact: "xxs" }, minColumnWidth: { compact: 44 }, children: visible.map(item => _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: item.title, onPress: () => onOpenItem(item.id), style: { aspectRatio: 1, overflow: "hidden", backgroundColor: colors.surfaceAlt }, children: renderThumbnail(item) }, item.id)) }) : null }) });
}
//# sourceMappingURL=saved-items.js.map