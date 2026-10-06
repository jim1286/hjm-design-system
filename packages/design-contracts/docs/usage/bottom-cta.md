# BottomCTA 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [화면 제목과 마지막 행동](../screen-chrome.md), recipe `bottomCtaRecipe`(`src/component-recipes.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `BottomCTA` | `@hjmds/react`, `/bottom-cta` | `@hjmds/react-native`, `/actions`, `/bottom-cta` | 기본 |

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

const insets = useSafeAreaInsets();
<BottomCTA
  safeAreaBottom={insets.bottom}
  primaryAction={{ label: t("checkout.pay"), onPress: pay, loading: paying }}
  secondaryAction={{ label: t("common.cancel"), onPress: cancel }}
/>
```

## 축과 기본값

- `primaryAction`은 필수다. tone 기본 `primary`, `secondaryAction`은 기본 `secondary`. 각 action의 `tone`·`size`로 바꿀 수 있다.
- `secondaryAction`은 action 객체 또는 제품이 만든 ReactNode다. 객체면 HJM Button으로 그린다.
- `safeAreaBottom` 기본 `0`. 음수·무한대는 `RangeError`.
- Web `position`: `flow`(기본) · `sticky`. fixed는 제공하지 않는다.
- 큰 글자에서는 두 행동을 세로로 쌓고 주 행동을 아래에 둔다(Native는 `textScale >= 1.6`, Web은 `isLargeTextScale`).

## 꼭 지킬 것

- action `label`은 i18n 키로 넣고 비우지 않는다. Web은 빈 label에 `TypeError`를 던진다.
- 진행 중은 action의 `loading`으로 표시한다. 버튼 위에 Spinner를 따로 겹치지 않는다.
- 주 행동은 하나다. 세 번째 행동이 필요하면 화면 구조를 다시 본다.
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
| 그 밖 | HTML 속성·`className`·`style` 전달 | `style`, `testID` |
