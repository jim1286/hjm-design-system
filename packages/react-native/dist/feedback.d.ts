import { emptyStateRecipe, skeletonRecipe, type NoticeTone as ContractNoticeTone, type ProgressShape, type ProgressSize, type ProgressTone, type ToastPlacement, type ToastTone, type ToastToneMark } from "@hjmds/design-contracts/recipes";
import { type ResultDescriptor, type ResultStatus } from "@hjmds/design-contracts/components/result";
import { type ToastDescriptor, type ToastDismissReason, type ToastDuplicatePolicy, type ToastOverflowPolicy, type ToastPauseReason, type ToastPublishResult, type ToastTimerUpdatePolicy } from "@hjmds/design-contracts/components/toast";
import { type ReactNode } from "react";
import { type ViewProps, type ViewStyle } from "react-native";
import type { ToastPresentationAdapter } from "./internal/toast-presentation.js";
import { type ButtonShape } from "@hjmds/design-contracts/recipes/base";
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Notice({ title, description, tone, announcement, icon, renderIcon, action, layoutStyle, ...props }: NoticeProps): import("react").JSX.Element;
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function EmptyState({ title, description, illustration, action, density, align, announcement, accessibilityLabel, titleRole, layoutStyle, ...props }: EmptyStateProps): import("react").JSX.Element;
export type ResultIconRenderProps = Readonly<{
    status: ResultStatus;
    color: string;
    backgroundColor: string;
}>;
export type ResultProps = Omit<ViewProps, "children" | "style"> & ResultDescriptor & Readonly<{
    renderIcon?: (props: ResultIconRenderProps) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Terminal flow outcome with platform announcement and canonical actions. */
export declare function Result({ status, title, description, actions, renderIcon, layoutStyle, ...props }: ResultProps): import("react").JSX.Element;
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
    /** Equal visual units for determinate linear progress; fractions fill a partial unit. */
    segments?: number;
    valueText?: string;
    /** Hide only the visible auxiliary value when the label already contains a count; accessibility keeps its value. */
    showValue?: boolean;
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
}>;
export declare function Progress({ value, max, label, accessibilityLabel, valueText, segments, showValue, accessibilityHint, size, tone, shape, children, layoutStyle, testID, }: ProgressProps): import("react").JSX.Element;
export { Spinner, type SpinnerProps } from "./internal/spinner.js";
export type SkeletonShape = keyof typeof skeletonRecipe.shapes;
export type SkeletonProps = Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    /**
     * `text` only: draw this many lines with the last one shorter (`skeletonRecipe.lines`), so a paragraph
     * placeholder is not rebuilt from loose bars in every product. `width` sizes the whole group.
     */
    lines?: number;
    /**
     * `button` only: the Button `shape` this placeholder stands in for (default: Button's default). Products that use
     * `shape="pill"` buttons pass the same value so the placeholder matches (BurnTok, 2026-10-17).
     */
    buttonShape?: ButtonShape;
    width?: ViewStyle["width"];
    height?: number;
    radius?: number;
    accessibilityLabel?: string;
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
export declare function Skeleton({ shape, animated, lines, buttonShape, width, height, radius: radiusValue, accessibilityLabel, layoutStyle, }: SkeletonProps): import("react").JSX.Element;
export type ToastProps = Readonly<{
    descriptor: ToastDescriptor;
    onDismiss?: (reason: ToastDismissReason) => void;
    placement?: ToastPlacement;
    renderToneIcon?: (props: ToastToneIconRenderProps) => ReactNode;
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
export declare function Toast({ descriptor, onDismiss, placement, renderToneIcon, layoutStyle, }: ToastProps): import("react").JSX.Element;
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export declare function ToastRegion({ presentationAdapter, occluded, children, accessibilityLabel, toasts, defaultToasts, onToastsChange, maxVisible, maxQueued, duplicatePolicy, timerUpdatePolicy, overflowPolicy, placement, safeAreaInsets, avoidKeyboard, keyboardOffset, renderToneIcon, layoutStyle, }: ToastRegionProps): import("react").JSX.Element;
export declare function useToastRegion(): ToastRegionController;
export { ActivityChip, type ActivityChipProps } from "./activity-chip.js";
export { PendingContent, type PendingContentProps } from "./internal/pending-content.js";
//# sourceMappingURL=feedback.d.ts.map