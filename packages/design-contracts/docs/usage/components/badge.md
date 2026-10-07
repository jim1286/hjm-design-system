# Badge

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
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

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `neutral` · `strong` · `brand` · `info` · `success` · `warning` · `attention` · `danger` | `neutral` | `brand`는 판이 중립색이고 글자만 브랜드색이다. 브랜드 틴트는 "선택됨"을 뜻하므로 정적 표시에 쓰지 않는다. `strong`은 `neutral`보다 한 단계 강한 잉크 판이며 승패처럼 한눈에 갈려야 하는 사실에 쓴다 |
| `variant` | `filled` · `outline` | `filled` | — |
| `size` | `small` · `medium` | `medium` | — |
| `leading` | `ReactNode` | — | 라벨 앞 아이콘 자리이며 보조기기에서 숨겨진다 |
| Web `children` · Native `label` | `ReactNode` · `string \| number`(필수) | — | 표시 라벨 |
| Native `accessibilityLabel` | `string` | `String(label)` | 숫자 라벨에 단위를 붙여 읽힐 때 쓴다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`·`labelStyle`은 deprecated — layoutStyle 또는 tone/토큰 |

콜백이 없다. 누를 수 없는 표시다.

## 배치

Native 모서리는 Provider token에서 recipe 역할을 읽는다. Badge의 `full`은 고정 pill 역할(999)이라 테마가 이를 사각형으로 바꾸지 않는다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 내용 폭만 차지한다. 최소 높이 `medium` 24 · `small` 20, 모서리 `radius.full`. 누를 수 없는 표시라 44 터치 영역이 필요 없다(누르게 하려면 [Chip](chip.md)) | `badgeRecipe.sizes`, `.hjm-badge` |
| 간격 | 좌우 여백 `medium` `spacing.xs` 8 · `small` `spacing.xxs` 4, 아이콘↔라벨 `spacing.xxs` 4. 여러 개를 나란히 둘 때는 `spacing.xxs` 4~`spacing.xs` 8 | `badgeRecipe.sizes` |
| 순서·정렬 | 제목·행 이름 옆(끝 쪽) 또는 카드 머리 위에 인라인으로 붙인다. 한 행에 2~3개를 넘기지 않는다 | `.hjm-badge`(`inline-flex`) |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 라벨이 줄바꿈된다(`overflow-wrap: anywhere`). 말줄임하지 않는다 | `.hjm-badge` |

## 꼭 지킬 것

- 라벨은 i18n 키로 넣고 짧게 둔다. 상태 뜻을 색에만 싣지 않는다(글자가 뜻을 말해야 한다).
- 색은 `tone`으로만 고른다. 브랜드 색을 `style`·`className`·`labelStyle`로 덮지 않는다.
- 배치는 Web·Native 모두 `layoutStyle`로만 한다. Native `style`·`labelStyle`은 deprecated(개발 모드 1회 경고, 다음 major 제거)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 라벨 | `children` | `label`(문자열·숫자, 필수) |
| 접근성 이름 | 라벨 텍스트 | `accessibilityLabel`(기본 `String(label)`) |
| 배치 | `layoutStyle` | `layoutStyle`(`style`은 deprecated) |
| 라벨 스타일 훅 | 없음 | `labelStyle` deprecated — tone/토큰 |
| 기본 폭 | inline | `alignSelf: "flex-start"` |
