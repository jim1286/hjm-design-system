import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ListDetailScreen } from "./screen-flows.js";
import { Stack, Text, Grid } from "./layout.js";
import { Button, IconButton } from "./actions.js";
import { resolveSavedItems } from "@hjmds/design-contracts/screen-patterns";
/**
 * Collection membership and persistence belong to the app; the shell preserves the grid on detail visits.
 *
 * Header slots per level: on the collection home the shell owns `actions` (the create-collection
 * button) and the product's `exit`; inside a collection it owns `exit` (back) and keeps the
 * product's `actions`. A product `actions` passed for the home is therefore not rendered there —
 * Native ships the same rule, so changing it is a cross-platform API decision, not a Web fix.
 */
export function SavedItemsScreen({ items, collections, collectionId, selectedItemId, labels, onOpenCollection, onOpenItem, onBack, onCreateCollection, createCollectionIcon, renderThumbnail, renderDetail, ...screen }) {
    const { home, collection, visible, selected } = resolveSavedItems(items, collections, collectionId, selectedItemId);
    const groups = [{ id: null, title: labels.allItems, itemIds: items.map(item => item.id) }, ...collections];
    // Empty is a full body state, not a short text row at the top of the grid.
    const state = (screen.state?.kind ?? "ready") === "ready" && !home && !visible.length
        ? { kind: "empty", title: labels.empty } : screen.state ?? { kind: "ready" };
    // Resolve each cover once; four thumbnails must not each rescan membership.
    const covers = new Map(groups.map(group => { const ids = new Set(group.itemIds); return [group.id, items.filter(item => ids.has(item.id)).slice(0, 4)]; }));
    return _jsx(ListDetailScreen, { ...screen, state: state, title: home ? screen.title : collection?.title ?? labels.allItems, ...(home ? (screen.exit ? { exit: screen.exit } : {}) : { exit: { kind: "back", label: labels.back, onClick: onBack } }), actions: home ? (createCollectionIcon === undefined ? _jsx(Button, { tone: "ghost", onClick: onCreateCollection, children: labels.createCollection }) : _jsx(IconButton, { label: labels.createCollection, tone: "ghost", onClick: onCreateCollection, children: createCollectionIcon })) : screen.actions, back: { label: labels.back, onAction: onBack }, ...(selected ? { detail: { title: selected.title, content: renderDetail(selected) } } : {}), list: _jsx(Stack, { gap: "md", children: home ? _jsxs(_Fragment, { children: [_jsx(Text, { variant: "caption", tone: "muted", children: labels.privateNotice }), _jsx(Grid, { columns: { compact: 2 }, gap: { compact: "md" }, minColumnWidth: { compact: 80 }, children: groups.map(group => _jsxs("button", { type: "button", className: "hjm-saved-collection", onClick: () => onOpenCollection(group.id), "aria-label": group.title, children: [_jsx("span", { className: "hjm-saved-collection__cover", "aria-hidden": "true", children: Array.from({ length: 4 }, (_, index) => { const item = covers.get(group.id)?.[index]; return _jsx("span", { children: item ? renderThumbnail(item) : null }, index); }) }), _jsx(Text, { emphasis: "strong", children: group.title })] }, group.id === null ? "all" : `collection:${group.id}`)) })] }) : visible.length ? _jsx(Grid, { columns: { compact: 3 }, gap: { compact: "xxs" }, minColumnWidth: { compact: 44 }, children: visible.map(item => _jsx("button", { type: "button", className: "hjm-saved-post", "aria-label": item.title, onClick: () => onOpenItem(item.id), children: renderThumbnail(item) }, item.id)) }) : null }) });
}
//# sourceMappingURL=saved-items.js.map