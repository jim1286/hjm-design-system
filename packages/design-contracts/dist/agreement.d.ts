import { type CheckboxSelectionItem, type CheckboxState } from "./selection-helpers.js";
/**
 * 가입·결제 앞에 서는 "약관 동의" 묶음이다. CheckboxGroup으로 매번 조립하던 것을
 * 계약으로 올리는 이유는 세 가지가 **체크박스 목록이 아니라 법적 절차**이기 때문이다.
 *
 * 1. 필수/선택이 제출 가능 여부를 결정한다 — CheckboxGroup은 그 판정을 갖지 않는다.
 * 2. 전체 동의는 자식의 합이지 별도 항목이 아니다(DataTable 머리글·TreeSelect 부모와
 *    같은 파생 관계). 저장되는 것은 개별 항목뿐이다.
 * 3. 각 항목은 "읽을 수 있어야" 한다 — 상세 보기 경로가 없는 동의는 동의가 아니다.
 *    그래서 `detail`은 renderer가 장식으로 넣는 화살표가 아니라 계약된 행동이다.
 *
 * 문구·링크 주소·법적 유효성은 제품이 소유한다. 이 계약은 판정과 배치만 갖는다.
 */
export type AgreementItemDescriptor<Id extends string = string> = CheckboxSelectionItem<Id> & Readonly<{
    /** 필수 항목은 하나라도 비면 제출을 막는다. 기본값은 선택(false). */
    required?: boolean;
    /**
     * 전문을 여는 경로. 제품이 링크(`href`)로 열지 시트로 열지는 renderer 밖의
     * 결정이라 여기서는 "열 수 있다"는 사실만 계약한다.
     */
    detail?: Readonly<{
        label: string;
        href?: string;
    }>;
}>;
export type AgreementDescriptor<Id extends string = string> = Readonly<{
    /** 묶음 전체의 접근성 이름. "약관 동의"처럼 제품이 현지화한다. */
    accessibilityLabel: string;
    /** 전체 동의 행의 라벨. 필수이므로 renderer가 임의 문구를 만들지 않는다. */
    allLabel: string;
    items: readonly AgreementItemDescriptor<Id>[];
}>;
export declare function validateAgreementDescriptor<Id extends string>(descriptor: AgreementDescriptor<Id>): void;
export type AgreementState<Id extends string = string> = Readonly<{
    /** 전체 동의 행이 그릴 tri-state. 개별 항목의 합에서만 나온다. */
    all: CheckboxState;
    /** 필수 항목이 모두 체크됐는가 — 제품의 제출 버튼이 읽는 값. */
    satisfied: boolean;
    /** 아직 체크되지 않은 필수 항목. 제품이 "무엇이 남았는지" 문장을 만든다. */
    missingRequiredIds: readonly Id[];
}>;
/**
 * 비활성 항목은 분모에서 뺀다 — 사용자가 바꿀 수 없는 것을 "덜 동의했다"고 셀 수
 * 없기 때문이다(`resolveDataTableSelectAllState`·`resolveTreeCheckedStates`와 같은 규칙).
 * 필수 항목은 비활성일 수 없으므로(위 validate) `satisfied` 판정에는 이 예외가 없다.
 */
export declare function resolveAgreementState<Id extends string>(descriptor: AgreementDescriptor<Id>, checkedIds: ReadonlySet<Id>): AgreementState<Id>;
/** 개별 항목 토글. 비활성 항목 보호는 공용 helper가 이미 갖고 있다. */
export declare function toggleAgreementItem<Id extends string>(descriptor: AgreementDescriptor<Id>, checkedIds: ReadonlySet<Id>, id: Id): ReadonlySet<Id>;
/**
 * 전체 동의는 "모두 체크됨"의 반대로 간다 — mixed에서 누르면 채운다(공용
 * `getCheckboxNextState`의 기본값과 같은 관습). 비활성 항목의 현재 상태는 건드리지
 * 않는다: 그 값은 사용자가 만든 것이 아니라 제품이 고정한 것이다.
 */
export declare function toggleAgreementAll<Id extends string>(descriptor: AgreementDescriptor<Id>, checkedIds: ReadonlySet<Id>): ReadonlySet<Id>;
/** 목록에서 사라진 항목의 동의는 남기지 않는다. */
export declare function reconcileAgreementSelection<Id extends string>(descriptor: AgreementDescriptor<Id>, checkedIds: ReadonlySet<Id>): ReadonlySet<Id>;
/**
 * 전체 동의 행은 개별 행보다 시각적으로 무겁다 — 목록의 제목 역할을 하기 때문이다.
 * 나머지는 `collectionItemContract`를 그대로 쓴다(Menu·Tree·ListRow와 같은 행 chrome).
 */
export declare const agreementRecipe: {
    readonly slots: readonly ["root", "all", "list", "item", "label", "detail"];
    readonly all: {
        readonly minHeight: 44;
        readonly gap: 12;
        readonly paddingHorizontal: 16;
        readonly paddingVertical: 12;
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly radius: "md";
        readonly textVariant: "bodyLarge";
        readonly color: Readonly<{
            source: "theme";
            key: "text";
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
    readonly detail: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly minHeight: 44;
    };
    readonly required: {
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly gap: 8;
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
export declare const agreementBehavior: {
    readonly controlled: readonly ["checkedIds", "defaultCheckedIds", "onCheckedIdsChange"];
    readonly inputs: readonly ["items", "allLabel", "accessibilityLabel"];
    readonly events: readonly ["onDetail"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["unchecked", "checked", "mixed"];
    };
    readonly web: {
        readonly roles: readonly ["group", "checkbox", "link", "button"];
        readonly keyboard: readonly ["Tab", "Space", "Enter"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["checkbox", "link", "button"];
        readonly states: readonly ["checked", "disabled"];
        readonly actions: readonly ["toggle", "toggleAll", "openDetail"];
    };
    readonly scenarios: readonly ["all-agree-is-derived-from-the-items-never-stored-as-its-own-value", "checking-all-checks-every-enabled-item-and-leaves-disabled-ones-untouched", "required-items-alone-decide-whether-the-product-may-submit", "a-required-item-can-never-be-disabled-the-descriptor-is-rejected", "every-item-may-open-its-full-text-and-that-control-is-a-separate-tab-stop", "the-detail-control-never-toggles-the-agreement-it-only-opens-the-text", "optional-items-never-block-submission-and-are-announced-as-optional", "removing-an-item-drops-its-consent-instead-of-keeping-an-orphan-id"];
};
//# sourceMappingURL=agreement.d.ts.map