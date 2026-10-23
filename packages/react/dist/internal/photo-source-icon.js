"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useHjmTheme } from "../provider.js";
export function PhotoSourceIcon({ source }) {
    const { environment } = useHjmTheme();
    // Shared neutral colors use a stronger plate/line contrast after device feedback (2026-10-20).
    const colors = environment.theme === "dark"
        ? { background: "#334155", color: "#F1F5F9" }
        : { background: "#E2E8F0", color: "#334155" };
    return _jsx("span", { className: "hjm-photo-source__icon", style: colors, "aria-hidden": "true", children: _jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", focusable: "false", children: source === "camera"
                ? _jsx("path", { d: "M8 6 9.5 3h5L16 6h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4Zm8 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" })
                : _jsx("path", { d: "M5 17H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1M9 7h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm-2 12 5-5 4 4 2-2 4 4M17 11h.01" }) }) });
}
//# sourceMappingURL=photo-source-icon.js.map