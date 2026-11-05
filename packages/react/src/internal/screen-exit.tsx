"use client";

import { screenExitRecipe, type ScreenExitKind } from "@hjmds/design-contracts/screen-patterns";
import { IconButton } from "../actions.js";
import { ChevronLeft, X } from "lucide";
import { renderLucideNodes } from "../semantic-lucide.js";

/** Leaving a screen: icon-only, fixed at the header's leading edge (ScreenLayout and TopBar `exit`). */
export type ScreenExit = Readonly<{ kind: ScreenExitKind; label: string; onClick(): void; disabled?: boolean }>;

/** Lucide chevron/cross (currentColor); back mirrors in RTL via CSS. */
export function ScreenExitButton({ kind, label, onClick, disabled = false }: ScreenExit) {
  const { chevronSize, closeSize, stroke } = screenExitRecipe;
  // Scale the 24-unit Lucide box so the marks keep the recipe's drawn extents: the chevron spans half the box
  // (0.7 × 2 × chevronSize tall before), the cross arms half (closeSize − 2 before); stroke stays `stroke` px.
  const size = kind === "back" ? chevronSize * 2.8 : (closeSize - 2) * 2;
  // The compact target aligns to the header gutter without an edge overhang (2026-10-21).
  return <IconButton label={label} tone="ghost" size="small" hitSlop={0} disabled={disabled} onClick={onClick}>
    <svg className="hjm-screen__exit-glyph" data-kind={kind} aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke * 24 / size} strokeLinecap="round" strokeLinejoin="round">
      {renderLucideNodes(kind === "back" ? ChevronLeft : X)}
    </svg>
  </IconButton>;
}
