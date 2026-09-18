import { buttonRecipe } from "./base-recipes.js";
import { control, radius, spacing, typography } from "./foundations.js";
/**
 * 값의 출처는 각 제공자의 공개 브랜드 가이드라인이다(2026-09 확인).
 * 로고 이미지는 포함하지 않는다 — 배포 조건이 제공자마다 다르고, HJM이 재배포할 권리가
 * 없다. 가이드라인이 바뀌면 이 표를 고치는 것이 유일한 변경 지점이다.
 */
export const authProviderPalettes = {
    // Google Identity: 흰 버튼 #FFFFFF / 글자 #1F1F1F / 테두리 #747775,
    // 어두운 변형 #131314 / #E3E3E3 / #8E918F.
    google: {
        light: { background: "#FFFFFF", content: "#1F1F1F", border: "#747775" },
        dark: { background: "#131314", content: "#E3E3E3", border: "#8E918F" },
    },
    // Kakao 로그인: 배경 #FEE500 고정, 글자는 검정 85% 불투명도.
    kakao: {
        light: { background: "#FEE500", content: "rgba(0, 0, 0, 0.85)", border: null },
        dark: { background: "#FEE500", content: "rgba(0, 0, 0, 0.85)", border: null },
    },
    // 네이버 로그인: 배경 #03C75A 고정, 글자 흰색.
    naver: {
        light: { background: "#03C75A", content: "#FFFFFF", border: null },
        dark: { background: "#03C75A", content: "#FFFFFF", border: null },
    },
    // Sign in with Apple: 검정 버튼이 기본, 밝은 배경 위에서는 흰 버튼 + 검은 테두리.
    apple: {
        light: { background: "#000000", content: "#FFFFFF", border: null },
        dark: { background: "#FFFFFF", content: "#000000", border: "#000000" },
    },
};
export function validateAuthProviderButtonDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("AuthProviderButton descriptor must be an object");
    }
    if (!Object.prototype.hasOwnProperty.call(authProviderPalettes, descriptor.provider)) {
        throw new TypeError(`Unsupported auth provider: ${String(descriptor.provider)}`);
    }
    if (typeof descriptor.label !== "string" || descriptor.label.trim().length === 0) {
        throw new TypeError("AuthProviderButton label must not be empty");
    }
}
/** 해석된 테마에 맞는 제공자 표면. 테마는 *변형 선택*만 하고 색을 만들지 않는다. */
export function resolveAuthProviderSurface(provider, theme) {
    return authProviderPalettes[provider][theme];
}
/**
 * 크기는 HJM 것이다 — 한 화면에 네 개가 세로로 쌓이므로 높이·radius·간격이 서로 다르면
 * 목록이 무너진다. `buttonRecipe`의 medium 높이와 같은 값을 쓰고, 최소 터치 타깃도 공유한다.
 */
export const authProviderButtonRecipe = {
    slots: ["root", "logo", "label", "spinner"],
    minHeight: buttonRecipe.sizes.medium.height,
    minTouchTarget: control.minTouchTarget,
    radius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    logoSize: 20,
    label: typography.body,
    borderWidth: 1,
    /** 제공자 색 위에서도 보이도록 포커스 링은 바깥에 그린다. */
    focusOutlineOffset: 2,
};
export const authProviderButtonBehavior = {
    controlled: [],
    inputs: ["provider", "label", "busy", "disabled"],
    events: ["onPress"],
    stateAxes: {
        availability: ["enabled", "disabled", "busy"],
        interaction: ["idle", "hover", "focusVisible", "pressed"],
    },
    web: { roles: ["button"], keyboard: ["Enter", "Space"], focus: "native" },
    native: { roles: ["button"], states: ["disabled", "busy"], actions: ["press"] },
    scenarios: [
        "provider-colors-come-from-the-provider-guideline-and-the-theme-never-recolors-them",
        "the-theme-only-picks-between-the-providers-own-light-and-dark-variants",
        "the-logo-asset-is-a-product-supplied-slot-never-bundled-by-the-design-system",
        "the-label-is-product-copy-because-the-required-wording-differs-per-provider-and-language",
        "height-radius-and-touch-target-stay-hjm-so-a-stack-of-providers-lines-up",
        "busy-keeps-the-label-and-the-button-width-instead-of-collapsing-to-a-spinner",
        "the-focus-ring-is-drawn-outside-the-brand-fill-so-it-survives-every-provider-color",
    ],
};
//# sourceMappingURL=provider-button.js.map