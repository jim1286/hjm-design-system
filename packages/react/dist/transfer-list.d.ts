import { type TransferListMoveDirection } from "@hjmds/design-contracts/components/transfer-list";
import type { SelectItemDescriptor } from "@hjmds/design-contracts/behaviors";
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
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const TransferList: <Id extends string = string>(props: TransferListProps<Id> & {
    ref?: React.Ref<HTMLDivElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=transfer-list.d.ts.map