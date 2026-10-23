import { type ComponentRef, type ReactElement, type ReactNode, type RefObject } from "react";
import type { View } from "react-native";
import { type AlertDialogRequest, type AlertDialogResult } from "@hjmds/design-contracts/components/alert-dialog";
import type { DialogSize } from "@hjmds/design-contracts/recipes";
export type AlertDialogQueueOptions = Readonly<{
    size?: DialogSize;
    /** Where accessibility focus returns after this dialog (native has no document focus to capture). */
    returnFocusRef?: RefObject<ComponentRef<typeof View> | null>;
}>;
export type AlertDialogQueueApi = Readonly<{
    /** Shows the request after those already waiting; resolves once its dialog closed with that outcome. */
    open(request: AlertDialogRequest, options?: AlertDialogQueueOptions): Promise<AlertDialogResult>;
}>;
/** `open` is bound to the provider scope this component rendered under; after that scope changes it settles `interrupted`. */
export declare function useAlertDialogQueue(): AlertDialogQueueApi;
export type AlertDialogQueueProviderProps = Readonly<{
    children: ReactNode;
    /** The owner of queued questions, usually the route path. When it changes, other scopes' requests settle `interrupted`. */
    scope?: string;
}>;
export declare function AlertDialogQueueProvider({ children, scope }: AlertDialogQueueProviderProps): ReactElement;
//# sourceMappingURL=alert-dialog-queue.d.ts.map