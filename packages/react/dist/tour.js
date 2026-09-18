import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveTourAdvance, resolveTourDescriptor, tourRecipe, validateTourOpenState, } from "@hjmds/design-contracts/components/tour";
import { forwardRef, useCallback, useEffect, useId, useRef, useState, } from "react";
import { Button } from "./actions.js";
import { classNames, composeRefs } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup } from "./portal.js";
import { getModalLayer, HjmPortal, renderTrigger, useModalFocus } from "./modal.js";
/*
  The contract hands renderers an opaque `anchorId`, never a node, so the
  product owns what each step points at. This component therefore keeps its own
  element box: it re-reads the anchor on every step and on layout changes rather
  than storing a rect the product could invalidate by re-rendering the page.
*/
function useAnchorRect(anchor, active) {
    const [rect, setRect] = useState(null);
    useEffect(() => {
        if (!active || !anchor) {
            setRect(null);
            return;
        }
        const measure = () => setRect(anchor.getBoundingClientRect());
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(anchor);
        window.addEventListener("scroll", measure, true);
        window.addEventListener("resize", measure);
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", measure, true);
            window.removeEventListener("resize", measure);
        };
    }, [anchor, active]);
    return rect;
}
export const Tour = forwardRef(function Tour({ descriptor, resolveAnchor, composeAnnouncement, onStepChange, open: openProp, defaultOpen, onOpenChange, trigger, portalContainer, className, }, forwardedRef) {
    validateTourOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const open = openProp ?? internalOpen;
    const resolved = resolveTourDescriptor(descriptor, { composeAnnouncement });
    const step = resolved.currentStep;
    const cardRef = useRef(null);
    const triggerRef = useRef(null);
    const anchorRef = useRef(null);
    const [card, setCard] = useState(null);
    const id = `${useId().replaceAll(":", "")}-tour`;
    const anchor = open ? resolveAnchor(step.anchorId) : null;
    anchorRef.current = anchor;
    const anchorRect = useAnchorRect(anchor, open);
    const change = useCallback((next, reason) => {
        if (openProp === undefined)
            setInternalOpen(next);
        onOpenChange?.(next, { reason });
    }, [openProp, onOpenChange]);
    const close = (reason) => change(false, reason);
    const advance = (reason) => {
        const outcome = resolveTourAdvance(descriptor, reason);
        // `no-op` is Previous on the first step: the contract makes that a decision,
        // not a disabled button, so the control stays focusable and simply does nothing.
        if (outcome.type === "step")
            onStepChange(outcome.stepId, reason);
        else if (outcome.type === "close")
            close(outcome.reason);
    };
    const openRef = useRef(open);
    openRef.current = open;
    const settleRef = useRef(close);
    settleRef.current = close;
    const epochRef = useRef(0);
    useEffect(() => {
        const epoch = epochRef.current + 1;
        epochRef.current = epoch;
        return () => {
            queueMicrotask(() => {
                // StrictMode re-runs setup right after its probe cleanup; only a real
                // unmount has no later epoch. An open tour torn down that way was
                // interrupted — the user never skipped, escaped, or completed it.
                if (epochRef.current !== epoch || !openRef.current)
                    return;
                settleRef.current("interrupted");
            });
        };
    }, []);
    useModalFocus({
        active: open,
        contentRef: cardRef,
        // The card itself, not its first button: it carries the step announcement,
        // which is the whole substitute for a sighted user's visual pointer.
        initialFocusRef: cardRef,
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => close("escape"),
    });
    useEffect(() => {
        // Focus follows the card on every step change, never the anchor: the anchor
        // is inert background while the tour runs.
        if (open)
            cardRef.current?.focus({ preventScroll: true });
    }, [open, step.id]);
    const position = useAnchoredPopup(anchorRef, open ? card : null, {
        ...(step.placement === undefined ? {} : { placement: step.placement }),
        ...(step.align === undefined ? {} : { align: step.align }),
        gap: tourRecipe.sideOffset,
        zIndex: getModalLayer(0) + 1,
        fallbackAxis: true,
    });
    const cardRefs = useCallback(composeRefs(setCard, cardRef, forwardedRef), [forwardedRef]);
    const renderedTrigger = trigger === undefined
        ? null
        : renderTrigger(trigger, triggerRef, open, id, "dialog", () => change(true, "trigger"));
    if (!open)
        return renderedTrigger;
    return (_jsxs(_Fragment, { children: [renderedTrigger, _jsx(HjmPortal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-tour-backdrop", "data-state": "open", style: { zIndex: getModalLayer(0) }, children: anchorRect ? (_jsx("div", { className: "hjm-tour-highlight", "aria-hidden": "true", style: {
                            insetBlockStart: anchorRect.top,
                            insetInlineStart: anchorRect.left,
                            inlineSize: anchorRect.width,
                            blockSize: anchorRect.height,
                        } })) : null }) }), _jsx(AnchoredPortal, { anchorRef: anchorRef, ...(portalContainer ? { container: portalContainer } : {}), children: _jsxs("div", { ref: cardRefs, id: id, role: "dialog", "aria-modal": "true", "aria-label": resolved.accessibilityLabel, "aria-describedby": `${id}-announcement`, tabIndex: -1, "data-hjm-modal-content": "", "data-placement": position.placement, "data-align": position.align, className: classNames("hjm-tour", className), style: { ...position.style, maxInlineSize: tourRecipe.maxWidth }, children: [_jsx("span", { id: `${id}-announcement`, className: "hjm-visually-hidden", children: step.announcement }), _jsxs("div", { "aria-hidden": "true", children: [_jsxs("p", { className: "hjm-tour__counter", children: [step.position, " / ", step.total] }), _jsx("h2", { className: "hjm-tour__title", children: step.title }), _jsx("p", { className: "hjm-tour__description", children: step.description })] }), _jsxs("div", { className: "hjm-tour__actions", children: [_jsx(Button, { tone: "ghost", onClick: () => close("skip"), children: descriptor.labels.skip }), _jsx(Button, { tone: "secondary", disabled: resolved.isFirstStep, onClick: () => advance("previous"), children: descriptor.labels.previous }), _jsx(Button, { onClick: () => advance("next"), children: resolved.isLastStep ? descriptor.labels.done : descriptor.labels.next })] })] }) })] }));
});
//# sourceMappingURL=tour.js.map