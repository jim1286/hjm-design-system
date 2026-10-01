import type { ReactNode, ComponentType } from "react";
type LucideGlyph = ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    accessible?: boolean;
    accessibilityElementsHidden?: boolean;
    importantForAccessibility?: "no-hide-descendants";
}>;
export type LucideGlyphAppearance = Readonly<{
    name: string;
    size: number;
    color: string;
    strokeWidth: number;
}>;
/** Icon's outer frame owns naming and RTL mirroring, not the glyph library. */
export declare function createLucideGlyph(icons: Readonly<Record<string, LucideGlyph>>): (props: LucideGlyphAppearance) => ReactNode;
export {};
//# sourceMappingURL=icon-lucide.d.ts.map