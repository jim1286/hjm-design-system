import { type SkipNavDescriptor } from "@hjmds/design-contracts/components/skip-nav";
import { type AnchorHTMLAttributes } from "react";
export type SkipNavProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & SkipNavDescriptor & Readonly<{
    className?: string;
}>;
export declare const SkipNav: import("react").ForwardRefExoticComponent<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & Readonly<{
    targetId: string;
    label: string;
}> & Readonly<{
    className?: string;
}> & import("react").RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=skip-nav.d.ts.map