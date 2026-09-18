import { type CollapsibleOpenState } from "@hjmds/design-contracts/components/collapsible";
import { type ReactNode } from "react";
export type CollapsibleProps = CollapsibleOpenState & Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
}>;
export declare const Collapsible: import("react").ForwardRefExoticComponent<CollapsibleProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=collapsible.d.ts.map