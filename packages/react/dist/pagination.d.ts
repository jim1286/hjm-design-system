import { type ComposePaginationAccessibleName, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels } from "@hjmds/design-contracts/components/pagination";
import { type HTMLAttributes } from "react";
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
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=pagination.d.ts.map