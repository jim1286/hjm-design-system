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
//# sourceMappingURL=drawn-glyphs.d.ts.map