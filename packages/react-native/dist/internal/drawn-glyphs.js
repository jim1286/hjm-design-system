import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from "react-native";
import { useHjmNativeTheme } from "../provider.js";
// Native Icon needs a product glyph renderer and react-native-svg is an optional peer, so the few semantic glyphs a
// built-in control must draw on its own (calendar, chevrons) are drawn with Views in a fixed frame, like the
// Agreement check and PasswordField eye. They mirror Web's built-in `calendar` / `chevron*` paths (24-unit grid)
// instead of the text placeholders "▣" and "→" these controls used before (2026-10-17 review).
const hidden = { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" };
const chevronTurn = { up: 45, down: 225, start: -45, end: 135 };
export function DrawnChevron({ direction, size, color, strokeWidth = 2 }) {
    const arm = size * 0.36;
    // Physical sides follow the reading direction (scenario matrix rtl): the top+start corner rotated toward the
    // tip draws the same up/down chevron in LTR and RTL, and start/end chevrons point to the reading start/end.
    const rtl = useHjmNativeTheme().environment.direction === "rtl";
    const turn = chevronTurn[direction] * (rtl ? -1 : 1);
    const vertical = direction === "up" || direction === "down";
    const tipLeft = (direction === "start") !== rtl;
    return _jsx(View, { ...hidden, style: { width: size, height: size, alignItems: "center", justifyContent: "center" }, children: _jsx(View, { style: {
                width: arm, height: arm, borderColor: color, borderTopWidth: strokeWidth, ...(rtl ? { borderRightWidth: strokeWidth } : { borderLeftWidth: strokeWidth }),
                // A rotated corner: 45deg opens downward (points up), 225deg points down, -45/135 point left/right in LTR.
                // The offset keeps the tip optically centered.
                transform: [vertical ? { translateY: direction === "up" ? arm * 0.2 : -arm * 0.2 } : { translateX: tipLeft ? arm * 0.2 : -arm * 0.2 }, { rotate: `${turn}deg` }],
            } }) });
}
export function DrawnCalendar({ size, color, strokeWidth = 2 }) {
    const body = size * 0.75;
    return _jsxs(View, { ...hidden, style: { width: size, height: size, alignItems: "center", justifyContent: "center" }, children: [_jsx(View, { style: { width: body, height: body * 0.92, borderWidth: strokeWidth, borderColor: color, borderRadius: strokeWidth * 1.5, marginTop: size * 0.08 }, children: _jsx(View, { style: { height: strokeWidth, backgroundColor: color, marginTop: body * 0.22 } }) }), [0.32, 0.68].map(x => _jsx(View, { style: { position: "absolute", top: size * 0.06, start: size * x - strokeWidth / 2, width: strokeWidth, height: size * 0.2, borderRadius: strokeWidth, backgroundColor: color } }, x))] });
}
/** Web's built-in `search` mark: a ring with the handle toward the lower end. The handle mirrors in RTL with the reading direction. */
export function DrawnSearch({ size, color, strokeWidth = 2 }) {
    const ring = size * 0.62, handle = size * 0.3;
    const rtl = useHjmNativeTheme().environment.direction === "rtl";
    return _jsxs(View, { ...hidden, style: { width: size, height: size }, children: [_jsx(View, { style: { position: "absolute", top: size * 0.08, ...(rtl ? { right: size * 0.08 } : { left: size * 0.08 }), width: ring, height: ring, borderRadius: ring / 2, borderWidth: strokeWidth, borderColor: color } }), _jsx(View, { style: { position: "absolute", top: size * 0.76, ...(rtl ? { right: size * 0.62 } : { left: size * 0.62 }), width: handle, height: strokeWidth, borderRadius: strokeWidth, backgroundColor: color,
                    transform: [{ translateY: -strokeWidth / 2 }, { rotate: rtl ? "-45deg" : "45deg" }] } })] });
}
/** Web's built-in `delete` mark: lid, handle and a can narrowing toward the bottom. Symmetric, so it does not mirror. */
export function DrawnTrash({ size, color, strokeWidth = 2 }) {
    return _jsxs(View, { ...hidden, style: { width: size, height: size, alignItems: "center" }, children: [_jsx(View, { style: { marginTop: size * 0.12, width: size * 0.28, height: size * 0.12, borderWidth: strokeWidth, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: strokeWidth, borderTopRightRadius: strokeWidth } }), _jsx(View, { style: { width: size * 0.7, height: strokeWidth, borderRadius: strokeWidth, backgroundColor: color } }), _jsx(View, { style: { width: size * 0.5, height: size * 0.56, borderWidth: strokeWidth, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: strokeWidth * 1.5, borderBottomRightRadius: strokeWidth * 1.5 } })] });
}
/** Web's built-in `edit` mark: a pencil leaning toward the lower start corner, as drawn on the 24-unit grid. */
export function DrawnPencil({ size, color, strokeWidth = 2 }) {
    const body = size * 0.24, length = size * 0.62, tip = body / 2;
    return _jsx(View, { ...hidden, style: { width: size, height: size, alignItems: "center", justifyContent: "center" }, children: _jsxs(View, { style: { alignItems: "center", transform: [{ rotate: "45deg" }] }, children: [_jsx(View, { style: { width: body, height: length, borderWidth: strokeWidth, borderColor: color, borderTopLeftRadius: strokeWidth, borderTopRightRadius: strokeWidth } }), _jsx(View, { style: { width: 0, height: 0, borderLeftWidth: tip, borderRightWidth: tip, borderTopWidth: tip * 1.2, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: color } })] }) });
}
/** Vertical "more" dots (Web CommentThreadRow draws the same three circles on the 24-unit grid). Symmetric, so it does not mirror. */
export function DrawnMoreVertical({ size, color }) {
    const dot = size * 0.15;
    return _jsx(View, { ...hidden, style: { width: size, height: size, alignItems: "center", justifyContent: "space-between", paddingVertical: size * 0.135 }, children: [0, 1, 2].map(index => _jsx(View, { style: { width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color } }, index)) });
}
/**
 * Web's built-in `close` mark (two diagonals on the 24-unit grid, 6→18). Row tools drew a font "×" before, whose ink
 * sat ~5pt below the button centre and varied by font (2026-10-17 UploadItem measurement). Symmetric, no mirroring.
 */
export function DrawnClose({ size, color, strokeWidth = 2 }) {
    const arm = size * (12 / 24) * Math.SQRT2;
    return _jsx(View, { ...hidden, style: { width: size, height: size, alignItems: "center", justifyContent: "center" }, children: ["45deg", "-45deg"].map(rotate => _jsx(View, { style: { position: "absolute", width: arm, height: strokeWidth, borderRadius: strokeWidth / 2, backgroundColor: color, transform: [{ rotate }] } }, rotate)) });
}
/**
 * Web's built-in `refresh` mark: two arcs of the r=8 circle (top→end, bottom→start) with arrow corners at the end and
 * start of the horizontal axis, replacing the font "↻" that rendered off-centre (2026-10-17 UploadItem measurement).
 */
export function DrawnRefresh({ size, color, strokeWidth = 2 }) {
    const unit = size / 24, ring = 16 * unit, head = 5 * unit;
    return _jsxs(View, { ...hidden, style: { width: size, height: size }, children: [_jsx(View, { style: { position: "absolute", left: 4 * unit, top: 4 * unit, width: ring, height: ring, borderRadius: ring / 2, borderWidth: strokeWidth, borderColor: color, borderLeftColor: "transparent", borderRightColor: "transparent", transform: [{ rotate: "45deg" }] } }), _jsx(View, { style: { position: "absolute", left: 20 * unit - head, top: 12 * unit - head, width: head, height: head, borderRightWidth: strokeWidth, borderBottomWidth: strokeWidth, borderColor: color } }), _jsx(View, { style: { position: "absolute", left: 4 * unit, top: 12 * unit, width: head, height: head, borderLeftWidth: strokeWidth, borderTopWidth: strokeWidth, borderColor: color } })] });
}
//# sourceMappingURL=drawn-glyphs.js.map