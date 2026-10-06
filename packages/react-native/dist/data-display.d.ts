import { type AvatarFallbackContext } from "@hjmds/design-contracts/avatar-fallback";
import { type DescriptionListDescriptor } from "@hjmds/design-contracts/components/description-list";
import { type ResolvedStatisticDescriptor, type StatisticDescriptor, type StatisticGroupDescriptor } from "@hjmds/design-contracts/components/statistic";
import { type TagTone as ContractTagTone } from "@hjmds/design-contracts/components/tag";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { type ImageDescriptor, type ImageFit, type ImageLoadStatus, type ResolvedImageDescriptor } from "@hjmds/design-contracts/components/image";
import { type ComposeTimelineAccessibleName, type TimelineItemDescriptor } from "@hjmds/design-contracts/components/timeline";
import { statisticRecipe, type AccordionDensity, type BadgeSize, type BadgeTone, type BadgeVariant as ContractBadgeVariant, type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant, type ListRowDensity, type ListRowLeadingShape, type StatisticDensity, type StatisticPresentation } from "@hjmds/design-contracts/recipes";
import { type ReactNode } from "react";
import { type ImageProps as NativeImageProps, type ImageSourcePropType, type ImageStyle, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type SurfacePadding, type SurfaceProps } from "./primitives.js";
export type StatusTone = BadgeTone;
export type BadgeVariant = ContractBadgeVariant;
export type BadgeProps = Omit<ViewProps, "accessibilityLabel" | "accessible" | "children" | "style"> & Readonly<{
    label: string | number;
    tone?: StatusTone;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode;
    accessibilityLabel?: string;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `tone`/`size`/`variant` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `tone`/`size`/`variant` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    labelStyle?: StyleProp<TextStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Badge({ label, tone, size, variant, leading, accessibilityLabel, style, labelStyle, layoutStyle, ...props }: BadgeProps): import("react").JSX.Element;
export type TagTone = ContractTagTone;
export type TagProps = Omit<ViewProps, "accessibilityLabel" | "accessible" | "children" | "style"> & Readonly<{
    children: string;
    tone?: TagTone;
    accessibilityLabel?: string;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `tone` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `tone` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    labelStyle?: StyleProp<TextStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Tag({ children, tone, accessibilityLabel, layoutStyle, style, labelStyle, ...props }: TagProps): import("react").JSX.Element;
export type CardProps = Omit<SurfaceProps, "children" | "padding"> & Readonly<{
    children?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    selected?: boolean;
    padding?: SurfacePadding;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Card({ children, title, description, leading, media, actions, selected, tone, bordered, padding, layoutStyle, radius: cornerRadius, ...props }: CardProps): import("react").JSX.Element;
export type ListRowProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"> & Readonly<{
    title: string;
    description?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Visible metadata placed beside the title, such as a Badge. */
    titleMetadata?: ReactNode;
    /** A separate accessible target rendered beside, never inside, the row command. */
    trailingAction?: ReactNode;
    trailingText?: string;
    /** Spoken equivalent for meaningful metadata or decorative trailing content. */
    metadataLabel?: string;
    trailingLabel?: string;
    onPress?: PressableProps["onPress"];
    accessibilityLabel?: string;
    accessibilityHint?: string;
    disabled?: boolean;
    density?: ListRowDensity;
    selected?: boolean;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    leadingStyle?: HjmCompositionStyleProp;
    contentStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`selected` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    titleStyle?: StyleProp<TextStyle>;
    titleRowStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`selected` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    descriptionStyle?: StyleProp<TextStyle>;
    trailingStyle?: HjmCompositionStyleProp;
    trailingActionStyle?: HjmCompositionStyleProp;
    containerProps?: Omit<ViewProps, "children" | "style">;
}>;
export declare function ListRow({ title, description, leading, trailing, titleMetadata, trailingAction, trailingText, metadataLabel, trailingLabel, onPress, accessibilityLabel, accessibilityHint, disabled, density, selected: selectedProp, leadingShape, layoutStyle, leadingStyle, contentStyle, titleStyle, titleRowStyle, descriptionStyle, trailingStyle, trailingActionStyle, containerProps, accessibilityState, ...forwarded }: ListRowProps): import("react").JSX.Element;
type AccessibleMedia = Readonly<{
    decorative: true;
    accessibilityLabel?: never;
}> | Readonly<{
    decorative?: false;
    accessibilityLabel: string;
}>;
export type AvatarImageRenderProps = Readonly<{
    source: ImageSourcePropType;
    size: number;
    /** Canonical initials/custom fallback, for the host to keep visible until display. */
    fallback: ReactNode;
    /** Report a failure for this source generation; replaced-source callbacks are ignored. */
    onError: () => void;
}>;
type AvatarBaseProps = Readonly<{
    source?: ImageSourcePropType;
    /** Product image host (e.g. Expo disk caching), without changing the avatar frame. */
    renderImage?: (props: AvatarImageRenderProps) => ReactNode;
    name: string;
    initials?: string;
    renderFallback?: (context: AvatarFallbackContext) => ReactNode;
    size?: number;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `size`/`renderFallback` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `size` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    imageStyle?: StyleProp<ImageStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export type AvatarProps = AvatarBaseProps & AccessibleMedia;
export declare function Avatar({ source, renderImage, name, initials, renderFallback, size, decorative, accessibilityLabel, style, imageStyle, layoutStyle, }: AvatarProps): import("react").JSX.Element;
export type DividerProps = Readonly<{
    orientation?: "horizontal" | "vertical";
    inset?: number;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `orientation`/`inset` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Divider({ orientation, inset, style, layoutStyle }: DividerProps): import("react").JSX.Element;
export type AccordionItem<Value extends string = string> = Readonly<{
    value: Value;
    title: string;
    description?: string;
    content: ReactNode;
    disabled?: boolean;
    /** Optional localized name for the disclosure trigger. */
    accessibilityLabel?: string;
    accessibilityHint?: string;
    /** Optional localized name for the expanded content region. */
    contentAccessibilityLabel?: string;
}>;
export type AccordionIndicatorRenderProps<Value extends string = string> = Readonly<{
    value: Value;
    expanded: boolean;
    disabled: boolean;
    color: string;
    size: number;
}>;
export type AccordionProps<Value extends string = string> = Readonly<{
    label: string;
    items: readonly AccordionItem<Value>[];
    expandedValues?: readonly Value[];
    defaultExpandedValues?: readonly Value[];
    onExpandedValuesChange?: (values: readonly Value[]) => void;
    multiple?: boolean;
    density?: AccordionDensity;
    renderIndicator?: (props: AccordionIndicatorRenderProps<Value>) => ReactNode;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `density`/`renderIndicator` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    itemStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    triggerStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    titleStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    indicatorStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    panelStyle?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Accordion<Value extends string = string>({ label, items, expandedValues, defaultExpandedValues, onExpandedValuesChange, multiple, density, renderIndicator, style, itemStyle, triggerStyle, titleStyle, indicatorStyle, panelStyle, layoutStyle, }: AccordionProps<Value>): import("react").JSX.Element;
export type DescriptionListProps<Id extends string = string> = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    label: string;
    descriptor: DescriptionListDescriptor<Id>;
    /** Explicit inner width wins; otherwise the rendered container is measured. */
    availableWidth?: number;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `descriptor.columns` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `descriptor.columns` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    itemStyle?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function DescriptionList<Id extends string = string>({ label, descriptor, availableWidth, style, itemStyle, layoutStyle, onLayout, ...props }: DescriptionListProps<Id>): import("react").JSX.Element;
type ImageNativeProps = Omit<NativeImageProps, "accessibilityElementsHidden" | "accessibilityLabel" | "accessibilityRole" | "accessible" | "alt" | "aria-hidden" | "aria-label" | "height" | "importantForAccessibility" | "onError" | "onLoad" | "resizeMode" | "role" | "source" | "src" | "srcSet" | "style" | "width">;
type ImageAdapterBaseProps = Readonly<{
    source: ImageSourcePropType;
    accessible: boolean;
    accessibilityRole?: "image";
    accessibilityLabel?: string;
    onError: NonNullable<NativeImageProps["onError"]>;
    onLoad: NonNullable<NativeImageProps["onLoad"]>;
    /** Event-shape-neutral callbacks for expo-image and other transports. */
    reportError: (event?: unknown) => void;
    reportLoad: (event?: unknown) => void;
    resizeMode?: NativeImageProps["resizeMode"];
    status: Extract<ImageLoadStatus, "loading" | "loaded">;
    style?: StyleProp<ImageStyle>;
    nativeProps: ImageNativeProps & Readonly<{
        height?: number;
        resizeMode?: NativeImageProps["resizeMode"];
        width?: number;
    }>;
}>;
/** Canonical props handed to an optimized image host such as `expo-image`. */
export type CanonicalImageRenderProps = ImageAdapterBaseProps & Readonly<{
    descriptor: ResolvedImageDescriptor;
    src: string;
    width: number;
    height: number;
    fit: ImageFit;
}>;
export type ImageRenderProps = CanonicalImageRenderProps;
export type ImageSourceAdapter = (descriptor: ResolvedImageDescriptor) => ImageSourcePropType;
type ImageSharedProps = ImageNativeProps & Readonly<{
    /** Visual content only; HJM retains the image's accessible name. */
    fallback?: ReactNode;
    onError?: NativeImageProps["onError"];
    onLoad?: NativeImageProps["onLoad"];
    onLoadStatusChange?: (status: Extract<ImageLoadStatus, "loaded" | "error">) => void;
    resizeMode?: NativeImageProps["resizeMode"];
    /** Image-host style. `layoutStyle` places the reserved root frame. */
    style?: StyleProp<ImageStyle>;
    /** Canonical layout-only placement of the reserved frame. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
type CanonicalImageProps = ImageSharedProps & ImageDescriptor & Readonly<{
    source?: never;
    /** Convert the canonical URL to a React Native source (headers/cache included). */
    sourceAdapter?: ImageSourceAdapter;
    renderImage?: (props: CanonicalImageRenderProps) => ReactNode;
}>;
export type ImageProps = CanonicalImageProps;
/** Intrinsic-size Native image with canonical fit, accessibility, and fallback semantics. */
export declare function Image(imageProps: ImageProps): import("react").JSX.Element;
export type CounterBadgeProps = Readonly<{
    count: number;
    /** Omit only when a labelled parent already announces the counter. */
    accessibilityLabel?: string;
    max?: number;
    tone?: CounterBadgeTone;
    size?: CounterBadgeSize;
    variant?: CounterBadgeVariant;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `tone`/`size`/`variant` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function CounterBadge({ count, accessibilityLabel, max, tone, size, variant, style, layoutStyle, }: CounterBadgeProps): import("react").JSX.Element | null;
export type ListAppearance = "grouped" | "plain";
export type ListProps = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    /** Localized accessible name for this list. */
    label: string;
    children: ReactNode;
    separator?: "none" | "full" | "indented";
    appearance?: ListAppearance;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `appearance`/`separator` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Semantic list container that owns separator rhythm around composed rows. */
export declare function List({ label, children, separator, appearance, style, layoutStyle, ...props }: ListProps): import("react").JSX.Element;
export type StatisticTrendMarkRenderProps = Readonly<{
    name: (typeof statisticRecipe.trend.marks)[keyof typeof statisticRecipe.trend.marks];
    color: string;
    size: number;
}>;
export type ComposeStatisticAccessibilityLabel<Id extends string = string> = (input: Readonly<{
    contextLabel?: string;
    descriptor: ResolvedStatisticDescriptor<Id>;
    valueText: string;
}>) => string;
export type StatisticProps<Id extends string = string> = Readonly<{
    descriptor: StatisticDescriptor<Id>;
    density?: StatisticDensity;
    presentation?: StatisticPresentation;
    contextLabel?: string;
    accessibilityLabel?: string;
    composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
    renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `density`/`presentation` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    labelStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    valueStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    affixStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    trendStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    hintStyle?: StyleProp<TextStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Statistic<Id extends string = string>(props: StatisticProps<Id>): import("react").JSX.Element;
export type StatisticGroupProps<Id extends string = string> = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    label: string;
    descriptor: StatisticGroupDescriptor<Id>;
    availableWidth?: number;
    density?: StatisticDensity;
    presentation?: StatisticPresentation;
    composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
    renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * `density`/`presentation`/`descriptor.columns` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    itemStyle?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function StatisticGroup<Id extends string = string>({ label, descriptor, availableWidth, density, presentation, composeAccessibilityLabel, renderTrendMark, style, itemStyle, layoutStyle, onLayout, ...props }: StatisticGroupProps<Id>): import("react").JSX.Element;
export type TimelineProps<Id extends string = string> = Omit<ViewProps, "children" | "style"> & Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    composeAccessibleName: ComposeTimelineAccessibleName;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * item `tone` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Ordered record of completed events; unlike Steps it has no current cursor. */
export declare function Timeline<Id extends string = string>({ items, composeAccessibleName, style, layoutStyle, ...props }: TimelineProps<Id>): import("react").JSX.Element;
export {};
//# sourceMappingURL=data-display.d.ts.map