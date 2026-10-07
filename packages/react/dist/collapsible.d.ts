import { type CollapsibleOpenState } from "@hjmds/design-contracts/components/collapsible";
import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CollapsibleProps = CollapsibleOpenState & Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    children: ReactNode;
    disabled?: boolean;
    /** Inline tools stay expanded without a disclosure trigger. */
    presentation?: "disclosure" | "inline";
    /** Preserve local input state while hidden; hidden content stays inaccessible. */
    keepMounted?: boolean;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Collapsible: import("react").ForwardRefExoticComponent<CollapsibleProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=collapsible.d.ts.map