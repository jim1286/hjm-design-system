import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { emptyStateRecipe, noticeRecipe, progressRecipe, resolveProgressSegments, skeletonRecipe, } from "@hjmds/design-contracts/recipes";
import { resolveResultDescriptor, resultRecipe, } from "@hjmds/design-contracts/components/result";
import { forwardRef, useId, } from "react";
import { buttonRecipe } from "@hjmds/design-contracts/recipes/base";
import { classNames } from "./internal.js";
import { Button } from "./actions.js";
import { Text } from "./layout.js";
export const Notice = forwardRef(function Notice({ title, description, action, icon, tone = noticeRecipe.defaults.tone, className, layoutStyle, ...props }, ref) {
    const urgent = tone === "danger";
    return (_jsxs("section", { ...props, style: { ...props.style, ...layoutStyle }, ref: ref, className: classNames("hjm-notice", className), "data-tone": tone, role: urgent ? "alert" : "status", "aria-live": props["aria-live"] ?? (urgent ? "assertive" : "polite"), children: [icon ? _jsx("div", { className: "hjm-notice__icon", "aria-hidden": "true", children: icon }) : null, _jsxs("div", { className: "hjm-notice__content", children: [_jsx("strong", { className: "hjm-notice__title", children: title }), description ? _jsx("div", { className: "hjm-notice__description", children: description }) : null] }), action ? _jsx("div", { className: "hjm-notice__action", children: action }) : null] }));
});
export const EmptyState = forwardRef(function EmptyState({ title, description, action, icon, density = emptyStateRecipe.defaults.density, className, layoutStyle, ...props }, ref) {
    return (_jsxs("div", { ...props, style: { ...props.style, ...layoutStyle }, ref: ref, className: classNames("hjm-empty-state", className), "data-density": density, role: "status", children: [icon ? _jsx("div", { className: "hjm-empty-state__icon", "aria-hidden": "true", children: icon }) : null, _jsx("strong", { className: "hjm-empty-state__title", children: title }), description ? _jsx("div", { className: "hjm-empty-state__description", children: description }) : null, action ? _jsx("div", { className: "hjm-empty-state__action", children: action }) : null] }));
});
/** A terminal flow outcome. EmptyState remains reserved for fillable content. */
export const Result = forwardRef(function Result({ status, title, description, actions, headingLevel = 2, icon, className, role, layoutStyle, ...props }, ref) {
    const result = resolveResultDescriptor({
        status,
        title,
        ...(description === undefined ? {} : { description }),
        ...(actions === undefined ? {} : { actions }),
    });
    const Heading = headingLevel === 1 ? "h1" : "h2";
    return (_jsxs("div", { ...props, style: { ...props.style, ...layoutStyle }, ref: ref, className: classNames("hjm-result", className), "data-status": result.status, role: role ?? (result.status === "failure" ? "alert" : "status"), children: [_jsx("span", { className: "hjm-result__icon", "aria-hidden": "true", children: icon ?? resultRecipe.glyphs[result.status] }), _jsx(Heading, { className: "hjm-result__title", children: result.title }), result.description ? (_jsx("p", { className: "hjm-result__description", children: result.description })) : null, result.primaryAction || result.secondaryAction ? (_jsxs("div", { className: "hjm-result__actions", children: [result.secondaryAction ? (_jsx(Button, { "aria-label": result.secondaryAction.accessibilityLabel, onClick: result.secondaryAction.onAction, tone: "secondary", children: result.secondaryAction.label })) : null, result.primaryAction ? (_jsx(Button, { "aria-label": result.primaryAction.accessibilityLabel, onClick: result.primaryAction.onAction, children: result.primaryAction.label })) : null] })) : null] }));
});
export const Progress = forwardRef(function Progress({ label, value, valueText, segments, showValue = progressRecipe.defaults.showValue, max = progressRecipe.defaults.max, size = progressRecipe.defaults.size, tone = progressRecipe.defaults.tone, shape = progressRecipe.defaults.shape, children, className, layoutStyle, ...props }, ref) {
    if (typeof max !== "number" || !Number.isFinite(max) || max <= 0) {
        throw new RangeError("Progress max must be a positive finite number");
    }
    if (value !== undefined &&
        (!Number.isFinite(value) || value < 0 || value > max)) {
        throw new RangeError("Progress value must be between zero and max");
    }
    const segmentFills = resolveProgressSegments(value, max, segments, shape);
    const labelId = useId();
    // usage/components/progress.md: valueText defaults to the percentage. Only Native applied it, so the same
    // StepPlayer/ScrollProgress inputs showed "0%" on Native and nothing on Web (2026-10-17 review F N4).
    const resolvedValueText = valueText ?? (value === undefined ? undefined : `${Math.round((value / max) * 100)}%`);
    const diameter = progressRecipe.circular.sizes[size];
    const strokeWidth = progressRecipe.circular.strokeWidth[size];
    return (_jsxs("div", { className: classNames("hjm-progress", className), "data-size": size, "data-tone": tone, "data-shape": shape, "data-segmented": segmentFills ? "true" : undefined, "data-state": value === undefined ? "indeterminate" : "determinate", 
        // `layoutStyle` lands on this frame, not on the native <progress> that
        // receives the rest props, so placement moves the label and bar together.
        style: shape === "circular" ? {
            ...layoutStyle,
            "--hjm-progress-diameter": `${diameter}px`,
            "--hjm-progress-stroke": `${strokeWidth}px`,
            // Conic sweep instead of an SVG arc: the same token drives both
            // shapes and no second color pipeline appears.
            "--hjm-progress-sweep": value === undefined ? "25%" : `${(value / max) * 100}%`,
        } : layoutStyle, children: [label === undefined ? null : (_jsxs("span", { className: "hjm-progress__copy", children: [_jsx(Text, { id: labelId, variant: "label", children: label }), showValue && resolvedValueText ? _jsx(Text, { variant: "caption", tone: "muted", children: resolvedValueText }) : null] })), shape === "circular" ? (_jsx("span", { className: "hjm-progress__ring", "aria-hidden": "true", children: children ? _jsx("span", { className: "hjm-progress__ring-content", children: children }) : null })) : null, segmentFills ? _jsx("span", { className: "hjm-progress__segments", "aria-hidden": "true", style: { gap: progressRecipe.segmented.gap, height: progressRecipe.sizes[size] }, children: segmentFills.map((fill, index) => _jsx("span", { children: _jsx("i", { style: { width: `${fill * 100}%` } }) }, index)) }) : null, _jsx("progress", { ...props, ref: ref, className: "hjm-progress__native", max: max, ...(value === undefined ? {} : { value }), "aria-labelledby": props["aria-labelledby"] ?? (props["aria-label"] === undefined ? labelId : undefined), "aria-valuetext": resolvedValueText })] }));
});
export { Spinner } from "./internal/spinner.js";
export const Skeleton = forwardRef(function Skeleton({ shape = skeletonRecipe.defaults.shape, animated = skeletonRecipe.defaults.animated, lines = skeletonRecipe.defaults.lines, buttonShape = buttonRecipe.defaults.shape, width, height, className, style, layoutStyle, ...props }, ref) {
    const lineCount = shape === "text" ? Math.max(1, Math.floor(lines)) : 1;
    if (lineCount > 1) {
        // One pulse on the group keeps the lines in phase; the bars themselves do not animate.
        return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-skeleton-lines", className), "data-animated": animated, "aria-hidden": "true", style: { width, ...style, ...layoutStyle }, children: Array.from({ length: lineCount }, (_, index) => (_jsx("span", { className: "hjm-skeleton", "data-shape": "text", "data-last": index === lineCount - 1 || undefined, style: { height } }, index))) }));
    }
    return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-skeleton", className), "data-shape": shape, "data-button-shape": shape === "button" ? buttonShape : undefined, "data-animated": animated, "aria-hidden": "true", style: { width, height, ...style, ...layoutStyle } }));
});
// ActivityChip is a feedback-category status trigger (its panel is the Toast in this module). Also exported here so
// apps can import it from an existing subpath: Next dev with HJM_LOCAL_SOURCE rejected the new ./activity-chip
// subpath before aliasing because the installed release lacks it (BurnTok 2026-10-10).
export { ActivityChip } from "./activity-chip.js";
export { PendingContent } from "./internal/pending-content.js";
//# sourceMappingURL=feedback.js.map