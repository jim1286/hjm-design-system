import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createAlertDialogSession, getAlertDialogInitialFocus, validateAlertDialogRequest, } from "@hjm/design-contracts/components/alert-dialog";
import { createSheetLifecycle, sheetBehaviorDefaults, } from "@hjm/design-contracts/components/sheet";
import { resolveTooltipDescriptor, tooltipBehaviorDefaults, } from "@hjm/design-contracts/components/tooltip";
import { dialogRecipe, menuRecipe, sheetRecipe, } from "@hjm/design-contracts/recipes";
import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, } from "react";
import { createPortal } from "react-dom";
import { Button } from "./actions.js";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import { useOptionalHjmTheme, useTooltipCoordinator } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";
function Portal({ children, container }) {
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
const isolatedModalBackground = new Map();
let modalIsolationObserver = null;
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
    while (activeModalStack.length > 0 && !activeModalStack.at(-1)?.isConnected) {
        activeModalStack.pop();
    }
    const top = activeModalStack.at(-1);
    if (!top) {
        modalIsolationObserver?.disconnect();
        modalIsolationObserver = null;
        return;
    }
    let pathNode = top;
    let parent = pathNode.parentElement;
    while (parent) {
        for (const sibling of parent.children) {
            if (sibling !== pathNode && sibling instanceof HTMLElement) {
                isolateModalBackgroundElement(sibling);
            }
        }
        if (parent === document.body)
            break;
        pathNode = parent;
        parent = pathNode.parentElement;
    }
    if (modalIsolationObserver === null) {
        modalIsolationObserver = new MutationObserver(() => {
            synchronizeModalBackgroundIsolation();
        });
        modalIsolationObserver.observe(document.body, { childList: true, subtree: true });
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
function useModalFocus({ active, contentRef, initialFocusRef, returnFocusRef, fallbackReturnRef, onEscape, }) {
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
            activeModalStack.push(content);
            synchronizeModalBackgroundIsolation();
            const initial = initialFocusRef?.current ?? getFocusable(content)[0] ?? content;
            initial.focus();
            const handleKeyDown = (event) => {
                if (activeModalStack.at(-1) !== content)
                    return;
                if (event.key === "Escape") {
                    event.preventDefault();
                    escapeRef.current();
                    return;
                }
                if (event.key !== "Tab")
                    return;
                const focusable = getFocusable(content);
                if (focusable.length === 0) {
                    event.preventDefault();
                    content.focus();
                    return;
                }
                const first = focusable[0];
                const last = focusable.at(-1);
                const current = document.activeElement;
                if (event.shiftKey && (current === first || !content.contains(current))) {
                    event.preventDefault();
                    last.focus();
                }
                else if (!event.shiftKey && (current === last || !content.contains(current))) {
                    event.preventDefault();
                    first.focus();
                }
            };
            const handleFocusIn = (event) => {
                if (activeModalStack.at(-1) !== content)
                    return;
                if (event.target instanceof Node && !content.contains(event.target)) {
                    (initialFocusRef?.current ?? getFocusable(content)[0] ?? content).focus();
                }
            };
            document.addEventListener("keydown", handleKeyDown, true);
            document.addEventListener("focusin", handleFocusIn, true);
            release = () => {
                document.removeEventListener("keydown", handleKeyDown, true);
                document.removeEventListener("focusin", handleFocusIn, true);
                const stackIndex = activeModalStack.lastIndexOf(content);
                if (stackIndex >= 0)
                    activeModalStack.splice(stackIndex, 1);
                synchronizeModalBackgroundIsolation();
                releaseScroll();
                const returnTarget = returnFocusRef?.current ?? fallbackReturnRef?.current ?? previouslyFocused;
                queueMicrotask(() => returnTarget?.focus());
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
    }, [active, contentRef, fallbackReturnRef, initialFocusRef, returnFocusRef]);
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
export const Dialog = forwardRef(function Dialog({ trigger, title, description, children, footer, size = dialogRecipe.defaults.size, dismissible = dialogRecipe.defaults.dismissible, busy = false, closeLabel, initialFocusRef, returnFocusRef, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, forwardedRef) {
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
        contentRef,
        ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
        ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => requestClose("escape"),
    });
    return (_jsxs(_Fragment, { children: [trigger === undefined ? null : renderTrigger(trigger, triggerRef, open, contentId, "dialog", () => changeOpen(true, { reason: "trigger" })), open ? (_jsx(Portal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-overlay", "data-kind": "dialog", "data-state": "open", onMouseDown: (event) => {
                        if (event.target === event.currentTarget)
                            requestClose("outside");
                    }, children: _jsxs("div", { ref: mergedContentRef, id: contentId, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": description ? descriptionId : undefined, "aria-busy": busy || undefined, tabIndex: -1, className: classNames("hjm-dialog", className), "data-size": size, "data-state": busy ? "busy" : "idle", children: [_jsxs("header", { className: "hjm-dialog__header", children: [_jsx("h2", { id: titleId, className: "hjm-dialog__title", children: title }), dismissible ? (_jsx("button", { type: "button", className: "hjm-dialog__close", "aria-label": closeLabel, disabled: busy, onClick: () => requestClose("close-action"), children: "\u00D7" })) : null] }), description ? _jsx("p", { id: descriptionId, className: "hjm-dialog__description", children: description }) : null, children ? _jsx("div", { className: "hjm-dialog__body", children: children }) : null, footer ? _jsx("footer", { className: "hjm-dialog__footer", children: footer }) : null] }) }) })) : null] }));
});
export const AlertDialog = forwardRef(function AlertDialog({ trigger, request, icon, returnFocusRef, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, forwardedRef) {
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
            }), open ? (_jsx(Portal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-overlay", "data-kind": "alert-dialog", "data-state": "open", children: _jsxs("div", { ref: composeRefs(contentRef, forwardedRef), id: contentId, role: "alertdialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": `${descriptionId}${error ? ` ${errorId}` : ""}`, "aria-busy": busy || undefined, tabIndex: -1, className: classNames("hjm-alert-dialog", className), "data-tone": tone, "data-state": busy ? "busy" : error ? "error" : "idle", children: [icon ? _jsx("div", { className: "hjm-alert-dialog__icon", "aria-hidden": "true", children: icon }) : null, _jsx("h2", { id: titleId, className: "hjm-alert-dialog__title", children: request.title }), _jsx("p", { id: descriptionId, className: "hjm-alert-dialog__description", children: request.description }), error ? _jsx("p", { id: errorId, className: "hjm-alert-dialog__error", role: "alert", children: error }) : null, _jsxs("div", { className: "hjm-alert-dialog__actions", children: [request.mode === "confirm" ? (_jsx(Button, { ref: cancelRef, tone: "secondary", disabled: busy || closing, onClick: () => cancel("cancel-action"), children: request.cancelLabel })) : null, _jsx(Button, { ref: confirmRef, tone: tone === "danger" ? "danger" : "primary", loading: busy, disabled: closing, onClick: () => void confirm(), children: request.confirmLabel })] })] }) }) })) : null] }));
});
export const Sheet = forwardRef(function Sheet({ trigger, title, description, children, footer, placement = sheetRecipe.defaults.placement, busy = false, dismissPolicy, closeLabel, initialFocusRef, returnFocusRef, portalContainer, open: openProp, defaultOpen, onOpenChange, className, }, forwardedRef) {
    const [open, changeOpen] = useOpenState({
        ...(openProp === undefined ? {} : { open: openProp }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const policy = { ...sheetBehaviorDefaults, ...dismissPolicy };
    const lifecycleRef = useRef(createSheetLifecycle(open));
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const id = useId().replaceAll(":", "");
    const contentId = `${id}-sheet`;
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const requestClose = (reason) => {
        if (lifecycleRef.current.requestClose(reason, busy, policy)) {
            changeOpen(false, { reason });
        }
    };
    useEffect(() => {
        if (open) {
            lifecycleRef.current.open();
            return;
        }
        const cycle = lifecycleRef.current.beginDismiss();
        if (cycle !== null)
            lifecycleRef.current.completeDismiss(cycle);
    }, [open]);
    useModalFocus({
        active: open,
        contentRef,
        ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
        ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => requestClose("escape"),
    });
    return (_jsxs(_Fragment, { children: [trigger === undefined ? null : renderTrigger(trigger, triggerRef, open, contentId, "dialog", () => changeOpen(true, { reason: "trigger" })), open ? (_jsx(Portal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-overlay hjm-sheet-positioner", "data-kind": "sheet", "data-placement": placement, "data-state": "open", onMouseDown: (event) => {
                        if (event.target === event.currentTarget)
                            requestClose("outside");
                    }, children: _jsxs("div", { ref: composeRefs(contentRef, forwardedRef), id: contentId, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": description ? descriptionId : undefined, "aria-busy": busy || undefined, tabIndex: -1, className: classNames("hjm-sheet", className), "data-placement": placement, "data-state": busy ? "busy" : "idle", children: [_jsxs("header", { className: "hjm-sheet__header", children: [_jsxs("div", { children: [_jsx("h2", { id: titleId, className: "hjm-sheet__title", children: title }), description ? _jsx("p", { id: descriptionId, className: "hjm-sheet__description", children: description }) : null] }), policy.dismissible ? (_jsx("button", { type: "button", className: "hjm-dialog__close", "aria-label": closeLabel, disabled: busy && !policy.dismissWhileBusy, onClick: () => requestClose("close-action"), children: "\u00D7" })) : null] }), children ? _jsx("div", { className: "hjm-sheet__body", children: children }) : null, footer ? _jsx("footer", { className: "hjm-sheet__footer", children: footer }) : null] }) }) })) : null] }));
});
export const Tooltip = forwardRef(function Tooltip({ trigger, content, placement, align, pointerOpenDelayMs = tooltipBehaviorDefaults.pointerOpenDelayMs, focusOpenDelayMs = tooltipBehaviorDefaults.focusOpenDelayMs, open: openProp, defaultOpen, onOpenChange, className, }, ref) {
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
    return (_jsxs("span", { ref: ref, className: classNames("hjm-tooltip", className), "data-placement": descriptor.placement, "data-align": descriptor.align, "data-state": visible ? "open" : "closed", onPointerEnter: (event) => {
            if (event.pointerType !== "touch")
                clearTimer();
        }, onPointerLeave: (event) => {
            if (event.pointerType === "touch")
                return;
            suppressedRef.current = false;
            schedule(false, 0, { reason: "pointer-leave" });
        }, children: [renderedTrigger, visible ? (_jsx("span", { id: id, role: "tooltip", className: "hjm-tooltip__content", children: descriptor.content })) : null] }));
});
function menuTextValue(item) {
    const value = item.textValue ?? (typeof item.label === "string" ? item.label : undefined);
    if (value === undefined || value.trim().length === 0) {
        throw new TypeError(`Menu item ${item.id} needs textValue for typeahead`);
    }
    return value.trim();
}
function validateMenuItems(items, asyncState) {
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
    if ((asyncState.status === "idle" || asyncState.status === "loadingMore") &&
        !items.some((item) => !item.disabled)) {
        throw new TypeError("Menu requires at least one enabled item");
    }
}
export const Menu = forwardRef(function Menu(props, ref) {
    const { trigger, label, items, density = menuRecipe.defaults.density, disabled = false, asyncState = { status: "idle" }, onAction, onActionAfterDismiss, open: openProp, defaultOpen, onOpenChange, className, } = props;
    if (label.trim().length === 0)
        throw new TypeError("Menu label must not be empty");
    validateMenuItems(items, asyncState);
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
    const restoreFocusRef = useRef(false);
    const afterDismissIdRef = useRef(undefined);
    const typeaheadRef = useRef({ value: "", time: 0 });
    const id = `${useId().replaceAll(":", "")}-menu`;
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
    }, [focusIndex, onActionAfterDismiss, open]);
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
                !wrapperRef.current?.contains(event.target)) {
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
    return (_jsxs("span", { ref: wrapperRef, className: "hjm-menu", "data-state": open ? "open" : "closed", children: [renderedTrigger, open ? (_jsxs("div", { ref: composeRefs(contentRef, ref), id: id, role: "menu", "aria-label": label, className: classNames("hjm-menu__content", className), "data-density": density, "data-async-state": asyncState.status, "aria-busy": asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined, tabIndex: -1, onKeyDown: handleMenuKeyDown, children: [asyncState.status !== "idle" ? (_jsx("div", { className: "hjm-menu__state-message", role: asyncState.status === "error" ? "alert" : "status", children: asyncState.message })) : null, showItems ? items.map((item, index) => {
                        const selected = itemSelected(item.id);
                        const itemDisabled = itemIsDisabled(item);
                        const role = selectionMode === "single"
                            ? "menuitemradio"
                            : selectionMode === "multiple"
                                ? "menuitemcheckbox"
                                : "menuitem";
                        return (_jsxs("button", { ref: (node) => {
                                if (node)
                                    itemRefs.current.set(index, node);
                                else
                                    itemRefs.current.delete(index);
                            }, type: "button", role: role, "aria-checked": selectionMode === "action" ? undefined : selected, className: "hjm-menu__item", "data-tone": item.tone ?? menuRecipe.defaults.itemTone, "data-state": itemDisabled ? "disabled" : selected ? "selected" : "idle", "data-focus": index === focusIndex || undefined, disabled: itemDisabled, tabIndex: !itemDisabled && index === focusIndex ? 0 : -1, onClick: () => activateItem(item, index), children: [item.tone === "danger" ? (_jsx("span", { className: "hjm-menu__danger-indicator", "aria-hidden": "true", children: "!" })) : null, item.leading ? _jsx("span", { className: "hjm-menu__leading", "aria-hidden": "true", children: item.leading }) : null, _jsxs("span", { className: "hjm-menu__copy", children: [_jsx("span", { children: item.label }), item.description ? _jsx("span", { className: "hjm-menu__description", children: item.description }) : null] }), item.trailing ? _jsx("span", { className: "hjm-menu__trailing", children: item.trailing }) : null] }, item.id));
                    }) : null] })) : null] }));
});
//# sourceMappingURL=overlays.js.map