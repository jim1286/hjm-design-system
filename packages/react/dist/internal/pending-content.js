"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from "react";
import { Spinner } from "./spinner.js";
/** Shared host for the public region and AuthScreen's focus-managed action block. */
export function PendingContentHost({ pending, label, children, layoutStyle, className, contentProps, indicatorClassName }) {
    const content = useRef(null);
    const [height, setHeight] = useState();
    useLayoutEffect(() => {
        if (pending || !content.current)
            return;
        const node = content.current;
        const measure = () => { const next = node.getBoundingClientRect().height; if (next > 0)
            setHeight(next); };
        measure();
        if (typeof ResizeObserver === "undefined")
            return;
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, [pending]);
    if (pending && !label.trim())
        throw new TypeError("PendingContent requires a non-empty pending label");
    return _jsxs("div", { className: className, "aria-busy": pending || undefined, style: { ...layoutStyle, position: "relative", width: "100%", ...(pending && height ? { height } : {}) }, children: [_jsx("div", { ...contentProps, ref: node => {
                    content.current = node;
                    const ref = contentProps?.ref;
                    if (typeof ref === "function")
                        ref(node);
                    else if (ref)
                        ref.current = node;
                }, inert: pending, "aria-hidden": pending || undefined, style: pending ? { visibility: "hidden" } : undefined, children: children }), pending ? _jsx("div", { className: indicatorClassName, style: { position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }, children: _jsx(Spinner, { label: label }) }) : null] });
}
/** Keep controls mounted and preserve their last ready height while a single centered spinner replaces them. */
export function PendingContent(props) { return _jsx(PendingContentHost, { ...props }); }
//# sourceMappingURL=pending-content.js.map