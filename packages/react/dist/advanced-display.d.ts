import { type AvatarFallbackContext } from "@hjmds/design-contracts/avatar-fallback";
import { type DescriptionItemDescriptor, type DescriptionListColumns } from "@hjmds/design-contracts/components/description-list";
import { type ComposeTimelineAccessibleName, type TimelineItemDescriptor } from "@hjmds/design-contracts/components/timeline";
import { type ResolvedStatisticDescriptor, type StatisticDescriptor, type StatisticGroupDescriptor } from "@hjmds/design-contracts/components/statistic";
import { dividerRecipe, listRecipe, type DividerLineStyle, type AccordionDensity, type AvatarFrame, type AvatarShape, type AvatarSize, type CornerAccessoryPlacement, type StatisticDensity, type StatisticPresentation } from "@hjmds/design-contracts/recipes";
import { type HTMLAttributes, type ImgHTMLAttributes, type ReactElement, type ReactNode, type RefAttributes, type TableHTMLAttributes } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AccordionItem = Readonly<{
    id: string;
    title: ReactNode;
    panel: ReactNode;
    disabled?: boolean;
    /** Include domain values when a decorative indicator carries more than expansion. */
    accessibilityLabel?: string;
}>;
export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & Readonly<{
    items: readonly AccordionItem[];
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[]) => void;
    allowsMultipleExpanded?: boolean;
    density?: AccordionDensity;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    /** Decorative replacement; interaction and expanded state remain owned by Accordion. */
    renderIndicator?: (props: Readonly<{
        value: string;
        expanded: boolean;
        disabled: boolean;
    }>) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Accordion: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & Readonly<{
    items: readonly AccordionItem[];
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[]) => void;
    allowsMultipleExpanded?: boolean;
    density?: AccordionDensity;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    /** Decorative replacement; interaction and expanded state remain owned by Accordion. */
    renderIndicator?: (props: Readonly<{
        value: string;
        expanded: boolean;
        disabled: boolean;
    }>) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & RefAttributes<HTMLDivElement>>;
/** Props handed to a product image host (`next/image`, a cache-aware loader) that replaces Avatar's `<img>`. */
export type AvatarImageRenderProps = Readonly<{
    src: string;
    /** `""` for a decorative avatar or `alt=""`; otherwise the avatar's accessible name. */
    alt: string;
    /** Diameter in px from the size step. */
    size: number;
    /** Avatar's image class (fill + cover); keep it so the frame's clipping and fit still apply. */
    className: string;
    /** Report a failure for this `src` generation; callbacks from a replaced `src` are ignored. */
    onError: () => void;
}>;
/**
 * Accessibility identity. A meaningful avatar is named by `name` (or `alt`); a decorative one — next to a visible
 * author name, or ornament without a person — is hidden from assistive tech and may omit `name` (2026-10-23:
 * Burntok's decorative avatars had no name to pass).
 */
type AvatarIdentity = Readonly<{
    decorative?: false;
    name: string;
    alt?: string;
}> | Readonly<{
    decorative: true;
    name?: string;
    alt?: never;
}>;
export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & AvatarIdentity & Readonly<{
    /** Profile navigation; products provide the member route and localized name. */
    action?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    src?: string;
    /** contain preserves the entire picture inside the shaped frame, including its corners. */
    imageFit?: "cover" | "contain";
    fallback?: ReactNode;
    renderFallback?: (context: AvatarFallbackContext) => ReactNode;
    /** Product image host in place of the built-in `<img>`. Exclusive with `imageProps`. */
    renderImage?: (props: AvatarImageRenderProps) => ReactNode;
    size?: AvatarSize;
    shape?: AvatarShape;
    /** Border/background treatment from avatarRecipe.frames; `none` when product artwork fills the frame. */
    frame?: AvatarFrame;
    /** A small mark (team badge, status dot) on a corner of the avatar's box. It is not clipped by the frame. */
    accessory?: ReactNode;
    accessoryPlacement?: CornerAccessoryPlacement;
    imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src">;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Avatar: import("react").ForwardRefExoticComponent<AvatarProps & RefAttributes<HTMLSpanElement>>;
export type AvatarGroupProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    /** Required: a pile of faces is meaningless to a screen reader otherwise. */
    label: string;
    children: ReactNode;
    size?: AvatarSize;
    /** Product-composed overflow copy such as "+3"; the count is the product's. */
    overflow?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Overlapping avatars. The overlap comes from the recipe ratio rather than a
 * pixel value so it holds across all four sizes, and the group carries one
 * accessible name instead of letting a reader walk five unlabelled images.
 */
export declare const AvatarGroup: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    /** Required: a pile of faces is meaningless to a screen reader otherwise. */
    label: string;
    children: ReactNode;
    size?: AvatarSize;
    /** Product-composed overflow copy such as "+3"; the count is the product's. */
    overflow?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & RefAttributes<HTMLSpanElement>>;
export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = keyof typeof dividerRecipe.insets;
export type DividerProps = HTMLAttributes<HTMLElement> & Readonly<{
    orientation?: DividerOrientation;
    inset?: DividerInset;
    /** `dashed`: a break inside one surface rather than a new section; dash/gap from dividerRecipe.lineStyles. */
    lineStyle?: DividerLineStyle;
    decorative?: boolean;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Divider: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLElement> & Readonly<{
    orientation?: DividerOrientation;
    inset?: DividerInset;
    /** `dashed`: a break inside one surface rather than a new section; dash/gap from dividerRecipe.lineStyles. */
    lineStyle?: DividerLineStyle;
    decorative?: boolean;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & RefAttributes<HTMLElement>>;
export type ListSeparatorProps = Readonly<{
    separator?: keyof typeof listRecipe.separators;
    leading?: boolean;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Decorative separator for a product-owned virtual collection. List owns separators for finite rows. */
export declare function ListSeparator({ separator, leading, layoutStyle }: ListSeparatorProps): import("react").JSX.Element | null;
export type ListAppearance = "grouped" | "plain";
export type ListProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    label: string;
    children: ReactNode;
    separator?: keyof typeof listRecipe.separators;
    appearance?: ListAppearance;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Semantic list container that owns separators around composed rows. */
export declare const List: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    label: string;
    children: ReactNode;
    separator?: keyof typeof listRecipe.separators;
    appearance?: ListAppearance;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & RefAttributes<HTMLDivElement>>;
export type StatisticTrendMarkRenderProps = Readonly<{
    name: "trendUp" | "trendDown" | "trendFlat";
    color: "currentColor";
    size: number;
}>;
export type ComposeStatisticAccessibilityLabel<Id extends string = string> = (input: Readonly<{
    contextLabel?: string;
    descriptor: ResolvedStatisticDescriptor<Id>;
    valueText: string;
}>) => string;
export type StatisticProps<Id extends string = string> = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    descriptor: StatisticDescriptor<Id>;
    density?: StatisticDensity;
    presentation?: StatisticPresentation;
    contextLabel?: string;
    accessibilityLabel?: string;
    composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
    leading?: ReactNode;
    /** Product-owned series/category color; value text and decorative leading share it. */
    valueColor?: string;
    renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
    /** Optional visual adapter; the descriptor remains the accessible value source. */
    renderValue?: (value: string) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Statistic<Id extends string = string>(props: StatisticProps<Id>): import("react").JSX.Element;
export type StatisticGroupProps<Id extends string = string> = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    label: string;
    descriptor: StatisticGroupDescriptor<Id>;
    density?: StatisticDensity;
    presentation?: StatisticPresentation;
    composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
    /** A bar is a single equal-width row for a few short counts; grid retains responsive columns. */
    arrangement?: "grid" | "bar";
    renderLeading?: (item: StatisticDescriptor<Id>, context: {
        color: string;
        size: number;
    }) => ReactNode;
    getValueColor?: (item: StatisticDescriptor<Id>) => string | undefined;
    renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function StatisticGroup<Id extends string = string>({ label, descriptor, density, presentation, composeAccessibilityLabel, arrangement, renderLeading, getValueColor, renderTrendMark, className, style, layoutStyle, ...props }: StatisticGroupProps<Id>): import("react").JSX.Element;
export type DescriptionListProps<Id extends string = string> = Omit<HTMLAttributes<HTMLDListElement>, "children"> & Readonly<{
    items: readonly DescriptionItemDescriptor<Id>[];
    columns?: DescriptionListColumns;
    layout?: "stacked" | "inline";
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const DescriptionList: <Id extends string = string>(props: DescriptionListProps<Id> & RefAttributes<HTMLDListElement>) => ReactElement;
export type TableSortDirection = "ascending" | "descending";
export type TableColumn<Row> = Readonly<{
    id: string;
    header: ReactNode;
    cell: (row: Row, rowIndex: number) => ReactNode;
    align?: "start" | "center" | "end";
    sortable?: boolean;
    sortDirection?: TableSortDirection;
}>;
export type TableProps<Row> = Omit<TableHTMLAttributes<HTMLTableElement>, "children"> & Readonly<{
    columns: readonly TableColumn<Row>[];
    rows: readonly Row[];
    getRowKey: (row: Row, rowIndex: number) => string;
    caption?: ReactNode;
    /** Localized content rendered when rows is empty. */
    emptyState: ReactNode;
    onSortChange?: (columnId: string, direction: TableSortDirection) => void;
    wrapperClassName?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Table: <Row>(props: TableProps<Row> & RefAttributes<HTMLTableElement>) => ReactElement;
export type TimelineProps<Id extends string = string> = Omit<HTMLAttributes<HTMLOListElement>, "children"> & Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    /** Default journal uses unfilled reading rows; selection adds record disclosure. "record" retains the earlier card surface. */
    variant?: "record" | "journal";
    composeAccessibleName: ComposeTimelineAccessibleName;
    renderMetadata?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /** Per-record commands of a passive Timeline. Not allowed together with selection. */
    renderActions?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /**
     * Makes records selectable (journal disclosure buttons; record variant listbox). `null` = nothing chosen. Supply
     * together with `onSelectedIdChange`; the list then needs `aria-label` or `aria-labelledby`.
     */
    selectedId?: Id | null;
    /** Called with the record chosen by click, Enter/Space or ArrowUp/ArrowDown/Home/End (selection follows focus). */
    onSelectedIdChange?: (id: Id) => void;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Timeline: <Id extends string = string>(props: TimelineProps<Id> & RefAttributes<HTMLOListElement>) => ReactElement;
export {};
//# sourceMappingURL=advanced-display.d.ts.map