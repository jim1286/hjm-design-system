import { type ReactNode } from "react";
import { type RowAction } from "@hjmds/design-contracts/components/interaction-adapters";
export type SwipeActionsProps = {
    children: ReactNode;
    label: string;
    actions: readonly RowAction[];
    busy?: boolean;
    onAction(id: string): void | Promise<void>;
    onError(error: unknown): void;
};
/** Desktop exposes the same actions directly; no hidden swipe-only functionality. */
export declare function SwipeActions({ children, label, actions, busy, onAction, onError }: SwipeActionsProps): import("react").JSX.Element;
//# sourceMappingURL=swipe-actions.d.ts.map