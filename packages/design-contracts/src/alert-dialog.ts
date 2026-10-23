import type { AlertDialogTone } from "./component-recipes.js";

export type AlertDialogMode = "alert" | "confirm";
export type AlertDialogInitialFocus = "cancel" | "confirm";
export type AlertDialogAsyncState = "idle" | "busy" | "error";
export type AlertDialogConfirmAction = () => void | Promise<void>;
export type AlertDialogCancelReason =
  | "cancel-action"
  | "escape"
  | "back"
  | "programmatic"
  | "interrupted";
export type AlertDialogDismissReason =
  | Exclude<AlertDialogCancelReason, "interrupted">
  | "outside";
export type AlertDialogOpenChangeReason = "trigger" | "confirm" | AlertDialogCancelReason;

export type AlertDialogResult =
  | Readonly<{ outcome: "confirmed" }>
  | Readonly<{ outcome: "cancelled"; reason: AlertDialogCancelReason }>;

type AlertDialogAsyncAction =
  | Readonly<{
      onConfirm: AlertDialogConfirmAction;
      fallbackErrorMessage: string;
      resolveErrorMessage?: (error: unknown) => string;
    }>
  | Readonly<{
      onConfirm?: never;
      fallbackErrorMessage?: never;
      resolveErrorMessage?: never;
    }>;

type AlertDialogCopy = Readonly<{
  title: string;
  description: string;
  confirmLabel: string;
}>;

/**
 * Renderer-neutral copy and action contract. Products own localized copy;
 * renderers own modal isolation, focus, motion, and visual translation.
 */
export type AlertDialogRequest =
  | (AlertDialogCopy &
      Readonly<{
        mode: "alert";
        // Every tone except `danger` can announce without a choice. A danger
        // dialog with no cancel would let a destructive act through on one key.
        tone?: Exclude<AlertDialogTone, "danger">;
        cancelLabel?: never;
        onConfirm?: never;
        fallbackErrorMessage?: never;
        resolveErrorMessage?: never;
      }>)
  | (AlertDialogCopy &
      Readonly<{
        mode: "confirm";
        tone?: AlertDialogTone;
        cancelLabel: string;
      }> &
      AlertDialogAsyncAction);

export type AlertDialogOpenState =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange(
        open: boolean,
        detail: Readonly<{ reason: AlertDialogOpenChangeReason }>,
      ): void;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (
        open: boolean,
        detail: Readonly<{ reason: AlertDialogOpenChangeReason }>,
      ) => void;
    }>;

export const alertDialogBehaviorDefaults = {
  initialFocus: { alert: "confirm", confirm: "cancel" },
  outsideDismiss: false,
  escapeOrBackOutcome: "cancelled",
  dismissWhileBusy: false,
} as const satisfies Readonly<{
  initialFocus: Record<AlertDialogMode, AlertDialogInitialFocus>;
  outsideDismiss: false;
  escapeOrBackOutcome: "cancelled";
  dismissWhileBusy: false;
}>;

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`AlertDialog ${field} must not be empty`);
  }
}

export function validateAlertDialogRequest(request: AlertDialogRequest): void {
  assertCopy(request.title, "title");
  assertCopy(request.description, "description");
  assertCopy(request.confirmLabel, "confirmLabel");
  if (request.mode === "alert") {
    if (request.tone === ("danger" as AlertDialogTone)) {
      throw new TypeError("AlertDialog danger tone requires confirm mode");
    }
    return;
  }
  assertCopy(request.cancelLabel, "cancelLabel");
  if (request.onConfirm) assertCopy(request.fallbackErrorMessage, "fallbackErrorMessage");
}

export function getAlertDialogInitialFocus(
  mode: AlertDialogMode,
): AlertDialogInitialFocus {
  return alertDialogBehaviorDefaults.initialFocus[mode];
}

export function canDismissAlertDialog(
  reason: AlertDialogDismissReason,
  busy: boolean,
): boolean {
  if (busy && !alertDialogBehaviorDefaults.dismissWhileBusy) return false;
  if (reason === "outside") return alertDialogBehaviorDefaults.outsideDismiss;
  return true;
}

export type AlertDialogPhase =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "busy" }>
  | Readonly<{ status: "error"; message: string }>
  | Readonly<{ status: "closing"; result: AlertDialogResult }>
  | Readonly<{ status: "closed"; result: AlertDialogResult }>;

export type AlertDialogSession = Readonly<{
  request: AlertDialogRequest;
  result: Promise<AlertDialogResult>;
  getSnapshot(): AlertDialogPhase;
  subscribe(listener: () => void): () => void;
  /** Returns true only for the attempt that moved the session toward closing. */
  confirm(): Promise<boolean>;
  cancel(reason: Exclude<AlertDialogCancelReason, "interrupted">): boolean;
  attemptOutsideDismiss(): false;
  completeExit(): boolean;
  interrupt(): boolean;
}>;

function resolveFailureMessage(
  request: Extract<AlertDialogRequest, { mode: "confirm" }>,
  error: unknown,
): string {
  if (!request.onConfirm) return "";
  try {
    const resolved = request.resolveErrorMessage?.(error).trim();
    return resolved || request.fallbackErrorMessage;
  } catch {
    return request.fallbackErrorMessage;
  }
}

/**
 * Owns a complete AlertDialog lifecycle, including side-effect de-duplication
 * and settling only after the renderer reports that exit motion completed.
 */
export function createAlertDialogSession(
  request: AlertDialogRequest,
): AlertDialogSession {
  validateAlertDialogRequest(request);

  let phase: AlertDialogPhase = { status: "idle" };
  let settleResult!: (result: AlertDialogResult) => void;
  let settled = false;
  const listeners = new Set<() => void>();
  const result = new Promise<AlertDialogResult>((resolve) => {
    settleResult = resolve;
  });

  const notify = () => {
    for (const listener of listeners) listener();
  };
  const transition = (next: AlertDialogPhase) => {
    phase = next;
    notify();
  };
  const settle = (next: AlertDialogResult): boolean => {
    if (settled) return false;
    settled = true;
    settleResult(next);
    return true;
  };

  const session: AlertDialogSession = {
    request,
    result,
    getSnapshot: () => phase,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async confirm() {
      if (phase.status !== "idle" && phase.status !== "error") return false;

      if (request.mode === "alert" || !request.onConfirm) {
        transition({ status: "closing", result: { outcome: "confirmed" } });
        return true;
      }

      transition({ status: "busy" });
      try {
        await request.onConfirm();
        if ((phase as AlertDialogPhase).status !== "busy") return false;
        transition({ status: "closing", result: { outcome: "confirmed" } });
        return true;
      } catch (error) {
        if ((phase as AlertDialogPhase).status !== "busy") return false;
        transition({ status: "error", message: resolveFailureMessage(request, error) });
        return false;
      }
    },
    cancel(reason) {
      if (!canDismissAlertDialog(reason, phase.status === "busy")) return false;
      if (phase.status !== "idle" && phase.status !== "error") return false;
      transition({ status: "closing", result: { outcome: "cancelled", reason } });
      return true;
    },
    attemptOutsideDismiss() {
      return false;
    },
    completeExit() {
      if (phase.status !== "closing") return false;
      const finalResult = phase.result;
      transition({ status: "closed", result: finalResult });
      return settle(finalResult);
    },
    interrupt() {
      if (phase.status === "closed") return false;
      const interrupted: AlertDialogResult = {
        outcome: "cancelled",
        reason: "interrupted",
      };
      transition({ status: "closed", result: interrupted });
      return settle(interrupted);
    },
  };

  return session;
}

/**
 * A FIFO of AlertDialog requests where each `enqueue` returns the dialog's result. 2026-10-23: BurnTok web and app
 * AppDialog (321 and 293 lines) each rebuilt this around AlertDialog: a result Promise, one dialog at a time in
 * arrival order, route-scoped cancellation and focus return. The session above still owns confirm/busy/error per
 * dialog; the queue only orders requests and settles each promise exactly once.
 *
 * `scope` is the owner (usually the route) the call was made from. `retainScope(current)` cancels entries from any
 * other scope with `interrupted`, so a departed screen's question is never answered on the next one, and a stale
 * callback that enqueues after its screen left is cancelled the same way. Renderers show only the head.
 */
export type AlertDialogQueueEntry<Options> = Readonly<{
  id: number;
  request: AlertDialogRequest;
  options: Options;
  scope: string | undefined;
}>;

export type AlertDialogQueue<Options> = Readonly<{
  enqueue(request: AlertDialogRequest, options: Options, scope: string | undefined): Promise<AlertDialogResult>;
  /** Entries in arrival order; the first is the dialog on screen. */
  getSnapshot(): readonly AlertDialogQueueEntry<Options>[];
  subscribe(listener: () => void): () => void;
  /** Settles the head entry with its dialog's result and shows the next. Returns false for any other id. */
  settle(id: number, result: AlertDialogResult): boolean;
  retainScope(scope: string | undefined): void;
  /**
   * Whether a renderer is mounted to show the queue (default true). `false` cancels every entry with `interrupted`
   * and settles later requests `interrupted` at once, so nothing waits on a dialog no one can answer. Reversible
   * because React StrictMode replays an unmount and mount on the same provider.
   */
  setActive(active: boolean): void;
}>;

const interruptedResult: AlertDialogResult = { outcome: "cancelled", reason: "interrupted" };

export function createAlertDialogQueue<Options>(): AlertDialogQueue<Options> {
  type Pending = AlertDialogQueueEntry<Options> & Readonly<{ resolve: (result: AlertDialogResult) => void }>;
  let entries: readonly Pending[] = [];
  let snapshot: readonly AlertDialogQueueEntry<Options>[] = [];
  let nextId = 1;
  let active = true;
  const listeners = new Set<() => void>();
  // Resolve before notifying: the caller's `await` continuation is queued ahead of the renderer's re-render, so a
  // trigger it re-enables is focusable when the closing dialog returns focus.
  const commit = (next: readonly Pending[], settled: readonly [Pending, AlertDialogResult][]) => {
    for (const [entry, result] of settled) entry.resolve(result);
    entries = next;
    snapshot = next.map(({ id, request, options, scope }) => ({ id, request, options, scope }));
    for (const listener of listeners) listener();
  };
  return {
    enqueue(request, options, scope) {
      validateAlertDialogRequest(request);
      if (!active) return Promise.resolve(interruptedResult);
      return new Promise<AlertDialogResult>((resolve) => {
        commit([...entries, { id: nextId++, request, options, scope, resolve }], []);
      });
    },
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    settle(id, result) {
      const head = entries[0];
      if (head === undefined || head.id !== id) return false;
      commit(entries.slice(1), [[head, result]]);
      return true;
    },
    retainScope(scope) {
      const stale = entries.filter((entry) => entry.scope !== scope);
      if (stale.length === 0) return;
      commit(entries.filter((entry) => entry.scope === scope), stale.map((entry) => [entry, interruptedResult]));
    },
    setActive(next) {
      active = next;
      if (next || entries.length === 0) return;
      commit([], entries.map((entry) => [entry, interruptedResult]));
    },
  };
}
