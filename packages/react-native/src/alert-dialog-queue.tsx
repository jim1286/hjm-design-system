import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ComponentRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import type { View } from "react-native";
import {
  createAlertDialogQueue,
  type AlertDialogRequest,
  type AlertDialogResult,
} from "@hjmds/design-contracts/components/alert-dialog";
import type { DialogSize } from "@hjmds/design-contracts/recipes";
import { AlertDialog } from "./overlays.js";

/*
  Imperative AlertDialog with results. BurnTok's app AppDialog (293 lines) rebuilt this around AlertDialog: a result
  Promise, FIFO order and route-scoped cancellation (2026-10-23). The AlertDialog session still owns confirm/busy/error;
  the contracts queue owns order and settles each promise once, from AlertDialog `onResult` after native dismissal,
  so the next dialog never presents over a closing one.
*/

export type AlertDialogQueueOptions = Readonly<{
  size?: DialogSize;
  /** Where accessibility focus returns after this dialog (native has no document focus to capture). */
  returnFocusRef?: RefObject<ComponentRef<typeof View> | null>;
}>;

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

export type AlertDialogQueueProviderProps = Readonly<{
  children: ReactNode;
  /** The owner of queued questions, usually the route path. When it changes, other scopes' requests settle `interrupted`. */
  scope?: string;
}>;

export function AlertDialogQueueProvider({ children, scope }: AlertDialogQueueProviderProps): ReactElement {
  const [queue] = useState(() => createAlertDialogQueue<AlertDialogQueueOptions>());
  const entries = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);
  // The head stays mounted while its exit runs; `onResult` (after native dismissal) settles it.
  const [closingId, setClosingId] = useState<number | null>(null);
  useEffect(() => {
    queue.setActive(true);
    return () => queue.setActive(false);
  }, [queue]);
  useEffect(() => { queue.retainScope(scope); }, [queue, scope, entries]);
  const context = useMemo<QueueContext>(() => ({ open: (request, options, requestScope) => queue.enqueue(request, options, requestScope), scope }), [queue, scope]);
  const head = entries[0];
  const visible = head !== undefined && head.scope === scope ? head : undefined;
  return (
    <AlertDialogQueueContext.Provider value={context}>
      {children}
      {visible ? (
        <AlertDialog
          key={visible.id}
          open={closingId !== visible.id}
          request={visible.request}
          {...(visible.options.size === undefined ? {} : { size: visible.options.size })}
          {...(visible.options.returnFocusRef === undefined ? {} : { returnFocusRef: visible.options.returnFocusRef })}
          onOpenChange={(next) => { if (!next) setClosingId(visible.id); }}
          onResult={(result) => { queue.settle(visible.id, result); }}
        />
      ) : null}
    </AlertDialogQueueContext.Provider>
  );
}
