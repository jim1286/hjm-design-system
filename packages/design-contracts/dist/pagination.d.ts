/**
 * Web-only by roadmap decision, not an oversight: "Native 긴 목록에는 페이지
 * 번호보다 LoadMore/infinite loading을 사용한다" (docs/load-more.md). Numbered
 * pages assume a stable total and a pointing device/keyboard that can jump
 * around; a touch list scrolling through hundreds of rows has neither. The two
 * contracts do not need to know about each other — LoadMore never becomes
 * Pagination and vice versa — but a product choosing between them should pick
 * Pagination for a bounded, page-addressable result set (search results,
 * admin tables) and LoadMore for an open-ended feed the user just keeps
 * scrolling.
 */
export type PaginationByCount = Readonly<{
    currentPage: number;
    totalCount: number;
    pageSize: number;
    totalPages?: never;
    siblingCount?: number;
    boundaryCount?: number;
}>;
export type PaginationByPageCount = Readonly<{
    currentPage: number;
    totalPages: number;
    totalCount?: never;
    pageSize?: never;
    siblingCount?: number;
    boundaryCount?: number;
}>;
/**
 * Required contract is exactly current page + (total count or total page
 * count) + page size — nothing else. A page-size changer and a "jump to page"
 * input are intentionally absent: neither has measured product demand, and
 * both add a second way to reach the same currentPage/totalPages state this
 * module already owns. If a product needs them, they compose as separate
 * controls that call the same onPageChange — they are not missing API surface
 * here, they are a deliberate exclusion (see docs/pagination.md).
 */
export type PaginationDescriptor = PaginationByCount | PaginationByPageCount;
export type PaginationLabels = Readonly<{
    previous: string;
    next: string;
}>;
export declare const paginationDescriptorDefaults: {
    readonly siblingCount: 1;
    readonly boundaryCount: 1;
};
export type PaginationItem = Readonly<{
    type: "page";
    page: number;
}> | Readonly<{
    type: "ellipsis";
}>;
export type PaginationWindowOptions = Readonly<{
    siblingCount?: number;
    boundaryCount?: number;
}>;
export type PaginationAccessibleNameInfo = Readonly<{
    page: number;
    totalPages: number;
    current: boolean;
}>;
/**
 * Products own the exact phrase order, same reason as Steps'
 * composeAccessibleName: Korean "5 페이지 중 3 페이지" and an English "page 3
 * of 5" have different word order, and every page button gets its own
 * composed name (not just a landmark summary) because ellipsis gaps mean a
 * bare visible number ("7") does not by itself convey how many pages exist.
 */
export type ComposePaginationAccessibleName = (info: PaginationAccessibleNameInfo) => string;
export type ResolvedPaginationItem = Readonly<{
    type: "page";
    page: number;
    current: boolean;
    accessibleName: string;
}> | Readonly<{
    type: "ellipsis";
}>;
export type ResolvedPaginationDescriptor = Readonly<{
    currentPage: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    labels: PaginationLabels;
    items: readonly ResolvedPaginationItem[];
}>;
export type ResolvePaginationOptions = Readonly<{
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
}>;
/** Why a page change was requested — analytics and controllers key off this, not the target page alone. */
export type PaginationChangeReason = "previous" | "next" | "page";
export type PaginationChangeHandler = (page: number, reason: PaginationChangeReason) => void;
export declare function validatePaginationDescriptor(descriptor: PaginationDescriptor): void;
export declare function validatePaginationLabels(labels: PaginationLabels): void;
/**
 * Pure page-window function, independent of accessibility naming, so its
 * boundary inputs (total 1 page, total 2 pages, current at the first/last
 * page) can be locked with tests without wiring a composer. Builds the set of
 * pages that must always be visible (both boundaries + the sibling window
 * around currentPage) and inserts a single ellipsis marker for any gap larger
 * than one page — never a lone hidden page, never two consecutive ellipses.
 */
export declare function computePaginationItems(totalPages: number, currentPage: number, options?: PaginationWindowOptions): readonly PaginationItem[];
/**
 * Attaches per-button accessible names and current-page derivation on top of
 * computePaginationItems. Ellipsis items intentionally carry no
 * accessibleName — they are decoration ("..."), not content, and must be
 * `aria-hidden`/excluded from the announcement.
 */
export declare function resolvePaginationDescriptor(descriptor: PaginationDescriptor, options: ResolvePaginationOptions): ResolvedPaginationDescriptor;
/**
 * Visual recipe only covers chrome (size, gap, focus, current-item tone).
 * Following identity.md's "primary fill은 주요 행동에, contentBrand는 ...
 * 현재 위치에" rule and Steps' own current-step treatment
 * (stepsRecipe.indicator: border + content color, no background fill), the
 * current page is marked with a `border.focus`/`content.brand` outline, not a
 * filled `action.brand` pill — a page number is a location, not a command.
 */
export declare const paginationRecipe: {
    readonly slots: readonly ["root", "item", "ellipsis", "previous", "next"];
    readonly gap: 4;
    readonly item: {
        readonly minSize: 44;
        readonly radius: "md";
        readonly color: {
            readonly default: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly current: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly background: {
            readonly hover: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly border: {
            readonly current: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
    };
    readonly ellipsis: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly icon: "more";
    };
    readonly navIcon: {
        readonly previous: "chevronStart";
        readonly next: "chevronEnd";
    };
    readonly focus: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly width: 2;
        readonly offset: 2;
    };
    readonly states: {
        readonly disabledOpacity: 0.5;
    };
};
/**
 * Literal scenario names for behaviorRegistry.pagination (lead wires into
 * src/behaviors.ts).
 */
export declare const paginationBehaviorScenarios: readonly ["current-page-marked-and-announced-without-a-composed-live-region-spam", "ellipsis-is-decorative-and-excluded-from-the-accessible-tree", "previous-disabled-on-first-page-next-disabled-on-last-page", "single-page-renders-no-ellipsis-and-no-disabled-dead-buttons", "page-window-never-produces-two-consecutive-ellipses", "nav-landmark-present-with-a-localized-accessible-name"];
//# sourceMappingURL=pagination.d.ts.map