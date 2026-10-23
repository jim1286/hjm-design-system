import { type ReactElement, type ReactNode } from "react";
import { type AlertDialogRequest, type AlertDialogResult } from "@hjmds/design-contracts/components/alert-dialog";
import type { DialogSize } from "@hjmds/design-contracts/recipes";
/** Per-request presentation; copy and actions stay in the request. */
export type AlertDialogQueueOptions = Readonly<{
    icon?: ReactNode;
    size?: DialogSize;
}>;
export type AlertDialogQueueApi = Readonly<{
    /** Shows the request after those already waiting; resolves once its dialog closed with that outcome. */
    open(request: AlertDialogRequest, options?: AlertDialogQueueOptions): Promise<AlertDialogResult>;
}>;
/** `open` is bound to the provider scope this component rendered under; after that scope changes it settles `interrupted`. */
export declare function useAlertDialogQueue(): AlertDialogQueueApi;
export type AlertDialogQueueProviderProps = Readonly<{
    children: ReactNode;
    /** The owner of queued questions, usually the route. When it changes, other scopes' requests settle `interrupted`. */
    scope?: string;
    /** Modal priority of the queued dialogs (default 0). A higher-priority gate stays above and interactive. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
}>;
export declare function AlertDialogQueueProvider({ children, scope, modalPriority, portalContainer }: AlertDialogQueueProviderProps): ReactElement;
//# sourceMappingURL=alert-dialog-queue.d.ts.map