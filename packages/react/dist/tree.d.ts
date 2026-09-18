import { type ComposeTreeAccessibleName, type TreeAsyncState, type TreeNodeDescriptor, type TreeSelectionModel } from "@hjmds/design-contracts/components/tree";
import type { CheckboxState } from "@hjmds/design-contracts/behaviors";
import { type ReactNode } from "react";
export type TreeProps<Id extends string = string> = Readonly<{
    label: string;
    nodes: readonly TreeNodeDescriptor<Id>[];
    composeAccessibleName: ComposeTreeAccessibleName;
    expandedKeys?: ReadonlySet<Id>;
    defaultExpandedKeys?: ReadonlySet<Id>;
    onExpandedKeysChange?: (keys: ReadonlySet<Id>) => void;
    selection?: TreeSelectionModel<Id>;
    /**
     * Tri-state check marks per node, as `resolveTreeCheckedStates` derives them.
     * Checkboxes are not nested controls in a tree: the state rides on the node
     * itself as `aria-checked`, keeping the contract's one-tab-stop-per-node rule.
     */
    checkedStates?: ReadonlyMap<Id, CheckboxState>;
    onCheckedToggle?: (id: Id) => void;
    asyncState?: TreeAsyncState;
    /** Product-owned glyph for the expand/collapse affordance; decorative by contract. */
    renderToggle?: (state: Readonly<{
        expanded: boolean;
    }>) => ReactNode;
    className?: string;
}>;
export declare const Tree: <Id extends string = string>(props: TreeProps<Id> & {
    ref?: React.Ref<HTMLDivElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=tree.d.ts.map