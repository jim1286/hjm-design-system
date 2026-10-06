import { emptyStateRecipe, skeletonRecipe, type NoticeTone as ContractNoticeTone, type ProgressShape, type ProgressSize, type ProgressTone, type ToastPlacement, type ToastTone, type ToastToneMark } from "@hjmds/design-contracts/recipes";
import { type ResultDescriptor, type ResultStatus } from "@hjmds/design-contracts/components/result";
import { type ToastDescriptor, type ToastDismissReason, type ToastDuplicatePolicy, type ToastOverflowPolicy, type ToastPauseReason, type ToastPublishResult, type ToastTimerUpdatePolicy } from "@hjmds/design-contracts/components/toast";
import { type ReactNode } from "react";
import { type ViewProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ToastPresentationAdapter } from "./internal/toast-presentation.js";
export type { ToastPresentationAdapter } from "./internal/toast-presentation.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `tone` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Notice({ title, description, tone, announcement, icon, renderIcon, action, style, layoutStyle, ...props }: NoticeProps): import("react").JSX.Element;
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
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `density`/`align` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `illustration` content and `density` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    illustrationStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use the empty-state typography recipe for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    titleStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use the empty-state typography recipe for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    descriptionStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use the `action` node's own semantic props for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    actionStyle?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function EmptyState({ title, description, illustration, action, density, align, announcement, accessibilityLabel, titleRole, style, illustrationStyle, titleStyle, descriptionStyle, actionStyle, layoutStyle, ...props }: EmptyStateProps): import("react").JSX.Element;
export type ResultIconRenderProps = Readonly<{
    status: ResultStatus;
    color: string;
    backgroundColor: string;
}>;
export type ResultProps = Omit<ViewProps, "children" | "style"> & ResultDescriptor & Readonly<{
    renderIcon?: (props: ResultIconRenderProps) => ReactNode;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `status` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Terminal flow outcome with platform announcement and canonical actions. */
export declare function Result({ status, title, description, actions, renderIcon, style, layoutStyle, ...props }: ResultProps): import("react").JSX.Element;
type ProgressName = Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: never;
    accessibilityLabel: string;
}>;
export type ProgressProps = ProgressName & Readonly<{
    value?: number;
    max?: number;
    valueText?: string;
    accessibilityHint?: string;
    size?: ProgressSize;
    /**
     * `circular` draws the same value as a ring. Native has no conic gradient, so
     * the ring is four quarter-arcs clipped by rotation — still one accessibility
     * contract, because the announcing element is unchanged.
     */
    shape?: ProgressShape;
    /** Content inside the ring. Ignored when linear. */
    children?: ReactNode;
    tone?: ProgressTone;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `tone`/`size`/`shape` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use the progress label typography recipe for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    labelStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `valueText` and the progress typography recipe for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    valueStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `size`/`shape` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    trackStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `tone` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    indicatorStyle?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
}>;
export declare function Progress({ value, max, label, accessibilityLabel, valueText, accessibilityHint, size, tone, shape, children, style, labelStyle, valueStyle, trackStyle, indicatorStyle, layoutStyle, testID, }: ProgressProps): import("react").JSX.Element;
export { Spinner, type SpinnerProps } from "./internal/spinner.js";
export type SkeletonShape = keyof typeof skeletonRecipe.shapes;
export type SkeletonProps = Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    width?: ViewStyle["width"];
    height?: number;
    radius?: number;
    accessibilityLabel?: string;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `shape`/`width`/`height` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Consumes the same skeletonRecipe as the web renderer. Until 0.10.0 this drew a
 * static View at a fixed height of 16, reading neither the recipe shapes nor its
 * animation, so the two surfaces sharing one contract looked different.
 *
 * width/height/radius stay for callers already on the 0.9 train and win over
 * `shape`. Migration: .changeset/skeleton-pulse-by-default.md
 */
export declare function Skeleton({ shape, animated, width, height, radius: radiusValue, accessibilityLabel, style, layoutStyle, }: SkeletonProps): import("react").JSX.Element;
export type ToastProps = Readonly<{
    descriptor: ToastDescriptor;
    onDismiss?: (reason: ToastDismissReason) => void;
    placement?: ToastPlacement;
    renderToneIcon?: (props: ToastToneIconRenderProps) => ReactNode;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and the descriptor `tone`/`placement` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export type ToastToneIconRenderProps = Readonly<{
    color: string;
    mark: ToastToneMark;
    size: number;
    tone: ToastTone;
}>;
/** One Native toast driven by the same exactly-once session as a queued region. */
export declare function Toast({ descriptor, onDismiss, placement, renderToneIcon, style, layoutStyle, }: ToastProps): import("react").JSX.Element;
export type ToastRegionController = Readonly<{
    /** Queues a toast; the same name as the Web `useToast().publish` and the contract store. */
    publish: (descriptor: ToastDescriptor) => ToastPublishResult;
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
    /** Optional renderer from the toast-liquid subpath. Requires top placement and one visible slot. */
    presentationAdapter?: ToastPresentationAdapter;
    /** Host modal ownership: hide and pause announcements without creating a second queue. */
    occluded?: boolean;
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
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `placement`/`safeAreaInsets` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use each descriptor's `tone` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    toastStyle?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export declare function ToastRegion({ presentationAdapter, occluded, children, accessibilityLabel, toasts, defaultToasts, onToastsChange, maxVisible, maxQueued, duplicatePolicy, timerUpdatePolicy, overflowPolicy, placement, safeAreaInsets, avoidKeyboard, keyboardOffset, renderToneIcon, style, toastStyle, layoutStyle, }: ToastRegionProps): import("react").JSX.Element;
export declare function useToastRegion(): ToastRegionController;
//# sourceMappingURL=feedback.d.ts.map