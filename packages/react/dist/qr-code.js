import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import qrcode from "qrcode-generator";
import { useMemo } from "react";
import { createQRMatrix, qrPath, qrCodeRecipe } from "@hjmds/design-contracts/components/qr-code";
export function QRCode({ value, label, size = 192, level = "M", fallback }) {
    const matrix = useMemo(() => createQRMatrix(value, qrcode, level), [value, level]);
    const modules = matrix.count + matrix.quietZone * 2;
    if (!label.trim() || fallback == null || fallback === false || !Number.isFinite(size) || size < modules * qrCodeRecipe.minModuleSize)
        throw new TypeError("QRCode needs an accessible label, alternative action and at least two pixels per module");
    // Integer-sized modules plus a four-module white quiet zone preserve scan geometry in both themes.
    const actualSize = Math.floor(size / modules) * modules;
    return _jsxs("div", { "data-hjm-qr-code": true, children: [_jsxs("svg", { role: "img", "aria-label": label, width: actualSize, height: actualSize, viewBox: `0 0 ${modules} ${modules}`, shapeRendering: "crispEdges", children: [_jsx("rect", { width: modules, height: modules, fill: qrCodeRecipe.background }), _jsx("path", { d: qrPath(matrix), fill: qrCodeRecipe.foreground })] }), fallback] });
}
//# sourceMappingURL=qr-code.js.map