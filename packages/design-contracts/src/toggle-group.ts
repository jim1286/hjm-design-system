import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { control, radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import {
  reconcileCheckboxSelection,
  toggleCheckboxSelection,
  type CheckboxSelectionItem,
} from "./selection-helpers.js";

/**
 * 여러 개를 동시에 켜고 끄는 버튼 묶음이다 — 굵게/기울임/밑줄, 필터 칩 여러 개처럼.
 *
 * `SegmentedControl`과 경계가 분명하다. Segmented는 **하나를 고른다**(어떤 화면을 볼지),
 * ToggleGroup은 **여러 개를 켠다**(무엇을 적용할지). 그래서 Segmented에는 "선택 없음"이
 * 없고 ToggleGroup에는 있다. 둘을 한 컴포넌트의 `mode` 축으로 합치면 그 차이가 사라지고,
 * "아무것도 선택되지 않은 Segmented"라는 표현 불가능한 상태가 타입에 생긴다.
 *
 * `CheckboxGroup`과도 다르다. CheckboxGroup은 목록 안의 동의/선택이라 각 항목이 자기
 * 줄과 설명을 갖는다. ToggleGroup은 도구 모음이라 한 줄에 붙어 있고 라벨이 짧다.
 * 판정(무엇을 켤 수 있고 비활성은 어떻게 되는가)은 같은 helper를 공유한다.
 */
export type ToggleGroupItemDescriptor<Id extends string = string> =
  CheckboxSelectionItem<Id>;

export type ToggleGroupDescriptor<Id extends string = string> = Readonly<{
  /** 묶음 전체의 접근성 이름. 개별 버튼 이름으로 대체할 수 없다. */
  accessibilityLabel: string;
  items: readonly ToggleGroupItemDescriptor<Id>[];
}>;

export type ToggleGroupSize = "small" | "medium";

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`ToggleGroup ${field} must not be empty`);
  }
}

export function validateToggleGroupDescriptor<Id extends string>(
  descriptor: ToggleGroupDescriptor<Id>,
): void {
  assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
  if (!Array.isArray(descriptor.items) || descriptor.items.length === 0) {
    throw new RangeError("ToggleGroup must contain at least one item");
  }
  const ids = new Set<Id>();
  for (const item of descriptor.items) {
    assertNonEmpty(item.id, "item id");
    assertNonEmpty(item.label, "item label");
    if (ids.has(item.id)) throw new TypeError(`Duplicate ToggleGroup item id: ${item.id}`);
    ids.add(item.id);
  }
}

/** 하나를 켜고 끈다. 비활성 보호는 공용 helper가 이미 갖고 있다. */
export function toggleGroupSelection<Id extends string>(
  descriptor: ToggleGroupDescriptor<Id>,
  pressedIds: ReadonlySet<Id>,
  id: Id,
): ReadonlySet<Id> {
  validateToggleGroupDescriptor(descriptor);
  return toggleCheckboxSelection(descriptor.items, pressedIds, id);
}

/** 목록에서 사라진 항목의 눌림 상태는 남기지 않는다. */
export function reconcileToggleGroupSelection<Id extends string>(
  descriptor: ToggleGroupDescriptor<Id>,
  pressedIds: ReadonlySet<Id>,
): ReadonlySet<Id> {
  validateToggleGroupDescriptor(descriptor);
  return reconcileCheckboxSelection(descriptor.items, pressedIds);
}

export const toggleGroupRecipe = {
  slots: ["root", "item", "label"] as const,
  defaults: { size: "medium" as ToggleGroupSize },
  sizes: {
    small: { minHeight: control.minTouchTarget, paddingHorizontal: spacing.sm, textVariant: "label" as const },
    medium: { minHeight: 44, paddingHorizontal: spacing.md, textVariant: "body" as const },
  },
  radius: radius.md,
  gap: spacing.xxs,
  idle: {
    background: semanticColors.surface.default,
    color: semanticColors.content.body,
    border: semanticColors.border.control,
  },
  pressed: {
    background: collectionItemContract.selectedBackground,
    color: semanticColors.content.brand,
    border: semanticColors.border.focus,
  },
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly ["root", "item", "label"];
  defaults: { size: ToggleGroupSize };
  sizes: Record<ToggleGroupSize, { minHeight: number; paddingHorizontal: number; textVariant: "label" | "body" }>;
  radius: number;
  gap: number;
  idle: { background: ColorReference; color: ColorReference; border: ColorReference };
  pressed: { background: ColorReference; color: ColorReference; border: ColorReference };
  states: { focus: typeof focusIndicatorContract };
};

export const toggleGroupBehavior = {
  controlled: ["pressedIds", "defaultPressedIds", "onPressedIdsChange"],
  inputs: ["items", "accessibilityLabel", "size"],
  stateAxes: {
    availability: ["enabled", "disabled"],
    value: ["pressed", "unpressed"],
  },
  web: {
    roles: ["group", "button"],
    keyboard: ["Tab", "Enter", "Space"],
    /** Toolbar-style roving focus is not used: each toggle is its own tab stop, like a row of checkboxes. */
    focus: "native",
  },
  native: { roles: ["button"], states: ["selected", "disabled"], actions: ["toggle"] },
  scenarios: [
    "several-items-can-be-pressed-at-once-and-none-is-a-valid-state",
    "pressed-state-rides-on-aria-pressed-not-on-color-alone",
    "a-disabled-item-never-toggles-and-never-enters-the-pressed-set",
    "removing-an-item-drops-its-pressed-state-instead-of-keeping-an-orphan-id",
    "single-choice-belongs-to-segmented-control-this-contract-never-adds-a-single-mode",
    "the-group-carries-its-own-accessible-name-separate-from-each-buttons-name",
  ],
} as const satisfies BehaviorContract;
