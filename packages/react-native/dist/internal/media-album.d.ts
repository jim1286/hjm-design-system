import { type ReactNode } from "react";
type MediaAlbumBase = Readonly<{
    /** Number of photos in the set; at least one. */
    count: number;
    /**
     * Draws one page. HJM calls it only for the page on screen, so the product can fetch, authorize and decode that
     * photo alone instead of mounting every image in the set.
     */
    renderPage(index: number): ReactNode;
    /** Localized accessible name of a page, e.g. "Photo 2 of 5". */
    pageLabel(index: number, count: number): string;
    /** Localized accessible names of the previous/next icon buttons. */
    previousLabel: string;
    nextLabel: string;
    /** Page frame width / height. Defaults to `mediaAlbumRecipe.defaultAspectRatio` (square). */
    aspectRatio?: number;
    /**
     * Opens the shown page (viewer); without it the page is a static image. While the page renders a
     * `MediaAlbumPageStatus` it is not an image yet, so it does not open.
     */
    onPress?(index: number): void;
}>;
/**
 * Paged photo set (2026-10-18). Products own image sources, authorization and the viewer; HJM owns the frame,
 * the counter row and which page is mounted. Controlled with `index` + `onIndexChange`, or uncontrolled from
 * `defaultIndex`.
 */
export type MediaAlbum = MediaAlbumBase & (Readonly<{
    index: number;
    onIndexChange(index: number): void;
    defaultIndex?: never;
}> | Readonly<{
    index?: never;
    defaultIndex?: number;
    onIndexChange?(index: number): void;
}>);
/**
 * Hosts keep the page state so every copy of the album they render (the message and its hold-menu preview, which
 * Native renders a second time) shows the same page. Called unconditionally; `album` may be absent.
 */
export declare function useMediaAlbumIndex(album: MediaAlbum | undefined): readonly [number, (index: number) => void];
export type MediaAlbumPageStatusProps = Readonly<{
    kind: "loading"; /** Localized name of what is loading, e.g. "Loading photo". */
    label: string;
}> | Readonly<{
    kind: "error"; /** Localized failure text, shown and announced. */
    label: string;
    /** Retry button; label and action come from the product. */ retry?: Readonly<{
        label: string;
        onPress(): void;
    }>;
}>;
/**
 * Loading or failed page of a `mediaAlbum` (2026-10-18 Utilverse). Return it from `renderPage` (or the component it
 * renders) while the photo is not available. While it is shown the frame stops being one accessible image (which
 * merged every child into a single element) and drops its open action, so the spinner's name, the failure text and
 * the retry button are separate screen-reader elements. Centered in the frame (VQ-09).
 */
export declare function MediaAlbumPageStatus(props: MediaAlbumPageStatusProps): import("react").JSX.Element;
export declare function MediaAlbumView({ album, index, onIndexChange, width, radius }: Readonly<{
    album: MediaAlbum;
    index: number;
    onIndexChange(index: number): void;
    /** Host media width (chat `mediaWidth`, comment `mediaMaxWidth`); the album never grows past its container. */
    width: number;
    radius: number;
}>): import("react").JSX.Element;
export {};
//# sourceMappingURL=media-album.d.ts.map