import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { control, radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import { reconcileCheckboxSelection, toggleCheckboxSelection, } from "./selection-helpers.js";
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`ToggleGroup ${field} must not be empty`);
    }
}
export function validateToggleGroupDescriptor(descriptor) {
    assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
    if (!Array.isArray(descriptor.items) || descriptor.items.length === 0) {
        throw new RangeError("ToggleGroup must contain at least one item");
    }
    const ids = new Set();
    for (const item of descriptor.items) {
        assertNonEmpty(item.id, "item id");
        assertNonEmpty(item.label, "item label");
        if (ids.has(item.id))
            throw new TypeError(`Duplicate ToggleGroup item id: ${item.id}`);
        ids.add(item.id);
    }
}
/** 하나를 켜고 끈다. 비활성 보호는 공용 helper가 이미 갖고 있다. */
export function toggleGroupSelection(descriptor, pressedIds, id) {
    validateToggleGroupDescriptor(descriptor);
    return toggleCheckboxSelection(descriptor.items, pressedIds, id);
}
/** 목록에서 사라진 항목의 눌림 상태는 남기지 않는다. */
export function reconcileToggleGroupSelection(descriptor, pressedIds) {
    validateToggleGroupDescriptor(descriptor);
    return reconcileCheckboxSelection(descriptor.items, pressedIds);
}
export const toggleGroupRecipe = {
    slots: ["root", "item", "label"],
    defaults: { size: "medium" },
    sizes: {
        small: { minHeight: control.minTouchTarget, paddingHorizontal: spacing.sm, textVariant: "label" },
        medium: { minHeight: 44, paddingHorizontal: spacing.md, textVariant: "body" },
    },
    radius: radius.md,
    gap: spacing.xxs,
    idle: {
        background: semanticColors.surface.default,
        color: semanticColors.content.body,
        border: semanticColors.border.control,
    },
    pressed: {
        background: collectionItemContract.selectedBackground,
        color: semanticColors.content.brand,
        border: semanticColors.border.focus,
    },
    states: { focus: focusIndicatorContract },
};
export const toggleGroupBehavior = {
    controlled: ["pressedIds", "defaultPressedIds", "onPressedIdsChange"],
    inputs: ["items", "accessibilityLabel", "size"],
    stateAxes: {
        availability: ["enabled", "disabled"],
        value: ["pressed", "unpressed"],
    },
    web: {
        roles: ["group", "button"],
        keyboard: ["Tab", "Enter", "Space"],
        /** Toolbar-style roving focus is not used: each toggle is its own tab stop, like a row of checkboxes. */
        focus: "native",
    },
    native: { roles: ["button"], states: ["selected", "disabled"], actions: ["toggle"] },
    scenarios: [
        "several-items-can-be-pressed-at-once-and-none-is-a-valid-state",
        "pressed-state-rides-on-aria-pressed-not-on-color-alone",
        "a-disabled-item-never-toggles-and-never-enters-the-pressed-set",
        "removing-an-item-drops-its-pressed-state-instead-of-keeping-an-orphan-id",
        "single-choice-belongs-to-segmented-control-this-contract-never-adds-a-single-mode",
        "the-group-carries-its-own-accessible-name-separate-from-each-buttons-name",
    ],
};
//# sourceMappingURL=toggle-group.js.map