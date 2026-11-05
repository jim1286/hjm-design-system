import X from "lucide-react-native/icons/x";
import { screenExitRecipe, type ScreenExitKind } from "@hjmds/design-contracts/screen-patterns";
import { IconButton } from "../actions.js";
import { useHjmNativeTheme } from "../provider.js";
import { ChevronGlyph, LucideGlyph } from "./lucide-glyph.js";

/** Leaving a screen: icon-only, fixed at the header's leading edge (ScreenLayout and TopBar `exit`). */
export type ScreenExit = Readonly<{ kind: ScreenExitKind; label: string; onPress(): void; disabled?: boolean }>;

/** Lucide chevron/X so back and close look identical on every platform and font; back mirrors with the reading direction. */
export function ScreenExitButton({ kind, label, onPress, disabled = false }: ScreenExit) {
  const { colors } = useHjmNativeTheme();
  const { chevronSize, closeSize, stroke } = screenExitRecipe;
  // Lucide draws both marks across half of its 24-unit grid, so a frame of twice the recipe's close arm keeps the
  // ink at the recipe extent, and the recipe stroke stays in points at that frame.
  const size = Math.max(chevronSize, closeSize) * 2;
  const glyph = { size, color: colors.text, strokeWidth: stroke * 24 / size };
  // The compact target aligns to the header gutter without an edge overhang (2026-10-21).
  return <IconButton label={label} tone="ghost" size="small" hitSlop={0} disabled={disabled} onPress={onPress}>
    {kind === "back" ? <ChevronGlyph direction="start" {...glyph} /> : <LucideGlyph icon={X} {...glyph} />}
  </IconButton>;
}
