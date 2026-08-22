import { type DescriptionItemDescriptor, type DescriptionListColumns } from "@hjm/design-contracts/components/description-list";
import { type ComposeTimelineAccessibleName, type TimelineItemDescriptor } from "@hjm/design-contracts/components/timeline";
import { dividerRecipe, type AccordionDensity, type AvatarShape, type AvatarSize } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes, type ImgHTMLAttributes, type ReactElement, type ReactNode, type RefAttributes, type TableHTMLAttributes } from "react";
export type AccordionItem = Readonly<{
    id: string;
    title: ReactNode;
    panel: ReactNode;
    disabled?: boolean;
}>;
export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & Readonly<{
    items: readonly AccordionItem[];
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[]) => void;
    allowsMultipleExpanded?: boolean;
    density?: AccordionDensity;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}>;
export declare const Accordion: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & Readonly<{
    items: readonly AccordionItem[];
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[]) => void;
    allowsMultipleExpanded?: boolean;
    density?: AccordionDensity;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}> & RefAttributes<HTMLDivElement>>;
export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    name: string;
    src?: string;
    alt?: string;
    fallback?: ReactNode;
    size?: AvatarSize;
    shape?: AvatarShape;
    imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src">;
}>;
export declare const Avatar: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    name: string;
    src?: string;
    alt?: string;
    fallback?: ReactNode;
    size?: AvatarSize;
    shape?: AvatarShape;
    imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src">;
}> & RefAttributes<HTMLSpanElement>>;
export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = keyof typeof dividerRecipe.insets;
export type DividerProps = HTMLAttributes<HTMLElement> & Readonly<{
    orientation?: DividerOrientation;
    inset?: DividerInset;
    decorative?: boolean;
}>;
export declare const Divider: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLElement> & Readonly<{
    orientation?: DividerOrientation;
    inset?: DividerInset;
    decorative?: boolean;
}> & RefAttributes<HTMLElement>>;
export type DescriptionListProps<Id extends string = string> = Omit<HTMLAttributes<HTMLDListElement>, "children"> & Readonly<{
    items: readonly DescriptionItemDescriptor<Id>[];
    columns?: DescriptionListColumns;
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
}>;
export declare const Table: <Row>(props: TableProps<Row> & RefAttributes<HTMLTableElement>) => ReactElement;
export type TimelineProps<Id extends string = string> = Omit<HTMLAttributes<HTMLOListElement>, "children"> & Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    composeAccessibleName: ComposeTimelineAccessibleName;
}>;
export declare const Timeline: <Id extends string = string>(props: TimelineProps<Id> & RefAttributes<HTMLOListElement>) => ReactElement;
//# sourceMappingURL=advanced-display.d.ts.map