# Card

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-18
- 근거: recipe `cardRecipe`(`src/card.ts`), 바탕 `surfaceRecipe`(`src/base-recipes.ts`). 별도 계약 문서는 없다
- 스토리북: `배포/컴포넌트/데이터 표시/카드`

## 언제 쓰나

문서 metadata·미리보기·내보내기 상태는 실험 구성 [DocumentResource](../compositions/document-resource.md)를
먼저 대조한다. 2026-10-07 파일 사례에서 일반 카드만으로 다운로드/저장 상태까지 동등하다고
판단할 수 없음을 확인해 별도 구성으로 연결했다.


제목·설명·본문·행동이 한 덩어리로 읽히는 독립된 콘텐츠 단위에 쓴다. 주문 요약, 설정 묶음,
미리보기처럼 화면 안에서 경계가 보여야 하는 블록이 여기에 속한다. 위에서부터
`media` → `leading`+`title`+`description` → `children` → `actions` 순서가 고정이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록의 한 행(누르면 상세로 이동) | [ListRow](list-row.md) |
| 제목 없는 배경·테두리 영역만 필요 | [Surface](surface.md) |
| 숫자 하나가 주인공인 요약 | [Statistic](statistic.md) |
| 비어 있음·결과 안내 | [EmptyState](empty-state.md), [Result](result.md) |
| 접고 펴는 묶음 | [Collapsible](collapsible.md), [Accordion](accordion.md) |
| 화면 섹션 제목과 본문 묶음 | [Section](section.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Card` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `DocumentResource` | 실험 문서 구성 | `@hjmds/react/document-resource` | `@hjmds/react-native/document-resource` |

## 최소 사용 예

```tsx
// Web
import { Card } from "@hjmds/react/display";
import { Button } from "@hjmds/react/actions";

<Card
  title={t("order.summary.title")}
  description={t("order.summary.description")}
  actions={<Button tone="secondary" onClick={openDetail}>{t("order.summary.detail")}</Button>}
>
  {summary}
</Card>
```

```tsx
// Native
import { Card } from "@hjmds/react-native/data-display";
import { Button } from "@hjmds/react-native/actions";

<Card
  title={t("order.summary.title")}
  description={t("order.summary.description")}
  actions={<Button tone="secondary" onPress={openDetail}>{t("order.summary.detail")}</Button>}
>
  {summary}
</Card>
```

## 축과 기본값

2026-10-18 사용자 요청으로 오늘야구 경기일정의 입체 카드 표현을 공통 기본값으로 채택했다.
Web·Native 모두 기존 `raised` Surface의 테두리·그림자를 재사용하며, 그림자는 바깥 프레임에,
콘텐츠의 둥근 모서리 클리핑은 안쪽에 유지한다. 배경 영역인 `Surface`의 기본값은 바꾸지 않는다.
기존 평면 표현이 필요한 소비자는 `tone="default"`를 명시한다. 이 변경의 npm 게시와 앱 버전 갱신은 별도다.

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `default` · `raised` · `accent` · `sunken` · `subtle`(Surface tone) | `raised` | 테두리와 공통 floating shadow로 입체감 표시. 평면 카드는 `tone="default"` 지정 |
| `bordered` | `boolean` | `true` | Surface 기본 `false`와 다르다 |
| `padding` | spacing 이름 | `md`(16) | — |
| `radius` | radius 이름 | `lg`(foundation 16) | 선택한 designProfile의 같은 radius 역할로 frame과 media clip을 함께 변경 |
| `selected` | `boolean` | `false` | `true`면 tone이 `accent`로 바뀐다(`cardRecipe.selectedTone`) |
| `headingLevel`(Web만) | `2` · `3` · `4` | `3` | 제목이 `h3`로 렌더되므로 문서 위계에 맞춰 고른다 |
| `title` · `description` · `leading` · `media` · `actions` · `children` | `ReactNode` | — | 슬롯. 순서는 HJM이 고정한다 |
| `onActivate` | `() => void` | — | 카드 전체가 하나의 행동일 때 사용(미게시). Web `aria-label`, Native `accessibilityLabel` 필수. `actions`와 함께 쓰면 행동은 별도 대상으로 남는다(1.31.0 추가) |
| `disabled` | `boolean` | `false` | 전체 카드 행동 차단·비활성 피드백(미게시) |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. 두 플랫폼 모두 root Surface에 적용된다 |

### 카드 전체 누름(미게시)

2026-10-10 번뚝의 세 열 시작점 선택에서 별도 선택 버튼이 좁은 카드의 절반을 차지했다.
`onActivate`는 기존 Card의 구조를 유지하면서 전체 표면을 하나의 행동으로 만든다.
제품이 Card 바깥에 Pressable을 다시 조립하는 대신 HJM이 버튼 역할, 선택·비활성 상태,
44pt 최소 대상, 눌림·초점 피드백을 소유한다. 같은 카드를 다시 눌러도 콜백을 호출하므로
제품이 수정된 초안 교체 확인을 처리할 수 있다. RadioGroup은 단일 옵션 값 변경용이며,
이처럼 같은 항목을 다시 실행하는 카드 동작을 대신하지 않는다.

```tsx
<Card aria-label={starter.title} onActivate={() => choose(starter)}
  selected={selectedId === starter.id} disabled={pending} bordered={selectedId === starter.id} padding="sm">
  <span>{starter.emoji} {starter.title}</span>
</Card>
// Native는 aria-label 대신 accessibilityLabel을 전달한다.
```

children·media·leading에는 입력/링크/버튼을 넣지 않는다. 카드를 여는 행동과 별도 명령(삭제·더보기)이
함께 필요하면 명령을 `actions`에 둔다.

### 카드 열기와 별도 행동(1.31.0 추가)

2026-10-18 unairplane 홈 여정 카드는 카드 전체로 상세를 열고 삭제는 따로 해야 했다. 이전에는 `onActivate`와
`actions`가 상호 배제라 제품이 카드 안에 Pressable을 다시 조립하고 삭제를 별도 footer로 붙였다.
이제 둘을 함께 주면 HJM이 버튼 안 버튼 없이 두 대상을 나눈다.

```tsx
// Native
<Card accessibilityLabel={flightLabel} accessibilityHint={t("journey.openHint")} title={route} description={flightNumber}
  onActivate={openJourney}
  actions={<IconButton label={t("journey.delete", { flight: flightNumber })} tone="ghost" size="small" edge="start" onPress={confirmDelete}>
    <Icon descriptor={{ name: "delete", tone: "danger" }} renderGlyph={renderSemanticGlyph} />
  </IconButton>}>
  {schedule}
</Card>
// Web은 accessibilityLabel 대신 aria-label, onPress 대신 onClick을 쓴다.
```

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | root는 `<article>`로 남고, 카드 전체를 덮는 투명 `<button>`(`data-slot="activator"`)이 이름·`aria-pressed`·`disabled`를 가진다. 행동 영역만 그 위에 놓인다 | media+본문이 하나의 `Pressable`(버튼 role·이름·선택/비활성 상태), 행동 줄은 그 형제다 |
| 누르는 영역 | 행동 버튼을 뺀 카드 전체(행동 줄의 빈 자리 포함) | media+본문. 행동 줄의 빈 자리는 누름 대상이 아니다 |
| 초점·낭독 순서 | 카드 → 행동 | 카드 → 행동(각각 별도 접근성 요소) |
| 눌림·비활성 피드백 | media·본문만 흐려진다. 행동은 자기 상태를 쓴다 | 같음 |

- `disabled`는 카드 열기만 막는다. 행동을 막으려면 그 버튼의 `disabled`를 따로 준다.
- 행동은 `actions`에 직접 넣는다. Web은 행동 영역의 직계 자식만 누름을 받으므로, 행동을 넓은 묶음으로 감싸면
  그 묶음의 빈 자리도 카드 열기가 아니라 묶음이 받는다. 행동을 끝 쪽에 두려면 묶음으로 감싸지 말고 첫 행동의
  `layoutStyle`에 Web `{ marginInlineStart: "auto" }`, Native `{ marginStart: "auto" }`를 준다(행동 줄은 시작 쪽부터 놓인다).
- `actions` 없이 `onActivate`만 주면 기존처럼 root 자체가 버튼(Web `<button>`, Native `Pressable`)이다.
기존 passive Card는 콜백 없이 동일하게 유지된다. 이 API는 로컬 source/candidate 단계이며
npm 게시 및 소비 제품의 게시 버전 채택 완료를 뜻하지 않는다.

2026-10-07 [확장 카드·그리드 대조](../../../../../docs/plans/aceternity-interaction-adoption-2026-10-07.md)에서
카드와 상세 표시를 별도 새 카드 엔진으로 복제할 필요가 없는 경우를 확인했다. 상세는 `actions`의
Button으로 [Dialog](dialog.md)를 열고, 위치 연결이 필요하면 Dialog의 `motionOrigin`을 사용한다.
같은 흐름 안에서 내용을 늘릴 때는 [Collapsible](collapsible.md)를 고른다. 이미지·제목이 각각 이동하는
shared-element 효과와 일반 상세 Dialog는 다르며, 전자를 제공한다고 안내하지 않는다.

### 프로필 표면 질감(1.15.0 추가)

선택한 `designProfile.material.surface`를 자동으로 읽는다. glass는 지원하는 Web에서 실제 배경 흐림,
clay는 안쪽 그림자를 사용한다. Native는 루트 Provider의 선택형 `surfaceEffects` host와 inset capability를
한 번 등록한다. 사용할 수 없거나 투명도 줄이기 설정이면 불투명 표면을 유지한다. 효과와 입력은 서로 다른
subtree라 질감을 바꾸거나 host가 실패해도 본문/초안은 유지한다. [범위·등록·대비 계약](../../design-profile.md#surfacecard의-유리클레이-질감)을 따른다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭을 채우고 높이는 내용이 정한다. 모서리 `radius.lg` 16, 테두리 기본 있음. `media` 자식은 폭 100%(비율은 [AspectRatio](aspect-ratio.md)로) | `cardRecipe.defaults`, `.hjm-card__media > *` |
| 간격 | 본문 안쪽 `spacing.md` 16, 본문 요소 사이 `spacing.xs` 8, leading↔제목 `spacing.sm` 12. 행동 영역은 좌우·아래 `spacing.md` 16, 버튼 사이 `spacing.sm` 12. 카드 목록 사이 간격은 부모 [Stack](stack.md)·[Grid](grid.md)이 정한다 | `cardRecipe.body`·`header`·`actions`, `.hjm-card*` |
| 순서·정렬 | 위→아래 `media` → [`leading` + `title`/`description`] → `children` → `actions` 고정. leading은 시작 쪽 위 정렬. 행동은 시작 쪽부터 한 줄로 놓인다 | `cardRecipe.slots`, `.hjm-card__header`·`__actions` |
| 고정·스크롤 | 고정 영역이 없다. 카드 안에서 스크롤 영역을 만들지 않는다(넘치면 `overflow: hidden`으로 잘린다) | `.hjm-card { overflow: hidden }` |
| 좁은 폭·큰 글자 | 제목·설명이 줄바꿈되고, 행동은 줄바꿈된다(`flex-wrap: wrap`) | `.hjm-card__title`, `.hjm-card__actions`, `react-native/src/data-display.tsx` |

## 꼭 지킬 것

- 제목·설명·행동 라벨은 i18n 키로 넣는다. 제품 데이터는 `children`과 `media`에 둔다.
- `media`(대표 이미지·일러스트)는 제품 소유다. 카드 모서리 clip과 구조는 HJM이 맡는다.
- 색·radius·padding은 `tone`·`radius`·`padding` 축으로만 바꾼다. 카드마다 브랜드 색을 칠하지 않는다.
- 배치는 두 플랫폼 모두 `layoutStyle`로 한다. Native `CardProps`에는 `style`이 없다. Web의 `className`·`style`로 recipe 값을 덮지 않는다.
  카드 목록 사이 간격은 바깥 [Stack](stack.md)·[Grid](grid.md)이 정한다.
- 카드 전체 행동은 `onActivate`만 사용한다. 카드 안 별도 명령은 `actions`에 두고 children에 버튼을 넣지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| root | 기본 `<article>`, 전체 행동은 `<button type="button">`, 전체 행동+`actions`는 `<article>` + 덮개 `<button>` | 기본 `View`(Surface), 전체 행동은 `Pressable`, 전체 행동+`actions`는 media·본문 `Pressable` + 형제 행동 줄 |
| 제목 | `h{headingLevel}` | `Text` + `accessibilityRole="header"`, 수준 지정 없음 |
| 배치 | `layoutStyle` | `layoutStyle` |
| 내용 clip | tone의 `clipsContent`(`raised`는 그림자 때문에 clip 안 함) | 내부 `View`가 항상 clip, 그림자는 바깥에 남는다. frame과 clip이 같은 Provider radius token을 사용 |

## 함정

- `radius="lg"`는 모든 테마에서 16px이라는 뜻이 아니다. foundation에서는 16이고, designProfile이
  등록되면 그 테마의 `tokens.radius.lg`를 쓴다. 2026-10-07 카드 갤러리 비교에서 Native의 바깥
  Surface만 테마를 따르고 내부 media clip은 foundation 값을 쓰는 누락을 발견해 같은 token으로 연결했다.

- passive Card의 `selected`는 tone 표시다. 전체 행동 Card는 Web `aria-pressed`, Native `accessibilityState.selected`로도 선택을 알린다.
