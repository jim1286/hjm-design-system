"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveStepsDescriptor, stepsDefaults, stepsRecipe, validateStepsPresentation, } from "@hjmds/design-contracts/components/steps";
import { forwardRef, useId, useState } from "react";
import { classNames } from "./internal.js";
/** Presentation never changes the shared single-cursor state or validation/navigation policy. */
export const Steps = forwardRef(function Steps({ descriptor, statusLabels, composeAccessibleName, presentation = stepsDefaults.presentation, overviewLabel, renderStepContent, renderMark, onStepPress, className, layoutStyle, ...props }, ref) {
    const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
    validateStepsPresentation(presentation, overviewLabel);
    if (renderStepContent && presentation !== "vertical")
        throw new TypeError("Steps renderStepContent requires vertical presentation");
    const statusId = useId();
    const [expanded, setExpanded] = useState(false);
    const compact = presentation === "compact";
    const vertical = presentation === "vertical" || (compact && expanded);
    const current = steps.find(step => step.id === descriptor.currentStepId);
    const markerSize = renderMark ? stepsRecipe.indicator.customSize : stepsRecipe.indicator.size;
    const list = _jsx("ol", { ...props, ref: ref, id: props.id ?? `${statusId}-list`, "data-presentation": presentation, "data-expanded": compact ? expanded : undefined, "data-custom-mark": renderMark ? true : undefined, style: { ["--hjm-steps-inset"]: `${stepsRecipe.paddingInline}px`, ["--hjm-steps-indicator-size"]: `${markerSize}px`,
            ["--hjm-steps-count"]: steps.length, ["--hjm-steps-connector-count"]: steps.length - 1,
            ["--hjm-steps-press-target"]: `${stepsRecipe.press.minTouchTarget}px`,
            ["--hjm-steps-duration"]: `${stepsRecipe.transitionDuration}ms`,
            ["--hjm-steps-segment-height"]: `${stepsRecipe.segmentHeight}px`, ...props.style, ...(!compact ? layoutStyle : {}) }, className: classNames("hjm-steps", className), children: steps.map((step, index) => {
            const cursor = step.id === descriptor.currentStepId;
            const isCurrent = step.status === "current" || step.status === "error";
            const pressable = (!compact || expanded) && (descriptor.navigationMode === "free" || step.revisitable) && onStepPress;
            const content = _jsxs(_Fragment, { children: [_jsxs("div", { className: "hjm-steps__rail", "aria-hidden": "true", children: [!vertical && index === steps.length - 1 ? _jsx("span", { className: "hjm-steps__connector", "data-reached": steps[index - 1]?.status === "complete" || undefined }) : null, _jsx("span", { className: "hjm-steps__indicator", children: renderMark?.(step.status, step.position) ?? (step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position) }), vertical || index === steps.length - 1 ? null : _jsx("span", { className: "hjm-steps__connector" })] }), _jsxs("div", { className: "hjm-steps__copy", children: [_jsx("span", { className: "hjm-steps__label", children: step.label }), step.description !== undefined && (!vertical || cursor) ? _jsx("span", { className: "hjm-steps__description", children: step.description }) : null, vertical ? _jsx("span", { className: "hjm-steps__status", "aria-hidden": "true", children: step.statusLabel }) : null, _jsx("span", { className: "hjm-visually-hidden", id: `${statusId}-${index}`, children: step.statusLabel })] })] });
            return _jsxs("li", { className: "hjm-steps__step", "data-status": step.status, children: [pressable ? _jsx("button", { type: "button", className: "hjm-steps__press", "aria-label": step.accessibleName, "aria-describedby": `${statusId}-${index}`, "aria-current": isCurrent ? "step" : undefined, onClick: () => onStepPress(step.id), children: content })
                        : _jsx("div", { className: "hjm-steps__item", "aria-label": step.accessibleName, "aria-describedby": `${statusId}-${index}`, "aria-current": isCurrent ? "step" : undefined, children: content }), presentation === "vertical" && cursor && renderStepContent ? _jsx("div", { className: "hjm-steps__body", children: renderStepContent(step.id) }) : null] }, step.id);
        }) });
    return compact ? _jsxs("div", { className: "hjm-steps-compact", style: layoutStyle, children: [_jsxs("div", { className: "hjm-steps-compact__header", children: [_jsxs("span", { "aria-hidden": "true", children: [current.position, " / ", current.total, " \u00B7 ", current.label, _jsxs("span", { className: "hjm-steps__status", children: [" \u00B7 ", current.statusLabel] })] }), _jsxs("button", { type: "button", className: "hjm-steps-compact__toggle", "aria-expanded": expanded, "aria-controls": props.id ?? `${statusId}-list`, onClick: () => setExpanded(value => !value), children: [overviewLabel, _jsx("span", { "aria-hidden": "true", children: expanded ? "⌃" : "⌄" })] })] }), list] }) : list;
});
//# sourceMappingURL=steps.js.map