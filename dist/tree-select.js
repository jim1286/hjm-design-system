import { flattenTreeNodes, validateTreeNodes } from "./tree.js";
function leafIdsOf(nodes) {
    return new Set(flattenTreeNodes(nodes)
        .filter((node) => node.children === undefined)
        .map((node) => node.id));
}
/**
 * A parent's own id is never meaningfully "in" the checked set — its
 * checked/unchecked/mixed state is always derived from its descendant
 * leaves, the same way a DataTable header is never itself a row in
 * `selectedKeys`. Storing a parent id here would be ambiguous (does it mean
 * "all children" or "just this category, independent of children"?) with no
 * measured product need to resolve that ambiguity, so it is rejected instead
 * of guessed at.
 */
export function validateTreeCheckedSelection(nodes, checkedKeys) {
    validateTreeNodes(nodes);
    const leafIds = leafIdsOf(nodes);
    for (const key of checkedKeys) {
        if (!leafIds.has(key)) {
            throw new RangeError(`TreeSelect checkedKeys must reference an existing leaf node id, not a parent or unknown id: ${key}`);
        }
    }
}
function combineCoverage(a, b) {
    return { enabled: a.enabled + b.enabled, checked: a.checked + b.checked };
}
function coverageToState(coverage) {
    if (coverage.enabled === 0 || coverage.checked === 0)
        return false;
    return coverage.checked === coverage.enabled ? true : "mixed";
}
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
export function resolveTreeCheckedStates(nodes, checkedKeys) {
    validateTreeCheckedSelection(nodes, checkedKeys);
    const states = new Map();
    const visit = (node) => {
        if (node.children === undefined) {
            const checked = checkedKeys.has(node.id);
            states.set(node.id, checked);
            return node.disabled
                ? { enabled: 0, checked: 0 }
                : { enabled: 1, checked: checked ? 1 : 0 };
        }
        const coverage = node.children
            .map(visit)
            .reduce(combineCoverage, { enabled: 0, checked: 0 });
        states.set(node.id, coverageToState(coverage));
        return coverage;
    };
    for (const node of nodes)
        visit(node);
    return states;
}
/**
 * Checking or unchecking any node (leaf or parent) sets every enabled
 * descendant leaf to the opposite of "fully checked" — the same
 * mixed-defaults-to-checked convention `getCheckboxNextState` already uses
 * for a single aggregate Checkbox (`src/behaviors.ts`). Disabled leaves are
 * left untouched, mirroring `toggleCheckboxSelection`'s own disabled guard.
 * This is "the rule where selecting a parent selects the children together,"
 * made unambiguous by the fact that parents are never independently stored.
 */
export function toggleTreeCheckedSelection(nodes, checkedKeys, targetId) {
    const states = resolveTreeCheckedStates(nodes, checkedKeys);
    const currentState = states.get(targetId);
    if (currentState === undefined) {
        throw new RangeError(`Tree node must exist: ${targetId}`);
    }
    const flattened = flattenTreeNodes(nodes);
    const target = flattened.find((node) => node.id === targetId);
    const descendantLeaves = (target.children ? flattenTreeNodes(target.children) : [target]).filter((node) => node.children === undefined);
    const nextChecked = currentState !== true;
    const next = new Set(checkedKeys);
    for (const leaf of descendantLeaves) {
        if (leaf.disabled)
            continue;
        if (nextChecked)
            next.add(leaf.id);
        else
            next.delete(leaf.id);
    }
    return next;
}
/**
 * Drops leaf ids that left the tree or stopped being leaves — the same
 * shape as `reconcileCheckboxSelection`/`reconcileTreeExpansion`. Returns the
 * same reference when nothing changed.
 */
export function reconcileTreeCheckedSelection(nodes, checkedKeys) {
    validateTreeNodes(nodes);
    const leafIds = leafIdsOf(nodes);
    const reconciled = [...checkedKeys].filter((id) => leafIds.has(id));
    return reconciled.length === checkedKeys.size ? checkedKeys : new Set(reconciled);
}
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
export const treeSelectBehaviorScenarios = [
    "single-select-mode-needs-none-of-this-module-selectedkey-and-flat-items-are-enough",
    "checking-an-unchecked-parent-checks-every-enabled-descendant-leaf",
    "unchecking-a-fully-checked-parent-unchecks-every-enabled-descendant-leaf",
    "a-parent-with-some-but-not-all-descendant-leaves-checked-renders-mixed",
    "disabled-leaves-are-skipped-by-cascade-toggle-but-still-counted-by-derivation",
    "checkedkeys-containing-a-parent-or-unknown-id-is-rejected-not-silently-ignored",
    "removing-a-checked-leaf-from-the-tree-reconciles-it-out-without-touching-siblings",
];
//# sourceMappingURL=tree-select.js.map