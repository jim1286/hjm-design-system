import { validateLinkDestination } from "./link.js";
import { spacing } from "./foundations.js";
import { focusIndicatorContract } from "./component-contracts.js";
import { semanticColors } from "./semantic-colors.js";
function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Breadcrumb ${field} must not be empty`);
    }
}
export function validateBreadcrumbDescriptor(descriptor) {
    if (descriptor.items.length === 0) {
        throw new RangeError("Breadcrumb must contain at least one item");
    }
    const ids = new Set();
    const lastIndex = descriptor.items.length - 1;
    descriptor.items.forEach((item, index) => {
        assertCopy(item.id, "id");
        if (ids.has(item.id)) {
            throw new TypeError(`Duplicate Breadcrumb id: ${item.id}`);
        }
        ids.add(item.id);
        assertCopy(item.label, "label");
        if (index === lastIndex) {
            if (item.destination !== undefined) {
                throw new TypeError(`Current Breadcrumb item ${item.id} must not have a destination`);
            }
            return;
        }
        if (item.destination === undefined) {
            throw new TypeError(`Breadcrumb item ${item.id} needs a destination`);
        }
        validateLinkDestination(item.destination);
    });
}
export function resolveBreadcrumbDescriptor(descriptor) {
    validateBreadcrumbDescriptor(descriptor);
    const lastIndex = descriptor.items.length - 1;
    return {
        items: descriptor.items.map((item, index) => index === lastIndex
            ? { id: item.id, label: item.label, current: true }
            : {
                id: item.id,
                label: item.label,
                current: false,
                destination: item.destination,
            }),
    };
}
/**
 * Crumbs read as an inline trail, not standalone buttons, so this mirrors
 * Link's inline treatment (underline + focus indicator, no forced 44-unit
 * row height) rather than the collection-item or field-frame grammar.
 */
export const breadcrumbRecipe = {
    slots: ["root", "list", "item", "link", "current", "separator"],
    gap: spacing.xxs,
    link: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        focus: focusIndicatorContract,
    },
    current: {
        color: semanticColors.content.primary,
        textVariant: "label",
        fontWeight: "600",
    },
    separator: {
        color: semanticColors.content.decorative,
        glyph: "xs",
        icon: "chevronEnd",
        decorative: true,
    },
};
/**
 * Native has no equivalent surface: the platform back gesture and TopBar
 * title already own "where am I / how do I go back". `web.roles` layers a
 * `navigation` landmark and `list`/`listitem` grouping on top of the plain
 * `link` behavior each ancestor crumb already gets from `Link`.
 */
export const breadcrumbBehaviorSpec = {
    controlled: [],
    inputs: ["items"],
    stateAxes: {},
    web: {
        roles: ["navigation", "list", "listitem", "link"],
        keyboard: ["Tab", "Enter"],
        focus: "native",
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "only-the-last-item-is-current-and-has-no-destination",
        "every-ancestor-item-reuses-the-link-destination-contract",
        "current-item-is-marked-aria-current-page-and-is-not-a-tab-stop",
        "separators-are-decorative-and-excluded-from-the-accessibility-tree",
        "duplicate-or-empty-item-identity-is-rejected-before-render",
        "no-automatic-truncation-collapses-items",
    ],
};
//# sourceMappingURL=breadcrumb.js.map