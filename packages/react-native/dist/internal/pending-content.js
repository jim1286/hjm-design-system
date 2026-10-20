import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { View } from "react-native";
import { Spinner } from "./spinner.js";
/** Keep form state mounted; a changing pending child must not collapse its enclosing card. */
export function PendingContent({ pending, label, children, layoutStyle }) {
    const [height, setHeight] = useState();
    if (pending && !label.trim())
        throw new TypeError("PendingContent requires a non-empty pending label");
    const measure = (event) => {
        if (!pending && event.nativeEvent.layout.height > 0)
            setHeight(event.nativeEvent.layout.height);
    };
    return _jsxs(View, { style: [layoutStyle, { position: "relative", width: "100%" }, pending && height ? { height } : undefined], children: [_jsx(View, { onLayout: measure, pointerEvents: pending ? "none" : "auto", accessibilityElementsHidden: pending, importantForAccessibility: pending ? "no-hide-descendants" : "auto", style: pending ? { opacity: 0 } : undefined, children: children }), pending ? _jsx(View, { pointerEvents: "none", style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }, children: _jsx(Spinner, { label: label }) }) : null] });
}
//# sourceMappingURL=pending-content.js.map