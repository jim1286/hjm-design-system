import { type LinkDestination } from "./link.js";
/**
 * Every ancestor crumb is a destination; the final crumb is the current page
 * and never carries one. Position decides which crumb is current, so the
 * discriminant is enforced by `validateBreadcrumbDescriptor`, not the type.
 */
export type BreadcrumbItemDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
    destination?: LinkDestination;
}>;
export type BreadcrumbDescriptor<Id extends string = string> = Readonly<{
    items: readonly BreadcrumbItemDescriptor<Id>[];
}>;
export type ResolvedBreadcrumbItemDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
    current: false;
    destination: LinkDestination;
}> | Readonly<{
    id: Id;
    label: string;
    current: true;
}>;
export type ResolvedBreadcrumbDescriptor<Id extends string = string> = Readonly<{
    items: readonly ResolvedBreadcrumbItemDescriptor<Id>[];
}>;
export declare function validateBreadcrumbDescriptor<Id extends string>(descriptor: BreadcrumbDescriptor<Id>): void;
export declare function resolveBreadcrumbDescriptor<Id extends string>(descriptor: BreadcrumbDescriptor<Id>): ResolvedBreadcrumbDescriptor<Id>;
/**
 * Crumbs read as an inline trail, not standalone buttons, so this mirrors
 * Link's inline treatment (underline + focus indicator, no forced 44-unit
 * row height) rather than the collection-item or field-frame grammar.
 */
export declare const breadcrumbRecipe: {
    readonly slots: readonly ["root", "list", "item", "link", "current", "separator"];
    readonly gap: 4;
    readonly link: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
    readonly current: {
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly fontWeight: "600";
    };
    readonly separator: {
        readonly color: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly glyph: "xs";
        readonly icon: "chevronEnd";
        readonly decorative: true;
    };
};
/**
 * Native has no equivalent surface: the platform back gesture and TopBar
 * title already own "where am I / how do I go back". `web.roles` layers a
 * `navigation` landmark and `list`/`listitem` grouping on top of the plain
 * `link` behavior each ancestor crumb already gets from `Link`.
 */
export declare const breadcrumbBehaviorSpec: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["items"];
    readonly stateAxes: {};
    readonly web: {
        readonly roles: readonly ["navigation", "list", "listitem", "link"];
        readonly keyboard: readonly ["Tab", "Enter"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["only-the-last-item-is-current-and-has-no-destination", "every-ancestor-item-reuses-the-link-destination-contract", "current-item-is-marked-aria-current-page-and-is-not-a-tab-stop", "separators-are-decorative-and-excluded-from-the-accessibility-tree", "duplicate-or-empty-item-identity-is-rejected-before-render", "no-automatic-truncation-collapses-items"];
};
//# sourceMappingURL=breadcrumb.d.ts.map