/** Platform-neutral behavior vocabulary shared by renderer acceptance tests. */
export type InteractionState = "idle" | "hover" | "focusVisible" | "pressed" | "dragged";
export type AvailabilityState = "enabled" | "disabled" | "readOnly" | "busy";
export type ValueState = "empty" | "filled" | "checked" | "mixed" | "selected" | "open" | "expanded";
export type ValidationState = "valid" | "invalid";
export type ContentState = "idle" | "loading" | "loadingMore" | "empty" | "error" | "complete";
export type TabsActivationMode = "automatic" | "manual";
export type TabsMountPolicy = "active" | "visited" | "always";
export type TabsPanelMode = "keyed" | "dynamic";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsDirection = "ltr" | "rtl";
export type SelectionOrientation = "horizontal" | "vertical";
export type SelectionDirection = "ltr" | "rtl";
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
export type SelectionGroupLabel = Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: never;
    accessibilityLabel: string;
}>;
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
export type CheckboxGroupSelection<Key extends string = string> = ControlledCheckboxGroupSelection<Key> | UncontrolledCheckboxGroupSelection<Key>;
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
export type RadioGroupSelection<Key extends string = string> = ControlledRadioGroupSelection<Key> | UncontrolledRadioGroupSelection<Key>;
export type SelectionNavigationIntent = "next" | "previous" | "first" | "last";
/** Resolves a renderer's required name while rejecting type-valid blank copy. */
export declare function resolveControlAccessibleName(label: string | undefined, accessibilityLabel: string | undefined, controlName?: string): string;
export declare const selectionGroupBehaviorDefaults: {
    readonly orientation: "vertical";
    readonly direction: "ltr";
};
export declare const radioGroupBehaviorDefaults: {
    readonly loop: true;
    readonly orientation: "vertical";
    readonly direction: "ltr";
};
export declare const checkboxBehaviorDefaults: {
    readonly mixedActivation: "check";
};
export declare const selectBehaviorDefaults: {
    readonly disallowEmptySelection: false;
    readonly loop: false;
};
export declare const comboboxBehaviorDefaults: {
    readonly filtering: "local";
    readonly loop: false;
};
/** Throws before a renderer can expose ambiguous or unreachable selection state. */
export declare function validateSelectionItems<Key extends string>(items: readonly SelectionItemDescriptor<Key>[]): void;
export declare function getCheckboxNextState(current: CheckboxState, mixedActivation?: MixedCheckboxActivation): boolean;
export declare function toggleCheckboxSelection<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], current: ReadonlySet<Key>, id: Key): ReadonlySet<Key>;
export declare function validateCheckboxSelection<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], current: ReadonlySet<Key>): void;
/** Drops removed collection keys while retaining selected disabled items. */
export declare function reconcileCheckboxSelection<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], current: ReadonlySet<Key>): ReadonlySet<Key>;
export declare function resolveInitialRadioValue<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], requestedValue: Key | null | undefined, required?: boolean): Key | null;
export declare function validateRadioSelection<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], current: Key | null): void;
/** Returns the only enabled radio that may enter the Web tab order. */
export declare function resolveRadioTabStop<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], selectedValue: Key | null): Key | undefined;
/** Reconciles an uncontrolled radio when its selected item leaves the collection. */
export declare function reconcileRadioSelection<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], current: Key | null, required?: boolean): Key | null;
export declare function getSelectionNavigationIntent(key: WebKeyboardKey, orientation: SelectionOrientation, direction: SelectionDirection): SelectionNavigationIntent | undefined;
export declare function getRadioNavigationTarget<Key extends string>(items: readonly SelectionItemDescriptor<Key>[], currentId: Key | null | undefined, intent: SelectionNavigationIntent, loop?: boolean): Key | undefined;
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
export type TabsSelection<Key extends string = string> = ControlledTabsSelection<Key> | UncontrolledTabsSelection<Key>;
export type TabNavigationIntent = "next" | "previous" | "first" | "last";
export declare function getTabNavigationIntent(key: WebKeyboardKey, orientation: TabsOrientation, direction: TabsDirection): TabNavigationIntent | undefined;
/** Validates collection identity and resolves the only safe initial selection. */
export declare function resolveInitialTabValue<Key extends string>(items: readonly TabDescriptor<Key>[], requestedValue?: Key): Key | undefined;
/** Shared roving-focus math; renderers still own DOM/native focus APIs. */
export declare function getTabNavigationTarget<Key extends string>(items: readonly TabDescriptor<Key>[], currentId: Key, intent: TabNavigationIntent, loop?: boolean): Key | undefined;
export type BehaviorStateAxis = "interaction" | "availability" | "value" | "validation" | "content";
export type WebKeyboardKey = "Tab" | "Enter" | "Space" | "Escape" | "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Home" | "End" | "PageUp" | "PageDown" | "F8" | "Typeahead";
export type NativeAccessibilityState = "disabled" | "selected" | "checked" | "busy" | "expanded";
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
        focus: "native" | "roving" | "activeDescendant" | "trap" | "restore" | "none";
        dismiss?: readonly ("escape" | "outside" | "selection" | "blur" | "timeout" | "action" | "close-action" | "swipe" | "programmatic")[];
    }>;
    native: Readonly<{
        roles: readonly string[];
        states: readonly NativeAccessibilityState[];
        actions: readonly string[];
        dismiss?: readonly ("back" | "swipe" | "outside" | "selection" | "timeout" | "action" | "close-action" | "programmatic")[];
    }>;
    scenarios: readonly string[];
}>;
/** Safe behavior defaults: automatic activation is opt-in for instant panels. */
export declare const tabsBehaviorDefaults: {
    readonly activationMode: "manual";
    readonly mountPolicy: "active";
    readonly panelMode: "keyed";
    readonly orientation: "horizontal";
    readonly direction: "ltr";
    readonly loop: true;
};
/**
 * Behavior is data, not a React implementation. Web/RN renderers can use any
 * suitable primitive while running the same scenarios and exposing the same
 * controlled state names.
 */
export declare const behaviorRegistry: {
    readonly link: {
        readonly controlled: readonly [];
        readonly inputs: readonly ["destination", "label"];
        readonly stateAxes: {
            readonly interaction: readonly ["idle", "hover", "focusVisible", "pressed"];
        };
        readonly web: {
            readonly roles: readonly ["link"];
            readonly keyboard: readonly ["Tab", "Enter"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["link"];
            readonly states: readonly [];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["href-is-the-destination-source-of-truth", "web-renders-a-real-anchor-and-preserves-modifier-context-navigation", "native-internal-destination-uses-router-link-semantics", "native-external-destination-uses-platform-linking-and-reports-failure", "link-never-exposes-disabled-action-or-visited-application-state", "download-remains-a-separate-platform-workflow", "visible-label-owns-one-accessible-name", "leading-and-trailing-icons-are-decorative-semantic-icons", "logical-icon-direction-follows-rtl", "inline-link-has-a-persistent-non-color-cue", "standalone-link-target-is-at-least-forty-four-units", "destination-link-never-contains-another-interactive-descendant"];
    };
    readonly field: {
        readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled", "readOnly"];
            readonly validation: readonly ["valid", "invalid"];
            readonly content: readonly ["idle", "loading", "error"];
        };
        readonly web: {
            readonly roles: readonly ["textbox"];
            readonly keyboard: readonly ["Tab"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["text"];
            readonly states: readonly ["disabled"];
            readonly actions: readonly ["focus", "setText"];
        };
        readonly scenarios: readonly ["label-description-error-linkage", "invalid-plus-focus", "disabled-suppresses-edit"];
    };
    readonly searchField: {
        readonly controlled: readonly ["value", "defaultValue", "onValueChange", "onClear"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled", "busy"];
            readonly value: readonly ["empty", "filled"];
            readonly validation: readonly ["valid", "invalid"];
            readonly content: readonly ["idle", "loading", "error"];
        };
        readonly web: {
            readonly roles: readonly ["searchbox", "button"];
            readonly keyboard: readonly ["Tab", "Enter"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["text", "button"];
            readonly states: readonly ["disabled", "busy"];
            readonly actions: readonly ["focus", "setText", "clear"];
        };
        readonly scenarios: readonly ["clear-has-name", "empty-hides-clear", "invalid-plus-focus", "busy-preserves-query"];
    };
    readonly checkbox: {
        readonly controlled: readonly ["checked", "defaultChecked", "onCheckedChange"];
        readonly configuration: {
            readonly mixedActivation: readonly ["check", "uncheck"];
        };
        readonly defaults: {
            readonly mixedActivation: "check";
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled", "readOnly"];
            readonly value: readonly ["checked", "mixed"];
            readonly validation: readonly ["valid", "invalid"];
        };
        readonly web: {
            readonly roles: readonly ["checkbox"];
            readonly keyboard: readonly ["Tab", "Space"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["checkbox"];
            readonly states: readonly ["disabled", "checked"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["visible-label-is-accessible-name", "mixed-is-announced-and-activates-to-default", "disabled-and-read-only-suppress-change", "controlled-value-never-mutates-internally", "required-and-invalid-support-are-linked"];
    };
    readonly checkboxGroup: {
        readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
        readonly configuration: {
            readonly orientation: readonly ["horizontal", "vertical"];
            readonly direction: readonly ["ltr", "rtl"];
        };
        readonly defaults: {
            readonly orientation: "vertical";
            readonly direction: "ltr";
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled", "readOnly"];
            readonly value: readonly ["checked"];
            readonly validation: readonly ["valid", "invalid"];
        };
        readonly web: {
            readonly roles: readonly ["group", "checkbox"];
            readonly keyboard: readonly ["Tab", "Space"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["checkbox"];
            readonly states: readonly ["disabled", "checked"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["each-enabled-checkbox-is-a-tab-stop", "space-toggles-only-focused-checkbox", "group-label-description-and-error-are-linked", "disabled-selected-item-is-retained-but-not-activated", "change-emits-a-fresh-set", "duplicate-and-unknown-ids-are-rejected", "uncontrolled-selection-reconciles-collection-mutation", "required-and-invalid-are-announced", "no-nested-interactive-descendants"];
    };
    readonly radioGroup: {
        readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
        readonly configuration: {
            readonly orientation: readonly ["horizontal", "vertical"];
            readonly direction: readonly ["ltr", "rtl"];
            readonly loop: readonly ["true", "false"];
        };
        readonly defaults: {
            readonly loop: true;
            readonly orientation: "vertical";
            readonly direction: "ltr";
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled", "readOnly"];
            readonly value: readonly ["checked", "selected"];
            readonly validation: readonly ["valid", "invalid"];
        };
        readonly web: {
            readonly roles: readonly ["radiogroup", "radio"];
            readonly keyboard: readonly ["Tab", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
            readonly focus: "roving";
        };
        readonly native: {
            readonly roles: readonly ["radio"];
            readonly states: readonly ["disabled", "checked"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["at-most-one-selection-and-nullable-initial-value", "checked-or-first-enabled-is-the-only-tab-stop", "arrow-focuses-and-selects-while-skipping-disabled", "orientation-direction-and-loop-control-navigation", "space-selects-focused-radio", "group-label-description-and-error-are-linked", "disabled-selected-item-is-retained-with-enabled-tab-stop", "required-invalid-and-read-only-are-announced", "controlled-value-never-mutates-internally", "duplicate-and-unknown-ids-are-rejected"];
    };
    readonly switch: {
        readonly controlled: readonly ["checked", "defaultChecked", "onCheckedChange"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled"];
            readonly value: readonly ["checked"];
        };
        readonly web: {
            readonly roles: readonly ["switch"];
            readonly keyboard: readonly ["Tab", "Space"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["switch"];
            readonly states: readonly ["disabled", "checked"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["row-and-control-are-one-target", "checked-announced", "disabled-suppresses-change"];
    };
    readonly segmentedControl: {
        readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled"];
            readonly value: readonly ["selected"];
        };
        readonly web: {
            readonly roles: readonly ["radiogroup", "radio"];
            readonly keyboard: readonly ["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
            readonly focus: "roving";
        };
        readonly native: {
            readonly roles: readonly ["radio"];
            readonly states: readonly ["disabled", "checked"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["exactly-one-selected", "one-tab-stop", "arrow-selection", "selected-plus-focus"];
    };
    readonly chip: {
        readonly controlled: readonly ["selected", "onPress"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled"];
            readonly value: readonly ["selected"];
        };
        readonly web: {
            readonly roles: readonly ["button", "radio", "checkbox"];
            readonly keyboard: readonly ["Tab", "Enter", "Space"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["button", "radio", "checkbox"];
            readonly states: readonly ["disabled", "checked"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["action-never-exposes-selection", "single-selection-uses-radio-checked", "multiple-selection-uses-checkbox-checked", "selected-plus-focus", "selection-indicator-is-not-color-only", "single-mode-composes-radio-group-behavior", "multiple-mode-composes-checkbox-group-behavior"];
    };
    readonly tabs: {
        readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
        readonly configuration: {
            readonly activationMode: readonly ["automatic", "manual"];
            readonly mountPolicy: readonly ["active", "visited", "always"];
            readonly panelMode: readonly ["keyed", "dynamic"];
            readonly orientation: readonly ["horizontal", "vertical"];
            readonly direction: readonly ["ltr", "rtl"];
            readonly loop: readonly ["true", "false"];
        };
        readonly defaults: {
            readonly activationMode: "manual";
            readonly mountPolicy: "active";
            readonly panelMode: "keyed";
            readonly orientation: "horizontal";
            readonly direction: "ltr";
            readonly loop: true;
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled"];
            readonly value: readonly ["selected"];
        };
        readonly web: {
            readonly roles: readonly ["tablist", "tab", "tabpanel"];
            readonly keyboard: readonly ["Tab", "Enter", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
            readonly focus: "roving";
        };
        readonly native: {
            readonly roles: readonly ["tab"];
            readonly states: readonly ["disabled", "selected"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["tab-controls-panel", "one-tab-stop", "disabled-tab-skipped", "selected-plus-focus", "automatic-activation-only-for-instant-panels", "manual-activation-keeps-focus-and-selection-distinct", "active-mount-removes-inactive-panel", "always-mount-makes-inactive-panels-inert", "visited-mount-preserves-visited-panel-state", "horizontal-arrows-do-not-consume-up-down", "vertical-arrows-and-aria-orientation", "web-tablist-has-accessible-name", "every-tab-controls-an-existing-panel", "active-panel-labelled-by-selected-tab", "manual-focus-does-not-relabel-dynamic-panel", "dynamic-panel-preserves-host-instance", "dynamic-panel-requires-active-mount", "panel-enters-tab-order-when-content-has-no-focus-target", "rtl-navigation-follows-logical-direction", "first-enabled-tab-is-uncontrolled-default", "duplicate-and-disabled-selection-are-rejected", "controlled-selection-never-mutates-internally", "native-focus-does-not-select-without-activate", "inactive-mounted-panels-are-hidden-and-inert", "uncontrolled-selection-reconciles-collection-mutation"];
    };
    readonly bottomNavigation: {
        readonly controlled: readonly [];
        readonly inputs: readonly ["items", "selectedKey", "accessibilityLabel"];
        readonly events: readonly ["onActivate", "onLongPress"];
        readonly configuration: {
            readonly direction: readonly ["ltr", "rtl"];
            readonly keyboardBehavior: readonly ["hide", "remain"];
        };
        readonly defaults: {
            readonly direction: "ltr";
            readonly keyboardBehavior: "hide";
            readonly minItems: 2;
            readonly maxItems: 6;
        };
        readonly stateAxes: {
            readonly interaction: readonly ["idle", "hover", "focusVisible", "pressed"];
            readonly availability: readonly ["enabled", "disabled"];
            readonly value: readonly ["selected"];
        };
        readonly web: {
            readonly roles: readonly ["navigation", "list", "link"];
            readonly keyboard: readonly ["Tab", "Enter"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["tab", "button"];
            readonly states: readonly ["disabled", "selected"];
            readonly actions: readonly ["activate", "longpress"];
        };
        readonly scenarios: readonly ["two-to-five-stable-top-level-destinations", "router-selected-key-is-read-only-input", "activation-does-not-select-before-router-commit", "prevented-or-failed-navigation-keeps-current-selection", "reselect-is-distinct-from-navigation", "navigator-preserves-each-destination-state", "disabled-destination-suppresses-activation", "visible-label-always-names-a-decorative-icon", "selected-state-uses-shape-and-type-not-color-alone", "selected-and-focus-indicators-remain-simultaneously-visible", "centered-sibling-action-is-excluded-from-destination-collection", "badge-zero-is-hidden-and-visible-count-is-bounded", "badge-subtree-is-hidden-and-item-uses-one-resolved-accessibility-name", "badge-update-does-not-change-focus-selection-or-live-announce", "web-uses-a-labelled-navigation-landmark-and-real-links", "web-current-link-uses-aria-current-page", "web-preserves-modifier-click-and-does-not-use-tab-roles-or-roving-focus", "native-emits-tab-press-and-respects-default-prevented-before-navigation", "native-forwards-tab-long-press", "native-ios-may-use-button-plus-selected-when-tab-role-is-not-reliably-supported", "safe-area-padding-is-additive", "software-keyboard-hides-instead-of-lifting-the-navigation", "two-hundred-percent-text-wraps-without-fixed-item-height", "rtl-order-and-badge-anchor-follow-logical-direction", "targets-are-at-least-forty-four-units", "reduced-motion-removes-transform-without-changing-state"];
    };
    readonly disclosureGroup: {
        readonly controlled: readonly ["expandedKeys", "defaultExpandedKeys", "onExpandedChange"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled"];
            readonly value: readonly ["expanded"];
        };
        readonly web: {
            readonly roles: readonly ["heading", "button", "region"];
            readonly keyboard: readonly ["Tab", "Enter", "Space", "ArrowUp", "ArrowDown", "Home", "End"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["button"];
            readonly states: readonly ["disabled", "expanded"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["single-and-multiple-invariants", "each-enabled-trigger-is-a-tab-stop", "toggle-keeps-trigger-focus", "panel-removed-when-collapsed", "disabled-trigger-suppresses-change", "reduced-motion"];
    };
    readonly menu: {
        readonly controlled: readonly ["open", "defaultOpen", "onOpenChange", "onAction", "onActionAfterDismiss", "selection", "asyncState"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled"];
            readonly value: readonly ["open", "selected"];
            readonly content: readonly ["idle", "loading", "loadingMore", "empty", "error"];
        };
        readonly web: {
            readonly roles: readonly ["menu", "menuitem", "menuitemradio", "menuitemcheckbox"];
            readonly keyboard: readonly ["Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "Home", "End", "Typeahead"];
            readonly focus: "restore";
            readonly dismiss: readonly ["escape", "outside", "selection"];
        };
        readonly native: {
            readonly roles: readonly ["menu", "menuitem"];
            readonly states: readonly ["disabled", "selected", "checked"];
            readonly actions: readonly ["activate"];
            readonly dismiss: readonly ["back", "outside", "selection"];
        };
        readonly scenarios: readonly ["action-and-single-close-after-selection", "on-action-does-not-depend-on-controlled-close", "after-dismiss-action-sequences-next-surface", "multiple-selection-keeps-menu-open", "disabled-item-skipped", "escape-or-back-restores-trigger", "danger-item-not-color-only", "loading-more-preserves-items-and-selection"];
    };
    readonly dialog: {
        readonly controlled: readonly ["open", "defaultOpen", "onOpenChange"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "busy"];
            readonly value: readonly ["open"];
        };
        readonly web: {
            readonly roles: readonly ["dialog"];
            readonly keyboard: readonly ["Tab", "Escape"];
            readonly focus: "trap";
            readonly dismiss: readonly ["escape", "outside"];
        };
        readonly native: {
            readonly roles: readonly ["dialog"];
            readonly states: readonly ["busy"];
            readonly actions: readonly ["dismiss"];
            readonly dismiss: readonly ["back", "outside"];
        };
        readonly scenarios: readonly ["title-description-linkage", "focus-trap-and-restore", "modal-isolation", "single-dismiss-callback"];
    };
    readonly alertDialog: {
        readonly controlled: readonly ["open", "defaultOpen", "onOpenChange"];
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "busy"];
            readonly value: readonly ["open"];
            readonly content: readonly ["idle", "loading", "error"];
        };
        readonly web: {
            readonly roles: readonly ["alertdialog"];
            readonly keyboard: readonly ["Tab", "Escape"];
            readonly focus: "trap";
            readonly dismiss: readonly ["escape"];
        };
        readonly native: {
            readonly roles: readonly ["alertdialog"];
            readonly states: readonly ["busy"];
            readonly actions: readonly ["confirm", "cancel"];
            readonly dismiss: readonly ["back"];
        };
        readonly scenarios: readonly ["visible-title-and-description-are-announced", "modal-isolation-and-tab-trap", "confirm-mode-cancel-is-initial-focus", "alert-mode-confirm-is-initial-focus", "outside-attempt-is-ignored-without-callback", "escape-or-back-cancels-when-idle", "busy-blocks-every-dismiss-and-duplicate-confirm", "confirm-action-runs-once", "error-is-announced-and-dialog-stays-open", "controlled-close-settles-programmatic-cancel", "unmount-settles-interrupted", "result-settles-once-after-exit", "focus-restores-after-every-close-path", "reduced-motion-still-completes-exit"];
    };
    readonly sheet: {
        readonly controlled: readonly ["open", "defaultOpen", "onOpenChange", "dismissPolicy"];
        readonly defaults: {
            readonly dismissible: true;
            readonly dismissWhileBusy: false;
            readonly outsideDismiss: true;
            readonly escapeOrBackDismiss: true;
            readonly swipeDismiss: false;
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "busy"];
            readonly value: readonly ["open"];
        };
        readonly web: {
            readonly roles: readonly ["dialog"];
            readonly keyboard: readonly ["Tab", "Escape"];
            readonly focus: "trap";
            readonly dismiss: readonly ["escape", "outside"];
        };
        readonly native: {
            readonly roles: readonly ["dialog"];
            readonly states: readonly ["busy"];
            readonly actions: readonly ["dismiss"];
            readonly dismiss: readonly ["back", "outside"];
        };
        readonly scenarios: readonly ["focus-or-modal-isolation", "scroll-lock", "safe-area", "single-dismiss-callback", "busy-blocks-dismiss", "dismiss-reason-is-reported", "programmatic-owner-close-is-always-allowed", "swipe-requires-enabled-policy-and-gesture-capability", "successor-surface-opens-after-exit", "nested-modal-surfaces-are-forbidden", "reduced-motion-still-completes-dismiss"];
    };
    readonly select: {
        readonly controlled: readonly ["selectedKey", "defaultSelectedKey", "onSelectionChange", "open", "defaultOpen", "onOpenChange"];
        readonly inputs: readonly ["asyncState", "selectedItem"];
        readonly configuration: {
            readonly disallowEmptySelection: readonly ["true", "false"];
            readonly loop: readonly ["true", "false"];
        };
        readonly defaults: {
            readonly disallowEmptySelection: false;
            readonly loop: false;
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled", "readOnly", "busy"];
            readonly value: readonly ["empty", "selected", "open"];
            readonly validation: readonly ["valid", "invalid"];
            readonly content: readonly ["idle", "loading", "loadingMore", "empty", "error"];
        };
        readonly web: {
            readonly roles: readonly ["combobox", "listbox", "option"];
            readonly keyboard: readonly ["Tab", "Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "Home", "End", "Typeahead"];
            readonly focus: "activeDescendant";
            readonly dismiss: readonly ["selection", "escape", "outside", "blur"];
        };
        readonly native: {
            readonly roles: readonly ["button", "dialog", "radio"];
            readonly states: readonly ["disabled", "checked", "busy", "expanded"];
            readonly actions: readonly ["activate", "dismiss"];
            readonly dismiss: readonly ["selection", "back", "outside"];
        };
        readonly scenarios: readonly ["visible-label-or-accessibility-label-names-trigger", "collection-ids-and-text-values-are-validated", "highlighted-option-is-distinct-from-committed-selection", "trigger-controls-the-mounted-listbox", "active-descendant-references-a-mounted-option", "active-option-scrolls-into-view", "disabled-options-are-skipped", "escape-closes-without-commit", "selection-requests-close-and-restores-trigger-focus", "controlled-owner-may-defer-a-selection-close-request", "removed-selection-is-reconciled", "loading-more-preserves-options-and-selection", "transient-async-pages-preserve-committed-key-and-copy", "empty-error-and-loading-are-announced", "options-have-no-nested-interactive-descendants"];
    };
    readonly combobox: {
        readonly controlled: readonly ["selectedKey", "defaultSelectedKey", "onSelectionChange", "inputValue", "defaultInputValue", "onInputValueChange", "open", "defaultOpen", "onOpenChange"];
        readonly inputs: readonly ["asyncState", "queryValue", "resultQuery", "selectedItem"];
        readonly events: readonly ["onCommit"];
        readonly configuration: {
            readonly filtering: readonly ["local", "external"];
            readonly loop: readonly ["true", "false"];
        };
        readonly defaults: {
            readonly filtering: "local";
            readonly loop: false;
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "disabled", "readOnly", "busy"];
            readonly value: readonly ["empty", "filled", "selected", "open"];
            readonly validation: readonly ["valid", "invalid"];
            readonly content: readonly ["idle", "loading", "loadingMore", "empty", "error"];
        };
        readonly web: {
            readonly roles: readonly ["combobox", "listbox", "option"];
            readonly keyboard: readonly ["Tab", "Enter", "Escape", "ArrowUp", "ArrowDown", "Home", "End"];
            readonly focus: "activeDescendant";
            readonly dismiss: readonly ["selection", "escape", "outside", "blur"];
        };
        readonly native: {
            readonly roles: readonly ["button", "text", "dialog", "radio"];
            readonly states: readonly ["disabled", "checked", "busy", "expanded"];
            readonly actions: readonly ["focus", "setText", "activate", "dismiss"];
            readonly dismiss: readonly ["selection", "back", "outside"];
        };
        readonly scenarios: readonly ["selected-key-and-input-value-are-independent", "input-focus-and-active-option-are-distinct", "input-controls-the-mounted-listbox", "active-descendant-references-a-mounted-option", "active-option-scrolls-into-view", "ime-composition-does-not-prematurely-filter-or-commit", "escape-restores-the-committed-label", "query-edit-never-commits-a-stale-selection", "external-results-do-not-implicitly-commit", "committed-item-survives-transient-result-pages", "stale-external-results-do-not-replace-current-query", "loading-more-preserves-options-and-active-descendant", "empty-error-and-loading-are-announced", "custom-values-are-rejected-without-an-explicit-policy", "selection-state-updates-before-commit-event-and-close-request", "options-have-no-nested-interactive-descendants"];
    };
    readonly toast: {
        readonly controlled: readonly [];
        readonly inputs: readonly ["descriptor", "queueSnapshot", "visibleSnapshot"];
        readonly events: readonly ["onAction", "onDismiss"];
        readonly configuration: {
            readonly priority: readonly ["normal", "high"];
            readonly duplicatePolicy: readonly ["update", "ignore"];
            readonly timerUpdatePolicy: readonly ["preserve", "restart"];
            readonly overflowPolicy: readonly ["discard-oldest", "discard-newest"];
        };
        readonly defaults: {
            readonly durationMs: 5000;
            readonly minimumDurationMs: 5000;
            readonly priority: "normal";
            readonly dismissOnAction: true;
            readonly maxVisible: 1;
            readonly maxQueued: 20;
            readonly duplicatePolicy: "update";
            readonly timerUpdatePolicy: "preserve";
            readonly overflowPolicy: "discard-oldest";
        };
        readonly stateAxes: {
            readonly value: readonly ["open"];
            readonly content: readonly ["idle"];
        };
        readonly web: {
            readonly roles: readonly ["region", "status", "alert", "button"];
            readonly keyboard: readonly ["Tab", "Enter", "Space", "Escape", "F8"];
            readonly focus: "native";
            readonly dismiss: readonly ["timeout", "action", "close-action", "escape", "swipe", "programmatic"];
        };
        readonly native: {
            readonly roles: readonly ["alert", "button"];
            readonly states: readonly [];
            readonly actions: readonly ["announce", "activate", "dismiss"];
            readonly dismiss: readonly ["timeout", "action", "close-action", "swipe", "programmatic"];
        };
        readonly scenarios: readonly ["stable-id-duplicate-updates-in-place-without-reordering", "bounded-queue-promotes-items-in-fifo-order", "queued-time-never-consumes-auto-dismiss-duration", "visible-timer-pauses-for-pointer-focus-window-and-gesture", "actionable-toast-is-persistent-unless-duration-is-explicit", "auto-dismiss-duration-is-never-shorter-than-five-seconds", "action-and-dismiss-callbacks-run-exactly-once", "programmatic-close-reports-its-own-dismiss-reason", "normal-and-high-announcements-use-the-visible-copy-or-explicit-override", "tone-is-always-paired-with-a-non-color-mark", "web-hotkey-focuses-the-labelled-viewport-and-last-close-restores-focus", "exit-completes-once-with-and-without-reduced-motion", "provider-teardown-interrupts-every-session-without-leaking-a-timer"];
    };
    readonly loadMore: {
        readonly controlled: readonly [];
        readonly inputs: readonly ["state", "labels"];
        readonly events: readonly ["onLoadMore"];
        readonly configuration: {
            readonly mode: readonly ["automatic", "manual"];
        };
        readonly defaults: {
            readonly mode: "automatic";
        };
        readonly stateAxes: {
            readonly availability: readonly ["enabled", "busy"];
            readonly content: readonly ["idle", "loadingMore", "error", "complete"];
        };
        readonly web: {
            readonly roles: readonly ["status", "alert", "button"];
            readonly keyboard: readonly ["Tab", "Enter", "Space"];
            readonly focus: "native";
        };
        readonly native: {
            readonly roles: readonly ["progressbar", "alert", "button"];
            readonly states: readonly ["busy", "disabled"];
            readonly actions: readonly ["activate"];
        };
        readonly scenarios: readonly ["existing-items-remain-mounted-in-every-footer-state", "automatic-viewport-request-has-an-accessible-manual-fallback", "one-request-is-in-flight-per-controller", "same-request-key-is-never-issued-twice-concurrently", "loading-and-complete-states-block-new-requests", "error-state-retries-only-with-retry-reason", "loading-status-and-error-alert-announce-once", "retry-and-manual-targets-are-at-least-forty-four-units"];
    };
    readonly tooltip: {
        readonly controlled: readonly ["open", "defaultOpen", "onOpenChange"];
        readonly inputs: readonly ["content"];
        readonly configuration: {
            readonly placement: readonly ["top", "bottom", "start", "end"];
            readonly align: readonly ["start", "center", "end"];
        };
        readonly defaults: {
            readonly pointerOpenDelayMs: 500;
            readonly focusOpenDelayMs: 0;
            readonly skipDelayMs: 300;
            readonly hoverable: true;
            readonly touchHover: false;
            readonly oneVisiblePerProvider: true;
        };
        readonly stateAxes: {
            readonly interaction: readonly ["idle", "hover", "focusVisible"];
            readonly value: readonly ["open"];
        };
        readonly web: {
            readonly roles: readonly ["tooltip"];
            readonly keyboard: readonly ["Tab", "Escape"];
            readonly focus: "none";
            readonly dismiss: readonly ["escape", "blur"];
        };
        readonly native: {
            readonly roles: readonly [];
            readonly states: readonly [];
            readonly actions: readonly [];
        };
        readonly scenarios: readonly ["plain-localized-copy-never-contains-interaction", "keyboard-focus-opens-immediately-and-pointer-respects-delay", "recent-sibling-tooltip-uses-skip-delay", "one-tooltip-is-visible-per-provider", "trigger-content-hover-and-pointer-corridor-keep-open", "escape-dismisses-and-suppresses-reopen-until-input-reset", "blur-or-pointer-leave-closes-only-after-all-active-inputs-end", "trigger-activation-closes-without-cancelling-trigger-action", "trigger-keeps-focus-and-tooltip-has-no-tab-stop", "existing-aria-describedby-is-preserved", "touch-pointer-hover-is-ignored", "controlled-close-rejection-never-exposes-two-tooltips", "timer-and-global-listener-cleanup-on-unmount", "reduced-motion-exit-completes-exactly-once"];
    };
};
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
export type MenuItemDescriptor<Key extends CollectionKey = CollectionKey> = CollectionItemDescriptor<Key>;
type CollectionSectionLabel = Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: string;
    accessibilityLabel: string;
}>;
export type CollectionSectionDescriptor<Key extends CollectionKey = CollectionKey, SectionKey extends CollectionKey = CollectionKey> = Readonly<{
    id: SectionKey;
    items: readonly CollectionItemDescriptor<Key>[];
}> & CollectionSectionLabel;
export type MenuSectionDescriptor<Key extends CollectionKey = CollectionKey, SectionKey extends CollectionKey = CollectionKey> = CollectionSectionDescriptor<Key, SectionKey>;
export type NoSelectionModel = Readonly<{
    mode: "none";
}>;
export type SingleSelectionModel<Key extends CollectionKey = CollectionKey> = Readonly<{
    mode: "single";
    selectedKey: Key | null;
    defaultSelectedKey?: never;
    onSelectionChange(key: Key | null): void;
    disallowEmptySelection?: boolean;
}> | Readonly<{
    mode: "single";
    selectedKey?: never;
    defaultSelectedKey?: Key | null;
    onSelectionChange?: (key: Key | null) => void;
    disallowEmptySelection?: boolean;
}>;
export type MultipleSelectionModel<Key extends CollectionKey = CollectionKey> = Readonly<{
    mode: "multiple";
    selectedKeys: ReadonlySet<Key>;
    defaultSelectedKeys?: never;
    onSelectionChange(keys: ReadonlySet<Key>): void;
}> | Readonly<{
    mode: "multiple";
    selectedKeys?: never;
    defaultSelectedKeys?: ReadonlySet<Key>;
    onSelectionChange?: (keys: ReadonlySet<Key>) => void;
}>;
export type CollectionSelectionModel<Key extends CollectionKey = CollectionKey> = NoSelectionModel | SingleSelectionModel<Key> | MultipleSelectionModel<Key>;
export type AsyncCollectionState = Readonly<{
    status: "idle";
}> | Readonly<{
    status: "loading";
    message: string;
}> | Readonly<{
    status: "loadingMore";
    message: string;
}> | Readonly<{
    status: "empty";
    message: string;
}> | Readonly<{
    status: "error";
    message: string;
}>;
/**
 * Shared input semantics for future Select/Combobox renderers. Web may render a
 * popup while Native renders a sheet, but both consume the same stable keys.
 */
export type SelectItemDescriptor<Key extends CollectionKey = CollectionKey> = Omit<CollectionItemDescriptor<Key>, "shortcut" | "tone"> & Readonly<{
    shortcut?: never;
    tone?: never;
}>;
export type ControlledSelectSelection<Key extends CollectionKey = CollectionKey> = Readonly<{
    selectedKey: Key | null;
    defaultSelectedKey?: never;
    onSelectionChange(key: Key | null): void;
}>;
export type UncontrolledSelectSelection<Key extends CollectionKey = CollectionKey> = Readonly<{
    selectedKey?: never;
    defaultSelectedKey?: Key | null;
    onSelectionChange?: (key: Key | null) => void;
}>;
export type SelectSelection<Key extends CollectionKey = CollectionKey> = ControlledSelectSelection<Key> | UncontrolledSelectSelection<Key>;
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
export type ComboboxCommitReason = "selection" | "clear";
export {};
//# sourceMappingURL=behaviors.d.ts.map