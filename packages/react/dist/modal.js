import { jsx as _jsx } from "react/jsx-runtime";
import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import { cloneElement, useCallback, useEffect, useRef, useState, } from "react";
import { createPortal } from "react-dom";
import { composeRefs } from "./internal.js";
import { getPopoverOwner } from "./portal.js";
import { useOptionalHjmTheme } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";
export function containsEventTarget(container, target) {
    return target !== null &&
        "nodeType" in target &&
        container?.contains(target) === true;
}
export function HjmPortal({ children, container }) {
    const [mounted, setMounted] = useState(false);
    const theme = useOptionalHjmTheme();
    useEffect(() => setMounted(true), []);
    if (!mounted)
        return null;
    return createPortal(theme ? (_jsx("div", { className: "hjm-root hjm-portal", "data-hjm-portal": "", "data-motion": theme.environment.reducedMotion ? "reduced" : "full", "data-theme": theme.environment.theme, "data-text-scale": theme.environment.textScale, "data-large-text": isLargeTextScale(theme.environment.textScale) ? "true" : undefined, dir: theme.environment.direction, style: createHjmThemeStyle(theme), children: children })) : children, container ?? document.body);
}
export function useOpenState({ open, defaultOpen = false, onOpenChange, }) {
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
export function getFocusable(container) {
    return [...container.querySelectorAll(focusableSelector)].filter((element) => element.tabIndex >= 0 && !element.matches(":disabled") &&
        !element.closest('[hidden],[inert],[aria-hidden="true"]') &&
        element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
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
export function getModalLayer(priority) {
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
export function useModalFocus({ active, priority = 0, contentRef, initialFocusRef, returnFocusRef, fallbackReturnRef, onEscape, }) {
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
                    // A focused non-modal child owns its first Escape. Let its content (or
                    // nested menu) handle it before dismissing the containing modal.
                    if (event.target instanceof Node && getPopoverOwner(event.target))
                        return;
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
export function renderTrigger(trigger, triggerRef, open, contentId, popup, onOpen) {
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
//# sourceMappingURL=modal.js.map