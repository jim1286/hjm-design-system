import { screenExitRecipe, type ScreenExitKind } from "@hjmds/design-contracts/screen-patterns";
import { IconButton } from "../actions.js";

/** Leaving a screen: icon-only, fixed at the header's leading edge (ScreenLayout and TopBar `exit`). */
export type ScreenExit = Readonly<{ kind: ScreenExitKind; label: string; onClick(): void; disabled?: boolean }>;

/** Drawn chevron/cross (currentColor) so back and close match native; back mirrors in RTL via CSS. */
export function ScreenExitButton({ kind, label, onClick, disabled = false }: ScreenExit) {
  const { chevronSize, closeSize, stroke } = screenExitRecipe;
  const size = kind === "back" ? chevronSize * 2 : closeSize;
  return <IconButton label={label} tone="ghost" disabled={disabled} onClick={onClick}>
    <svg className="hjm-screen__exit-glyph" data-kind={kind} aria-hidden="true" focusable="false" width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {kind === "back" ? <path d={`M${size * 0.65} ${size * 0.15} L${size * 0.3} ${size / 2} L${size * 0.65} ${size * 0.85}`} /> : <path d={`M1 1 L${size - 1} ${size - 1} M${size - 1} 1 L1 ${size - 1}`} />}
    </svg>
  </IconButton>;
}
