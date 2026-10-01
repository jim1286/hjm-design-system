import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
export type LucideGlyphAppearance = Readonly<{
    name: string;
    size: number;
    color: string;
    strokeWidth: number;
}>;
/** Pass named Lucide imports only; no dynamic icon dictionary enters the graph. */
export declare function createLucideGlyph(icons: Readonly<Record<string, LucideIcon>>): (props: LucideGlyphAppearance) => ReactNode;
//# sourceMappingURL=icon-lucide.d.ts.map