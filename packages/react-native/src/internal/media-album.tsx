import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum, validateMediaAlbumPageStatus } from "@hjmds/design-contracts/screen-patterns";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { Button, IconButton } from "../actions.js";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
import { DrawnChevron } from "./drawn-glyphs.js";
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
 * Hosts keep the page state so every copy of the album they render (the message and its hold-menu preview, which
 * Native renders a second time) shows the same page. Called unconditionally; `album` may be absent.
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
 * renders) while the photo is not available. While it is shown the frame stops being one accessible image (which
 * merged every child into a single element) and drops its open action, so the spinner's name, the failure text and
 * the retry button are separate screen-reader elements. Centered in the frame (VQ-09).
 */
export function MediaAlbumPageStatus(props: MediaAlbumPageStatusProps) {
  validateMediaAlbumPageStatus(props.kind, props.label);
  const report = useContext(MediaAlbumPageContext);
  // Layout effect: the frame switches its semantics in the same commit, before the status is shown.
  useLayoutEffect(() => { report?.(true); return () => report?.(false); }, [report]);
  const s = mediaAlbumRecipe.pageStatus;
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: s.gap, padding: s.padding }}>
    {props.kind === "loading" ? <Spinner label={props.label} />
      : <><View accessibilityRole="alert" accessibilityLiveRegion="polite"><Text variant={s.textVariant} tone="muted" align="center">{props.label}</Text></View>
        {props.retry ? <Button tone={s.retryTone} size={s.retrySize} onPress={props.retry.onPress}>{props.retry.label}</Button> : null}</>}
  </View>;
}

export function MediaAlbumView({ album, index, onIndexChange, width, radius }: Readonly<{
  album: MediaAlbum; index: number; onIndexChange(index: number): void;
  /** Host media width (chat `mediaWidth`, comment `mediaMaxWidth`); the album never grows past its container. */
  width: number; radius: number;
}>) {
  validateMediaAlbum(album.count, index);
  const { colors, palette } = useHjmNativeTheme();
  const [statusShown, setStatusShown] = useState(false);
  const label = album.pageLabel(index, album.count);
  const chevron = resolveIconButtonPresentation("ghost", palette, false).content;
  const frame = { width: "100%" as const, aspectRatio: album.aspectRatio ?? mediaAlbumRecipe.defaultAspectRatio, borderRadius: radius, overflow: "hidden" as const, backgroundColor: colors.surface };
  const page = album.renderPage(index);
  const opens = album.onPress !== undefined && !statusShown;
  const image = album.onPress === undefined && !statusShown;
  // The frame and page wrapper stay the same views in every state, so the product's page (which owns the fetch) is
  // never remounted when its status comes and goes. Only accessibility props and the open overlay change.
  return <View style={{ width, maxWidth: "100%", gap: mediaAlbumRecipe.controlGap }}>
    <View style={frame} accessible={image} {...(image ? { accessibilityRole: "image" as const, accessibilityLabel: label } : {})}>
      <View style={{ flex: 1 }} accessibilityElementsHidden={opens} importantForAccessibility={opens ? "no-hide-descendants" : "auto"}>
        <MediaAlbumPageContext.Provider value={setStatusShown}>{page}</MediaAlbumPageContext.Provider>
      </View>
      {/* Drawn after the page so it is on top for touches; the page beneath is hidden from screen readers. */}
      {opens ? <Pressable accessibilityRole="imagebutton" accessibilityLabel={label} onPress={() => album.onPress?.(index)} style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} /> : null}
    </View>
    {album.count > 1 ? <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      {/* Same counter presentation as CarouselMotion navigation="counter"; drawn chevrons mirror in RTL. */}
      <IconButton label={album.previousLabel} tone="ghost" size={mediaAlbumRecipe.controlSize} edge="start" disabled={index === 0} onPress={() => onIndexChange(index - 1)}><DrawnChevron direction="start" size={mediaAlbumRecipe.controlGlyphSize} color={chevron} /></IconButton>
      <Text align="center" variant="caption" accessibilityLiveRegion="polite">{index + 1}/{album.count}</Text>
      <IconButton label={album.nextLabel} tone="ghost" size={mediaAlbumRecipe.controlSize} edge="end" disabled={index === album.count - 1} onPress={() => onIndexChange(index + 1)}><DrawnChevron direction="end" size={mediaAlbumRecipe.controlGlyphSize} color={chevron} /></IconButton>
    </View> : null}
  </View>;
}
