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
    readonly slots: readonly ["root", "hero", "mark", "title", "description", "main", "footer"];
    readonly defaults: {
        readonly density: "regular";
        readonly hasFooter: true;
    };
    readonly maxWidth: 416;
    /** 마크는 아이콘(48)보다 크고 일러스트(120+)보다 작다 — 제품을 알아볼 최소 크기다. */
    readonly markSize: 72;
    readonly markRadius: 16;
    readonly title: {
        readonly fontSize: 20;
        readonly lineHeight: 28;
        readonly fontWeight: "800";
    };
    readonly description: {
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: "400";
    };
    /** 정책 링크는 글자 높이만큼만 누를 수 있으면 44pt 기준에 못 미친다. */
    readonly footerMinTouchTarget: 44;
    readonly footerText: {
        readonly fontSize: 11;
        readonly lineHeight: 16;
        readonly fontWeight: "400";
    };
    /** 제공자 버튼 높이는 Provider 계약이 소유한다 — 여기서 다시 정하지 않는다. */
    readonly providerMinHeight: 44;
    readonly densities: {
        readonly regular: {
            readonly heroGap: 16;
            readonly mainGap: 24;
            readonly footerGap: 24;
            readonly paddingInline: 20;
            readonly paddingBlock: 40;
        };
        readonly compact: {
            readonly heroGap: 8;
            readonly mainGap: 16;
            readonly footerGap: 16;
            readonly paddingInline: 16;
            readonly paddingBlock: 20;
        };
    };
};
export declare function validateAuthScreenDescriptor(descriptor: AuthScreenDescriptor): void;
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
    readonly scenarios: readonly ["the-hero-and-the-main-action-stay-one-vertically-centred-block", "the-footer-sits-at-the-bottom-and-never-overlaps-the-main-action", "content-taller-than-the-viewport-scrolls-instead-of-pushing-the-footer-off-screen", "the-product-owns-every-string-and-the-mark-asset-while-the-layout-stays-here", "provider-button-height-comes-from-the-provider-contract-not-from-this-one", "compact-density-shrinks-gaps-without-changing-the-two-region-structure", "policy-links-in-the-footer-keep-the-minimum-touch-target"];
};
//# sourceMappingURL=auth-screen.d.ts.map