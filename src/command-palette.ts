import type { CollectionKey, ComboboxInput, MenuItemDescriptor } from "./behaviors.js";
import type { CollectionSource, ComboboxCollectionState } from "./collection.js";
import {
  collectionItemContract,
  fieldFrameContract,
  floatingSurfaceContract,
} from "./component-contracts.js";
import { backdrop, motionPreset, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * antd has no direct crosswalk target for CommandPalette — it is not in
 * `antDesignReferenceComponents`. The nearest antd surface, `AutoComplete`/
 * `Select` with `showSearch`, is exactly the composition question this
 * module answers below, not a separate coverage gap.
 *
 * Decisive difference from Combobox: **a result is an action, not a
 * persisted value.** Committing a Combobox sets `selectedKey` as the field's
 * ongoing value, and `inputValue` goes on mirroring it. Running "새 트윗
 * 작성" has no ongoing value anywhere to remember — the palette closes and
 * resets. Forcing `selectedKey`/`onCommit` onto that would create a
 * phantom value that is always `null` again the instant the palette reopens,
 * the same category of dead-state mistake `docs/dropdown.md` avoided by not
 * re-defining Menu's problem under a second name. So items here are shaped
 * like `MenuItemDescriptor` (carries `shortcut`/`tone` for destructive
 * commands), not `SelectItemDescriptor` (which deliberately strips both,
 * because a Select option is a value, not an action).
 *
 * Everything else composes from existing contracts without changes:
 * - **Heterogeneous sources** ("최근" / "명령어" / "검색 결과" in one list):
 *   already representable — `CollectionSource`'s `sections` is exactly
 *   grouped items, no new data model.
 * - **Search/filter text**: `ComboboxInput` (inputValue/defaultInputValue/
 *   onInputValueChange) and `ComboboxCollectionState` (local vs. external
 *   filtering, `queryValue`/`resultQuery` staleness guard) are reused
 *   verbatim — a command search is the same async-search problem Combobox
 *   already solved, just over commands instead of selectable values.
 * - **Keyboard navigation/typeahead across sections**: `getCollectionNavigationTarget`/
 *   `getCollectionTypeaheadMatch` (`src/collection.ts`) already generalize
 *   over any `CollectionSource`; nothing palette-specific to add.
 * - **Global keyboard shortcut** (⌘K): explicitly out of scope. Which key
 *   combination opens the palette, and whether it is global or scoped, is a
 *   product/app decision — the same reason Link does not own navigation and
 *   BottomNavigation does not own the router's route state.
 */
export type CommandPaletteItemDescriptor<Key extends CollectionKey = CollectionKey> =
  MenuItemDescriptor<Key>;

export type CommandPaletteSource<
  Key extends CollectionKey = CollectionKey,
  SectionKey extends CollectionKey = CollectionKey,
> = CollectionSource<Key, SectionKey>;

export type CommandPaletteInput = ComboboxInput;
export type CommandPaletteQueryState = ComboboxCollectionState;

export type CommandPaletteActivateReason = "pointer" | "keyboard";

/**
 * Mirrors Menu's `onAction`/`onActionAfterDismiss` split (`behaviorRegistry.menu`)
 * without importing it — Menu, like Dialog, predates the per-component
 * `src/<name>.ts` convention and has no exported type of its own to import,
 * only string literals in the shared registry. `onActivate` fires
 * immediately; `onActivateAfterDismiss` fires once the exit transition
 * completes, for a command that itself opens another overlay (the same
 * "close first, open the next surface after exit completes" ordering
 * `docs/architecture.md`'s overlay-stack rule already requires).
 */
export type CommandPaletteActivateHandler<Key extends CollectionKey = CollectionKey> = (
  itemId: Key,
  reason: CommandPaletteActivateReason,
) => void;

/**
 * Web-only modal overlay (catalog: `platform: "web"`) — there is no `modal`
 * axis the way SidePanel needs one; a command palette is always a modal
 * takeover, never an inline non-modal surface. No `back`/`swipe` for the
 * same web-only reason `SidePanelDismissReason` excludes them.
 *
 * `"activation"` is a dismiss reason, not merely an event: running a command
 * always closes the palette, which is why `canDismissCommandPalette` treats
 * it like `"programmatic"` — an owner-level certainty no policy can veto.
 * There is no `busy` axis blocking dismissal while a command executes: the
 * palette itself is fire-and-forget (`onActivate` fires and the palette
 * closes); if the command's own effect is asynchronous, that runs after the
 * palette is already gone, the same ordering Menu's `onActionAfterDismiss`
 * already models. Recreating AlertDialog's `idle→busy→error` session here
 * would be guessing at a requirement (a command that must block the palette
 * open until it settles) with no measured product need.
 */
export type CommandPaletteDismissReason =
  | "close-action"
  | "outside"
  | "escape"
  | "activation"
  | "programmatic";

export type CommandPaletteOpenChangeDetails = Readonly<{
  reason: "trigger" | CommandPaletteDismissReason;
}>;

export type ControlledCommandPaletteOpenState = Readonly<{
  open: boolean;
  defaultOpen?: never;
  onOpenChange(open: boolean, details: CommandPaletteOpenChangeDetails): void;
}>;

export type UncontrolledCommandPaletteOpenState = Readonly<{
  open?: never;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    details: CommandPaletteOpenChangeDetails,
  ) => void;
}>;

export type CommandPaletteOpenState =
  | ControlledCommandPaletteOpenState
  | UncontrolledCommandPaletteOpenState;

export type CommandPaletteDismissPolicy = Readonly<{
  dismissible: boolean;
  outsideDismiss: boolean;
  escapeDismiss: boolean;
}>;

export const commandPaletteBehaviorDefaults = {
  dismissible: true,
  outsideDismiss: true,
  escapeDismiss: true,
} as const satisfies CommandPaletteDismissPolicy;

export function canDismissCommandPalette(
  reason: CommandPaletteDismissReason,
  policy: CommandPaletteDismissPolicy = commandPaletteBehaviorDefaults,
): boolean {
  if (reason === "programmatic" || reason === "activation") return true;
  if (!policy.dismissible) return false;
  if (reason === "outside") return policy.outsideDismiss;
  if (reason === "escape") return policy.escapeDismiss;
  return true;
}

/**
 * `accessibilityLabel` is required, not optional like Popover's — a command
 * palette's `role="dialog"` surface has no visible heading the way Dialog's
 * `title` slot or typical Popover content provides; the search field alone
 * is not a reliable accessible name across renderers. `searchPlaceholder` is
 * required for the same reason `LoadMoreLabels`/`PaginationLabels` require
 * every field: a renderer must not invent untranslated fallback copy.
 */
export type CommandPaletteDescriptor = Readonly<{
  accessibilityLabel: string;
  searchPlaceholder: string;
}>;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`CommandPalette ${field} must not be empty`);
  }
}

export function validateCommandPaletteDescriptor(
  descriptor: CommandPaletteDescriptor,
): void {
  if (descriptor === null || typeof descriptor !== "object") {
    throw new TypeError("CommandPalette descriptor must be an object");
  }
  assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
  assertNonEmpty(descriptor.searchPlaceholder, "searchPlaceholder");
}

/**
 * Anatomy only — chrome for the modal shell and the pinned search field,
 * reusing the exact tokens Dialog-family and Menu-family recipes already use
 * (`floatingSurfaceContract`, `fieldFrameContract`, `collectionItemContract`)
 * instead of inventing new ones. Result rows and section labels reuse
 * `collectionItemContract` the same way `menuRecipe`/`treeRecipe` do — a
 * command result is chrome-identical to a Menu item, it just lives in a
 * modal instead of an anchored popup.
 */
export const commandPaletteRecipe = {
  slots: [
    "backdrop",
    "positioner",
    "content",
    "searchField",
    "viewport",
    "section",
    "sectionLabel",
    "item",
    "leading",
    "copy",
    "label",
    "description",
    "shortcut",
    "emptyState",
  ] as const,
  backdrop: backdrop.modal,
  content: {
    background: floatingSurfaceContract.background,
    border: floatingSurfaceContract.border,
    borderWidth: floatingSurfaceContract.borderWidth,
    radius: "lg" as const,
    shadow: floatingSurfaceContract.shadow,
    maxWidth: 560,
    maxHeight: 420,
  },
  searchField: {
    minHeight: fieldFrameContract.minHeight,
    paddingHorizontal: fieldFrameContract.paddingHorizontal,
    borderColor: fieldFrameContract.border,
  },
  item: collectionItemContract,
  sectionLabel: {
    color: semanticColors.content.secondary,
    textVariant: "label" as const,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emptyState: {
    color: semanticColors.content.secondary,
    textVariant: "body" as const,
    paddingVertical: spacing.xl,
  },
  transition: { enter: motionPreset.enter, exit: motionPreset.exit },
} as const;

export const commandPaletteBehaviorScenarios = [
  "activating-a-result-always-closes-the-palette-regardless-of-dismiss-policy",
  "escape-and-outside-close-without-running-any-command",
  "sections-merge-recents-static-commands-and-search-results-without-a-new-data-model",
  "keyboard-navigation-and-typeahead-reuse-the-shared-collection-helpers-unchanged",
  "local-vs-external-filtering-reuses-comboboxcollectionstate-staleness-guard-unchanged",
  "empty-result-state-is-announced-once-not-per-section",
  "no-global-shortcut-binding-is-owned-here-the-product-decides-the-trigger-key",
  "activate-after-dismiss-lets-a-command-open-the-next-overlay-only-once-exit-completes",
] as const;
