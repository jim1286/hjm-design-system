import { jsx as _jsx } from "react/jsx-runtime";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import ChevronUp from "lucide-react-native/icons/chevron-up";
import { useHjmNativeTheme } from "../provider.js";
/** A decorative Lucide mark in a fixed frame. The owning control carries the accessible name. */
export function LucideGlyph({ icon: Glyph, size, color, strokeWidth = 2, fill }) {
    return _jsx(Glyph, { size: size, color: color, strokeWidth: strokeWidth, ...(fill === undefined ? {} : { fill }), accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" });
}
/** Lucide chevron whose start/end follow the reading direction: in RTL `start` points right (scenario matrix rtl). */
export function ChevronGlyph({ direction, ...glyph }) {
    const rtl = useHjmNativeTheme().environment.direction === "rtl";
    const icon = direction === "up" ? ChevronUp : direction === "down" ? ChevronDown : (direction === "start") !== rtl ? ChevronLeft : ChevronRight;
    return _jsx(LucideGlyph, { icon: icon, ...glyph });
}
//# sourceMappingURL=lucide-glyph.js.map