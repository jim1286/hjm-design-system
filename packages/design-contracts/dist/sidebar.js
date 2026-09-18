import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { control, radius, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Sidebar ${field} must not be empty`);
    }
}
export function validateSidebarDescriptor(descriptor) {
    assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
    if (!Array.isArray(descriptor.groups) || descriptor.groups.length === 0) {
        throw new RangeError("Sidebar must contain at least one group");
    }
    const itemIds = new Set();
    const groupIds = new Set();
    for (const group of descriptor.groups) {
        assertNonEmpty(group.id, "group id");
        if (groupIds.has(group.id))
            throw new TypeError(`Duplicate Sidebar group id: ${group.id}`);
        groupIds.add(group.id);
        if (group.label !== undefined)
            assertNonEmpty(group.label, `group ${group.id} label`);
        if (!Array.isArray(group.items) || group.items.length === 0) {
            throw new RangeError(`Sidebar group ${group.id} must contain at least one item`);
        }
        for (const item of group.items) {
            assertNonEmpty(item.id, "item id");
            assertNonEmpty(item.label, `item ${item.id} label`);
            if (itemIds.has(item.id))
                throw new TypeError(`Duplicate Sidebar item id: ${item.id}`);
            itemIds.add(item.id);
            if (item.badgeCount !== undefined && (!Number.isInteger(item.badgeCount) || item.badgeCount < 0)) {
                throw new RangeError(`Sidebar item ${item.id} badgeCount must be a non-negative integer`);
            }
        }
    }
    if (descriptor.currentId !== null && !itemIds.has(descriptor.currentId)) {
        throw new RangeError(`Sidebar currentId does not match any item: ${String(descriptor.currentId)}`);
    }
}
/**
 * 접힘은 **표시 밀도**이지 내용이 아니다. 접혀도 항목은 모두 남고 라벨만 숨는다 —
 * 접을 때 항목을 빼면 "접었더니 메뉴가 사라졌다"가 되고, 그건 다른 컴포넌트다.
 * 라벨이 숨으면 아이콘만으로는 이름을 알 수 없으므로 renderer가 접근성 이름을 유지한다.
 */
export const sidebarDefaults = {
    collapsed: false,
};
export const sidebarRecipe = {
    slots: ["root", "group", "groupLabel", "item", "label", "badge", "toggle"],
    defaults: sidebarDefaults,
    widths: { expanded: 260, collapsed: 72 },
    background: semanticColors.surface.sunken,
    border: semanticColors.border.default,
    borderWidth: stroke.default,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.xxs,
    groupGap: spacing.md,
    groupLabel: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
    },
    item: collectionItemContract,
    itemRadius: radius.md,
    itemMinHeight: control.minTouchTarget,
    states: { focus: focusIndicatorContract },
};
export const sidebarBehavior = {
    controlled: ["collapsed", "defaultCollapsed", "onCollapsedChange"],
    inputs: ["groups", "currentId", "accessibilityLabel"],
    events: ["onNavigate"],
    defaults: sidebarDefaults,
    stateAxes: {
        availability: ["enabled", "disabled"],
        value: ["selected"],
        interaction: ["idle", "hover", "focusVisible", "pressed"],
    },
    web: {
        roles: ["navigation", "list", "listitem", "link", "button"],
        keyboard: ["Tab", "Enter"],
        /** Each item is a link in document order; no roving focus and no arrow-key grid. */
        focus: "native",
    },
    /** Web-only: a phone uses BottomNavigation, and a native tablet split view is a navigator concern. */
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "the-current-item-is-announced-with-aria-current-not-only-painted",
        "collapsing-hides-labels-but-keeps-every-item-and-its-accessible-name",
        "groups-are-real-list-groupings-with-their-own-label-not-visual-dividers-only",
        "an-item-badge-stays-visible-while-collapsed-because-it-is-the-reason-to-look",
        "bottom-navigation-owns-the-three-to-five-destination-mobile-case-this-contract-never-adds-it",
        "layout-owns-where-the-sidebar-sits-this-contract-owns-what-is-inside-it",
    ],
};
//# sourceMappingURL=sidebar.js.map