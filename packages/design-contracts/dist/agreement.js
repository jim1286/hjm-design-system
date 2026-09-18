import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { control, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import { reconcileCheckboxSelection, toggleCheckboxSelection, } from "./selection-helpers.js";
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Agreement ${field} must not be empty`);
    }
}
export function validateAgreementDescriptor(descriptor) {
    assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
    assertNonEmpty(descriptor.allLabel, "allLabel");
    if (!Array.isArray(descriptor.items) || descriptor.items.length === 0) {
        throw new RangeError("Agreement must contain at least one item");
    }
    const ids = new Set();
    for (const item of descriptor.items) {
        assertNonEmpty(item.id, "item id");
        assertNonEmpty(item.label, "item label");
        if (ids.has(item.id))
            throw new TypeError(`Duplicate Agreement item id: ${item.id}`);
        ids.add(item.id);
        if (item.detail !== undefined) {
            assertNonEmpty(item.detail.label, `item ${item.id} detail label`);
        }
        if (item.required === true && item.disabled === true) {
            /*
              비활성 필수 항목은 사용자가 영원히 제출할 수 없는 화면을 만든다. 조용히
              허용하면 "버튼이 왜 안 눌리는지" 알 수 없는 상태가 되므로 여기서 막는다.
            */
            throw new TypeError(`Agreement item ${item.id} cannot be both required and disabled`);
        }
    }
}
/**
 * 비활성 항목은 분모에서 뺀다 — 사용자가 바꿀 수 없는 것을 "덜 동의했다"고 셀 수
 * 없기 때문이다(`resolveDataTableSelectAllState`·`resolveTreeCheckedStates`와 같은 규칙).
 * 필수 항목은 비활성일 수 없으므로(위 validate) `satisfied` 판정에는 이 예외가 없다.
 */
export function resolveAgreementState(descriptor, checkedIds) {
    validateAgreementDescriptor(descriptor);
    const selectable = descriptor.items.filter((item) => !item.disabled);
    const checkedCount = selectable.filter((item) => checkedIds.has(item.id)).length;
    const all = selectable.length === 0 || checkedCount === 0
        ? false
        : checkedCount === selectable.length
            ? true
            : "mixed";
    const missingRequiredIds = descriptor.items
        .filter((item) => item.required === true && !checkedIds.has(item.id))
        .map((item) => item.id);
    return { all, satisfied: missingRequiredIds.length === 0, missingRequiredIds };
}
/** 개별 항목 토글. 비활성 항목 보호는 공용 helper가 이미 갖고 있다. */
export function toggleAgreementItem(descriptor, checkedIds, id) {
    validateAgreementDescriptor(descriptor);
    return toggleCheckboxSelection(descriptor.items, checkedIds, id);
}
/**
 * 전체 동의는 "모두 체크됨"의 반대로 간다 — mixed에서 누르면 채운다(공용
 * `getCheckboxNextState`의 기본값과 같은 관습). 비활성 항목의 현재 상태는 건드리지
 * 않는다: 그 값은 사용자가 만든 것이 아니라 제품이 고정한 것이다.
 */
export function toggleAgreementAll(descriptor, checkedIds) {
    const { all } = resolveAgreementState(descriptor, checkedIds);
    const next = new Set(checkedIds);
    for (const item of descriptor.items) {
        if (item.disabled)
            continue;
        if (all === true)
            next.delete(item.id);
        else
            next.add(item.id);
    }
    return next;
}
/** 목록에서 사라진 항목의 동의는 남기지 않는다. */
export function reconcileAgreementSelection(descriptor, checkedIds) {
    validateAgreementDescriptor(descriptor);
    return reconcileCheckboxSelection(descriptor.items, checkedIds);
}
/**
 * 전체 동의 행은 개별 행보다 시각적으로 무겁다 — 목록의 제목 역할을 하기 때문이다.
 * 나머지는 `collectionItemContract`를 그대로 쓴다(Menu·Tree·ListRow와 같은 행 chrome).
 */
export const agreementRecipe = {
    slots: ["root", "all", "list", "item", "label", "detail"],
    all: {
        minHeight: control.minTouchTarget,
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        background: semanticColors.surface.sunken,
        radius: "md",
        textVariant: "bodyLarge",
        color: semanticColors.content.primary,
    },
    item: collectionItemContract,
    detail: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        minHeight: control.minTouchTarget,
    },
    required: { color: semanticColors.content.brand, textVariant: "label" },
    gap: spacing.xs,
    states: { focus: focusIndicatorContract },
};
export const agreementBehavior = {
    controlled: ["checkedIds", "defaultCheckedIds", "onCheckedIdsChange"],
    inputs: ["items", "allLabel", "accessibilityLabel"],
    events: ["onDetail"],
    stateAxes: {
        availability: ["enabled", "disabled"],
        value: ["unchecked", "checked", "mixed"],
    },
    web: {
        roles: ["group", "checkbox", "link", "button"],
        keyboard: ["Tab", "Space", "Enter"],
        focus: "native",
    },
    native: {
        roles: ["checkbox", "link", "button"],
        states: ["checked", "disabled"],
        actions: ["toggle", "toggleAll", "openDetail"],
    },
    scenarios: [
        "all-agree-is-derived-from-the-items-never-stored-as-its-own-value",
        "checking-all-checks-every-enabled-item-and-leaves-disabled-ones-untouched",
        "required-items-alone-decide-whether-the-product-may-submit",
        "a-required-item-can-never-be-disabled-the-descriptor-is-rejected",
        "every-item-may-open-its-full-text-and-that-control-is-a-separate-tab-stop",
        "the-detail-control-never-toggles-the-agreement-it-only-opens-the-text",
        "optional-items-never-block-submission-and-are-announced-as-optional",
        "removing-an-item-drops-its-consent-instead-of-keeping-an-orphan-id",
    ],
};
//# sourceMappingURL=agreement.js.map