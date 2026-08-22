import { type ToastDescriptor, type ToastDismissReason, type ToastDuplicatePolicy, type ToastId, type ToastOverflowPolicy, type ToastPublishOptions, type ToastPublishResult, type ToastStore, type ToastTimerUpdatePolicy } from "@hjm/design-contracts/components/toast";
import { type ToastPlacement } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes, type ReactNode } from "react";
export type ToastProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & Readonly<{
    descriptor: ToastDescriptor;
    onDismissRequest: (reason: ToastDismissReason) => void;
}>;
/** Controlled single-toast renderer; ToastProvider supplies the full FIFO lifecycle. */
export declare const Toast: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & Readonly<{
    descriptor: ToastDescriptor;
    onDismissRequest: (reason: ToastDismissReason) => void;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type ToastApi = Readonly<{
    publish(descriptor: ToastDescriptor, options?: ToastPublishOptions): ToastPublishResult;
    dismiss(id: ToastId, reason: ToastDismissReason): boolean;
    close(id: ToastId): boolean;
}>;
export declare function useToast(): ToastApi;
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
export declare function ToastProvider({ children, label, placement, store, initialToasts, maxVisible, maxQueued, duplicatePolicy, timerUpdatePolicy, overflowPolicy, portalContainer, }: ToastProviderProps): import("react").JSX.Element;
//# sourceMappingURL=toast.d.ts.map