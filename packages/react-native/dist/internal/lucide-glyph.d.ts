import type { LucideIcon } from "lucide-react-native";
export type LucideGlyphProps = Readonly<{
    icon: LucideIcon;
    size: number;
    color: string;
    strokeWidth?: number;
    /** Fills the closed shape (a filled Rating star); omitted, Lucide's outline stays unfilled. */
    fill?: string;
}>;
/** A decorative Lucide mark in a fixed frame. The owning control carries the accessible name. */
export declare function LucideGlyph({ icon: Glyph, size, color, strokeWidth, fill }: LucideGlyphProps): import("react").JSX.Element;
export type ChevronGlyphDirection = "up" | "down" | "start" | "end";
/** Lucide chevron whose start/end follow the reading direction: in RTL `start` points right (scenario matrix rtl). */
export declare function ChevronGlyph({ direction, ...glyph }: Readonly<{
    direction: ChevronGlyphDirection;
}> & Omit<LucideGlyphProps, "icon">): import("react").JSX.Element;
//# sourceMappingURL=lucide-glyph.d.ts.map