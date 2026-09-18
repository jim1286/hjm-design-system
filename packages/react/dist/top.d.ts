import { type TopDescriptor } from "@hjmds/design-contracts/components/top";
import { type ReactNode } from "react";
export type TopProps = Readonly<{
    descriptor: TopDescriptor;
    /** Secondary action sharing the title row; drops below it when space runs out. */
    trailing?: ReactNode;
    className?: string;
}>;
export declare const Top: import("react").ForwardRefExoticComponent<Readonly<{
    descriptor: TopDescriptor;
    /** Secondary action sharing the title row; drops below it when space runs out. */
    trailing?: ReactNode;
    className?: string;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=top.d.ts.map