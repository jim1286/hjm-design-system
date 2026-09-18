import { type CheckboxSelectionItem } from "./selection-helpers.js";
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
export type ToggleGroupItemDescriptor<Id extends string = string> = CheckboxSelectionItem<Id>;
export type ToggleGroupDescriptor<Id extends string = string> = Readonly<{
    /** 묶음 전체의 접근성 이름. 개별 버튼 이름으로 대체할 수 없다. */
    accessibilityLabel: string;
    items: readonly ToggleGroupItemDescriptor<Id>[];
}>;
export type ToggleGroupSize = "small" | "medium";
export declare function validateToggleGroupDescriptor<Id extends string>(descriptor: ToggleGroupDescriptor<Id>): void;
/** 하나를 켜고 끈다. 비활성 보호는 공용 helper가 이미 갖고 있다. */
export declare function toggleGroupSelection<Id extends string>(descriptor: ToggleGroupDescriptor<Id>, pressedIds: ReadonlySet<Id>, id: Id): ReadonlySet<Id>;
/** 목록에서 사라진 항목의 눌림 상태는 남기지 않는다. */
export declare function reconcileToggleGroupSelection<Id extends string>(descriptor: ToggleGroupDescriptor<Id>, pressedIds: ReadonlySet<Id>): ReadonlySet<Id>;
export declare const toggleGroupRecipe: {
    readonly slots: readonly ["root", "item", "label"];
    readonly defaults: {
        readonly size: ToggleGroupSize;
    };
    readonly sizes: {
        readonly small: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly textVariant: "label";
        };
        readonly medium: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
        };
    };
    readonly radius: 12;
    readonly gap: 4;
    readonly idle: {
        readonly background: Readonly<{
            source: "theme";
            key: "surface";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "borderControl";
            alpha?: number;
        }>;
    };
    readonly pressed: {
        readonly background: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "contentBrand";
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
export declare const toggleGroupBehavior: {
    readonly controlled: readonly ["pressedIds", "defaultPressedIds", "onPressedIdsChange"];
    readonly inputs: readonly ["items", "accessibilityLabel", "size"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["pressed", "unpressed"];
    };
    readonly web: {
        readonly roles: readonly ["group", "button"];
        readonly keyboard: readonly ["Tab", "Enter", "Space"];
        /** Toolbar-style roving focus is not used: each toggle is its own tab stop, like a row of checkboxes. */
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["button"];
        readonly states: readonly ["selected", "disabled"];
        readonly actions: readonly ["toggle"];
    };
    readonly scenarios: readonly ["several-items-can-be-pressed-at-once-and-none-is-a-valid-state", "pressed-state-rides-on-aria-pressed-not-on-color-alone", "a-disabled-item-never-toggles-and-never-enters-the-pressed-set", "removing-an-item-drops-its-pressed-state-instead-of-keeping-an-orphan-id", "single-choice-belongs-to-segmented-control-this-contract-never-adds-a-single-mode", "the-group-carries-its-own-accessible-name-separate-from-each-buttons-name"];
};
//# sourceMappingURL=toggle-group.d.ts.map