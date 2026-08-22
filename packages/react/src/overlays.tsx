import {
  createAlertDialogSession,
  getAlertDialogInitialFocus,
  validateAlertDialogRequest,
  type AlertDialogPhase,
  type AlertDialogOpenChangeReason,
  type AlertDialogRequest,
  type AlertDialogSession,
} from "@hjm/design-contracts/components/alert-dialog";
import {
  createSheetLifecycle,
  sheetBehaviorDefaults,
  type SheetDismissPolicy,
  type SheetDismissReason,
  type SheetOpenChangeDetails,
} from "@hjm/design-contracts/components/sheet";
import {
  resolveTooltipDescriptor,
  tooltipBehaviorDefaults,
  type TooltipAlign,
  type TooltipOpenChangeDetails,
  type TooltipPlacement,
} from "@hjm/design-contracts/components/tooltip";
import {
  dialogRecipe,
  menuRecipe,
  sheetRecipe,
  type AlertDialogTone,
  type DialogSize,
  type MenuDensity,
  type MenuItemTone,
} from "@hjm/design-contracts/recipes";
import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type AriaAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "./actions.js";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import { useOptionalHjmTheme, useTooltipCoordinator } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";

type TriggerElementProps = Readonly<{
  ref?: Ref<HTMLElement>;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  "aria-controls"?: string;
  "aria-describedby"?: string;
  "aria-disabled"?: AriaAttributes["aria-disabled"];
  "aria-expanded"?: AriaAttributes["aria-expanded"];
  "aria-haspopup"?: AriaAttributes["aria-haspopup"];
}>;

export type OverlayTrigger = ReactElement<TriggerElementProps>;

type PortalProps = Readonly<{
  children: ReactNode;
  container?: HTMLElement;
}>;

function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useOptionalHjmTheme();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    theme ? (
      <div
        className="hjm-root hjm-portal"
        data-hjm-portal=""
        data-motion={theme.environment.reducedMotion ? "reduced" : "full"}
        data-theme={theme.environment.theme}
        data-text-scale={theme.environment.textScale}
        dir={theme.environment.direction}
        style={createHjmThemeStyle(theme)}
      >
        {children}
      </div>
    ) : children,
    container ?? document.body,
  );
}

type OpenState<Detail> =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange: (open: boolean, detail: Detail) => void;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean, detail: Detail) => void;
    }>;

type ModalOpenState<Detail> =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange: (open: boolean, detail: Detail) => void;
      /** Optional for product-owned, programmatically controlled overlays. */
      trigger?: OverlayTrigger;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean, detail: Detail) => void;
      /** Uncontrolled overlays need a first-party activation target. */
      trigger: OverlayTrigger;
    }>;

function useOpenState<Detail>({
  open,
  defaultOpen = false,
  onOpenChange,
}: Readonly<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, detail: Detail) => void;
}>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const currentOpen = controlled ? open : internalOpen;
  const pendingRequestRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (pendingRequestRef.current === currentOpen) {
      pendingRequestRef.current = undefined;
    }
  }, [currentOpen]);
  const changeOpen = useCallback(
    (nextOpen: boolean, detail: Detail) => {
      if (
        nextOpen === currentOpen ||
        pendingRequestRef.current === nextOpen
      ) return;
      pendingRequestRef.current = nextOpen;
      if (!controlled) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen, detail);
      if (controlled && nextOpen) {
        queueMicrotask(() => {
          if (pendingRequestRef.current === true) {
            pendingRequestRef.current = undefined;
          }
        });
      }
    },
    [controlled, currentOpen, onOpenChange],
  );
  return [currentOpen, changeOpen] as const;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true",
  );
}

let bodyLockCount = 0;
let previousBodyOverflow = "";
const activeModalStack: HTMLElement[] = [];
const isolatedModalBackground = new Map<
  HTMLElement,
  Readonly<{ ariaHidden: string | null; inert: boolean }>
>();
let modalIsolationObserver: MutationObserver | null = null;

function restoreModalBackground(): void {
  for (const [element, previous] of isolatedModalBackground) {
    element.inert = previous.inert;
    if (previous.ariaHidden === null) element.removeAttribute("aria-hidden");
    else element.setAttribute("aria-hidden", previous.ariaHidden);
  }
  isolatedModalBackground.clear();
}

function isolateModalBackgroundElement(element: HTMLElement): void {
  if (isolatedModalBackground.has(element)) return;
  isolatedModalBackground.set(element, {
    ariaHidden: element.getAttribute("aria-hidden"),
    inert: element.inert,
  });
  element.inert = true;
  element.setAttribute("aria-hidden", "true");
}

/** Keeps only the top modal's ancestor path interactive, including late portals. */
function synchronizeModalBackgroundIsolation(): void {
  restoreModalBackground();
  while (activeModalStack.length > 0 && !activeModalStack.at(-1)?.isConnected) {
    activeModalStack.pop();
  }
  const top = activeModalStack.at(-1);
  if (!top) {
    modalIsolationObserver?.disconnect();
    modalIsolationObserver = null;
    return;
  }

  let pathNode: HTMLElement = top;
  let parent = pathNode.parentElement;
  while (parent) {
    for (const sibling of parent.children) {
      if (sibling !== pathNode && sibling instanceof HTMLElement) {
        isolateModalBackgroundElement(sibling);
      }
    }
    if (parent === document.body) break;
    pathNode = parent;
    parent = pathNode.parentElement;
  }

  if (modalIsolationObserver === null) {
    modalIsolationObserver = new MutationObserver(() => {
      synchronizeModalBackgroundIsolation();
    });
    modalIsolationObserver.observe(document.body, { childList: true, subtree: true });
  }
}

function lockBodyScroll(): () => void {
  if (bodyLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  bodyLockCount += 1;
  return () => {
    bodyLockCount = Math.max(0, bodyLockCount - 1);
    if (bodyLockCount === 0) document.body.style.overflow = previousBodyOverflow;
  };
}

type ModalFocusOptions = Readonly<{
  active: boolean;
  contentRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  fallbackReturnRef?: React.RefObject<HTMLElement | null>;
  onEscape(): void;
}>;

function useModalFocus({
  active,
  contentRef,
  initialFocusRef,
  returnFocusRef,
  fallbackReturnRef,
  onEscape,
}: ModalFocusOptions): void {
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let release: (() => void) | undefined;
    let cancelled = false;

    const activate = () => {
      const content = contentRef.current;
      if (!content) {
        retryTimer = setTimeout(activate, 0);
        return;
      }
      const previouslyFocused = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      const releaseScroll = lockBodyScroll();
      activeModalStack.push(content);
      synchronizeModalBackgroundIsolation();
      const initial = initialFocusRef?.current ?? getFocusable(content)[0] ?? content;
      initial.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (activeModalStack.at(-1) !== content) return;
        if (event.key === "Escape") {
          event.preventDefault();
          escapeRef.current();
          return;
        }
        if (event.key !== "Tab") return;
        const focusable = getFocusable(content);
        if (focusable.length === 0) {
          event.preventDefault();
          content.focus();
          return;
        }
        const first = focusable[0]!;
        const last = focusable.at(-1)!;
        const current = document.activeElement;
        if (event.shiftKey && (current === first || !content.contains(current))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (current === last || !content.contains(current))) {
          event.preventDefault();
          first.focus();
        }
      };
      const handleFocusIn = (event: FocusEvent) => {
        if (activeModalStack.at(-1) !== content) return;
        if (event.target instanceof Node && !content.contains(event.target)) {
          (initialFocusRef?.current ?? getFocusable(content)[0] ?? content).focus();
        }
      };
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("focusin", handleFocusIn, true);
      release = () => {
        document.removeEventListener("keydown", handleKeyDown, true);
        document.removeEventListener("focusin", handleFocusIn, true);
        const stackIndex = activeModalStack.lastIndexOf(content);
        if (stackIndex >= 0) activeModalStack.splice(stackIndex, 1);
        synchronizeModalBackgroundIsolation();
        releaseScroll();
        const returnTarget =
          returnFocusRef?.current ?? fallbackReturnRef?.current ?? previouslyFocused;
        queueMicrotask(() => returnTarget?.focus());
      };
      if (cancelled) release();
    };
    activate();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      release?.();
    };
  }, [active, contentRef, fallbackReturnRef, initialFocusRef, returnFocusRef]);
}

function renderTrigger(
  trigger: OverlayTrigger,
  triggerRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  contentId: string,
  popup: "dialog" | "menu",
  onOpen: () => void,
): ReactElement {
  const props = trigger.props;
  return cloneElement(trigger, {
    ref: composeRefs(props.ref, triggerRef),
    "aria-controls": contentId,
    "aria-expanded": open,
    "aria-haspopup": popup,
    onClick: (event) => {
      props.onClick?.(event);
      if (!event.defaultPrevented && !props.disabled) onOpen();
    },
  });
}

export type DialogOpenChangeReason =
  | "trigger"
  | "close-action"
  | "escape"
  | "outside";

export type DialogProps = ModalOpenState<Readonly<{ reason: DialogOpenChangeReason }>> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    size?: DialogSize;
    dismissible?: boolean;
    busy?: boolean;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    portalContainer?: HTMLElement;
    className?: string;
  }>;

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    trigger,
    title,
    description,
    children,
    footer,
    size = dialogRecipe.defaults.size,
    dismissible = dialogRecipe.defaults.dismissible,
    busy = false,
    closeLabel,
    initialFocusRef,
    returnFocusRef,
    portalContainer,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
  },
  forwardedRef,
) {
  const [open, changeOpen] = useOpenState({
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedContentRef = composeRefs(contentRef, forwardedRef);
  const id = useId().replaceAll(":", "");
  const contentId = `${id}-dialog`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const requestClose = (reason: Exclude<DialogOpenChangeReason, "trigger">) => {
    if (!dismissible || busy) return;
    changeOpen(false, { reason });
  };
  useModalFocus({
    active: open,
    contentRef,
    ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
    ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
    ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
    onEscape: () => requestClose("escape"),
  });

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
        <Portal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
          <div
            className="hjm-overlay"
            data-kind="dialog"
            data-state="open"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) requestClose("outside");
            }}
          >
            <div
              ref={mergedContentRef}
              id={contentId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              aria-busy={busy || undefined}
              tabIndex={-1}
              className={classNames("hjm-dialog", className)}
              data-size={size}
              data-state={busy ? "busy" : "idle"}
            >
              <header className="hjm-dialog__header">
                <h2 id={titleId} className="hjm-dialog__title">{title}</h2>
                {dismissible ? (
                  <button
                    type="button"
                    className="hjm-dialog__close"
                    aria-label={closeLabel}
                    disabled={busy}
                    onClick={() => requestClose("close-action")}
                  >
                    ×
                  </button>
                ) : null}
              </header>
              {description ? <p id={descriptionId} className="hjm-dialog__description">{description}</p> : null}
              {children ? <div className="hjm-dialog__body">{children}</div> : null}
              {footer ? <footer className="hjm-dialog__footer">{footer}</footer> : null}
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
});

export type AlertDialogProps = ModalOpenState<
  Readonly<{ reason: AlertDialogOpenChangeReason }>
> &
  Readonly<{
    request: AlertDialogRequest;
    icon?: ReactNode;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    portalContainer?: HTMLElement;
    className?: string;
  }>;

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  function AlertDialog(
    {
      trigger,
      request,
      icon,
      returnFocusRef,
      portalContainer,
      open: openProp,
      defaultOpen,
      onOpenChange,
      className,
    },
    forwardedRef,
  ) {
    validateAlertDialogRequest(request);
    const [open, changeOpen] = useOpenState({
      ...(openProp === undefined ? {} : { open: openProp }),
      ...(defaultOpen === undefined ? {} : { defaultOpen }),
      ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const sessionRef = useRef<AlertDialogSession | null>(null);
    const [sessionGeneration, setSessionGeneration] = useState(0);
    if (open && sessionRef.current === null) {
      sessionRef.current = createAlertDialogSession(request);
    }
    const idleSnapshot = useRef<AlertDialogPhase>({ status: "idle" });
    const phase = useSyncExternalStore(
      (listener) => sessionRef.current?.subscribe(listener) ?? (() => undefined),
      () => sessionRef.current?.getSnapshot() ?? idleSnapshot.current,
      () => idleSnapshot.current,
    );
    const busy = phase.status === "busy";
    const closing = phase.status === "closing" || phase.status === "closed";
    const error = phase.status === "error" ? phase.message : undefined;
    const triggerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);
    const initialFocusRef = getAlertDialogInitialFocus(request.mode) === "cancel"
      ? cancelRef
      : confirmRef;
    const id = useId().replaceAll(":", "");
    const contentId = `${id}-alert-dialog`;
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const startSession = (): AlertDialogSession => {
      sessionRef.current?.interrupt();
      const session = createAlertDialogSession(request);
      sessionRef.current = session;
      setSessionGeneration((current) => current + 1);
      return session;
    };
    const cancel = (reason: "cancel-action" | "escape") => {
      const session = sessionRef.current;
      if (!session?.cancel(reason)) return;
      changeOpen(false, { reason });
    };
    useModalFocus({
      active: open,
      contentRef,
      initialFocusRef,
      ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
      ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
      onEscape: () => cancel("escape"),
    });

    const confirm = async () => {
      const session = sessionRef.current;
      if (!session) return;
      if (await session.confirm()) changeOpen(false, { reason: "confirm" });
    };
    useEffect(() => {
      if (open) return;
      const session = sessionRef.current;
      if (!session) return;
      const snapshot = session.getSnapshot();
      if (snapshot.status === "idle" || snapshot.status === "error") {
        session.cancel("programmatic");
      }
      if (session.getSnapshot().status === "closing") session.completeExit();
      else if (session.getSnapshot().status !== "closed") session.interrupt();
      sessionRef.current = null;
    }, [open, sessionGeneration]);
    useEffect(
      () => () => {
        sessionRef.current?.interrupt();
      },
      [],
    );
    const tone: AlertDialogTone = request.tone ?? "attention";

    return (
      <>
        {trigger === undefined ? null : renderTrigger(
          trigger,
          triggerRef,
          open,
          contentId,
          "dialog",
          () => {
            startSession();
            changeOpen(true, { reason: "trigger" });
          },
        )}
        {open ? (
          <Portal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
            <div className="hjm-overlay" data-kind="alert-dialog" data-state="open">
              <div
                ref={composeRefs(contentRef, forwardedRef)}
                id={contentId}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
                aria-busy={busy || undefined}
                tabIndex={-1}
                className={classNames("hjm-alert-dialog", className)}
                data-tone={tone}
                data-state={busy ? "busy" : error ? "error" : "idle"}
              >
                {icon ? <div className="hjm-alert-dialog__icon" aria-hidden="true">{icon}</div> : null}
                <h2 id={titleId} className="hjm-alert-dialog__title">{request.title}</h2>
                <p id={descriptionId} className="hjm-alert-dialog__description">{request.description}</p>
                {error ? <p id={errorId} className="hjm-alert-dialog__error" role="alert">{error}</p> : null}
                <div className="hjm-alert-dialog__actions">
                  {request.mode === "confirm" ? (
                    <Button
                      ref={cancelRef}
                      tone="secondary"
                      disabled={busy || closing}
                      onClick={() => cancel("cancel-action")}
                    >
                      {request.cancelLabel}
                    </Button>
                  ) : null}
                  <Button
                    ref={confirmRef}
                    tone={tone === "danger" ? "danger" : "primary"}
                    loading={busy}
                    disabled={closing}
                    onClick={() => void confirm()}
                  >
                    {request.confirmLabel}
                  </Button>
                </div>
              </div>
            </div>
          </Portal>
        ) : null}
      </>
    );
  },
);

export type SheetPlacement = "bottom" | "start" | "end";

export type SheetProps = ModalOpenState<SheetOpenChangeDetails> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    placement?: SheetPlacement;
    busy?: boolean;
    dismissPolicy?: Partial<SheetDismissPolicy>;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    portalContainer?: HTMLElement;
    className?: string;
  }>;

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(function Sheet(
  {
    trigger,
    title,
    description,
    children,
    footer,
    placement = sheetRecipe.defaults.placement,
    busy = false,
    dismissPolicy,
    closeLabel,
    initialFocusRef,
    returnFocusRef,
    portalContainer,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
  },
  forwardedRef,
) {
  const [open, changeOpen] = useOpenState({
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const policy: SheetDismissPolicy = { ...sheetBehaviorDefaults, ...dismissPolicy };
  const lifecycleRef = useRef(createSheetLifecycle(open));
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");
  const contentId = `${id}-sheet`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const requestClose = (reason: SheetDismissReason) => {
    if (lifecycleRef.current.requestClose(reason, busy, policy)) {
      changeOpen(false, { reason });
    }
  };
  useEffect(() => {
    if (open) {
      lifecycleRef.current.open();
      return;
    }
    const cycle = lifecycleRef.current.beginDismiss();
    if (cycle !== null) lifecycleRef.current.completeDismiss(cycle);
  }, [open]);
  useModalFocus({
    active: open,
    contentRef,
    ...(initialFocusRef === undefined ? {} : { initialFocusRef }),
    ...(returnFocusRef === undefined ? {} : { returnFocusRef }),
    ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
    onEscape: () => requestClose("escape"),
  });

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
        <Portal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
          <div
            className="hjm-overlay hjm-sheet-positioner"
            data-kind="sheet"
            data-placement={placement}
            data-state="open"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) requestClose("outside");
            }}
          >
            <div
              ref={composeRefs(contentRef, forwardedRef)}
              id={contentId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              aria-busy={busy || undefined}
              tabIndex={-1}
              className={classNames("hjm-sheet", className)}
              data-placement={placement}
              data-state={busy ? "busy" : "idle"}
            >
              <header className="hjm-sheet__header">
                <div>
                  <h2 id={titleId} className="hjm-sheet__title">{title}</h2>
                  {description ? <p id={descriptionId} className="hjm-sheet__description">{description}</p> : null}
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
              {children ? <div className="hjm-sheet__body">{children}</div> : null}
              {footer ? <footer className="hjm-sheet__footer">{footer}</footer> : null}
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
});

export type TooltipProps = OpenState<TooltipOpenChangeDetails> &
  Readonly<{
    trigger: OverlayTrigger;
    content: string;
    placement?: TooltipPlacement;
    align?: TooltipAlign;
    pointerOpenDelayMs?: number;
    focusOpenDelayMs?: number;
    className?: string;
  }>;

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  {
    trigger,
    content,
    placement,
    align,
    pointerOpenDelayMs = tooltipBehaviorDefaults.pointerOpenDelayMs,
    focusOpenDelayMs = tooltipBehaviorDefaults.focusOpenDelayMs,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
  },
  ref,
) {
  const descriptor = resolveTooltipDescriptor({
    content,
    ...(placement === undefined ? {} : { placement }),
    ...(align === undefined ? {} : { align }),
  });
  const [open, changeOpen] = useOpenState({
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suppressedRef = useRef(false);
  const id = `${useId().replaceAll(":", "")}-tooltip`;
  const coordinator = useTooltipCoordinator();
  const activeTooltipId = coordinator?.activeId ?? null;
  const activateTooltip = coordinator?.activate;
  const deactivateTooltip = coordinator?.deactivate;
  const shouldSkipTooltipDelay = coordinator?.shouldSkipDelay;
  const visible = open &&
    (coordinator === null ||
      activeTooltipId === null ||
      activeTooltipId === id);
  const clearTimer = () => {
    if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };
  useEffect(() => clearTimer, []);
  const schedule = (
    nextOpen: boolean,
    delay: number,
    detail: TooltipOpenChangeDetails,
  ) => {
    clearTimer();
    if (nextOpen && suppressedRef.current) return;
    timerRef.current = setTimeout(() => {
      if (nextOpen) activateTooltip?.(id);
      changeOpen(nextOpen, detail);
    }, delay);
  };
  useEffect(() => {
    if (open) activateTooltip?.(id);
    else deactivateTooltip?.(id);
  }, [activateTooltip, deactivateTooltip, id, open]);
  useEffect(() => {
    if (
      open &&
      activeTooltipId !== null &&
      activeTooltipId !== id
    ) {
      clearTimer();
      changeOpen(false, { reason: "another-tooltip" });
    }
  }, [activeTooltipId, changeOpen, id, open]);
  useEffect(
    () => () => deactivateTooltip?.(id),
    [deactivateTooltip, id],
  );
  const triggerProps = trigger.props;
  const describedBy = visible
    ? [triggerProps["aria-describedby"], id].filter(Boolean).join(" ")
    : triggerProps["aria-describedby"];
  const renderedTrigger = cloneElement(trigger, {
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    onPointerEnter: (event) => {
      triggerProps.onPointerEnter?.(event);
      if (event.pointerType === "touch") return;
      schedule(
        true,
        shouldSkipTooltipDelay?.() ? 0 : pointerOpenDelayMs,
        { reason: "pointer" },
      );
    },
    onPointerLeave: (event) => {
      triggerProps.onPointerLeave?.(event);
      if (event.pointerType === "touch") return;
      suppressedRef.current = false;
      schedule(false, 80, { reason: "pointer-leave" });
    },
    onFocus: (event) => {
      triggerProps.onFocus?.(event);
      schedule(true, focusOpenDelayMs, { reason: "focus" });
    },
    onBlur: (event) => {
      triggerProps.onBlur?.(event);
      suppressedRef.current = false;
      schedule(false, 0, { reason: "blur" });
    },
    onKeyDown: (event) => {
      triggerProps.onKeyDown?.(event);
      if (event.key === "Escape" && visible) {
        event.preventDefault();
        clearTimer();
        suppressedRef.current = true;
        changeOpen(false, { reason: "escape" });
      }
    },
    onClick: (event) => {
      triggerProps.onClick?.(event);
      if (visible && !event.defaultPrevented) {
        changeOpen(false, { reason: "trigger-activation" });
      }
    },
  });

  return (
    <span
      ref={ref}
      className={classNames("hjm-tooltip", className)}
      data-placement={descriptor.placement}
      data-align={descriptor.align}
      data-state={visible ? "open" : "closed"}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") clearTimer();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return;
        suppressedRef.current = false;
        schedule(false, 0, { reason: "pointer-leave" });
      }}
    >
      {renderedTrigger}
      {visible ? (
        <span id={id} role="tooltip" className="hjm-tooltip__content">
          {descriptor.content}
        </span>
      ) : null}
    </span>
  );
});

export type MenuItem = Readonly<{
  id: string;
  label: ReactNode;
  /** Required for typeahead when label is not plain text. */
  textValue?: string;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  tone?: MenuItemTone;
  disabled?: boolean;
  /** Backward-compatible item-local action; Menu onAction receives every activation. */
  onSelect?: () => void;
}>;

export type MenuOpenChangeReason =
  | "trigger"
  | "selection"
  | "escape"
  | "outside"
  | "tab";

export type MenuAsyncState =
  | Readonly<{ status: "idle" }>
  | Readonly<{
      status: "loading" | "loadingMore" | "empty" | "error";
      message: ReactNode;
    }>;

type MenuActionSelection = Readonly<{
  selectionMode?: "action";
  value?: never;
  defaultValue?: never;
  onValueChange?: never;
}>;

type MenuSingleSelection =
  | Readonly<{
      selectionMode: "single";
      value: string | null;
      defaultValue?: never;
      onValueChange(value: string): void;
    }>
  | Readonly<{
      selectionMode: "single";
      value?: never;
      defaultValue?: string | null;
      onValueChange?: (value: string) => void;
    }>;

type MenuMultipleSelection =
  | Readonly<{
      selectionMode: "multiple";
      value: ReadonlySet<string>;
      defaultValue?: never;
      onValueChange(value: ReadonlySet<string>): void;
    }>
  | Readonly<{
      selectionMode: "multiple";
      value?: never;
      defaultValue?: ReadonlySet<string>;
      onValueChange?: (value: ReadonlySet<string>) => void;
    }>;

type MenuBaseProps = Readonly<{
  trigger: OverlayTrigger;
  label: string;
  items: readonly MenuItem[];
  density?: MenuDensity;
  disabled?: boolean;
  asyncState?: MenuAsyncState;
  onAction?: (id: string) => void;
  /** Runs only once the owner actually closes the menu. */
  onActionAfterDismiss?: (id: string) => void;
  className?: string;
}>;

export type MenuProps = OpenState<Readonly<{ reason: MenuOpenChangeReason }>> &
  MenuBaseProps &
  (MenuActionSelection | MenuSingleSelection | MenuMultipleSelection);

function menuTextValue(item: MenuItem): string {
  const value = item.textValue ?? (typeof item.label === "string" ? item.label : undefined);
  if (value === undefined || value.trim().length === 0) {
    throw new TypeError(`Menu item ${item.id} needs textValue for typeahead`);
  }
  return value.trim();
}

function validateMenuItems(items: readonly MenuItem[], asyncState: MenuAsyncState): void {
  if (items.length === 0 && (asyncState.status === "idle" || asyncState.status === "loadingMore")) {
    throw new TypeError("Menu requires at least one item");
  }
  const ids = new Set<string>();
  for (const item of items) {
    if (item.id.trim().length === 0) throw new TypeError("Menu item id must not be empty");
    if (ids.has(item.id)) throw new TypeError(`Duplicate Menu item id: ${item.id}`);
    ids.add(item.id);
    menuTextValue(item);
  }
  if (
    (asyncState.status === "idle" || asyncState.status === "loadingMore") &&
    !items.some((item) => !item.disabled)
  ) {
    throw new TypeError("Menu requires at least one enabled item");
  }
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(props, ref) {
  const {
    trigger,
    label,
    items,
    density = menuRecipe.defaults.density,
    disabled = false,
    asyncState = { status: "idle" },
    onAction,
    onActionAfterDismiss,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
  } = props;
  if (label.trim().length === 0) throw new TypeError("Menu label must not be empty");
  validateMenuItems(items, asyncState);
  const selectionMode = props.selectionMode ?? "action";
  const [open, changeOpen] = useOpenState({
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const [focusIndex, setFocusIndex] = useState(() =>
    items.findIndex((item) => !item.disabled),
  );
  const singleSelection = selectionMode === "single"
    ? (props as MenuSingleSelection)
    : undefined;
  const multipleSelection = selectionMode === "multiple"
    ? (props as MenuMultipleSelection)
    : undefined;
  const [singleValue, setSingleValue] = useControllableState<string | null>({
    ...(singleSelection?.value !== undefined
      ? { value: singleSelection.value }
      : {}),
    defaultValue: singleSelection?.defaultValue ?? null,
    ...(singleSelection?.onValueChange !== undefined
      ? {
          onChange: (next: string | null) => {
            if (next !== null) singleSelection.onValueChange?.(next);
          },
        }
      : {}),
  });
  const [multipleValue, setMultipleValue] = useControllableState<ReadonlySet<string>>({
    ...(multipleSelection?.value !== undefined
      ? { value: multipleSelection.value }
      : {}),
    defaultValue: multipleSelection?.defaultValue ?? new Set<string>(),
    ...(multipleSelection?.onValueChange !== undefined
      ? { onChange: multipleSelection.onValueChange }
      : {}),
  });
  const knownIds = new Set(items.map((item) => item.id));
  if (selectionMode === "single" && singleValue !== null && !knownIds.has(singleValue)) {
    throw new RangeError(`Unknown Menu single value: ${singleValue}`);
  }
  if (selectionMode === "multiple") {
    for (const selectedId of multipleValue) {
      if (!knownIds.has(selectedId)) throw new RangeError(`Unknown Menu multiple value: ${selectedId}`);
    }
  }
  const triggerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef(new Map<number, HTMLButtonElement>());
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const afterDismissIdRef = useRef<string | undefined>(undefined);
  const typeaheadRef = useRef({ value: "", time: 0 });
  const id = `${useId().replaceAll(":", "")}-menu`;

  useEffect(() => {
    if (!open) {
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        queueMicrotask(() => triggerRef.current?.focus());
      }
      const completedId = afterDismissIdRef.current;
      if (completedId !== undefined) {
        afterDismissIdRef.current = undefined;
        queueMicrotask(() => onActionAfterDismiss?.(completedId));
      }
      return;
    }
    const item = itemRefs.current.get(focusIndex);
    if (item && !item.disabled) item.focus();
    else contentRef.current?.focus();
  }, [focusIndex, onActionAfterDismiss, open]);

  const itemIsDisabled = (item: MenuItem) =>
    disabled || asyncState.status === "loading" || Boolean(item.disabled);
  const firstEnabled = () => items.findIndex((item) => !itemIsDisabled(item));
  const lastEnabled = () => {
    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (items[index] && !itemIsDisabled(items[index]!)) return index;
    }
    return firstEnabled();
  };
  const focusAt = (index: number) => {
    setFocusIndex(index);
    queueMicrotask(() => itemRefs.current.get(index)?.focus());
  };
  const moveFocus = (step: 1 | -1) => {
    for (let offset = 1; offset <= items.length; offset += 1) {
      const next = (focusIndex + step * offset + items.length) % items.length;
      if (items[next] && !itemIsDisabled(items[next]!)) {
        focusAt(next);
        return;
      }
    }
  };
  const close = (reason: MenuOpenChangeReason, restore: boolean) => {
    if (restore) restoreFocusRef.current = true;
    changeOpen(false, { reason });
  };
  const openMenu = (focus: "first" | "last" = "first") => {
    if (disabled) return;
    const index = focus === "first" ? firstEnabled() : lastEnabled();
    setFocusIndex(index);
    changeOpen(true, { reason: "trigger" });
  };

  const itemSelected = (id: string) =>
    selectionMode === "single"
      ? singleValue === id
      : selectionMode === "multiple"
        ? multipleValue.has(id)
        : false;

  const activateItem = (item: MenuItem, index: number) => {
    if (itemIsDisabled(item)) return;
    item.onSelect?.();
    onAction?.(item.id);
    if (selectionMode === "multiple") {
      const next = new Set(multipleValue);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      setMultipleValue(next);
      focusAt(index);
      return;
    }
    if (selectionMode === "single") setSingleValue(item.id);
    afterDismissIdRef.current = item.id;
    close("selection", true);
  };

  const runTypeahead = (key: string) => {
    const currentTime = Date.now();
    const previous = currentTime - typeaheadRef.current.time < 500
      ? typeaheadRef.current.value
      : "";
    const combined = `${previous}${key}`.toLocaleLowerCase();
    const search = new Set(combined).size === 1 ? key.toLocaleLowerCase() : combined;
    typeaheadRef.current = { value: combined, time: currentTime };
    for (let offset = 1; offset <= items.length; offset += 1) {
      const index = (focusIndex + offset + items.length) % items.length;
      const item = items[index];
      if (
        item &&
        !itemIsDisabled(item) &&
        menuTextValue(item).toLocaleLowerCase().startsWith(search)
      ) {
        focusAt(index);
        return;
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !wrapperRef.current?.contains(event.target)
      ) {
        close("outside", false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  });

  const triggerProps = trigger.props;
  const renderedTrigger = cloneElement(trigger, {
    ref: composeRefs(triggerProps.ref, triggerRef),
    "aria-controls": id,
    "aria-expanded": open,
    "aria-haspopup": "menu",
    "aria-disabled": disabled || undefined,
    disabled: triggerProps.disabled || disabled,
    onClick: (event) => {
      triggerProps.onClick?.(event);
      if (event.defaultPrevented || triggerProps.disabled || disabled) return;
      if (open) close("trigger", false);
      else openMenu();
    },
    onKeyDown: (event) => {
      triggerProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMenu("first");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        openMenu("last");
      }
    },
  });

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(firstEnabled());
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(lastEnabled());
    } else if (event.key === "Escape") {
      event.preventDefault();
      close("escape", true);
    } else if (event.key === "Tab") {
      close("tab", false);
    } else if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      runTypeahead(event.key);
    }
  };

  const showItems = asyncState.status !== "empty" && asyncState.status !== "error";

  return (
    <span ref={wrapperRef} className="hjm-menu" data-state={open ? "open" : "closed"}>
      {renderedTrigger}
      {open ? (
        <div
          ref={composeRefs(contentRef, ref)}
          id={id}
          role="menu"
          aria-label={label}
          className={classNames("hjm-menu__content", className)}
          data-density={density}
          data-async-state={asyncState.status}
          aria-busy={
            asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined
          }
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
        >
          {asyncState.status !== "idle" ? (
            <div
              className="hjm-menu__state-message"
              role={asyncState.status === "error" ? "alert" : "status"}
            >
              {asyncState.message}
            </div>
          ) : null}
          {showItems ? items.map((item, index) => {
            const selected = itemSelected(item.id);
            const itemDisabled = itemIsDisabled(item);
            const role = selectionMode === "single"
              ? "menuitemradio"
              : selectionMode === "multiple"
                ? "menuitemcheckbox"
                : "menuitem";
            return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) itemRefs.current.set(index, node);
                else itemRefs.current.delete(index);
              }}
              type="button"
              role={role}
              aria-checked={selectionMode === "action" ? undefined : selected}
              className="hjm-menu__item"
              data-tone={item.tone ?? menuRecipe.defaults.itemTone}
              data-state={itemDisabled ? "disabled" : selected ? "selected" : "idle"}
              data-focus={index === focusIndex || undefined}
              disabled={itemDisabled}
              tabIndex={!itemDisabled && index === focusIndex ? 0 : -1}
              onClick={() => activateItem(item, index)}
            >
              {item.tone === "danger" ? (
                <span className="hjm-menu__danger-indicator" aria-hidden="true">!</span>
              ) : null}
              {item.leading ? <span className="hjm-menu__leading" aria-hidden="true">{item.leading}</span> : null}
              <span className="hjm-menu__copy">
                <span>{item.label}</span>
                {item.description ? <span className="hjm-menu__description">{item.description}</span> : null}
              </span>
              {item.trailing ? <span className="hjm-menu__trailing">{item.trailing}</span> : null}
            </button>
            );
          }) : null}
        </div>
      ) : null}
    </span>
  );
});
