import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveStepsDescriptor, } from "@hjmds/design-contracts/components/steps";
import { forwardRef } from "react";
import { classNames } from "./internal.js";
/** Linear, read-only progress steps with one canonical cursor. */
export const Steps = forwardRef(function Steps({ descriptor, statusLabels, composeAccessibleName, renderMark, className, ...props }, ref) {
    const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
    return (_jsx("ol", { ...props, ref: ref, className: classNames("hjm-steps", className), children: steps.map((step, index) => (_jsxs("li", { "aria-label": step.accessibleName, "aria-current": step.status === "current" || step.status === "error" ? "step" : undefined, className: "hjm-steps__step", "data-status": step.status, children: [_jsxs("div", { className: "hjm-steps__rail", "aria-hidden": "true", children: [_jsx("span", { className: "hjm-steps__indicator", children: renderMark?.(step.status, step.position) ?? (step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position) }), index === steps.length - 1 ? null : _jsx("span", { className: "hjm-steps__connector" })] }), _jsxs("div", { className: "hjm-steps__copy", children: [_jsx("span", { className: "hjm-steps__label", children: step.label }), step.description === undefined ? null : (_jsx("span", { className: "hjm-steps__description", children: step.description })), _jsx("span", { className: "hjm-visually-hidden", children: step.statusLabel })] })] }, step.id))) }));
});
//# sourceMappingURL=steps.js.map