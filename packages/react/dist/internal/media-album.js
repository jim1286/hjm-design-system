import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum, validateMediaAlbumPageStatus } from "@hjmds/design-contracts/screen-patterns";
import { Button, IconButton } from "../actions.js";
import { Text } from "../layout.js";
import { Icon } from "../supplemental-display.js";
import { Spinner } from "./spinner.js";
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
/** Lets a page's status tell its frame that the page is not an image yet. */
const MediaAlbumPageContext = createContext(null);
/**
 * Loading or failed page of a `mediaAlbum` (2026-10-18 Utilverse). Return it from `renderPage` (or the component it
 * renders) while the photo is not available. While it is shown the frame drops its image name and open action, so
 * the spinner's name, the failure text and the retry button are reachable by screen readers and pointer instead of
 * being swallowed by one accessible image. Centered in the frame (VQ-09).
 */
export function MediaAlbumPageStatus(props) {
    validateMediaAlbumPageStatus(props.kind, props.label);
    const report = useContext(MediaAlbumPageContext);
    // Layout effect: the frame switches its semantics before the browser paints, so the status never shows inside
    // an image or button for a frame.
    useLayoutEffect(() => { report?.(true); return () => report?.(false); }, [report]);
    const s = mediaAlbumRecipe.pageStatus;
    return _jsx("div", { className: "hjm-media-album__status", style: { gap: s.gap, padding: s.padding }, children: props.kind === "loading" ? _jsx(Spinner, { label: props.label })
            : _jsxs(_Fragment, { children: [_jsx(Text, { as: "p", role: "alert", variant: s.textVariant, tone: "muted", children: props.label }), props.retry ? _jsx(Button, { type: "button", tone: s.retryTone, size: s.retrySize, onClick: props.retry.onPress, children: props.retry.label }) : null] }) });
}
export function MediaAlbumView({ album, index, onIndexChange, width, radius, className }) {
    validateMediaAlbum(album.count, index);
    const [statusShown, setStatusShown] = useState(false);
    const label = album.pageLabel(index, album.count);
    const frame = { aspectRatio: album.aspectRatio ?? mediaAlbumRecipe.defaultAspectRatio, borderRadius: radius };
    const page = album.renderPage(index);
    const opens = album.onPress !== undefined && !statusShown;
    // The frame element and the page wrapper stay the same elements in every state, so the product's page (which owns
    // the fetch) is never remounted when its status comes and goes. Only roles and the open overlay change.
    return _jsxs("div", { className: ["hjm-media-album", className].filter(Boolean).join(" "), style: { inlineSize: width, gap: mediaAlbumRecipe.controlGap }, children: [_jsxs("div", { className: "hjm-media-album__page", style: frame, role: statusShown || album.onPress ? undefined : "img", "aria-label": statusShown || album.onPress ? undefined : label, children: [_jsx("div", { className: "hjm-media-album__content", "aria-hidden": opens || undefined, children: _jsx(MediaAlbumPageContext.Provider, { value: setStatusShown, children: page }) }), opens ? _jsx("button", { type: "button", className: "hjm-media-album__open", "aria-label": label, onClick: () => album.onPress?.(index) }) : null] }), album.count > 1 ? _jsxs("div", { className: "hjm-media-album__controls", children: [_jsx(IconButton, { label: album.previousLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "start", disabled: index === 0, onClick: () => onIndexChange(index - 1), children: _jsx(Icon, { name: "chevronStart" }) }), _jsxs(Text, { variant: "caption", "aria-live": "polite", children: [index + 1, "/", album.count] }), _jsx(IconButton, { label: album.nextLabel, tone: "ghost", size: mediaAlbumRecipe.controlSize, edge: "end", disabled: index === album.count - 1, onClick: () => onIndexChange(index + 1), children: _jsx(Icon, { name: "chevronEnd" }) })] }) : null] });
}
//# sourceMappingURL=media-album.js.map