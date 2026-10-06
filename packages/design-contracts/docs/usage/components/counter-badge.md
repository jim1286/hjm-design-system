# CounterBadge

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `counterBadgeRecipe`(`src/counter-badge-recipe.ts`), 숫자 규칙 `formatCounterBadgeCount`(`src/counter-badge.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/숫자 배지`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CounterBadge` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `danger` · `brand` · `neutral` | `danger` | — |
| `size` | `small` · `medium` | `medium` | — |
| `variant` | `inline` · `floating` | `inline` | `floating`은 아이콘 모서리에 겹칠 때 쓰는 테두리 있는 판 |
| `max` | 숫자 | `99` | 소수는 버리고 음수·`NaN`은 0으로 본다 |
| `dot` | `true` · `false` | `false` | Web만. 숫자 대신 8px 점을 그린다 |
| `count` | `number` | — (필수) | 0 이하면 아무것도 그리지 않는다 |
| `accessibilityLabel` | `string` | — | 없으면 보조기술에서 숨는다. 빈 문자열은 `TypeError` |
| `layoutStyle` | 배치 전용 style | — | 위치·여백만. Native `style`은 deprecated |

콜백 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `medium` 높이·최소 폭 20, `small` 높이·최소 폭 16, `dot` 8×8, 모두 `radius.full`. 자릿수가 늘면 폭만 늘어난다(`99+`). 터치 대상이 아니므로 누르는 것은 부모다 | `src/counter-badge-recipe.ts`, `packages/react/src/styles.css` `.hjm-counter-badge` |
| 간격 | 좌우 여백 `medium` `spacing.xs` 8, `small` `spacing.xxs` 4. `floating` 테두리 `stroke.strong` 2가 아이콘과 배지를 떼어 보인다 | `src/counter-badge-recipe.ts` |
| 순서·정렬 | `inline`: 탭 라벨·목록 행의 끝 쪽에 텍스트와 나란히 둔다. `floating`: 컴포넌트가 스스로 위치를 잡지 않으므로 부모를 relative로 두고 배지를 위·끝 모서리(`top: 0`, 끝 0)에 absolute로 놓는다. 공개된 `NotificationBell`(`/notification-bell`)이 IconButton 위에 이 배치를 그대로 쓴다 | `packages/react/src/notification-bell.tsx`, `packages/react-native/src/notification-bell.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | Web은 `flex-shrink: 0`이라 좁아져도 줄지 않는다 | `packages/react/src/styles.css` `.hjm-counter-badge` |

```text
inline (행 끝)                      floating (아이콘 모서리)
┌─────────────────────────────┐     ┌──────┐(3)  ← top 0, 끝 0
│ 받은 편지함          (12)   │     │  🔔  │
└─────────────────────────────┘     └──────┘  IconButton 44×44
```

## 꼭 지킬 것

- 이름을 붙이지 않으면 배지는 보조기술에서 숨겨진다. 부모(아이콘 버튼·행)의 접근성 이름이 개수를
  이미 말할 때만 `accessibilityLabel`을 생략한다. 빈 문자열을 넘기면 `TypeError`가 난다.
- `dot`에는 `accessibilityLabel`이 필수다(없으면 `TypeError`).
- 개수 표기·`+` 처리는 컴포넌트에 맡기고 `"99+"` 같은 문자열을 앱에서 만들지 않는다. 배지가 아닌
  자리에서 같은 표기가 필요하면 `formatCounterBadgeCount`(`@hjmds/design-contracts`, `/recipes`)를 쓴다.
- 색은 `tone`과 제품 테마 토큰으로 바꾼다. 배지 색을 직접 칠하지 않는다.
- 배치는 `layoutStyle`로 한다(Web·Native). Native `style`은 deprecated — 배치는 `layoutStyle`, 외형은 `tone`·`size`·`variant`로 옮긴다(개발 모드 1회 경고, 다음 major 제거).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `dot` | 있음 | 없음 |
| 배치 | `layoutStyle`(그 밖에 `span` 속성 전달, `style`과 합친다) | `layoutStyle`(`style`은 deprecated) |
| ref | `HTMLSpanElement` | 없음 |

## 함정

- `dot`이어도 `count`가 0이면 아무것도 그리지 않는다(숫자 계산이 먼저 `null`을 돌려준다).
  점을 보이려면 `count`를 1 이상으로 넘긴다.
