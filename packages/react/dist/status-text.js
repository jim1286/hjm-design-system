import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { Text } from "./layout.js";
export const StatusText = forwardRef(function StatusText({ children, announcement = "polite", ...props }, ref) {
    return _jsx(Text, { ...props, ref: ref, role: announcement === "none" ? undefined : announcement === "assertive" ? "alert" : "status", "aria-live": announcement === "none" ? "off" : announcement, "aria-atomic": announcement === "none" ? undefined : true, children: children });
});
//# sourceMappingURL=status-text.js.map