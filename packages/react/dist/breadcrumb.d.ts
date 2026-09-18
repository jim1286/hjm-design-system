import { type BreadcrumbItemDescriptor } from "@hjmds/design-contracts/components/breadcrumb";
import { type HTMLAttributes, type ReactElement, type ReactNode, type RefAttributes } from "react";
export type BreadcrumbProps<Id extends string = string> = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    items: readonly BreadcrumbItemDescriptor<Id>[];
    separator?: ReactNode;
}>;
export declare const Breadcrumb: <Id extends string = string>(props: BreadcrumbProps<Id> & RefAttributes<HTMLElement>) => ReactElement;
//# sourceMappingURL=breadcrumb.d.ts.map