import {
  canDismissSidePanel,
  sidePanelBehaviorDefaults,
  sidePanelRecipe,
  type SidePanelDismissPolicy,
  type SidePanelDismissReason,
  type SidePanelEdge,
  type SidePanelOpenChangeDetails,
  type SidePanelSize,
} from "@hjmds/design-contracts/components/side-panel";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { classNames, composeRefs } from "./internal.js";
import {
  getModalLayer,
  HjmPortal,
  renderTrigger,
  useModalFocus,
  useOpenState,
  type ModalOpenState,
} from "./modal.js";

export type SidePanelProps = ModalOpenState<SidePanelOpenChangeDetails> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    /** Logical docking direction; mirrors automatically in RTL. */
    edge?: SidePanelEdge;
    size?: SidePanelSize;
    busy?: boolean;
    /**
     * The whole policy, not `Partial<...>`: the contract splits this union on
     * `modal` so that `{ modal: false, outsideDismiss: true }` cannot be
     * written at all. `Partial<SidePanelDismissPolicy>` would collapse both
     * branches into optional fields and hand that invalid combination back.
     */
    dismissPolicy?: SidePanelDismissPolicy;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Fires once per visible cycle, after the panel has been removed. */
    onDismissComplete?: (detail: Readonly<{ reason: SidePanelDismissReason }>) => void;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
  }>;

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(function SidePanel(
  {
    trigger,
    title,
    description,
    children,
    footer,
    edge = sidePanelRecipe.defaults.edge,
    size = sidePanelRecipe.defaults.size,
    busy = false,
    dismissPolicy = sidePanelBehaviorDefaults,
    closeLabel,
    initialFocusRef,
    returnFocusRef,
    onDismissComplete,
    modalPriority = 0,
    portalContainer,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
  },
  forwardedRef,
) {
  const policy = dismissPolicy;
  const modal = policy.modal;
  const [open, changeOpen] = useOpenState<SidePanelOpenChangeDetails>({
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");
  const contentId = `${id}-side-panel`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const dismissReasonRef = useRef<SidePanelDismissReason | undefined>(undefined);
  const wasOpenRef = useRef(open);
  const dismissCompleteRef = useRef(onDismissComplete);
  dismissCompleteRef.current = onDismissComplete;
  const requestClose = (reason: SidePanelDismissReason) => {
    if (!canDismissSidePanel(reason, busy, policy)) return;
    dismissReasonRef.current = reason;
    changeOpen(false, { reason });
  };
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      dismissReasonRef.current = undefined;
      return;
    }
    if (!wasOpenRef.current) return;
    /*
      No `createSheetLifecycle` counterpart, per docs/side-panel.md: that counter
      exists for Android's persistently mounted native Modal. Here the panel is
      unmounted with the render that closed it, so "removed" is already true when
      this effect runs — including under reduced motion, where there is no exit
      transition to wait for. An owner that closed the panel without a user
      gesture is reported as `programmatic`.
    */
    wasOpenRef.current = false;
    const reason = dismissReasonRef.current ?? "programmatic";
    dismissReasonRef.current = undefined;
    dismissCompleteRef.current?.({ reason });
  }, [open]);

  useModalFocus({
    // Only modal panels trap focus and lock scroll. A non-modal panel leaves the
    // rest of the page live and tabbable, so it must not enter the modal stack.
    active: open && modal,
    priority: modalPriority,
    contentRef,
    ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
    ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
    ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
    onEscape: () => requestClose("escape"),
  });

  const escapeRef = useRef(() => requestClose("escape"));
  escapeRef.current = () => requestClose("escape");
  useEffect(() => {
    if (!open || modal) return;
    // Escape dismisses non-modal panels too, but only while focus is inside them
    // — the live page behind keeps its own Escape handling.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      // Read the ref per event: the portal mounts one commit after this effect,
      // so a value captured here would still be null for the panel's first keys.
      if (!(event.target instanceof Node) || contentRef.current?.contains(event.target) !== true) return;
      event.preventDefault();
      escapeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, modal]);

  const style = {
    zIndex: getModalLayer(modalPriority),
    "--hjm-side-panel-size": `${sidePanelRecipe.sizes[size]}px`,
  } as CSSProperties;
  const panel = (
    <div
      ref={composeRefs(contentRef, forwardedRef)}
      id={contentId}
      // A modal panel is a dialog; a non-modal one stays a complementary landmark
      // so assistive technology can move past it like any other page region.
      role={modal ? "dialog" : "complementary"}
      aria-modal={modal || undefined}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={busy || undefined}
      tabIndex={-1}
      className={classNames("hjm-side-panel", className)}
      data-hjm-modal-content={modal ? "" : undefined}
      data-edge={edge}
      data-size={size}
      data-modal={modal}
      data-state={busy ? "busy" : "idle"}
      style={modal ? undefined : style}
    >
      <header className="hjm-side-panel__header">
        <div>
          <h2 id={titleId} className="hjm-side-panel__title">{title}</h2>
          {description ? <p id={descriptionId} className="hjm-side-panel__description">{description}</p> : null}
        </div>
        {policy.dismissible ? (
          <button
            type="button"
            className="hjm-dialog__close"
            aria-label={closeLabel}
            disabled={busy && !policy.dismissWhileBusy}
            onClick={() => requestClose("close-action")}
          >
            ×
          </button>
        ) : null}
      </header>
      {children ? <div className="hjm-side-panel__body">{children}</div> : null}
      {footer ? <footer className="hjm-side-panel__footer">{footer}</footer> : null}
    </div>
  );

  return (
    <>
      {trigger === undefined ? null : renderTrigger(
        trigger,
        triggerRef,
        open,
        contentId,
        "dialog",
        () => changeOpen(true, { reason: "trigger" }),
      )}
      {open ? (
        <HjmPortal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
          {modal ? (
            <div
              className="hjm-overlay hjm-side-panel-positioner"
              data-kind="side-panel"
              data-modal-priority={modalPriority}
              data-edge={edge}
              data-state="open"
              style={style}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) requestClose("outside");
              }}
            >
              {panel}
            </div>
          ) : panel}
        </HjmPortal>
      ) : null}
    </>
  );
});
