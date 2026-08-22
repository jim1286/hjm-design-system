import { type ToastDescriptor, type ToastDismissReason, type ToastDuplicatePolicy, type ToastOverflowPolicy, type ToastPauseReason, type ToastPublishResult, type ToastTimerUpdatePolicy } from "@hjm/design-contracts/components/toast";
import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type NoticeTone = "info" | "success" | "warning" | "danger";
export type NoticeProps = Readonly<{
    title: string;
    description?: string;
    tone?: NoticeTone;
    action?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Notice({ title, description, tone, action, style, }: NoticeProps): import("react").JSX.Element;
export type EmptyStateProps = Readonly<{
    title: string;
    description?: string;
    illustration?: ReactNode;
    action?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function EmptyState({ title, description, illustration, action, style, }: EmptyStateProps): import("react").JSX.Element;
export type ProgressProps = Readonly<{
    value: number;
    label: string;
    valueLabel?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Progress({ value, label, valueLabel, style }: ProgressProps): import("react").JSX.Element;
export type SpinnerProps = Readonly<{
    label: string;
    size?: "small" | "large";
    style?: StyleProp<ViewStyle>;
}>;
export declare function Spinner({ label, size, style }: SpinnerProps): import("react").JSX.Element;
export type SkeletonProps = Readonly<{
    width?: ViewStyle["width"];
    height?: number;
    radius?: number;
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Skeleton({ width, height, radius: radiusValue, accessibilityLabel, style, }: SkeletonProps): import("react").JSX.Element;
export type ToastProps = Readonly<{
    descriptor: ToastDescriptor;
    onDismiss?: (reason: ToastDismissReason) => void;
    style?: StyleProp<ViewStyle>;
}>;
/** One Native toast driven by the same exactly-once session as a queued region. */
export declare function Toast({ descriptor, onDismiss, style }: ToastProps): import("react").JSX.Element;
export type ToastRegionController = Readonly<{
    show: (descriptor: ToastDescriptor) => ToastPublishResult;
    dismiss: (id: string, reason?: ToastDismissReason) => boolean;
    pause: (id: string, reason?: ToastPauseReason) => boolean;
    resume: (id: string, reason?: ToastPauseReason) => boolean;
}>;
export type ToastRegionProps = Readonly<{
    children?: ReactNode;
    /** Optional localized name for the region; individual toasts remain self-announcing. */
    accessibilityLabel?: string;
    /** External collection compatibility; the contract store still owns each lifecycle. */
    toasts?: readonly ToastDescriptor[];
    defaultToasts?: readonly ToastDescriptor[];
    onToastsChange?: (toasts: readonly ToastDescriptor[]) => void;
    maxVisible?: number;
    maxQueued?: number;
    duplicatePolicy?: ToastDuplicatePolicy;
    timerUpdatePolicy?: ToastTimerUpdatePolicy;
    overflowPolicy?: ToastOverflowPolicy;
    style?: StyleProp<ViewStyle>;
    toastStyle?: StyleProp<ViewStyle>;
}>;
/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export declare function ToastRegion({ children, accessibilityLabel, toasts, defaultToasts, onToastsChange, maxVisible, maxQueued, duplicatePolicy, timerUpdatePolicy, overflowPolicy, style, toastStyle, }: ToastRegionProps): import("react").JSX.Element;
export declare function useToastRegion(): ToastRegionController;
//# sourceMappingURL=feedback.d.ts.map