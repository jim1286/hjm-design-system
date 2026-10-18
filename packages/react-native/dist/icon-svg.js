import { jsx as _jsx } from "react/jsx-runtime";
import { Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import { isSemanticIconName, semanticIconPaths, } from "@hjmds/design-contracts/components/icon";
import { iconRecipe } from "@hjmds/design-contracts/recipes";
// Native Icon keeps `renderGlyph` as its tree-shakeable artwork seam, and react-native-svg stays an optional peer so
// core controls do not require it (they use Views in internal/drawn-glyphs). This granular entry is the opt-in that
// draws the same shared 24-unit paths Web ships built in, the way `/icon-lucide` opts in to Lucide artwork.
// react-native-svg forwards native-only props to SVG DOM on Expo Web; hide the artwork with the host's own property.
const hiddenArtwork = Platform.OS === "web"
    ? { "aria-hidden": true }
    : { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" };
/**
 * Draws an HJM semantic mark inside Icon's frame. Icon still owns naming, size, tone and RTL mirroring; this only
 * paints the shared geometry with the resolved size, color and stroke.
 */
export function renderSemanticGlyph({ name, size, color, strokeWidth }) {
    if (!isSemanticIconName(name))
        throw new TypeError(`No HJM semantic glyph for ${name}`);
    return (_jsx(Svg, { ...hiddenArtwork, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: strokeWidth, strokeLinecap: iconRecipe.stroke.lineCap, strokeLinejoin: iconRecipe.stroke.lineJoin, children: _jsx(Path, { d: semanticIconPaths[name] }) }));
}
//# sourceMappingURL=icon-svg.js.map