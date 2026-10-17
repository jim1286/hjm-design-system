import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { Text } from "./layout.js";
export const StatusText = forwardRef(function StatusText({ children, announcement = "polite", className, ...props }, ref) {
    // The live node must stay mounted to announce later results, but an empty one would still take a
    // flex/grid slot and add a stack gap (Native renders nothing then), so it leaves layout while empty.
    const hidden = children === "" ? "hjm-visually-hidden" : undefined;
    return _jsx(Text, { ...props, ref: ref, className: [className, hidden].filter(Boolean).join(" ") || undefined, role: announcement === "none" ? undefined : announcement === "assertive" ? "alert" : "status", "aria-live": announcement === "none" ? "off" : announcement, "aria-atomic": announcement === "none" ? undefined : true, children: children });
});
//# sourceMappingURL=status-text.js.map