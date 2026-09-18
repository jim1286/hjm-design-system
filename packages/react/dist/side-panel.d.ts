import { type SidePanelDismissPolicy, type SidePanelDismissReason, type SidePanelEdge, type SidePanelOpenChangeDetails, type SidePanelSize } from "@hjmds/design-contracts/components/side-panel";
import { type ReactNode } from "react";
import { type ModalOpenState } from "./modal.js";
export type SidePanelProps = ModalOpenState<SidePanelOpenChangeDetails> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    /** Logical docking direction; mirrors automatically in RTL. */
    edge?: SidePanelEdge;
    size?: SidePanelSize;
    busy?: boolean;
    /**
     * The whole policy, not `Partial<...>`: the contract splits this union on
     * `modal` so that `{ modal: false, outsideDismiss: true }` cannot be
     * written at all. `Partial<SidePanelDismissPolicy>` would collapse both
     * branches into optional fields and hand that invalid combination back.
     */
    dismissPolicy?: SidePanelDismissPolicy;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Fires once per visible cycle, after the panel has been removed. */
    onDismissComplete?: (detail: Readonly<{
        reason: SidePanelDismissReason;
    }>) => void;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
}>;
export declare const SidePanel: import("react").ForwardRefExoticComponent<SidePanelProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=side-panel.d.ts.map