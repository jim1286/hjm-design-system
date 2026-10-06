import { type ComposePaginationAccessibleName, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels } from "@hjmds/design-contracts/components/pagination";
import { type HTMLAttributes } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    descriptor: PaginationDescriptor;
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
    onPageChange: PaginationChangeHandler;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Pagination: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    descriptor: PaginationDescriptor;
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
    onPageChange: PaginationChangeHandler;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=pagination.d.ts.map