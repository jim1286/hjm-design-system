import type {
  AsyncCollectionState,
  BehaviorContract,
  CollectionItemDescriptor,
  CollectionSelectionModel,
  SelectionDirection,
  WebKeyboardKey,
} from "./behaviors.js";
import {
  getCollectionNavigationTarget,
  getCollectionTypeaheadMatch,
  validateCollection,
  type CollectionNavigationIntent,
  type CollectionTypeaheadOptions,
} from "./collection.js";
import type { ColorReference } from "./color-references.js";
import type { SemanticIconName } from "./icon.js";
import { collectionItemContract } from "./component-contracts.js";
import { control, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * Ant Design Tree's drag-to-reorder is intentionally not reproduced — no
 * measured product need exists yet, and it is a materially harder contract
 * (drop-position semantics, cross-parent move validation) that should not be
 * guessed at ahead of a real screen. See docs/tree.md.
 */
export type TreeNodeDescriptor<Id extends string = string> = Omit<
  CollectionItemDescriptor<Id>,
  "shortcut" | "tone"
> &
  Readonly<{
    /** Absent on a leaf. Never an empty array — a node either has no children or at least one. */
    children?: readonly TreeNodeDescriptor<Id>[];
  }>;

export type TreeSelectionModel<Id extends string = string> = CollectionSelectionModel<Id>;
export type TreeAsyncState = AsyncCollectionState;

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Tree ${field} must not be empty`);
  }
}

/** Checks one node's own fields; does not recurse — validateTreeNodes walks the whole tree. */
export function validateTreeNode<Id extends string>(node: TreeNodeDescriptor<Id>): void {
  assertNonEmpty(node.id, "node id");
  if (node.id !== node.id.trim()) {
    throw new TypeError("Tree node id must not start or end with whitespace");
  }
  assertNonEmpty(node.label, "node label");
  assertNonEmpty(node.textValue, "node textValue");
  if (node.description !== undefined) {
    assertNonEmpty(node.description, "node description");
  }
  if (node.children !== undefined && node.children.length === 0) {
    throw new TypeError(
      `Tree node ${node.id} children must not be an empty array — omit children instead`,
    );
  }
}

/** Depth-first flatten of every node at every depth, parents before children. */
export function flattenTreeNodes<Id extends string>(
  nodes: readonly TreeNodeDescriptor<Id>[],
): readonly TreeNodeDescriptor<Id>[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenTreeNodes(node.children) : []),
  ]);
}

/**
 * `TreeNodeDescriptor` is `CollectionItemDescriptor` plus recursion, so the
 * flattened list is passed straight into the existing `validateCollection`
 * for base-contract checks (non-empty label/textValue, globally unique id)
 * instead of re-implementing them. Only the structural checks that
 * `validateCollection`'s fixed two-level `{items} | {sections}` shape cannot
 * express — id whitespace, the empty-children rule, and the recursion itself
 * — are new here.
 */
export function validateTreeNodes<Id extends string>(
  nodes: readonly TreeNodeDescriptor<Id>[],
): void {
  if (nodes.length === 0) {
    throw new RangeError("Tree must contain at least one root node");
  }
  const flattened = flattenTreeNodes(nodes);
  for (const node of flattened) {
    validateTreeNode(node);
  }
  validateCollection({ items: flattened });
}

/**
 * Drops expanded keys that no longer identify an expandable node — removed
 * since the last render, or a leaf that never had children — the same way
 * `reconcileCheckboxSelection` drops selected ids that left the collection.
 * Returns the same reference when nothing changed.
 */
export function reconcileTreeExpansion<Id extends string>(
  nodes: readonly TreeNodeDescriptor<Id>[],
  expandedKeys: ReadonlySet<Id>,
): ReadonlySet<Id> {
  const expandable = new Set(
    flattenTreeNodes(nodes)
      .filter((node) => node.children !== undefined)
      .map((node) => node.id),
  );
  const reconciled = [...expandedKeys].filter((id) => expandable.has(id));
  return reconciled.length === expandedKeys.size ? expandedKeys : new Set(reconciled);
}

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

export type ResolvedTreeNodeDescriptor<Id extends string = string> = Omit<
  TreeNodeDescriptor<Id>,
  "children"
> &
  Readonly<{
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
export function resolveTreeDescriptor<Id extends string>(
  nodes: readonly TreeNodeDescriptor<Id>[],
  expandedKeys: ReadonlySet<Id>,
  options: ResolveTreeOptions,
): readonly ResolvedTreeNodeDescriptor<Id>[] {
  validateTreeNodes(nodes);
  if (typeof options.composeAccessibleName !== "function") {
    throw new TypeError("Tree composeAccessibleName must be a function");
  }

  const resolved: ResolvedTreeNodeDescriptor<Id>[] = [];
  const walk = (
    siblings: readonly TreeNodeDescriptor<Id>[],
    depth: number,
    parentId: Id | null,
    parentVisible: boolean,
  ): void => {
    siblings.forEach((node, index) => {
      const hasChildren = node.children !== undefined;
      const expanded = hasChildren && expandedKeys.has(node.id);
      const position = index + 1;
      const siblingCount = siblings.length;
      const accessibleName = options.composeAccessibleName({
        depth,
        position,
        siblingCount,
        label: node.label,
        hasChildren,
        expanded,
      });
      if (typeof accessibleName !== "string" || accessibleName.trim().length === 0) {
        throw new TypeError(
          "Tree composeAccessibleName must return a non-empty string",
        );
      }
      const { children, ...rest } = node;
      resolved.push({
        ...rest,
        depth,
        position,
        siblingCount,
        parentId,
        hasChildren,
        expanded,
        visible: parentVisible,
        accessibleName,
      });
      if (children) {
        walk(children, depth + 1, node.id, parentVisible && expanded);
      }
    });
  };
  walk(nodes, 1, null, true);
  return resolved;
}

export type TreeArrowKeyIntent = "expand" | "collapse";

/**
 * ArrowRight/ArrowLeft carry opposite meaning in RTL, the same translation
 * `getSelectionNavigationIntent` already applies for CheckboxGroup/RadioGroup
 * orientation. Every other key (Up/Down/Home/End/Typeahead) is a linear-list
 * problem Tree does not re-solve — see getVisibleTreeNodes below.
 */
export function getTreeArrowKeyIntent(
  key: WebKeyboardKey,
  direction: SelectionDirection,
): TreeArrowKeyIntent | undefined {
  if (key === "ArrowRight") return direction === "rtl" ? "collapse" : "expand";
  if (key === "ArrowLeft") return direction === "rtl" ? "expand" : "collapse";
  return undefined;
}

export type TreeArrowResult<Id extends string = string> =
  | Readonly<{ action: "expand" | "collapse" }>
  | Readonly<{ action: "moveFocus"; targetId: Id }>
  | Readonly<{ action: "none" }>;

/**
 * Resolves the WAI-ARIA tree pattern for the pressed arrow: expand or move
 * into the first child; collapse or move to the parent. `disabled` never
 * gates this — it only gates selection eligibility (CollectionItemDescriptor
 * precedent), a node's children stay explorable either way.
 */
export function getTreeArrowResult<Id extends string>(
  visible: readonly ResolvedTreeNodeDescriptor<Id>[],
  currentId: Id,
  intent: TreeArrowKeyIntent,
): TreeArrowResult<Id> {
  const node = visible.find((candidate) => candidate.id === currentId);
  if (!node) {
    throw new RangeError(`Tree node must be visible to receive arrow input: ${String(currentId)}`);
  }
  if (intent === "expand") {
    if (!node.hasChildren) return { action: "none" };
    if (!node.expanded) return { action: "expand" };
    const firstChild = visible.find(
      (candidate) => candidate.parentId === node.id && candidate.position === 1,
    );
    return firstChild ? { action: "moveFocus", targetId: firstChild.id } : { action: "none" };
  }
  if (node.hasChildren && node.expanded) return { action: "collapse" };
  if (node.parentId !== null) return { action: "moveFocus", targetId: node.parentId };
  return { action: "none" };
}

/**
 * Vertical movement across the currently visible nodes only — a collapsed
 * subtree's descendants are absent from `visible`, so this needs no Tree-
 * specific math at all: `getCollectionNavigationTarget` (disabled-skip, no
 * loop) already does exactly this for Menu/Select, and a resolved,
 * `.visible`-filtered node list satisfies `CollectionItemDescriptor` because
 * it is one, plus extra fields.
 */
export function getVisibleTreeNavigationTarget<Id extends string>(
  visible: readonly ResolvedTreeNodeDescriptor<Id>[],
  currentId: Id | null | undefined,
  intent: CollectionNavigationIntent,
): Id | undefined {
  return getCollectionNavigationTarget({ items: visible }, currentId, intent, false);
}

/** Same reuse for typeahead: only currently visible nodes are matchable. */
export function getVisibleTreeTypeaheadMatch<Id extends string>(
  visible: readonly ResolvedTreeNodeDescriptor<Id>[],
  query: string,
  options?: CollectionTypeaheadOptions<Id>,
): Id | undefined {
  return getCollectionTypeaheadMatch({ items: visible }, query, options);
}

export const treeBehaviorDefaults = {
  loop: false,
} as const satisfies Readonly<{ loop: boolean }>;

export const treeBehavior = {
  controlled: ["expandedKeys", "defaultExpandedKeys", "onExpandedKeysChange", "selection", "asyncState"],
  defaults: treeBehaviorDefaults,
  stateAxes: {
    availability: ["enabled", "disabled"],
    value: ["selected", "expanded"],
    content: ["idle", "loading", "loadingMore", "empty", "error"],
  },
  web: {
    roles: ["tree", "treeitem", "group"],
    keyboard: [
      "Tab",
      "Enter",
      "Space",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Typeahead",
    ],
    focus: "roving",
  },
  /** Tree is Web-only per catalog platform classification — no native surface, matching Breadcrumb and Tooltip. */
  native: { roles: [], states: [], actions: [] },
  scenarios: [
    "depth-and-sibling-position-are-announced-not-only-visual-indent",
    "arrow-expands-or-moves-to-the-first-child-arrow-collapses-or-moves-to-the-parent-respecting-rtl",
    "up-down-home-end-move-across-visible-nodes-only-collapsed-subtrees-are-skipped",
    "typeahead-matches-only-currently-visible-nodes",
    "disabled-gates-selection-only-expand-and-collapse-remain-available",
    "empty-children-array-is-rejected-a-node-either-omits-children-or-lists-at-least-one",
    "one-tab-stop-per-node-the-expand-collapse-glyph-is-decorative-not-a-nested-control",
    "drag-reorder-is-out-of-scope-until-a-real-product-need-exists",
  ],
} as const satisfies BehaviorContract;

export const treeRecipe = {
  slots: ["root", "node", "toggle", "indent", "label", "description"] as const,
  indentPerLevel: spacing.lg,
  /** Reuses the same row chrome Menu/Select items already use instead of inventing new selection-row visuals. */
  node: collectionItemContract,
  toggle: {
    size: "sm",
    icons: {
      collapsed: "chevronEnd",
      expanded: "chevronDown",
    },
    color: semanticColors.content.secondary,
    hitTarget: control.minTouchTarget,
  },
} as const satisfies {
  slots: readonly string[];
  indentPerLevel: number;
  node: typeof collectionItemContract;
  toggle: {
    size: string;
    icons: Readonly<{ collapsed: SemanticIconName; expanded: SemanticIconName }>;
    color: ColorReference;
    hitTarget: number;
  };
};
