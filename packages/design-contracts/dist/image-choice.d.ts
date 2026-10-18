/**
 * Picking by picture (avatar faces, photos). 2026-10-16 composition review: products imitated this with
 * rows of selected ghost Buttons because HJM had no image-choice control.
 */
export type ImageChoiceSelectionMode = "single" | "multiple";
export type ImageChoiceItemDescriptor = Readonly<{
    id: string;
    label: string;
    /**
     * Localized secondary line under the tile (a status such as "sent", a one-line summary). Always visible when given
     * and read as the tile's description, so it must not repeat `label`.
     */
    description?: string;
    disabled?: boolean;
}>;
/** Lines the visible item label may wrap to before it is ellipsized (`showItemLabels`). */
export type ImageChoiceItemLabelLines = 1 | 2;
export declare const imageChoiceRecipe: {
    readonly tileSize: 72;
    readonly gap: 8;
    readonly radius: 12;
    readonly ringWidth: 2;
    readonly ringOffset: 2;
    readonly checkSize: 20;
    /**
     * Visible per-tile caption (`showItemLabels`, 2026-10-18 BurnTok share recipients): people are recognised by name,
     * not only by face. One line, ellipsized, as wide as the tile so the wrap grid stays even.
     */
    readonly itemLabelGap: 4;
    readonly itemLabelVariant: "caption";
    readonly itemLabelLines: 1;
    /**
     * 2026-10-18 BurnTok creation starters: multi-word titles were cut at one 80-wide line. Two lines keep a short
     * title whole (word-keeping wrap) while the grid stays even; longer copy belongs in a list row, not a tile.
     */
    readonly itemLabelMaxLines: 2;
    /**
     * One muted caption line under the label for a per-item status (2026-10-18 BurnTok share: "sent" was appended to
     * the name and hidden by the ellipsis on long nicknames).
     */
    readonly itemDescriptionVariant: "caption";
    readonly itemDescriptionTone: "muted";
    readonly itemDescriptionLines: 1;
    /**
     * Web `virtualized` viewport inset: the tile focus outline (2) plus its offset (2) would otherwise be clipped by the
     * scrolling viewport at the first row and the edges.
     */
    readonly virtualViewportInset: 4;
};
export declare function validateImageChoiceItemLabelLines(lines: number): asserts lines is ImageChoiceItemLabelLines;
/** Square ring frame around the picture, which is also the tile width. */
export declare function resolveImageChoiceOuterSize(): number;
/**
 * Caption lines every tile of a group reserves: label lines when labels show, plus the description line when any
 * item has one. Reserving the same block in every tile keeps wrapped rows even and gives virtualized rows one height.
 */
export declare function resolveImageChoiceCaptionLines(options: Readonly<{
    showItemLabels: boolean;
    itemLabelLines: ImageChoiceItemLabelLines;
    hasDescription: boolean;
}>): number;
/** Tile height for a caption block of `captionLines` lines at the rendered caption line height (token × text scale). */
export declare function resolveImageChoiceTileHeight(captionLines: number, captionLineHeight: number): number;
/** Tiles per row in a slot `width` wide: as many fixed-size tiles as fit with the recipe gap, at least one. */
export declare function resolveImageChoiceColumns(width: number): number;
export declare function validateImageChoiceItems(items: readonly ImageChoiceItemDescriptor[]): void;
/** Single mode keeps exactly the pressed id (radio semantics); multiple toggles membership in order. */
export declare function resolveImageChoiceToggle(mode: "single", value: string | null, id: string): string;
export declare function resolveImageChoiceToggle(mode: "multiple", value: readonly string[], id: string): string[];
//# sourceMappingURL=image-choice.d.ts.map