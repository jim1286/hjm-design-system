import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import { createToastStore, createToastSession, resolveToastDescriptor, } from "@hjmds/design-contracts/components/toast";
import { toastRecipe, } from "@hjmds/design-contracts/recipes";
import { glyph } from "@hjmds/design-contracts/foundations";
import { createContext, forwardRef, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, } from "react";
import { createPortal } from "react-dom";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";
// 1.10.0: stroked SVG glyphs inside a tinted badge (toastRecipe.icon). Text glyphs ("●", "i", "!") rendered at
// font metrics, so neutral read as a stray grey dot and info/danger looked like typos. currentColor = tone accent.
// The close glyph box is the size toastRecipe.close.inlineOverhang is derived from (2026-10-17 alignment fix).
const closeGlyphSize = glyph[toastRecipe.close.glyph];
const toneGlyphPaths = {
    notifications: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
    info: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    success: "M20 6 9 17l-5-5",
    warning: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01",
    alert: "M12 8v4M12 16h.01M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86Z",
};
function ToneGlyph({ tone }) {
    return (_jsx("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", focusable: "false", children: _jsx("path", { d: toneGlyphPaths[toastRecipe.tones[tone].mark] }) }));
}
// Steps read as an ordered list with `aria-current="step"`; the dots are decoration beside each label,
// so state never depends on colour alone (WCAG 1.4.1).
function ToastProgress({ progress }) {
    return (_jsx("ol", { className: "hjm-toast__progress", children: progress.steps.map((step, index) => {
            const state = index < progress.current ? "done" : index === progress.current ? "current" : "upcoming";
            return (_jsxs("li", { className: "hjm-toast__progress-step", "data-state": state, "aria-current": state === "current" ? "step" : undefined, children: [_jsx("span", { className: "hjm-toast__progress-dot", "aria-hidden": "true" }), _jsx("span", { className: "hjm-toast__progress-label", children: step })] }, `${index}-${step}`));
        }) }));
}
const ToastCard = forwardRef(function ToastCard({ descriptor, phase, onAction, onPress, onDismiss, onPointerPause, onPointerResume, onFocusPause, onFocusResume, locale, className, htmlProps, }, ref) {
    const baseId = useId().replaceAll(":", "");
    const titleId = `${baseId}-toast-title`;
    const descriptionId = `${baseId}-toast-description`;
    const handleKeyDown = (event) => {
        htmlProps?.onKeyDown?.(event);
        if (event.key === "Escape") {
            event.preventDefault();
            onDismiss("escape");
        }
    };
    return (_jsxs("div", { ...htmlProps, ref: ref, className: classNames("hjm-toast", className), "data-tone": descriptor.tone, "data-state": phase, lang: locale ?? htmlProps?.lang, role: "group", "aria-labelledby": descriptor.title ? titleId : undefined, "aria-describedby": descriptionId, onPointerEnter: (event) => { htmlProps?.onPointerEnter?.(event); onPointerPause?.(); }, onPointerLeave: (event) => { htmlProps?.onPointerLeave?.(event); onPointerResume?.(); }, onFocusCapture: (event) => { htmlProps?.onFocusCapture?.(event); onFocusPause?.(); }, onBlurCapture: (event) => {
            htmlProps?.onBlurCapture?.(event);
            if (!event.currentTarget.contains(event.relatedTarget))
                onFocusResume?.();
        }, onKeyDown: handleKeyDown, children: [_jsx("span", { className: "hjm-visually-hidden", role: descriptor.priority === "high" ? "alert" : "status", children: descriptor.announcement }), descriptor.press ? (
            // A sibling button covers the card without nesting action/close buttons in a button.
            _jsx("button", { type: "button", className: "hjm-toast__press", "aria-label": descriptor.press.accessibilityLabel, "aria-describedby": descriptionId, disabled: phase !== "visible", onClick: onPress })) : null, descriptor.media === null ? (_jsx("span", { className: "hjm-toast__icon", "aria-hidden": "true", children: _jsx(ToneGlyph, { tone: descriptor.tone }) })) : (
            // Product media (mascot, avatar) takes the badge column; it is decorative, the copy carries meaning.
            _jsx("span", { className: "hjm-toast__media", "aria-hidden": "true", children: descriptor.media })), _jsxs("span", { className: "hjm-toast__content", children: [descriptor.title ? (_jsx("strong", { id: titleId, className: "hjm-toast__title", children: descriptor.title })) : null, _jsx("span", { id: descriptionId, className: "hjm-toast__description", children: descriptor.description }), descriptor.progress ? _jsx(ToastProgress, { progress: descriptor.progress }) : null] }), descriptor.action ? (_jsx("button", { type: "button", className: "hjm-toast__action", "aria-label": descriptor.action.accessibilityLabel, onClick: onAction, children: descriptor.action.label })) : null, _jsx("button", { type: "button", className: "hjm-toast__close", "aria-label": descriptor.closeLabel, onClick: () => onDismiss("close-action"), children: _jsx("svg", { "aria-hidden": "true", viewBox: "0 0 24 24", width: closeGlyphSize, height: closeGlyphSize, fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", focusable: "false", children: _jsx("path", { d: "M18 6 6 18M6 6l12 12" }) }) })] }));
});
/** Controlled single-toast renderer; ToastProvider supplies the full FIFO lifecycle. */
export const Toast = forwardRef(function Toast(
// Until 2026-10-06 only `className` reached the DOM although the type accepts every div attribute,
// so `id`, `data-*` and handlers were dropped silently. Narrowing the type instead would break
// consumers that already pass them, so the rest is forwarded (the card keeps its own role/labelling).
{ descriptor, onDismissRequest, className, ...htmlProps }, ref) {
    const resolved = resolveToastDescriptor(descriptor);
    // Controlled rendering leaves timing/removal to the host, but shares the store's
    // once-per-revision invocation and callback-then-dismiss semantics.
    const session = useMemo(() => {
        const next = createToastSession(descriptor);
        next.show();
        return next;
    }, [descriptor]);
    const invoke = (kind) => {
        if (session.getSnapshot().phase !== "visible")
            return;
        try {
            if (kind === "press")
                session.invokePress();
            else
                session.invokeAction();
        }
        finally {
            const snapshot = session.getSnapshot();
            if (snapshot.phase === "closing" && snapshot.dismissReason) {
                onDismissRequest(snapshot.dismissReason);
            }
        }
    };
    return (_jsx(ToastCard, { ref: ref, descriptor: resolved, phase: "visible", ...(className === undefined ? {} : { className }), htmlProps: htmlProps, onDismiss: (reason) => { session.dismiss(reason); onDismissRequest(reason); }, onAction: () => invoke("action"), onPress: () => invoke("press") }));
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
    return createPortal(theme ? (_jsx("div", { className: "hjm-root hjm-portal", "data-hjm-portal": "toast", "data-motion": theme.environment.reducedMotion ? "reduced" : "full", "data-theme": theme.environment.theme, "data-text-scale": theme.environment.textScale, "data-large-text": isLargeTextScale(theme.environment.textScale) ? "true" : undefined, dir: theme.environment.direction, style: createHjmThemeStyle(theme), children: children })) : children, container ?? document.body);
}
function renderStoreToast(snapshot, store, locale) {
    if (snapshot.phase !== "visible" && snapshot.phase !== "closing")
        return null;
    const id = snapshot.descriptor.id;
    return (_jsx(ToastCard, { descriptor: snapshot.descriptor, phase: snapshot.phase, ...(locale === undefined ? {} : { locale }), onAction: () => store.invokeAction(id), onPress: () => store.invokePress(id), onDismiss: (reason) => store.dismiss(id, reason), onPointerPause: () => store.pause(id, "pointer"), onPointerResume: () => store.resume(id, "pointer"), onFocusPause: () => store.pause(id, "focus"), onFocusResume: () => store.resume(id, "focus") }, id));
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
        // A provider may mount while its tab is already hidden, before any change event.
        handleVisibility();
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