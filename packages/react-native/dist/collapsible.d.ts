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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Collapsible({ trigger, children, disabled, presentation, keepMounted, layoutStyle, ...openState }: CollapsibleProps): import("react").JSX.Element;
//# sourceMappingURL=collapsible.d.ts.map