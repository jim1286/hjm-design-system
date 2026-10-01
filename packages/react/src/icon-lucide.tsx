import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
export type LucideGlyphAppearance = Readonly<{ name: string; size: number; color: string; strokeWidth: number }>;
/** Pass named Lucide imports only; no dynamic icon dictionary enters the graph. */
export function createLucideGlyph(icons: Readonly<Record<string, LucideIcon>>): (props: LucideGlyphAppearance) => ReactNode {
  return ({ name, size, color, strokeWidth }) => {
    const Glyph = Object.hasOwn(icons, name) ? icons[name] : undefined;
    if (!Glyph) throw new TypeError(`No Lucide glyph registered for ${name}`);
    return <Glyph size={size} color={color} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" />;
  };
}
