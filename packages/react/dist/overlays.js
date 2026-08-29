import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createAlertDialogSession, getAlertDialogInitialFocus, validateAlertDialogRequest, } from "@hjmds/design-contracts/components/alert-dialog";
import { createSheetLifecycle, sheetBehaviorDefaults, } from "@hjmds/design-contracts/components/sheet";
import { resolveTooltipDescriptor, tooltipBehaviorDefaults, } from "@hjmds/design-contracts/components/tooltip";
import { dialogRecipe, menuRecipe, sheetRecipe, } from "@hjmds/design-contracts/recipes";
import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, } from "react";
import { createPortal } from "react-dom";
import { Button } from "./actions.js";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup, } from "./portal.js";
import { useOptionalHjmTheme, useTooltipCoordinator } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";
function HjmPortal({ children, container }) {
    const [mounted, setMounted] = useState(false);
    const theme = useOptionalHjmTheme();
    useEffect(() => setMounted(true), []);
    if (!mounted)
        return null;
    return createPortal(theme ? (_jsx("div", { className: "hjm-root hjm-portal", "data-hjm-portal": "", "data-motion": theme.environment.reducedMotion ? "reduced" : "full", "data-theme": theme.environment.theme, "data-text-scale": theme.environment.textScale, dir: theme.environment.direction, style: createHjmThemeStyle(theme), children: children })) : children, container ?? document.body);
}
function useOpenState({ open, defaultOpen = false, onOpenChange, }) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const controlled = open !== undefined;
    const currentOpen = controlled ? open : internalOpen;
    const pendingRequestRef = useRef(undefined);
    useEffect(() => {
        if (pendingRequestRef.current === currentOpen) {
            pendingRequestRef.current = undefined;
        }
    }, [currentOpen]);
    const changeOpen = useCallback((nextOpen, detail) => {
        if (nextOpen === currentOpen ||
            pendingRequestRef.current === nextOpen)
            return;
        pendingRequestRef.current = nextOpen;
        if (!controlled)
            setInternalOpen(nextOpen);
        onOpenChange?.(nextOpen, detail);
        if (controlled && nextOpen) {
            queueMicrotask(() => {
                if (pendingRequestRef.current === true) {
                    pendingRequestRef.current = undefined;
                }
            });
        }
    }, [controlled, currentOpen, onOpenChange]);
    return [currentOpen, changeOpen];
}
const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");
function getFocusable(container) {
    return [...container.querySelectorAll(focusableSelector)].filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
}
let bodyLockCount = 0;
let previousBodyOverflow = "";
const activeModalStack = [];
let activeModalOrder = 0;
const isolatedModalBackground = new Map();
let modalIsolationObserver = null;
function getOwnedPopupHosts(modal) {
    const ownerId = modal.element.id;
    if (ownerId.length === 0)
        return [];
    return [...document.querySelectorAll("[data-hjm-popup-owner]")]
        .filter((host) => host.getAttribute("data-hjm-popup-owner") === ownerId);
}
function modalContainsNode(modal, node) {
    return modal.element.contains(node) ||
        getOwnedPopupHosts(modal).some((host) => host.contains(node));
}
function getModalFocusable(modal) {
    return [
        ...getFocusable(modal.element),
        ...getOwnedPopupHosts(modal).flatMap((host) => getFocusable(host)),
    ];
}
function getModalLayer(priority) {
    if (!Number.isSafeInteger(priority)) {
        throw new TypeError("modalPriority must be a safe integer");
    }
    return 1000 + priority;
}
function getTopModal() {
    let top;
    for (const modal of activeModalStack) {
        if (!modal.element.isConnected)
            continue;
        if (top === undefined ||
            modal.priority > top.priority ||
            (modal.priority === top.priority && modal.order > top.order))
            top = modal;
    }
    return top;
}
function modalRanksAbove(candidate, reference) {
    return candidate.priority > reference.priority ||
        (candidate.priority === reference.priority && candidate.order > reference.order);
}
function restoreModalBackground() {
    for (const [element, previous] of isolatedModalBackground) {
        element.inert = previous.inert;
        if (previous.ariaHidden === null)
            element.removeAttribute("aria-hidden");
        else
            element.setAttribute("aria-hidden", previous.ariaHidden);
    }
    isolatedModalBackground.clear();
}
function isolateModalBackgroundElement(element) {
    if (isolatedModalBackground.has(element))
        return;
    isolatedModalBackground.set(element, {
        ariaHidden: element.getAttribute("aria-hidden"),
        inert: element.inert,
    });
    element.inert = true;
    element.setAttribute("aria-hidden", "true");
}
/** Keeps only the top modal's ancestor path interactive, including late portals. */
function synchronizeModalBackgroundIsolation() {
    restoreModalBackground();
    for (let index = activeModalStack.length - 1; index >= 0; index -= 1) {
        if (!activeModalStack[index]?.element.isConnected)
            activeModalStack.splice(index, 1);
    }
    const top = getTopModal();
    if (!top) {
        modalIsolationObserver?.disconnect();
        modalIsolationObserver = null;
        return;
    }
    const interactivePath = new Set();
    for (const root of [top.element, ...getOwnedPopupHosts(top)]) {
        let pathNode = root;
        while (pathNode) {
            if (pathNode === document.body)
                break;
            interactivePath.add(pathNode);
            pathNode = pathNode.parentElement;
        }
    }
    const inspectedParents = new Set();
    for (const pathNode of interactivePath) {
        const parent = pathNode.parentElement;
        if (!parent || inspectedParents.has(parent))
            continue;
        inspectedParents.add(parent);
        for (const sibling of parent.children) {
            if (sibling instanceof HTMLElement && !interactivePath.has(sibling)) {
                isolateModalBackgroundElement(sibling);
            }
        }
    }
    if (modalIsolationObserver === null) {
        modalIsolationObserver = new MutationObserver(() => {
            synchronizeModalBackgroundIsolation();
        });
        modalIsolationObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ["data-hjm-popup-owner"],
            childList: true,
            subtree: true,
        });
    }
}
function lockBodyScroll() {
    if (bodyLockCount === 0) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }
    bodyLockCount += 1;
    return () => {
        bodyLockCount = Math.max(0, bodyLockCount - 1);
        if (bodyLockCount === 0)
            document.body.style.overflow = previousBodyOverflow;
    };
}
function useModalFocus({ active, priority = 0, contentRef, initialFocusRef, returnFocusRef, fallbackReturnRef, onEscape, }) {
    const escapeRef = useRef(onEscape);
    escapeRef.current = onEscape;
    useEffect(() => {
        if (!active)
            return;
        let retryTimer;
        let release;
        let cancelled = false;
        const activate = () => {
            const content = contentRef.current;
            if (!content) {
                retryTimer = setTimeout(activate, 0);
                return;
            }
            const previouslyFocused = document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            const releaseScroll = lockBodyScroll();
            const modal = {
                element: content,
                order: activeModalOrder += 1,
                priority,
            };
            activeModalStack.push(modal);
            synchronizeModalBackgroundIsolation();
            const initial = initialFocusRef?.current ?? getFocusable(content)[0] ?? content;
            if (getTopModal() === modal)
                initial.focus();
            const handleKeyDown = (event) => {
                if (getTopModal() !== modal)
                    return;
                if (event.key === "Escape") {
                    event.preventDefault();
                    escapeRef.current();
                    return;
                }
                if (event.key !== "Tab")
                    return;
                const focusable = getModalFocusable(modal);
                if (focusable.length === 0) {
                    event.preventDefault();
                    content.focus();
                    return;
                }
                const first = focusable[0];
                const last = focusable.at(-1);
                const current = document.activeElement;
                if (event.shiftKey && (current === first || !(current instanceof Node) || !modalContainsNode(modal, current))) {
                    event.preventDefault();
                    last.focus();
                }
                else if (!event.shiftKey && (current === last || !(current instanceof Node) || !modalContainsNode(modal, current))) {
                    event.preventDefault();
                    first.focus();
                }
            };
            const handleFocusIn = (event) => {
                if (getTopModal() !== modal)
                    return;
                if (event.target instanceof Node && !modalContainsNode(modal, event.target)) {
                    (initialFocusRef?.current ?? getFocusable(content)[0] ?? content).focus();
                }
            };
            document.addEventListener("keydown", handleKeyDown, true);
            document.addEventListener("focusin", handleFocusIn, true);
            release = () => {
                const wasTop = !activeModalStack.some((candidate) => candidate !== modal && candidate.element.isConnected && modalRanksAbove(candidate, modal));
                document.removeEventListener("keydown", handleKeyDown, true);
                document.removeEventListener("focusin", handleFocusIn, true);
                const stackIndex = activeModalStack.lastIndexOf(modal);
                if (stackIndex >= 0)
                    activeModalStack.splice(stackIndex, 1);
                synchronizeModalBackgroundIsolation();
                releaseScroll();
                const returnTarget = returnFocusRef?.current ?? fallbackReturnRef?.current ?? previouslyFocused;
                if (wasTop) {
                    queueMicrotask(() => {
                        const nextTop = getTopModal();
                        if (!nextTop) {
                            returnTarget?.focus();
                            return;
                        }
                        if (returnTarget && modalContainsNode(nextTop, returnTarget))
                            returnTarget.focus();
                        else
                            (getModalFocusable(nextTop)[0] ?? nextTop.element).focus();
                    });
                }
            };
            if (cancelled)
                release();
        };
        activate();
        return () => {
            cancelled = true;
            if (retryTimer !== undefined)
                clearTimeout(retryTimer);
            release?.();
        };
    }, [active, contentRef, fallbackReturnRef, initialFocusRef, priority, returnFocusRef]);
}
function renderTrigger(trigger, triggerRef, open, contentId, popup, onOpen) {
    const props = trigger.props;
    return cloneElement(trigger, {
        ref: composeRefs(props.ref, triggerRef),
        "aria-controls": contentId,
        "aria-expanded": open,
        "aria-haspopup": popup,
        onClick: (event) => {
            props.onClick?.(event);
            if (!event.defaultPrevented && !props.disabled)
                onOpen();
        },
    });
}
export const Dialog = forwardRef(function Dialog({ trigger, title, description, children, footer, size = dialogRecipe.defaults.size, dismissible = dialogRecipe.defaults.dismissible, busy = false, closeLabel, initialFocusRef, returnFocusRef, modalPriority = 0, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, forwardedRef) {
    const modalLayer = getModalLayer(modalPriority);
    const [open, changeOpen] = useOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const mergedContentRef = composeRefs(contentRef, forwardedRef);
    const id = useId().replaceAll(":", "");
    const contentId = `${id}-dialog`;
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const requestClose = (reason) => {
        if (!dismissible || busy)
            return;
        changeOpen(false, { reason });
    };
    useModalFocus({
        active: open,
        priority: modalPriority,
        contentRef,
        ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
        ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => requestClose("escape"),
    });
    return (_jsxs(_Fragment, { children: [trigger === undefined ? null : renderTrigger(trigger, triggerRef, open, contentId, "dialog", () => changeOpen(true, { reason: "trigger" })), open ? (_jsx(HjmPortal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-overlay", "data-kind": "dialog", "data-modal-priority": modalPriority, "data-state": "open", style: { zIndex: modalLayer }, onMouseDown: (event) => {
                        if (event.target === event.currentTarget)
                            requestClose("outside");
                    }, children: _jsxs("div", { ref: mergedContentRef, id: contentId, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": description ? descriptionId : undefined, "aria-busy": busy || undefined, tabIndex: -1, className: classNames("hjm-dialog", className), "data-hjm-modal-content": "", "data-size": size, "data-state": busy ? "busy" : "idle", children: [_jsxs("header", { className: "hjm-dialog__header", children: [_jsx("h2", { id: titleId, className: "hjm-dialog__title", children: title }), dismissible ? (_jsx("button", { type: "button", className: "hjm-dialog__close", "aria-label": closeLabel, disabled: busy, onClick: () => requestClose("close-action"), children: "\u00D7" })) : null] }), description ? _jsx("p", { id: descriptionId, className: "hjm-dialog__description", children: description }) : null, children ? _jsx("div", { className: "hjm-dialog__body", children: children }) : null, footer ? _jsx("footer", { className: "hjm-dialog__footer", children: footer }) : null] }) }) })) : null] }));
});
export const AlertDialog = forwardRef(function AlertDialog({ trigger, request, icon, size = dialogRecipe.defaults.size, returnFocusRef, modalPriority = 0, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, forwardedRef) {
    const modalLayer = getModalLayer(modalPriority);
    validateAlertDialogRequest(request);
    const [open, changeOpen] = useOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const sessionRef = useRef(null);
    const [sessionGeneration, setSessionGeneration] = useState(0);
    if (open && sessionRef.current === null) {
        sessionRef.current = createAlertDialogSession(request);
    }
    const idleSnapshot = useRef({ status: "idle" });
    const phase = useSyncExternalStore((listener) => sessionRef.current?.subscribe(listener) ?? (() => undefined), () => sessionRef.current?.getSnapshot() ?? idleSnapshot.current, () => idleSnapshot.current);
    const busy = phase.status === "busy";
    const closing = phase.status === "closing" || phase.status === "closed";
    const error = phase.status === "error" ? phase.message : undefined;
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const cancelRef = useRef(null);
    const confirmRef = useRef(null);
    const initialFocusRef = getAlertDialogInitialFocus(request.mode) === "cancel"
        ? cancelRef
        : confirmRef;
    const id = useId().replaceAll(":", "");
    const contentId = `${id}-alert-dialog`;
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;
    const startSession = () => {
        sessionRef.current?.interrupt();
        const session = createAlertDialogSession(request);
        sessionRef.current = session;
        setSessionGeneration((current) => current + 1);
        return session;
    };
    const cancel = (reason) => {
        const session = sessionRef.current;
        if (!session?.cancel(reason))
            return;
        changeOpen(false, { reason });
    };
    useModalFocus({
        active: open,
        priority: modalPriority,
        contentRef,
        initialFocusRef,
        ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => cancel("escape"),
    });
    const confirm = async () => {
        const session = sessionRef.current;
        if (!session)
            return;
        if (await session.confirm())
            changeOpen(false, { reason: "confirm" });
    };
    useEffect(() => {
        if (open)
            return;
        const session = sessionRef.current;
        if (!session)
            return;
        const snapshot = session.getSnapshot();
        if (snapshot.status === "idle" || snapshot.status === "error") {
            session.cancel("programmatic");
        }
        if (session.getSnapshot().status === "closing")
            session.completeExit();
        else if (session.getSnapshot().status !== "closed")
            session.interrupt();
        sessionRef.current = null;
    }, [open, sessionGeneration]);
    useEffect(() => () => {
        sessionRef.current?.interrupt();
    }, []);
    const tone = request.tone ?? "attention";
    return (_jsxs(_Fragment, { children: [trigger === undefined ? null : renderTrigger(trigger, triggerRef, open, contentId, "dialog", () => {
                startSession();
                changeOpen(true, { reason: "trigger" });
            }), open ? (_jsx(HjmPortal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-overlay", "data-kind": "alert-dialog", "data-modal-priority": modalPriority, "data-state": "open", style: { zIndex: modalLayer }, children: _jsxs("div", { ref: composeRefs(contentRef, forwardedRef), id: contentId, role: "alertdialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": `${descriptionId}${error ? ` ${errorId}` : ""}`, "aria-busy": busy || undefined, tabIndex: -1, className: classNames("hjm-alert-dialog", className), "data-hjm-modal-content": "", "data-size": size, "data-tone": tone, "data-state": busy ? "busy" : error ? "error" : "idle", children: [icon ? _jsx("div", { className: "hjm-alert-dialog__icon", "aria-hidden": "true", children: icon }) : null, _jsx("h2", { id: titleId, className: "hjm-alert-dialog__title", children: request.title }), _jsx("p", { id: descriptionId, className: "hjm-alert-dialog__description", children: request.description }), error ? _jsx("p", { id: errorId, className: "hjm-alert-dialog__error", role: "alert", children: error }) : null, _jsxs("div", { className: "hjm-alert-dialog__actions", children: [request.mode === "confirm" ? (_jsx(Button, { ref: cancelRef, tone: "secondary", disabled: busy || closing, onClick: () => cancel("cancel-action"), children: request.cancelLabel })) : null, _jsx(Button, { ref: confirmRef, tone: tone === "danger" ? "danger" : "primary", loading: busy, disabled: closing, onClick: () => void confirm(), children: request.confirmLabel })] })] }) }) })) : null] }));
});
export const Sheet = forwardRef(function Sheet({ trigger, title, description, children, footer, placement = sheetRecipe.defaults.placement, busy = false, dismissPolicy, closeLabel, initialFocusRef, returnFocusRef, onDismissComplete, modalPriority = 0, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, forwardedRef) {
    const modalLayer = getModalLayer(modalPriority);
    const [open, changeOpen] = useOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const policy = { ...sheetBehaviorDefaults, ...dismissPolicy };
    const lifecycleRef = useRef(createSheetLifecycle(open));
    const previousOpenRef = useRef(open);
    const currentOpenRef = useRef(open);
    currentOpenRef.current = open;
    const dismissReasonRef = useRef(undefined);
    const dismissCompleteRef = useRef(onDismissComplete);
    dismissCompleteRef.current = onDismissComplete;
    const settleDismissRef = useRef(() => undefined);
    settleDismissRef.current = (reason) => {
        const cycle = lifecycleRef.current.beginDismiss();
        if (cycle !== null && lifecycleRef.current.completeDismiss(cycle)) {
            dismissReasonRef.current = undefined;
            previousOpenRef.current = false;
            dismissCompleteRef.current?.({ reason });
        }
    };
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const id = useId().replaceAll(":", "");
    const contentId = `${id}-sheet`;
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const requestClose = (reason) => {
        if (lifecycleRef.current.requestClose(reason, busy, policy)) {
            dismissReasonRef.current = reason;
            changeOpen(false, { reason });
        }
    };
    useEffect(() => {
        if (open) {
            lifecycleRef.current.open();
            previousOpenRef.current = true;
            dismissReasonRef.current = undefined;
            return;
        }
        if (!previousOpenRef.current)
            return;
        settleDismissRef.current(dismissReasonRef.current ?? "programmatic");
    }, [open]);
    const mountEpochRef = useRef(0);
    useEffect(() => {
        const epoch = mountEpochRef.current + 1;
        mountEpochRef.current = epoch;
        return () => {
            queueMicrotask(() => {
                // React StrictMode immediately runs the setup again after its probe
                // cleanup. A real unmount has no later epoch and is settled here,
                // after the portal and focus-lock cleanups have completed.
                if (mountEpochRef.current !== epoch || !currentOpenRef.current)
                    return;
                settleDismissRef.current(dismissReasonRef.current ?? "programmatic");
            });
        };
    }, []);
    useModalFocus({
        active: open,
        priority: modalPriority,
        contentRef,
        ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
        ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => requestClose("escape"),
    });
    return (_jsxs(_Fragment, { children: [trigger === undefined ? null : renderTrigger(trigger, triggerRef, open, contentId, "dialog", () => changeOpen(true, { reason: "trigger" })), open ? (_jsx(HjmPortal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-overlay hjm-sheet-positioner", "data-kind": "sheet", "data-modal-priority": modalPriority, "data-placement": placement, "data-state": "open", style: { zIndex: modalLayer }, onMouseDown: (event) => {
                        if (event.target === event.currentTarget)
                            requestClose("outside");
                    }, children: _jsxs("div", { ref: composeRefs(contentRef, forwardedRef), id: contentId, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": description ? descriptionId : undefined, "aria-busy": busy || undefined, tabIndex: -1, className: classNames("hjm-sheet", className), "data-hjm-modal-content": "", "data-placement": placement, "data-has-footer": footer ? true : undefined, "data-state": busy ? "busy" : "idle", children: [_jsxs("header", { className: "hjm-sheet__header", children: [_jsxs("div", { children: [_jsx("h2", { id: titleId, className: "hjm-sheet__title", children: title }), description ? _jsx("p", { id: descriptionId, className: "hjm-sheet__description", children: description }) : null] }), policy.dismissible ? (_jsx("button", { type: "button", className: "hjm-dialog__close", "aria-label": closeLabel, disabled: busy && !policy.dismissWhileBusy, onClick: () => requestClose("close-action"), children: "\u00D7" })) : null] }), children ? _jsx("div", { className: "hjm-sheet__body", children: children }) : null, footer ? _jsx("footer", { className: "hjm-sheet__footer", children: footer }) : null] }) }) })) : null] }));
});
export const Tooltip = forwardRef(function Tooltip({ trigger, content, placement, align, pointerOpenDelayMs = tooltipBehaviorDefaults.pointerOpenDelayMs, focusOpenDelayMs = tooltipBehaviorDefaults.focusOpenDelayMs, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, ref) {
    const descriptor = resolveTooltipDescriptor({
        content,
        ...(placement === undefined ? {} : { placement }),
        ...(align === undefined ? {} : { align }),
    });
    const [open, changeOpen] = useOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const timerRef = useRef(undefined);
    const suppressedRef = useRef(false);
    const triggerRef = useRef(null);
    const [tooltipNode, setTooltipNode] = useState(null);
    const id = `${useId().replaceAll(":", "")}-tooltip`;
    const coordinator = useTooltipCoordinator();
    const activeTooltipId = coordinator?.activeId ?? null;
    const activateTooltip = coordinator?.activate;
    const deactivateTooltip = coordinator?.deactivate;
    const shouldSkipTooltipDelay = coordinator?.shouldSkipDelay;
    const visible = open &&
        (coordinator === null ||
            activeTooltipId === null ||
            activeTooltipId === id);
    const clearTimer = () => {
        if (timerRef.current !== undefined)
            clearTimeout(timerRef.current);
        timerRef.current = undefined;
    };
    useEffect(() => clearTimer, []);
    const schedule = (nextOpen, delay, detail) => {
        clearTimer();
        if (nextOpen && suppressedRef.current)
            return;
        timerRef.current = setTimeout(() => {
            if (nextOpen)
                activateTooltip?.(id);
            changeOpen(nextOpen, detail);
        }, delay);
    };
    useEffect(() => {
        if (open)
            activateTooltip?.(id);
        else
            deactivateTooltip?.(id);
    }, [activateTooltip, deactivateTooltip, id, open]);
    useEffect(() => {
        if (open &&
            activeTooltipId !== null &&
            activeTooltipId !== id) {
            clearTimer();
            changeOpen(false, { reason: "another-tooltip" });
        }
    }, [activeTooltipId, changeOpen, id, open]);
    useEffect(() => () => deactivateTooltip?.(id), [deactivateTooltip, id]);
    const triggerProps = trigger.props;
    const describedBy = visible
        ? [triggerProps["aria-describedby"], id].filter(Boolean).join(" ")
        : triggerProps["aria-describedby"];
    const renderedTrigger = cloneElement(trigger, {
        ref: composeRefs(triggerProps.ref, triggerRef),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        onPointerEnter: (event) => {
            triggerProps.onPointerEnter?.(event);
            if (event.pointerType === "touch")
                return;
            schedule(true, shouldSkipTooltipDelay?.() ? 0 : pointerOpenDelayMs, { reason: "pointer" });
        },
        onPointerLeave: (event) => {
            triggerProps.onPointerLeave?.(event);
            if (event.pointerType === "touch")
                return;
            suppressedRef.current = false;
            schedule(false, 80, { reason: "pointer-leave" });
        },
        onFocus: (event) => {
            triggerProps.onFocus?.(event);
            schedule(true, focusOpenDelayMs, { reason: "focus" });
        },
        onBlur: (event) => {
            triggerProps.onBlur?.(event);
            suppressedRef.current = false;
            schedule(false, 0, { reason: "blur" });
        },
        onKeyDown: (event) => {
            triggerProps.onKeyDown?.(event);
            if (event.key === "Escape" && visible) {
                event.preventDefault();
                clearTimer();
                suppressedRef.current = true;
                changeOpen(false, { reason: "escape" });
            }
        },
        onClick: (event) => {
            triggerProps.onClick?.(event);
            if (visible && !event.defaultPrevented) {
                changeOpen(false, { reason: "trigger-activation" });
            }
        },
    });
    const popupPosition = useAnchoredPopup(triggerRef, tooltipNode, {
        align: descriptor.align,
        placement: descriptor.placement,
        zIndex: 1100,
    });
    const setTooltipRef = useCallback((node) => {
        setTooltipNode(node);
    }, []);
    return (_jsxs("span", { ref: ref, className: classNames("hjm-tooltip", className), "data-placement": descriptor.placement, "data-align": descriptor.align, "data-state": visible ? "open" : "closed", onPointerEnter: (event) => {
            if (event.pointerType !== "touch")
                clearTimer();
        }, onPointerLeave: (event) => {
            if (event.pointerType === "touch")
                return;
            suppressedRef.current = false;
            schedule(false, 0, { reason: "pointer-leave" });
        }, children: [renderedTrigger, visible ? (_jsx(AnchoredPortal, { anchorRef: triggerRef, ssrFallback: "inline", ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("span", { ref: setTooltipRef, id: id, role: "tooltip", className: "hjm-tooltip__content", "data-placement": popupPosition.placement, "data-align": popupPosition.align, style: popupPosition.style, onPointerEnter: (event) => {
                        if (event.pointerType !== "touch")
                            clearTimer();
                    }, onPointerLeave: (event) => {
                        if (event.pointerType === "touch")
                            return;
                        suppressedRef.current = false;
                        schedule(false, 0, { reason: "pointer-leave" });
                    }, children: descriptor.content }) })) : null] }));
});
function menuTextValue(item) {
    const value = item.textValue ?? (typeof item.label === "string" ? item.label : undefined);
    if (value === undefined || value.trim().length === 0) {
        throw new TypeError(`Menu item ${item.id} needs textValue for typeahead`);
    }
    return value.trim();
}
function validateMenuItems(items, sections, asyncState) {
    if (items.length === 0 && (asyncState.status === "idle" || asyncState.status === "loadingMore")) {
        throw new TypeError("Menu requires at least one item");
    }
    const ids = new Set();
    for (const item of items) {
        if (item.id.trim().length === 0)
            throw new TypeError("Menu item id must not be empty");
        if (ids.has(item.id))
            throw new TypeError(`Duplicate Menu item id: ${item.id}`);
        ids.add(item.id);
        menuTextValue(item);
    }
    if (sections !== undefined) {
        const sectionIds = new Set();
        for (const section of sections) {
            if (section.id.trim().length === 0)
                throw new TypeError("Menu section id must not be empty");
            if (sectionIds.has(section.id))
                throw new TypeError(`Duplicate Menu section id: ${section.id}`);
            sectionIds.add(section.id);
            if (section.items.length === 0)
                throw new TypeError(`Menu section ${section.id} must not be empty`);
            if ((section.label?.trim().length ?? 0) === 0 &&
                (section.accessibilityLabel?.trim().length ?? 0) === 0) {
                throw new TypeError(`Menu section ${section.id} needs a label or accessibilityLabel`);
            }
        }
    }
    if ((asyncState.status === "idle" || asyncState.status === "loadingMore") &&
        !items.some((item) => !item.disabled)) {
        throw new TypeError("Menu requires at least one enabled item");
    }
}
export const Menu = forwardRef(function Menu(props, ref) {
    const { trigger, label, density = menuRecipe.defaults.density, align = "start", disabled = false, asyncState = { status: "idle" }, onAction, onActionAfterDismiss, portalContainer, open: openProp, defaultOpen, onOpenChange, className, } = props;
    const sections = props.sections;
    const items = sections === undefined ? props.items : sections.flatMap((section) => section.items);
    if (label.trim().length === 0)
        throw new TypeError("Menu label must not be empty");
    validateMenuItems(items, sections, asyncState);
    const selectionMode = props.selectionMode ?? "action";
    const [open, changeOpen] = useOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const [focusIndex, setFocusIndex] = useState(() => items.findIndex((item) => !item.disabled));
    const singleSelection = selectionMode === "single"
        ? props
        : undefined;
    const multipleSelection = selectionMode === "multiple"
        ? props
        : undefined;
    const [singleValue, setSingleValue] = useControllableState({
        ...(singleSelection?.value !== undefined
            ? { value: singleSelection.value }
            : {}),
        defaultValue: singleSelection?.defaultValue ?? null,
        ...(singleSelection?.onValueChange !== undefined
            ? {
                onChange: (next) => {
                    if (next !== null)
                        singleSelection.onValueChange?.(next);
                },
            }
            : {}),
    });
    const [multipleValue, setMultipleValue] = useControllableState({
        ...(multipleSelection?.value !== undefined
            ? { value: multipleSelection.value }
            : {}),
        defaultValue: multipleSelection?.defaultValue ?? new Set(),
        ...(multipleSelection?.onValueChange !== undefined
            ? { onChange: multipleSelection.onValueChange }
            : {}),
    });
    const knownIds = new Set(items.map((item) => item.id));
    if (selectionMode === "single" && singleValue !== null && !knownIds.has(singleValue)) {
        throw new RangeError(`Unknown Menu single value: ${singleValue}`);
    }
    if (selectionMode === "multiple") {
        for (const selectedId of multipleValue) {
            if (!knownIds.has(selectedId))
                throw new RangeError(`Unknown Menu multiple value: ${selectedId}`);
        }
    }
    const triggerRef = useRef(null);
    const itemRefs = useRef(new Map());
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);
    const [contentNode, setContentNode] = useState(null);
    const restoreFocusRef = useRef(false);
    const afterDismissIdRef = useRef(undefined);
    const typeaheadRef = useRef({ value: "", time: 0 });
    const id = `${useId().replaceAll(":", "")}-menu`;
    const popupPosition = useAnchoredPopup(triggerRef, contentNode, { align, zIndex: 900 });
    const setMenuContentRef = useCallback((node) => {
        contentRef.current = node;
        setContentNode(node);
        if (typeof ref === "function")
            ref(node);
        else if (ref)
            ref.current = node;
    }, [ref]);
    useEffect(() => {
        if (!open) {
            if (restoreFocusRef.current) {
                restoreFocusRef.current = false;
                queueMicrotask(() => triggerRef.current?.focus());
            }
            const completedId = afterDismissIdRef.current;
            if (completedId !== undefined) {
                afterDismissIdRef.current = undefined;
                queueMicrotask(() => onActionAfterDismiss?.(completedId));
            }
            return;
        }
        const item = itemRefs.current.get(focusIndex);
        if (item && !item.disabled)
            item.focus();
        else
            contentRef.current?.focus();
    }, [contentNode, focusIndex, onActionAfterDismiss, open]);
    const itemIsDisabled = (item) => disabled || asyncState.status === "loading" || Boolean(item.disabled);
    const firstEnabled = () => items.findIndex((item) => !itemIsDisabled(item));
    const lastEnabled = () => {
        for (let index = items.length - 1; index >= 0; index -= 1) {
            if (items[index] && !itemIsDisabled(items[index]))
                return index;
        }
        return firstEnabled();
    };
    const focusAt = (index) => {
        setFocusIndex(index);
        queueMicrotask(() => itemRefs.current.get(index)?.focus());
    };
    const moveFocus = (step) => {
        for (let offset = 1; offset <= items.length; offset += 1) {
            const next = (focusIndex + step * offset + items.length) % items.length;
            if (items[next] && !itemIsDisabled(items[next])) {
                focusAt(next);
                return;
            }
        }
    };
    const close = (reason, restore) => {
        if (restore)
            restoreFocusRef.current = true;
        changeOpen(false, { reason });
    };
    const openMenu = (focus = "first") => {
        if (disabled)
            return;
        const index = focus === "first" ? firstEnabled() : lastEnabled();
        setFocusIndex(index);
        changeOpen(true, { reason: "trigger" });
    };
    const itemSelected = (id) => selectionMode === "single"
        ? singleValue === id
        : selectionMode === "multiple"
            ? multipleValue.has(id)
            : false;
    const activateItem = (item, index) => {
        if (itemIsDisabled(item))
            return;
        item.onSelect?.();
        onAction?.(item.id);
        if (selectionMode === "multiple") {
            const next = new Set(multipleValue);
            if (next.has(item.id))
                next.delete(item.id);
            else
                next.add(item.id);
            setMultipleValue(next);
            focusAt(index);
            return;
        }
        if (selectionMode === "single")
            setSingleValue(item.id);
        afterDismissIdRef.current = item.id;
        close("selection", true);
    };
    const runTypeahead = (key) => {
        const currentTime = Date.now();
        const previous = currentTime - typeaheadRef.current.time < 500
            ? typeaheadRef.current.value
            : "";
        const combined = `${previous}${key}`.toLocaleLowerCase();
        const search = new Set(combined).size === 1 ? key.toLocaleLowerCase() : combined;
        typeaheadRef.current = { value: combined, time: currentTime };
        for (let offset = 1; offset <= items.length; offset += 1) {
            const index = (focusIndex + offset + items.length) % items.length;
            const item = items[index];
            if (item &&
                !itemIsDisabled(item) &&
                menuTextValue(item).toLocaleLowerCase().startsWith(search)) {
                focusAt(index);
                return;
            }
        }
    };
    useEffect(() => {
        if (!open)
            return;
        const handlePointerDown = (event) => {
            if (event.target instanceof Node &&
                !wrapperRef.current?.contains(event.target) &&
                !contentRef.current?.contains(event.target)) {
                close("outside", false);
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    });
    const triggerProps = trigger.props;
    const renderedTrigger = cloneElement(trigger, {
        ref: composeRefs(triggerProps.ref, triggerRef),
        "aria-controls": id,
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-disabled": disabled || undefined,
        disabled: triggerProps.disabled || disabled,
        onClick: (event) => {
            triggerProps.onClick?.(event);
            if (event.defaultPrevented || triggerProps.disabled || disabled)
                return;
            if (open)
                close("trigger", false);
            else
                openMenu();
        },
        onKeyDown: (event) => {
            triggerProps.onKeyDown?.(event);
            if (event.defaultPrevented)
                return;
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMenu("first");
            }
            else if (event.key === "ArrowUp") {
                event.preventDefault();
                openMenu("last");
            }
        },
    });
    const handleMenuKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            moveFocus(1);
        }
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            moveFocus(-1);
        }
        else if (event.key === "Home") {
            event.preventDefault();
            focusAt(firstEnabled());
        }
        else if (event.key === "End") {
            event.preventDefault();
            focusAt(lastEnabled());
        }
        else if (event.key === "Escape") {
            event.preventDefault();
            close("escape", true);
        }
        else if (event.key === "Tab") {
            close("tab", false);
        }
        else if (event.key.length === 1 &&
            event.key !== " " &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey) {
            event.preventDefault();
            runTypeahead(event.key);
        }
    };
    const showItems = asyncState.status !== "empty" && asyncState.status !== "error";
    return (_jsxs("span", { ref: wrapperRef, className: "hjm-menu", "data-state": open ? "open" : "closed", children: [renderedTrigger, open ? (_jsx(AnchoredPortal, { anchorRef: triggerRef, ssrFallback: "inline", ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsxs("div", { ref: setMenuContentRef, id: id, role: "menu", "aria-label": label, className: classNames("hjm-menu__content", className), "data-density": density, "data-async-state": asyncState.status, "data-placement": popupPosition.placement, "data-align": popupPosition.align, "aria-busy": asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined, style: popupPosition.style, tabIndex: -1, onKeyDown: handleMenuKeyDown, children: [asyncState.status !== "idle" ? (_jsx("div", { className: "hjm-menu__state-message", role: asyncState.status === "error" ? "alert" : "status", children: asyncState.message })) : null, showItems ? (sections === undefined ? items.map((item, index) => {
                            const selected = itemSelected(item.id);
                            const itemDisabled = itemIsDisabled(item);
                            const role = selectionMode === "single"
                                ? "menuitemradio"
                                : selectionMode === "multiple"
                                    ? "menuitemcheckbox"
                                    : "menuitem";
                            return renderMenuItem(item, index, role, selected, itemDisabled);
                        }) : sections.map((section, sectionIndex) => {
                            const sectionLabelId = `${id}-section-${sectionIndex}`;
                            const firstIndex = sections
                                .slice(0, sectionIndex)
                                .reduce((total, current) => total + current.items.length, 0);
                            return (_jsxs("div", { className: "hjm-menu__section-boundary", children: [sectionIndex > 0 ? _jsx("div", { role: "separator", className: "hjm-menu__separator" }) : null, _jsxs("div", { role: "group", "aria-labelledby": section.label ? sectionLabelId : undefined, "aria-label": section.label ? undefined : section.accessibilityLabel, className: "hjm-menu__section", children: [section.label ? (_jsx("div", { id: sectionLabelId, className: "hjm-menu__section-label", children: section.label })) : null, section.items.map((item, itemIndex) => {
                                                const index = firstIndex + itemIndex;
                                                const selected = itemSelected(item.id);
                                                const itemDisabled = itemIsDisabled(item);
                                                const role = selectionMode === "single"
                                                    ? "menuitemradio"
                                                    : selectionMode === "multiple"
                                                        ? "menuitemcheckbox"
                                                        : "menuitem";
                                                return renderMenuItem(item, index, role, selected, itemDisabled);
                                            })] })] }, section.id));
                        })) : null] }) })) : null] }));
    function renderMenuItem(item, index, role, selected, itemDisabled) {
        return (_jsxs("button", { ref: (node) => {
                if (node) {
                    itemRefs.current.set(index, node);
                    if (open && !itemDisabled && index === focusIndex) {
                        queueMicrotask(() => {
                            if (node.isConnected && open)
                                node.focus();
                        });
                    }
                }
                else
                    itemRefs.current.delete(index);
            }, type: "button", role: role, "aria-checked": selectionMode === "action" ? undefined : selected, className: "hjm-menu__item", "data-tone": item.tone ?? menuRecipe.defaults.itemTone, "data-state": itemDisabled ? "disabled" : selected ? "selected" : "idle", "data-focus": index === focusIndex || undefined, disabled: itemDisabled, tabIndex: !itemDisabled && index === focusIndex ? 0 : -1, onClick: () => activateItem(item, index), children: [item.tone === "danger" ? (_jsx("span", { className: "hjm-menu__danger-indicator", "aria-hidden": "true", children: "!" })) : null, item.leading ? _jsx("span", { className: "hjm-menu__leading", "aria-hidden": "true", children: item.leading }) : null, _jsxs("span", { className: "hjm-menu__copy", children: [_jsx("span", { children: item.label }), item.description ? _jsx("span", { className: "hjm-menu__description", children: item.description }) : null] }), item.trailing ? _jsx("span", { className: "hjm-menu__trailing", children: item.trailing }) : null] }, item.id));
    }
});
//# sourceMappingURL=overlays.js.map