import {
  createAlertDialogSession,
  getAlertDialogInitialFocus,
  validateAlertDialogRequest,
  type AlertDialogPhase,
  type AlertDialogOpenChangeReason,
  type AlertDialogRequest,
  type AlertDialogSession,
} from "@hjmds/design-contracts/components/alert-dialog";
import {
  createSheetLifecycle,
  sheetBehaviorDefaults,
  type SheetDismissPolicy,
  type SheetDismissReason,
  type SheetOpenChangeDetails,
} from "@hjmds/design-contracts/components/sheet";
import {
  resolveTooltipDescriptor,
  tooltipBehaviorDefaults,
  type TooltipAlign,
  type TooltipOpenChangeDetails,
  type TooltipPlacement,
} from "@hjmds/design-contracts/components/tooltip";
import {
  dialogRecipe,
  menuRecipe,
  sheetRecipe,
  type AlertDialogTone,
  type DialogSize,
  type MenuDensity,
  type MenuItemTone,
} from "@hjmds/design-contracts/recipes";
import type { MenuSectionDescriptor } from "@hjmds/design-contracts/behaviors";
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
import {
  AnchoredPortal,
  useAnchoredPopup,
} from "./portal.js";
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

function containsEventTarget(
  container: Node | null,
  target: EventTarget | null,
): boolean {
  return target !== null &&
    "nodeType" in target &&
    container?.contains(target as Node) === true;
}

type ModalPortalProps = Readonly<{
  children: ReactNode;
  container?: HTMLElement;
}>;

function HjmPortal({ children, container }: ModalPortalProps) {
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
type ActiveModal = Readonly<{
  element: HTMLElement;
  order: number;
  priority: number;
}>;
const activeModalStack: ActiveModal[] = [];
let activeModalOrder = 0;
const isolatedModalBackground = new Map<
  HTMLElement,
  Readonly<{ ariaHidden: string | null; inert: boolean }>
>();
let modalIsolationObserver: MutationObserver | null = null;

function getOwnedPopupHosts(modal: ActiveModal): HTMLElement[] {
  const ownerId = modal.element.id;
  if (ownerId.length === 0) return [];
  return [...document.querySelectorAll<HTMLElement>("[data-hjm-popup-owner]")]
    .filter((host) => host.getAttribute("data-hjm-popup-owner") === ownerId);
}

function modalContainsNode(modal: ActiveModal, node: Node): boolean {
  return modal.element.contains(node) ||
    getOwnedPopupHosts(modal).some((host) => host.contains(node));
}

function getModalFocusable(modal: ActiveModal): HTMLElement[] {
  return [
    ...getFocusable(modal.element),
    ...getOwnedPopupHosts(modal).flatMap((host) => getFocusable(host)),
  ];
}

function getModalLayer(priority: number): number {
  if (!Number.isSafeInteger(priority)) {
    throw new TypeError("modalPriority must be a safe integer");
  }
  return 1000 + priority;
}

function getTopModal(): ActiveModal | undefined {
  let top: ActiveModal | undefined;
  for (const modal of activeModalStack) {
    if (!modal.element.isConnected) continue;
    if (
      top === undefined ||
      modal.priority > top.priority ||
      (modal.priority === top.priority && modal.order > top.order)
    ) top = modal;
  }
  return top;
}

function modalRanksAbove(candidate: ActiveModal, reference: ActiveModal): boolean {
  return candidate.priority > reference.priority ||
    (candidate.priority === reference.priority && candidate.order > reference.order);
}

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
  for (let index = activeModalStack.length - 1; index >= 0; index -= 1) {
    if (!activeModalStack[index]?.element.isConnected) activeModalStack.splice(index, 1);
  }
  const top = getTopModal();
  if (!top) {
    modalIsolationObserver?.disconnect();
    modalIsolationObserver = null;
    return;
  }

  const interactivePath = new Set<HTMLElement>();
  for (const root of [top.element, ...getOwnedPopupHosts(top)]) {
    let pathNode: HTMLElement | null = root;
    while (pathNode) {
      if (pathNode === document.body) break;
      interactivePath.add(pathNode);
      pathNode = pathNode.parentElement;
    }
  }
  const inspectedParents = new Set<HTMLElement>();
  for (const pathNode of interactivePath) {
    const parent = pathNode.parentElement;
    if (!parent || inspectedParents.has(parent)) continue;
    inspectedParents.add(parent);
    for (const sibling of parent.children) {
      if (sibling instanceof HTMLElement && !interactivePath.has(sibling)) {
        isolateModalBackgroundElement(sibling);
      }
    }
  }

  if (modalIsolationObserver === null) {
    modalIsolationObserver = new MutationObserver(() => {
      synchronizeModalBackgroundIsolation();
    });
    modalIsolationObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-hjm-popup-owner"],
      childList: true,
      subtree: true,
    });
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
  priority?: number;
  contentRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  fallbackReturnRef?: React.RefObject<HTMLElement | null>;
  onEscape(): void;
}>;

function useModalFocus({
  active,
  priority = 0,
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
      const modal: ActiveModal = {
        element: content,
        order: activeModalOrder += 1,
        priority,
      };
      activeModalStack.push(modal);
      synchronizeModalBackgroundIsolation();
      const initial = initialFocusRef?.current ?? getFocusable(content)[0] ?? content;
      if (getTopModal() === modal) initial.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (getTopModal() !== modal) return;
        if (event.key === "Escape") {
          event.preventDefault();
          escapeRef.current();
          return;
        }
        if (event.key !== "Tab") return;
        const focusable = getModalFocusable(modal);
        if (focusable.length === 0) {
          event.preventDefault();
          content.focus();
          return;
        }
        const first = focusable[0]!;
        const last = focusable.at(-1)!;
        const current = document.activeElement;
        if (event.shiftKey && (current === first || !(current instanceof Node) || !modalContainsNode(modal, current))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (current === last || !(current instanceof Node) || !modalContainsNode(modal, current))) {
          event.preventDefault();
          first.focus();
        }
      };
      const handleFocusIn = (event: FocusEvent) => {
        if (getTopModal() !== modal) return;
        if (event.target instanceof Node && !modalContainsNode(modal, event.target)) {
          (initialFocusRef?.current ?? getFocusable(content)[0] ?? content).focus();
        }
      };
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("focusin", handleFocusIn, true);
      release = () => {
        const wasTop = !activeModalStack.some(
          (candidate) =>
            candidate !== modal && candidate.element.isConnected && modalRanksAbove(candidate, modal),
        );
        document.removeEventListener("keydown", handleKeyDown, true);
        document.removeEventListener("focusin", handleFocusIn, true);
        const stackIndex = activeModalStack.lastIndexOf(modal);
        if (stackIndex >= 0) activeModalStack.splice(stackIndex, 1);
        synchronizeModalBackgroundIsolation();
        releaseScroll();
        const returnTarget =
          returnFocusRef?.current ?? fallbackReturnRef?.current ?? previouslyFocused;
        if (wasTop) {
          queueMicrotask(() => {
            const nextTop = getTopModal();
            if (!nextTop) {
              returnTarget?.focus();
              return;
            }
            if (returnTarget && modalContainsNode(nextTop, returnTarget)) returnTarget.focus();
            else (getModalFocusable(nextTop)[0] ?? nextTop.element).focus();
          });
        }
      };
      if (cancelled) release();
    };
    activate();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      release?.();
    };
  }, [active, contentRef, fallbackReturnRef, initialFocusRef, priority, returnFocusRef]);
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
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
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
    modalPriority = 0,
    portalContainer,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
  },
  forwardedRef,
) {
  const modalLayer = getModalLayer(modalPriority);
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
    priority: modalPriority,
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
        <HjmPortal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
          <div
            className="hjm-overlay"
            data-kind="dialog"
            data-modal-priority={modalPriority}
            data-state="open"
            style={{ zIndex: modalLayer }}
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
              data-hjm-modal-content=""
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
        </HjmPortal>
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
    size?: DialogSize;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
  }>;

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  function AlertDialog(
    {
      trigger,
      request,
      icon,
      size = dialogRecipe.defaults.size,
      returnFocusRef,
      modalPriority = 0,
      portalContainer,
      open: openProp,
      defaultOpen,
      onOpenChange,
      className,
    },
    forwardedRef,
  ) {
    const modalLayer = getModalLayer(modalPriority);
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
      priority: modalPriority,
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
          <HjmPortal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
            <div
              className="hjm-overlay"
              data-kind="alert-dialog"
              data-modal-priority={modalPriority}
              data-state="open"
              style={{ zIndex: modalLayer }}
            >
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
                data-hjm-modal-content=""
                data-size={size}
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
          </HjmPortal>
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
    /** Fires once per visible cycle, after the Sheet portal has been removed. */
    onDismissComplete?: (detail: Readonly<{ reason: SheetDismissReason }>) => void;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
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
  const modalLayer = getModalLayer(modalPriority);
  const [open, changeOpen] = useOpenState({
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const policy: SheetDismissPolicy = { ...sheetBehaviorDefaults, ...dismissPolicy };
  const lifecycleRef = useRef(createSheetLifecycle(open));
  const previousOpenRef = useRef(open);
  const currentOpenRef = useRef(open);
  currentOpenRef.current = open;
  const dismissReasonRef = useRef<SheetDismissReason | undefined>(undefined);
  const dismissCompleteRef = useRef(onDismissComplete);
  dismissCompleteRef.current = onDismissComplete;
  const settleDismissRef = useRef<(reason: SheetDismissReason) => void>(() => undefined);
  settleDismissRef.current = (reason) => {
    const cycle = lifecycleRef.current.beginDismiss();
    if (cycle !== null && lifecycleRef.current.completeDismiss(cycle)) {
      dismissReasonRef.current = undefined;
      previousOpenRef.current = false;
      dismissCompleteRef.current?.({ reason });
    }
  };
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");
  const contentId = `${id}-sheet`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const requestClose = (reason: SheetDismissReason) => {
    if (lifecycleRef.current.requestClose(reason, busy, policy)) {
      dismissReasonRef.current = reason;
      changeOpen(false, { reason });
    }
  };
  useEffect(() => {
    if (open) {
      lifecycleRef.current.open();
      previousOpenRef.current = true;
      dismissReasonRef.current = undefined;
      return;
    }
    if (!previousOpenRef.current) return;
    settleDismissRef.current(dismissReasonRef.current ?? "programmatic");
  }, [open]);
  const mountEpochRef = useRef(0);
  useEffect(() => {
    const epoch = mountEpochRef.current + 1;
    mountEpochRef.current = epoch;
    return () => {
      queueMicrotask(() => {
        // React StrictMode immediately runs the setup again after its probe
        // cleanup. A real unmount has no later epoch and is settled here,
        // after the portal and focus-lock cleanups have completed.
        if (mountEpochRef.current !== epoch || !currentOpenRef.current) return;
        settleDismissRef.current(dismissReasonRef.current ?? "programmatic");
      });
    };
  }, []);
  useModalFocus({
    active: open,
    priority: modalPriority,
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
        <HjmPortal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
          <div
            className="hjm-overlay hjm-sheet-positioner"
            data-kind="sheet"
            data-modal-priority={modalPriority}
            data-placement={placement}
            data-state="open"
            style={{ zIndex: modalLayer }}
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
              data-hjm-modal-content=""
              data-placement={placement}
              data-has-footer={footer ? true : undefined}
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
        </HjmPortal>
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
    portalContainer?: HTMLElement;
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
    portalContainer,
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
  const triggerRef = useRef<HTMLElement>(null);
  const [tooltipNode, setTooltipNode] = useState<HTMLSpanElement | null>(null);
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
    if (delay <= 0) {
      if (nextOpen) activateTooltip?.(id);
      changeOpen(nextOpen, detail);
      return;
    }
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
    ref: composeRefs(triggerProps.ref, triggerRef),
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
      if (containsEventTarget(tooltipNode, event.relatedTarget)) {
        clearTimer();
        return;
      }
      schedule(false, 0, { reason: "pointer-leave" });
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
  const popupPosition = useAnchoredPopup(triggerRef, tooltipNode, {
    align: descriptor.align,
    placement: descriptor.placement,
    zIndex: 1100,
  });
  const setTooltipRef = useCallback((node: HTMLSpanElement | null) => {
    setTooltipNode(node);
  }, []);

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
        if (containsEventTarget(tooltipNode, event.relatedTarget)) {
          clearTimer();
          return;
        }
        schedule(false, 0, { reason: "pointer-leave" });
      }}
    >
      {renderedTrigger}
      {visible ? (
        <AnchoredPortal
          anchorRef={triggerRef}
          ssrFallback="inline"
          {...(portalContainer === undefined ? {} : { container: portalContainer })}
        >
          <span
            ref={setTooltipRef}
            id={id}
            role="tooltip"
            className="hjm-tooltip__content"
            data-placement={popupPosition.placement}
            data-align={popupPosition.align}
            style={popupPosition.style}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") clearTimer();
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "touch") return;
              suppressedRef.current = false;
              if (containsEventTarget(triggerRef.current, event.relatedTarget)) {
                clearTimer();
                return;
              }
              schedule(false, 0, { reason: "pointer-leave" });
            }}
          >
            {descriptor.content}
          </span>
        </AnchoredPortal>
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

export type MenuSection = Omit<MenuSectionDescriptor<string, string>, "items"> &
  Readonly<{ items: readonly MenuItem[] }>;

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

type MenuSourceProps =
  | Readonly<{
      items: readonly MenuItem[];
      sections?: never;
    }>
  | Readonly<{
      items?: never;
      sections: readonly MenuSection[];
    }>;

type MenuBaseProps = Readonly<{
  trigger: OverlayTrigger;
  label: string;
  density?: MenuDensity;
  /** Logical alignment against the trigger; automatically mirrors in RTL. */
  align?: "start" | "end";
  disabled?: boolean;
  asyncState?: MenuAsyncState;
  onAction?: (id: string) => void;
  /** Runs only once the owner actually closes the menu. */
  onActionAfterDismiss?: (id: string) => void;
  portalContainer?: HTMLElement;
  className?: string;
}> & MenuSourceProps;

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

function validateMenuItems(
  items: readonly MenuItem[],
  sections: readonly MenuSection[] | undefined,
  asyncState: MenuAsyncState,
): void {
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
  if (sections !== undefined) {
    const sectionIds = new Set<string>();
    for (const section of sections) {
      if (section.id.trim().length === 0) throw new TypeError("Menu section id must not be empty");
      if (sectionIds.has(section.id)) throw new TypeError(`Duplicate Menu section id: ${section.id}`);
      sectionIds.add(section.id);
      if (section.items.length === 0) throw new TypeError(`Menu section ${section.id} must not be empty`);
      if ((section.label?.trim().length ?? 0) === 0 &&
        (section.accessibilityLabel?.trim().length ?? 0) === 0) {
        throw new TypeError(`Menu section ${section.id} needs a label or accessibilityLabel`);
      }
    }
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
    density = menuRecipe.defaults.density,
    align = "start",
    disabled = false,
    asyncState = { status: "idle" },
    onAction,
    onActionAfterDismiss,
    portalContainer,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
  } = props;
  const sections = props.sections;
  const items = sections === undefined ? props.items : sections.flatMap((section) => section.items);
  if (label.trim().length === 0) throw new TypeError("Menu label must not be empty");
  validateMenuItems(items, sections, asyncState);
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
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef(false);
  const afterDismissIdRef = useRef<string | undefined>(undefined);
  const typeaheadRef = useRef({ value: "", time: 0 });
  const id = `${useId().replaceAll(":", "")}-menu`;
  const popupPosition = useAnchoredPopup(triggerRef, contentNode, { align, zIndex: 900 });
  const setMenuContentRef = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
    setContentNode(node);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

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
  }, [contentNode, focusIndex, onActionAfterDismiss, open]);

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
        !wrapperRef.current?.contains(event.target) &&
        !contentRef.current?.contains(event.target)
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
        <AnchoredPortal
          anchorRef={triggerRef}
          ssrFallback="inline"
          {...(portalContainer === undefined ? {} : { container: portalContainer })}
        >
          <div
            ref={setMenuContentRef}
            id={id}
            role="menu"
            aria-label={label}
            className={classNames("hjm-menu__content", className)}
            data-density={density}
            data-async-state={asyncState.status}
            data-placement={popupPosition.placement}
            data-align={popupPosition.align}
            aria-busy={
              asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined
            }
            style={popupPosition.style}
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
            {showItems ? (sections === undefined ? items.map((item, index) => {
              const selected = itemSelected(item.id);
              const itemDisabled = itemIsDisabled(item);
              const role = selectionMode === "single"
                ? "menuitemradio"
                : selectionMode === "multiple"
                  ? "menuitemcheckbox"
                  : "menuitem";
              return renderMenuItem(item, index, role, selected, itemDisabled);
            }) : sections.map((section, sectionIndex) => {
              const sectionLabelId = `${id}-section-${sectionIndex}`;
              const firstIndex = sections
                .slice(0, sectionIndex)
                .reduce((total, current) => total + current.items.length, 0);
              return (
                <div key={section.id} className="hjm-menu__section-boundary">
                  {sectionIndex > 0 ? <div role="separator" className="hjm-menu__separator" /> : null}
                  <div
                    role="group"
                    aria-labelledby={section.label ? sectionLabelId : undefined}
                    aria-label={section.label ? undefined : section.accessibilityLabel}
                    className="hjm-menu__section"
                  >
                    {section.label ? (
                      <div id={sectionLabelId} className="hjm-menu__section-label">
                        {section.label}
                      </div>
                    ) : null}
                    {section.items.map((item, itemIndex) => {
                      const index = firstIndex + itemIndex;
                      const selected = itemSelected(item.id);
                      const itemDisabled = itemIsDisabled(item);
                      const role = selectionMode === "single"
                        ? "menuitemradio"
                        : selectionMode === "multiple"
                          ? "menuitemcheckbox"
                          : "menuitem";
                      return renderMenuItem(item, index, role, selected, itemDisabled);
                    })}
                  </div>
                </div>
              );
            })) : null}
          </div>
        </AnchoredPortal>
      ) : null}
    </span>
  );

  function renderMenuItem(
    item: MenuItem,
    index: number,
    role: "menuitem" | "menuitemradio" | "menuitemcheckbox",
    selected: boolean,
    itemDisabled: boolean,
  ) {
    return (
      <button
        key={item.id}
        ref={(node) => {
          if (node) {
            itemRefs.current.set(index, node);
            if (open && !itemDisabled && index === focusIndex) {
              queueMicrotask(() => {
                if (node.isConnected && open) node.focus();
              });
            }
          } else itemRefs.current.delete(index);
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
  }
});
