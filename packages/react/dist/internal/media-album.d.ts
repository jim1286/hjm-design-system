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
    /** Opens the shown page (viewer); without it the page is a static image. */
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
 * Hosts keep the page state so every copy of the album they render (the message and its hold-menu preview) shows
 * the same page. Called unconditionally; `album` may be absent.
 */
export declare function useMediaAlbumIndex(album: MediaAlbum | undefined): readonly [number, (index: number) => void];
export declare function MediaAlbumView({ album, index, onIndexChange, width, radius, className }: Readonly<{
    album: MediaAlbum;
    index: number;
    onIndexChange(index: number): void;
    /** Host media width (chat `mediaWidth`, comment `mediaMaxWidth`); the album never grows past its container. */
    width: number;
    radius: number;
    className?: string;
}>): import("react").JSX.Element;
export {};
//# sourceMappingURL=media-album.d.ts.map