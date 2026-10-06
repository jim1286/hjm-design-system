# Timeline

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Timeline](../../timeline.md), `src/timeline.ts`(`timelineRecipe`)
- 스토리북: `배포/컴포넌트/데이터 표시/타임라인`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Timeline` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

항목 타입 `TimelineItemDescriptor`는 `@hjmds/design-contracts/components/timeline`에 있다.

## 최소 사용 예

```tsx
// Web
import { Timeline } from "@hjmds/react/display";

// 상태 → i18n 키 상수 표. 키를 템플릿 문자열로 만들지 않는다.
const playEventKey = {
  hit: "pbp.event.hit",
  out: "pbp.event.out",
  run: "pbp.event.run",
} as const;

<Timeline
  items={plays.map((play) => ({
    id: play.id,
    label: t(playEventKey[play.kind]),
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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items`(필수) | `id`·`label` 필수, `timestamp`·`description`·`tone` 선택 | — | 배열 순서가 곧 표시 순서 |
| `items[].tone` | `neutral` · `info` · `success` · `attention` | `neutral` | `warning`·`danger`는 없다 |
| `composeAccessibleName`(필수) | `(info: { position: number, total: number, label: string }) => string` | — | position은 1부터 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| `style`(Native) | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |
| 나머지 | Web `<ol>` 속성, Native `ViewProps`(`style` 제외) | — | — |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 각 항목은 [레일 16][본문] 두 열. 레일은 지름 10의 dot과 다음 항목까지 이어지는 1px connector. 항목은 누를 수 없어 터치 영역 요구가 없고 행 안에 버튼을 넣지 않는다 | `timelineRecipe`, `.hjm-timeline__item`·`__dot`·`__connector` |
| 간격 | 항목 사이 `spacing.md` 16, 레일과 본문 열 간격 `spacing.sm` 12, 본문 줄 간격 `spacing.xxs` 4 | `timelineRecipe.gap`, `.hjm-timeline*` |
| 순서·정렬 | 본문은 label·timestamp 줄 → description. Web은 label과 timestamp를 한 줄 양 끝에 둔다 | `.hjm-timeline__heading` |
| 고정·스크롤 | 본문 스크롤 영역 안의 한 섹션으로 폭을 꽉 채운다. 더 불러오기는 Timeline 아래에 [LoadMore](load-more.md) | — |
| 좁은 폭·큰 글자 | Web은 좁으면 timestamp가 다음 줄로 내려간다(`flex-wrap`). 큰 글자에서도 글을 자르지 않는다 | `.hjm-timeline__heading`·`__label` |

## 꼭 지킬 것

- `timestamp`·`description`은 제품이 날짜·이닝을 이미 포맷한 문자열이다. Timeline은 시간 계산을 하지 않는다.
- 빈 배열, 중복 `id`, 앞뒤 공백이 있는 `id`, 빈 문자열 필드, 목록 밖 tone은 실행 중 오류를 던진다.
- 접근 이름의 어순은 언어마다 다르므로 `composeAccessibleName`은 i18n 키로 만든다.
- 제품 고유 색(구단 색 등)은 adapter에서 네 tone 중 하나로 먼저 매핑한다. dot 색을 직접 칠하지 않는다.
- 배치는 `layoutStyle`로 한다. Web `className`/`style`과 Native의 deprecated `style`로 dot·connector·글자 색을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `<ol>` / `<li>`, dot·connector `aria-hidden` | `View` 행, rail·본문은 접근성 트리에서 숨김 |
| 항목 접근 이름 | `<li aria-label={accessibleName}>` | `accessibleName, timestamp, description`을 이어 붙인 `accessibilityLabel` |
| ref | `HTMLOListElement`로 전달 | 없음(함수 컴포넌트) |
