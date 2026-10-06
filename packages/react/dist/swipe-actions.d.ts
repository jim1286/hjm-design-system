import { type ReactNode } from "react";
import { type RowAction } from "@hjmds/design-contracts/components/interaction-adapters";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type SwipeActionsProps = {
    children: ReactNode;
    label: string;
    actions: readonly RowAction[];
    busy?: boolean;
    onAction(id: string): void | Promise<void>;
    onError(error: unknown): void;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
};
/** Desktop exposes the same actions directly; no hidden swipe-only functionality. */
export declare function SwipeActions({ children, label, actions, busy, onAction, onError, layoutStyle }: SwipeActionsProps): import("react").JSX.Element;
//# sourceMappingURL=swipe-actions.d.ts.map