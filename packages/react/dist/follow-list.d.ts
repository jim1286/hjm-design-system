import { type ReactNode } from "react";
import { type ScreenLayoutProps } from "./screens.js";
import { type ListRowProps } from "./display.js";
export type FollowListPerson = Readonly<{
    id: string;
    username: string;
    name?: string;
    avatar?: ReactNode;
    following: boolean;
    disabled?: boolean;
    /** Hide for self/unknown relationships; products decide permission and ownership. */
    showFollow?: boolean;
    followLabel?: string;
    followAccessibilityLabel?: string;
    /** Product-owned extra action, such as confirmed removal from my followers. */
    action?: ReactNode;
    /** A confirmed relationship can offer messaging without toggling follow. */
    message?: Readonly<{
        label: string;
        accessibilityLabel?: string;
        onPress(): void;
    }>;
    href?: string;
    renderLink?: ListRowProps["renderLink"];
}>;
export type FollowListScreenProps = Omit<ScreenLayoutProps, "children" | "notice" | "contentInset"> & Readonly<{
    tab: "followers" | "following";
    /** Complete localized tab labels, including server-confirmed counts. */
    labels: Readonly<{
        followers: string;
        following: string;
        tabs: string;
        search: string;
        clearSearch: string;
        searching: string;
        empty: string;
        follow: string;
        followed: string;
        pending: string;
        failed: string;
    }>;
    people: readonly FollowListPerson[];
    query: string;
    notice?: ReactNode;
    /** Product sorting and search controls, between tabs and the optional search field. */
    toolbar?: ReactNode;
    searchVisible?: boolean;
    /** Virtualized hosts use scroll="content" and retain HJM's row layout and action scope. */
    renderPeople?: (people: readonly FollowListPerson[], renderPerson: (person: FollowListPerson) => ReactNode) => ReactNode;
    onTabChange(tab: "followers" | "following"): void;
    onQueryChange(query: string): void;
    onOpenProfile(id: string): void;
    /** Resolve after updating people with the server-confirmed state; reject on failure. */
    onFollowChange(id: string, following: boolean): void | Promise<void>;
}>;
/** Products own queries, pagination, permissions and mutations. HJM owns the two-tab people layout. */
export declare function FollowListScreen({ tab, labels, people, query, onTabChange, onQueryChange, onOpenProfile, onFollowChange, state, notice, toolbar, searchVisible, renderPeople, ...screen }: FollowListScreenProps): import("react").JSX.Element;
//# sourceMappingURL=follow-list.d.ts.map