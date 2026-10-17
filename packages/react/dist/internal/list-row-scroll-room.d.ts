import type { CSSProperties } from "react";
/**
 * Inline room VirtualList's clipping viewport keeps for the ListRow surface bleed.
 *
 * A ListRow puts its text on the container's content edge and bleeds its hover/pressed/selected surface
 * `listRowRecipe.surfaceBleed` outward (2026-10-17 user decision). The viewport clips at its padding edge, so it reaches
 * past its own box by the bleed and pads the same amount back: row text stays on the host's content edge and the fill
 * is not cut or turned into horizontal scroll (`overflow-x: hidden` keeps any rounding remainder from scrolling).
 *
 * Read through `--hjm-list-row-surface-bleed` (rem, like the rows' own padding) so the room scales with the root font
 * size exactly as the bleed does; the px recipe value drifted from the rem rows when the root font size changed.
 * Native shares the rule in internal/list-row-scroll-room.ts for VirtualList and the scrollable Sheet. The Web Sheet
 * body scroll box already carries the sheet padding inside, so it needs no helper.
 */
export declare function listRowScrollRoom(): CSSProperties;
//# sourceMappingURL=list-row-scroll-room.d.ts.map