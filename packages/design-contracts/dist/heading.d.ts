import { type HeadingLevel } from "./foundations.js";
/**
 * 문서 제목 단계를 실제로 그리는 primitive다.
 *
 * `heading`(foundations)에는 이미 level1 40px부터 level5 18px까지 다섯 단계가 있었지만
 * **어떤 renderer도 노출하지 않았다** — `Text`는 `TextVariant`(최대 24px)만 받는다.
 * 그래서 랜딩 히어로나 큰 숫자가 필요한 화면은 매번 제품 CSS로 폰트 크기를 직접 썼다.
 * 이 계약은 새 크기를 만들지 않는다. 있던 스케일을 꺼내 쓸 수 있게 하는 것이 전부다.
 *
 * `Top`(화면 첫 제목)·`Section`(본문 묶음 제목)과 겹치지 않는다. 그 둘은 **자리**를
 * 아는 블록이고 자기 여백·보조 문장·보조 행동을 갖는다. `Heading`은 자리를 모르는
 * 글자 하나다 — 카드 안, 표 위, 빈 상태 안 어디에나 놓인다.
 */
export type HeadingDescriptor = Readonly<{
    /** 시각적 크기. 문서 구조상의 단계와 분리돼 있다. */
    level: HeadingLevel;
    /**
     * 실제로 낼 요소 단계. 생략하면 `level`의 숫자를 따른다. 시각적 크기와 문서 구조가
     * 어긋나는 경우(카드 제목이 크지만 h4인 경우)에 따로 지정한다.
     */
    semanticLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}>;
export declare function validateHeadingDescriptor(descriptor: HeadingDescriptor): void;
/** 시각적 단계에서 문서 단계를 뽑되, 명시된 값이 있으면 그것이 이긴다. */
export declare function resolveHeadingSemanticLevel(descriptor: HeadingDescriptor): 1 | 2 | 3 | 4 | 5 | 6;
export declare const headingRecipe: {
    readonly slots: readonly ["root"];
    readonly defaults: {
        readonly level: HeadingLevel;
    };
    readonly levels: {
        readonly level1: {
            readonly fontSize: 40;
            readonly lineHeight: 48;
            readonly fontWeight: "800";
        };
        readonly level2: {
            readonly fontSize: 32;
            readonly lineHeight: 40;
            readonly fontWeight: "800";
        };
        readonly level3: {
            readonly fontSize: 24;
            readonly lineHeight: 32;
            readonly fontWeight: "800";
        };
        readonly level4: {
            readonly fontSize: 20;
            readonly lineHeight: 28;
            readonly fontWeight: "800";
        };
        readonly level5: {
            readonly fontSize: 18;
            readonly lineHeight: 26;
            readonly fontWeight: "700";
        };
    };
    readonly color: Readonly<{
        source: "theme";
        key: "text";
        alpha?: number;
    }>;
    /** 제목 아래 간격은 제목이 아니라 그것을 담는 블록이 정한다. */
    readonly marginBottom: 8;
};
export declare const headingBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["level", "semanticLevel"];
    readonly stateAxes: {};
    readonly web: {
        readonly roles: readonly ["heading"];
        readonly keyboard: readonly [];
        readonly focus: "none";
    };
    readonly native: {
        readonly roles: readonly ["header"];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["visual-size-and-document-level-are-separate-axes-that-may-disagree-on-purpose", "the-element-is-a-real-heading-so-the-rotor-and-skip-links-find-it", "no-new-type-sizes-are-introduced-the-existing-heading-scale-is-what-is-exposed", "heading-owns-no-surrounding-layout-the-block-that-contains-it-does"];
};
//# sourceMappingURL=heading.d.ts.map