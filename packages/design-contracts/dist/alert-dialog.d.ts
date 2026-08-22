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
    tone?: Extract<AlertDialogTone, "attention">;
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
export {};
//# sourceMappingURL=alert-dialog.d.ts.map