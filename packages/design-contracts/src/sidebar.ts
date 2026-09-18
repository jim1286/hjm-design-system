import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import type { LinkDestination } from "./link.js";
import { control, radius, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

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

export type SidebarGroupDescriptor<
  Id extends string = string,
  GroupId extends string = string,
> = Readonly<{
  id: GroupId;
  /** 그룹 제목. 없으면 구분선만 있는 묶음이다. */
  label?: string;
  items: readonly SidebarItemDescriptor<Id>[];
}>;

export type SidebarDescriptor<
  Id extends string = string,
  GroupId extends string = string,
> = Readonly<{
  accessibilityLabel: string;
  groups: readonly SidebarGroupDescriptor<Id, GroupId>[];
  /** 현재 위치. 링크 내비게이션의 `aria-current`가 된다. */
  currentId: Id | null;
}>;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Sidebar ${field} must not be empty`);
  }
}

export function validateSidebarDescriptor<Id extends string, GroupId extends string>(
  descriptor: SidebarDescriptor<Id, GroupId>,
): void {
  assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
  if (!Array.isArray(descriptor.groups) || descriptor.groups.length === 0) {
    throw new RangeError("Sidebar must contain at least one group");
  }
  const itemIds = new Set<Id>();
  const groupIds = new Set<GroupId>();
  for (const group of descriptor.groups) {
    assertNonEmpty(group.id, "group id");
    if (groupIds.has(group.id)) throw new TypeError(`Duplicate Sidebar group id: ${group.id}`);
    groupIds.add(group.id);
    if (group.label !== undefined) assertNonEmpty(group.label, `group ${group.id} label`);
    if (!Array.isArray(group.items) || group.items.length === 0) {
      throw new RangeError(`Sidebar group ${group.id} must contain at least one item`);
    }
    for (const item of group.items) {
      assertNonEmpty(item.id, "item id");
      assertNonEmpty(item.label, `item ${item.id} label`);
      if (itemIds.has(item.id)) throw new TypeError(`Duplicate Sidebar item id: ${item.id}`);
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
} as const satisfies Readonly<{ collapsed: boolean }>;

export const sidebarRecipe = {
  slots: ["root", "group", "groupLabel", "item", "label", "badge", "toggle"] as const,
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
    textVariant: "label" as const,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  item: collectionItemContract,
  itemRadius: radius.md,
  itemMinHeight: control.minTouchTarget,
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly ["root", "group", "groupLabel", "item", "label", "badge", "toggle"];
  defaults: { collapsed: boolean };
  widths: { expanded: number; collapsed: number };
  background: ColorReference;
  border: ColorReference;
  borderWidth: number;
  paddingVertical: number;
  paddingHorizontal: number;
  gap: number;
  groupGap: number;
  groupLabel: { color: ColorReference; textVariant: "label"; paddingHorizontal: number; paddingVertical: number };
  item: typeof collectionItemContract;
  itemRadius: number;
  itemMinHeight: number;
  states: { focus: typeof focusIndicatorContract };
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
} as const satisfies BehaviorContract;
