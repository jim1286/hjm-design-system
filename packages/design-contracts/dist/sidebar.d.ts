import type { LinkDestination } from "./link.js";
/**
 * 데스크톱 웹의 세로 내비게이션. 관리자 화면·문서·작업 도구처럼 넓은 화면에서 좌우로
 * 나뉜 셸의 왼쪽이다.
 *
 * `BottomNavigation`과 같은 문제를 푸는 다른 표면이 아니다 — 두 축이 다르다.
 * BottomNavigation은 **3~5개 최상위 목적지**를 모바일 하단에 고정하고 그룹이 없다.
 * Sidebar는 **그룹이 있는 긴 목록**이고 접힌다. 한 컴포넌트의 `orientation` 축으로
 * 합치면 "그룹이 있는 하단 탭바"라는 존재하지 않는 조합이 타입에 생긴다.
 *
 * `Layout`의 sidebar 영역과도 다르다. Layout은 **자리**(폭·순서·반응형 규칙)를 갖고
 * 내용을 모른다. 이 계약은 그 자리에 들어가는 **내비게이션 자체**다.
 */
export type SidebarItemDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
    destination?: LinkDestination;
    /** 접힌 상태에서도 보이는 상태 수치. Badge/CounterBadge가 그린다. */
    badgeCount?: number;
    disabled?: boolean;
}>;
export type SidebarGroupDescriptor<Id extends string = string, GroupId extends string = string> = Readonly<{
    id: GroupId;
    /** 그룹 제목. 없으면 구분선만 있는 묶음이다. */
    label?: string;
    items: readonly SidebarItemDescriptor<Id>[];
}>;
export type SidebarDescriptor<Id extends string = string, GroupId extends string = string> = Readonly<{
    accessibilityLabel: string;
    groups: readonly SidebarGroupDescriptor<Id, GroupId>[];
    /** 현재 위치. 링크 내비게이션의 `aria-current`가 된다. */
    currentId: Id | null;
}>;
export declare function validateSidebarDescriptor<Id extends string, GroupId extends string>(descriptor: SidebarDescriptor<Id, GroupId>): void;
/**
 * 접힘은 **표시 밀도**이지 내용이 아니다. 접혀도 항목은 모두 남고 라벨만 숨는다 —
 * 접을 때 항목을 빼면 "접었더니 메뉴가 사라졌다"가 되고, 그건 다른 컴포넌트다.
 * 라벨이 숨으면 아이콘만으로는 이름을 알 수 없으므로 renderer가 접근성 이름을 유지한다.
 */
export declare const sidebarDefaults: {
    readonly collapsed: false;
};
export declare const sidebarRecipe: {
    readonly slots: readonly ["root", "group", "groupLabel", "item", "label", "badge", "toggle"];
    readonly defaults: {
        readonly collapsed: false;
    };
    readonly widths: {
        readonly expanded: 260;
        readonly collapsed: 72;
    };
    readonly background: Readonly<{
        source: "theme";
        key: "surfaceAlt";
        alpha?: number;
    }>;
    readonly border: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly borderWidth: 1;
    readonly paddingVertical: 12;
    readonly paddingHorizontal: 8;
    readonly gap: 4;
    readonly groupGap: 16;
    readonly groupLabel: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly paddingHorizontal: 12;
        readonly paddingVertical: 4;
    };
    readonly item: {
        readonly minHeight: 44;
        readonly paddingHorizontal: 12;
        readonly gap: 12;
        readonly radius: "md";
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly highlightedBackground: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly selectedIndicator: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly itemRadius: 12;
    readonly itemMinHeight: 44;
    readonly states: {
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
};
export declare const sidebarBehavior: {
    readonly controlled: readonly ["collapsed", "defaultCollapsed", "onCollapsedChange"];
    readonly inputs: readonly ["groups", "currentId", "accessibilityLabel"];
    readonly events: readonly ["onNavigate"];
    readonly defaults: {
        readonly collapsed: false;
    };
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["selected"];
        readonly interaction: readonly ["idle", "hover", "focusVisible", "pressed"];
    };
    readonly web: {
        readonly roles: readonly ["navigation", "list", "listitem", "link", "button"];
        readonly keyboard: readonly ["Tab", "Enter"];
        /** Each item is a link in document order; no roving focus and no arrow-key grid. */
        readonly focus: "native";
    };
    /** Web-only: a phone uses BottomNavigation, and a native tablet split view is a navigator concern. */
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["the-current-item-is-announced-with-aria-current-not-only-painted", "collapsing-hides-labels-but-keeps-every-item-and-its-accessible-name", "groups-are-real-list-groupings-with-their-own-label-not-visual-dividers-only", "an-item-badge-stays-visible-while-collapsed-because-it-is-the-reason-to-look", "bottom-navigation-owns-the-three-to-five-destination-mobile-case-this-contract-never-adds-it", "layout-owns-where-the-sidebar-sits-this-contract-owns-what-is-inside-it"];
};
//# sourceMappingURL=sidebar.d.ts.map