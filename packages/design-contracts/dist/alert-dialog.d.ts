import type { AlertDialogTone } from "./component-recipes.js";
export type AlertDialogMode = "alert" | "confirm";
export type AlertDialogInitialFocus = "cancel" | "confirm";
export type AlertDialogAsyncState = "idle" | "busy" | "error";
export type AlertDialogConfirmAction = () => void | Promise<void>;
export type AlertDialogCancelReason = "cancel-action" | "escape" | "back" | "programmatic" | "interrupted";
export type AlertDialogDismissReason = Exclude<AlertDialogCancelReason, "interrupted"> | "outside";
export type AlertDialogOpenChangeReason = "trigger" | "confirm" | AlertDialogCancelReason;
export type AlertDialogResult = Readonly<{
    outcome: "confirmed";
}> | Readonly<{
    outcome: "cancelled";
    reason: AlertDialogCancelReason;
}>;
type AlertDialogAsyncAction = Readonly<{
    onConfirm: AlertDialogConfirmAction;
    fallbackErrorMessage: string;
    resolveErrorMessage?: (error: unknown) => string;
}> | Readonly<{
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
export type AlertDialogRequest = (AlertDialogCopy & Readonly<{
    mode: "alert";
    tone?: Exclude<AlertDialogTone, "danger">;
    cancelLabel?: never;
    onConfirm?: never;
    fallbackErrorMessage?: never;
    resolveErrorMessage?: never;
}>) | (AlertDialogCopy & Readonly<{
    mode: "confirm";
    tone?: AlertDialogTone;
    cancelLabel: string;
}> & AlertDialogAsyncAction);
export type AlertDialogOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, detail: Readonly<{
        reason: AlertDialogOpenChangeReason;
    }>): void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: Readonly<{
        reason: AlertDialogOpenChangeReason;
    }>) => void;
}>;
export declare const alertDialogBehaviorDefaults: {
    readonly initialFocus: {
        readonly alert: "confirm";
        readonly confirm: "cancel";
    };
    readonly outsideDismiss: false;
    readonly escapeOrBackOutcome: "cancelled";
    readonly dismissWhileBusy: false;
};
export declare function validateAlertDialogRequest(request: AlertDialogRequest): void;
export declare function getAlertDialogInitialFocus(mode: AlertDialogMode): AlertDialogInitialFocus;
export declare function canDismissAlertDialog(reason: AlertDialogDismissReason, busy: boolean): boolean;
export type AlertDialogPhase = Readonly<{
    status: "idle";
}> | Readonly<{
    status: "busy";
}> | Readonly<{
    status: "error";
    message: string;
}> | Readonly<{
    status: "closing";
    result: AlertDialogResult;
}> | Readonly<{
    status: "closed";
    result: AlertDialogResult;
}>;
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
/**
 * Owns a complete AlertDialog lifecycle, including side-effect de-duplication
 * and settling only after the renderer reports that exit motion completed.
 */
export declare function createAlertDialogSession(request: AlertDialogRequest): AlertDialogSession;
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
export declare function createAlertDialogQueue<Options>(): AlertDialogQueue<Options>;
export {};
//# sourceMappingURL=alert-dialog.d.ts.map