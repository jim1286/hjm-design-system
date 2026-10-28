import { type ColorReferencePalette } from "./color-references.js";
export type IconButtonSize = "small" | "medium" | "large";
export type IconButtonShape = "rounded" | "circle";
export type IconButtonTone = "primary" | "secondary" | "ghost" | "danger";
/**
 * Which container edge a ghost IconButton sits on (logical: `start`/`end` follow the reading direction). The
 * button keeps its full touch target but overhangs that edge so its glyph slot, not the transparent hit area,
 * sets the visible inset (2026-10-17 measured audit: glyphs sat 10–15px inside the row/header inset).
 */
export type IconButtonEdge = "start" | "end" | "both";
export declare const iconButtonEdges: readonly ["start", "end", "both"];
export declare const iconButtonRecipe: {
    readonly slots: readonly ["root", "icon", "spinner"];
    readonly defaults: {
        readonly tone: "ghost";
        readonly size: "medium";
        readonly shape: "rounded";
    };
    readonly tones: {
        readonly primary: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly secondary: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
        };
        readonly ghost: {
            readonly background: null;
            readonly content: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly danger: {
            readonly background: Readonly<{
                source: "theme";
                key: "dangerFill";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onDanger";
                alpha?: number;
            }>;
            readonly border: null;
        };
    };
    readonly sizes: {
        readonly small: {
            readonly diameter: 36;
            readonly hitSlop: 4;
            readonly glyph: "sm";
        };
        readonly medium: {
            readonly diameter: 44;
            readonly hitSlop: 0;
            readonly glyph: "md";
        };
        readonly large: {
            readonly diameter: 52;
            readonly hitSlop: 0;
            readonly glyph: "lg";
        };
    };
    readonly shapes: {
        readonly rounded: "md";
        readonly circle: "full";
    };
    /**
     * Edge alignment (2026-10-17 measured audit): a ghost IconButton at a row/header edge overhangs that edge by
     * (visible diameter − glyph slot) / 2, so the glyph slot lines up with the container inset like text does while
     * the hit area stays whole. Only `ghost` overhangs — filled and outlined tones show their frame, and the frame is
     * what aligns. Renderers read `resolveIconButtonEdgeOverhang` so a raised visible diameter (minimumVisualTarget)
     * moves the glyph slot by the same amount on Web and Native.
     */
    readonly edge: {
        readonly tones: readonly ["ghost"];
    };
    /**
     * `elevation` (2026-10-23) lifts a floating control (Burntok Dock's center action) with a shadow token. Only filled
     * tones can carry it: a ghost button has no frame for the shadow to belong to (Android draws none without a fill).
     */
    readonly elevation: {
        readonly default: "none";
        readonly tones: readonly ["primary", "secondary", "danger"];
    };
    /**
     * Count badge on an IconButton (NotificationBell). 2026-10-23 web check: a medium badge at the button's top-end
     * corner (top 0, end 0) covered 82% of BurnTok's 18px heart in a small (36) bell. The badge is now the compact
     * `small` floating plate, kept on the button's end edge (it never sticks out past an `edge`-aligned inset) and
     * raised so only its `glyphOverlap` ring (the canvas-colored floating border) reaches into the glyph slot.
     * Wider counts grow toward the start along the top, not down over the glyph. See `resolveIconButtonBadgeOffset`.
     */
    readonly badge: {
        readonly size: "small";
        readonly variant: "floating";
        readonly glyphOverlap: 2;
        readonly inlineEnd: 0;
    };
    readonly states: {
        readonly selected: {
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly pressedOpacity: 0.86;
        readonly disabledOpacity: 0.5;
    };
};
export type ResolvedIconButtonPresentation = Readonly<{
    background: string | null;
    content: string;
    border: string | null;
}>;
/** Resolve one recipe tone for non-CSS renderers without a second tone table. */
export declare function resolveIconButtonPresentation(tone: IconButtonTone, palette: ColorReferencePalette, selected?: boolean): ResolvedIconButtonPresentation;
/**
 * Negative margin a ghost IconButton applies on its `edge` side(s): (visible diameter − glyph slot) / 2, e.g. 10 for
 * medium (44 − 24). 0 for tones that draw a frame. `visibleDiameter` is the rendered size after the Provider's
 * minimumVisualTarget axis (`visibleControlHeight`), so the overhang tracks what is actually drawn.
 */
export declare function resolveIconButtonEdgeOverhang(tone: IconButtonTone, size: IconButtonSize, visibleDiameter?: number): number;
/**
 * Where an IconButton's count badge sits, measured from the button's top-end corner (logical: `inlineEnd` mirrors in
 * RTL). The badge's block-end lands `badge.glyphOverlap` inside the glyph slot's top edge: blockStart = slot inset +
 * overlap − badge height, e.g. −6 for small (36 − 20 slot, 16 badge). `visibleDiameter` is the rendered size after the
 * Provider's minimumVisualTarget axis, so the badge follows the glyph slot when the button grows (Web and Native).
 */
export declare function resolveIconButtonBadgeOffset(size: IconButtonSize, visibleDiameter?: number): Readonly<{
    blockStart: number;
    inlineEnd: number;
}>;
/** Throws for an unknown step or an elevated ghost IconButton (iconButtonRecipe.elevation). */
export declare function validateIconButtonElevation(elevation: string, tone: IconButtonTone): void;
//# sourceMappingURL=icon-button-recipe.d.ts.map