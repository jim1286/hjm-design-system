import { type BreadcrumbItemDescriptor } from "@hjm/design-contracts/components/breadcrumb";
import { type ComposePaginationAccessibleName, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels } from "@hjm/design-contracts/components/pagination";
import { type HTMLAttributes, type ReactElement, type ReactNode, type RefAttributes } from "react";
export type BreadcrumbProps<Id extends string = string> = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    items: readonly BreadcrumbItemDescriptor<Id>[];
    separator?: ReactNode;
}>;
export declare const Breadcrumb: <Id extends string = string>(props: BreadcrumbProps<Id> & RefAttributes<HTMLElement>) => ReactElement;
export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    descriptor: PaginationDescriptor;
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
    onPageChange: PaginationChangeHandler;
}>;
export declare const Pagination: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    descriptor: PaginationDescriptor;
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
    onPageChange: PaginationChangeHandler;
}> & RefAttributes<HTMLElement>>;
//# sourceMappingURL=advanced-navigation.d.ts.map