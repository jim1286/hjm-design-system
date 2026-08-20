import { sheetBehaviorDefaults } from "./sheet.js";
import { loadMoreBehaviorDefaults } from "./load-more.js";
import { toastBehaviorDefaults } from "./toast.js";
import { bottomNavigationBehaviorDefaults } from "./bottom-navigation.js";
import { tooltipBehaviorDefaults } from "./tooltip.js";
/*
  Batch 2 저작 모듈의 행동 계약. 각 컴포넌트가 자기 모듈에 spec을 두고 레지스트리는
  경로만 모은다 — 여러 저작자가 병렬로 이 파일을 고치면 서로의 변경을 덮어쓴다
  (`docs/authoring-brief.md`).
*/
import { breadcrumbBehaviorSpec } from "./breadcrumb.js";
import { calendarBehavior } from "./calendar.js";
import { carouselBehavior } from "./carousel.js";
import { commandPaletteBehaviorScenarios } from "./command-palette.js";
import { floatingActionButtonBehaviorScenarios } from "./floating-action-button.js";
import { tourBehaviorScenarios } from "./tour.js";
import { dataTableBehavior } from "./data-table.js";
import { layoutBehavior } from "./layout.js";
import { otpFieldBehavior } from "./otp-field.js";
import { passwordFieldBehavior } from "./password-field.js";
import { splitterBehavior } from "./splitter.js";
import { datePickerBehavior } from "./date-picker.js";
import { sidePanelBehavior } from "./side-panel.js";
import { filePickerBehavior } from "./file-picker.js";
import { paginationBehaviorScenarios } from "./pagination.js";
import { popoverBehaviorDefaults, popoverBehaviorScenarios } from "./popover.js";
import { treeBehavior } from "./tree.js";
import { uploadItemBehavior } from "./upload-item.js";
import { formBehaviorSpec } from "./form.js";
import { numberFieldBehavior } from "./number-field.js";
import { sliderBehavior } from "./slider.js";
import type { DesignSystemDirection } from "./design-system-provider.js";

/** Platform-neutral behavior vocabulary shared by renderer acceptance tests. */
export type InteractionState =
  | "idle"
  | "hover"
  | "focusVisible"
  | "pressed"
  | "dragged";
export type AvailabilityState = "enabled" | "disabled" | "readOnly" | "busy";
export type ValueState =
  | "empty"
  | "filled"
  | "checked"
  | "mixed"
  | "selected"
  | "open"
  | "expanded";
export type ValidationState = "valid" | "invalid";
export type ContentState =
  | "idle"
  | "loading"
  | "loadingMore"
  | "empty"
  | "error"
  | "complete";
export type TabsActivationMode = "automatic" | "manual";
export type TabsMountPolicy = "active" | "visited" | "always";
export type TabsPanelMode = "keyed" | "dynamic";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsDirection = DesignSystemDirection;

export type SelectionOrientation = "horizontal" | "vertical";
export type SelectionDirection = DesignSystemDirection;
export type CheckboxState = boolean | "mixed";
export type MixedCheckboxActivation = "check" | "uncheck";

/** Stable option anatomy shared by CheckboxGroup and RadioGroup renderers. */
export type SelectionItemDescriptor<Key extends string = string> = Readonly<{
  id: Key;
  label: string;
  description?: string;
  disabled?: boolean;
}>;

/** A group needs either visible copy or an explicit accessible name. */
export type SelectionGroupLabel =
  | Readonly<{ label: string; accessibilityLabel?: string }>
  | Readonly<{ label?: never; accessibilityLabel: string }>;

export type ControlledCheckboxState = Readonly<{
  checked: CheckboxState;
  defaultChecked?: never;
  onCheckedChange(checked: boolean): void;
}>;
export type UncontrolledCheckboxState = Readonly<{
  checked?: never;
  defaultChecked?: CheckboxState;
  onCheckedChange?: (checked: boolean) => void;
}>;
export type CheckboxSelection = ControlledCheckboxState | UncontrolledCheckboxState;

export type ControlledCheckboxGroupSelection<Key extends string = string> = Readonly<{
  value: ReadonlySet<Key>;
  defaultValue?: never;
  onValueChange(value: ReadonlySet<Key>): void;
}>;
export type UncontrolledCheckboxGroupSelection<Key extends string = string> = Readonly<{
  value?: never;
  defaultValue?: ReadonlySet<Key>;
  onValueChange?: (value: ReadonlySet<Key>) => void;
}>;
export type CheckboxGroupSelection<Key extends string = string> =
  | ControlledCheckboxGroupSelection<Key>
  | UncontrolledCheckboxGroupSelection<Key>;

export type ControlledRadioGroupSelection<Key extends string = string> = Readonly<{
  value: Key | null;
  defaultValue?: never;
  onValueChange(value: Key): void;
}>;
export type UncontrolledRadioGroupSelection<Key extends string = string> = Readonly<{
  value?: never;
  defaultValue?: Key | null;
  onValueChange?: (value: Key) => void;
}>;
export type RadioGroupSelection<Key extends string = string> =
  | ControlledRadioGroupSelection<Key>
  | UncontrolledRadioGroupSelection<Key>;

export type SelectionNavigationIntent = "next" | "previous" | "first" | "last";

/** Resolves a renderer's required name while rejecting type-valid blank copy. */
export function resolveControlAccessibleName(
  label: string | undefined,
  accessibilityLabel: string | undefined,
  controlName = "Control",
): string {
  if (label !== undefined && (typeof label !== "string" || !label.trim())) {
    throw new TypeError(`${controlName} label must not be empty`);
  }
  if (
    accessibilityLabel !== undefined &&
    (typeof accessibilityLabel !== "string" || !accessibilityLabel.trim())
  ) {
    throw new TypeError(`${controlName} accessibilityLabel must not be empty`);
  }
  const resolved = accessibilityLabel?.trim() || label?.trim();
  if (!resolved) {
    throw new TypeError(`${controlName} needs an accessible name`);
  }
  return resolved;
}

export const selectionGroupBehaviorDefaults = {
  orientation: "vertical",
  direction: "ltr",
} as const satisfies Readonly<{
  orientation: SelectionOrientation;
  direction: SelectionDirection;
}>;

export const radioGroupBehaviorDefaults = {
  ...selectionGroupBehaviorDefaults,
  loop: true,
} as const satisfies Readonly<{
  orientation: SelectionOrientation;
  direction: SelectionDirection;
  loop: boolean;
}>;

export const checkboxBehaviorDefaults = {
  mixedActivation: "check",
} as const satisfies Readonly<{ mixedActivation: MixedCheckboxActivation }>;

export const selectBehaviorDefaults = {
  disallowEmptySelection: false,
  loop: false,
} as const satisfies Readonly<{
  disallowEmptySelection: boolean;
  loop: boolean;
}>;

export const comboboxBehaviorDefaults = {
  filtering: "local",
  loop: false,
} as const satisfies Readonly<{
  filtering: ComboboxFiltering;
  loop: boolean;
}>;

/** Throws before a renderer can expose ambiguous or unreachable selection state. */
export function validateSelectionItems<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
): void {
  const ids = new Set<Key>();
  for (const item of items) {
    if (typeof item.id !== "string" || item.id.trim().length === 0) {
      throw new TypeError("Selection item id must not be empty");
    }
    if (typeof item.label !== "string" || item.label.trim().length === 0) {
      throw new TypeError(`Selection item ${item.id} label must not be empty`);
    }
    if (
      item.description !== undefined &&
      (typeof item.description !== "string" ||
        item.description.trim().length === 0)
    ) {
      throw new TypeError(
        `Selection item ${item.id} description must not be empty when provided`,
      );
    }
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate selection item id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

export function getCheckboxNextState(
  current: CheckboxState,
  mixedActivation: MixedCheckboxActivation = checkboxBehaviorDefaults.mixedActivation,
): boolean {
  return current === "mixed" ? mixedActivation === "check" : !current;
}

export function toggleCheckboxSelection<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  current: ReadonlySet<Key>,
  id: Key,
): ReadonlySet<Key> {
  validateSelectionItems(items);
  const knownIds = new Set(items.map((item) => item.id));
  for (const selectedId of current) {
    if (!knownIds.has(selectedId)) {
      throw new RangeError(`Selected checkbox must exist: ${selectedId}`);
    }
  }
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new RangeError(`Checkbox must exist: ${id}`);

  const next = new Set(current);
  if (item.disabled) return next;
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function validateCheckboxSelection<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  current: ReadonlySet<Key>,
): void {
  validateSelectionItems(items);
  const knownIds = new Set(items.map((item) => item.id));
  for (const selectedId of current) {
    if (!knownIds.has(selectedId)) {
      throw new RangeError(`Selected checkbox must exist: ${selectedId}`);
    }
  }
}

/** Drops removed collection keys while retaining selected disabled items. */
export function reconcileCheckboxSelection<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  current: ReadonlySet<Key>,
): ReadonlySet<Key> {
  validateSelectionItems(items);
  const knownIds = new Set(items.map((item) => item.id));
  const reconciled = [...current].filter((id) => knownIds.has(id));
  return reconciled.length === current.size ? current : new Set(reconciled);
}

export function resolveInitialRadioValue<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  requestedValue: Key | null | undefined,
  required = false,
): Key | null {
  validateSelectionItems(items);
  if (requestedValue != null) {
    if (!items.some((item) => item.id === requestedValue)) {
      throw new RangeError(`Selected radio must exist: ${requestedValue}`);
    }
    return requestedValue;
  }
  return required ? (items.find((item) => !item.disabled)?.id ?? null) : null;
}

export function validateRadioSelection<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  current: Key | null,
): void {
  validateSelectionItems(items);
  if (current != null && !items.some((item) => item.id === current)) {
    throw new RangeError(`Selected radio must exist: ${current}`);
  }
}

/** Returns the only enabled radio that may enter the Web tab order. */
export function resolveRadioTabStop<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  selectedValue: Key | null,
): Key | undefined {
  validateSelectionItems(items);
  const selected = items.find((item) => item.id === selectedValue);
  if (selected && !selected.disabled) return selected.id;
  return items.find((item) => !item.disabled)?.id;
}

/** Reconciles an uncontrolled radio when its selected item leaves the collection. */
export function reconcileRadioSelection<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  current: Key | null,
  required = false,
): Key | null {
  validateSelectionItems(items);
  if (current != null && items.some((item) => item.id === current)) return current;
  return required ? (items.find((item) => !item.disabled)?.id ?? null) : null;
}

export function getSelectionNavigationIntent(
  key: WebKeyboardKey,
  orientation: SelectionOrientation,
  direction: SelectionDirection,
): SelectionNavigationIntent | undefined {
  if (key === "Home") return "first";
  if (key === "End") return "last";
  if (orientation === "vertical") {
    if (key === "ArrowDown") return "next";
    if (key === "ArrowUp") return "previous";
    return undefined;
  }
  if (key === "ArrowRight") return direction === "rtl" ? "previous" : "next";
  if (key === "ArrowLeft") return direction === "rtl" ? "next" : "previous";
  return undefined;
}

export function getRadioNavigationTarget<Key extends string>(
  items: readonly SelectionItemDescriptor<Key>[],
  currentId: Key | null | undefined,
  intent: SelectionNavigationIntent,
  loop = true,
): Key | undefined {
  validateSelectionItems(items);
  const enabled = items.filter((item) => !item.disabled);
  if (enabled.length === 0) return undefined;
  if (intent === "first") return enabled[0]?.id;
  if (intent === "last") return enabled.at(-1)?.id;
  const currentIndex = enabled.findIndex((item) => item.id === currentId);
  if (currentIndex < 0) return enabled[0]?.id;
  const delta = intent === "next" ? 1 : -1;
  const nextIndex = currentIndex + delta;
  if (!loop && (nextIndex < 0 || nextIndex >= enabled.length)) return currentId ?? enabled[0]?.id;
  return enabled[(nextIndex + enabled.length) % enabled.length]?.id;
}

/** Platform-neutral item anatomy shared by Web and native Tabs renderers. */
export type TabDescriptor<Key extends string = string> = Readonly<{
  id: Key;
  label: string;
  disabled?: boolean;
}>;
export type ControlledTabsSelection<Key extends string = string> = Readonly<{
  value: Key;
  defaultValue?: never;
  onValueChange(value: Key): void;
}>;
export type UncontrolledTabsSelection<Key extends string = string> = Readonly<{
  value?: never;
  defaultValue?: Key;
  onValueChange?: (value: Key) => void;
}>;
export type TabsSelection<Key extends string = string> =
  | ControlledTabsSelection<Key>
  | UncontrolledTabsSelection<Key>;
export type TabNavigationIntent = "next" | "previous" | "first" | "last";

export function getTabNavigationIntent(
  key: WebKeyboardKey,
  orientation: TabsOrientation,
  direction: TabsDirection,
): TabNavigationIntent | undefined {
  if (key === "Home") return "first";
  if (key === "End") return "last";
  if (orientation === "vertical") {
    if (key === "ArrowDown") return "next";
    if (key === "ArrowUp") return "previous";
    return undefined;
  }
  if (key === "ArrowRight") return direction === "rtl" ? "previous" : "next";
  if (key === "ArrowLeft") return direction === "rtl" ? "next" : "previous";
  return undefined;
}

/** Validates collection identity and resolves the only safe initial selection. */
export function resolveInitialTabValue<Key extends string>(
  items: readonly TabDescriptor<Key>[],
  requestedValue?: Key,
): Key | undefined {
  const ids = new Set<Key>();
  for (const item of items) {
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate tab id: ${item.id}`);
    }
    ids.add(item.id);
  }
  if (requestedValue !== undefined) {
    const requested = items.find((item) => item.id === requestedValue);
    if (!requested || requested.disabled) {
      throw new RangeError(`Selected tab must exist and be enabled: ${requestedValue}`);
    }
    return requestedValue;
  }
  return items.find((item) => !item.disabled)?.id;
}

/** Shared roving-focus math; renderers still own DOM/native focus APIs. */
export function getTabNavigationTarget<Key extends string>(
  items: readonly TabDescriptor<Key>[],
  currentId: Key,
  intent: TabNavigationIntent,
  loop = true,
): Key | undefined {
  const enabled = items.filter((item) => !item.disabled);
  if (enabled.length === 0) return undefined;
  if (intent === "first") return enabled[0]?.id;
  if (intent === "last") return enabled.at(-1)?.id;
  const currentIndex = enabled.findIndex((item) => item.id === currentId);
  if (currentIndex < 0) return enabled[0]?.id;
  const delta = intent === "next" ? 1 : -1;
  const nextIndex = currentIndex + delta;
  if (!loop && (nextIndex < 0 || nextIndex >= enabled.length)) return currentId;
  return enabled[(nextIndex + enabled.length) % enabled.length]?.id;
}

export type BehaviorStateAxis =
  | "interaction"
  | "availability"
  | "value"
  | "validation"
  | "content";

export type WebKeyboardKey =
  | "Tab"
  | "Enter"
  | "Space"
  | "Escape"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"
  | "F8"
  | "Typeahead";

export type NativeAccessibilityState =
  | "disabled"
  | "selected"
  | "checked"
  | "busy"
  | "expanded";

export type BehaviorContract = Readonly<{
  /** Controlled/uncontrolled state triplets only. */
  controlled: readonly string[];
  /** Read-only inputs which do not form a controlled state axis. */
  inputs?: readonly string[];
  /** Emitted events which do not themselves own state. */
  events?: readonly string[];
  configuration?: Readonly<Record<string, readonly string[]>>;
  defaults?: Readonly<Record<string, string | number | boolean>>;
  stateAxes: Readonly<Partial<Record<BehaviorStateAxis, readonly string[]>>>;
  web: Readonly<{
    roles: readonly string[];
    keyboard: readonly WebKeyboardKey[];
    focus:
      | "native"
      | "roving"
      | "activeDescendant"
      | "trap"
      | "restore"
      | "none";
    dismiss?: readonly (
      | "escape"
      | "outside"
      | "selection"
      | "blur"
      | "timeout"
      | "action"
      | "close-action"
      | "swipe"
      | "programmatic"
    )[];
  }>;
  native: Readonly<{
    roles: readonly string[];
    states: readonly NativeAccessibilityState[];
    actions: readonly string[];
    dismiss?: readonly (
      | "back"
      | "swipe"
      | "outside"
      | "selection"
      | "timeout"
      | "action"
      | "close-action"
      | "programmatic"
    )[];
  }>;
  scenarios: readonly string[];
}>;

/** Safe behavior defaults: automatic activation is opt-in for instant panels. */
export const tabsBehaviorDefaults = {
  activationMode: "manual",
  mountPolicy: "active",
  panelMode: "keyed",
  orientation: "horizontal",
  direction: "ltr",
  loop: true,
} as const satisfies Readonly<{
  activationMode: TabsActivationMode;
  mountPolicy: TabsMountPolicy;
  panelMode: TabsPanelMode;
  orientation: TabsOrientation;
  direction: TabsDirection;
  loop: boolean;
}>;

/**
 * Behavior is data, not a React implementation. Web/RN renderers can use any
 * suitable primitive while running the same scenarios and exposing the same
 * controlled state names.
 */
export const behaviorRegistry = {
  link: {
    controlled: [],
    inputs: ["destination", "label"],
    stateAxes: {
      interaction: ["idle", "hover", "focusVisible", "pressed"],
    },
    web: {
      roles: ["link"],
      keyboard: ["Tab", "Enter"],
      focus: "native",
    },
    native: {
      roles: ["link"],
      states: [],
      actions: ["activate"],
    },
    scenarios: [
      "href-is-the-destination-source-of-truth",
      "web-renders-a-real-anchor-and-preserves-modifier-context-navigation",
      "native-internal-destination-uses-router-link-semantics",
      "native-external-destination-uses-platform-linking-and-reports-failure",
      "link-never-exposes-disabled-action-or-visited-application-state",
      "download-remains-a-separate-platform-workflow",
      "visible-label-owns-one-accessible-name",
      "leading-and-trailing-icons-are-decorative-semantic-icons",
      "logical-icon-direction-follows-rtl",
      "inline-link-has-a-persistent-non-color-cue",
      "standalone-link-target-is-at-least-forty-four-units",
      "destination-link-never-contains-another-interactive-descendant",
    ],
  },
  field: {
    controlled: ["value", "defaultValue", "onValueChange"],
    stateAxes: {
      availability: ["enabled", "disabled", "readOnly"],
      validation: ["valid", "invalid"],
      content: ["idle", "loading", "error"],
    },
    web: { roles: ["textbox"], keyboard: ["Tab"], focus: "native" },
    native: { roles: ["text"], states: ["disabled"], actions: ["focus", "setText"] },
    scenarios: ["label-description-error-linkage", "invalid-plus-focus", "disabled-suppresses-edit"],
  },
  searchField: {
    controlled: ["value", "defaultValue", "onValueChange", "onClear"],
    stateAxes: {
      availability: ["enabled", "disabled", "busy"],
      value: ["empty", "filled"],
      validation: ["valid", "invalid"],
      content: ["idle", "loading", "error"],
    },
    web: { roles: ["searchbox", "button"], keyboard: ["Tab", "Enter"], focus: "native" },
    native: { roles: ["text", "button"], states: ["disabled", "busy"], actions: ["focus", "setText", "clear"] },
    scenarios: ["clear-has-name", "empty-hides-clear", "invalid-plus-focus", "busy-preserves-query"],
  },
  checkbox: {
    controlled: ["checked", "defaultChecked", "onCheckedChange"],
    configuration: { mixedActivation: ["check", "uncheck"] },
    defaults: checkboxBehaviorDefaults,
    stateAxes: {
      availability: ["enabled", "disabled", "readOnly"],
      value: ["checked", "mixed"],
      validation: ["valid", "invalid"],
    },
    web: { roles: ["checkbox"], keyboard: ["Tab", "Space"], focus: "native" },
    native: {
      roles: ["checkbox"],
      states: ["disabled", "checked"],
      actions: ["activate"],
    },
    scenarios: [
      "visible-label-is-accessible-name",
      "mixed-is-announced-and-activates-to-default",
      "disabled-and-read-only-suppress-change",
      "controlled-value-never-mutates-internally",
      "required-and-invalid-support-are-linked",
    ],
  },
  checkboxGroup: {
    controlled: ["value", "defaultValue", "onValueChange"],
    configuration: {
      orientation: ["horizontal", "vertical"],
      direction: ["ltr", "rtl"],
    },
    defaults: selectionGroupBehaviorDefaults,
    stateAxes: {
      availability: ["enabled", "disabled", "readOnly"],
      value: ["checked"],
      validation: ["valid", "invalid"],
    },
    web: {
      roles: ["group", "checkbox"],
      keyboard: ["Tab", "Space"],
      focus: "native",
    },
    native: {
      roles: ["checkbox"],
      states: ["disabled", "checked"],
      actions: ["activate"],
    },
    scenarios: [
      "each-enabled-checkbox-is-a-tab-stop",
      "space-toggles-only-focused-checkbox",
      "group-label-description-and-error-are-linked",
      "disabled-selected-item-is-retained-but-not-activated",
      "change-emits-a-fresh-set",
      "duplicate-and-unknown-ids-are-rejected",
      "uncontrolled-selection-reconciles-collection-mutation",
      "required-and-invalid-are-announced",
      "no-nested-interactive-descendants",
    ],
  },
  radioGroup: {
    controlled: ["value", "defaultValue", "onValueChange"],
    configuration: {
      orientation: ["horizontal", "vertical"],
      direction: ["ltr", "rtl"],
      loop: ["true", "false"],
    },
    defaults: radioGroupBehaviorDefaults,
    stateAxes: {
      availability: ["enabled", "disabled", "readOnly"],
      value: ["checked", "selected"],
      validation: ["valid", "invalid"],
    },
    web: {
      roles: ["radiogroup", "radio"],
      keyboard: [
        "Tab",
        "Space",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ],
      focus: "roving",
    },
    native: {
      roles: ["radio"],
      states: ["disabled", "checked"],
      actions: ["activate"],
    },
    scenarios: [
      "at-most-one-selection-and-nullable-initial-value",
      "checked-or-first-enabled-is-the-only-tab-stop",
      "arrow-focuses-and-selects-while-skipping-disabled",
      "orientation-direction-and-loop-control-navigation",
      "space-selects-focused-radio",
      "group-label-description-and-error-are-linked",
      "disabled-selected-item-is-retained-with-enabled-tab-stop",
      "required-invalid-and-read-only-are-announced",
      "controlled-value-never-mutates-internally",
      "duplicate-and-unknown-ids-are-rejected",
    ],
  },
  switch: {
    controlled: ["checked", "defaultChecked", "onCheckedChange"],
    stateAxes: { availability: ["enabled", "disabled"], value: ["checked"] },
    web: { roles: ["switch"], keyboard: ["Tab", "Space"], focus: "native" },
    native: { roles: ["switch"], states: ["disabled", "checked"], actions: ["activate"] },
    scenarios: ["row-and-control-are-one-target", "checked-announced", "disabled-suppresses-change"],
  },
  segmentedControl: {
    controlled: ["value", "defaultValue", "onValueChange"],
    stateAxes: { availability: ["enabled", "disabled"], value: ["selected"] },
    web: { roles: ["radiogroup", "radio"], keyboard: ["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"], focus: "roving" },
    native: { roles: ["radio"], states: ["disabled", "checked"], actions: ["activate"] },
    scenarios: ["exactly-one-selected", "one-tab-stop", "arrow-selection", "selected-plus-focus"],
  },
  chip: {
    controlled: ["selected", "onPress"],
    stateAxes: {
      availability: ["enabled", "disabled"],
      value: ["selected"],
    },
    web: {
      roles: ["button", "radio", "checkbox"],
      keyboard: ["Tab", "Enter", "Space"],
      focus: "native",
    },
    native: {
      roles: ["button", "radio", "checkbox"],
      states: ["disabled", "checked"],
      actions: ["activate"],
    },
    scenarios: [
      "action-never-exposes-selection",
      "single-selection-uses-radio-checked",
      "multiple-selection-uses-checkbox-checked",
      "selected-plus-focus",
      "selection-indicator-is-not-color-only",
      "single-mode-composes-radio-group-behavior",
      "multiple-mode-composes-checkbox-group-behavior",
    ],
  },
  tabs: {
    controlled: ["value", "defaultValue", "onValueChange"],
    configuration: {
      activationMode: ["automatic", "manual"],
      mountPolicy: ["active", "visited", "always"],
      panelMode: ["keyed", "dynamic"],
      orientation: ["horizontal", "vertical"],
      direction: ["ltr", "rtl"],
      loop: ["true", "false"],
    },
    defaults: tabsBehaviorDefaults,
    stateAxes: { availability: ["enabled", "disabled"], value: ["selected"] },
    web: { roles: ["tablist", "tab", "tabpanel"], keyboard: ["Tab", "Enter", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"], focus: "roving" },
    native: { roles: ["tab"], states: ["disabled", "selected"], actions: ["activate"] },
    scenarios: [
      "tab-controls-panel",
      "one-tab-stop",
      "disabled-tab-skipped",
      "selected-plus-focus",
      "automatic-activation-only-for-instant-panels",
      "manual-activation-keeps-focus-and-selection-distinct",
      "active-mount-removes-inactive-panel",
      "always-mount-makes-inactive-panels-inert",
      "visited-mount-preserves-visited-panel-state",
      "horizontal-arrows-do-not-consume-up-down",
      "vertical-arrows-and-aria-orientation",
      "web-tablist-has-accessible-name",
      "every-tab-controls-an-existing-panel",
      "active-panel-labelled-by-selected-tab",
      "manual-focus-does-not-relabel-dynamic-panel",
      "dynamic-panel-preserves-host-instance",
      "dynamic-panel-requires-active-mount",
      "panel-enters-tab-order-when-content-has-no-focus-target",
      "rtl-navigation-follows-logical-direction",
      "first-enabled-tab-is-uncontrolled-default",
      "duplicate-and-disabled-selection-are-rejected",
      "controlled-selection-never-mutates-internally",
      "native-focus-does-not-select-without-activate",
      "inactive-mounted-panels-are-hidden-and-inert",
      "uncontrolled-selection-reconciles-collection-mutation",
    ],
  },
  bottomNavigation: {
    controlled: [],
    inputs: ["items", "selectedKey", "accessibilityLabel"],
    events: ["onActivate", "onLongPress"],
    configuration: {
      direction: ["ltr", "rtl"],
      keyboardBehavior: ["hide", "remain"],
    },
    defaults: bottomNavigationBehaviorDefaults,
    stateAxes: {
      interaction: ["idle", "hover", "focusVisible", "pressed"],
      availability: ["enabled", "disabled"],
      value: ["selected"],
    },
    web: {
      roles: ["navigation", "list", "link"],
      keyboard: ["Tab", "Enter"],
      focus: "native",
    },
    native: {
      roles: ["tab", "button"],
      states: ["disabled", "selected"],
      actions: ["activate", "longpress"],
    },
    scenarios: [
      "two-to-five-stable-top-level-destinations",
      "router-selected-key-is-read-only-input",
      "activation-does-not-select-before-router-commit",
      "prevented-or-failed-navigation-keeps-current-selection",
      "reselect-is-distinct-from-navigation",
      "navigator-preserves-each-destination-state",
      "disabled-destination-suppresses-activation",
      "visible-label-always-names-a-decorative-icon",
      "selected-state-uses-icon-emphasis-and-label-weight-not-color-alone",
      "selected-content-and-focus-indicator-remain-simultaneously-visible",
      "centered-sibling-action-is-excluded-from-destination-collection",
      "badge-zero-is-hidden-and-visible-count-is-bounded",
      "badge-subtree-is-hidden-and-item-uses-one-resolved-accessibility-name",
      "badge-update-does-not-change-focus-selection-or-live-announce",
      "web-uses-a-labelled-navigation-landmark-and-real-links",
      "web-current-link-uses-aria-current-page",
      "web-preserves-modifier-click-and-does-not-use-tab-roles-or-roving-focus",
      "native-emits-tab-press-and-respects-default-prevented-before-navigation",
      "native-forwards-tab-long-press",
      "native-ios-may-use-button-plus-selected-when-tab-role-is-not-reliably-supported",
      "safe-area-padding-is-additive",
      "software-keyboard-hides-instead-of-lifting-the-navigation",
      "two-hundred-percent-text-wraps-without-fixed-item-height",
      "rtl-order-and-badge-anchor-follow-logical-direction",
      "targets-are-at-least-forty-four-units",
      "reduced-motion-removes-transform-without-changing-state",
    ],
  },
  disclosureGroup: {
    controlled: ["expandedKeys", "defaultExpandedKeys", "onExpandedChange"],
    stateAxes: { availability: ["enabled", "disabled"], value: ["expanded"] },
    web: { roles: ["heading", "button", "region"], keyboard: ["Tab", "Enter", "Space", "ArrowUp", "ArrowDown", "Home", "End"], focus: "native" },
    native: { roles: ["button"], states: ["disabled", "expanded"], actions: ["activate"] },
    scenarios: [
      "single-and-multiple-invariants",
      "each-enabled-trigger-is-a-tab-stop",
      "toggle-keeps-trigger-focus",
      "panel-removed-when-collapsed",
      "disabled-trigger-suppresses-change",
      "reduced-motion",
    ],
  },
  menu: {
    controlled: [
      "open",
      "defaultOpen",
      "onOpenChange",
      "onAction",
      "onActionAfterDismiss",
      "selection",
      "asyncState",
    ],
    stateAxes: { availability: ["enabled", "disabled"], value: ["open", "selected"], content: ["idle", "loading", "loadingMore", "empty", "error"] },
    web: { roles: ["menu", "menuitem", "menuitemradio", "menuitemcheckbox"], keyboard: ["Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "Home", "End", "Typeahead"], focus: "restore", dismiss: ["escape", "outside", "selection"] },
    native: { roles: ["menu", "menuitem"], states: ["disabled", "selected", "checked"], actions: ["activate"], dismiss: ["back", "outside", "selection"] },
    scenarios: [
      "action-and-single-close-after-selection",
      "on-action-does-not-depend-on-controlled-close",
      "after-dismiss-action-sequences-next-surface",
      "multiple-selection-keeps-menu-open",
      "disabled-item-skipped",
      "escape-or-back-restores-trigger",
      "danger-item-not-color-only",
      "loading-more-preserves-items-and-selection",
    ],
  },
  dialog: {
    controlled: ["open", "defaultOpen", "onOpenChange"],
    stateAxes: { availability: ["enabled", "busy"], value: ["open"] },
    web: { roles: ["dialog"], keyboard: ["Tab", "Escape"], focus: "trap", dismiss: ["escape", "outside"] },
    native: { roles: ["dialog"], states: ["busy"], actions: ["dismiss"], dismiss: ["back", "outside"] },
    scenarios: ["title-description-linkage", "focus-trap-and-restore", "modal-isolation", "single-dismiss-callback"],
  },
  alertDialog: {
    controlled: ["open", "defaultOpen", "onOpenChange"],
    stateAxes: { availability: ["enabled", "busy"], value: ["open"], content: ["idle", "loading", "error"] },
    web: { roles: ["alertdialog"], keyboard: ["Tab", "Escape"], focus: "trap", dismiss: ["escape"] },
    native: { roles: ["alertdialog"], states: ["busy"], actions: ["confirm", "cancel"], dismiss: ["back"] },
    scenarios: [
      "visible-title-and-description-are-announced",
      "modal-isolation-and-tab-trap",
      "confirm-mode-cancel-is-initial-focus",
      "alert-mode-confirm-is-initial-focus",
      "outside-attempt-is-ignored-without-callback",
      "escape-or-back-cancels-when-idle",
      "busy-blocks-every-dismiss-and-duplicate-confirm",
      "confirm-action-runs-once",
      "error-is-announced-and-dialog-stays-open",
      "controlled-close-settles-programmatic-cancel",
      "unmount-settles-interrupted",
      "result-settles-once-after-exit",
      "focus-restores-after-every-close-path",
      "reduced-motion-still-completes-exit",
    ],
  },
  sheet: {
    controlled: ["open", "defaultOpen", "onOpenChange", "dismissPolicy"],
    defaults: sheetBehaviorDefaults,
    stateAxes: { availability: ["enabled", "busy"], value: ["open"] },
    web: { roles: ["dialog"], keyboard: ["Tab", "Escape"], focus: "trap", dismiss: ["escape", "outside"] },
    native: { roles: ["dialog"], states: ["busy"], actions: ["dismiss"], dismiss: ["back", "outside"] },
    scenarios: [
      "focus-or-modal-isolation",
      "scroll-lock",
      "safe-area",
      "single-dismiss-callback",
      "busy-blocks-dismiss",
      "dismiss-reason-is-reported",
      "programmatic-owner-close-is-always-allowed",
      "swipe-requires-enabled-policy-and-gesture-capability",
      "successor-surface-opens-after-exit",
      "nested-modal-surfaces-are-forbidden",
      "reduced-motion-still-completes-dismiss",
    ],
  },
  select: {
    controlled: [
      "selectedKey",
      "defaultSelectedKey",
      "onSelectionChange",
      "open",
      "defaultOpen",
      "onOpenChange",
    ],
    inputs: ["asyncState", "selectedItem"],
    configuration: {
      disallowEmptySelection: ["true", "false"],
      loop: ["true", "false"],
    },
    defaults: selectBehaviorDefaults,
    stateAxes: {
      availability: ["enabled", "disabled", "readOnly", "busy"],
      value: ["empty", "selected", "open"],
      validation: ["valid", "invalid"],
      content: ["idle", "loading", "loadingMore", "empty", "error"],
    },
    web: {
      roles: ["combobox", "listbox", "option"],
      keyboard: [
        "Tab",
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Typeahead",
      ],
      focus: "activeDescendant",
      dismiss: ["selection", "escape", "outside", "blur"],
    },
    native: {
      roles: ["button", "dialog", "radio"],
      states: ["disabled", "checked", "busy", "expanded"],
      actions: ["activate", "dismiss"],
      dismiss: ["selection", "back", "outside"],
    },
    scenarios: [
      "visible-label-or-accessibility-label-names-trigger",
      "collection-ids-and-text-values-are-validated",
      "highlighted-option-is-distinct-from-committed-selection",
      "trigger-controls-the-mounted-listbox",
      "active-descendant-references-a-mounted-option",
      "active-option-scrolls-into-view",
      "disabled-options-are-skipped",
      "escape-closes-without-commit",
      "selection-requests-close-and-restores-trigger-focus",
      "controlled-owner-may-defer-a-selection-close-request",
      "removed-selection-is-reconciled",
      "loading-more-preserves-options-and-selection",
      "transient-async-pages-preserve-committed-key-and-copy",
      "empty-error-and-loading-are-announced",
      "options-have-no-nested-interactive-descendants",
    ],
  },
  combobox: {
    controlled: [
      "selectedKey",
      "defaultSelectedKey",
      "onSelectionChange",
      "inputValue",
      "defaultInputValue",
      "onInputValueChange",
      "open",
      "defaultOpen",
      "onOpenChange",
    ],
    inputs: ["asyncState", "queryValue", "resultQuery", "selectedItem"],
    events: ["onCommit"],
    configuration: {
      filtering: ["local", "external"],
      loop: ["true", "false"],
    },
    defaults: comboboxBehaviorDefaults,
    stateAxes: {
      availability: ["enabled", "disabled", "readOnly", "busy"],
      value: ["empty", "filled", "selected", "open"],
      validation: ["valid", "invalid"],
      content: ["idle", "loading", "loadingMore", "empty", "error"],
    },
    web: {
      roles: ["combobox", "listbox", "option"],
      keyboard: [
        "Tab",
        "Enter",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ],
      focus: "activeDescendant",
      dismiss: ["selection", "escape", "outside", "blur"],
    },
    native: {
      roles: ["button", "text", "dialog", "radio"],
      states: ["disabled", "checked", "busy", "expanded"],
      actions: ["focus", "setText", "activate", "dismiss"],
      dismiss: ["selection", "back", "outside"],
    },
    scenarios: [
      "selected-key-and-input-value-are-independent",
      "input-focus-and-active-option-are-distinct",
      "input-controls-the-mounted-listbox",
      "active-descendant-references-a-mounted-option",
      "active-option-scrolls-into-view",
      "ime-composition-does-not-prematurely-filter-or-commit",
      "escape-restores-the-committed-label",
      "query-edit-never-commits-a-stale-selection",
      "external-results-do-not-implicitly-commit",
      "committed-item-survives-transient-result-pages",
      "stale-external-results-do-not-replace-current-query",
      "loading-more-preserves-options-and-active-descendant",
      "empty-error-and-loading-are-announced",
      "custom-values-are-rejected-without-an-explicit-policy",
      "selection-state-updates-before-commit-event-and-close-request",
      "options-have-no-nested-interactive-descendants",
    ],
  },
  toast: {
    controlled: [],
    inputs: ["descriptor", "queueSnapshot", "visibleSnapshot"],
    events: ["onAction", "onDismiss"],
    configuration: {
      priority: ["normal", "high"],
      duplicatePolicy: ["update", "ignore"],
      timerUpdatePolicy: ["preserve", "restart"],
      overflowPolicy: ["discard-oldest", "discard-newest"],
    },
    defaults: toastBehaviorDefaults,
    stateAxes: {
      value: ["open"],
      content: ["idle"],
    },
    web: {
      roles: ["region", "status", "alert", "button"],
      keyboard: ["Tab", "Enter", "Space", "Escape", "F8"],
      focus: "native",
      dismiss: ["timeout", "action", "close-action", "escape", "swipe", "programmatic"],
    },
    native: {
      roles: ["alert", "button"],
      states: [],
      actions: ["announce", "activate", "dismiss"],
      dismiss: ["timeout", "action", "close-action", "swipe", "programmatic"],
    },
    scenarios: [
      "stable-id-duplicate-updates-in-place-without-reordering",
      "bounded-queue-promotes-items-in-fifo-order",
      "queued-time-never-consumes-auto-dismiss-duration",
      "visible-timer-pauses-for-pointer-focus-window-and-gesture",
      "actionable-toast-is-persistent-unless-duration-is-explicit",
      "auto-dismiss-duration-is-never-shorter-than-five-seconds",
      "action-and-dismiss-callbacks-run-exactly-once",
      "programmatic-close-reports-its-own-dismiss-reason",
      "normal-and-high-announcements-use-the-visible-copy-or-explicit-override",
      "tone-is-always-paired-with-a-non-color-mark",
      "web-hotkey-focuses-the-labelled-viewport-and-last-close-restores-focus",
      "exit-completes-once-with-and-without-reduced-motion",
      "provider-teardown-interrupts-every-session-without-leaking-a-timer",
    ],
  },
  loadMore: {
    controlled: [],
    inputs: ["state", "labels"],
    events: ["onLoadMore"],
    configuration: { mode: ["automatic", "manual"] },
    defaults: loadMoreBehaviorDefaults,
    stateAxes: {
      availability: ["enabled", "busy"],
      content: ["idle", "loadingMore", "error", "complete"],
    },
    web: {
      roles: ["status", "alert", "button"],
      keyboard: ["Tab", "Enter", "Space"],
      focus: "native",
    },
    native: {
      roles: ["progressbar", "alert", "button"],
      states: ["busy", "disabled"],
      actions: ["activate"],
    },
    scenarios: [
      "existing-items-remain-mounted-in-every-footer-state",
      "automatic-viewport-request-has-an-accessible-manual-fallback",
      "one-request-is-in-flight-per-controller",
      "same-request-key-is-never-issued-twice-concurrently",
      "loading-and-complete-states-block-new-requests",
      "error-state-retries-only-with-retry-reason",
      "loading-status-and-error-alert-announce-once",
      "retry-and-manual-targets-are-at-least-forty-four-units",
    ],
  },
  tooltip: {
    controlled: ["open", "defaultOpen", "onOpenChange"],
    inputs: ["content"],
    configuration: {
      placement: ["top", "bottom", "start", "end"],
      align: ["start", "center", "end"],
    },
    defaults: tooltipBehaviorDefaults,
    stateAxes: {
      interaction: ["idle", "hover", "focusVisible"],
      value: ["open"],
    },
    web: {
      roles: ["tooltip"],
      keyboard: ["Tab", "Escape"],
      focus: "none",
      dismiss: ["escape", "blur"],
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
      "plain-localized-copy-never-contains-interaction",
      "keyboard-focus-opens-immediately-and-pointer-respects-delay",
      "recent-sibling-tooltip-uses-skip-delay",
      "one-tooltip-is-visible-per-provider",
      "trigger-content-hover-and-pointer-corridor-keep-open",
      "escape-dismisses-and-suppresses-reopen-until-input-reset",
      "blur-or-pointer-leave-closes-only-after-all-active-inputs-end",
      "trigger-activation-closes-without-cancelling-trigger-action",
      "trigger-keeps-focus-and-tooltip-has-no-tab-stop",
      "existing-aria-describedby-is-preserved",
      "touch-pointer-hover-is-ignored",
      "controlled-close-rejection-never-exposes-two-tooltips",
      "timer-and-global-listener-cleanup-on-unmount",
      "reduced-motion-exit-completes-exactly-once",
    ],
  },
  breadcrumb: breadcrumbBehaviorSpec,
  calendar: calendarBehavior,
  carousel: carouselBehavior,
  commandPalette: {
    controlled: [
      "open",
      "defaultOpen",
      "onOpenChange",
      "inputValue",
      "defaultInputValue",
      "onInputValueChange",
    ],
    inputs: ["queryValue", "resultQuery", "asyncState", "accessibilityLabel", "searchPlaceholder"],
    events: ["onActivate", "onActivateAfterDismiss"],
    stateAxes: { value: ["open"], content: ["idle", "loading", "loadingMore", "empty", "error"] },
    // 저작자 명세의 dismiss 사유 "activation"은 채택하지 않았다. 같은 뜻의 "action"이
    // 이미 유니언에 있고(Menu가 onAction으로 쓴다), 공용 어휘에 동의어를 하나 더 두면
    // 렌더러가 둘을 구별해야 하는지 매번 물어야 한다.
    web: { roles: ["dialog", "listbox", "option"], keyboard: ["Tab", "Enter", "Escape", "ArrowUp", "ArrowDown"], focus: "trap", dismiss: ["escape", "outside", "action"] },
    native: { roles: [], states: [], actions: [] },
    scenarios: [...commandPaletteBehaviorScenarios],
  },
  floatingActionButton: {
    controlled: [],
    inputs: ["label", "icon", "layoutMode", "scrollSignal", "safeAreaInset"],
    events: ["onPress"],
    stateAxes: { interaction: ["idle", "hover", "pressed", "focusVisible"] },
    web: { roles: ["button"], keyboard: ["Tab", "Enter", "Space"], focus: "native" },
    native: { roles: ["button"], states: [], actions: ["activate"] },
    scenarios: [...floatingActionButtonBehaviorScenarios],
  },
  // 이 항목은 `transfer-list.ts`에서 import하지 않고 여기에 직접 쓴다. 그 모듈은
  // 이 파일에서 **값**을(getCheckboxNextState 등) 가져오므로, 여기서 되받으면
  // 실제 순환이 닫혀 레지스트리가 undefined를 담는다(타입만 가져오는
  // data-table과 다른 점이다). 두 정의가 어긋나지 않는지는 테스트로 잠근다.
  transferList: {
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
  },
  dataTable: dataTableBehavior,
  tour: {
    controlled: ["open", "defaultOpen", "onOpenChange", "currentStepId", "defaultCurrentStepId", "onStepChange"],
    inputs: ["steps", "labels", "anchorId"],
    events: ["onClose"],
    stateAxes: { value: ["open", "currentStep"] },
    // outside 닫힘이 없다. 실수로 워크스루가 끊기지 않게 하려는 고정 규칙이라
    // 저작자가 policy 객체조차 두지 않았고, 요약에도 그 사실을 그대로 옮긴다.
    web: { roles: ["dialog"], keyboard: ["Tab", "Enter", "Escape", "ArrowLeft", "ArrowRight"], focus: "trap", dismiss: ["escape", "close-action", "programmatic"] },
    native: { roles: [], states: [], actions: [] },
    scenarios: [...tourBehaviorScenarios],
  },
  layout: layoutBehavior,
  otpField: otpFieldBehavior,
  passwordField: passwordFieldBehavior,
  splitter: splitterBehavior,
  datePicker: datePickerBehavior,
  sidePanel: sidePanelBehavior,
  filePicker: filePickerBehavior,
  pagination: {
    controlled: ["currentPage", "onPageChange"],
    inputs: ["totalCount", "totalPages", "pageSize", "labels"],
    configuration: { window: ["siblingCount", "boundaryCount"] },
    stateAxes: {},
    web: {
      roles: ["navigation"],
      keyboard: ["Tab", "Enter", "Space"],
      focus: "native",
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [...paginationBehaviorScenarios],
  },
  /*
    비모달이라 `busy` 축이 없다. Sheet/AlertDialog는 진행 중 dismiss를 막지만 Popover는
    포커스가 정당하게 밖으로 나갈 수 있어 그 축이 성립하지 않는다 — 대신 나가는 것
    자체가 dismiss 신호이므로 `outside-focus`를 별도 reason으로 둔다.
  */
  popover: {
    controlled: ["open", "defaultOpen", "onOpenChange"],
    defaults: popoverBehaviorDefaults,
    stateAxes: { value: ["open"] },
    /*
      `trap`이 아니라 `restore`다 — Dialog·Sheet·AlertDialog는 모달이라 포커스를 가두지만
      Popover는 비모달이라 Tab이 **정당하게 밖으로 나갈 수 있다.** 그래서 가두지 않고,
      닫힐 때 트리거로 돌려보낸다. 같은 자리에 있는 것은 Menu다(역시 `restore`).
      나가는 것 자체가 dismiss 신호이므로 `outside-focus`를 별도 reason으로 둔다.
    */
    web: {
      roles: ["dialog"],
      keyboard: ["Tab", "Escape"],
      focus: "restore",
      dismiss: ["escape", "outside"],
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [...popoverBehaviorScenarios],
  },
  tree: treeBehavior,
  uploadItem: uploadItemBehavior,
  form: formBehaviorSpec,
  numberField: numberFieldBehavior,
  slider: sliderBehavior,
} as const satisfies Record<string, BehaviorContract>;

export type BehaviorName = keyof typeof behaviorRegistry;

export type CollectionKey = string;
export type CollectionItemTone = "neutral" | "danger";

export type CollectionItemDescriptor<Key extends CollectionKey = CollectionKey> = Readonly<{
  id: Key;
  label: string;
  textValue: string;
  description?: string;
  shortcut?: string;
  disabled?: boolean;
  tone?: CollectionItemTone;
}>;

/** Menu-only extension; danger tone and shortcut do not belong to Select. */
export type MenuItemDescriptor<
  Key extends CollectionKey = CollectionKey,
> = CollectionItemDescriptor<Key>;

type CollectionSectionLabel =
  | Readonly<{ label: string; accessibilityLabel?: string }>
  | Readonly<{ label?: string; accessibilityLabel: string }>;

export type CollectionSectionDescriptor<
  Key extends CollectionKey = CollectionKey,
  SectionKey extends CollectionKey = CollectionKey,
> = Readonly<{
  id: SectionKey;
  items: readonly CollectionItemDescriptor<Key>[];
}> & CollectionSectionLabel;

export type MenuSectionDescriptor<
  Key extends CollectionKey = CollectionKey,
  SectionKey extends CollectionKey = CollectionKey,
> = CollectionSectionDescriptor<Key, SectionKey>;

export type NoSelectionModel = Readonly<{ mode: "none" }>;
export type SingleSelectionModel<Key extends CollectionKey = CollectionKey> =
  | Readonly<{
      mode: "single";
      selectedKey: Key | null;
      defaultSelectedKey?: never;
      onSelectionChange(key: Key | null): void;
      disallowEmptySelection?: boolean;
    }>
  | Readonly<{
      mode: "single";
      selectedKey?: never;
      defaultSelectedKey?: Key | null;
      onSelectionChange?: (key: Key | null) => void;
      disallowEmptySelection?: boolean;
    }>;
export type MultipleSelectionModel<Key extends CollectionKey = CollectionKey> =
  | Readonly<{
      mode: "multiple";
      selectedKeys: ReadonlySet<Key>;
      defaultSelectedKeys?: never;
      onSelectionChange(keys: ReadonlySet<Key>): void;
    }>
  | Readonly<{
      mode: "multiple";
      selectedKeys?: never;
      defaultSelectedKeys?: ReadonlySet<Key>;
      onSelectionChange?: (keys: ReadonlySet<Key>) => void;
    }>;
export type CollectionSelectionModel<Key extends CollectionKey = CollectionKey> =
  | NoSelectionModel
  | SingleSelectionModel<Key>
  | MultipleSelectionModel<Key>;

export type AsyncCollectionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "loading"; message: string }>
  | Readonly<{ status: "loadingMore"; message: string }>
  | Readonly<{ status: "empty"; message: string }>
  | Readonly<{ status: "error"; message: string }>;

/**
 * Shared input semantics for future Select/Combobox renderers. Web may render a
 * popup while Native renders a sheet, but both consume the same stable keys.
 */
export type SelectItemDescriptor<
  Key extends CollectionKey = CollectionKey,
> = Omit<CollectionItemDescriptor<Key>, "shortcut" | "tone"> &
  Readonly<{ shortcut?: never; tone?: never }>;

export type ControlledSelectSelection<
  Key extends CollectionKey = CollectionKey,
> = Readonly<{
  selectedKey: Key | null;
  defaultSelectedKey?: never;
  onSelectionChange(key: Key | null): void;
}>;

export type UncontrolledSelectSelection<
  Key extends CollectionKey = CollectionKey,
> = Readonly<{
  selectedKey?: never;
  defaultSelectedKey?: Key | null;
  onSelectionChange?: (key: Key | null) => void;
}>;

export type SelectSelection<Key extends CollectionKey = CollectionKey> =
  | ControlledSelectSelection<Key>
  | UncontrolledSelectSelection<Key>;

export type ControlledComboboxInput = Readonly<{
  inputValue: string;
  defaultInputValue?: never;
  onInputValueChange(value: string): void;
}>;

export type UncontrolledComboboxInput = Readonly<{
  inputValue?: never;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
}>;

export type ComboboxInput = ControlledComboboxInput | UncontrolledComboboxInput;

export type ComboboxFiltering = "local" | "external";
export type ComboboxCommitReason =
  | "selection"
  | "clear";
