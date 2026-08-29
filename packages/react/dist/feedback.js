import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { emptyStateRecipe, noticeRecipe, progressRecipe, skeletonRecipe, spinnerRecipe, } from "@hjmds/design-contracts/recipes";
import { resolveResultDescriptor, } from "@hjmds/design-contracts/components/result";
import { forwardRef, } from "react";
import { classNames } from "./internal.js";
import { Button } from "./actions.js";
export const Notice = forwardRef(function Notice({ title, description, action, icon, tone = noticeRecipe.defaults.tone, className, ...props }, ref) {
    const urgent = tone === "danger";
    return (_jsxs("section", { ...props, ref: ref, className: classNames("hjm-notice", className), "data-tone": tone, role: urgent ? "alert" : "status", "aria-live": urgent ? "assertive" : "polite", children: [icon ? _jsx("div", { className: "hjm-notice__icon", "aria-hidden": "true", children: icon }) : null, _jsxs("div", { className: "hjm-notice__content", children: [_jsx("strong", { className: "hjm-notice__title", children: title }), description ? _jsx("div", { className: "hjm-notice__description", children: description }) : null] }), action ? _jsx("div", { className: "hjm-notice__action", children: action }) : null] }));
});
export const EmptyState = forwardRef(function EmptyState({ title, description, action, icon, density = emptyStateRecipe.defaults.density, className, ...props }, ref) {
    return (_jsxs("div", { ...props, ref: ref, className: classNames("hjm-empty-state", className), "data-density": density, role: "status", children: [icon ? _jsx("div", { className: "hjm-empty-state__icon", "aria-hidden": "true", children: icon }) : null, _jsx("strong", { className: "hjm-empty-state__title", children: title }), description ? _jsx("div", { className: "hjm-empty-state__description", children: description }) : null, action ? _jsx("div", { className: "hjm-empty-state__action", children: action }) : null] }));
});
/** A terminal flow outcome. EmptyState remains reserved for fillable content. */
export const Result = forwardRef(function Result({ status, title, description, actions, headingLevel = 2, icon, className, role, ...props }, ref) {
    const result = resolveResultDescriptor({
        status,
        title,
        ...(description === undefined ? {} : { description }),
        ...(actions === undefined ? {} : { actions }),
    });
    const Heading = headingLevel === 1 ? "h1" : "h2";
    return (_jsxs("div", { ...props, ref: ref, className: classNames("hjm-result", className), "data-status": result.status, role: role ?? (result.status === "failure" ? "alert" : "status"), children: [_jsx("span", { className: "hjm-result__icon", "aria-hidden": "true", children: icon }), _jsx(Heading, { className: "hjm-result__title", children: result.title }), result.description ? (_jsx("p", { className: "hjm-result__description", children: result.description })) : null, result.primaryAction || result.secondaryAction ? (_jsxs("div", { className: "hjm-result__actions", children: [result.primaryAction ? (_jsx(Button, { "aria-label": result.primaryAction.accessibilityLabel, onClick: result.primaryAction.onAction, children: result.primaryAction.label })) : null, result.secondaryAction ? (_jsx(Button, { "aria-label": result.secondaryAction.accessibilityLabel, onClick: result.secondaryAction.onAction, tone: "secondary", children: result.secondaryAction.label })) : null] })) : null] }));
});
export const Progress = forwardRef(function Progress({ label, value, valueText, max = 100, size = progressRecipe.defaults.size, tone = progressRecipe.defaults.tone, className, ...props }, ref) {
    if (typeof max !== "number" || !Number.isFinite(max) || max <= 0) {
        throw new RangeError("Progress max must be a positive finite number");
    }
    if (value !== undefined &&
        (!Number.isFinite(value) || value < 0 || value > max)) {
        throw new RangeError("Progress value must be between zero and max");
    }
    return (_jsxs("div", { className: classNames("hjm-progress", className), "data-size": size, "data-tone": tone, "data-state": value === undefined ? "indeterminate" : "determinate", children: [_jsxs("span", { className: "hjm-progress__copy", children: [_jsx("span", { children: label }), valueText ? _jsx("span", { children: valueText }) : null] }), _jsx("progress", { ...props, ref: ref, className: "hjm-progress__native", max: max, ...(value === undefined ? {} : { value }), "aria-valuetext": typeof valueText === "string" ? valueText : undefined })] }));
});
export const Spinner = forwardRef(function Spinner({ label, size = spinnerRecipe.defaults.size, tone = spinnerRecipe.defaults.tone, className, ...props }, ref) {
    return (_jsxs("span", { ...props, ref: ref, className: classNames("hjm-spinner", className), "data-size": size, "data-tone": tone, role: "status", "aria-live": "polite", children: [_jsx("span", { className: "hjm-spinner__glyph", "aria-hidden": "true" }), _jsx("span", { className: "hjm-visually-hidden", children: label })] }));
});
export const Skeleton = forwardRef(function Skeleton({ shape = skeletonRecipe.defaults.shape, animated = skeletonRecipe.defaults.animated, width, height, className, style, ...props }, ref) {
    return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-skeleton", className), "data-shape": shape, "data-animated": animated, "aria-hidden": "true", style: { width, height, ...style } }));
});
//# sourceMappingURL=feedback.js.map