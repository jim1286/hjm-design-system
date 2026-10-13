import { type TransferListMoveDirection } from "@hjmds/design-contracts/components/transfer-list";
import { type SelectItemDescriptor } from "@hjmds/design-contracts/behaviors";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TransferListLabels = Readonly<{
    source: string;
    target: string;
    toTarget: string;
    toSource: string;
    selectAll: string;
    empty: string;
}>;
export type TransferListProps<Id extends string = string> = Readonly<{
    items: readonly SelectItemDescriptor<Id>[];
    labels: TransferListLabels;
    targetKeys?: ReadonlySet<Id>;
    defaultTargetKeys?: ReadonlySet<Id>;
    onTargetKeysChange?: (keys: ReadonlySet<Id>) => void;
    /** Receives which ids moved, in origin-panel order, so the product announces it. */
    onMove?: (movedIds: readonly Id[], direction: TransferListMoveDirection) => void;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function TransferList<Id extends string = string>({ items, labels, targetKeys: controlledTargetKeys, defaultTargetKeys, onTargetKeysChange, onMove, layoutStyle, }: TransferListProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=transfer-list.d.ts.map