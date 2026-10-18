import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum } from "@hjmds/design-contracts/screen-patterns";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { IconButton } from "../actions.js";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
import { DrawnChevron } from "./drawn-glyphs.js";
/**
 * Hosts keep the page state so every copy of the album they render (the message and its hold-menu preview, which
 * Native renders a second time) shows the same page. Called unconditionally; `album` may be absent.
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
export function MediaAlbumView({ album, index, onIndexChange, width, radius }) {
    validateMediaAlbum(album.count, index);
    const { colors, palette } = useHjmNativeTheme();
    const label = album.pageLabel(index, album.count);
    const chevron = resolveIconButtonPresentation("ghost", palette, false).content;
    const frame = { width: "100%", aspectRatio: album.aspectRatio ?? mediaAlbumRecipe.defaultAspectRatio, borderRadius: radius, overflow: "hidden", backgroundColor: colors.surface };
    const page = album.renderPage(index);
    return _jsxs(View, { style: { width, maxWidth: "100%", gap: mediaAlbumRecipe.controlGap }, children: [album.onPress
                ? _jsx(Pressable, { accessibilityRole: "imagebutton", accessibilityLabel: label, onPress: () => album.onPress?.(index), style: frame, children: page })
                : _jsx(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: label, style: frame, children: page }), album.count > 1 ? _jsxs(View, { style: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, children: [_jsx(IconButton, { label: album.previousLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "start", disabled: index === 0, onPress: () => onIndexChange(index - 1), children: _jsx(DrawnChevron, { direction: "start", size: mediaAlbumRecipe.controlGlyphSize, color: chevron }) }), _jsxs(Text, { align: "center", variant: "caption", accessibilityLiveRegion: "polite", children: [index + 1, "/", album.count] }), _jsx(IconButton, { label: album.nextLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "end", disabled: index === album.count - 1, onPress: () => onIndexChange(index + 1), children: _jsx(DrawnChevron, { direction: "end", size: mediaAlbumRecipe.controlGlyphSize, color: chevron }) })] }) : null] });
}
//# sourceMappingURL=media-album.js.map