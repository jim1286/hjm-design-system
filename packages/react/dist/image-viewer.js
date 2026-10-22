import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { HjmPortal, getModalLayer, useModalFocus } from "./modal.js";
import { IconButton } from "./actions.js";
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
function ViewerSession(props) {
    const contentRef = useRef(null), closeRef = useRef(null);
    const [index, setIndex] = useState(props.initialIndex ?? 0);
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
    const pointers = useRef(new Map());
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
    return _jsx(HjmPortal, { children: _jsxs("div", { className: "hjm-image-viewer", style: { zIndex: getModalLayer(0) }, ref: contentRef, role: "dialog", "aria-modal": "true", "aria-label": item.label, "data-hjm-modal-content": "", tabIndex: -1, children: [_jsxs("div", { className: "hjm-image-viewer__header", children: [_jsx(IconButton, { ref: closeRef, label: props.closeLabel, tone: "ghost", onClick: props.onClose, children: "\u00D7" }), props.actions ? _jsx("div", { className: "hjm-image-viewer__actions", children: props.actions }) : null] }), _jsx("div", { className: "hjm-image-viewer__stage", onDoubleClick: () => clamp(view.scale === 1 ? 2 : 1, 0, 0), onPointerDown: event => {
                        if (event.target.closest("button"))
                            return;
                        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                        event.currentTarget.setPointerCapture(event.pointerId);
                    }, onPointerMove: pointerMove, onPointerUp: event => pointers.current.delete(event.pointerId), onPointerCancel: event => pointers.current.delete(event.pointerId), onKeyDown: event => {
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
                    }, tabIndex: 0, "aria-label": item.label, children: _jsx("div", { className: "hjm-image-viewer__image", style: { transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }, children: props.renderImage ? props.renderImage(item) : _jsx(ViewerImage, { item: item, ...props }, item.uri) }) }), _jsxs("div", { className: "hjm-image-viewer__footer", children: [props.items.length > 1 ? _jsx(IconButton, { label: props.previousLabel, tone: "ghost", disabled: index === 0, onClick: () => move(index - 1), children: "\u2039" }) : null, _jsxs("span", { "aria-live": "polite", children: [item.label, props.items.length > 1 ? ` · ${index + 1}/${props.items.length}` : ""] }), props.items.length > 1 ? _jsx(IconButton, { label: props.nextLabel, tone: "ghost", disabled: index === props.items.length - 1, onClick: () => move(index + 1), children: "\u203A" }) : null] })] }) });
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
//# sourceMappingURL=image-viewer.js.map