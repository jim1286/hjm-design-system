import { type ComposePaginationAccessibleName, type ComposePaginationCurrentPageLabel, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels, type PaginationOpenEndedDescriptor } from "@hjmds/design-contracts/components/pagination";
import { type HTMLAttributes } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
/**
 * Bounded results pass a total and `composeAccessibleName` for the numbered window; open-ended results pass
 * `hasNext` and `composeCurrentPageLabel` for previous / current page label / next.
 */
export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    labels: PaginationLabels;
    onPageChange: PaginationChangeHandler;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & (Readonly<{
    descriptor: PaginationDescriptor;
    composeAccessibleName: ComposePaginationAccessibleName;
    composeCurrentPageLabel?: never;
}> | Readonly<{
    descriptor: PaginationOpenEndedDescriptor;
    composeCurrentPageLabel: ComposePaginationCurrentPageLabel;
    composeAccessibleName?: never;
}>);
export declare const Pagination: import("react").ForwardRefExoticComponent<PaginationProps & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=pagination.d.ts.map