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
        tone?: Extract<AlertDialogTone, "attention">;
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
