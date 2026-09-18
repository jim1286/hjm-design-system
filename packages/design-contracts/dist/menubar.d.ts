import type { MenuItemDescriptor } from "./behaviors.js";
/**
 * 데스크톱 앱의 가로 메뉴 막대 — 파일·편집·보기처럼 항상 같은 자리에 있는 메뉴들.
 *
 * `Menu` 여러 개를 나란히 놓는 것과 다르다. 막대는 **하나의 키보드 단위**다: 메뉴가
 * 열린 상태에서 좌우 방향키를 누르면 옆 메뉴로 **넘어가고**(닫았다 여는 것이 아니라),
 * 한 번에 하나만 열린다. 독립된 Menu 세 개로는 그 이동이 성립하지 않는다.
 *
 * `Tabs`와도 다르다. Tabs는 화면을 바꾸고 선택 상태가 남는다. Menubar는 행동을 실행하고
 * 아무것도 선택되지 않은 상태로 돌아간다.
 */
export type MenubarMenuDescriptor<Key extends string = string, MenuKey extends string = string> = Readonly<{
    id: MenuKey;
    label: string;
    items: readonly MenuItemDescriptor<Key>[];
    disabled?: boolean;
}>;
export type MenubarDescriptor<Key extends string = string, MenuKey extends string = string> = Readonly<{
    accessibilityLabel: string;
    menus: readonly MenubarMenuDescriptor<Key, MenuKey>[];
}>;
export declare function validateMenubarDescriptor<Key extends string, MenuKey extends string>(descriptor: MenubarDescriptor<Key, MenuKey>): void;
/**
 * 좌우 이동은 **비활성 메뉴를 건너뛰고 순환**한다. 막대 끝에서 멈추면 사용자가 방향을
 * 바꿔 되돌아와야 하는데, 항목이 대여섯 개뿐인 가로 막대에서는 순환이 더 짧다.
 */
export declare function resolveMenubarNavigation<Key extends string, MenuKey extends string>(descriptor: MenubarDescriptor<Key, MenuKey>, currentId: MenuKey, direction: "next" | "previous"): MenuKey;
export declare const menubarRecipe: {
    readonly slots: readonly ["root", "menu", "label", "panel", "item"];
    readonly minHeight: 44;
    readonly gap: 4;
    readonly paddingHorizontal: 8;
    readonly label: {
        readonly paddingHorizontal: 12;
        readonly radius: 8;
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly openBackground: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
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
export declare const menubarBehavior: {
    readonly controlled: readonly ["openMenuId", "defaultOpenMenuId", "onOpenMenuIdChange"];
    readonly inputs: readonly ["menus", "accessibilityLabel"];
    readonly events: readonly ["onAction"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["open", "closed"];
        readonly interaction: readonly ["idle", "hover", "focusVisible"];
    };
    readonly web: {
        readonly roles: readonly ["menubar", "menuitem", "menu"];
        readonly keyboard: readonly ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Home", "End", "Enter", "Space", "Escape"];
        readonly focus: "roving";
        readonly dismiss: readonly ["escape", "outside"];
    };
    /** Web-only: a phone has no always-present menu bar, and a native app bar is the OS's. */
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["left-and-right-move-between-menus-while-one-is-open-instead-of-closing-and-reopening", "exactly-one-menu-is-open-at-a-time-which-three-independent-menus-cannot-guarantee", "disabled-menus-are-skipped-by-navigation-and-cycling-is-shorter-than-stopping-at-the-end", "the-bar-is-a-single-tab-stop-with-roving-focus-not-one-stop-per-menu", "activating-an-item-runs-an-action-and-leaves-nothing-selected-unlike-tabs"];
};
//# sourceMappingURL=menubar.d.ts.map