import type { LucideIcon } from "lucide-react-native";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import ChevronUp from "lucide-react-native/icons/chevron-up";
import { useHjmNativeTheme } from "../provider.js";

// Lucide is the only icon source (user instruction 2026-11-05), so built-in controls draw their marks with
// lucide-react-native instead of View-built artwork or font characters, whose ink sat off-centre and varied by font
// (2026-10-17 UploadItem measurement). Icons are imported per file: Metro does not tree-shake the package barrel,
// which would pull every Lucide icon into each core bundle.

export type LucideGlyphProps = Readonly<{
  icon: LucideIcon;
  size: number;
  color: string;
  strokeWidth?: number;
  /** Fills the closed shape (a filled Rating star); omitted, Lucide's outline stays unfilled. */
  fill?: string;
}>;

/** A decorative Lucide mark in a fixed frame. The owning control carries the accessible name. */
export function LucideGlyph({ icon: Glyph, size, color, strokeWidth = 2, fill }: LucideGlyphProps) {
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} {...(fill === undefined ? {} : { fill })} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}

export type ChevronGlyphDirection = "up" | "down" | "start" | "end";

/** Lucide chevron whose start/end follow the reading direction: in RTL `start` points right (scenario matrix rtl). */
export function ChevronGlyph({ direction, ...glyph }: Readonly<{ direction: ChevronGlyphDirection }> & Omit<LucideGlyphProps, "icon">) {
  const rtl = useHjmNativeTheme().environment.direction === "rtl";
  const icon = direction === "up" ? ChevronUp : direction === "down" ? ChevronDown : (direction === "start") !== rtl ? ChevronLeft : ChevronRight;
  return <LucideGlyph icon={icon} {...glyph} />;
}
