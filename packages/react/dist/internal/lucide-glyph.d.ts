import { type IconNode } from "lucide";
export type LucideGlyphProps = Readonly<{
    node: IconNode;
    /** CSS length or px; 1em follows the slot's font size the way the text glyph it replaced did. */
    size?: number | string;
    strokeWidth?: number;
    /** Flip in right-to-left text, for direction-bearing marks (chevrons pointing "next"). */
    mirrored?: boolean;
    /** Paint the shape solid (a selected star) instead of outlining it. */
    filled?: boolean;
    className?: string;
}>;
/** A decorative Lucide mark in the current text color; the owning control carries the accessible name. */
export declare function LucideGlyph({ node, size, strokeWidth, mirrored, filled, className }: LucideGlyphProps): import("react").JSX.Element;
/** Checkbox contents: Lucide check, or minus for the mixed state; nothing when unchecked. */
export declare function CheckGlyph({ state }: Readonly<{
    state: boolean | "mixed";
}>): import("react").JSX.Element | null;
//# sourceMappingURL=lucide-glyph.d.ts.map