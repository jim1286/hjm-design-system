"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  createAlertDialogQueue,
  type AlertDialogOpenChangeReason,
  type AlertDialogRequest,
  type AlertDialogResult,
} from "@hjmds/design-contracts/components/alert-dialog";
import type { DialogSize } from "@hjmds/design-contracts/recipes";
import { AlertDialog } from "./overlays.js";

/*
  Imperative AlertDialog with results. BurnTok's web AppDialog (321 lines) rebuilt this around AlertDialog: a result
  Promise, FIFO order, route-scoped cancellation and focus return (2026-10-23). The AlertDialog session still owns
  confirm/busy/error (an async `request.onConfirm` keeps the dialog open and busy, and open with the error when it
  fails); the contracts queue owns order and settles each promise once. Unlike OverlayStackProvider (one Dialog or
  Sheet, a second open throws), requests here wait their turn: a confirmation asked while another is open is normal.
*/

/** Per-request presentation; copy and actions stay in the request. */
export type AlertDialogQueueOptions = Readonly<{ icon?: ReactNode; size?: DialogSize }>;

export type AlertDialogQueueApi = Readonly<{
  /** Shows the request after those already waiting; resolves once its dialog closed with that outcome. */
  open(request: AlertDialogRequest, options?: AlertDialogQueueOptions): Promise<AlertDialogResult>;
}>;

type QueueContext = Readonly<{
  open(request: AlertDialogRequest, options: AlertDialogQueueOptions, scope: string | undefined): Promise<AlertDialogResult>;
  scope: string | undefined;
}>;

const AlertDialogQueueContext = createContext<QueueContext | null>(null);

/** `open` is bound to the provider scope this component rendered under; after that scope changes it settles `interrupted`. */
export function useAlertDialogQueue(): AlertDialogQueueApi {
  const context = useContext(AlertDialogQueueContext);
  if (context === null) throw new Error("useAlertDialogQueue must be used inside AlertDialogQueueProvider");
  const { open, scope } = context;
  return useMemo(() => ({ open: (request, options = {}) => open(request, options, scope) }), [open, scope]);
}

// No `layoutStyle`: a context provider with no box of its own.
export type AlertDialogQueueProviderProps = Readonly<{
  children: ReactNode;
  /** The owner of queued questions, usually the route. When it changes, other scopes' requests settle `interrupted`. */
  scope?: string;
  /** Modal priority of the queued dialogs (default 0). A higher-priority gate stays above and interactive. */
  modalPriority?: number;
  portalContainer?: HTMLElement;
}>;

function resultOf(reason: AlertDialogOpenChangeReason): AlertDialogResult {
  if (reason === "confirm") return { outcome: "confirmed" };
  return { outcome: "cancelled", reason: reason === "trigger" ? "programmatic" : reason };
}

export function AlertDialogQueueProvider({ children, scope, modalPriority, portalContainer }: AlertDialogQueueProviderProps): ReactElement {
  const [queue] = useState(() => createAlertDialogQueue<AlertDialogQueueOptions>());
  const entries = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);
  // The element focused when a run of questions began: every dialog of the run returns there, so the second dialog
  // does not return focus to the first one's removed button.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    queue.setActive(true);
    return () => queue.setActive(false);
  }, [queue]);
  useEffect(() => { queue.retainScope(scope); }, [queue, scope, entries]);
  const open = useMemo<QueueContext["open"]>(() => (request, options, requestScope) => {
    if (queue.getSnapshot().length === 0) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement : null;
    }
    return queue.enqueue(request, options, requestScope);
  }, [queue]);
  const context = useMemo<QueueContext>(() => ({ open, scope }), [open, scope]);
  const head = entries[0];
  const visible = head !== undefined && head.scope === scope ? head : undefined;
  return (
    <AlertDialogQueueContext.Provider value={context}>
      {children}
      {visible ? (
        <AlertDialog
          key={visible.id}
          open
          request={visible.request}
          returnFocusRef={returnFocusRef}
          {...(visible.options.icon === undefined ? {} : { icon: visible.options.icon })}
          {...(visible.options.size === undefined ? {} : { size: visible.options.size })}
          {...(modalPriority === undefined ? {} : { modalPriority })}
          {...(portalContainer === undefined ? {} : { portalContainer })}
          onOpenChange={(next, { reason }) => { if (!next) queue.settle(visible.id, resultOf(reason)); }}
        />
      ) : null}
    </AlertDialogQueueContext.Provider>
  );
}
