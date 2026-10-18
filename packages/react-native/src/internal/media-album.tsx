import { useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { mediaAlbumRecipe, resolveMediaAlbumIndex, validateMediaAlbum } from "@hjmds/design-contracts/screen-patterns";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { IconButton } from "../actions.js";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
import { DrawnChevron } from "./drawn-glyphs.js";

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

export function MediaAlbumView({ album, index, onIndexChange, width, radius }: Readonly<{
  album: MediaAlbum; index: number; onIndexChange(index: number): void;
  /** Host media width (chat `mediaWidth`, comment `mediaMaxWidth`); the album never grows past its container. */
  width: number; radius: number;
}>) {
  validateMediaAlbum(album.count, index);
  const { colors, palette } = useHjmNativeTheme();
  const label = album.pageLabel(index, album.count);
  const chevron = resolveIconButtonPresentation("ghost", palette, false).content;
  const frame = { width: "100%" as const, aspectRatio: album.aspectRatio ?? mediaAlbumRecipe.defaultAspectRatio, borderRadius: radius, overflow: "hidden" as const, backgroundColor: colors.surface };
  const page = album.renderPage(index);
  return <View style={{ width, maxWidth: "100%", gap: mediaAlbumRecipe.controlGap }}>
    {album.onPress
      ? <Pressable accessibilityRole="imagebutton" accessibilityLabel={label} onPress={() => album.onPress?.(index)} style={frame}>{page}</Pressable>
      : <View accessible accessibilityRole="image" accessibilityLabel={label} style={frame}>{page}</View>}
    {album.count > 1 ? <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      {/* Same counter presentation as CarouselMotion navigation="counter"; drawn chevrons mirror in RTL. */}
      <IconButton label={album.previousLabel} tone="ghost" size={mediaAlbumRecipe.controlSize} edge="start" disabled={index === 0} onPress={() => onIndexChange(index - 1)}><DrawnChevron direction="start" size={mediaAlbumRecipe.controlGlyphSize} color={chevron} /></IconButton>
      <Text align="center" variant="caption" accessibilityLiveRegion="polite">{index + 1}/{album.count}</Text>
      <IconButton label={album.nextLabel} tone="ghost" size={mediaAlbumRecipe.controlSize} edge="end" disabled={index === album.count - 1} onPress={() => onIndexChange(index + 1)}><DrawnChevron direction="end" size={mediaAlbumRecipe.controlGlyphSize} color={chevron} /></IconButton>
    </View> : null}
  </View>;
}
