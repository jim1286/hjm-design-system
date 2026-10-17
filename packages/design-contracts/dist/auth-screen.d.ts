/**
 * 로그인 화면의 골격이다. 제품이 화면을 다시 조립하지 않게 **배치만** 소유한다.
 *
 * 왜 골격인가: 계정이 있는 제품들이 같은 화면을 각자 만들었고, 같은 실수를 각자 했다.
 * 번뚝은 로고·태그라인·설명 두 줄·동의 고지·정책 링크를 위에서부터 쌓아 제공자 버튼을
 * 화면 밖으로 밀어냈고(2026-09-19 iPhone 17 Pro 실측), 그 배치를 따라한 다른 제품도 같은
 * 순서로 쌓였다. 간격과 최대 폭은 제품마다 다를 이유가 없는데 제품마다 다시 정해졌다.
 *
 * 그래서 **두 영역**만 강제한다. 위 영역(`hero` + `main`)은 남는 세로 공간을 전부 차지하고
 * 그 안에서 가운데 정렬한다. 아래 영역(`footer`)은 바닥에 붙는다. 세 영역 이상으로 나누지
 * 않는 이유는, 셋이 되는 순간 어느 것이 주 행동인지가 배치로 드러나지 않아서다.
 *
 * **HJM이 소유하는 것**: 영역 구분, 간격, 최대 폭, 가운데 정렬, 내용이 길어질 때의 스크롤 전환.
 * **제품이 소유하는 것**: 마크 자산, 모든 문구, 제공자 목록과 순서, 정책 링크의 목적지,
 * 그리고 `main`에 무엇을 넣을지(제공자 버튼만, 또는 가입 재개·심사자 입력 같은 제품 덩어리).
 *
 * 이 계약은 화면을 **그리지 않는다.** `AuthProviderButton`·`BottomInfo`·`Agreement`처럼 이미
 * 있는 컴포넌트를 제품이 슬롯에 넣는다. 화면 전체를 한 컴포넌트로 받으면 제품마다 다른
 * 부분(다에리의 중단 거래 복구, 번뚝의 심사자 폼)을 전부 슬롯으로 되돌려 받아야 해서,
 * 결국 이름만 붙은 Stack이 된다.
 */
export type AuthScreenDensity = "compact" | "regular";
export type AuthScreenDescriptor = Readonly<{
    /**
     * 세로 공간이 좁은 기기에서 간격을 줄인다. 제품이 화면 높이를 보고 고르며, HJM은
     * 기기 종류를 추측하지 않는다(같은 폭이라도 키보드가 올라오면 좁아진다).
     */
    density?: AuthScreenDensity;
    /** 아래 영역(동의 고지·정책 링크)을 둘지. 계정 생성이 없는 화면은 없을 수 있다. */
    hasFooter?: boolean;
}>;
export type ResolvedAuthScreenDescriptor = Readonly<{
    density: AuthScreenDensity;
    hasFooter: boolean;
    /** 위 영역 안쪽 간격(마크→제목→설명→주 행동). */
    heroGap: number;
    /** 위 영역과 주 행동 사이. */
    mainGap: number;
    /** 아래 영역을 띄우는 최소 간격. 화면이 길면 그 이상 벌어진다. */
    footerGap: number;
    paddingInline: number;
    paddingBlock: number;
    maxWidth: number;
    /** 히어로 제목의 글자 단계. `AuthScreenHero`가 이 값으로 그린다. */
    titleVariant: AuthScreenTitleVariant;
}>;
export type AuthScreenTitleVariant = "heading" | "titleLarge";
/**
 * 히어로 문구. 문자열은 전부 제품 소유이고, 글자 단계·색·간격은 `authScreenRecipe.hero`가 소유한다.
 * 마크 자산은 렌더러의 `mark` 슬롯으로 받는다.
 */
export type AuthScreenHeroDescriptor = Readonly<{
    title: string;
    eyebrow?: string;
    description?: string;
    /** 문서 구조상의 제목 단계. 로그인 화면이 라우트의 첫 제목이므로 기본은 1이다. */
    headingLevel?: 1 | 2 | 3;
}>;
/** 정책 링크 한 개. 목적지와 문구는 제품 소유다. */
export type AuthScreenPolicyLinkDescriptor = Readonly<{
    label: string;
    /**
     * Supplementary announcement after the label, e.g. the product's localized "opens in browser" (Web aria-describedby
     * text / RN accessibilityHint). The visible label stays the link's name; spint dropped its hint when it adopted
     * AuthScreenFooter because the links had no slot for it (2026-10-17).
     */
    accessibilityHint?: string;
}>;
export declare const authScreenDefaults: {
    readonly density: "regular";
    readonly hasFooter: true;
};
/**
 * 최대 폭 26rem(416)은 `Container`의 reading(720)보다 좁다. 제공자 버튼이 노트북 폭만큼
 * 길어지면 누를 곳이 아니라 띠로 보이기 때문이고, 이 화면의 내용은 버튼 한 줄기뿐이라
 * 읽기 폭을 쓸 이유가 없다.
 */
export declare const authScreenRecipe: {
    readonly slots: readonly ["root", "hero", "mark", "eyebrow", "title", "description", "main", "footer", "notice", "links"];
    readonly defaults: {
        readonly density: "regular";
        readonly hasFooter: true;
    };
    readonly maxWidth: 416;
    /** 마크는 아이콘(48)보다 크고 일러스트(120+)보다 작다 — 제품을 알아볼 최소 크기다. */
    readonly markSize: 72;
    readonly markRadius: 16;
    /**
     * 히어로 제목은 LS의 태그라인(24)이다. 2026-10-17 사용자 피드백("굵기랑 크기 줄여"): 예제가
     * 화면 첫 제목용 `Top large`(display 32/40)를 히어로에 넣어 402 폭에서 두 줄로 화면을 눌렀다.
     * 로그인 슬로건은 화면 제목이 아니라 제공자 버튼을 소개하는 한 줄이라 display 단계를 쓰지
     * 않고, 굵기는 제목 단계의 medium(500)을 그대로 따른다. compact는 한 단계 낮춘다(densities).
     */
    readonly title: {
        readonly fontSize: 24;
        readonly lineHeight: 32;
        readonly fontWeight: "500";
    };
    readonly description: {
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: "400";
    };
    readonly hero: {
        readonly eyebrow: {
            readonly textVariant: "label";
            readonly tone: "brand";
            readonly gapBelow: 4;
        };
        readonly title: {
            readonly tone: "primary";
        };
        /** LS 설명은 보조 글자색이다 — 본문색이면 태그라인과 같은 무게로 읽힌다. */
        readonly description: {
            readonly textVariant: "body";
            readonly tone: "muted";
            readonly gapAbove: 8;
        };
    };
    /** 정책 링크는 글자 높이만큼만 누를 수 있으면 44pt 기준에 못 미친다. */
    readonly footerMinTouchTarget: 44;
    readonly footerText: {
        readonly fontSize: 11;
        readonly lineHeight: 16;
        readonly fontWeight: "400";
    };
    /**
     * 동의 고지와 정책 링크(LS §3: 고지 `caption` 흐린 색, 링크와 gap `xxs`, 링크 `caption` 브랜드색·밑줄,
     * "개인정보 처리방침 · 이용약관"). 2026-10-17 사용자 피드백("간격 줄여"): 예제가 ghost Button 두 개를
     * Stack gap 16으로 놓아 버튼 안쪽 여백 12+12가 더해져 글자 사이가 40~42로 벌어졌다. 보이는 간격은
     * `linkGap` + 구분점 + `linkGap` 하나로 정하고, 44 터치 높이는 보이지 않는 히트 영역(Web 높이·가상
     * 요소, Native minHeight·hitSlop)으로 채운다 — 보이는 여백으로 터치 영역을 만들면 간격이 다시 커진다.
     */
    readonly footer: {
        readonly notice: {
            readonly textVariant: "caption";
            readonly tone: "muted";
        };
        readonly noticeGap: 4;
        readonly link: {
            readonly textVariant: "caption";
            readonly tone: "brand";
            readonly underline: true;
        };
        readonly linkGap: 8;
        readonly separator: "·";
    };
    /** 제공자 버튼 높이는 Provider 계약이 소유한다 — 여기서 다시 정하지 않는다. */
    readonly providerMinHeight: 44;
    readonly mainCard: {
        readonly padding: 16;
        readonly radius: 16;
    };
    readonly densities: {
        readonly regular: {
            readonly heroGap: 16;
            readonly mainGap: 24;
            readonly footerGap: 24;
            readonly paddingInline: 20;
            readonly paddingBlock: 40;
            readonly titleVariant: "heading";
        };
        readonly compact: {
            readonly heroGap: 8;
            readonly mainGap: 16;
            readonly footerGap: 16;
            readonly paddingInline: 16;
            readonly paddingBlock: 20;
            readonly titleVariant: "titleLarge";
        };
    };
};
export declare function validateAuthScreenDescriptor(descriptor: AuthScreenDescriptor): void;
export declare function validateAuthScreenHeroDescriptor(descriptor: AuthScreenHeroDescriptor): void;
/** LS-04: 약관·개인정보처리방침 링크는 로그인 전에 같은 화면에 있어야 하므로 빈 목록을 받지 않는다. */
export declare function validateAuthScreenPolicyLinks(links: readonly AuthScreenPolicyLinkDescriptor[]): void;
export declare function resolveAuthScreenDescriptor(descriptor?: AuthScreenDescriptor): ResolvedAuthScreenDescriptor;
export declare const authScreenBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["density", "hasFooter"];
    readonly events: readonly [];
    readonly stateAxes: {};
    readonly web: {
        readonly roles: readonly ["main"];
        readonly keyboard: readonly [];
        readonly focus: "none";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["the-hero-and-the-main-action-stay-one-vertically-centred-block", "the-footer-sits-at-the-bottom-and-never-overlaps-the-main-action", "content-taller-than-the-viewport-scrolls-instead-of-pushing-the-footer-off-screen", "the-product-owns-every-string-and-the-mark-asset-while-the-layout-stays-here", "provider-button-height-comes-from-the-provider-contract-not-from-this-one", "compact-density-shrinks-gaps-without-changing-the-two-region-structure", "policy-links-in-the-footer-keep-the-minimum-touch-target", "the-hero-title-uses-the-recipe-title-step-not-a-display-heading", "policy-links-are-separated-by-one-recipe-gap-and-a-dot-while-the-touch-area-stays-invisible"];
};
//# sourceMappingURL=auth-screen.d.ts.map