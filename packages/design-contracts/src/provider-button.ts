import type { BehaviorContract } from "./behaviors.js";
import { buttonRecipe } from "./base-recipes.js";
import { control, radius, spacing, typography } from "./foundations.js";

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
export const authProviderPalettes = {
  // Google Identity: 흰 버튼 #FFFFFF / 글자 #1F1F1F / 테두리 #747775,
  // 어두운 변형 #131314 / #E3E3E3 / #8E918F.
  google: {
    light: { background: "#FFFFFF", content: "#1F1F1F", border: "#747775" },
    dark: { background: "#131314", content: "#E3E3E3", border: "#8E918F" },
  },
  // Kakao 로그인: 배경 #FEE500 고정, 글자 #191919.
  // 예전 값은 `rgba(0, 0, 0, 0.85)`였다. 흔히 인용되는 "검정 85%"인데, 노란 배경 위에서
  // 실제로 합성하면 (38, 34, 0)이라 카카오가 배포하는 버튼 이미지의 글자색과 다르다.
  // 공식 자산(kakao_login.zip의 ko/kakao_login_large_wide.png)에서 픽셀을 뽑아 대조했다.
  kakao: {
    light: { background: "#FEE500", content: "#191919", border: null },
    dark: { background: "#FEE500", content: "#191919", border: null },
  },
  // 네이버 로그인: 배경 #03A94D 고정, 글자 흰색.
  // 예전 값 #03C75A는 구 BI다. 네이버 로그인 BI 가이드가 "배경 컬러가 더 뚜렷하게
  // 바뀌었어요. 반드시 지정된 녹색을 사용해 주세요. 컬러 #03A94D, RGB 3/169/77"로 못박고,
  // 배포 중인 버튼 자산(NAVER_login_KR.zip)의 픽셀도 (3, 169, 77)이다(2026-09-19 확인).
  naver: {
    light: { background: "#03A94D", content: "#FFFFFF", border: null },
    dark: { background: "#03A94D", content: "#FFFFFF", border: null },
  },
  // Sign in with Apple: 검정 버튼이 기본, 밝은 배경 위에서는 흰 버튼 + 검은 테두리.
  apple: {
    light: { background: "#000000", content: "#FFFFFF", border: null },
    dark: { background: "#FFFFFF", content: "#000000", border: "#000000" },
  },
} as const satisfies Readonly<Record<AuthProviderId, AuthProviderPalette>>;

export type AuthProviderButtonDescriptor = Readonly<{
  provider: AuthProviderId;
  /** 제공자 가이드라인과 언어에 맞춘 문구. renderer가 만들지 않는다. */
  label: string;
  /** 진행 중 표시. 라벨을 지우지 않고 버튼 폭도 유지한다. */
  busy?: boolean;
  disabled?: boolean;
}>;

export function validateAuthProviderButtonDescriptor(
  descriptor: AuthProviderButtonDescriptor,
): void {
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
export function resolveAuthProviderSurface(
  provider: AuthProviderId,
  theme: "light" | "dark",
): AuthProviderSurface {
  return authProviderPalettes[provider][theme];
}

/**
 * 크기는 HJM 것이다 — 한 화면에 네 개가 세로로 쌓이므로 높이·radius·간격이 서로 다르면
 * 목록이 무너진다. `buttonRecipe`의 medium 높이와 같은 값을 쓰고, 최소 터치 타깃도 공유한다.
 */
export const authProviderButtonRecipe = {
  slots: ["root", "logo", "label", "spinner"] as const,
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
} as const;

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
} as const satisfies BehaviorContract;
