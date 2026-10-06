import { type BreadcrumbItemDescriptor } from "@hjmds/design-contracts/components/breadcrumb";
import { type HTMLAttributes, type ReactElement, type ReactNode, type RefAttributes } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type BreadcrumbProps<Id extends string = string> = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    items: readonly BreadcrumbItemDescriptor<Id>[];
    separator?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Breadcrumb: <Id extends string = string>(props: BreadcrumbProps<Id> & RefAttributes<HTMLElement>) => ReactElement;
//# sourceMappingURL=breadcrumb.d.ts.map