"use client";

import { forwardRef, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode, type PointerEvent } from "react";
import { circularPhotoCoverScale, circularPhotoCropRecipe, clampCircularPhotoCrop, imageViewerTriggerRecipe, resolveCircularPhotoCrop, validateImageViewerTriggerLabel, type CircularPhotoCropRect, type CircularPhotoCropState } from "@hjmds/design-contracts/components/image";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { classNames } from "./internal.js";
import { HjmPortal, getModalLayer, useModalFocus } from "./modal.js";
import { Button, IconButton } from "./actions.js";

export type ImageViewerItem = { id: string; uri: string; label: string };
export type ImageViewerProps = {
  actions?: ReactNode;
  open: boolean; items: readonly ImageViewerItem[]; initialIndex?: number;
  onClose: () => void; onIndexChange?: (index: number) => void;
  closeLabel: string; previousLabel: string; nextLabel: string;
  loadingLabel: string; errorLabel: string; retryLabel: string;
  /** Authorized image hosts keep their fetching, loading and retry policy. Only the selected item mounts. */
  renderImage?: (item: ImageViewerItem) => ReactNode;
};

export type ImageViewerTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label" | "type" | "style"> & Readonly<{
  /** Localized accessible name, e.g. "사진 크게 보기". The media inside is decorative. */
  label: string;
  /** Product media (HJM `Image` with `decorative`, `<img alt="">`). */
  children: ReactNode;
  /** Layout-only placement; the trigger fills its container width by default, set `width` for a thumbnail. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/**
 * Button around product media that opens ImageViewer. The product keeps the viewer's `open` state and calls it from
 * `onClick`; the trigger owns the name, focus ring on the image frame radius, zoom cursor and pressed opacity.
 */
export const ImageViewerTrigger = forwardRef<HTMLButtonElement, ImageViewerTriggerProps>(function ImageViewerTrigger(
  { label, children, className, layoutStyle, ...props }, ref,
) {
  validateImageViewerTriggerLabel(label);
  return <button {...props} ref={ref} type="button" aria-label={label} aria-haspopup="dialog"
    className={classNames("hjm-image-viewer-trigger", className)}
    style={{ ...layoutStyle, "--hjm-image-viewer-trigger-pressed-opacity": imageViewerTriggerRecipe.pressedOpacity,
      "--hjm-image-viewer-trigger-disabled-opacity": imageViewerTriggerRecipe.disabledOpacity,
      "--hjm-image-viewer-trigger-cursor": imageViewerTriggerRecipe.cursor } as CSSProperties}>
    {children}
  </button>;
});

/** Full viewport photo presentation; shares modal isolation, focus return and Escape with Dialog. */
export function ImageViewer(props: ImageViewerProps) {
  if (!props.open) return null;
  if (!props.items.length || new Set(props.items.map(item => item.id)).size !== props.items.length ||
    props.items.some(item => !item.id.trim() || !item.uri.trim() || !item.label.trim()) ||
    [props.closeLabel, props.previousLabel, props.nextLabel, props.loadingLabel, props.errorLabel, props.retryLabel].some(label => !label.trim()) ||
    !Number.isInteger(props.initialIndex ?? 0) || (props.initialIndex ?? 0) < 0 || (props.initialIndex ?? 0) >= props.items.length)
    throw new TypeError("ImageViewer needs named images, localized controls and a valid index");
  return <ViewerSession key={JSON.stringify(props.items.map(item => [item.id, item.uri]))} {...props} />;
}
function ViewerSession(props: ImageViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null), closeRef = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(props.initialIndex ?? 0);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const item = props.items[index]!;
  useModalFocus({ active: true, contentRef, initialFocusRef: closeRef, onEscape: props.onClose });
  const move = (next: number) => { pointers.current.clear(); setView({ scale: 1, x: 0, y: 0 }); setIndex(next); props.onIndexChange?.(next); };
  const clamp = (scale: number, x = view.x, y = view.y) => {
    const bounds = contentRef.current?.querySelector(".hjm-image-viewer__stage")?.getBoundingClientRect();
    const image = contentRef.current?.querySelector('img');
    const fit = image?.naturalWidth && bounds ? Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight) : 1;
    const imageWidth = image?.naturalWidth ? image.naturalWidth * fit : bounds?.width ?? 0;
    const imageHeight = image?.naturalHeight ? image.naturalHeight * fit : bounds?.height ?? 0;
    const limitX = Math.max(0, imageWidth * scale - (bounds?.width ?? 0)) / 2;
    const limitY = Math.max(0, imageHeight * scale - (bounds?.height ?? 0)) / 2;
    setView({ scale, x: Math.max(-limitX, Math.min(limitX, x)), y: Math.max(-limitY, Math.min(limitY, y)) });
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const old = pointers.current.get(event.pointerId);
    if (!old) return;
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (other) {
      const before = Math.hypot(old.x - other.x, old.y - other.y);
      if (before > 0) clamp(Math.max(1, Math.min(4, view.scale * Math.hypot(event.clientX - other.x, event.clientY - other.y) / before)));
    } else if (view.scale > 1) clamp(view.scale, view.x + event.clientX - old.x, view.y + event.clientY - old.y);
  };
  return <HjmPortal><div className="hjm-image-viewer" style={{ zIndex: getModalLayer(0) }} ref={contentRef}
    role="dialog" aria-modal="true" aria-label={item.label} data-hjm-modal-content="" tabIndex={-1}>
    <div className="hjm-image-viewer__header"><IconButton ref={closeRef} label={props.closeLabel} tone="ghost" onClick={props.onClose}>×</IconButton>{props.actions ? <div className="hjm-image-viewer__actions">{props.actions}</div> : null}</div>
    <div className="hjm-image-viewer__stage" onDoubleClick={() => clamp(view.scale === 1 ? 2 : 1, 0, 0)}
      onPointerDown={event => {
        if ((event.target as HTMLElement).closest("button")) return;
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={pointerMove} onPointerUp={event => pointers.current.delete(event.pointerId)} onPointerCancel={event => pointers.current.delete(event.pointerId)}
      onKeyDown={event => {
        if (event.key === "+" || event.key === "=") { event.preventDefault(); clamp(Math.min(4, view.scale + 1)); }
        if (event.key === "-") { event.preventDefault(); clamp(Math.max(1, view.scale - 1)); }
        if (event.key.startsWith('Arrow')) {
          event.preventDefault();
          if (view.scale > 1) clamp(view.scale, view.x + (event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0), view.y + (event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0));
          else if (event.key === 'ArrowLeft' && index > 0) move(index - 1);
          else if (event.key === 'ArrowRight' && index + 1 < props.items.length) move(index + 1);
        }
      }} tabIndex={0} aria-label={item.label}>
      <div className="hjm-image-viewer__image" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
        {props.renderImage ? props.renderImage(item) : <ViewerImage key={item.uri} item={item} {...props} />}
      </div>
    </div>
    <div className="hjm-image-viewer__footer">
      {props.items.length > 1 ? <IconButton label={props.previousLabel} tone="ghost" disabled={index === 0} onClick={() => move(index - 1)}>‹</IconButton> : null}
      <span aria-live="polite">{item.label}{props.items.length > 1 ? ` · ${index + 1}/${props.items.length}` : ""}</span>
      {props.items.length > 1 ? <IconButton label={props.nextLabel} tone="ghost" disabled={index === props.items.length - 1} onClick={() => move(index + 1)}>›</IconButton> : null}
    </div>
  </div></HjmPortal>;
}
function ViewerImage({ item, loadingLabel, errorLabel, retryLabel }: ImageViewerProps & { item: ImageViewerItem }) {
  const [attempt, setAttempt] = useState(0);
  // A retry retires the whole host, so an old image callback cannot mark a new attempt ready.
  return <ImageAttempt key={attempt} item={item} loadingLabel={loadingLabel} errorLabel={errorLabel} retryLabel={retryLabel} onRetry={() => setAttempt(n => n + 1)} />;
}
function ImageAttempt({ item, loadingLabel, errorLabel, retryLabel, onRetry }: Pick<ImageViewerProps, 'loadingLabel' | 'errorLabel' | 'retryLabel'> & { item: ImageViewerItem; onRetry: () => void }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  return <><img src={item.uri} alt={item.label} draggable={false} onLoad={() => setStatus(current => current === 'error' ? current : 'ready')} onError={() => setStatus("error")} />
    {status === "loading" ? <span role="status">{loadingLabel}</span> : status === "error" ? <div role="alert">{errorLabel}<button type="button" onClick={onRetry}>{retryLabel}</button></div> : null}</>;
}

export type CircularPhotoCropperProps = Readonly<{
  open: boolean;
  /** The picked photo with its intrinsic pixel size (read from the decoded image). */
  source: Readonly<{ uri: string; width: number; height: number }>;
  title: string;
  /** Short instruction under the circle, e.g. "Drag and scroll or pinch to fit". */
  hint?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** While the product crops/uploads; both actions are locked. */
  busy?: boolean;
  onCancel(): void;
  /** Source-pixel square under the circle; the product crops (canvas) and uploads it. */
  onConfirm(crop: CircularPhotoCropRect): void;
}>;

/**
 * Instagram-style circular framing for profile photos (2026-10-29 user rule, all apps and web): drag to move, wheel or
 * pinch to zoom inside a circular mask on the black photo surface. Same geometry as Native (contract functions).
 */
export function CircularPhotoCropper(props: CircularPhotoCropperProps) {
  if (!props.open) return null;
  if ([props.title, props.confirmLabel, props.cancelLabel].some(label => !label.trim()) || !props.source.uri.trim() ||
    !(props.source.width > 0 && props.source.height > 0)) throw new TypeError("CircularPhotoCropper needs labels and a sized source");
  return <CropSession key={props.source.uri} {...props} />;
}
function CropSession({ source, title, hint, confirmLabel, cancelLabel, busy = false, onCancel, onConfirm }: CircularPhotoCropperProps) {
  const contentRef = useRef<HTMLDivElement>(null), cancelRef = useRef<HTMLButtonElement>(null);
  const [viewport, setViewport] = useState(0);
  const [state, setState] = useState<CircularPhotoCropState>({ zoom: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  useModalFocus({ active: true, contentRef, initialFocusRef: cancelRef, onEscape: () => { if (!busy) onCancel(); } });
  const update = (next: CircularPhotoCropState) => { if (viewport > 0) setState(clampCircularPhotoCrop(next, source.width, source.height, viewport)); };
  const cover = viewport > 0 ? circularPhotoCoverScale(source.width, source.height, viewport) : 0;
  return <HjmPortal><div className="hjm-image-viewer hjm-photo-cropper" style={{ zIndex: getModalLayer(0) }} ref={contentRef}
    role="dialog" aria-modal="true" aria-label={title} data-hjm-modal-content="" tabIndex={-1}>
    <div className="hjm-image-viewer__header hjm-photo-cropper__title"><h2>{title}</h2></div>
    <div className="hjm-image-viewer__stage hjm-photo-cropper__stage" aria-label={hint ?? title}
      ref={node => { if (node && !viewport) { const box = node.getBoundingClientRect(); setViewport(Math.max(1, Math.min(box.width - circularPhotoCropRecipe.gutter * 2, box.height - circularPhotoCropRecipe.gutter * 2))); } }}
      onWheel={event => update({ ...state, zoom: state.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1), x: state.x, y: state.y })}
      onPointerDown={event => { pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => {
        const previous = pointers.current.get(event.pointerId);
        if (!previous) return;
        const others = [...pointers.current.entries()].filter(([id]) => id !== event.pointerId).map(([, point]) => point);
        if (others.length) {
          // Two-finger pinch: zoom by the change in finger distance around the circle centre.
          const other = others[0]!, before = Math.hypot(previous.x - other.x, previous.y - other.y), after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
          const zoom = before > 0 ? state.zoom * after / before : state.zoom;
          update({ zoom, x: state.x * zoom / state.zoom, y: state.y * zoom / state.zoom });
        } else update({ ...state, x: state.x + event.clientX - previous.x, y: state.y + event.clientY - previous.y });
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }}
      onPointerUp={event => pointers.current.delete(event.pointerId)} onPointerCancel={event => pointers.current.delete(event.pointerId)}>
      {viewport > 0 ? <>
        <img src={source.uri} alt="" draggable={false} className="hjm-photo-cropper__image"
          style={{ inlineSize: source.width * cover, blockSize: source.height * cover, transform: `translate(-50%, -50%) translate(${state.x}px, ${state.y}px) scale(${state.zoom})` }} />
        <div className="hjm-photo-cropper__mask" aria-hidden="true"
          style={{ inlineSize: viewport, blockSize: viewport, "--hjm-photo-cropper-mask": `rgba(0,0,0,${circularPhotoCropRecipe.maskOpacity})` } as CSSProperties} />
      </> : null}
    </div>
    <div className="hjm-photo-cropper__footer">
      {hint ? <p>{hint}</p> : null}
      <div className="hjm-photo-cropper__actions">
        <Button ref={cancelRef} tone="secondary" fullWidth disabled={busy} onClick={onCancel}>{cancelLabel}</Button>
        <Button tone="primary" fullWidth loading={busy} disabled={busy || viewport <= 0}
          onClick={() => onConfirm(resolveCircularPhotoCrop(state, source.width, source.height, viewport))}>{confirmLabel}</Button>
      </div>
    </div>
  </div></HjmPortal>;
}
