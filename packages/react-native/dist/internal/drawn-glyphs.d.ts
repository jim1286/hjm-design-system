export type DrawnChevronDirection = "up" | "down" | "start" | "end";
export declare function DrawnChevron({ direction, size, color, strokeWidth }: Readonly<{
    direction: DrawnChevronDirection;
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
export declare function DrawnCalendar({ size, color, strokeWidth }: Readonly<{
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
/** Web's built-in `search` mark: a ring with the handle toward the lower end. The handle mirrors in RTL with the reading direction. */
export declare function DrawnSearch({ size, color, strokeWidth }: Readonly<{
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
/** Web's built-in `delete` mark: lid, handle and a can narrowing toward the bottom. Symmetric, so it does not mirror. */
export declare function DrawnTrash({ size, color, strokeWidth }: Readonly<{
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
/** Web's built-in `edit` mark: a pencil leaning toward the lower start corner, as drawn on the 24-unit grid. */
export declare function DrawnPencil({ size, color, strokeWidth }: Readonly<{
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
/** Vertical "more" dots (Web CommentThreadRow draws the same three circles on the 24-unit grid). Symmetric, so it does not mirror. */
export declare function DrawnMoreVertical({ size, color }: Readonly<{
    size: number;
    color: string;
}>): import("react").JSX.Element;
/** Web's built-in `more` mark: three dots across the 24-unit grid (5, 12, 19). Symmetric, so it does not mirror. */
export declare function DrawnMoreHorizontal({ size, color }: Readonly<{
    size: number;
    color: string;
}>): import("react").JSX.Element;
/** Web's built-in `add` mark: a 14-unit cross centred on the 24-unit grid. Symmetric, no mirroring. */
export declare function DrawnPlus({ size, color, strokeWidth }: Readonly<{
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
/**
 * Web's built-in `close` mark (two diagonals on the 24-unit grid, 6→18). Row tools drew a font "×" before, whose ink
 * sat ~5pt below the button centre and varied by font (2026-10-17 UploadItem measurement). Symmetric, no mirroring.
 */
export declare function DrawnClose({ size, color, strokeWidth }: Readonly<{
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
/**
 * Web's built-in `refresh` mark: two arcs of the r=8 circle (top→end, bottom→start) with arrow corners at the end and
 * start of the horizontal axis, replacing the font "↻" that rendered off-centre (2026-10-17 UploadItem measurement).
 */
export declare function DrawnRefresh({ size, color, strokeWidth }: Readonly<{
    size: number;
    color: string;
    strokeWidth?: number;
}>): import("react").JSX.Element;
//# sourceMappingURL=drawn-glyphs.d.ts.map