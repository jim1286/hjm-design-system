"use client";

import { createContext, useContext, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum, validateMediaAlbumPageStatus } from "@hjmds/design-contracts/screen-patterns";
import { Button, IconButton } from "../actions.js";
import { Text } from "../layout.js";
import { Icon } from "../supplemental-display.js";
import { Spinner } from "./spinner.js";

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
export type MediaAlbum = MediaAlbumBase & (
  | Readonly<{ index: number; onIndexChange(index: number): void; defaultIndex?: never }>
  | Readonly<{ index?: never; defaultIndex?: number; onIndexChange?(index: number): void }>
);

/**
 * Hosts keep the page state so every copy of the album they render (the message and its hold-menu preview) shows
 * the same page. Called unconditionally; `album` may be absent.
 */
export function useMediaAlbumIndex(album: MediaAlbum | undefined): readonly [number, (index: number) => void] {
  const [own, setOwn] = useState(album?.defaultIndex ?? 0);
  if (!album) return [0, setOwn];
  if (album.index !== undefined) {
    validateMediaAlbum(album.count, album.index);
    return [album.index, album.onIndexChange];
  }
  const current = resolveMediaAlbumIndex(album.count, own);
  return [current, (next: number) => { setOwn(next); album.onIndexChange?.(next); }];
}

/** Lets a page's status tell its frame that the page is not an image yet. */
const MediaAlbumPageContext = createContext<((shown: boolean) => void) | null>(null);

export type MediaAlbumPageStatusProps =
  | Readonly<{ kind: "loading"; /** Localized name of what is loading, e.g. "Loading photo". */ label: string }>
  | Readonly<{ kind: "error"; /** Localized failure text, shown and announced. */ label: string;
      /** Retry button; label and action come from the product. */ retry?: Readonly<{ label: string; onPress(): void }> }>;

/**
 * Loading or failed page of a `mediaAlbum` (2026-10-18 Utilverse). Return it from `renderPage` (or the component it
 * renders) while the photo is not available. While it is shown the frame drops its image name and open action, so
 * the spinner's name, the failure text and the retry button are reachable by screen readers and pointer instead of
 * being swallowed by one accessible image. Centered in the frame (VQ-09).
 */
export function MediaAlbumPageStatus(props: MediaAlbumPageStatusProps) {
  validateMediaAlbumPageStatus(props.kind, props.label);
  const report = useContext(MediaAlbumPageContext);
  // Layout effect: the frame switches its semantics before the browser paints, so the status never shows inside
  // an image or button for a frame.
  useLayoutEffect(() => { report?.(true); return () => report?.(false); }, [report]);
  const s = mediaAlbumRecipe.pageStatus;
  return <div className="hjm-media-album__status" style={{ gap: s.gap, padding: s.padding }}>
    {props.kind === "loading" ? <Spinner label={props.label} />
      : <><Text as="p" role="alert" variant={s.textVariant} tone="muted">{props.label}</Text>
        {props.retry ? <Button type="button" tone={s.retryTone} size={s.retrySize} onClick={props.retry.onPress}>{props.retry.label}</Button> : null}</>}
  </div>;
}

export function MediaAlbumView({ album, index, onIndexChange, width, radius, className }: Readonly<{
  album: MediaAlbum; index: number; onIndexChange(index: number): void;
  /** Host media width (chat `mediaWidth`, comment `mediaMaxWidth`); the album never grows past its container. */
  width: number; radius: number; className?: string;
}>) {
  validateMediaAlbum(album.count, index);
  const [statusShown, setStatusShown] = useState(false);
  const label = album.pageLabel(index, album.count);
  const frame = { aspectRatio: album.aspectRatio ?? mediaAlbumRecipe.defaultAspectRatio, borderRadius: radius } as CSSProperties;
  const page = album.renderPage(index);
  const opens = album.onPress !== undefined && !statusShown;
  // The frame element and the page wrapper stay the same elements in every state, so the product's page (which owns
  // the fetch) is never remounted when its status comes and goes. Only roles and the open overlay change.
  return <div className={["hjm-media-album", className].filter(Boolean).join(" ")} style={{ inlineSize: width, gap: mediaAlbumRecipe.controlGap }}>
    <div className="hjm-media-album__page" style={frame} role={statusShown || album.onPress ? undefined : "img"} aria-label={statusShown || album.onPress ? undefined : label}>
      <div className="hjm-media-album__content" aria-hidden={opens || undefined}>
        <MediaAlbumPageContext.Provider value={setStatusShown}>{page}</MediaAlbumPageContext.Provider>
      </div>
      {opens ? <button type="button" className="hjm-media-album__open" aria-label={label} onClick={() => album.onPress?.(index)} /> : null}
    </div>
    {album.count > 1 ? <div className="hjm-media-album__controls">
      {/* Same counter presentation as CarouselMotion navigation="counter"; logical chevrons mirror in RTL. */}
      <IconButton label={album.previousLabel} tone="ghost" size={mediaAlbumRecipe.controlSize} edge="start" disabled={index === 0} onClick={() => onIndexChange(index - 1)}><Icon name="chevronStart" /></IconButton>
      <Text variant="caption" aria-live="polite">{index + 1}/{album.count}</Text>
      <IconButton label={album.nextLabel} tone="ghost" size={mediaAlbumRecipe.controlSize} edge="end" disabled={index === album.count - 1} onClick={() => onIndexChange(index + 1)}><Icon name="chevronEnd" /></IconButton>
    </div> : null}
  </div>;
}
