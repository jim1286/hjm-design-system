import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum } from "@hjmds/design-contracts/screen-patterns";
import { IconButton } from "../actions.js";
import { Text } from "../layout.js";
import { Icon } from "../supplemental-display.js";
/**
 * Hosts keep the page state so every copy of the album they render (the message and its hold-menu preview) shows
 * the same page. Called unconditionally; `album` may be absent.
 */
export function useMediaAlbumIndex(album) {
    const [own, setOwn] = useState(album?.defaultIndex ?? 0);
    if (!album)
        return [0, setOwn];
    if (album.index !== undefined) {
        validateMediaAlbum(album.count, album.index);
        return [album.index, album.onIndexChange];
    }
    const current = resolveMediaAlbumIndex(album.count, own);
    return [current, (next) => { setOwn(next); album.onIndexChange?.(next); }];
}
export function MediaAlbumView({ album, index, onIndexChange, width, radius, className }) {
    validateMediaAlbum(album.count, index);
    const label = album.pageLabel(index, album.count);
    const frame = { aspectRatio: album.aspectRatio ?? mediaAlbumRecipe.defaultAspectRatio, borderRadius: radius };
    const page = album.renderPage(index);
    return _jsxs("div", { className: ["hjm-media-album", className].filter(Boolean).join(" "), style: { inlineSize: width, gap: mediaAlbumRecipe.controlGap }, children: [album.onPress
                ? _jsx("button", { type: "button", className: "hjm-media-album__page", "aria-label": label, style: frame, onClick: () => album.onPress?.(index), children: page })
                : _jsx("div", { role: "img", "aria-label": label, className: "hjm-media-album__page", style: frame, children: page }), album.count > 1 ? _jsxs("div", { className: "hjm-media-album__controls", children: [_jsx(IconButton, { label: album.previousLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "start", disabled: index === 0, onClick: () => onIndexChange(index - 1), children: _jsx(Icon, { name: "chevronStart" }) }), _jsxs(Text, { variant: "caption", "aria-live": "polite", children: [index + 1, "/", album.count] }), _jsx(IconButton, { label: album.nextLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "end", disabled: index === album.count - 1, onClick: () => onIndexChange(index + 1), children: _jsx(Icon, { name: "chevronEnd" }) })] }) : null] });
}
//# sourceMappingURL=media-album.js.map