# BottomCTA

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [화면 제목과 마지막 행동](../../screen-chrome.md), recipe `bottomCtaRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/동작/하단 실행 버튼`

## 언제 쓰나

화면의 결론 행동(저장·다음·결제·가입)을 본문 아래 하단 영역에 둘 때 쓴다. 주 행동 하나,
선택적인 보조 행동 하나, 그 위의 짧은 설명 한 줄을 담는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 본문 중간의 일반 행동 | [Button](button.md) |
| 목록 위에 떠 있는 "새 항목" 행동 | [FloatingActionButton](floating-action-button.md) |
| 주 행동 아래 붙는 약관·수수료 같은 상시 조건 | [BottomInfo](bottom-info.md) |
| 최상위 화면 사이 이동 | [BottomNavigation](bottom-navigation.md) |
| 지금 생긴 오류·성공 알림 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `BottomCTA` | 기본 | `@hjmds/react`, `/bottom-cta` | `@hjmds/react-native`, `/actions`, `/bottom-cta` |

Native의 `/bottom-cta`는 `/actions` 모듈의 alias다(번들 감소 아님).

## 최소 사용 예

```tsx
// Web
import { BottomCTA } from "@hjmds/react/bottom-cta";

<BottomCTA
  position="sticky"
  description={t("checkout.feeNotice")}
  primaryAction={{ label: t("checkout.pay"), onClick: pay, loading: paying }}
  secondaryAction={{ label: t("common.cancel"), onClick: cancel }}
/>
```

```tsx
// Native
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();
<BottomCTA
  safeAreaBottom={insets.bottom}
  primaryAction={{ label: t("checkout.pay"), onPress: pay, loading: paying }}
  secondaryAction={{ label: t("common.cancel"), onPress: cancel }}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `primaryAction` | Web `{ label, onClick, accessibilityLabel?, disabled?, loading?, loadingLabel?, size?, tone? }` · Native `{ label, onPress, accessibilityLabel?, accessibilityHint?, disabled?, loading?, loadingLabel?, size?, tone? }` | 필수, tone `primary`, size `medium` | Web `onClick: (event: MouseEvent<HTMLButtonElement>) => void`, Native `onPress: (event: GestureResponderEvent) => void` |
| `secondaryAction` | 같은 action 객체 또는 제품이 만든 `ReactNode` | tone `secondary` | 객체면 HJM Button으로 그린다. Web은 `label`과 `onClick`이 있어야 객체로 본다 |
| `description` | `string` | — | 행동 위 caption 한 줄 |
| `accessibilityLabel` | `string` | — | 바 전체(Web `role="group"`, Native `toolbar`)의 이름 |
| `safeAreaBottom` | 0 이상의 유한수 | `0` | 음수·무한대는 `RangeError` |
| Web `position` | `flow` · `sticky` | `flow` | fixed는 제공하지 않는다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`은 deprecated — layoutStyle 또는 tone/토큰 |
| 큰 글자 | — | — | 두 행동을 세로로 쌓고 **주 행동을 위**에 둔다(`column-reverse`, Native `textScale >= 1.6`, Web `isLargeTextScale`) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면 폭을 꽉 채우는 하단 바. 최소 높이 64(Native는 64 + `safeAreaBottom`). 행동 버튼은 칸을 꽉 채우고 높이는 Button `size`를 따른다(기본 medium 44) | `bottomCtaRecipe.minHeight`, `.hjm-bottom-cta__actions .hjm-button`, `react-native/src/actions.tsx` |
| 간격 | 좌우 `layout.pagePadding.regular` 20, 위 `spacing.sm` 12, 아래 `spacing.sm` 12와 하단 inset 중 큰 값(Web은 `env(safe-area-inset-bottom)`·`safeAreaBottom`도 비교). 설명↔행동, 행동 사이 `spacing.sm` 12. 위 경계는 `border.default` 1px(`stroke.default`), Native는 위로 드리우는 그림자(opacity 0.08, radius 8) | `bottomCtaRecipe`, `.hjm-bottom-cta` |
| 순서·정렬 | 위→아래 [설명 한 줄(caption, muted)] → 행동 줄. 행동 줄은 [보조][주] 순서로 같은 폭을 나눈다. 주 행동은 하나다 | `react/src/bottom-cta.tsx`, `react-native/src/actions.tsx` |
| 고정·스크롤 | 본문 스크롤 영역 아래에 붙는다. Web은 `flow`(문서 흐름 끝) 또는 `sticky`(아래 0에 붙음, z-index `layer.sticky` 100). Native는 제품 화면 레이아웃이 스크롤 영역 밖 아래에 둔다. 키보드가 열리는 폼은 `KeyboardAvoiding` 또는 `KeyboardDock`으로 감싼다 | `.hjm-bottom-cta[data-position="sticky"]`, `react-native/src/keyboard-controller.tsx` |
| 좁은 폭·큰 글자 | Web은 행동 칸 기준 폭 132(`control.minTouchTarget` × 3)보다 좁으면 줄바꿈한다. 큰 글자에서는 세로로 쌓고 주 행동이 위에 온다 | `.hjm-bottom-cta__actions > div`, `.hjm-bottom-cta[data-large-text="true"]` |

```text
┌──────────────────────────────┐
│ 스크롤 본문                   │
│ …                            │
├──────────────────────────────┤ ← border 1px (Native 그림자)
│ 설명 한 줄(caption)           │
│ [  보조  ]   [    주 행동   ] │ ← 같은 폭, 사이 spacing.sm 12
│ ░░ 하단 안전 영역 ░░          │ ← max(spacing.sm, inset)
└──────────────────────────────┘
큰 글자: [    주 행동    ] / [     보조      ] (주 행동 위)
```

## 꼭 지킬 것

- action `label`은 i18n 키로 넣고 비우지 않는다. Web은 빈 label에 `TypeError`를 던진다.
- 진행 중은 action의 `loading`으로 표시한다. 버튼 위에 Spinner를 따로 겹치지 않는다.
- 주 행동은 하나다. 세 번째 행동이 필요하면 화면 구조를 다시 본다.
- 폼 제출을 BottomCTA로 옮기면 [Form](form.md)의 제출 버튼과 중복하지 않는다. Web은 Form `actions`에 submit Button을 넣지 않고,
  Native Form은 내장 제출 버튼(`submitLabel` 필수)을 항상 그리므로 Form 대신 필드 + contracts `createFormSubmitSession`
  (`@hjmds/design-contracts/components/form`)으로 제출 세션을 잡고 그 상태를 `primaryAction.loading`에 연결한다.
- 배치는 `layoutStyle`로만 한다. Native `style`은 deprecated(개발 모드 1회 경고, 다음 major 제거)다.
- 하단 inset을 넘긴다. Native는 자동으로 읽지 않으므로 `safeAreaBottom`이 없으면 홈 인디케이터에 붙는다.
- 키보드가 열리는 폼 화면(Native)은 `KeyboardAvoiding`(`/keyboard`) 또는 `KeyboardDock`(`/keyboard-controller`,
  optional peer `react-native-keyboard-controller` 설치 필요)로 감싼다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이벤트 | `onClick` | `onPress` |
| 위치 | `position="sticky"`로 문서 흐름 안 고정 | 제품의 화면 레이아웃이 배치 |
| 하단 inset | `env(safe-area-inset-bottom)`과 `safeAreaBottom` 중 큰 값 | `safeAreaBottom`(과 recipe padding 중 큰 값)만 |
| `loadingLabel` 타입 | `string`(접근성 이름) | `ReactNode` |
| `accessibilityHint` | 없음 | 있음 |
| root 역할 | `role="group"` | `accessibilityRole="toolbar"` |
| 그 밖 | HTML 속성·`className`·`style` 전달 | `testID`(`style`은 deprecated) |
| 빈 `label` | `TypeError` | 검사 없음(Button이 빈 이름으로 그려진다) |

## 함정

- Web `BottomCTA`의 `style`은 recipe CSS 변수 뒤에 펼쳐지므로 `--hjm-bottom-cta-*` 변수를 덮을 수 있다. 외형은 recipe 소유이므로 `style`로 변수를 바꾸지 않는다.
- Native는 하단 inset을 스스로 읽지 않는다. `safeAreaBottom`을 빠뜨려도 오류가 없고 홈 인디케이터에 붙어 보인다.
