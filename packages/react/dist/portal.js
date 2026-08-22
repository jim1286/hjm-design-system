import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState, } from "react";
import { createPortal } from "react-dom";
/**
 * Copies the closest provider DOM boundary instead of importing provider
 * runtime code, keeping granular form/overlay entry points lightweight.
 */
function synchronizePortalEnvironment(host, anchor) {
    const source = anchor?.closest("[data-hjm-provider], [data-hjm-portal]") ?? null;
    const directModalOwner = anchor?.closest("[data-hjm-modal-content]") ?? null;
    const inheritedOwnerId = anchor
        ?.closest("[data-hjm-popup-owner]")
        ?.getAttribute("data-hjm-popup-owner") ?? null;
    const modalOwner = directModalOwner ??
        (inheritedOwnerId === null ? null : document.getElementById(inheritedOwnerId));
    if (modalOwner?.id)
        host.setAttribute("data-hjm-popup-owner", modalOwner.id);
    else
        host.removeAttribute("data-hjm-popup-owner");
    if (source) {
        host.removeAttribute("style");
        for (let index = 0; index < source.style.length; index += 1) {
            const property = source.style.item(index);
            if (property.startsWith("--hjm-") ||
                property === "background-color" ||
                property === "color" ||
                property === "color-scheme" ||
                property === "font-family" ||
                property === "font-size" ||
                property === "line-height") {
                host.style.setProperty(property, source.style.getPropertyValue(property), source.style.getPropertyPriority(property));
            }
        }
        for (const attribute of ["data-motion", "data-theme", "data-text-scale"]) {
            const value = source.getAttribute(attribute);
            if (value === null)
                host.removeAttribute(attribute);
            else
                host.setAttribute(attribute, value);
        }
        host.dir = source.dir;
        return;
    }
    host.removeAttribute("style");
    host.removeAttribute("data-motion");
    host.removeAttribute("data-theme");
    host.removeAttribute("data-text-scale");
    host.dir = anchor?.closest("[dir]")?.dir ?? "";
}
export function AnchoredPortal({ anchorRef, children, container, ssrFallback = "none", }) {
    const [mounted, setMounted] = useState(false);
    const hostRef = useRef(null);
    const setHostRef = useCallback((host) => {
        hostRef.current = host;
        if (host)
            synchronizePortalEnvironment(host, anchorRef.current);
    }, [anchorRef]);
    useEffect(() => setMounted(true), []);
    useEffect(() => {
        const host = hostRef.current;
        const source = anchorRef.current?.closest("[data-hjm-provider], [data-hjm-portal]") ?? null;
        if (!host || !source || typeof MutationObserver === "undefined")
            return;
        const observer = new MutationObserver(() => {
            synchronizePortalEnvironment(host, anchorRef.current);
        });
        observer.observe(source, {
            attributes: true,
            attributeFilter: ["data-motion", "data-theme", "data-text-scale", "dir", "style"],
        });
        return () => observer.disconnect();
    }, [anchorRef, mounted]);
    if (!mounted)
        return ssrFallback === "inline" ? children : null;
    return createPortal(_jsx("div", { ref: setHostRef, className: "hjm-root hjm-portal", "data-hjm-portal": "", children: children }), container ?? document.body);
}
const hiddenPopupPosition = {
    align: "start",
    placement: "bottom",
    style: {
        position: "fixed",
        inset: "auto",
        left: 0,
        top: 0,
        visibility: "hidden",
    },
};
function samePosition(previous, next) {
    return previous.align === next.align &&
        previous.placement === next.placement &&
        previous.style.left === next.style.left &&
        previous.style.top === next.style.top &&
        previous.style.minWidth === next.style.minWidth &&
        previous.style.maxWidth === next.style.maxWidth &&
        previous.style.maxHeight === next.style.maxHeight &&
        previous.style.zIndex === next.style.zIndex &&
        previous.style.visibility === next.style.visibility;
}
/**
 * Positions a fixed portal popup against its anchor using logical alignment.
 * The popup flips vertically and shifts horizontally to stay inside the visual
 * viewport, then follows every scroll/resize source that can move either node.
 */
export function useAnchoredPopup(anchorRef, popup, { align = "start", gap = 8, matchAnchorWidth = false, placement: preferredPlacement = "bottom", viewportPadding = 16, zIndex = 800, } = {}) {
    const [position, setPosition] = useState(() => ({
        ...hiddenPopupPosition,
        align,
    }));
    const update = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor || !popup || !anchor.isConnected || !popup.isConnected)
            return;
        const anchorRect = anchor.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const visualViewport = window.visualViewport;
        const viewportLeft = visualViewport?.offsetLeft ?? 0;
        const viewportTop = visualViewport?.offsetTop ?? 0;
        const viewportWidth = visualViewport?.width ?? window.innerWidth;
        const viewportHeight = visualViewport?.height ?? window.innerHeight;
        const viewportRight = viewportLeft + viewportWidth;
        const viewportBottom = viewportTop + viewportHeight;
        const availableBottom = Math.max(0, viewportBottom - viewportPadding - anchorRect.bottom - gap);
        const availableTop = Math.max(0, anchorRect.top - viewportTop - viewportPadding - gap);
        const availableLeft = Math.max(0, anchorRect.left - viewportLeft - viewportPadding - gap);
        const availableRight = Math.max(0, viewportRight - viewportPadding - anchorRect.right - gap);
        const maximumPopupHeight = Math.max(0, viewportHeight - (2 * viewportPadding));
        const maximumPopupWidth = Math.max(0, viewportWidth - (2 * viewportPadding));
        const desiredPopupHeight = Math.min(Math.max(popupRect.height, popup.scrollHeight), maximumPopupHeight);
        const desiredPopupWidth = Math.min(Math.max(popupRect.width, popup.scrollWidth, matchAnchorWidth ? anchorRect.width : 0), maximumPopupWidth);
        const direction = getComputedStyle(anchor).direction;
        const directModalOwner = anchor.closest("[data-hjm-modal-content]");
        const inheritedOwnerId = anchor
            .closest("[data-hjm-popup-owner]")
            ?.getAttribute("data-hjm-popup-owner") ?? null;
        const modalOwner = directModalOwner ??
            (inheritedOwnerId === null ? null : document.getElementById(inheritedOwnerId));
        const modalLayerValue = modalOwner
            ?.closest(".hjm-overlay")
            ?.style.zIndex ?? "";
        const modalLayer = Number.parseInt(modalLayerValue, 10);
        const resolvedZIndex = Number.isFinite(modalLayer) ? modalLayer + 1 : zIndex;
        const logicalStartAtLeft = direction !== "rtl";
        const preferredPhysicalPlacement = preferredPlacement === "start"
            ? (logicalStartAtLeft ? "left" : "right")
            : preferredPlacement === "end"
                ? (logicalStartAtLeft ? "right" : "left")
                : preferredPlacement;
        let physicalPlacement = preferredPhysicalPlacement;
        if (physicalPlacement === "bottom" &&
            desiredPopupHeight > availableBottom &&
            availableTop > availableBottom)
            physicalPlacement = "top";
        else if (physicalPlacement === "top" &&
            desiredPopupHeight > availableTop &&
            availableBottom > availableTop)
            physicalPlacement = "bottom";
        else if (physicalPlacement === "left" &&
            desiredPopupWidth > availableLeft &&
            availableRight > availableLeft)
            physicalPlacement = "right";
        else if (physicalPlacement === "right" &&
            desiredPopupWidth > availableRight &&
            availableLeft > availableRight)
            physicalPlacement = "left";
        const placement = physicalPlacement === "left"
            ? (logicalStartAtLeft ? "start" : "end")
            : physicalPlacement === "right"
                ? (logicalStartAtLeft ? "end" : "start")
                : physicalPlacement;
        const availableHeight = physicalPlacement === "bottom"
            ? availableBottom
            : physicalPlacement === "top"
                ? availableTop
                : maximumPopupHeight;
        const availableWidth = physicalPlacement === "left"
            ? availableLeft
            : physicalPlacement === "right"
                ? availableRight
                : maximumPopupWidth;
        const popupHeight = Math.min(desiredPopupHeight, Math.max(0, availableHeight));
        const popupWidth = Math.min(desiredPopupWidth, Math.max(0, availableWidth));
        const alignLeftEdge = align === "start" ? logicalStartAtLeft : !logicalStartAtLeft;
        const inlineAlignedLeft = align === "center"
            ? anchorRect.left + ((anchorRect.width - popupWidth) / 2)
            : alignLeftEdge
                ? anchorRect.left
                : anchorRect.right - popupWidth;
        const blockAlignedTop = align === "center"
            ? anchorRect.top + ((anchorRect.height - popupHeight) / 2)
            : align === "start"
                ? anchorRect.top
                : anchorRect.bottom - popupHeight;
        const desiredLeft = physicalPlacement === "left"
            ? anchorRect.left - gap - popupWidth
            : physicalPlacement === "right"
                ? anchorRect.right + gap
                : inlineAlignedLeft;
        const maximumLeft = Math.max(viewportLeft + viewportPadding, viewportRight - viewportPadding - popupWidth);
        const left = Math.min(Math.max(desiredLeft, viewportLeft + viewportPadding), maximumLeft);
        const desiredTop = physicalPlacement === "bottom"
            ? anchorRect.bottom + gap
            : physicalPlacement === "top"
                ? anchorRect.top - gap - popupHeight
                : blockAlignedTop;
        const maximumTop = Math.max(viewportTop + viewportPadding, viewportBottom - viewportPadding - popupHeight);
        const top = Math.min(Math.max(desiredTop, viewportTop + viewportPadding), maximumTop);
        const next = {
            align,
            placement,
            style: {
                position: "fixed",
                inset: "auto",
                left: Math.round(left),
                top: Math.round(top),
                minWidth: matchAnchorWidth
                    ? Math.round(Math.min(anchorRect.width, availableWidth, maximumPopupWidth))
                    : undefined,
                maxWidth: Math.max(0, availableWidth),
                maxHeight: Math.max(0, availableHeight),
                visibility: "visible",
                zIndex: resolvedZIndex,
            },
        };
        setPosition((previous) => samePosition(previous, next) ? previous : next);
    }, [
        align,
        anchorRef,
        gap,
        matchAnchorWidth,
        popup,
        preferredPlacement,
        viewportPadding,
        zIndex,
    ]);
    useEffect(() => {
        if (!popup) {
            setPosition({ ...hiddenPopupPosition, align });
            return;
        }
        update();
        const frame = requestAnimationFrame(update);
        const handleViewportChange = () => update();
        window.addEventListener("resize", handleViewportChange);
        window.addEventListener("scroll", handleViewportChange, true);
        window.visualViewport?.addEventListener("resize", handleViewportChange);
        window.visualViewport?.addEventListener("scroll", handleViewportChange);
        const resizeObserver = typeof ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(update);
        if (anchorRef.current)
            resizeObserver?.observe(anchorRef.current);
        resizeObserver?.observe(popup);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
            window.visualViewport?.removeEventListener("resize", handleViewportChange);
            window.visualViewport?.removeEventListener("scroll", handleViewportChange);
            resizeObserver?.disconnect();
        };
    }, [align, anchorRef, popup, update]);
    return position;
}
//# sourceMappingURL=portal.js.map