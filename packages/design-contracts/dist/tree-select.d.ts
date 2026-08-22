import type { CheckboxState } from "./behaviors.js";
import { type TreeNodeDescriptor } from "./tree.js";
/**
 * `docs/tree.md`'s own "TreeSelect 판정" concludes TreeSelect is Select's
 * surface (trigger + popup/sheet, committed value) plus Tree's collection
 * (depth/sibling announcement, arrow-key expand/collapse, `expandedKeys`
 * reconciliation) — no third primitive. That verdict is right for
 * **single-select** TreeSelect: picking exactly one node needs nothing
 * beyond Select's existing `selectedKey: Id | null` and Tree's flat item
 * list, because there is nothing to aggregate.
 *
 * It is incomplete for **multiple-select** TreeSelect (checkboxes at every
 * depth). Neither file solves "a parent's checkbox must show a third,
 * aggregate state when only some of its descendant leaves are checked" —
 * that is not a new selection model, it is `resolveDataTableSelectAllState`
 * (`src/data-table.ts`) generalized from one level (header ↔ rows) to
 * recursive depth (parent ↔ every descendant leaf), reusing the exact same
 * `CheckboxState` (`boolean | "mixed"`) the header checkbox already renders.
 * This module is that one missing piece — nothing else.
 */
export type TreeCheckedKeys<Id extends string = string> = ReadonlySet<Id>;
/**
 * A parent's own id is never meaningfully "in" the checked set — its
 * checked/unchecked/mixed state is always derived from its descendant
 * leaves, the same way a DataTable header is never itself a row in
 * `selectedKeys`. Storing a parent id here would be ambiguous (does it mean
 * "all children" or "just this category, independent of children"?) with no
 * measured product need to resolve that ambiguity, so it is rejected instead
 * of guessed at.
 */
export declare function validateTreeCheckedSelection<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[], checkedKeys: TreeCheckedKeys<Id>): void;
/**
 * One depth-first pass computing every node's tri-state at once — the same
 * "resolve the whole tree once, filter afterward" shape `resolveTreeDescriptor`
 * already uses for depth/position, rather than re-walking per node.
 *
 * A parent's aggregate is computed from *enabled descendant leaf coverage*,
 * exactly generalizing `resolveDataTableSelectAllState`'s "disabled rows are
 * excluded from both the denominator and the count." A disabled leaf keeps
 * its own literal `checkedKeys.has(id)` as its individual displayed state
 * (a disabled checkbox can still visibly be checked), but never counts
 * toward any ancestor's true/false/mixed — otherwise a single
 * disabled-and-unchecked leaf would permanently pin every ancestor to
 * "mixed" even once all of its enabled siblings are checked.
 */
export declare function resolveTreeCheckedStates<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[], checkedKeys: TreeCheckedKeys<Id>): ReadonlyMap<Id, CheckboxState>;
/**
 * Checking or unchecking any node (leaf or parent) sets every enabled
 * descendant leaf to the opposite of "fully checked" — the same
 * mixed-defaults-to-checked convention `getCheckboxNextState` already uses
 * for a single aggregate Checkbox (`src/behaviors.ts`). Disabled leaves are
 * left untouched, mirroring `toggleCheckboxSelection`'s own disabled guard.
 * This is "the rule where selecting a parent selects the children together,"
 * made unambiguous by the fact that parents are never independently stored.
 */
export declare function toggleTreeCheckedSelection<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[], checkedKeys: TreeCheckedKeys<Id>, targetId: Id): TreeCheckedKeys<Id>;
/**
 * Drops leaf ids that left the tree or stopped being leaves — the same
 * shape as `reconcileCheckboxSelection`/`reconcileTreeExpansion`. Returns the
 * same reference when nothing changed.
 */
export declare function reconcileTreeCheckedSelection<Id extends string>(nodes: readonly TreeNodeDescriptor<Id>[], checkedKeys: TreeCheckedKeys<Id>): TreeCheckedKeys<Id>;
/**
 * No new recipe file: the surface composes three *existing* recipes
 * unchanged — Select's trigger/frame (`selectRecipe`), Tree's row anatomy
 * (`treeRecipe.node`/`.toggle`/`.indentPerLevel`) for each popup row, and the
 * existing Checkbox mark for the tri-state indicator this module derives.
 * Declaring a fourth "treeSelectRecipe" would just alias tokens the other
 * three already own.
 *
 * No new behaviorRegistry entry either: TreeSelect's open/dismiss reasons,
 * roles, and keyboard model are `behaviorRegistry.select` verbatim — this
 * module only adds the functions above, which a Select+Tree renderer calls
 * to compute per-row checkbox state and to interpret a row's checkbox
 * activation.
 */
export declare const treeSelectBehaviorScenarios: readonly ["single-select-mode-needs-none-of-this-module-selectedkey-and-flat-items-are-enough", "checking-an-unchecked-parent-checks-every-enabled-descendant-leaf", "unchecking-a-fully-checked-parent-unchecks-every-enabled-descendant-leaf", "a-parent-with-some-but-not-all-descendant-leaves-checked-renders-mixed", "disabled-leaves-are-skipped-by-cascade-toggle-but-still-counted-by-derivation", "checkedkeys-containing-a-parent-or-unknown-id-is-rejected-not-silently-ignored", "removing-a-checked-leaf-from-the-tree-reconciles-it-out-without-touching-siblings"];
//# sourceMappingURL=tree-select.d.ts.map