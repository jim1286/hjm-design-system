import { jsx as _jsx } from "react/jsx-runtime";
/** Icon's outer frame owns naming and RTL mirroring, not the glyph library. */
export function createLucideGlyph(icons) {
    return ({ name, size, color, strokeWidth }) => {
        const Glyph = Object.hasOwn(icons, name) ? icons[name] : undefined;
        if (!Glyph)
            throw new TypeError(`No Lucide glyph registered for ${name}`);
        return _jsx(Glyph, { size: size, color: color, strokeWidth: strokeWidth, accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" });
    };
}
//# sourceMappingURL=icon-lucide.js.map