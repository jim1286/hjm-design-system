# EmptyState 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Result와의 경계](../result.md#emptystate와의-경계), [ContentState 범위 축](../content-state.md),
recipe `emptyStateRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

목록이 비었거나 검색 결과가 0건이라 **아직 없음**을 알릴 때 쓴다. 조건이 바뀌면 다시 채워질 자리이고,
사용자는 그 화면에 머물며 필터를 바꾸거나 첫 항목을 만든다. 아이콘은 항상 중립색이고 상태 tone이 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 흐름이 끝남(결제 성공·실패 등) | [Result](result.md) |
| 화면 전체의 loading·empty·error·restricted 상태 | [ScreenLayout](screen-layout.md)의 `state` |
| 불러오는 중 | [Skeleton](skeleton.md), [Spinner](spinner.md) |
| 화면은 그대로 두고 알릴 문제 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `EmptyState` | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` | 기본 |

## 최소 사용 예

```tsx
// Web
import { EmptyState } from "@hjmds/react/feedback";

<EmptyState
  icon={<InboxGlyph />} // 제품 소유 아이콘
  title={t("inbox.empty.title")}
  description={t("inbox.empty.description")}
  action={<Button tone="secondary" onClick={compose}>{t("inbox.empty.compose")}</Button>}
/>
```

```tsx
// Native
import { EmptyState } from "@hjmds/react-native/feedback";

<EmptyState
  illustration={<InboxGlyph />} // 제품 소유 아이콘
  title={t("inbox.empty.title")}
  description={t("inbox.empty.description")}
  action={<Button tone="secondary" onPress={compose}>{t("inbox.empty.compose")}</Button>}
/>
```

## 축과 기본값

- `density`: `compact` · `regular`(기본). `compact`는 세로 여백이 작고 Native에서 남은 공간을 채우지 않는다.
- Native `align`: `center`(기본) · `upper`. `upper`는 `regular`일 때 내용을 위쪽(1:3 여백)에 둔다.
- Native `announcement`: `none`(기본) · `polite` · `assertive`. 상태가 바뀌어 빈 화면이 새로 나타날 때만 켠다.
- Native `titleRole`: 기본 `"header"`. Web은 항상 `role="status"`로 그린다.

## 꼭 지킬 것

- 제목·설명·행동 문구는 i18n 키로 넣는다. "검색 0건"과 "아직 만든 것 없음"은 다른 문구로 구분한다.
- 다음 행동이 있으면 `action`에 Button 하나를 둔다. 아이콘·일러스트는 장식이라 접근성에서 숨겨진다.
- Native는 `title`·`description`·`accessibilityLabel` 중 하나는 있어야 한다. 모두 없으면 `TypeError`를 던진다.
- 일러스트·아이콘 자산은 제품 소유다. 색은 recipe가 정하므로 슬롯 색을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그림 슬롯 | `icon`(ReactNode) | `illustration`(ReactNode, 아이콘 크기 상자) |
| `title` | 필수, ReactNode | 선택, string |
| `description` | ReactNode | string |
| 정렬·알림 | 없음 | `align`, `announcement`, `accessibilityLabel`, `titleRole` |
| 배치·슬롯 스타일 | `className`과 div 속성 | `style`, `illustrationStyle`, `titleStyle`, `descriptionStyle`, `actionStyle` |
