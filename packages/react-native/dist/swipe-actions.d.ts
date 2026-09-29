import { type ReactNode } from "react";
import { type RowAction } from "@hjmds/design-contracts/components/interaction-adapters";
export type SwipeActionsProps = {
    rowId: string;
    children: ReactNode;
    label: string;
    actions: readonly RowAction[];
    busy?: boolean;
    /** Share this controlled ID across a list to reveal only one row at a time. */
    openRowId: string | null;
    onOpenRowChange(id: string | null): void;
    actionsLabel: string;
    onAction(id: string): void | Promise<void>;
    onError(error: unknown): void;
};
export declare function SwipeActions(props: SwipeActionsProps): import("react").JSX.Element;
//# sourceMappingURL=swipe-actions.d.ts.map