import { type ComposePaginationAccessibleName, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels } from '@hjmds/design-contracts/components/pagination';
import type { HjmCompositionStyleProp } from './composition-style.js';
export type PaginationProps = Readonly<{
    label: string;
    descriptor: PaginationDescriptor;
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
    onPageChange: PaginationChangeHandler;
    disabled?: boolean;
    testID?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Bounded Native archives need the same page window and validation as Web; feeds still use LoadMore. */
export declare function Pagination({ label, descriptor, labels, composeAccessibleName, onPageChange, disabled, testID, layoutStyle }: PaginationProps): import("react").JSX.Element;
//# sourceMappingURL=pagination.d.ts.map