import type { ReactNode } from "react";
import { View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { selectionControlRecipe } from "@hjmds/design-contracts/recipes";
import { useHjmNativeTheme } from "../provider.js";

export type SelectionMarkState = boolean | "mixed";

/**
 * Checkbox/Radio indicator box. Agreement and TransferList rows are multi-select too, so they draw this same box
 * rather than their own 16pt mark (2026-10-17 review: the 16pt box with radius sm read as a radio).
 * The check and dash are fixed artwork: HJM Text scales with textScale even when OS scaling is off.
 */
export function SelectionMark({ kind = "checkbox", checked, size = "medium", invalid = false, children }: Readonly<{
  kind?: "checkbox" | "radio";
  checked: SelectionMarkState;
  size?: keyof typeof selectionControlRecipe.sizes;
  invalid?: boolean;
  /** Product indicator override (ChoiceRow `renderIndicator`). */
  children?: ReactNode;
}>) {
  const theme = useHjmNativeTheme();
  const control = selectionControlRecipe.sizes[size].control;
  const selected = checked !== false;
  const ink = resolveColorReference(selectionControlRecipe.states.indicator, theme.palette);
  const border = invalid
    ? selectionControlRecipe.states.invalidBorder
    : selected ? selectionControlRecipe.states.checkedBorder : selectionControlRecipe.states.idleBorder;
  const artwork = children != null ? children : kind === "radio"
    ? checked === true ? <View style={{ backgroundColor: ink, borderRadius: theme.tokens.radius.full, height: control * selectionControlRecipe.radioDotRatio, width: control * selectionControlRecipe.radioDotRatio }} /> : null
    : checked === "mixed" ? <View style={{ width: 10, height: 2, backgroundColor: ink }} />
    // RTL mirrors the whole check (rotation and the drawn side together); flipping only the rotation drew a broken mark.
    : checked ? <View style={{ width: 8, height: 4, borderBottomWidth: 2, ...(theme.environment.direction === "rtl" ? { borderRightWidth: 2 } : { borderLeftWidth: 2 }), borderColor: ink, transform: [{ translateY: -1 }, { rotate: theme.environment.direction === "rtl" ? "45deg" : "-45deg" }] }} />
    : null;
  return <View accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants" style={{
    alignItems: "center",
    backgroundColor: resolveColorReference(selected ? selectionControlRecipe.states.checkedBackground : selectionControlRecipe.states.idleBackground, theme.palette),
    borderColor: resolveColorReference(border, theme.palette),
    borderRadius: theme.tokens.radius[selectionControlRecipe.shapes[kind]],
    borderWidth: selectionControlRecipe.indicatorBorderWidth,
    flexShrink: 0,
    height: control,
    justifyContent: "center",
    width: control,
  }}>{artwork}</View>;
}
