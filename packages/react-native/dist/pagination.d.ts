import { type ComposePaginationAccessibleName, type ComposePaginationCurrentPageLabel, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels, type PaginationOpenEndedDescriptor } from '@hjmds/design-contracts/components/pagination';
import type { HjmCompositionStyleProp } from './composition-style.js';
/**
 * Bounded results pass a total and `composeAccessibleName` for the numbered window; open-ended results pass
 * `hasNext` and `composeCurrentPageLabel` for previous / current page label / next.
 */
export type PaginationProps = Readonly<{
    label: string;
    labels: PaginationLabels;
    onPageChange: PaginationChangeHandler;
    disabled?: boolean;
    testID?: string;
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
/** Bounded Native archives need the same page window and validation as Web; feeds still use LoadMore. */
export declare function Pagination({ label, descriptor, labels, composeAccessibleName, composeCurrentPageLabel, onPageChange, disabled, testID, layoutStyle }: PaginationProps): import("react").JSX.Element;
//# sourceMappingURL=pagination.d.ts.map