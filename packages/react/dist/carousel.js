"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState, forwardRef } from "react";
import { resolveCarouselDescriptor, getCarouselNavigationTarget, isCarouselAutoplayActive, resolvePageIndicator, getPageIndicatorTarget, } from "@hjmds/design-contracts/components/carousel";
import { Button, IconButton } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import { assignRef, classNames, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
/** The dot buttons shared by Carousel and PageIndicator, so both rows keep one markup and one recipe. */
function PageDots({ dots, onSelect, dotClassName, keys }) {
    return _jsx(_Fragment, { children: dots.map((dot) => _jsx("button", { type: "button", "aria-label": dot.accessibleName, "aria-disabled": dot.current, "data-current": dot.current, className: dotClassName, onClick: () => onSelect(dot.index), children: _jsx("span", { "aria-hidden": "true" }) }, keys?.[dot.index] ?? dot.index)) });
}
/**
 * Carousel's position dots for a product-owned pager (scroll-snap row, virtualized pager). Arrow keys on a dot move
 * one page in reading direction, as in Carousel's controls.
 */
export const PageIndicator = forwardRef(function PageIndicator({ label, count, currentIndex, maxVisibleDots, interactive = true, density = "comfortable", onCurrentIndexChange, composeAccessibleName, className, onKeyDown, onFocusCapture, layoutStyle, ...props }, ref) {
    const theme = useOptionalHjmTheme();
    const host = useRef(null);
    const lastFocused = useRef(null);
    useLayoutEffect(() => {
        // Moving the bounded window can remove the focused dot. Recover within the same control only when
        // removal left focus on body; a user who moved elsewhere keeps that focus.
        if (interactive && lastFocused.current && !lastFocused.current.isConnected && document.activeElement === document.body) {
            host.current?.querySelector('.hjm-page-indicator__dot[data-current="true"]')?.focus();
        }
    }, [interactive, count, currentIndex, maxVisibleDots]);
    if (!label.trim())
        throw new TypeError("PageIndicator label must not be empty");
    const descriptor = { count, currentIndex, ...(maxVisibleDots === undefined ? {} : { maxVisibleDots }) };
    const dots = resolvePageIndicator(descriptor, composeAccessibleName);
    const current = dots.find(dot => dot.current);
    return _jsx("div", { ...props, ref: node => { host.current = node; assignRef(ref, node); }, style: { ...props.style, ...layoutStyle }, role: interactive ? "group" : "img", "aria-label": interactive ? label : current.accessibleName, "data-interactive": interactive, "data-density": density, className: classNames("hjm-page-indicator", className), onFocusCapture: event => {
            lastFocused.current = event.target instanceof HTMLElement ? event.target : null;
            onFocusCapture?.(event);
        }, onKeyDown: (event) => {
            onKeyDown?.(event);
            if (!interactive || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
                return;
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                return;
            event.preventDefault();
            onCurrentIndexChange(getPageIndicatorTarget(descriptor, (event.key === "ArrowRight") !== (theme?.environment.direction === "rtl") ? "next" : "previous"));
        }, children: interactive ? _jsx(PageDots, { dots: dots, onSelect: onCurrentIndexChange, dotClassName: "hjm-page-indicator__dot" })
            : dots.map(dot => _jsx("span", { "aria-hidden": "true", "data-current": dot.current, className: "hjm-page-indicator__marker", children: _jsx("span", {}) }, dot.index)) });
});
/** Finite keyed cards. Hidden slides stay mounted but cannot receive focus. */
export const Carousel = forwardRef(function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay, currentKey, defaultCurrentKey, onCurrentKeyChange, className, onFocusCapture, onMouseEnter, onMouseLeave, onKeyDown, layoutStyle, slideMaxHeight, ...props }, ref) {
    const theme = useOptionalHjmTheme();
    const [storedCurrent, setCurrent] = useControllableState({
        ...(currentKey === undefined ? {} : { value: currentKey }),
        defaultValue: defaultCurrentKey ?? slides[0]?.id ?? "",
        ...(onCurrentKeyChange === undefined ? {} : { onChange: onCurrentKeyChange }),
    });
    const previousIndex = useRef(null);
    const host = useRef(null);
    const lastFocused = useRef(null);
    // A host can delete the current uncontrolled slide after mount. Keep its place
    // in the collection (or the new last slide); explicit invalid keys still fail validation.
    const recovering = currentKey === undefined && previousIndex.current !== null && !slides.some(slide => slide.id === storedCurrent);
    const current = recovering ? slides[Math.min(previousIndex.current, slides.length - 1)]?.id ?? storedCurrent : storedCurrent;
    useLayoutEffect(() => {
        previousIndex.current = slides.findIndex(slide => slide.id === current);
        if (recovering) {
            setCurrent(current);
            // A removed dot/card can strand focus on body; retained controls keep their focus.
            if (lastFocused.current && !lastFocused.current.isConnected && document.activeElement === document.body) {
                host.current?.querySelector('.hjm-carousel__dot[data-current="true"]')?.focus();
            }
        }
    }, [current, recovering, slides, setCurrent]);
    const descriptor = { slides, currentKey: current, ...(autoplay ? { autoplay } : {}) };
    const resolved = resolveCarouselDescriptor(descriptor, { composeAccessibleName });
    if (!label.trim() || Object.values(labels).some((value) => !value.trim()))
        throw new TypeError("Carousel labels must not be empty");
    if (slideMaxHeight !== undefined && (!Number.isFinite(slideMaxHeight) || slideMaxHeight <= 0))
        throw new TypeError("Carousel slideMaxHeight must be finite and positive");
    const [rotating, setRotating] = useState(autoplay !== undefined);
    const [hovered, setHovered] = useState(false);
    const [hidden, setHidden] = useState(false);
    const pointerRotation = useRef(null);
    const last = current === slides.at(-1).id;
    const playing = isCarouselAutoplayActive(autoplay, {
        reducedMotion: theme?.environment.reducedMotion ?? false,
        paused: !rotating || hovered || hidden || last,
    });
    useEffect(() => {
        const update = () => setHidden(document.hidden);
        update();
        document.addEventListener("visibilitychange", update);
        return () => document.removeEventListener("visibilitychange", update);
    }, []);
    useEffect(() => {
        if (!playing || !autoplay)
            return;
        const timer = setTimeout(() => setCurrent(getCarouselNavigationTarget(descriptor, "next")), autoplay.intervalMs);
        return () => clearTimeout(timer);
    }, [playing, autoplay?.intervalMs, current, slides, setCurrent]);
    function select(key) { setRotating(false); if (key !== current)
        setCurrent(key); }
    function move(intent) { select(getCarouselNavigationTarget(descriptor, intent)); }
    const rotationRequested = rotating && !last && !theme?.environment.reducedMotion;
    return _jsxs("div", { ...props, style: { ...props.style, ...layoutStyle }, ref: node => { host.current = node; assignRef(ref, node); }, role: "region", "aria-label": label, "aria-roledescription": "carousel", className: classNames("hjm-carousel", className), "data-large-text": isLargeTextScale(theme?.environment.textScale ?? 1), onFocusCapture: (event) => {
            lastFocused.current = event.target instanceof HTMLElement ? event.target : null;
            // APG: leaving focus must not silently restart rotation. Explicit resume is required.
            if (!event.currentTarget.contains(event.relatedTarget))
                setRotating(false);
            onFocusCapture?.(event);
        }, onMouseEnter: (event) => { setHovered(true); onMouseEnter?.(event); }, onMouseLeave: (event) => { setHovered(false); onMouseLeave?.(event); }, onKeyDown: (event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
                return;
            // Do not steal editing/navigation keys from links, inputs or widgets inside a card.
            if (!(event.target instanceof Element) || !event.target.closest("[data-carousel-controls]"))
                return;
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                return;
            event.preventDefault();
            move((event.key === "ArrowRight") !== (theme?.environment.direction === "rtl") ? "next" : "previous");
        }, children: [autoplay ? _jsx(Button, { tone: "ghost", className: "hjm-carousel__rotation", disabled: theme?.environment.reducedMotion, onPointerDown: () => { pointerRotation.current = !rotationRequested; }, onPointerCancel: () => { pointerRotation.current = null; }, onClick: (event) => {
                    // An abandoned pointer gesture must not override a later keyboard activation.
                    const next = event.detail > 0 ? pointerRotation.current ?? !rotationRequested : !rotationRequested;
                    pointerRotation.current = null;
                    if (next && last)
                        setCurrent(slides[0].id);
                    setRotating(next);
                }, children: rotationRequested ? labels.pause : labels.resume }) : null, _jsx("div", { className: "hjm-carousel__track", "aria-live": playing ? "off" : "polite", "aria-atomic": false, children: resolved.map((slide) => _jsx("div", { className: "hjm-carousel__slide", role: "group", "aria-roledescription": "slide", "aria-label": slide.accessibleName, hidden: slide.inert, inert: slide.inert, tabIndex: slideMaxHeight === undefined ? undefined : 0, style: slideMaxHeight === undefined ? undefined : { maxHeight: slideMaxHeight, overflowY: "auto" }, children: renderSlide(slide) }, slide.id)) }), _jsxs("div", { className: "hjm-carousel__controls", "data-carousel-controls": true, role: "group", "aria-label": labels.navigation, children: [_jsx(IconButton, { label: labels.previous, tone: "ghost", "aria-disabled": current === slides[0].id, onClick: () => move("previous"), children: _jsx(Icon, { name: "chevronStart" }) }), _jsx("div", { className: "hjm-carousel__dots", children: _jsx(PageDots, { dotClassName: "hjm-carousel__dot", keys: slides.map((slide) => slide.id), onSelect: (index) => select(slides[index].id), dots: resolvePageIndicator({ count: slides.length, currentIndex: resolved.findIndex((slide) => slide.current) }, ({ position }) => resolved[position - 1].accessibleName) }) }), _jsx(IconButton, { label: labels.next, tone: "ghost", "aria-disabled": last, onClick: () => move("next"), children: _jsx(Icon, { name: "chevronEnd" }) })] })] });
});
//# sourceMappingURL=carousel.js.map