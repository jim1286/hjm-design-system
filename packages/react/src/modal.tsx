import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type AriaAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { composeRefs } from "./internal.js";
import { getPopoverOwner } from "./portal.js";
import { useOptionalHjmTheme } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";

/*
  Shared modal machinery for Dialog, AlertDialog, Sheet, and SidePanel. Keeping it
  inside overlays.tsx would drag the Menu and Tooltip graph into SidePanel's granular
  entry; copying it would split `activeModalStack` in two, so a Dialog and a SidePanel
  would each believe they are topmost. The stack, the body-scroll lock, and background
  isolation must stay single module-level instances, so they live here alone.
*/

export type TriggerElementProps = Readonly<{
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

export function containsEventTarget(
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

export function HjmPortal({ children, container }: ModalPortalProps) {
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
        data-large-text={isLargeTextScale(theme.environment.textScale) ? "true" : undefined}
        dir={theme.environment.direction}
        style={createHjmThemeStyle(theme)}
      >
        {children}
      </div>
    ) : children,
    container ?? document.body,
  );
}

export type OpenState<Detail> =
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

export type ModalOpenState<Detail> =
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

export function useOpenState<Detail>({
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

export function getFocusable(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) => element.tabIndex >= 0 && !element.matches(":disabled") &&
      !element.closest('[hidden],[inert],[aria-hidden="true"]') &&
      element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden",
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

export function getModalLayer(priority: number): number {
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

export function useModalFocus({
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
          // A focused non-modal child owns its first Escape. Let its content (or
          // nested menu) handle it before dismissing the containing modal.
          if (event.target instanceof Node && getPopoverOwner(event.target)) return;
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

export function renderTrigger(
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

