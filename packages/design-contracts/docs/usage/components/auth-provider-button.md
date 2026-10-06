# AuthProviderButton

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [AuthProviderButton](../../provider-button.md), recipe `authProviderButtonRecipe`(`src/provider-button.ts`), 포트폴리오 상위 기준 루트 `docs/LOGIN_SCREEN_STANDARD.md`(LS-02·LS-05·LS-09)
- 스토리북: `배포/컴포넌트/동작/소셜 로그인 버튼`

## 언제 쓰나

Google·Kakao·Naver·Apple 소셜 로그인 버튼에 쓴다. 지원 제공자는 이 네 개뿐이며
(`AuthProviderId`), 다른 값은 렌더 시 `TypeError`가 난다. 로그인 화면에서는
[AuthScreenLayout](auth-screen-layout.md)의 `main` 슬롯에 세로로 쌓는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 제공자가 아닌 일반 행동, 개발 로그인·QA 슬롯 버튼 | [Button](button.md) (`tone="secondary"`, LS-05) |
| 로그인 화면 전체 배치 | [AuthScreenLayout](auth-screen-layout.md) |
| 로그인 진행 표시 | AuthScreenLayout의 `pendingLabel` (버튼별 `busy` 아님) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `AuthProviderButton` | 기본 | `@hjmds/react`, `/provider-button` | `@hjmds/react-native`, `/provider-button` |

## 최소 사용 예

```tsx
// Web
import { AuthProviderButton } from "@hjmds/react/provider-button";

<AuthProviderButton
  descriptor={{ provider: "kakao", label: t("auth.provider.kakao") }}
  logo={<ProviderLogo provider="kakao" />} // 제품 컴포넌트
  onClick={() => start("kakao")}
/>
```

```tsx
// Native
import { AuthProviderButton } from "@hjmds/react-native/provider-button";

<AuthProviderButton
  descriptor={{ provider: "apple", label: t("auth.provider.apple") }}
  logo={<ProviderLogo provider="apple" />} // 제품 컴포넌트
  onPress={() => start("apple")}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor.provider` | `google` · `kakao` · `naver` · `apple` | 필수 | 색은 `authProviderPalettes`가 정하고 테마는 제공자가 규정한 light/dark 변형 중 하나를 고를 뿐이다. 다크에서 Google·Apple은 변형이 바뀌고 Kakao·Naver는 같다 |
| `descriptor.label` | 문자열 | 필수 | 공백만 있으면 `TypeError` |
| `descriptor.busy` · `disabled` | `boolean` | `false` | — |
| `logo` | `ReactNode` | 필수 | 제품이 공급하는 제공자 로고 |
| Web `onClick` · Native `onPress` | `(event: MouseEvent<HTMLButtonElement>) => void` · `() => void` | Native 필수 | 로그인 시작 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용 |
| Native `style` | — | — | deprecated — `layoutStyle`(외형은 `authProviderButtonRecipe` 소유, 개발 모드 1회 경고, 다음 major 제거) |
| — | — | HJM 소유 | 크기: 높이 `buttonRecipe` medium(Native는 최소 터치 타깃과 큰 쪽), radius `md`, 로고 상자 20, 테두리 1(테두리를 규정한 변형만), 포커스 링은 fill 바깥(offset 2) |
| Web `type` | HTML button type | `"button"` | — |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭을 꽉 채운다(Web `inline-size: 100%`). 최소 높이 44(`buttonRecipe` medium과 `control.minTouchTarget` 중 큰 쪽), 모서리 `radius.md` 12, 로고 20×20, 라벨 `typography.body` 14/20(제공자 가이드가 라벨·색 표현을 소유한다. 네이버 녹색 대비는 [제공자 색 예외](../../provider-button.md#제공자-색과-글자-대비)) | `authProviderButtonRecipe`, `.hjm-auth-provider-button` |
| 간격 | 좌우 여백 `spacing.md` 16, 로고↔이름 `spacing.sm` 12. 버튼 사이는 스토리 기준 `Stack gap="sm"`(12) | `authProviderButtonRecipe`, `showcase/web/src/patterns/Agreement.stories.tsx`(`AuthScreenLayoutPreview`) |
| 순서·정렬 | [AuthScreenLayout](auth-screen-layout.md) `main` 슬롯에 세로로 쌓는다. 안쪽은 [로고]+[제공자 이름]이 가운데 정렬. 순서는 제품이 정하고, 일반 Button(개발 로그인 등)은 제공자 사이가 아니라 목록 아래에 `tone="secondary"`로 둔다 | `.hjm-auth-provider-button`(`justify-content: center`) |
| 고정·스크롤 | 고정되지 않는다. 진행 중에는 버튼 목록을 그대로 두고 카드 가운데에 로딩 하나만 보인다(`pendingLabel`). 버튼 자리·크기는 바뀌지 않는다 | `react/src/auth-screen.tsx`, `react-native/src/auth-screen.tsx` |
| 좁은 폭·큰 글자 | 이름이 줄바꿈되고 버튼 높이가 늘어난다. 자르지 않는다 | `.hjm-auth-provider-button__label`(`overflow-wrap: anywhere`) |

```text
main 카드(mainCard)
┌──────────────────────────┐
│ [   (G) Google        ]  │
│ [   (K) 카카오        ]  │  ← 간격 spacing.sm 12
│ [   (N) 네이버        ]  │
│ [   ()  Apple         ]  │  ← iOS 필수
└──────────────────────────┘
```

## 꼭 지킬 것

- `label`에는 제공자 이름만 넣는다(`카카오`, `네이버`, `Google`, `Apple`). "Google로 계속하기" 같은 문장을
  만들지 않는다. 문구는 제품 i18n 카탈로그가 소유하며 renderer가 만들거나 자르지 않는다.
- `logo`는 제품이 공급한다. HJM에는 제공자 로고가 없고 넣지도 않는다(공개 MIT 배포라 상표를 담을 수 없다).
  로고 원본은 포트폴리오 루트 `assets/auth-providers/`이고 `node scripts/sync-auth-provider-logos.mjs --write`로
  앱 checkout에 투사한 복사본만 쓴다. 앱에서 따로 내려받지 않는다. 비율을 유지하고 정사각으로 늘리지 않는다.
- 배치는 `layoutStyle`로만 한다. 제공자 색을 `className`·`style`로 다시 칠하지 않는다. 제품 테마·브랜드 색은 이 버튼에 닿지 않는다.
- 로그인 화면의 진행 상태는 AuthScreenLayout `mainCard` + `pendingLabel`로 표시한다. 버튼마다 `busy`를 켜지
  않고, 진행 중에 버튼 목록을 제거하거나 바꾸지 않는다. `busy`는 단독 버튼 호환용이며 카드 진행 상태와 함께 쓰지 않는다.
- 제공자 목록과 순서는 제품(서버 `GET /auth/providers` 등)이 정한다. 설정되지 않은 제공자는 그리지 않는다.
  iOS 앱에서는 Apple이 필수다(LS-02). 웹·Android·iOS의 제공자 집합은 같게 둔다(iOS에 Apple 추가만 허용).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이벤트 | `onClick` 등 `<button>` 속성(선택) | `onPress`(필수) |
| 비활성 | `descriptor.disabled`(`disabled` 속성은 받지 않음) | `descriptor.disabled` |
| 배치 입력 | `layoutStyle`(+`className`, `style` 없음) | `layoutStyle`(`style`은 deprecated) |
| 접근성 이름 | `aria-label={label}` | `accessibilityLabel={label}` |
| `testID`·ref | ref 전달 | 둘 다 없음 |

## 함정

- `busy`이면 로고와 라벨은 자리를 유지한 채 숨고 가운데 스피너 하나만 보인다. 버튼 폭은 줄지 않는다.
  `disabled`는 불투명도 0.5로 흐려지지만 `busy`는 흐려지지 않는다(두 renderer 같음).
- descriptor 검증은 렌더마다 실행된다. 빈 번역 키 결과(빈 문자열)가 그대로 들어가면 화면이 아니라 렌더가 실패한다.
