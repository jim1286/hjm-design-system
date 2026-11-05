import { Check, Minus, type IconNode } from "lucide";
import { renderLucideNodes } from "../semantic-lucide.js";

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
export function LucideGlyph({ node, size = "1em", strokeWidth = 2, mirrored = false, filled = false, className }: LucideGlyphProps) {
  return <svg className={className ? `hjm-glyph ${className}` : "hjm-glyph"} data-mirror={mirrored || undefined}
    viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {renderLucideNodes(node)}
  </svg>;
}

/** Checkbox contents: Lucide check, or minus for the mixed state; nothing when unchecked. */
export function CheckGlyph({ state }: Readonly<{ state: boolean | "mixed" }>) {
  // A check is not direction-bearing (contracts `check` is fixed in RTL), so it never mirrors.
  return state === "mixed" ? <LucideGlyph node={Minus} /> : state ? <LucideGlyph node={Check} /> : null;
}
