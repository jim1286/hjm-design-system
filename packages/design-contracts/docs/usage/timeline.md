# Timeline 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Timeline](../timeline.md), recipe `timelineRecipe`(`src/timeline.ts`)

## 언제 쓰나

이미 일어난 일을 시간 순서대로 보여 줄 때 쓴다. 경기 플레이 기록, 이적·변경 이력, 주문 처리
기록처럼 "무슨 일이 언제 있었나"를 위→아래 한 방향으로 나열한다. 현재 위치(커서)는 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 흐름에서 지금 어디에 있는지(현재 단계) | [Steps](steps.md) |
| 항목을 눌러 이동·선택 | [List](list.md), [ListRow](list-row.md) |
| 항목이 하나도 없음 | Timeline을 마운트하지 않고 [EmptyState](empty-state.md) |
| 과거 기록을 더 불러옴 | Timeline 아래에 [LoadMore](load-more.md)를 합성 |
| 항목별 짧은 배지 | 새 필드 없음. 제품 화면에서 [Tag](tag.md)로 조합 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Timeline` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

항목 타입 `TimelineItemDescriptor`는 `@hjmds/design-contracts/components/timeline`에 있다.

## 최소 사용 예

```tsx
// Web
import { Timeline } from "@hjmds/react/display";

<Timeline
  items={plays.map(play => ({
    id: play.id,
    label: t(`pbp.event.${play.kind}`),
    timestamp: formatInning(play.inning), // 제품이 포맷한 문자열
    tone: play.scored ? "success" : "neutral",
  }))}
  composeAccessibleName={({ position, total, label }) =>
    t("pbp.itemA11y", { position, total, label })}
/>
```

```tsx
// Native
import { Timeline } from "@hjmds/react-native/data-display";

<Timeline
  items={items}
  composeAccessibleName={({ position, total, label }) =>
    t("pbp.itemA11y", { position, total, label })}
/>
```

## 축과 기본값

- `items`(필수): `id`·`label` 필수, `timestamp`·`description`·`tone` 선택. 배열 순서가 곧 표시 순서다.
- `tone`: `neutral`(기본) · `info` · `success` · `attention`. `warning`·`danger`는 없다.
- `composeAccessibleName`(필수): `{ position, total, label }`(position은 1부터)로 항목의 접근 이름을 만든다.
- 그 밖의 prop은 Web `<ol>` 속성, Native `ViewProps`로 전달된다.

## 꼭 지킬 것

- `timestamp`·`description`은 제품이 날짜·이닝을 이미 포맷한 문자열이다. Timeline은 시간 계산을 하지 않는다.
- 빈 배열, 중복 `id`, 앞뒤 공백이 있는 `id`, 빈 문자열 필드, 목록 밖 tone은 실행 중 오류를 던진다.
- 접근 이름의 어순은 언어마다 다르므로 `composeAccessibleName`은 i18n 키로 만든다.
- 제품 고유 색(구단 색 등)은 adapter에서 네 tone 중 하나로 먼저 매핑한다. dot 색을 직접 칠하지 않는다.
- `className`/`style`은 배치에만 쓴다. dot·connector·글자 색을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `<ol>` / `<li>`, dot·connector `aria-hidden` | `View` 행, rail·본문은 접근성 트리에서 숨김 |
| 항목 접근 이름 | `<li aria-label={accessibleName}>` | `accessibleName, timestamp, description`을 이어 붙인 `accessibilityLabel` |
| ref | `HTMLOListElement`로 전달 | 없음(함수 컴포넌트) |
