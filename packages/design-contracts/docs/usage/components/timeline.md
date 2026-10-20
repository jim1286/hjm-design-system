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
| 항목별 짧은 배지 | `renderMetadata` 슬롯에 제품의 [Badge](badge.md) 또는 [Tag](tag.md)를 연결 |

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
| `items[].dateTime` | string | — | timestamp의 원래 시각. Web time의 dateTime에 연결하며 표시 문구를 바꾸지 않는다. timestamp와 함께 사용 |
| `items[].emphasized` | boolean | false | 기록 배경의 은은한 강조. 진행 커서·선택 상태를 만들지 않는다 |
| `items[].tone` | `neutral` · `info` · `success` · `attention` | `neutral` | `warning`·`danger`는 없다 |
| `composeAccessibleName`(필수) | `(info: { position: number, total: number, label: string }) => string` | — | position은 1부터 |
| `renderMetadata` | `(item: TimelineItemDescriptor) => ReactNode` | — | 제목 줄의 수동적 배지·메타데이터 |
| `renderActions` | `(item: TimelineItemDescriptor) => ReactNode` | — | 기록과 독립된 버튼. 행 전체를 누름 대상으로 만들지 않는다 |
| `renderList`(Native) | `({ items, renderItem, separator }) => ReactNode` | — | FlatList 등 가상화 host. 전달받은 renderItem과 separator를 사용하며 레일·본문을 다시 그리지 않는다 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| `style`(Native) | 지원하지 않음 | — | 제거된 속성 — `layoutStyle`. 현재 공개 props에서 제거되었다 |
| 나머지 | Web `<ol>` 속성, Native `ViewProps`(`style` 제외) | — | — |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 각 항목은 [레일 16][본문] 두 열. 레일은 지름 10의 dot과 다음 항목까지 이어지는 1px connector. 기록 본문은 누름 대상이 아니며 `renderActions`가 있으면 별도의 행동 열을 추가한다 | `timelineRecipe`, `.hjm-timeline__item`·`__dot`·`__connector` |
| 간격 | 항목 사이 `spacing.lg` 24, 각 항목 안쪽 `spacing.sm` 12, 레일과 본문 열 간격 `spacing.sm` 12, 본문 줄 간격 `spacing.xxs` 4 | `timelineRecipe.gap`, `.hjm-timeline*` |
| 순서·정렬 | 본문은 label·metadata → description → timestamp 순서다. dot은 label 첫 줄의 가운데에, 독립 행동은 기록 본문 높이의 가운데에 둔다. 강조 배경은 명시적 emphasized에만 적용한다 | `.hjm-timeline__heading`·`__dot`·`__timestamp`, Native `Timeline` |
| 고정·스크롤 | 본문 스크롤 영역 안의 한 섹션으로 폭을 꽉 채운다. 더 불러오기는 Timeline 아래에 [LoadMore](load-more.md) | — |
| 좁은 폭·큰 글자 | 제목과 metadata는 좁으면 줄바꿈하고 timestamp는 별도 줄에 둔다 | `.hjm-timeline__heading`·`__label` |

## 꼭 지킬 것

- `timestamp`·`description`은 제품이 날짜·이닝을 이미 포맷한 문자열이다. Timeline은 시간 계산을 하지 않는다.
- 빈 배열, 중복 `id`, 앞뒤 공백이 있는 `id`, 빈 문자열 필드, 목록 밖 tone은 실행 중 오류를 던진다.
- 접근 이름의 어순은 언어마다 다르므로 `composeAccessibleName`은 i18n 키로 만든다.
- 제품 고유 색(구단 색 등)은 adapter에서 네 tone 중 하나로 먼저 매핑한다. dot 색을 직접 칠하지 않는다.
- 배치는 `layoutStyle`로 한다. Web `className`/`style`과 Native에서 제거된 `style`로 dot·connector·글자 색을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `<ol>` / `<li>`, dot·connector `aria-hidden` | `View` 행, rail·본문은 접근성 트리에서 숨김 |
| 항목 접근 이름 | `<li aria-label={accessibleName}>` | `accessibleName, description, timestamp`을 이어 붙인 `accessibilityLabel` |
| ref | `HTMLOListElement`로 전달 | 없음(함수 컴포넌트) |

## 근거

- 첫 줄 가운데: 2026-10-17 정렬 실측(Web 402). dot 396 · label 397 · timestamp 398.5로 어긋났다(dot은 4px 고정 여백, timestamp는 작은 글자가 기준선을 공유). Native는 dot이 맨 위에 붙었다. 수정 후 Web 402·1280에서 세 요소가 397/397/397, 377/377/377로 측정됐다.

## 개발 소스 보완 (미게시)

2026-10-19 번뚝의 버전 기록이 레일·본문·되돌리기 버튼을 별도로 재구현하던 경로를 이관하기 위해 `renderMetadata`·`renderActions`를 추가했다. Native는 버튼을 기록의 접근성 묶음 밖 독립 타깃으로 유지한다. 긴 기록의 기존 가상화를 보존하기 위해 `renderList`에 검증된 전체 descriptor와 공통 행 renderer·간격을 전달한다. 제품은 host의 높이·스크롤·데이터 연결만 담당한다. 설치 패키지에 게시된 API라는 뜻은 아니다.

2026-10-19 사용자가 비교 시안 A 기록형을 선택했다. 양 renderer에 기록별 emphasized, 설명 아래 시간, 24px 기록 간격·12px 안쪽 여백과 이어지는 레일을 반영했다. 현재 버전의 의미·문구·시간 포맷은 제품이 연결하며 다른 기록을 앞으로 진행할 단계로 해석하지 않는다.

2026-10-19 다에리 여정 일지의 지도 연결 기록은 Timeline의 레일·본문·시각과 독립적인 renderActions 지도 선택 Button을 사용한다. 지도 선택은 해당 Button만 제어하며 Timeline 항목을 진행 커서나 선택 행으로 바꾸지 않는다. 원래 이벤트 시각을 보존하도록 선택적 items[].dateTime을 추가했다(Web time.dateTime; Native 표시 문구는 기존 timestamp). dateTime은 timestamp와 함께 사용한다. 이 변경도 개발 소스이며 미게시다.
