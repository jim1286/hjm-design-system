import { type DescriptionListDescriptor } from "@hjm/design-contracts/components/description-list";
import { type ResolvedStatisticDescriptor, type StatisticDescriptor, type StatisticGroupDescriptor } from "@hjm/design-contracts/components/statistic";
import { type TagTone as ContractTagTone } from "@hjm/design-contracts/components/tag";
import { type ImageDescriptor, type ImageFit, type ImageLoadStatus, type ResolvedImageDescriptor } from "@hjm/design-contracts/components/image";
import { type ComposeTimelineAccessibleName, type TimelineItemDescriptor } from "@hjm/design-contracts/components/timeline";
import { statisticRecipe, type AccordionDensity, type BadgeSize, type BadgeTone, type BadgeVariant as ContractBadgeVariant, type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant, type ListRowDensity, type StatisticDensity, type StatisticPresentation } from "@hjm/design-contracts/recipes";
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
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
}>;
export declare function Badge({ label, tone, size, variant, leading, accessibilityLabel, style, labelStyle, ...props }: BadgeProps): import("react").JSX.Element;
export type TagTone = ContractTagTone;
export type TagProps = Readonly<{
    children?: string;
    /** @deprecated Prefer renderer-neutral `children`. */
    label?: string;
    tone?: TagTone;
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
}>;
export declare function Tag({ children, label, tone, accessibilityLabel, style, labelStyle, }: TagProps): import("react").JSX.Element;
export type CardProps = Omit<SurfaceProps, "children" | "padding"> & Readonly<{
    children?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    selected?: boolean;
    padding?: SurfacePadding;
}>;
export declare function Card({ children, title, description, media, actions, selected, tone, bordered, padding, style, ...props }: CardProps): import("react").JSX.Element;
export type ListRowProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"> & Readonly<{
    title: string;
    description?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Visible metadata placed beside the title, such as a Badge. */
    titleMetadata?: ReactNode;
    /** @deprecated Prefer the renderer-neutral `titleMetadata` slot. */
    badge?: ReactNode;
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
    style?: StyleProp<ViewStyle>;
    leadingStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    titleRowStyle?: StyleProp<ViewStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
    trailingStyle?: StyleProp<ViewStyle>;
    trailingActionStyle?: StyleProp<ViewStyle>;
    containerProps?: Omit<ViewProps, "children" | "style">;
}>;
export declare function ListRow({ title, description, leading, trailing, titleMetadata, badge, trailingAction, trailingText, metadataLabel, trailingLabel, onPress, accessibilityLabel, accessibilityHint, disabled, density, selected: selectedProp, style, leadingStyle, contentStyle, titleStyle, titleRowStyle, descriptionStyle, trailingStyle, trailingActionStyle, containerProps, accessibilityState, ...props }: ListRowProps): import("react").JSX.Element;
type AccessibleMedia = Readonly<{
    decorative: true;
    accessibilityLabel?: never;
}> | Readonly<{
    decorative?: false;
    accessibilityLabel: string;
}>;
type AvatarBaseProps = Readonly<{
    source?: ImageSourcePropType;
    name: string;
    initials?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
}>;
export type AvatarProps = AvatarBaseProps & AccessibleMedia;
export declare function Avatar({ source, name, initials, size, decorative, accessibilityLabel, style, imageStyle, }: AvatarProps): import("react").JSX.Element;
export type DividerProps = Readonly<{
    orientation?: "horizontal" | "vertical";
    inset?: number;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Divider({ orientation, inset, style }: DividerProps): import("react").JSX.Element;
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
    style?: StyleProp<ViewStyle>;
    itemStyle?: StyleProp<ViewStyle>;
    triggerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    indicatorStyle?: StyleProp<ViewStyle>;
    panelStyle?: StyleProp<ViewStyle>;
}>;
export declare function Accordion<Value extends string = string>({ label, items, expandedValues, defaultExpandedValues, onExpandedValuesChange, multiple, density, renderIndicator, style, itemStyle, triggerStyle, titleStyle, indicatorStyle, panelStyle, }: AccordionProps<Value>): import("react").JSX.Element;
export type DescriptionListProps<Id extends string = string> = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    label: string;
    descriptor: DescriptionListDescriptor<Id>;
    /** Explicit inner width wins; otherwise the rendered container is measured. */
    availableWidth?: number;
    style?: StyleProp<ViewStyle>;
    itemStyle?: StyleProp<ViewStyle>;
}>;
export declare function DescriptionList<Id extends string = string>({ label, descriptor, availableWidth, style, itemStyle, onLayout, ...props }: DescriptionListProps<Id>): import("react").JSX.Element;
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
    legacySource: false;
}>;
/** @deprecated Migrate the caller to canonical `src`/`width`/`height` props. */
export type LegacyImageRenderProps = ImageAdapterBaseProps & Readonly<{
    descriptor?: never;
    src?: never;
    width?: number;
    height?: number;
    fit?: ImageFit;
    legacySource: true;
}>;
export type ImageRenderProps = CanonicalImageRenderProps | LegacyImageRenderProps;
export type ImageSourceAdapter = (descriptor: ResolvedImageDescriptor) => ImageSourcePropType;
type ImageSharedProps = ImageNativeProps & Readonly<{
    /** Visual content only; HJM retains the image's accessible name. */
    fallback?: ReactNode;
    onError?: NativeImageProps["onError"];
    onLoad?: NativeImageProps["onLoad"];
    onLoadStatusChange?: (status: Extract<ImageLoadStatus, "loaded" | "error">) => void;
    resizeMode?: NativeImageProps["resizeMode"];
    /** Image-host style. `containerStyle` owns the reserved root frame. */
    style?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}>;
type CanonicalImageProps = ImageSharedProps & ImageDescriptor & Readonly<{
    source?: never;
    /** Convert the canonical URL to a React Native source (headers/cache included). */
    sourceAdapter?: ImageSourceAdapter;
    renderImage?: (props: CanonicalImageRenderProps) => ReactNode;
}>;
type LegacyImageProps = ImageSharedProps & AccessibleMedia & Readonly<{
    /** @deprecated Use canonical `src`, `width`, `height`, and optional `fit`. */
    source: ImageSourcePropType;
    src?: never;
    /** @deprecated Used only by the legacy Native source path. */
    width?: number;
    /** @deprecated Used only by the legacy Native source path. */
    height?: number;
    fit?: ImageFit;
    sourceAdapter?: never;
    /** @deprecated Migrate the host adapter to canonical Image props. */
    renderImage?: (props: LegacyImageRenderProps) => ReactNode;
}>;
export type ImageProps = CanonicalImageProps | LegacyImageProps;
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
    style?: StyleProp<ViewStyle>;
}>;
export declare function CounterBadge({ count, accessibilityLabel, max, tone, size, variant, style, }: CounterBadgeProps): import("react").JSX.Element | null;
export type ListAppearance = "grouped" | "plain";
export type ListProps = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    /** Localized accessible name for this list. */
    label: string;
    children: ReactNode;
    separator?: "none" | "full" | "indented";
    appearance?: ListAppearance;
    style?: StyleProp<ViewStyle>;
}>;
/** Semantic list container that owns separator rhythm around composed rows. */
export declare function List({ label, children, separator, appearance, style, ...props }: ListProps): import("react").JSX.Element;
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
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    valueStyle?: StyleProp<TextStyle>;
    affixStyle?: StyleProp<TextStyle>;
    trendStyle?: StyleProp<TextStyle>;
    hintStyle?: StyleProp<TextStyle>;
}>;
export declare function Statistic<Id extends string = string>({ descriptor, density, presentation, contextLabel, accessibilityLabel, composeAccessibilityLabel, renderTrendMark, style, labelStyle, valueStyle, affixStyle, trendStyle, hintStyle, }: StatisticProps<Id>): import("react").JSX.Element;
export type StatisticGroupProps<Id extends string = string> = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    label: string;
    descriptor: StatisticGroupDescriptor<Id>;
    availableWidth?: number;
    density?: StatisticDensity;
    presentation?: StatisticPresentation;
    composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
    renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
    style?: StyleProp<ViewStyle>;
    itemStyle?: StyleProp<ViewStyle>;
}>;
export declare function StatisticGroup<Id extends string = string>({ label, descriptor, availableWidth, density, presentation, composeAccessibilityLabel, renderTrendMark, style, itemStyle, onLayout, ...props }: StatisticGroupProps<Id>): import("react").JSX.Element;
export type TimelineProps<Id extends string = string> = Omit<ViewProps, "children"> & Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    composeAccessibleName: ComposeTimelineAccessibleName;
}>;
/** Ordered record of completed events; unlike Steps it has no current cursor. */
export declare function Timeline<Id extends string = string>({ items, composeAccessibleName, style, ...props }: TimelineProps<Id>): import("react").JSX.Element;
export {};
//# sourceMappingURL=data-display.d.ts.map