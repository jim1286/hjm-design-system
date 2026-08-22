import type { ColorReference } from "./color-references.js";
import type {
  BehaviorContract,
  CheckboxState,
  CollectionKey,
  SelectItemDescriptor,
} from "./behaviors.js";
import {
  getCheckboxNextState,
  reconcileCheckboxSelection,
  toggleCheckboxSelection,
} from "./selection-helpers.js";
import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { validateCollection } from "./collection.js";
import { control, radius, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * `docs/transfer-list.md`: two lists sharing one item set, split by whether
 * each id is in `targetKeys`. This is the same shape CheckboxGroup already
 * commits to (`ReadonlySet<Id>`, no third "which panel" enum to keep in
 * sync with membership) — one source of truth instead of two arrays that can
 * drift apart when an item is moved.
 */
export type TransferListPanel = "source" | "target";

export type TransferListDescriptor<Id extends CollectionKey = CollectionKey> = Readonly<{
  items: readonly SelectItemDescriptor<Id>[];
  targetKeys: ReadonlySet<Id>;
}>;

export type TransferListSelection<Id extends CollectionKey = CollectionKey> = Readonly<{
  source: ReadonlySet<Id>;
  target: ReadonlySet<Id>;
}>;

function withPanelSelection<Id extends CollectionKey>(
  selection: TransferListSelection<Id>,
  panel: TransferListPanel,
  next: ReadonlySet<Id>,
): TransferListSelection<Id> {
  return panel === "source"
    ? { source: next, target: selection.target }
    : { source: selection.source, target: next };
}

function assertKnownIds<Id extends CollectionKey>(
  label: string,
  ids: ReadonlySet<Id>,
  knownIds: ReadonlySet<Id>,
): void {
  for (const id of ids) {
    if (!knownIds.has(id)) {
      throw new RangeError(`TransferList ${label} references an unknown item id: ${id}`);
    }
  }
}

/** An item already sitting entirely inside one panel (including all-in-target
 * or all-in-source) is valid — nothing here requires either panel to be
 * non-empty, and a disabled item is valid in either panel even though it can
 * never be moved by the UI. */
export function validateTransferListDescriptor<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
): void {
  validateCollection({ items: descriptor.items });
  const knownIds = new Set(descriptor.items.map((item) => item.id));
  assertKnownIds("targetKeys", descriptor.targetKeys, knownIds);
}

export type TransferListPanels<Id extends CollectionKey = CollectionKey> = Readonly<{
  source: readonly SelectItemDescriptor<Id>[];
  target: readonly SelectItemDescriptor<Id>[];
}>;

/** Splits by `targetKeys` membership, preserving each item's relative order from `items`. */
export function resolveTransferListPanels<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
): TransferListPanels<Id> {
  validateTransferListDescriptor(descriptor);
  const source: SelectItemDescriptor<Id>[] = [];
  const target: SelectItemDescriptor<Id>[] = [];
  for (const item of descriptor.items) {
    (descriptor.targetKeys.has(item.id) ? target : source).push(item);
  }
  return { source, target };
}

export function validateTransferListSelection<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
  selection: TransferListSelection<Id>,
): void {
  const panels = resolveTransferListPanels(descriptor);
  assertKnownIds("selection.source", selection.source, new Set(panels.source.map((i) => i.id)));
  assertKnownIds("selection.target", selection.target, new Set(panels.target.map((i) => i.id)));
}

/** Toggles one row's checkbox within its own panel; the other panel's selection is untouched. */
export function toggleTransferListSelection<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
  selection: TransferListSelection<Id>,
  panel: TransferListPanel,
  id: Id,
): TransferListSelection<Id> {
  const panels = resolveTransferListPanels(descriptor);
  const next = toggleCheckboxSelection(panels[panel], selection[panel], id);
  return withPanelSelection(selection, panel, next);
}

/**
 * Same tri-state `CheckboxState` `resolveDataTableSelectAllState` derives for
 * a table header — disabled rows excluded from both the denominator and the
 * count — generalized from "all rows" to "this one panel's rows".
 */
export function resolveTransferListSelectAllState<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
  selection: TransferListSelection<Id>,
  panel: TransferListPanel,
): CheckboxState {
  const items = resolveTransferListPanels(descriptor)[panel];
  const selectable = items.filter((item) => !item.disabled);
  if (selectable.length === 0) return false;
  const selectedCount = selectable.filter((item) => selection[panel].has(item.id)).length;
  if (selectedCount === 0) return false;
  return selectedCount === selectable.length ? true : "mixed";
}

/** Mixed-defaults-to-checked, matching `getCheckboxNextState`'s existing convention. */
export function toggleTransferListSelectAll<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
  selection: TransferListSelection<Id>,
  panel: TransferListPanel,
): TransferListSelection<Id> {
  const current = resolveTransferListSelectAllState(descriptor, selection, panel);
  const checkAll = getCheckboxNextState(current);
  const items = resolveTransferListPanels(descriptor)[panel];
  const next = checkAll
    ? new Set(items.filter((item) => !item.disabled).map((item) => item.id))
    : new Set<Id>();
  return withPanelSelection(selection, panel, next);
}

export type TransferListMoveDirection = "toTarget" | "toSource";

export type TransferListMoveResult<Id extends CollectionKey = CollectionKey> = Readonly<{
  targetKeys: ReadonlySet<Id>;
  selection: TransferListSelection<Id>;
  /** In origin-panel order — the product formats the announcement string from this. */
  movedIds: readonly Id[];
}>;

/**
 * Moves every enabled, currently-selected id out of its origin panel.
 * Disabled ids are skipped rather than rejected (a disabled row can never
 * enter a selection through `toggleTransferListSelection`, but a product
 * could hand one to `defaultSelectedKeys`, and skipping mirrors
 * `toggleTreeCheckedSelection`'s disabled guard rather than throwing on it).
 * Moved ids are cleared from the origin panel's selection and deliberately
 * left unselected in the destination panel — a move commits a value, it does
 * not also commit a new pending selection the user did not make.
 */
export function moveTransferListSelection<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
  selection: TransferListSelection<Id>,
  direction: TransferListMoveDirection,
): TransferListMoveResult<Id> {
  validateTransferListSelection(descriptor, selection);
  const fromPanel: TransferListPanel = direction === "toTarget" ? "source" : "target";
  const fromItems = resolveTransferListPanels(descriptor)[fromPanel];
  const movedIds = fromItems
    .filter((item) => !item.disabled && selection[fromPanel].has(item.id))
    .map((item) => item.id);

  if (movedIds.length === 0) {
    return { targetKeys: descriptor.targetKeys, selection, movedIds: [] };
  }

  const movedIdSet = new Set(movedIds);
  const targetKeys =
    direction === "toTarget"
      ? new Set([...descriptor.targetKeys, ...movedIds])
      : new Set([...descriptor.targetKeys].filter((id) => !movedIdSet.has(id)));

  const nextFromSelection = new Set(
    [...selection[fromPanel]].filter((id) => !movedIdSet.has(id)),
  );
  return {
    targetKeys,
    selection: withPanelSelection(selection, fromPanel, nextFromSelection),
    movedIds,
  };
}

/**
 * Where focus lands once the moved rows are gone from a panel: the item that
 * slid into the first removed row's position, so keyboard users keep moving
 * down the list without their focus jumping to the top or vanishing. `null`
 * means the panel is now empty — the renderer falls back to the panel's
 * empty-state message or the move button, never to the document body.
 */
export function resolveTransferListFocusAfterMove<Id extends CollectionKey>(
  remainingPanelItems: readonly SelectItemDescriptor<Id>[],
  removedIndex: number,
): Id | null {
  if (remainingPanelItems.length === 0) return null;
  const clamped = Math.min(Math.max(removedIndex, 0), remainingPanelItems.length - 1);
  return remainingPanelItems[clamped]!.id;
}

/** Drops selected ids that left either panel (item removed from `items` entirely). */
export function reconcileTransferListSelection<Id extends CollectionKey>(
  descriptor: TransferListDescriptor<Id>,
  selection: TransferListSelection<Id>,
): TransferListSelection<Id> {
  const panels = resolveTransferListPanels(descriptor);
  const source = reconcileCheckboxSelection(panels.source, selection.source);
  const target = reconcileCheckboxSelection(panels.target, selection.target);
  if (source === selection.source && target === selection.target) return selection;
  return { source, target };
}

export const transferListRecipe = {
  slots: [
    "root",
    "panel",
    "panelHeader",
    "panelTitle",
    "panelCount",
    "list",
    "item",
    "itemCheckbox",
    "emptyState",
    "moveControls",
    "moveButton",
  ] as const,
  panel: {
    background: semanticColors.surface.default,
    border: semanticColors.border.default,
    borderWidth: stroke.default,
    radius: "md" as const,
  },
  panelHeader: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    title: { color: semanticColors.content.body, textVariant: "body" as const },
    count: { color: semanticColors.content.secondary, textVariant: "label" as const },
  },
  item: collectionItemContract,
  emptyState: { color: semanticColors.content.secondary, textVariant: "label" as const },
  moveControls: { gap: spacing.sm },
  moveButton: {
    minTarget: control.minTouchTarget,
    color: semanticColors.content.brand,
    disabledOpacity: 0.4,
  },
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly [
    "root",
    "panel",
    "panelHeader",
    "panelTitle",
    "panelCount",
    "list",
    "item",
    "itemCheckbox",
    "emptyState",
    "moveControls",
    "moveButton",
  ];
  panel: { background: ColorReference; border: ColorReference; borderWidth: number; radius: keyof typeof radius };
  panelHeader: {
    minHeight: number;
    paddingHorizontal: number;
    title: { color: ColorReference; textVariant: "body" };
    count: { color: ColorReference; textVariant: "label" };
  };
  item: typeof collectionItemContract;
  emptyState: { color: ColorReference; textVariant: "label" };
  moveControls: { gap: number };
  moveButton: { minTarget: number; color: ColorReference; disabledOpacity: number };
  states: { focus: typeof focusIndicatorContract };
};

export const transferListBehavior = {
  controlled: ["targetKeys", "defaultTargetKeys", "onTargetKeysChange"],
  inputs: ["items"],
  events: ["onMove"],
  stateAxes: {
    availability: ["enabled", "disabled"],
    value: ["empty", "filled", "selected", "mixed"],
  },
  web: {
    roles: ["group", "listbox", "option", "checkbox", "button"],
    keyboard: ["Tab", "Space", "Enter", "ArrowUp", "ArrowDown", "Home", "End"],
    focus: "roving",
  },
  native: {
    roles: ["list", "checkbox", "button"],
    states: ["disabled", "selected", "checked"],
    actions: ["toggle", "toggleSelectAll", "moveSelection", "moveItem"],
  },
  scenarios: [
    "moving-is-reachable-entirely-by-keyboard-select-with-space-then-activate-the-move-button",
    "moving-a-single-focused-row-does-not-require-first-opening-multi-select",
    "focus-after-a-move-lands-on-the-item-that-slid-into-the-removed-rows-position",
    "focus-after-emptying-a-panel-falls-back-to-its-empty-state-never-lost-to-the-document",
    "every-move-emits-which-ids-moved-so-the-product-can-announce-a-formatted-sentence",
    "disabled-items-are-never-selectable-and-never-move",
    "moved-items-are-cleared-from-the-origin-panels-selection-and-left-unselected-at-the-destination",
    "select-all-in-a-panel-excludes-disabled-items-from-both-the-denominator-and-the-count",
    "an-item-with-nothing-selected-in-its-panel-still-supports-direct-single-item-move",
    "search-and-pagination-inside-a-panel-are-product-composition-not-this-contract",
  ],
} as const satisfies BehaviorContract;
