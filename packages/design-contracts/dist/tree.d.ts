import type { AsyncCollectionState, CollectionItemDescriptor, CollectionSelectionModel, SelectionDirection, WebKeyboardKey } from "./behaviors.js";
import { type CollectionNavigationIntent, type CollectionTypeaheadOptions } from "./collection.js";
/**
 * Ant Design Tree's drag-to-reorder is intentionally not reproduced — no
 * measured product need exists yet, and it is a materially harder contract
 * (drop-position semantics, cross-parent move validation) that should not be
 * guessed at ahead of a real screen. See docs/tree.md.
 */
export type TreeNodeDescriptor<Id extends string = string> = Omit<CollectionItemDescriptor<Id>, "shortcut" | "tone"> & Readonly<{
    /** Absent on a leaf. Never an empty array — a node either has no children or at least one. */
    children?: readonly TreeNodeDescriptor<Id>[];
}>;
export type TreeSelectionModel<Id extends string = string> = CollectionSelectionModel<Id>;
export type TreeAsyncState = AsyncCollectionState;
/** Checks one node's own fields; does not recurse — validateTreeNodes walks the whole tree. */
export declare function validateTreeNode<Id extends string>(node: TreeNodeDescriptor<Id>): void;
/** Depth-first flatten of every node at every depth, parents before children. */
export declare function flattenTreeNodes<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[]): readonly TreeNodeDescriptor<Id>[];
/**
 * `TreeNodeDescriptor` is `CollectionItemDescriptor` plus recursion, so the
 * flattened list is passed straight into the existing `validateCollection`
 * for base-contract checks (non-empty label/textValue, globally unique id)
 * instead of re-implementing them. Only the structural checks that
 * `validateCollection`'s fixed two-level `{items} | {sections}` shape cannot
 * express — id whitespace, the empty-children rule, and the recursion itself
 * — are new here.
 */
export declare function validateTreeNodes<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[]): void;
/**
 * Drops expanded keys that no longer identify an expandable node — removed
 * since the last render, or a leaf that never had children — the same way
 * `reconcileCheckboxSelection` drops selected ids that left the collection.
 * Returns the same reference when nothing changed.
 */
export declare function reconcileTreeExpansion<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[], expandedKeys: ReadonlySet<Id>): ReadonlySet<Id>;
export type TreeAccessibleNameInfo = Readonly<{
    /** 1-indexed; root nodes are depth 1. */
    depth: number;
    /** 1-indexed position among this node's own siblings, not the whole flattened tree. */
    position: number;
    siblingCount: number;
    label: string;
    hasChildren: boolean;
    expanded: boolean;
}>;
/**
 * Products own phrase order and whether/how "펼쳐짐"/"collapsed" is said for
 * a leaf (`hasChildren` lets the composer skip that clause entirely) — same
 * reason Steps, Timeline, and Carousel do not assemble their own accessible
 * name.
 */
export type ComposeTreeAccessibleName = (info: TreeAccessibleNameInfo) => string;
export type ResolvedTreeNodeDescriptor<Id extends string = string> = Omit<TreeNodeDescriptor<Id>, "children"> & Readonly<{
    depth: number;
    position: number;
    siblingCount: number;
    parentId: Id | null;
    hasChildren: boolean;
    /** Always false when `hasChildren` is false — a leaf has no expansion state. */
    expanded: boolean;
    /** False when any ancestor is collapsed. A renderer may still choose to keep it mounted-but-hidden. */
    visible: boolean;
    accessibleName: string;
}>;
export type ResolveTreeOptions = Readonly<{
    composeAccessibleName: ComposeTreeAccessibleName;
}>;
/**
 * Flattens the whole tree (not only the visible part) and attaches depth,
 * sibling position, parent linkage, expansion, visibility, and the composed
 * accessible name. Callers filter `.visible` for rendering and for the
 * navigation helpers below — one resolved array is the single source both
 * consult, the same relationship Tabs' resolved panel list has to its mount
 * policy.
 */
export declare function resolveTreeDescriptor<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[], expandedKeys: ReadonlySet<Id>, options: ResolveTreeOptions): readonly ResolvedTreeNodeDescriptor<Id>[];
export type TreeArrowKeyIntent = "expand" | "collapse";
/**
 * ArrowRight/ArrowLeft carry opposite meaning in RTL, the same translation
 * `getSelectionNavigationIntent` already applies for CheckboxGroup/RadioGroup
 * orientation. Every other key (Up/Down/Home/End/Typeahead) is a linear-list
 * problem Tree does not re-solve — see getVisibleTreeNodes below.
 */
export declare function getTreeArrowKeyIntent(key: WebKeyboardKey, direction: SelectionDirection): TreeArrowKeyIntent | undefined;
export type TreeArrowResult<Id extends string = string> = Readonly<{
    action: "expand" | "collapse";
}> | Readonly<{
    action: "moveFocus";
    targetId: Id;
}> | Readonly<{
    action: "none";
}>;
/**
 * Resolves the WAI-ARIA tree pattern for the pressed arrow: expand or move
 * into the first child; collapse or move to the parent. `disabled` never
 * gates this — it only gates selection eligibility (CollectionItemDescriptor
 * precedent), a node's children stay explorable either way.
 */
export declare function getTreeArrowResult<Id extends string>(visible: readonly ResolvedTreeNodeDescriptor<Id>[], currentId: Id, intent: TreeArrowKeyIntent): TreeArrowResult<Id>;
/**
 * Vertical movement across the currently visible nodes only — a collapsed
 * subtree's descendants are absent from `visible`, so this needs no Tree-
 * specific math at all: `getCollectionNavigationTarget` (disabled-skip, no
 * loop) already does exactly this for Menu/Select, and a resolved,
 * `.visible`-filtered node list satisfies `CollectionItemDescriptor` because
 * it is one, plus extra fields.
 */
export declare function getVisibleTreeNavigationTarget<Id extends string>(visible: readonly ResolvedTreeNodeDescriptor<Id>[], currentId: Id | null | undefined, intent: CollectionNavigationIntent): Id | undefined;
/** Same reuse for typeahead: only currently visible nodes are matchable. */
export declare function getVisibleTreeTypeaheadMatch<Id extends string>(visible: readonly ResolvedTreeNodeDescriptor<Id>[], query: string, options?: CollectionTypeaheadOptions<Id>): Id | undefined;
export declare const treeBehaviorDefaults: {
    readonly loop: false;
};
export declare const treeBehavior: {
    readonly controlled: readonly ["expandedKeys", "defaultExpandedKeys", "onExpandedKeysChange", "selection", "asyncState"];
    readonly defaults: {
        readonly loop: false;
    };
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["selected", "expanded"];
        readonly content: readonly ["idle", "loading", "loadingMore", "empty", "error"];
    };
    readonly web: {
        readonly roles: readonly ["tree", "treeitem", "group"];
        readonly keyboard: readonly ["Tab", "Enter", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Typeahead"];
        readonly focus: "roving";
    };
    /** Tree is Web-only per catalog platform classification — no native surface, matching Breadcrumb and Tooltip. */
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["depth-and-sibling-position-are-announced-not-only-visual-indent", "arrow-expands-or-moves-to-the-first-child-arrow-collapses-or-moves-to-the-parent-respecting-rtl", "up-down-home-end-move-across-visible-nodes-only-collapsed-subtrees-are-skipped", "typeahead-matches-only-currently-visible-nodes", "disabled-gates-selection-only-expand-and-collapse-remain-available", "empty-children-array-is-rejected-a-node-either-omits-children-or-lists-at-least-one", "one-tab-stop-per-node-the-expand-collapse-glyph-is-decorative-not-a-nested-control", "drag-reorder-is-out-of-scope-until-a-real-product-need-exists"];
};
export declare const treeRecipe: {
    readonly slots: readonly ["root", "node", "toggle", "indent", "label", "description"];
    readonly indentPerLevel: 20;
    /** Reuses the same row chrome Menu/Select items already use instead of inventing new selection-row visuals. */
    readonly node: {
        readonly minHeight: 44;
        readonly paddingHorizontal: 12;
        readonly gap: 12;
        readonly radius: "md";
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly highlightedBackground: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly selectedIndicator: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly toggle: {
        readonly size: "sm";
        readonly icons: {
            readonly collapsed: "chevronEnd";
            readonly expanded: "chevronDown";
        };
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly hitTarget: 44;
    };
};
//# sourceMappingURL=tree.d.ts.map