import { type HeadingDescriptor } from "@hjmds/design-contracts/components/heading";
import { type HTMLAttributes, type ReactNode } from "react";
export type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & HeadingDescriptor & Readonly<{
    children: ReactNode;
}>;
export declare const Heading: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & Readonly<{
    level: import("@hjmds/design-contracts/foundations").HeadingLevel;
    semanticLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}> & Readonly<{
    children: ReactNode;
}> & import("react").RefAttributes<HTMLHeadingElement>>;
//# sourceMappingURL=heading.d.ts.map