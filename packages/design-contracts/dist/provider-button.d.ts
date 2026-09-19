/**
 * 소셜 로그인 버튼이다. Button의 tone 하나로 풀 수 없어서 별도 계약으로 둔다.
 *
 * HJM의 tone은 **의미**(primary/secondary/danger)이고 팔레트가 테마를 따라 움직인다.
 * 제공자 버튼의 색은 의미가 아니라 **남의 브랜드 자산**이다 — Google·Kakao·Naver·Apple이
 * 각자 로그인 버튼의 배경·글자·테두리·최소 크기를 브랜드 가이드라인으로 규정하고, 심사에서
 * 그대로 쓰기를 요구한다. 그래서 이 색들은 semantic token이 아니고 테마가 다시 칠하지
 * 않는다. 제품이 `.hjm-button.bt-provider-google` 같은 CSS로 덮어 오던 자리를 계약으로
 * 올리되, 값의 출처가 HJM이 아니라는 사실을 타입으로 드러낸다.
 *
 * **HJM이 소유하는 것**: 높이·radius·터치 타깃·포커스 링·로고와 라벨의 배치·큰 글자 대응.
 * **제공자가 소유하는 것**: 색과 로고 모양.
 * **제품이 소유하는 것**: 로고 자산(재배포하지 않으므로 슬롯으로 받는다)과 현지화된 문구
 * ("Google로 계속하기"의 정확한 표현은 제공자 가이드라인과 언어에 따라 다르다).
 */
export type AuthProviderId = "google" | "kakao" | "naver" | "apple";
export type AuthProviderSurface = Readonly<{
    /** 제공자 가이드라인이 지정한 배경색. HJM 팔레트가 아니다. */
    background: string;
    /** 같은 가이드라인의 글자/로고 색. */
    content: string;
    /** 배경이 캔버스와 구분되지 않을 때만 가이드라인이 요구하는 테두리. */
    border: string | null;
}>;
export type AuthProviderPalette = Readonly<{
    light: AuthProviderSurface;
    /**
     * 제공자가 다크 변형을 따로 규정한 경우에만 다르다. 브랜드색 자체가 정체성인
     * Kakao·Naver는 다크에서도 같은 색을 쓰라고 명시하므로 light와 동일하다.
     */
    dark: AuthProviderSurface;
}>;
/**
 * 값의 출처는 각 제공자의 공개 브랜드 가이드라인이다(2026-09 확인).
 * 로고 이미지는 포함하지 않는다 — 배포 조건이 제공자마다 다르고, HJM이 재배포할 권리가
 * 없다. 가이드라인이 바뀌면 이 표를 고치는 것이 유일한 변경 지점이다.
 */
export declare const authProviderPalettes: {
    readonly google: {
        readonly light: {
            readonly background: "#FFFFFF";
            readonly content: "#1F1F1F";
            readonly border: "#747775";
        };
        readonly dark: {
            readonly background: "#131314";
            readonly content: "#E3E3E3";
            readonly border: "#8E918F";
        };
    };
    readonly kakao: {
        readonly light: {
            readonly background: "#FEE500";
            readonly content: "#191919";
            readonly border: null;
        };
        readonly dark: {
            readonly background: "#FEE500";
            readonly content: "#191919";
            readonly border: null;
        };
    };
    readonly naver: {
        readonly light: {
            readonly background: "#03A94D";
            readonly content: "#FFFFFF";
            readonly border: null;
        };
        readonly dark: {
            readonly background: "#03A94D";
            readonly content: "#FFFFFF";
            readonly border: null;
        };
    };
    readonly apple: {
        readonly light: {
            readonly background: "#000000";
            readonly content: "#FFFFFF";
            readonly border: null;
        };
        readonly dark: {
            readonly background: "#FFFFFF";
            readonly content: "#000000";
            readonly border: "#000000";
        };
    };
};
export type AuthProviderButtonDescriptor = Readonly<{
    provider: AuthProviderId;
    /** 제공자 가이드라인과 언어에 맞춘 문구. renderer가 만들지 않는다. */
    label: string;
    /** 진행 중 표시. 라벨을 지우지 않고 버튼 폭도 유지한다. */
    busy?: boolean;
    disabled?: boolean;
}>;
export declare function validateAuthProviderButtonDescriptor(descriptor: AuthProviderButtonDescriptor): void;
/** 해석된 테마에 맞는 제공자 표면. 테마는 *변형 선택*만 하고 색을 만들지 않는다. */
export declare function resolveAuthProviderSurface(provider: AuthProviderId, theme: "light" | "dark"): AuthProviderSurface;
/**
 * 크기는 HJM 것이다 — 한 화면에 네 개가 세로로 쌓이므로 높이·radius·간격이 서로 다르면
 * 목록이 무너진다. `buttonRecipe`의 medium 높이와 같은 값을 쓰고, 최소 터치 타깃도 공유한다.
 */
export declare const authProviderButtonRecipe: {
    readonly slots: readonly ["root", "logo", "label", "spinner"];
    readonly minHeight: 44;
    readonly minTouchTarget: 44;
    readonly radius: 12;
    readonly paddingHorizontal: 16;
    readonly gap: 12;
    readonly logoSize: 20;
    readonly label: {
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: "400";
    };
    readonly borderWidth: 1;
    /** 제공자 색 위에서도 보이도록 포커스 링은 바깥에 그린다. */
    readonly focusOutlineOffset: 2;
};
export declare const authProviderButtonBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["provider", "label", "busy", "disabled"];
    readonly events: readonly ["onPress"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled", "busy"];
        readonly interaction: readonly ["idle", "hover", "focusVisible", "pressed"];
    };
    readonly web: {
        readonly roles: readonly ["button"];
        readonly keyboard: readonly ["Enter", "Space"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["button"];
        readonly states: readonly ["disabled", "busy"];
        readonly actions: readonly ["press"];
    };
    readonly scenarios: readonly ["provider-colors-come-from-the-provider-guideline-and-the-theme-never-recolors-them", "the-theme-only-picks-between-the-providers-own-light-and-dark-variants", "the-logo-asset-is-a-product-supplied-slot-never-bundled-by-the-design-system", "the-label-is-product-copy-because-the-required-wording-differs-per-provider-and-language", "height-radius-and-touch-target-stay-hjm-so-a-stack-of-providers-lines-up", "busy-keeps-the-label-and-the-button-width-instead-of-collapsing-to-a-spinner", "the-focus-ring-is-drawn-outside-the-brand-fill-so-it-survives-every-provider-color"];
};
//# sourceMappingURL=provider-button.d.ts.map