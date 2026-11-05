import { jsx as _jsx } from "react/jsx-runtime";
import { View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { selectionControlRecipe } from "@hjmds/design-contracts/recipes";
import Check from "lucide-react-native/icons/check";
import Minus from "lucide-react-native/icons/minus";
import { useHjmNativeTheme } from "../provider.js";
import { LucideGlyph } from "./lucide-glyph.js";
/**
 * Checkbox/Radio indicator box. Agreement and TransferList rows are multi-select too, so they draw this same box
 * rather than their own 16pt mark (2026-10-17 review: the 16pt box with radius sm read as a radio).
 * The check and dash are fixed-size Lucide artwork: HJM Text scales with textScale even when OS scaling is off.
 */
export function SelectionMark({ kind = "checkbox", checked, size = "medium", invalid = false, children }) {
    const theme = useHjmNativeTheme();
    const control = selectionControlRecipe.sizes[size].control;
    const mark = control * 0.7, markStroke = 2 * 24 / mark;
    const selected = checked !== false;
    const ink = resolveColorReference(selectionControlRecipe.states.indicator, theme.palette);
    const border = invalid
        ? selectionControlRecipe.states.invalidBorder
        : selected ? selectionControlRecipe.states.checkedBorder : selectionControlRecipe.states.idleBorder;
    const artwork = children != null ? children : kind === "radio"
        ? checked === true ? _jsx(View, { style: { backgroundColor: ink, borderRadius: theme.tokens.radius.full, height: control * selectionControlRecipe.radioDotRatio, width: control * selectionControlRecipe.radioDotRatio } }) : null
        // Lucide Check/Minus at 70% of the box keep the earlier ~10pt mark, with the 2pt line held in points. A check
        // is not a direction mark, so it does not mirror in RTL (same as the semantic `check` icon).
        : checked === "mixed" ? _jsx(LucideGlyph, { icon: Minus, size: mark, color: ink, strokeWidth: markStroke })
            : checked ? _jsx(LucideGlyph, { icon: Check, size: mark, color: ink, strokeWidth: markStroke })
                : null;
    return _jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: {
            alignItems: "center",
            backgroundColor: resolveColorReference(selected ? selectionControlRecipe.states.checkedBackground : selectionControlRecipe.states.idleBackground, theme.palette),
            borderColor: resolveColorReference(border, theme.palette),
            borderRadius: theme.tokens.radius[selectionControlRecipe.shapes[kind]],
            borderWidth: selectionControlRecipe.indicatorBorderWidth,
            flexShrink: 0,
            height: control,
            justifyContent: "center",
            width: control,
        }, children: artwork });
}
//# sourceMappingURL=selection-mark.js.map