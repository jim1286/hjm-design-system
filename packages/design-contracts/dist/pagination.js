import { focusIndicatorContract } from "./component-contracts.js";
import { control, opacity, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const paginationDescriptorDefaults = {
    siblingCount: 1,
    boundaryCount: 1,
};
function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 1;
}
function isNonNegativeInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
const descriptorKeys = new Set([
    "currentPage",
    "totalCount",
    "pageSize",
    "totalPages",
    "siblingCount",
    "boundaryCount",
]);
function rejectUnknownKeys(value, allowed, field) {
    for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
            throw new TypeError(`Unsupported Pagination ${field} field: ${key}`);
        }
    }
}
function resolveTotalPages(runtime) {
    const hasTotalPages = Object.prototype.hasOwnProperty.call(runtime, "totalPages");
    const hasTotalCount = Object.prototype.hasOwnProperty.call(runtime, "totalCount");
    const hasPageSize = Object.prototype.hasOwnProperty.call(runtime, "pageSize");
    if (hasTotalPages) {
        if (hasTotalCount || hasPageSize) {
            throw new TypeError("Pagination descriptor must not combine totalPages with totalCount/pageSize");
        }
        if (!isPositiveInteger(runtime.totalPages)) {
            throw new RangeError("Pagination totalPages must be a positive integer");
        }
        return runtime.totalPages;
    }
    if (!hasTotalCount || !hasPageSize) {
        throw new TypeError("Pagination descriptor requires either totalPages or totalCount with pageSize");
    }
    if (!isNonNegativeInteger(runtime.totalCount)) {
        throw new RangeError("Pagination totalCount must be a non-negative integer");
    }
    if (!isPositiveInteger(runtime.pageSize)) {
        throw new RangeError("Pagination pageSize must be a positive integer");
    }
    return Math.max(1, Math.ceil(runtime.totalCount / runtime.pageSize));
}
export function validatePaginationDescriptor(descriptor) {
    if (!isObject(descriptor)) {
        throw new TypeError("Pagination descriptor must be an object");
    }
    rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
    const runtime = descriptor;
    const totalPages = resolveTotalPages(runtime);
    if (!isPositiveInteger(runtime.currentPage)) {
        throw new RangeError("Pagination currentPage must be a positive integer");
    }
    if (runtime.currentPage > totalPages) {
        throw new RangeError(`Pagination currentPage ${String(runtime.currentPage)} exceeds totalPages ${totalPages}`);
    }
    if (runtime.siblingCount !== undefined &&
        !isNonNegativeInteger(runtime.siblingCount)) {
        throw new RangeError("Pagination siblingCount must be a non-negative integer");
    }
    if (runtime.boundaryCount !== undefined &&
        !isNonNegativeInteger(runtime.boundaryCount)) {
        throw new RangeError("Pagination boundaryCount must be a non-negative integer");
    }
}
export function validatePaginationLabels(labels) {
    if (!isObject(labels)) {
        throw new TypeError("Pagination labels must be an object");
    }
    for (const field of ["previous", "next"]) {
        const value = labels[field];
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new TypeError(`Pagination labels.${field} must not be empty`);
        }
    }
}
/**
 * Pure page-window function, independent of accessibility naming, so its
 * boundary inputs (total 1 page, total 2 pages, current at the first/last
 * page) can be locked with tests without wiring a composer. Builds the set of
 * pages that must always be visible (both boundaries + the sibling window
 * around currentPage) and inserts a single ellipsis marker for any gap larger
 * than one page — never a lone hidden page, never two consecutive ellipses.
 */
export function computePaginationItems(totalPages, currentPage, options = {}) {
    if (!isPositiveInteger(totalPages)) {
        throw new RangeError("Pagination totalPages must be a positive integer");
    }
    if (!isPositiveInteger(currentPage) || currentPage > totalPages) {
        throw new RangeError(`Pagination currentPage must be an integer between 1 and ${totalPages}`);
    }
    const siblingCount = options.siblingCount ?? paginationDescriptorDefaults.siblingCount;
    const boundaryCount = options.boundaryCount ?? paginationDescriptorDefaults.boundaryCount;
    if (!isNonNegativeInteger(siblingCount)) {
        throw new RangeError("Pagination siblingCount must be a non-negative integer");
    }
    if (!isNonNegativeInteger(boundaryCount)) {
        throw new RangeError("Pagination boundaryCount must be a non-negative integer");
    }
    const shown = new Set();
    for (let page = 1; page <= Math.min(boundaryCount, totalPages); page += 1) {
        shown.add(page);
    }
    for (let page = Math.max(1, totalPages - boundaryCount + 1); page <= totalPages; page += 1) {
        shown.add(page);
    }
    for (let page = Math.max(1, currentPage - siblingCount); page <= Math.min(totalPages, currentPage + siblingCount); page += 1) {
        shown.add(page);
    }
    const sortedPages = [...shown].sort((a, b) => a - b);
    const items = [];
    let previousPage = null;
    for (const page of sortedPages) {
        if (previousPage !== null) {
            const gap = page - previousPage;
            // A gap of exactly 2 hides a single page — showing that number costs no
            // more space than "..." and is more useful, so ellipsis is reserved for
            // two or more genuinely hidden pages.
            if (gap === 2) {
                items.push({ type: "page", page: previousPage + 1 });
            }
            else if (gap > 2) {
                items.push({ type: "ellipsis" });
            }
        }
        items.push({ type: "page", page });
        previousPage = page;
    }
    return items;
}
/**
 * Attaches per-button accessible names and current-page derivation on top of
 * computePaginationItems. Ellipsis items intentionally carry no
 * accessibleName — they are decoration ("..."), not content, and must be
 * `aria-hidden`/excluded from the announcement.
 */
export function resolvePaginationDescriptor(descriptor, options) {
    validatePaginationDescriptor(descriptor);
    validatePaginationLabels(options.labels);
    if (typeof options.composeAccessibleName !== "function") {
        throw new TypeError("Pagination composeAccessibleName must be a function");
    }
    const runtime = descriptor;
    const totalPages = resolveTotalPages(runtime);
    const currentPage = descriptor.currentPage;
    const rawItems = computePaginationItems(totalPages, currentPage, {
        siblingCount: descriptor.siblingCount ?? paginationDescriptorDefaults.siblingCount,
        boundaryCount: descriptor.boundaryCount ?? paginationDescriptorDefaults.boundaryCount,
    });
    const items = rawItems.map((item) => {
        if (item.type === "ellipsis")
            return item;
        const current = item.page === currentPage;
        const accessibleName = options.composeAccessibleName({
            page: item.page,
            totalPages,
            current,
        });
        if (typeof accessibleName !== "string" || accessibleName.trim().length === 0) {
            throw new TypeError("Pagination composeAccessibleName must return a non-empty string");
        }
        return { type: "page", page: item.page, current, accessibleName };
    });
    return {
        currentPage,
        totalPages,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages,
        labels: options.labels,
        items,
    };
}
/**
 * Visual recipe only covers chrome (size, gap, focus, current-item tone).
 * Following identity.md's "primary fill은 주요 행동에, contentBrand는 ...
 * 현재 위치에" rule and Steps' own current-step treatment
 * (stepsRecipe.indicator: border + content color, no background fill), the
 * current page is marked with a `border.focus`/`content.brand` outline, not a
 * filled `action.brand` pill — a page number is a location, not a command.
 */
export const paginationRecipe = {
    slots: ["root", "item", "ellipsis", "previous", "next"],
    gap: spacing.xxs,
    item: {
        minSize: control.minTouchTarget,
        radius: "md",
        color: {
            default: semanticColors.content.body,
            current: semanticColors.content.brand,
        },
        background: { hover: semanticColors.interaction.hover },
        border: { current: semanticColors.border.focus },
    },
    ellipsis: {
        color: semanticColors.content.secondary,
        icon: "more",
    },
    navIcon: { previous: "chevronStart", next: "chevronEnd" },
    focus: focusIndicatorContract,
    states: { disabledOpacity: opacity.disabled },
};
/**
 * Literal scenario names for behaviorRegistry.pagination (lead wires into
 * src/behaviors.ts).
 */
export const paginationBehaviorScenarios = [
    "current-page-marked-and-announced-without-a-composed-live-region-spam",
    "ellipsis-is-decorative-and-excluded-from-the-accessible-tree",
    "previous-disabled-on-first-page-next-disabled-on-last-page",
    "single-page-renders-no-ellipsis-and-no-disabled-dead-buttons",
    "page-window-never-produces-two-consecutive-ellipses",
    "nav-landmark-present-with-a-localized-accessible-name",
];
//# sourceMappingURL=pagination.js.map