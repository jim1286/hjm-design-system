# CounterBadge 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: recipe `counterBadgeRecipe`(`src/counter-badge-recipe.ts`), 숫자 규칙 `formatCounterBadgeCount`(`src/counter-badge.ts`)

## 언제 쓰나

읽지 않은 알림·메시지·장바구니 수처럼 **셀 수 있는 개수**를 아이콘·행 옆에 작게 보일 때 쓴다.
0이면 아무것도 그리지 않고, `max`를 넘으면 `99+`처럼 줄인다. Web은 숫자 없이 "새것이 있음"만
알리는 점(`dot`)도 그린다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 상태·분류 텍스트(신규, 완료, 오류) | [Badge](badge.md), [Tag](tag.md) |
| 하단 탭의 개수 | [BottomNavigation](bottom-navigation.md) 항목의 `badge` |
| 큰 숫자 지표 | [Statistic](statistic.md) |
| 진행률 | [Progress](progress.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `CounterBadge` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

## 최소 사용 예

```tsx
// Web
import { CounterBadge } from "@hjmds/react/display";

<CounterBadge
  count={unread}
  accessibilityLabel={t("inbox.unreadCount", { count: unread })}
/>
```

```tsx
// Native
import { CounterBadge } from "@hjmds/react-native/data-display";

<CounterBadge
  count={unread}
  accessibilityLabel={t("inbox.unreadCount", { count: unread })}
/>
```

## 축과 기본값

- `tone`: `danger`(기본) · `brand` · `neutral`. `size`: `small` · `medium`(기본).
- `variant`: `inline`(기본) · `floating`. `floating`은 아이콘 모서리에 겹칠 때 쓰는 테두리 있는 판이다.
- `max`: 기본 `99`. 소수는 버리고 음수·`NaN`은 0으로 본다.
- `dot`(Web만, 기본 `false`): 숫자 대신 8px 점을 그린다.

## 꼭 지킬 것

- 이름을 붙이지 않으면 배지는 보조기술에서 숨겨진다. 부모(아이콘 버튼·행)의 접근성 이름이 개수를
  이미 말할 때만 `accessibilityLabel`을 생략한다. 빈 문자열을 넘기면 `TypeError`가 난다.
- `dot`에는 `accessibilityLabel`이 필수다(없으면 `TypeError`).
- 개수 표기·`+` 처리는 컴포넌트에 맡기고 `"99+"` 같은 문자열을 앱에서 만들지 않는다. 배지가 아닌
  자리에서 같은 표기가 필요하면 `formatCounterBadgeCount`(`@hjmds/design-contracts`, `/recipes`)를 쓴다.
- 색은 `tone`과 제품 테마 토큰으로 바꾼다. 배지 색을 직접 칠하지 않는다.
- Web 배치는 `layoutStyle`로 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `dot` | 있음 | 없음 |
| 배치 | `layoutStyle`(그 밖에 `span` 속성 전달) | `style` |
| ref | `HTMLSpanElement` | 없음 |

## 함정

- `dot`이어도 `count`가 0이면 아무것도 그리지 않는다(숫자 계산이 먼저 `null`을 돌려준다).
  점을 보이려면 `count`를 1 이상으로 넘긴다.
