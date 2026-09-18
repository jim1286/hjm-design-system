import {
  resolveTourAdvance,
  resolveTourDescriptor,
  tourRecipe,
  validateTourOpenState,
  type ComposeTourStepAnnouncement,
  type TourAdvanceReason,
  type TourCloseReason,
  type TourDescriptor,
  type TourOpenReason,
  type TourStepChangeHandler,
} from "@hjmds/design-contracts/components/tour";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Button } from "./actions.js";
import { classNames, composeRefs } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup } from "./portal.js";
import { getModalLayer, HjmPortal, renderTrigger, useModalFocus, type OverlayTrigger } from "./modal.js";

export type TourProps<Id extends string = string> = Readonly<{
  descriptor: TourDescriptor<Id>;
  /** Resolves the product-owned anchor key to the element to point at. */
  resolveAnchor: (anchorId: string) => HTMLElement | null;
  composeAnnouncement: ComposeTourStepAnnouncement;
  onStepChange: TourStepChangeHandler<Id>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, detail: Readonly<{ reason: TourOpenReason }>) => void;
  trigger?: OverlayTrigger;
  portalContainer?: HTMLElement;
  className?: string;
}>;

/*
  The contract hands renderers an opaque `anchorId`, never a node, so the
  product owns what each step points at. This component therefore keeps its own
  element box: it re-reads the anchor on every step and on layout changes rather
  than storing a rect the product could invalidate by re-rendering the page.
*/
function useAnchorRect(anchor: HTMLElement | null, active: boolean): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!active || !anchor) { setRect(null); return; }
    const measure = () => setRect(anchor.getBoundingClientRect());
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [anchor, active]);
  return rect;
}

export const Tour = forwardRef(function Tour<Id extends string = string>(
  {
    descriptor,
    resolveAnchor,
    composeAnnouncement,
    onStepChange,
    open: openProp,
    defaultOpen,
    onOpenChange,
    trigger,
    portalContainer,
    className,
  }: TourProps<Id>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  validateTourOpenState({
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  } as Parameters<typeof validateTourOpenState>[0]);
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const open = openProp ?? internalOpen;
  const resolved = resolveTourDescriptor(descriptor, { composeAnnouncement });
  const step = resolved.currentStep;

  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const [card, setCard] = useState<HTMLDivElement | null>(null);
  const id = `${useId().replaceAll(":", "")}-tour`;
  const anchor = open ? resolveAnchor(step.anchorId) : null;
  anchorRef.current = anchor;
  const anchorRect = useAnchorRect(anchor, open);

  const change = useCallback((next: boolean, reason: TourOpenReason) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next, { reason });
  }, [openProp, onOpenChange]);
  const close = (reason: TourCloseReason) => change(false, reason);
  const advance = (reason: TourAdvanceReason) => {
    const outcome = resolveTourAdvance(descriptor, reason);
    // `no-op` is Previous on the first step: the contract makes that a decision,
    // not a disabled button, so the control stays focusable and simply does nothing.
    if (outcome.type === "step") onStepChange(outcome.stepId, reason);
    else if (outcome.type === "close") close(outcome.reason);
  };

  const openRef = useRef(open);
  openRef.current = open;
  const settleRef = useRef(close);
  settleRef.current = close;
  const epochRef = useRef(0);
  useEffect(() => {
    const epoch = epochRef.current + 1;
    epochRef.current = epoch;
    return () => {
      queueMicrotask(() => {
        // StrictMode re-runs setup right after its probe cleanup; only a real
        // unmount has no later epoch. An open tour torn down that way was
        // interrupted — the user never skipped, escaped, or completed it.
        if (epochRef.current !== epoch || !openRef.current) return;
        settleRef.current("interrupted");
      });
    };
  }, []);

  useModalFocus({
    active: open,
    contentRef: cardRef,
    // The card itself, not its first button: it carries the step announcement,
    // which is the whole substitute for a sighted user's visual pointer.
    initialFocusRef: cardRef,
    ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
    onEscape: () => close("escape"),
  });
  useEffect(() => {
    // Focus follows the card on every step change, never the anchor: the anchor
    // is inert background while the tour runs.
    if (open) cardRef.current?.focus({ preventScroll: true });
  }, [open, step.id]);

  const position = useAnchoredPopup(anchorRef, open ? card : null, {
    ...(step.placement === undefined ? {} : { placement: step.placement }),
    ...(step.align === undefined ? {} : { align: step.align }),
    gap: tourRecipe.sideOffset,
    zIndex: getModalLayer(0) + 1,
    fallbackAxis: true,
  });
  const cardRefs = useCallback(composeRefs(setCard, cardRef, forwardedRef), [forwardedRef]);

  const renderedTrigger = trigger === undefined
    ? null
    : renderTrigger(trigger, triggerRef, open, id, "dialog", () => change(true, "trigger"));
  if (!open) return renderedTrigger;
  return (
    <>
      {renderedTrigger}
      <HjmPortal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
        {/*
          No dismiss handler on the veil: the contract has no `outside` close
          reason, so an accidental pointer must not end a walkthrough.
        */}
        <div className="hjm-tour-backdrop" data-state="open" style={{ zIndex: getModalLayer(0) }}>
          {anchorRect ? (
            <div
              className="hjm-tour-highlight"
              aria-hidden="true"
              style={{
                insetBlockStart: anchorRect.top,
                insetInlineStart: anchorRect.left,
                inlineSize: anchorRect.width,
                blockSize: anchorRect.height,
              } as CSSProperties}
            />
          ) : null}
        </div>
      </HjmPortal>
      <AnchoredPortal anchorRef={anchorRef} {...(portalContainer ? { container: portalContainer } : {})}>
        <div
          ref={cardRefs}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={resolved.accessibilityLabel}
          aria-describedby={`${id}-announcement`}
          tabIndex={-1}
          data-hjm-modal-content=""
          data-placement={position.placement}
          data-align={position.align}
          className={classNames("hjm-tour", className)}
          style={{ ...position.style, maxInlineSize: tourRecipe.maxWidth } as CSSProperties}
        >
          {/*
            The composed announcement already carries title, description, and
            position, so the visible copy is hidden from assistive technology
            instead of being read twice.
          */}
          <span id={`${id}-announcement`} className="hjm-visually-hidden">{step.announcement}</span>
          <div aria-hidden="true">
            <p className="hjm-tour__counter">{step.position} / {step.total}</p>
            <h2 className="hjm-tour__title">{step.title}</h2>
            <p className="hjm-tour__description">{step.description}</p>
          </div>
          <div className="hjm-tour__actions">
            <Button tone="ghost" onClick={() => close("skip")}>{descriptor.labels.skip}</Button>
            <Button tone="secondary" disabled={resolved.isFirstStep} onClick={() => advance("previous")}>
              {descriptor.labels.previous}
            </Button>
            <Button onClick={() => advance("next")}>
              {resolved.isLastStep ? descriptor.labels.done : descriptor.labels.next}
            </Button>
          </div>
        </div>
      </AnchoredPortal>
    </>
  );
}) as <Id extends string = string>(
  props: TourProps<Id> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
