import { cloneElement, createContext, forwardRef, useCallback, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { canDismissPopover, popoverBehaviorDefaults, popoverHoverDelay, popoverRecipe, resolvePopoverDescriptor, validatePopoverOpenState, type PopoverDescriptor, type PopoverDismissPolicy, type PopoverDismissReason, type PopoverOpenChangeDetails, type PopoverOpenOn, type PopoverOpenState } from "@hjmds/design-contracts/components/popover";
import { easing } from "@hjmds/design-contracts/foundations";
import { Button } from "./actions.js";
import { classNames, composeRefs } from "./internal.js";
import { AnchoredPortal, getPopoverOwner, useAnchoredPopup } from "./portal.js";
import { useOptionalHjmTheme } from "./provider.js";
import type { OverlayTrigger } from "./overlays.js";

export type PopoverContentActions = Readonly<{ close(): void }>;
export type PopoverProps = PopoverOpenState & Readonly<{
  trigger: OverlayTrigger;
  title: string;
  closeLabel: string;
  description?: string;
  descriptor?: PopoverDescriptor;
  children?: ReactNode | ((actions: PopoverContentActions) => ReactNode);
  dismissPolicy?: Partial<PopoverDismissPolicy>;
  /**
   * `"hover"` adds pointer enter/leave on top of the click path; it never
   * replaces it, because hover does not exist on touch or for a keyboard.
   */
  openOn?: PopoverOpenOn;
  initialFocusRef?: RefObject<HTMLElement | null>;
  portalContainer?: HTMLElement;
  className?: string;
}>;
const ParentPopoverOpen = createContext(true);
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeSystemMotion(notify: () => void) {
  const media = window.matchMedia(motionQuery); media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
const readSystemMotion = () => window.matchMedia(motionQuery).matches;
const readServerMotion = () => false;
const focusable = 'a[href],button,input,select,textarea,[tabindex]';
function tabStops(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(focusable)].filter((node) =>
    node.tabIndex >= 0 && !node.matches(":disabled") && !node.closest('[inert],[hidden],[aria-hidden="true"]') && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== "hidden",
  ).sort((a, b) => (a.tabIndex > 0 ? a.tabIndex : Infinity) - (b.tabIndex > 0 ? b.tabIndex : Infinity));
}
function contains(content: HTMLElement, target: Node): boolean {
  if (content.contains(target)) return true;
  const visited = new Set<HTMLElement>(); let owner = getPopoverOwner(target);
  while (owner && !visited.has(owner)) {
    if (owner === content) return true;
    visited.add(owner); owner = getPopoverOwner(owner.parentElement);
  }
  return false;
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover({ trigger, title, closeLabel,
  description, descriptor = {}, children, dismissPolicy, openOn = popoverBehaviorDefaults.openOn, initialFocusRef, portalContainer, className,
  open: controlledOpen, defaultOpen, onOpenChange }, ref) {
  if (!title.trim() || !closeLabel.trim()) throw new TypeError("Popover title and closeLabel must not be empty");
  const resolved = resolvePopoverDescriptor(descriptor);
  validatePopoverOpenState({ ...(controlledOpen === undefined ? {} : { open: controlledOpen }), ...(defaultOpen === undefined ? {} : { defaultOpen }), ...(onOpenChange ? { onOpenChange } : {}) } as PopoverOpenState);
  const policy = { ...popoverBehaviorDefaults, ...dismissPolicy };
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const parentOpen = useContext(ParentPopoverOpen);
  const open = parentOpen && (controlledOpen ?? internalOpen);
  const previousParentOpen = useRef(parentOpen);
  useEffect(() => {
    if (!parentOpen && previousParentOpen.current && (controlledOpen ?? internalOpen)) {
      // A closed parent ends the child's session; reopening it must not resurrect
      // a stale uncontrolled submenu or leave a controlled owner uninformed.
      if (controlledOpen === undefined) setInternalOpen(false);
      onOpenChange?.(false, { reason: "programmatic" });
    }
    previousParentOpen.current = parentOpen;
  }, [parentOpen, controlledOpen, internalOpen, onOpenChange]);
  const theme = useOptionalHjmTheme();
  const systemReduced = useSyncExternalStore(subscribeSystemMotion, readSystemMotion, readServerMotion);
  const reduced = theme?.environment.reducedMotion ?? systemReduced;
  const [present, setPresent] = useState(open);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const closeReason = useRef<PopoverDismissReason | undefined>(undefined);
  const focusWasInside = useRef(false);
  const didFocus = useRef(false);
  const requestPending = useRef(false);
  const id = `${useId().replaceAll(":", "")}-popover`;
  const state = useRef({ open, policy, onOpenChange, controlledOpen }); state.current = { open, policy, onOpenChange, controlledOpen };
  const change = useCallback((next: boolean, reason: PopoverOpenChangeDetails["reason"]) => {
    const current = state.current;
    if (next === current.open || requestPending.current) return;
    if (!next && !canDismissPopover(reason as PopoverDismissReason, current.policy)) return;
    requestPending.current = true;
    // Deduplicate one interaction, but let a controlled owner reject it and receive a later attempt.
    queueMicrotask(() => { requestPending.current = false; });
    closeReason.current = next ? undefined : reason as PopoverDismissReason;
    if (current.controlledOpen === undefined) setInternalOpen(next);
    current.onOpenChange?.(next, { reason });
  }, []);
  useEffect(() => {
    if (open) { setPresent(true); return; }
    if (!present) return;
    // Keep only the exit surface briefly; inert/aria-hidden exclude it immediately.
    // A parent context closes nested popovers in the same render, including their portals.
    if (reduced) { setPresent(false); return; }
    const timeout = setTimeout(() => setPresent(false), popoverRecipe.transition.exit.duration);
    return () => clearTimeout(timeout);
  }, [open, present, reduced]);
  const position = useAnchoredPopup(triggerRef, open || present ? node : null, {
    placement: resolved.placement, align: resolved.align, gap: popoverRecipe.sideOffset,
    // Contextual forms sit above menus (900) and below tooltips (1100); a modal
    // owner supplies its own layer through the shared positioning helper.
    viewportPadding: popoverRecipe.collisionPadding, zIndex: 950, fallbackAxis: true,
  });
  const setContent = useCallback((value: HTMLDivElement | null) => { setNode(value); }, []);
  const contentRef = useCallback(composeRefs(setContent, ref), [setContent, ref]);
  useEffect(() => {
    if (!open) {
      if (didFocus.current) {
        didFocus.current = false;
        const reason = closeReason.current;
        if ((reason === undefined || reason === "programmatic" || reason === "escape" || reason === "close-action") && focusWasInside.current) {
          queueMicrotask(() => {
            const active = document.activeElement;
            if (active === document.body || (node && active instanceof Node && contains(node, active))) triggerRef.current?.focus({ preventScroll: true });
          });
        }
      }
      closeReason.current = undefined; return;
    }
    if (!node || position.style.visibility !== "visible" || didFocus.current) return;
    didFocus.current = true;
    const initial = initialFocusRef?.current;
    const target = initial && contains(node, initial) ? initial : tabStops(node.querySelector<HTMLElement>("[data-hjm-popover-body]")!)[0] ?? node;
    target.focus({ preventScroll: true }); focusWasInside.current = true;
  }, [open, node, position.style.visibility, initialFocusRef]);
  useEffect(() => {
    if (!open || !node) return;
    let pointerOutside = false;
    const inside = (target: EventTarget | null): target is Node => target instanceof Node && (contains(node, target) || triggerRef.current?.contains(target) === true);
    const pointer = (event: PointerEvent) => {
      pointerOutside = !inside(event.target);
      if (pointerOutside) change(false, "outside-pointer");
    };
    const pointerEnd = () => { pointerOutside = false; };
    const focus = (event: FocusEvent) => {
      focusWasInside.current = event.target instanceof Node && contains(node, event.target);
      if (!inside(event.target) && !pointerOutside) change(false, "outside-focus");
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !inside(event.target)) return;
      const owner = getPopoverOwner(event.target instanceof Node ? event.target : null);
      if (owner && owner !== node) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); change(false, "escape"); }
      if (event.key !== "Tab" || !(event.target instanceof Node) || !contains(node, event.target)) return;
      const stops = tabStops(node); const first = stops[0]; const last = stops.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        event.preventDefault(); triggerRef.current?.focus(); change(false, "outside-focus");
      } else if (!event.shiftKey && (document.activeElement === last || stops.length === 0)) {
        const all = tabStops(document.body).filter((item) => !contains(node, item));
        const index = all.indexOf(triggerRef.current!); const next = index >= 0 ? all[index + 1] : undefined;
        // Portals sit at the end of body; continue after the trigger's logical position.
        if (next) { event.preventDefault(); next.focus(); change(false, "outside-focus"); }
      }
    };
    document.addEventListener("pointerdown", pointer); document.addEventListener("pointerup", pointerEnd); document.addEventListener("pointercancel", pointerEnd);
    document.addEventListener("focusin", focus); document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("pointerdown", pointer); document.removeEventListener("pointerup", pointerEnd); document.removeEventListener("pointercancel", pointerEnd); document.removeEventListener("focusin", focus); document.removeEventListener("keydown", keyboard); };
  }, [open, node, change]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelHover = useCallback(() => { if (hoverTimer.current !== undefined) { clearTimeout(hoverTimer.current); hoverTimer.current = undefined; } }, []);
  useEffect(() => cancelHover, [cancelHover]);
  const scheduleHover = useCallback((next: boolean) => {
    cancelHover();
    // Delays on both edges: opening instantly turns a pass-through into a flash,
    // and closing instantly makes the gap between trigger and panel untraversable.
    hoverTimer.current = setTimeout(
      () => change(next, next ? "trigger" : "outside-pointer"),
      next ? popoverHoverDelay.open : popoverHoverDelay.close,
    );
  }, [cancelHover, change]);
  const hoverHandlers = openOn === "hover"
    ? {
        onPointerEnter: (event: { pointerType?: string }) => { if (event.pointerType !== "touch") scheduleHover(true); },
        onPointerLeave: (event: { pointerType?: string }) => { if (event.pointerType !== "touch") scheduleHover(false); },
      }
    : {};
  const triggerProps = trigger.props;
  const renderedTrigger = cloneElement(trigger, {
    ref: composeRefs(triggerProps.ref, triggerRef), "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": id,
    ...hoverHandlers,
    onClick: (event) => {
      triggerProps.onClick?.(event);
      if (event.defaultPrevented || triggerProps.disabled || triggerProps["aria-disabled"] === true || triggerProps["aria-disabled"] === "true") return;
      change(!open, open ? "close-action" : "trigger");
    },
  });
  const style = { ...position.style, "--hjm-popover-max-width": `${popoverRecipe.maxWidth}px`,
    "--hjm-popover-duration": `${open ? popoverRecipe.transition.enter.duration : reduced ? 0 : popoverRecipe.transition.exit.duration}ms`,
    "--hjm-popover-easing": `cubic-bezier(${easing[open ? popoverRecipe.transition.enter.easing : popoverRecipe.transition.exit.easing].join(", ")})`,
    minWidth: Math.min(popoverRecipe.minWidth, Number(position.style.maxWidth ?? popoverRecipe.minWidth)),
    boxShadow: `0 ${popoverRecipe.surface.shadow.offsetY}px ${popoverRecipe.surface.shadow.radius}px ${popoverRecipe.surface.shadow.color}${Math.round(popoverRecipe.surface.shadow.opacity * 255).toString(16).padStart(2, "0")}`,

  } as CSSProperties;
  return <>{renderedTrigger}{open || present ? <AnchoredPortal anchorRef={triggerRef} ssrFallback="inline" {...(portalContainer ? { container: portalContainer } : {})}>
    <ParentPopoverOpen.Provider value={open}><div ref={contentRef} id={id} role="dialog" tabIndex={-1} data-hjm-popover-content="" data-state={open ? "open" : "closed"}
      aria-hidden={!open || undefined} inert={!open || undefined} aria-label={resolved.accessibilityLabel} aria-labelledby={resolved.accessibilityLabel ? undefined : `${id}-title`} aria-describedby={description ? `${id}-description` : undefined}
      className={classNames("hjm-popover", className)} style={style} data-placement={position.placement} data-align={position.align} {...hoverHandlers}
      onAnimationEnd={(event) => { if (!open && event.target === event.currentTarget) setPresent(false); }}>
      <div className="hjm-popover__header"><h2 id={`${id}-title`} className="hjm-popover__title">{title}</h2><Button tone="ghost" onClick={() => change(false, "close-action")}>{closeLabel}</Button></div>
      {description ? <p id={`${id}-description`} className="hjm-popover__description">{description}</p> : null}
      <div data-hjm-popover-body="" className="hjm-popover__body">{typeof children === "function" ? children({ close: () => change(false, "close-action") }) : children}</div>
    </div></ParentPopoverOpen.Provider>
  </AnchoredPortal> : null}</>;
});
