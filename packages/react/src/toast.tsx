import {
  createToastStore,
  resolveToastDescriptor,
  type ResolvedToastDescriptor,
  type ToastDescriptor,
  type ToastDismissReason,
  type ToastDuplicatePolicy,
  type ToastId,
  type ToastOverflowPolicy,
  type ToastPublishOptions,
  type ToastPublishResult,
  type ToastSessionSnapshot,
  type ToastStore,
  type ToastTimerUpdatePolicy,
} from "@hjm/design-contracts/components/toast";
import {
  toastRecipe,
  type ToastPlacement,
} from "@hjm/design-contracts/recipes";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import { createHjmThemeStyle } from "./theme.js";

const toneMarks = {
  neutral: "●",
  info: "i",
  success: "✓",
  warning: "!",
  danger: "!",
} as const;

type ToastCardProps = Readonly<{
  descriptor: ResolvedToastDescriptor;
  phase: "visible" | "closing";
  onAction(): void;
  onDismiss(reason: ToastDismissReason): void;
  onPointerPause?(): void;
  onPointerResume?(): void;
  onFocusPause?(): void;
  onFocusResume?(): void;
  className?: string;
}>;

const ToastCard = forwardRef<HTMLDivElement, ToastCardProps>(function ToastCard(
  {
    descriptor,
    phase,
    onAction,
    onDismiss,
    onPointerPause,
    onPointerResume,
    onFocusPause,
    onFocusResume,
    className,
  },
  ref,
) {
  const baseId = useId().replaceAll(":", "");
  const titleId = `${baseId}-toast-title`;
  const descriptionId = `${baseId}-toast-description`;
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss("escape");
    }
  };
  return (
    <div
      ref={ref}
      className={classNames("hjm-toast", className)}
      data-tone={descriptor.tone}
      data-state={phase}
      role="group"
      aria-labelledby={descriptor.title ? titleId : undefined}
      aria-describedby={descriptionId}
      onPointerEnter={onPointerPause}
      onPointerLeave={onPointerResume}
      onFocusCapture={onFocusPause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onFocusResume?.();
      }}
      onKeyDown={handleKeyDown}
    >
      <span
        className="hjm-visually-hidden"
        role={descriptor.priority === "high" ? "alert" : "status"}
      >
        {descriptor.announcement}
      </span>
      <span className="hjm-toast__tone-mark" aria-hidden="true" />
      <span className="hjm-toast__icon" aria-hidden="true">
        {toneMarks[descriptor.tone]}
      </span>
      <span className="hjm-toast__content">
        {descriptor.title ? (
          <strong id={titleId} className="hjm-toast__title">{descriptor.title}</strong>
        ) : null}
        <span id={descriptionId} className="hjm-toast__description">
          {descriptor.description}
        </span>
      </span>
      {descriptor.action ? (
        <button
          type="button"
          className="hjm-toast__action"
          aria-label={descriptor.action.accessibilityLabel}
          onClick={onAction}
        >
          {descriptor.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className="hjm-toast__close"
        aria-label={descriptor.closeLabel}
        onClick={() => onDismiss("close-action")}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
});

export type ToastProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  Readonly<{
    descriptor: ToastDescriptor;
    onDismissRequest: (reason: ToastDismissReason) => void;
  }>;

/** Controlled single-toast renderer; ToastProvider supplies the full FIFO lifecycle. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { descriptor, onDismissRequest, className },
  ref,
) {
  const resolved = resolveToastDescriptor(descriptor);
  const actionInvokedRef = useRef(false);
  useEffect(() => {
    actionInvokedRef.current = false;
  }, [descriptor]);
  return (
    <ToastCard
      ref={ref}
      descriptor={resolved}
      phase="visible"
      {...(className === undefined ? {} : { className })}
      onDismiss={onDismissRequest}
      onAction={() => {
        const action = resolved.action;
        if (!action || actionInvokedRef.current) return;
        actionInvokedRef.current = true;
        action.onAction();
        if (action.dismissOnAction) onDismissRequest("action");
      }}
    />
  );
});

export type ToastApi = Readonly<{
  publish(descriptor: ToastDescriptor, options?: ToastPublishOptions): ToastPublishResult;
  dismiss(id: ToastId, reason: ToastDismissReason): boolean;
  close(id: ToastId): boolean;
}>;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (value === null) throw new Error("useToast must be used inside ToastProvider");
  return value;
}

export type ToastProviderProps = Readonly<{
  children: ReactNode;
  label: string;
  placement?: ToastPlacement;
  store?: ToastStore;
  initialToasts?: readonly ToastDescriptor[];
  maxVisible?: number;
  maxQueued?: number;
  duplicatePolicy?: ToastDuplicatePolicy;
  timerUpdatePolicy?: ToastTimerUpdatePolicy;
  overflowPolicy?: ToastOverflowPolicy;
  portalContainer?: HTMLElement;
}>;

type ToastPortalProps = Readonly<{
  children: ReactNode;
  container?: HTMLElement;
}>;

function ToastPortal({ children, container }: ToastPortalProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useOptionalHjmTheme();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    theme ? (
      <div
        className="hjm-root hjm-portal"
        data-hjm-portal="toast"
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

function renderStoreToast(
  snapshot: ToastSessionSnapshot,
  store: ToastStore,
): ReactNode {
  if (snapshot.phase !== "visible" && snapshot.phase !== "closing") return null;
  const id = snapshot.descriptor.id;
  return (
    <ToastCard
      key={id}
      descriptor={snapshot.descriptor}
      phase={snapshot.phase}
      onAction={() => store.invokeAction(id)}
      onDismiss={(reason) => store.dismiss(id, reason)}
      onPointerPause={() => store.pause(id, "pointer")}
      onPointerResume={() => store.resume(id, "pointer")}
      onFocusPause={() => store.pause(id, "focus")}
      onFocusResume={() => store.resume(id, "focus")}
    />
  );
}

export function ToastProvider({
  children,
  label,
  placement = toastRecipe.defaults.placement,
  store,
  initialToasts = [],
  maxVisible,
  maxQueued,
  duplicatePolicy,
  timerUpdatePolicy,
  overflowPolicy,
  portalContainer,
}: ToastProviderProps) {
  if (label.trim().length === 0) throw new TypeError("ToastProvider label must not be empty");
  const internalStoreRef = useRef<ToastStore | null>(null);
  if (store === undefined && internalStoreRef.current === null) {
    internalStoreRef.current = createToastStore({
      ...(maxVisible === undefined ? {} : { maxVisible }),
      ...(maxQueued === undefined ? {} : { maxQueued }),
      ...(duplicatePolicy === undefined ? {} : { duplicatePolicy }),
      ...(timerUpdatePolicy === undefined ? {} : { timerUpdatePolicy }),
      ...(overflowPolicy === undefined ? {} : { overflowPolicy }),
    });
    for (const descriptor of initialToasts) internalStoreRef.current.publish(descriptor);
  }
  const activeStore = store ?? internalStoreRef.current;
  if (activeStore === null) throw new Error("ToastProvider could not create a store");
  const snapshot = useSyncExternalStore(
    activeStore.subscribe,
    activeStore.getSnapshot,
    activeStore.getSnapshot,
  );
  const theme = useOptionalHjmTheme();
  const api = useMemo<ToastApi>(
    () => ({
      publish: (descriptor, options) => activeStore.publish(descriptor, options),
      dismiss: (id, reason) => activeStore.dismiss(id, reason),
      close: (id) => activeStore.close(id),
    }),
    [activeStore],
  );

  useEffect(() => {
    const ownedStore = internalStoreRef.current;
    return () => {
      if (ownedStore) ownedStore.dispose();
    };
  }, []);

  const hasRunningTimer = snapshot.visible.some(
    (entry) => entry.timer.status === "running",
  );
  useEffect(() => {
    if (!hasRunningTimer) return;
    let previousTime = performance.now();
    const timer = setInterval(() => {
      const currentTime = performance.now();
      activeStore.advanceTime(currentTime - previousTime);
      previousTime = currentTime;
    }, 100);
    return () => clearInterval(timer);
  }, [activeStore, hasRunningTimer]);

  const closingIds = snapshot.visible
    .filter((entry) => entry.phase === "closing")
    .map((entry) => entry.descriptor.id)
    .join("\u0000");
  useEffect(() => {
    if (closingIds.length === 0) return;
    const ids = closingIds.split("\u0000");
    const timer = setTimeout(
      () => ids.forEach((id) => activeStore.completeExit(id)),
      theme?.environment.reducedMotion ? 0 : 160,
    );
    return () => clearTimeout(timer);
  }, [activeStore, closingIds, theme?.environment.reducedMotion]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") activeStore.pauseAll("window");
      else activeStore.resumeAll("window");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeStore]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {snapshot.visible.length > 0 ? (
        <ToastPortal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
          <div
            className="hjm-toast-viewport"
            data-placement={placement}
            role="region"
            aria-label={label}
          >
            {snapshot.visible.map((entry) => renderStoreToast(entry, activeStore))}
          </div>
        </ToastPortal>
      ) : null}
    </ToastContext.Provider>
  );
}
