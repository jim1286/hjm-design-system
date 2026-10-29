"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { forwardRef, useRef, useState } from "react";
import { circularPhotoCoverScale, circularPhotoCropRecipe, clampCircularPhotoCrop, imageViewerTriggerRecipe, resolveCircularPhotoCrop, validateImageViewerTriggerLabel } from "@hjmds/design-contracts/components/image";
import { classNames } from "./internal.js";
import { HjmPortal, getModalLayer, useModalFocus } from "./modal.js";
import { Button, IconButton } from "./actions.js";
/**
 * Button around product media that opens ImageViewer. The product keeps the viewer's `open` state and calls it from
 * `onClick`; the trigger owns the name, focus ring on the image frame radius, zoom cursor and pressed opacity.
 */
export const ImageViewerTrigger = forwardRef(function ImageViewerTrigger({ label, children, className, layoutStyle, ...props }, ref) {
    validateImageViewerTriggerLabel(label);
    return _jsx("button", { ...props, ref: ref, type: "button", "aria-label": label, "aria-haspopup": "dialog", className: classNames("hjm-image-viewer-trigger", className), style: { ...layoutStyle, "--hjm-image-viewer-trigger-pressed-opacity": imageViewerTriggerRecipe.pressedOpacity,
            "--hjm-image-viewer-trigger-disabled-opacity": imageViewerTriggerRecipe.disabledOpacity,
            "--hjm-image-viewer-trigger-cursor": imageViewerTriggerRecipe.cursor }, children: children });
});
/** Full viewport photo presentation; shares modal isolation, focus return and Escape with Dialog. */
export function ImageViewer(props) {
    if (!props.open)
        return null;
    if (!props.items.length || new Set(props.items.map(item => item.id)).size !== props.items.length ||
        props.items.some(item => !item.id.trim() || !item.uri.trim() || !item.label.trim()) ||
        [props.closeLabel, props.previousLabel, props.nextLabel, props.loadingLabel, props.errorLabel, props.retryLabel].some(label => !label.trim()) ||
        !Number.isInteger(props.initialIndex ?? 0) || (props.initialIndex ?? 0) < 0 || (props.initialIndex ?? 0) >= props.items.length)
        throw new TypeError("ImageViewer needs named images, localized controls and a valid index");
    return _jsx(ViewerSession, { ...props }, JSON.stringify(props.items.map(item => [item.id, item.uri])));
}
/**
 * 2026-10-30 user request, a default for every product: pulling an unzoomed photo down closes the viewer, like
 * photo viewers elsewhere (Native shares the thresholds). Touch and pen only; a mouse keeps the button and Escape.
 */
const PULL_CLOSE_DISTANCE = 120;
const PULL_CLOSE_VELOCITY = 0.9; // px per ms
function ViewerSession(props) {
    const contentRef = useRef(null), closeRef = useRef(null);
    const [index, setIndex] = useState(props.initialIndex ?? 0);
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
    const pointers = useRef(new Map());
    const pullStart = useRef(null);
    const [pull, setPull] = useState(0);
    const [settling, setSettling] = useState(false);
    const item = props.items[index];
    useModalFocus({ active: true, contentRef, initialFocusRef: closeRef, onEscape: props.onClose });
    const move = (next) => { pointers.current.clear(); setView({ scale: 1, x: 0, y: 0 }); setIndex(next); props.onIndexChange?.(next); };
    const clamp = (scale, x = view.x, y = view.y) => {
        const bounds = contentRef.current?.querySelector(".hjm-image-viewer__stage")?.getBoundingClientRect();
        const image = contentRef.current?.querySelector('img');
        const fit = image?.naturalWidth && bounds ? Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight) : 1;
        const imageWidth = image?.naturalWidth ? image.naturalWidth * fit : bounds?.width ?? 0;
        const imageHeight = image?.naturalHeight ? image.naturalHeight * fit : bounds?.height ?? 0;
        const limitX = Math.max(0, imageWidth * scale - (bounds?.width ?? 0)) / 2;
        const limitY = Math.max(0, imageHeight * scale - (bounds?.height ?? 0)) / 2;
        setView({ scale, x: Math.max(-limitX, Math.min(limitX, x)), y: Math.max(-limitY, Math.min(limitY, y)) });
    };
    const pointerMove = (event) => {
        const old = pointers.current.get(event.pointerId);
        if (!old)
            return;
        if (pullStart.current?.id === event.pointerId && pointers.current.size === 1) {
            pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
            setPull(Math.max(0, event.clientY - pullStart.current.y));
            return;
        }
        const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (other) {
            const before = Math.hypot(old.x - other.x, old.y - other.y);
            if (before > 0)
                clamp(Math.max(1, Math.min(4, view.scale * Math.hypot(event.clientX - other.x, event.clientY - other.y) / before)));
        }
        else if (view.scale > 1)
            clamp(view.scale, view.x + event.clientX - old.x, view.y + event.clientY - old.y);
    };
    return _jsx(HjmPortal, { children: _jsxs("div", { className: "hjm-image-viewer", style: { zIndex: getModalLayer(0) }, ref: contentRef, role: "dialog", "aria-modal": "true", "aria-label": item.label, "data-hjm-modal-content": "", tabIndex: -1, children: [_jsxs("div", { className: "hjm-image-viewer__header", style: { opacity: 1 - 0.8 * Math.min(1, pull / PULL_CLOSE_DISTANCE) }, children: [_jsx(IconButton, { ref: closeRef, label: props.closeLabel, tone: "ghost", onClick: props.onClose, children: "\u00D7" }), props.actions ? _jsx("div", { className: "hjm-image-viewer__actions", children: props.actions }) : null] }), _jsx("div", { className: "hjm-image-viewer__stage", onDoubleClick: () => clamp(view.scale === 1 ? 2 : 1, 0, 0), onPointerDown: event => {
                        if (event.target.closest("button"))
                            return;
                        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setSettling(false);
                        // A second finger turns the gesture into a pinch; only a lone touch at the resting scale can pull.
                        pullStart.current = pointers.current.size === 1 && view.scale === 1 && event.pointerType !== "mouse"
                            ? { id: event.pointerId, y: event.clientY, time: event.timeStamp } : null;
                        if (!pullStart.current)
                            setPull(0);
                    }, onPointerMove: pointerMove, onPointerUp: event => {
                        pointers.current.delete(event.pointerId);
                        const start = pullStart.current;
                        if (start?.id !== event.pointerId)
                            return;
                        pullStart.current = null;
                        const distance = event.clientY - start.y;
                        if (distance > PULL_CLOSE_DISTANCE || (distance > 0 && distance / Math.max(1, event.timeStamp - start.time) > PULL_CLOSE_VELOCITY))
                            props.onClose();
                        else {
                            setSettling(true);
                            setPull(0);
                        }
                    }, onPointerCancel: event => { pointers.current.delete(event.pointerId); if (pullStart.current?.id === event.pointerId) {
                        pullStart.current = null;
                        setSettling(true);
                        setPull(0);
                    } }, onKeyDown: event => {
                        if (event.key === "+" || event.key === "=") {
                            event.preventDefault();
                            clamp(Math.min(4, view.scale + 1));
                        }
                        if (event.key === "-") {
                            event.preventDefault();
                            clamp(Math.max(1, view.scale - 1));
                        }
                        if (event.key.startsWith('Arrow')) {
                            event.preventDefault();
                            if (view.scale > 1)
                                clamp(view.scale, view.x + (event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0), view.y + (event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0));
                            else if (event.key === 'ArrowLeft' && index > 0)
                                move(index - 1);
                            else if (event.key === 'ArrowRight' && index + 1 < props.items.length)
                                move(index + 1);
                        }
                    }, tabIndex: 0, "aria-label": item.label, children: _jsx("div", { className: "hjm-image-viewer__image", style: { transform: `translate(${view.x}px, ${view.y + pull}px) scale(${view.scale * (1 - 0.15 * Math.min(1, pull / (PULL_CLOSE_DISTANCE * 3)))})`,
                            transition: settling ? "transform 200ms ease-out" : "none" }, children: props.renderImage ? props.renderImage(item) : _jsx(ViewerImage, { item: item, ...props }, item.uri) }) }), _jsxs("div", { className: "hjm-image-viewer__footer", style: { opacity: 1 - 0.8 * Math.min(1, pull / PULL_CLOSE_DISTANCE) }, children: [props.items.length > 1 ? _jsx(IconButton, { label: props.previousLabel, tone: "ghost", disabled: index === 0, onClick: () => move(index - 1), children: "\u2039" }) : null, _jsxs("span", { "aria-live": "polite", children: [item.label, props.items.length > 1 ? ` · ${index + 1}/${props.items.length}` : ""] }), props.items.length > 1 ? _jsx(IconButton, { label: props.nextLabel, tone: "ghost", disabled: index === props.items.length - 1, onClick: () => move(index + 1), children: "\u203A" }) : null] })] }) });
}
function ViewerImage({ item, loadingLabel, errorLabel, retryLabel }) {
    const [attempt, setAttempt] = useState(0);
    // A retry retires the whole host, so an old image callback cannot mark a new attempt ready.
    return _jsx(ImageAttempt, { item: item, loadingLabel: loadingLabel, errorLabel: errorLabel, retryLabel: retryLabel, onRetry: () => setAttempt(n => n + 1) }, attempt);
}
function ImageAttempt({ item, loadingLabel, errorLabel, retryLabel, onRetry }) {
    const [status, setStatus] = useState("loading");
    return _jsxs(_Fragment, { children: [_jsx("img", { src: item.uri, alt: item.label, draggable: false, onLoad: () => setStatus(current => current === 'error' ? current : 'ready'), onError: () => setStatus("error") }), status === "loading" ? _jsx("span", { role: "status", children: loadingLabel }) : status === "error" ? _jsxs("div", { role: "alert", children: [errorLabel, _jsx("button", { type: "button", onClick: onRetry, children: retryLabel })] }) : null] });
}
/**
 * Instagram-style circular framing for profile photos (2026-10-29 user rule, all apps and web): drag to move, wheel or
 * pinch to zoom inside a circular mask on the black photo surface. Same geometry as Native (contract functions).
 */
export function CircularPhotoCropper(props) {
    if (!props.open)
        return null;
    if ([props.title, props.confirmLabel, props.cancelLabel].some(label => !label.trim()) || !props.source.uri.trim() ||
        !(props.source.width > 0 && props.source.height > 0))
        throw new TypeError("CircularPhotoCropper needs labels and a sized source");
    return _jsx(CropSession, { ...props }, props.source.uri);
}
function CropSession({ source, title, hint, confirmLabel, cancelLabel, busy = false, onCancel, onConfirm }) {
    const contentRef = useRef(null), cancelRef = useRef(null);
    const [viewport, setViewport] = useState(0);
    const [state, setState] = useState({ zoom: 1, x: 0, y: 0 });
    const pointers = useRef(new Map());
    useModalFocus({ active: true, contentRef, initialFocusRef: cancelRef, onEscape: () => { if (!busy)
            onCancel(); } });
    const update = (next) => { if (viewport > 0)
        setState(clampCircularPhotoCrop(next, source.width, source.height, viewport)); };
    const cover = viewport > 0 ? circularPhotoCoverScale(source.width, source.height, viewport) : 0;
    return _jsx(HjmPortal, { children: _jsxs("div", { className: "hjm-image-viewer hjm-photo-cropper", style: { zIndex: getModalLayer(0) }, ref: contentRef, role: "dialog", "aria-modal": "true", "aria-label": title, "data-hjm-modal-content": "", tabIndex: -1, children: [_jsx("div", { className: "hjm-image-viewer__header hjm-photo-cropper__title", children: _jsx("h2", { children: title }) }), _jsx("div", { className: "hjm-image-viewer__stage hjm-photo-cropper__stage", "aria-label": hint ?? title, ref: node => { if (node && !viewport) {
                        const box = node.getBoundingClientRect();
                        setViewport(Math.max(1, Math.min(box.width - circularPhotoCropRecipe.gutter * 2, box.height - circularPhotoCropRecipe.gutter * 2)));
                    } }, onWheel: event => update({ ...state, zoom: state.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1), x: state.x, y: state.y }), onPointerDown: event => { pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId); }, onPointerMove: event => {
                        const previous = pointers.current.get(event.pointerId);
                        if (!previous)
                            return;
                        const others = [...pointers.current.entries()].filter(([id]) => id !== event.pointerId).map(([, point]) => point);
                        if (others.length) {
                            // Two-finger pinch: zoom by the change in finger distance around the circle centre.
                            const other = others[0], before = Math.hypot(previous.x - other.x, previous.y - other.y), after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
                            const zoom = before > 0 ? state.zoom * after / before : state.zoom;
                            update({ zoom, x: state.x * zoom / state.zoom, y: state.y * zoom / state.zoom });
                        }
                        else
                            update({ ...state, x: state.x + event.clientX - previous.x, y: state.y + event.clientY - previous.y });
                        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                    }, onPointerUp: event => pointers.current.delete(event.pointerId), onPointerCancel: event => pointers.current.delete(event.pointerId), children: viewport > 0 ? _jsxs(_Fragment, { children: [_jsx("img", { src: source.uri, alt: "", draggable: false, className: "hjm-photo-cropper__image", style: { inlineSize: source.width * cover, blockSize: source.height * cover, transform: `translate(-50%, -50%) translate(${state.x}px, ${state.y}px) scale(${state.zoom})` } }), _jsx("div", { className: "hjm-photo-cropper__mask", "aria-hidden": "true", style: { inlineSize: viewport, blockSize: viewport, "--hjm-photo-cropper-mask": `rgba(0,0,0,${circularPhotoCropRecipe.maskOpacity})` } })] }) : null }), _jsxs("div", { className: "hjm-photo-cropper__footer", children: [hint ? _jsx("p", { children: hint }) : null, _jsxs("div", { className: "hjm-photo-cropper__actions", children: [_jsx(Button, { ref: cancelRef, tone: "secondary", fullWidth: true, disabled: busy, onClick: onCancel, children: cancelLabel }), _jsx(Button, { tone: "primary", fullWidth: true, loading: busy, disabled: busy || viewport <= 0, onClick: () => onConfirm(resolveCircularPhotoCrop(state, source.width, source.height, viewport)), children: confirmLabel })] })] })] }) });
}
//# sourceMappingURL=image-viewer.js.map