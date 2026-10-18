# Badge

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-18
- 근거: recipe `badgeRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/배지`

## 언제 쓰나

항목의 상태나 분류를 짧은 글자 하나로 붙일 때 쓴다. "진행 중", "완료", "시즌 3"처럼 누를 수 없는 표시다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 읽지 않은 수·알림 점 | [CounterBadge](counter-badge.md) |
| 사용자가 붙인 키워드·카테고리 | [Tag](tag.md) |
| 누르거나 고르는 필터 | [Chip](chip.md) |
| 문장으로 설명해야 하는 상태 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Badge` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

## 최소 사용 예

```tsx
// Web
import { Badge } from "@hjmds/react/display";

<Badge tone="success" size="small">{t("order.status.done")}</Badge>
```

```tsx
// Native
import { Badge } from "@hjmds/react-native/data-display";

<Badge tone="success" size="small" label={t("order.status.done")} />
```

왼쪽 → 라벨 → 오른쪽 순서로 배치한다. 아이콘에는 배지 글자와 같은 색과 12~14 크기를 전달한다. 아이콘은 장식이며 별도 누르기 동작을 넣지 않는다.

```tsx
<Badge tone="success" leading={<Trophy size={12} color="currentColor" />} trailing={<Check size={12} color="currentColor" />}>완료</Badge>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `neutral` · `strong` · `brand` · `info` · `success` · `warning` · `attention` · `danger` | `neutral` | 단색 배경과 흰색 굵은 글자를 사용한다. `neutral`은 회색, `strong`은 더 진한 회색, 나머지는 각 의미의 solid fill이다. `outline`은 투명 배경과 의미색 글자다 |
| `variant` | `filled` · `outline` | `filled` | — |
| `size` | `small` · `medium` | `medium` | — |
| `leading` · `trailing` | `ReactNode` | — | 라벨 왼쪽·오른쪽 아이콘. 양쪽 동시 사용 가능하며 보조기기에서 숨겨진다 |
| Web `children` · Native `label` | `ReactNode` · `string \| number`(필수) | — | 표시 라벨 |
| Native `accessibilityLabel` | `string` | `String(label)` | 숫자 라벨에 단위를 붙여 읽힐 때 쓴다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`·`labelStyle`은 제거된 속성 — layoutStyle 또는 tone/토큰 |

콜백이 없다. 누를 수 없는 표시다.

## 배치

Web·Native 모두 `radius.sm`(8)의 둥근 사각형을 사용한다. 2026-10-18 사용자가 제시한 오늘야구 경기 상태 배지에 맞춘 공통 표현이다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 내용 폭만 차지한다. 최소 높이 `medium` 24 · `small` 20, 모서리 `radius.sm`. 누를 수 없는 표시라 44 터치 영역이 필요 없다(누르게 하려면 [Chip](chip.md)) | `badgeRecipe.sizes`, `.hjm-badge` |
| 간격 | 좌우 여백 `medium` `spacing.xs` 8 · `small` `spacing.xs` 8, 아이콘↔라벨 `spacing.xxs` 4. 여러 개를 나란히 둘 때는 `spacing.xxs` 4~`spacing.xs` 8 | `badgeRecipe.sizes` |
| 순서·정렬 | 제목·행 이름 옆(끝 쪽) 또는 카드 머리 위에 인라인으로 붙인다. 한 행에 2~3개를 넘기지 않는다 | `.hjm-badge`(`inline-flex`) |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 라벨이 줄바꿈된다(`overflow-wrap: anywhere`). 말줄임하지 않는다 | `.hjm-badge` |

## 꼭 지킬 것

- 라벨은 i18n 키로 넣고 짧게 둔다. 상태 뜻을 색에만 싣지 않는다(글자가 뜻을 말해야 한다).
- 색은 `tone`으로만 고른다. 브랜드 색을 `style`·`className`·`labelStyle`로 덮지 않는다.
- 배치는 Web·Native 모두 `layoutStyle`로만 한다. Native `style`·`labelStyle`은 제거된 속성이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 라벨 | `children` | `label`(문자열·숫자, 필수) |
| 접근성 이름 | 라벨 텍스트 | `accessibilityLabel`(기본 `String(label)`) |
| 배치 | `layoutStyle` | `layoutStyle`(`style`은 제거된 속성) |
| 라벨 스타일 훅 | 없음 | `labelStyle` 제거된 속성 — tone/토큰 |
| 기본 폭 | inline | `alignSelf: "flex-start"` |
