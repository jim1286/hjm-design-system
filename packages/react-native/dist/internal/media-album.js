import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum, validateMediaAlbumPageStatus } from "@hjmds/design-contracts/screen-patterns";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { Button, IconButton } from "../actions.js";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
import { DrawnChevron } from "./drawn-glyphs.js";
import { Spinner } from "./spinner.js";
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
/** Lets a page's status tell its frame that the page is not an image yet. */
const MediaAlbumPageContext = createContext(null);
/**
 * Loading or failed page of a `mediaAlbum` (2026-10-18 Utilverse). Return it from `renderPage` (or the component it
 * renders) while the photo is not available. While it is shown the frame stops being one accessible image (which
 * merged every child into a single element) and drops its open action, so the spinner's name, the failure text and
 * the retry button are separate screen-reader elements. Centered in the frame (VQ-09).
 */
export function MediaAlbumPageStatus(props) {
    validateMediaAlbumPageStatus(props.kind, props.label);
    const report = useContext(MediaAlbumPageContext);
    // Layout effect: the frame switches its semantics in the same commit, before the status is shown.
    useLayoutEffect(() => { report?.(true); return () => report?.(false); }, [report]);
    const s = mediaAlbumRecipe.pageStatus;
    return _jsx(View, { style: { flex: 1, alignItems: "center", justifyContent: "center", gap: s.gap, padding: s.padding }, children: props.kind === "loading" ? _jsx(Spinner, { label: props.label })
            : _jsxs(_Fragment, { children: [_jsx(View, { accessibilityRole: "alert", accessibilityLiveRegion: "polite", children: _jsx(Text, { variant: s.textVariant, tone: "muted", align: "center", children: props.label }) }), props.retry ? _jsx(Button, { tone: s.retryTone, size: s.retrySize, onPress: props.retry.onPress, children: props.retry.label }) : null] }) });
}
export function MediaAlbumView({ album, index, onIndexChange, width, radius }) {
    validateMediaAlbum(album.count, index);
    const { colors, palette } = useHjmNativeTheme();
    const [statusShown, setStatusShown] = useState(false);
    const label = album.pageLabel(index, album.count);
    const chevron = resolveIconButtonPresentation("ghost", palette, false).content;
    const frame = { width: "100%", aspectRatio: album.aspectRatio ?? mediaAlbumRecipe.defaultAspectRatio, borderRadius: radius, overflow: "hidden", backgroundColor: colors.surface };
    const page = album.renderPage(index);
    const opens = album.onPress !== undefined && !statusShown;
    const image = album.onPress === undefined && !statusShown;
    // The frame and page wrapper stay the same views in every state, so the product's page (which owns the fetch) is
    // never remounted when its status comes and goes. Only accessibility props and the open overlay change.
    return _jsxs(View, { style: { width, maxWidth: "100%", gap: mediaAlbumRecipe.controlGap }, children: [_jsxs(View, { style: frame, accessible: image, ...(image ? { accessibilityRole: "image", accessibilityLabel: label } : {}), children: [_jsx(View, { style: { flex: 1 }, accessibilityElementsHidden: opens, importantForAccessibility: opens ? "no-hide-descendants" : "auto", children: _jsx(MediaAlbumPageContext.Provider, { value: setStatusShown, children: page }) }), opens ? _jsx(Pressable, { accessibilityRole: "imagebutton", accessibilityLabel: label, onPress: () => album.onPress?.(index), style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 } }) : null] }), album.count > 1 ? _jsxs(View, { style: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, children: [_jsx(IconButton, { label: album.previousLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "start", disabled: index === 0, onPress: () => onIndexChange(index - 1), children: _jsx(DrawnChevron, { direction: "start", size: mediaAlbumRecipe.controlGlyphSize, color: chevron }) }), _jsxs(Text, { align: "center", variant: "caption", accessibilityLiveRegion: "polite", children: [index + 1, "/", album.count] }), _jsx(IconButton, { label: album.nextLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "end", disabled: index === album.count - 1, onPress: () => onIndexChange(index + 1), children: _jsx(DrawnChevron, { direction: "end", size: mediaAlbumRecipe.controlGlyphSize, color: chevron }) })] }) : null] });
}
//# sourceMappingURL=media-album.js.map