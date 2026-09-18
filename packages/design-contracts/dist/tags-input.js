import { fieldFrameContract, focusIndicatorContract } from "./component-contracts.js";
import { control, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
/**
 * 활성 후보를 방향키로 옮긴 결과. 목록 끝에서 순환한다 — 후보가 보통 짧아서 끝에
 * 막히면 반대 끝까지 다시 내려가야 한다.
 */
export function resolveTagsInputActiveSuggestion(suggestions, currentId, direction) {
    const enabled = suggestions.filter((item) => item.disabled !== true);
    if (enabled.length === 0)
        return null;
    const index = enabled.findIndex((item) => item.id === currentId);
    if (index === -1)
        return direction === "next" ? enabled[0].id : enabled.at(-1).id;
    const next = direction === "next" ? index + 1 : index - 1;
    return enabled[(next + enabled.length) % enabled.length].id;
}
export const tagsInputBehaviorDefaults = {
    /**
     * Enter만 기본이다. 쉼표·공백은 언어에 따라 값의 일부다(한국어 태그에 공백이 흔하다).
     * 제품이 자기 도메인을 알 때 켠다.
     */
    commitKeys: ["Enter"],
    /** 빈 입력에서 Backspace는 마지막 태그를 **선택**만 한다. 한 번 더 눌러야 지운다. */
    backspaceRemovesLastTag: false,
};
/**
 * 태그 하나를 확정할 수 있는지 판정한다. 값을 바꾸지 않고 결과만 돌려준다 —
 * 실제 상태 갱신은 renderer가, 사용자에게 보여 줄 문장은 제품이 만든다.
 */
export function resolveTagsInputCommit(current, rawValue, policy = {}) {
    const value = rawValue.trim();
    if (value.length === 0)
        return { accepted: false, value, reason: "empty" };
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
export function removeTagAt(current, index) {
    if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        throw new RangeError(`TagsInput index out of range: ${String(index)}`);
    }
    return [...current.slice(0, index), ...current.slice(index + 1)];
}
export const tagsInputRecipe = {
    slots: ["root", "frame", "tag", "remove", "input"],
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
};
//# sourceMappingURL=tags-input.js.map