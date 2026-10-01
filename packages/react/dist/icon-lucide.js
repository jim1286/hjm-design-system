import { jsx as _jsx } from "react/jsx-runtime";
/** Pass named Lucide imports only; no dynamic icon dictionary enters the graph. */
export function createLucideGlyph(icons) {
    return ({ name, size, color, strokeWidth }) => {
        const Glyph = Object.hasOwn(icons, name) ? icons[name] : undefined;
        if (!Glyph)
            throw new TypeError(`No Lucide glyph registered for ${name}`);
        return _jsx(Glyph, { size: size, color: color, strokeWidth: strokeWidth, "aria-hidden": "true", focusable: "false" });
    };
}
//# sourceMappingURL=icon-lucide.js.map