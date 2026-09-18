import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { fieldFrameContract, focusIndicatorContract } from "./component-contracts.js";
import { control, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * 자유 입력으로 여러 값을 모으는 필드 — 해시태그, 초대할 사람, 검색 필터.
 *
 * Combobox와 다르다. Combobox는 **주어진 목록에서 고른다**. TagsInput은 목록이 없거나
 * 있어도 목록 밖의 값을 만들 수 있다. 그래서 Combobox에 `multiple` 축을 붙이는 대신
 * 별도로 둔다 — 합치면 "목록에 없는 값을 고를 수 있는 Select"라는 모순이 생긴다.
 * (제품이 후보 목록을 함께 보여 주고 싶으면 이 필드와 Combobox의 listbox를 조합한다.)
 *
 * 이 계약이 소유하는 것은 **언제 태그가 확정되는가**와 **빈 입력에서 지우면 무엇이
 * 지워지는가** 둘이다. 중복 허용 여부·최대 개수·글자 규칙은 제품 정책이라 판정 결과를
 * 받기만 한다.
 */
export type TagsInputCommitKey = "Enter" | "Comma" | "Space" | "Blur";

/**
 * 후보 목록. Combobox의 listbox 계약을 **이 필드 안에서** 쓰는 형태다.
 *
 * "Combobox에 multiple을 붙이자"가 아니라 여기로 온 이유: Combobox의 값은 목록 안의
 * 키 하나이고 이 필드의 값은 문자열 배열이다. 값 모양이 다른 둘을 한 컴포넌트에 넣으면
 * 모든 소비자가 매번 좁히기를 해야 한다. 자유 입력이 이미 여기 있으므로 후보를 여기에
 * 더하는 쪽이 값 하나로 끝난다.
 *
 * 필터링은 제품이 한다 — 이 계약은 "무엇을 보여줄지"가 아니라 "고른 것을 어떻게
 * 확정할지"만 안다.
 */
export type TagsInputSuggestion = Readonly<{
  id: string;
  label: string;
  /** 확정될 문자열. 생략하면 `label`. */
  value?: string;
  disabled?: boolean;
}>;

/**
 * 활성 후보를 방향키로 옮긴 결과. 목록 끝에서 순환한다 — 후보가 보통 짧아서 끝에
 * 막히면 반대 끝까지 다시 내려가야 한다.
 */
export function resolveTagsInputActiveSuggestion(
  suggestions: readonly TagsInputSuggestion[],
  currentId: string | null,
  direction: "next" | "previous",
): string | null {
  const enabled = suggestions.filter((item) => item.disabled !== true);
  if (enabled.length === 0) return null;
  const index = enabled.findIndex((item) => item.id === currentId);
  if (index === -1) return direction === "next" ? enabled[0]!.id : enabled.at(-1)!.id;
  const next = direction === "next" ? index + 1 : index - 1;
  return enabled[(next + enabled.length) % enabled.length]!.id;
}

export const tagsInputBehaviorDefaults = {
  /**
   * Enter만 기본이다. 쉼표·공백은 언어에 따라 값의 일부다(한국어 태그에 공백이 흔하다).
   * 제품이 자기 도메인을 알 때 켠다.
   */
  commitKeys: ["Enter"] as readonly TagsInputCommitKey[],
  /** 빈 입력에서 Backspace는 마지막 태그를 **선택**만 한다. 한 번 더 눌러야 지운다. */
  backspaceRemovesLastTag: false,
} as const;

export type TagsInputRejectionReason = "empty" | "duplicate" | "limit" | "invalid";

export type TagsInputCommitResult = Readonly<{
  accepted: boolean;
  /** 정리된 값(앞뒤 공백 제거). 거절돼도 제품이 문구에 쓸 수 있게 돌려준다. */
  value: string;
  reason?: TagsInputRejectionReason;
}>;

export type TagsInputPolicy = Readonly<{
  /** 같은 값을 다시 넣을 수 있는가. 기본은 막는다. */
  allowDuplicates?: boolean;
  maxTags?: number;
  /** 제품 도메인 규칙. 실패 사유는 `invalid` 하나로 합쳐 돌려준다. */
  isValid?: (value: string) => boolean;
}>;

/**
 * 태그 하나를 확정할 수 있는지 판정한다. 값을 바꾸지 않고 결과만 돌려준다 —
 * 실제 상태 갱신은 renderer가, 사용자에게 보여 줄 문장은 제품이 만든다.
 */
export function resolveTagsInputCommit(
  current: readonly string[],
  rawValue: string,
  policy: TagsInputPolicy = {},
): TagsInputCommitResult {
  const value = rawValue.trim();
  if (value.length === 0) return { accepted: false, value, reason: "empty" };
  if (policy.allowDuplicates !== true && current.includes(value)) {
    return { accepted: false, value, reason: "duplicate" };
  }
  if (policy.maxTags !== undefined && current.length >= policy.maxTags) {
    return { accepted: false, value, reason: "limit" };
  }
  if (policy.isValid !== undefined && !policy.isValid(value)) {
    return { accepted: false, value, reason: "invalid" };
  }
  return { accepted: true, value };
}

/** 태그 하나를 뺀 목록. 같은 값이 여러 개면 해당 위치 하나만 지운다. */
export function removeTagAt(current: readonly string[], index: number): readonly string[] {
  if (!Number.isInteger(index) || index < 0 || index >= current.length) {
    throw new RangeError(`TagsInput index out of range: ${String(index)}`);
  }
  return [...current.slice(0, index), ...current.slice(index + 1)];
}

export const tagsInputRecipe = {
  slots: ["root", "frame", "tag", "remove", "input"] as const,
  defaults: { commitKeys: tagsInputBehaviorDefaults.commitKeys },
  frame: {
    minHeight: fieldFrameContract.minHeight,
    paddingHorizontal: fieldFrameContract.paddingHorizontal,
    paddingVertical: spacing.xxs,
    gap: spacing.xs,
    border: fieldFrameContract.border,
    background: fieldFrameContract.background,
  },
  tag: {
    minHeight: 28,
    paddingHorizontal: spacing.xs,
    gap: spacing.xxs,
    background: semanticColors.surface.sunken,
    color: semanticColors.content.body,
  },
  /** 삭제 버튼은 태그보다 작아도 되지만 포인터 타깃은 공용 최소값을 지킨다. */
  remove: { minTouchTarget: control.minTouchTarget, color: semanticColors.content.secondary },
  selectedTagOutline: semanticColors.border.focus,
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly ["root", "frame", "tag", "remove", "input"];
  defaults: { commitKeys: readonly TagsInputCommitKey[] };
  frame: {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
    border: ColorReference;
    background: ColorReference;
  };
  tag: { minHeight: number; paddingHorizontal: number; gap: number; background: ColorReference; color: ColorReference };
  remove: { minTouchTarget: number; color: ColorReference };
  selectedTagOutline: ColorReference;
  states: { focus: typeof focusIndicatorContract };
};

export const tagsInputBehavior = {
  controlled: ["tags", "defaultTags", "onTagsChange"],
  inputs: ["policy", "commitKeys", "label", "removeLabel"],
  /**
   * `onDraftChange`가 없으면 제품이 후보를 거를 수 없다 — 무엇을 입력 중인지 모르기
   * 때문이다. 후보 목록을 계약에 넣는 순간 이 이벤트도 함께 필요하다.
   */
  events: ["onReject", "onDraftChange"],
  defaults: { backspaceRemovesLastTag: tagsInputBehaviorDefaults.backspaceRemovesLastTag },
  stateAxes: {
    availability: ["enabled", "disabled"],
    value: ["empty", "filled"],
    validation: ["valid", "invalid"],
  },
  web: {
    roles: ["combobox", "listbox", "option", "button", "list", "listitem"],
    keyboard: ["Enter", "Backspace", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape", "Tab"],
    focus: "native",
  },
  native: { roles: ["button"], states: ["disabled"], actions: ["commit", "remove"] },
  scenarios: [
    "enter-commits-the-trimmed-value-and-clears-the-input",
    "an-empty-or-whitespace-only-value-is-never-committed",
    "duplicates-are-rejected-by-default-and-the-reason-is-reported-not-swallowed",
    "backspace-in-an-empty-input-selects-the-last-tag-before-a-second-press-removes-it",
    "every-tag-carries-its-own-remove-control-with-a-localized-name",
    "the-policy-judges-and-the-product-writes-the-sentence-the-user-reads",
    "a-candidate-list-lives-in-this-field-because-the-value-shape-is-this-fields-not-comboboxs",
    "enter-commits-the-active-candidate-when-one-is-highlighted-and-the-typed-text-otherwise",
    "candidate-filtering-belongs-to-the-product-the-contract-only-commits-the-choice",
  ],
} as const satisfies BehaviorContract;
