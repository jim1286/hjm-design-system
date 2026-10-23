import { type AvatarFallbackContext } from "@hjmds/design-contracts/avatar-fallback";
import { type DescriptionListDescriptor } from "@hjmds/design-contracts/components/description-list";
import { type ResolvedStatisticDescriptor, type StatisticDescriptor, type StatisticGroupDescriptor } from "@hjmds/design-contracts/components/statistic";
import { type TagTone as ContractTagTone } from "@hjmds/design-contracts/components/tag";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { type ImageDescriptor, type ImageFit, type ImageLoadStatus, type ResolvedImageDescriptor } from "@hjmds/design-contracts/components/image";
import { type ComposeTimelineAccessibleName, type ResolvedTimelineItemDescriptor, type TimelineItemDescriptor } from "@hjmds/design-contracts/components/timeline";
import { type AvatarFrame, type AvatarShape, type AvatarSize, type CornerAccessoryPlacement } from "@hjmds/design-contracts/recipes";
import { listRecipe, listRowRecipe, statisticRecipe, type AccordionDensity, type BadgeAdornmentContext, type BadgeSize, type BadgeTone, type BadgeVariant as ContractBadgeVariant, type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant, type DividerLineStyle, type BadgeCategoryColor, type ListRowDensity, type ListRowLeadingShape, type ListRowTrailingAccessory, type StatisticDensity, type StatisticPresentation } from "@hjmds/design-contracts/recipes";
import { type ReactNode } from "react";
import { type ImageProps as NativeImageProps, type ImageSourcePropType, type ImageStyle, type PressableProps, type StyleProp, type ViewProps } from "react-native";
import { type SurfacePadding, type SurfaceProps } from "./primitives.js";
export type StatusTone = BadgeTone;
export type BadgeVariant = ContractBadgeVariant;
export type BadgeProps = Omit<ViewProps, "accessibilityLabel" | "accessible" | "children" | "style"> & Readonly<{
    label: string | number;
    tone?: StatusTone;
    /**
     * Product classification color per theme (series, grade…) in place of `tone`. HJM keeps the frame and picks the
     * label ink; a color whose label cannot reach AA 4.5 throws instead of rendering unreadable.
     */
    categoryColor?: BadgeCategoryColor;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
    trailing?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
    accessibilityLabel?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Badge({ label, tone: toneProp, categoryColor, size, variant, leading, trailing, accessibilityLabel, layoutStyle, ...props }: BadgeProps): import("react").JSX.Element;
export type TagTone = ContractTagTone;
export type TagProps = Omit<ViewProps, "accessibilityLabel" | "accessible" | "children" | "style"> & Readonly<{
    children: string;
    tone?: TagTone;
    accessibilityLabel?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Tag({ children, tone, accessibilityLabel, layoutStyle, ...props }: TagProps): import("react").JSX.Element;
export type CardProps = Omit<SurfaceProps, "children" | "padding"> & Readonly<{
    children?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    media?: ReactNode;
    /** Decorative artwork behind the shared body/actions; its host determines the available height. */
    backgroundMedia?: ReactNode;
    /** Platform gesture/accessibility host behind content. Requires backgroundMedia; never put metadata/actions here. */
    backgroundInteraction?: ReactNode;
    /** Non-interactive cover classification at the shared top/end inset. Requires backgroundMedia. */
    mediaBadges?: ReactNode;
    badges?: ReactNode;
    /** Centre short metadata beneath artwork without product-owned badge layout. */
    badgesAlign?: "start" | "center";
    /** Activate only the passive cover; other card content/actions keep independent targets. */
    mediaAction?: Readonly<{
        label: string;
        onActivate(): void;
        icon?: (context: Readonly<{
            color: string;
            size: number;
        }>) => ReactNode;
    }>;
    actions?: ReactNode;
    /** Independent commands at the header end; never nested in whole-card activation. */
    headerActions?: ReactNode;
    selected?: boolean;
    /**
     * Whole-card activation. With `actions`, media and body become one Pressable and the actions row stays a sibling,
     * so each action is its own accessible target (an accessible Pressable would swallow nested buttons for screen
     * readers). Keep other children passive.
     */
    onActivate?: () => void;
    disabled?: boolean;
    padding?: SurfacePadding;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Card({ children, title, description, leading, media, backgroundMedia, backgroundInteraction, mediaBadges, badges, badgesAlign, mediaAction, actions, headerActions, selected, onActivate, disabled, accessibilityLabel, accessibilityHint, tone, bordered, padding, layoutStyle, radius: cornerRadius, ...props }: CardProps): import("react").JSX.Element;
export type QuoteCardProps = Omit<ViewProps, "children" | "style"> & Readonly<{
    children: ReactNode;
    attribution?: string;
    renderMark?: (context: {
        color: string;
        size: number;
    }) => ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** The quotation and caption stay one visual unit; nested disclosures remain independently accessible. */
export declare function QuoteCard({ children, attribution, renderMark, ...props }: QuoteCardProps): import("react").JSX.Element;
export type ListRowProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"> & Readonly<{
    title: string;
    description?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * `disclosure`: the row opens another screen. HJM draws the decorative chevron after `trailing`/`trailingText`,
     * inside the row command (before any `trailingAction`), mirrored in RTL; size and color come from
     * `listRowRecipe.accessories`.
     */
    trailingAccessory?: ListRowTrailingAccessory;
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
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
    /** Reserve the real row geometry without exposing its commands or content. */
    loading?: boolean;
    /** Localized status name; omit on duplicate placeholder rows. */
    loadingLabel?: string;
    selected?: boolean;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    leadingStyle?: HjmCompositionStyleProp;
    contentStyle?: HjmCompositionStyleProp;
    titleRowStyle?: HjmCompositionStyleProp;
    trailingStyle?: HjmCompositionStyleProp;
    trailingActionStyle?: HjmCompositionStyleProp;
    containerProps?: Omit<ViewProps, "children" | "style">;
}>;
export declare function ListRow({ title, tone, description, leading, trailing, trailingAccessory, titleMetadata, trailingAction, trailingText, metadataLabel, trailingLabel, onPress, accessibilityLabel, accessibilityHint, disabled, density: suppliedDensity, loading, loadingLabel, selected: selectedProp, leadingShape, layoutStyle, leadingStyle, contentStyle, titleRowStyle, trailingStyle, trailingActionStyle, containerProps, accessibilityState, ...forwarded }: ListRowProps): import("react").JSX.Element;
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
    initials?: string;
    renderFallback?: (context: AvatarFallbackContext) => ReactNode;
    /**
     * A step from avatarRecipe.sizes (`xxsmall` 22 … `xlarge` 64), or points for existing callers. Numbers below the
     * smallest step (22) throw. The default stays 44 (`touch`).
     */
    size?: AvatarSize | number;
    shape?: AvatarShape;
    /** Border/background treatment from avatarRecipe.frames; `none` when product artwork fills the frame. */
    frame?: AvatarFrame;
    /** A small mark (team badge, status dot) on a corner of the avatar's box. It is not clipped by the frame. */
    accessory?: ReactNode;
    accessoryPlacement?: CornerAccessoryPlacement;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * A meaningful avatar needs `name` (initials) and `accessibilityLabel`; a decorative one — next to a visible
 * author name, or ornament with no person — is hidden and may omit `name` (2026-10-23 Burntok adoption).
 */
type AvatarIdentity = Readonly<{
    decorative: true;
    accessibilityLabel?: never;
    name?: string;
}> | Readonly<{
    decorative?: false;
    accessibilityLabel: string;
    name: string;
}>;
export type AvatarProps = AvatarBaseProps & AvatarIdentity;
export declare function Avatar({ source, renderImage, name, initials, renderFallback, size: sizeProp, shape, frame, accessory, accessoryPlacement, decorative, accessibilityLabel, layoutStyle, }: AvatarProps): import("react").JSX.Element;
export type DividerProps = Readonly<{
    orientation?: "horizontal" | "vertical";
    inset?: number;
    /** `dashed`: a break inside one surface rather than a new section; dash/gap from dividerRecipe.lineStyles. */
    lineStyle?: DividerLineStyle;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Divider({ orientation, inset, lineStyle, layoutStyle }: DividerProps): import("react").JSX.Element;
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Accordion<Value extends string = string>({ label, items, expandedValues, defaultExpandedValues, onExpandedValuesChange, multiple, density, renderIndicator, layoutStyle, }: AccordionProps<Value>): import("react").JSX.Element;
export type DescriptionListProps<Id extends string = string> = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    label: string;
    descriptor: DescriptionListDescriptor<Id>;
    /** Explicit inner width wins; otherwise the rendered container is measured. */
    availableWidth?: number;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function DescriptionList<Id extends string = string>({ label, descriptor, availableWidth, layoutStyle, onLayout, ...props }: DescriptionListProps<Id>): import("react").JSX.Element;
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function CounterBadge({ count, accessibilityLabel, max, tone, size, variant, layoutStyle, }: CounterBadgeProps): import("react").JSX.Element | null;
export type ListAppearance = "grouped" | "plain";
export type ListProps = Omit<ViewProps, "accessibilityLabel" | "accessibilityRole" | "children" | "style"> & Readonly<{
    /** Localized accessible name for this list. */
    label: string;
    children: ReactNode;
    separator?: keyof typeof listRecipe.separators;
    appearance?: ListAppearance;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Semantic list container that owns separator rhythm around composed rows. */
export declare function List({ label, children, separator, appearance, layoutStyle, ...props }: ListProps): import("react").JSX.Element;
export type ListSeparatorProps = Readonly<{
    /** content: already padded rows; full: ListRow surface; indented: ListRow text column. */
    separator?: keyof typeof listRecipe.separators;
    leading?: boolean;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Decorative separator for a product-owned virtual collection; never replaces its accessible row. */
export declare function ListSeparator({ separator, leading, layoutStyle }: ListSeparatorProps): import("react").JSX.Element | null;
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
    leading?: ReactNode;
    /** Product-owned series/category color shared by value and leading. */
    valueColor?: string;
    renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
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
    arrangement?: "grid" | "bar";
    renderLeading?: (item: StatisticDescriptor<Id>, context: {
        color: string;
        size: number;
    }) => ReactNode;
    getValueColor?: (item: StatisticDescriptor<Id>) => string | undefined;
    renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function StatisticGroup<Id extends string = string>({ label, descriptor, availableWidth, density, presentation, composeAccessibilityLabel, arrangement, renderLeading, getValueColor, renderTrendMark, layoutStyle, onLayout, ...props }: StatisticGroupProps<Id>): import("react").JSX.Element;
export type TimelineProps<Id extends string = string> = Omit<ViewProps, "children" | "style"> & Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    composeAccessibleName: ComposeTimelineAccessibleName;
    renderMetadata?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /** Per-record commands of a passive Timeline. Not allowed together with selection. */
    renderActions?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /**
     * Makes each record a selectable button (controlled, single). `null` = selectable with nothing chosen. Supply
     * together with `onSelectedIdChange`. The selected record reads as selected to assistive tech and paints the
     * neutral selection surface (timelineRecipe.item.selected).
     */
    selectedId?: Id | null;
    onSelectedIdChange?: (id: Id) => void;
    /** Virtualization host only; the shared renderer still owns every record, rail, label and command target. */
    renderList?: (context: Readonly<{
        items: readonly ResolvedTimelineItemDescriptor<Id>[];
        renderItem: (item: ResolvedTimelineItemDescriptor<Id>, index: number) => ReactNode;
        separator: ReactNode;
    }>) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Ordered record of completed events; unlike Steps it has no current cursor. */
export declare function Timeline<Id extends string = string>({ items, composeAccessibleName, renderMetadata, renderActions, renderList, selectedId, onSelectedIdChange, layoutStyle, ...props }: TimelineProps<Id>): import("react").JSX.Element;
export {};
//# sourceMappingURL=data-display.d.ts.map