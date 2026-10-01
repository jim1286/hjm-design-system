import type { ReactNode, ComponentType } from "react";
// A scalar-only seam avoids exposing one React Native version's StyleProp
// through the adapter when the showcase/consumer uses a newer supported host.
type LucideGlyph = ComponentType<{ size?: number; color?: string; strokeWidth?: number; accessible?: boolean; accessibilityElementsHidden?: boolean; importantForAccessibility?: "no-hide-descendants" }>;
export type LucideGlyphAppearance = Readonly<{ name: string; size: number; color: string; strokeWidth: number }>;
/** Icon's outer frame owns naming and RTL mirroring, not the glyph library. */
export function createLucideGlyph(icons: Readonly<Record<string, LucideGlyph>>): (props: LucideGlyphAppearance) => ReactNode {
  return ({ name, size, color, strokeWidth }) => {
    const Glyph = Object.hasOwn(icons, name) ? icons[name] : undefined;
    if (!Glyph) throw new TypeError(`No Lucide glyph registered for ${name}`);
    return <Glyph size={size} color={color} strokeWidth={strokeWidth} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
  };
}
