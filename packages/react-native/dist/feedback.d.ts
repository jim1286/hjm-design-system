import { emptyStateRecipe, type NoticeTone as ContractNoticeTone, type ProgressSize, type ProgressTone, type ToastPlacement, type ToastTone, type ToastToneMark } from "@hjm/design-contracts/recipes";
import { type ResultDescriptor, type ResultStatus } from "@hjm/design-contracts/components/result";
import { type ToastDescriptor, type ToastDismissReason, type ToastDuplicatePolicy, type ToastOverflowPolicy, type ToastPauseReason, type ToastPublishResult, type ToastTimerUpdatePolicy } from "@hjm/design-contracts/components/toast";
import { type ReactNode } from "react";
import { type ViewProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
export type AnnouncementMode = "none" | "polite" | "assertive";
export type NoticeTone = ContractNoticeTone;
export type NoticeIconRenderProps = Readonly<{
    tone: NoticeTone;
    color: string;
    size: number;
}>;
export type NoticeProps = Omit<ViewProps, "children" | "style"> & Readonly<{
    title: string;
    description?: string;
    tone?: NoticeTone;
    announcement?: AnnouncementMode;
    icon?: ReactNode;
    renderIcon?: (props: NoticeIconRenderProps) => ReactNode;
    action?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Notice({ title, description, tone, announcement, icon, renderIcon, action, style, ...props }: NoticeProps): import("react").JSX.Element;
export type EmptyStateAlign = "center" | "upper";
export type EmptyStateProps = Omit<ViewProps, "children" | "style"> & Readonly<{
    title?: string;
    description?: string;
    illustration?: ReactNode;
    action?: ReactNode;
    density?: keyof typeof emptyStateRecipe.density;
    align?: EmptyStateAlign;
    announcement?: AnnouncementMode;
    accessibilityLabel?: string;
    titleRole?: "header";
    style?: StyleProp<ViewStyle>;
    illustrationStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
    actionStyle?: StyleProp<ViewStyle>;
}>;
export declare function EmptyState({ title, description, illustration, action, density, align, announcement, accessibilityLabel, titleRole, style, illustrationStyle, titleStyle, descriptionStyle, actionStyle, ...props }: EmptyStateProps): import("react").JSX.Element;
export type ResultIconRenderProps = Readonly<{
    status: ResultStatus;
    color: string;
    backgroundColor: string;
}>;
export type ResultProps = Omit<ViewProps, "children"> & ResultDescriptor & Readonly<{
    renderIcon?: (props: ResultIconRenderProps) => ReactNode;
}>;
/** Terminal flow outcome with platform announcement and canonical actions. */
export declare function Result({ status, title, description, actions, renderIcon, style, ...props }: ResultProps): import("react").JSX.Element;
export type ProgressProps = Readonly<{
    value?: number;
    max?: number;
    label: string;
    valueText?: string;
    /** @deprecated Prefer the renderer-neutral `valueText`. */
    valueLabel?: string;
    size?: ProgressSize;
    tone?: ProgressTone;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    valueStyle?: StyleProp<TextStyle>;
    trackStyle?: StyleProp<ViewStyle>;
    indicatorStyle?: StyleProp<ViewStyle>;
}>;
export declare function Progress({ value, max, label, valueText, valueLabel, size, tone, style, labelStyle, valueStyle, trackStyle, indicatorStyle, }: ProgressProps): import("react").JSX.Element;
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
    placement?: ToastPlacement;
    renderToneIcon?: (props: ToastToneIconRenderProps) => ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export type ToastToneIconRenderProps = Readonly<{
    color: string;
    mark: ToastToneMark;
    size: number;
    tone: ToastTone;
}>;
/** One Native toast driven by the same exactly-once session as a queued region. */
export declare function Toast({ descriptor, onDismiss, placement, renderToneIcon, style, }: ToastProps): import("react").JSX.Element;
export type ToastRegionController = Readonly<{
    show: (descriptor: ToastDescriptor) => ToastPublishResult;
    dismiss: (id: string, reason?: ToastDismissReason) => boolean;
    pause: (id: string, reason?: ToastPauseReason) => boolean;
    resume: (id: string, reason?: ToastPauseReason) => boolean;
}>;
export type ToastSafeAreaInsets = Readonly<{
    top?: number;
    bottom?: number;
    /** Physical insets from `react-native-safe-area-context`. */
    left?: number;
    right?: number;
    /** Optional logical overrides; useful when the surrounding layout already resolved direction. */
    start?: number;
    end?: number;
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
    placement?: ToastPlacement;
    safeAreaInsets?: ToastSafeAreaInsets;
    /** Observe the Native keyboard and keep bottom placements above it. */
    avoidKeyboard?: boolean;
    /** Additional product-owned offset, for example a persistent bottom bar. */
    keyboardOffset?: number;
    renderToneIcon?: (props: ToastToneIconRenderProps) => ReactNode;
    style?: StyleProp<ViewStyle>;
    toastStyle?: StyleProp<ViewStyle>;
}>;
/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export declare function ToastRegion({ children, accessibilityLabel, toasts, defaultToasts, onToastsChange, maxVisible, maxQueued, duplicatePolicy, timerUpdatePolicy, overflowPolicy, placement, safeAreaInsets, avoidKeyboard, keyboardOffset, renderToneIcon, style, toastStyle, }: ToastRegionProps): import("react").JSX.Element;
export declare function useToastRegion(): ToastRegionController;
//# sourceMappingURL=feedback.d.ts.map