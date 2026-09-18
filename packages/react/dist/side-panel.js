import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { canDismissSidePanel, sidePanelBehaviorDefaults, sidePanelRecipe, } from "@hjmds/design-contracts/components/side-panel";
import { forwardRef, useEffect, useId, useRef, } from "react";
import { classNames, composeRefs } from "./internal.js";
import { getModalLayer, HjmPortal, renderTrigger, useModalFocus, useOpenState, } from "./modal.js";
export const SidePanel = forwardRef(function SidePanel({ trigger, title, description, children, footer, edge = sidePanelRecipe.defaults.edge, size = sidePanelRecipe.defaults.size, busy = false, dismissPolicy = sidePanelBehaviorDefaults, closeLabel, initialFocusRef, returnFocusRef, onDismissComplete, modalPriority = 0, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, forwardedRef) {
    const policy = dismissPolicy;
    const modal = policy.modal;
    const [open, changeOpen] = useOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const id = useId().replaceAll(":", "");
    const contentId = `${id}-side-panel`;
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const dismissReasonRef = useRef(undefined);
    const wasOpenRef = useRef(open);
    const dismissCompleteRef = useRef(onDismissComplete);
    dismissCompleteRef.current = onDismissComplete;
    const requestClose = (reason) => {
        if (!canDismissSidePanel(reason, busy, policy))
            return;
        dismissReasonRef.current = reason;
        changeOpen(false, { reason });
    };
    useEffect(() => {
        if (open) {
            wasOpenRef.current = true;
            dismissReasonRef.current = undefined;
            return;
        }
        if (!wasOpenRef.current)
            return;
        /*
          No `createSheetLifecycle` counterpart, per docs/side-panel.md: that counter
          exists for Android's persistently mounted native Modal. Here the panel is
          unmounted with the render that closed it, so "removed" is already true when
          this effect runs — including under reduced motion, where there is no exit
          transition to wait for. An owner that closed the panel without a user
          gesture is reported as `programmatic`.
        */
        wasOpenRef.current = false;
        const reason = dismissReasonRef.current ?? "programmatic";
        dismissReasonRef.current = undefined;
        dismissCompleteRef.current?.({ reason });
    }, [open]);
    useModalFocus({
        // Only modal panels trap focus and lock scroll. A non-modal panel leaves the
        // rest of the page live and tabbable, so it must not enter the modal stack.
        active: open && modal,
        priority: modalPriority,
        contentRef,
        ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
        ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => requestClose("escape"),
    });
    const escapeRef = useRef(() => requestClose("escape"));
    escapeRef.current = () => requestClose("escape");
    useEffect(() => {
        if (!open || modal)
            return;
        // Escape dismisses non-modal panels too, but only while focus is inside them
        // — the live page behind keeps its own Escape handling.
        const onKeyDown = (event) => {
            if (event.key !== "Escape" || event.defaultPrevented)
                return;
            // Read the ref per event: the portal mounts one commit after this effect,
            // so a value captured here would still be null for the panel's first keys.
            if (!(event.target instanceof Node) || contentRef.current?.contains(event.target) !== true)
                return;
            event.preventDefault();
            escapeRef.current();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, modal]);
    const style = {
        zIndex: getModalLayer(modalPriority),
        "--hjm-side-panel-size": `${sidePanelRecipe.sizes[size]}px`,
    };
    const panel = (_jsxs("div", { ref: composeRefs(contentRef, forwardedRef), id: contentId, 
        // A modal panel is a dialog; a non-modal one stays a complementary landmark
        // so assistive technology can move past it like any other page region.
        role: modal ? "dialog" : "complementary", "aria-modal": modal || undefined, "aria-labelledby": titleId, "aria-describedby": description ? descriptionId : undefined, "aria-busy": busy || undefined, tabIndex: -1, className: classNames("hjm-side-panel", className), "data-hjm-modal-content": modal ? "" : undefined, "data-edge": edge, "data-size": size, "data-modal": modal, "data-state": busy ? "busy" : "idle", style: modal ? undefined : style, children: [_jsxs("header", { className: "hjm-side-panel__header", children: [_jsxs("div", { children: [_jsx("h2", { id: titleId, className: "hjm-side-panel__title", children: title }), description ? _jsx("p", { id: descriptionId, className: "hjm-side-panel__description", children: description }) : null] }), policy.dismissible ? (_jsx("button", { type: "button", className: "hjm-dialog__close", "aria-label": closeLabel, disabled: busy && !policy.dismissWhileBusy, onClick: () => requestClose("close-action"), children: "\u00D7" })) : null] }), children ? _jsx("div", { className: "hjm-side-panel__body", children: children }) : null, footer ? _jsx("footer", { className: "hjm-side-panel__footer", children: footer }) : null] }));
    return (_jsxs(_Fragment, { children: [trigger === undefined ? null : renderTrigger(trigger, triggerRef, open, contentId, "dialog", () => changeOpen(true, { reason: "trigger" })), open ? (_jsx(HjmPortal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: modal ? (_jsx("div", { className: "hjm-overlay hjm-side-panel-positioner", "data-kind": "side-panel", "data-modal-priority": modalPriority, "data-edge": edge, "data-state": "open", style: style, onMouseDown: (event) => {
                        if (event.target === event.currentTarget)
                            requestClose("outside");
                    }, children: panel })) : panel })) : null] }));
});
//# sourceMappingURL=side-panel.js.map