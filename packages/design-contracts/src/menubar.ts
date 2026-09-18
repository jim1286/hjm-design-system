import type { BehaviorContract, MenuItemDescriptor } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { control, radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

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
export type MenubarMenuDescriptor<
  Key extends string = string,
  MenuKey extends string = string,
> = Readonly<{
  id: MenuKey;
  label: string;
  items: readonly MenuItemDescriptor<Key>[];
  disabled?: boolean;
}>;

export type MenubarDescriptor<
  Key extends string = string,
  MenuKey extends string = string,
> = Readonly<{
  accessibilityLabel: string;
  menus: readonly MenubarMenuDescriptor<Key, MenuKey>[];
}>;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Menubar ${field} must not be empty`);
  }
}

export function validateMenubarDescriptor<Key extends string, MenuKey extends string>(
  descriptor: MenubarDescriptor<Key, MenuKey>,
): void {
  assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
  if (!Array.isArray(descriptor.menus) || descriptor.menus.length === 0) {
    throw new RangeError("Menubar must contain at least one menu");
  }
  const menuIds = new Set<MenuKey>();
  for (const menu of descriptor.menus) {
    assertNonEmpty(menu.id, "menu id");
    assertNonEmpty(menu.label, `menu ${menu.id} label`);
    if (menuIds.has(menu.id)) throw new TypeError(`Duplicate Menubar menu id: ${menu.id}`);
    menuIds.add(menu.id);
    if (!Array.isArray(menu.items) || menu.items.length === 0) {
      throw new RangeError(`Menubar menu ${menu.id} must contain at least one item`);
    }
  }
}

/**
 * 좌우 이동은 **비활성 메뉴를 건너뛰고 순환**한다. 막대 끝에서 멈추면 사용자가 방향을
 * 바꿔 되돌아와야 하는데, 항목이 대여섯 개뿐인 가로 막대에서는 순환이 더 짧다.
 */
export function resolveMenubarNavigation<Key extends string, MenuKey extends string>(
  descriptor: MenubarDescriptor<Key, MenuKey>,
  currentId: MenuKey,
  direction: "next" | "previous",
): MenuKey {
  validateMenubarDescriptor(descriptor);
  const enabled = descriptor.menus.filter((menu) => menu.disabled !== true);
  if (enabled.length === 0) return currentId;
  const index = enabled.findIndex((menu) => menu.id === currentId);
  if (index === -1) return enabled[0]!.id;
  const next = direction === "next" ? index + 1 : index - 1;
  return enabled[(next + enabled.length) % enabled.length]!.id;
}

export const menubarRecipe = {
  slots: ["root", "menu", "label", "panel", "item"] as const,
  minHeight: control.minTouchTarget,
  gap: spacing.xxs,
  paddingHorizontal: spacing.xs,
  label: {
    paddingHorizontal: spacing.sm,
    radius: radius.sm,
    color: semanticColors.content.body,
    openBackground: semanticColors.interaction.selected,
  },
  item: collectionItemContract,
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly ["root", "menu", "label", "panel", "item"];
  minHeight: number;
  gap: number;
  paddingHorizontal: number;
  label: { paddingHorizontal: number; radius: number; color: ColorReference; openBackground: ColorReference };
  item: typeof collectionItemContract;
  states: { focus: typeof focusIndicatorContract };
};

export const menubarBehavior = {
  controlled: ["openMenuId", "defaultOpenMenuId", "onOpenMenuIdChange"],
  inputs: ["menus", "accessibilityLabel"],
  events: ["onAction"],
  stateAxes: {
    availability: ["enabled", "disabled"],
    value: ["open", "closed"],
    interaction: ["idle", "hover", "focusVisible"],
  },
  web: {
    roles: ["menubar", "menuitem", "menu"],
    keyboard: ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Home", "End", "Enter", "Space", "Escape"],
    focus: "roving",
    dismiss: ["escape", "outside"],
  },
  /** Web-only: a phone has no always-present menu bar, and a native app bar is the OS's. */
  native: { roles: [], states: [], actions: [] },
  scenarios: [
    "left-and-right-move-between-menus-while-one-is-open-instead-of-closing-and-reopening",
    "exactly-one-menu-is-open-at-a-time-which-three-independent-menus-cannot-guarantee",
    "disabled-menus-are-skipped-by-navigation-and-cycling-is-shorter-than-stopping-at-the-end",
    "the-bar-is-a-single-tab-stop-with-roving-focus-not-one-stop-per-menu",
    "activating-an-item-runs-an-action-and-leaves-nothing-selected-unlike-tabs",
  ],
} as const satisfies BehaviorContract;
