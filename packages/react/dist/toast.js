import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createToastStore, resolveToastDescriptor, } from "@hjmds/design-contracts/components/toast";
import { toastRecipe, } from "@hjmds/design-contracts/recipes";
import { createContext, forwardRef, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, } from "react";
import { createPortal } from "react-dom";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";
const toneMarks = {
    neutral: "●",
    info: "i",
    success: "✓",
    warning: "!",
    danger: "!",
};
const ToastCard = forwardRef(function ToastCard({ descriptor, phase, onAction, onDismiss, onPointerPause, onPointerResume, onFocusPause, onFocusResume, locale, className, }, ref) {
    const baseId = useId().replaceAll(":", "");
    const titleId = `${baseId}-toast-title`;
    const descriptionId = `${baseId}-toast-description`;
    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            onDismiss("escape");
        }
    };
    return (_jsxs("div", { ref: ref, className: classNames("hjm-toast", className), "data-tone": descriptor.tone, "data-state": phase, lang: locale, role: "group", "aria-labelledby": descriptor.title ? titleId : undefined, "aria-describedby": descriptionId, onPointerEnter: onPointerPause, onPointerLeave: onPointerResume, onFocusCapture: onFocusPause, onBlurCapture: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
                onFocusResume?.();
        }, onKeyDown: handleKeyDown, children: [_jsx("span", { className: "hjm-visually-hidden", role: descriptor.priority === "high" ? "alert" : "status", children: descriptor.announcement }), _jsx("span", { className: "hjm-toast__tone-mark", "aria-hidden": "true" }), _jsx("span", { className: "hjm-toast__icon", "aria-hidden": "true", children: toneMarks[descriptor.tone] }), _jsxs("span", { className: "hjm-toast__content", children: [descriptor.title ? (_jsx("strong", { id: titleId, className: "hjm-toast__title", children: descriptor.title })) : null, _jsx("span", { id: descriptionId, className: "hjm-toast__description", children: descriptor.description })] }), descriptor.action ? (_jsx("button", { type: "button", className: "hjm-toast__action", "aria-label": descriptor.action.accessibilityLabel, onClick: onAction, children: descriptor.action.label })) : null, _jsx("button", { type: "button", className: "hjm-toast__close", "aria-label": descriptor.closeLabel, onClick: () => onDismiss("close-action"), children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) })] }));
});
/** Controlled single-toast renderer; ToastProvider supplies the full FIFO lifecycle. */
export const Toast = forwardRef(function Toast({ descriptor, onDismissRequest, className }, ref) {
    const resolved = resolveToastDescriptor(descriptor);
    const actionInvokedRef = useRef(false);
    useEffect(() => {
        actionInvokedRef.current = false;
    }, [descriptor]);
    return (_jsx(ToastCard, { ref: ref, descriptor: resolved, phase: "visible", ...(className === undefined ? {} : { className }), onDismiss: onDismissRequest, onAction: () => {
            const action = resolved.action;
            if (!action || actionInvokedRef.current)
                return;
            actionInvokedRef.current = true;
            action.onAction();
            if (action.dismissOnAction)
                onDismissRequest("action");
        } }));
});
const ToastContext = createContext(null);
export function useToast() {
    const value = useContext(ToastContext);
    if (value === null)
        throw new Error("useToast must be used inside ToastProvider");
    return value;
}
function ToastPortal({ children, container }) {
    const [mounted, setMounted] = useState(false);
    const theme = useOptionalHjmTheme();
    useEffect(() => setMounted(true), []);
    if (!mounted)
        return null;
    return createPortal(theme ? (_jsx("div", { className: "hjm-root hjm-portal", "data-hjm-portal": "toast", "data-motion": theme.environment.reducedMotion ? "reduced" : "full", "data-theme": theme.environment.theme, "data-text-scale": theme.environment.textScale, dir: theme.environment.direction, style: createHjmThemeStyle(theme), children: children })) : children, container ?? document.body);
}
function renderStoreToast(snapshot, store, locale) {
    if (snapshot.phase !== "visible" && snapshot.phase !== "closing")
        return null;
    const id = snapshot.descriptor.id;
    return (_jsx(ToastCard, { descriptor: snapshot.descriptor, phase: snapshot.phase, ...(locale === undefined ? {} : { locale }), onAction: () => store.invokeAction(id), onDismiss: (reason) => store.dismiss(id, reason), onPointerPause: () => store.pause(id, "pointer"), onPointerResume: () => store.resume(id, "pointer"), onFocusPause: () => store.pause(id, "focus"), onFocusResume: () => store.resume(id, "focus") }, id));
}
export function ToastProvider({ children, label, placement = toastRecipe.defaults.placement, store, initialToasts = [], maxVisible, maxQueued, duplicatePolicy, timerUpdatePolicy, overflowPolicy, portalContainer, locale, bottomOffset = 0, hotkey, hotkeyHelp, }) {
    if (label.trim().length === 0)
        throw new TypeError("ToastProvider label must not be empty");
    if ((hotkey === undefined) !== (hotkeyHelp === undefined)) {
        throw new TypeError("ToastProvider hotkey and hotkeyHelp must be supplied together");
    }
    if (hotkey !== undefined && !hotkey.trim()) {
        throw new TypeError("ToastProvider hotkey must not be empty");
    }
    if (hotkeyHelp !== undefined && !hotkeyHelp.trim()) {
        throw new TypeError("ToastProvider hotkeyHelp must not be empty");
    }
    if (typeof bottomOffset === "number" && (!Number.isFinite(bottomOffset) || bottomOffset < 0)) {
        throw new RangeError("ToastProvider bottomOffset must be a non-negative finite number");
    }
    if (typeof bottomOffset === "string" && !bottomOffset.trim()) {
        throw new TypeError("ToastProvider bottomOffset must not be empty");
    }
    const internalStoreRef = useRef(null);
    const localeByIdRef = useRef(new Map());
    if (store === undefined && internalStoreRef.current === null) {
        internalStoreRef.current = createToastStore({
            ...(maxVisible === undefined ? {} : { maxVisible }),
            ...(maxQueued === undefined ? {} : { maxQueued }),
            ...(duplicatePolicy === undefined ? {} : { duplicatePolicy }),
            ...(timerUpdatePolicy === undefined ? {} : { timerUpdatePolicy }),
            ...(overflowPolicy === undefined ? {} : { overflowPolicy }),
        });
        for (const descriptor of initialToasts) {
            const result = internalStoreRef.current.publish(descriptor);
            if (locale !== undefined &&
                (result.outcome === "added" || result.outcome === "updated")) {
                localeByIdRef.current.set(descriptor.id, locale);
            }
        }
    }
    const activeStore = store ?? internalStoreRef.current;
    if (activeStore === null)
        throw new Error("ToastProvider could not create a store");
    const snapshot = useSyncExternalStore(activeStore.subscribe, activeStore.getSnapshot, activeStore.getSnapshot);
    const theme = useOptionalHjmTheme();
    const viewportRef = useRef(null);
    const previousFocusRef = useRef(null);
    const viewportFocusedRef = useRef(false);
    const hotkeyHelpId = useId().replaceAll(":", "");
    const api = useMemo(() => ({
        publish: (descriptor, options) => {
            const previousLocale = localeByIdRef.current.get(descriptor.id);
            if (locale === undefined)
                localeByIdRef.current.delete(descriptor.id);
            else
                localeByIdRef.current.set(descriptor.id, locale);
            try {
                const result = activeStore.publish(descriptor, options);
                if (result.outcome === "ignored" || result.outcome === "discarded") {
                    if (previousLocale === undefined)
                        localeByIdRef.current.delete(descriptor.id);
                    else
                        localeByIdRef.current.set(descriptor.id, previousLocale);
                }
                return result;
            }
            catch (error) {
                if (previousLocale === undefined)
                    localeByIdRef.current.delete(descriptor.id);
                else
                    localeByIdRef.current.set(descriptor.id, previousLocale);
                throw error;
            }
        },
        dismiss: (id, reason) => activeStore.dismiss(id, reason),
        close: (id) => activeStore.close(id),
    }), [activeStore, locale]);
    const disposalTimerRef = useRef(null);
    useEffect(() => {
        if (disposalTimerRef.current !== null) {
            clearTimeout(disposalTimerRef.current);
            disposalTimerRef.current = null;
        }
        const ownedStore = internalStoreRef.current;
        return () => {
            if (ownedStore) {
                disposalTimerRef.current = setTimeout(() => ownedStore.dispose(), 0);
            }
        };
    }, []);
    useEffect(() => {
        const activeIds = new Set([...snapshot.visible, ...snapshot.queued].map((entry) => entry.descriptor.id));
        for (const id of localeByIdRef.current.keys()) {
            if (!activeIds.has(id))
                localeByIdRef.current.delete(id);
        }
    }, [snapshot]);
    const hasRunningTimer = snapshot.visible.some((entry) => entry.timer.status === "running");
    useEffect(() => {
        if (!hasRunningTimer)
            return;
        let previousTime = performance.now();
        const timer = setInterval(() => {
            const currentTime = performance.now();
            activeStore.advanceTime(currentTime - previousTime);
            previousTime = currentTime;
        }, 100);
        return () => clearInterval(timer);
    }, [activeStore, hasRunningTimer]);
    const closingIds = snapshot.visible
        .filter((entry) => entry.phase === "closing")
        .map((entry) => entry.descriptor.id)
        .join("\u0000");
    useEffect(() => {
        if (closingIds.length === 0)
            return;
        const ids = closingIds.split("\u0000");
        const timer = setTimeout(() => ids.forEach((id) => activeStore.completeExit(id)), theme?.environment.reducedMotion ? 0 : 160);
        return () => clearTimeout(timer);
    }, [activeStore, closingIds, theme?.environment.reducedMotion]);
    useEffect(() => {
        const pause = () => activeStore.pauseAll("window");
        const resume = () => {
            if (!document.hidden)
                activeStore.resumeAll("window");
        };
        const handleVisibility = () => (document.hidden ? pause() : resume());
        window.addEventListener("blur", pause);
        window.addEventListener("focus", resume);
        window.addEventListener("pagehide", pause);
        window.addEventListener("pageshow", resume);
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            window.removeEventListener("blur", pause);
            window.removeEventListener("focus", resume);
            window.removeEventListener("pagehide", pause);
            window.removeEventListener("pageshow", resume);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [activeStore]);
    useEffect(() => {
        if (hotkey === undefined || snapshot.visible.length === 0)
            return;
        const handleKeyDown = (event) => {
            if (event.key !== hotkey)
                return;
            const viewport = viewportRef.current;
            if (!viewport)
                return;
            if (!viewport.contains(document.activeElement)) {
                previousFocusRef.current = document.activeElement;
            }
            event.preventDefault();
            viewport.focus();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [hotkey, snapshot.visible.length]);
    useEffect(() => {
        if (snapshot.visible.length > 0 || !viewportFocusedRef.current)
            return;
        viewportFocusedRef.current = false;
        previousFocusRef.current?.focus();
        previousFocusRef.current = null;
    }, [snapshot.visible.length]);
    const handleViewportFocus = (event) => {
        const previous = event.relatedTarget;
        if (previous instanceof HTMLElement && !event.currentTarget.contains(previous)) {
            previousFocusRef.current = previous;
        }
        viewportFocusedRef.current = true;
        activeStore.pauseAll("focus");
    };
    const handleViewportBlur = (event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
            viewportFocusedRef.current = false;
            activeStore.resumeAll("focus");
        }
    };
    const viewportStyle = {
        "--hjm-toast-bottom-offset": typeof bottomOffset === "number" ? `${bottomOffset}px` : bottomOffset,
    };
    return (_jsxs(ToastContext.Provider, { value: api, children: [children, snapshot.visible.length > 0 ? (_jsx(ToastPortal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsxs("div", { ref: viewportRef, className: "hjm-toast-viewport", "data-placement": placement, role: "region", "aria-label": label, "aria-describedby": hotkeyHelp === undefined ? undefined : hotkeyHelpId, "aria-keyshortcuts": hotkey, tabIndex: hotkey === undefined ? undefined : -1, onFocusCapture: handleViewportFocus, onBlurCapture: handleViewportBlur, style: viewportStyle, children: [hotkeyHelp === undefined ? null : (_jsx("span", { id: hotkeyHelpId, className: "hjm-visually-hidden", children: hotkeyHelp })), snapshot.visible.map((entry) => renderStoreToast(entry, activeStore, localeByIdRef.current.get(entry.descriptor.id)))] }) })) : null] }));
}
//# sourceMappingURL=toast.js.map