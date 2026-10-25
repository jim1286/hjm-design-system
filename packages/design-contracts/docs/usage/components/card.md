# Card

2026-10-25 번뚝 글자 크기 리뷰 반영(개발 소스·미게시): 카드 제목은 `bodyLarge` 16/24, `medium` 굵기를 사용한다. 반복 카드가 페이지 제목과 경쟁하지 않도록 양 renderer에 동일하게 적용한다.

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-18
- 근거: recipe `cardRecipe`(`src/card.ts`), 바탕 `surfaceRecipe`(`src/base-recipes.ts`). 별도 계약 문서는 없다
- 스토리북: `배포/컴포넌트/데이터 표시/카드` · `배포/컴포넌트/데이터 표시/인용 카드`

## 언제 쓰나

인용문과 출처를 묶으면 미게시 동반 API [`QuoteCard`](#인용문과-출처quotecard-미게시)를 사용한다. 일반 카드에 인용 표시·출처 여백을 다시 조립하지 않는다.

문서 metadata·미리보기·내보내기 상태는 실험 구성 [DocumentResource](../compositions/document-resource.md)를
먼저 대조한다. 2026-10-07 파일 사례에서 일반 카드만으로 다운로드/저장 상태까지 동등하다고
판단할 수 없음을 확인해 별도 구성으로 연결했다.


제목·설명·본문·행동이 한 덩어리로 읽히는 독립된 콘텐츠 단위에 쓴다. 주문 요약, 설정 묶음,
미리보기처럼 화면 안에서 경계가 보여야 하는 블록이 여기에 속한다. 위에서부터
`media` → `badges` → `leading`+`title`+`description` → `children` → `actions` 순서가 고정이다.

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
| `QuoteCard` | 미게시 인용문·출처 동반 API | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
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
| `tone` | `default` · `raised` · `accent` · `sunken` · `subtle` · `selected`(Surface tone) | `raised` | 테두리와 공통 raised shadow로 입체감 표시. 평면 카드는 `tone="default"` 지정 |
| `badgesAlign` | `start` · `center` | `start` | 미게시. 들판 대표 카드처럼 그림 아래의 배지 묶음을 가운데 배치할 때 `center` 사용. 줄바꿈된 행에도 적용 |
| `bordered` | `boolean` | `true` | Surface 기본 `false`와 다르다 |
| `padding` | spacing 이름 | `md`(16) | — |
| `radius` | radius 이름 | `lg`(foundation 16) | 선택한 designProfile의 같은 radius 역할로 frame과 media clip을 함께 변경 |
| `selected` | `boolean` | `false` | `true`면 tone이 `selected`로 바뀐다(`cardRecipe.selectedTone`) |
| `headingLevel`(Web만) | `2` · `3` · `4` | `3` | 제목이 `h3`로 렌더되므로 문서 위계에 맞춰 고른다 |
| `title` · `description` · `leading` · `media` · `badges` · `actions` · `children` | `ReactNode` | — | 슬롯. 순서는 HJM이 고정한다 |
| `headerActions` | `ReactNode` | 없음 | 미게시. 제목 줄 끝의 배지·독립 명령. 카드 열기와 별도 대상으로 남으며 HJM이 위치와 제목 여유 폭을 소유한다 |
| `onActivate` | `() => void` | — | 카드 전체가 하나의 행동일 때 사용(미게시). Web `aria-label`, Native `accessibilityLabel` 필수. `actions`와 함께 쓰면 행동은 별도 대상으로 남는다(1.31.0 추가) |
| `href` · `renderLink` (Web) | 문자열 목적지 · anchor props 렌더러 | 없음 | 미게시. 전체 카드 링크. `aria-label` 필수, onActivate/mediaAction/backgroundMedia와 배타. Next 등 라우팅·제품 부수 효과는 renderLink로 연결한다. 비활성은 href 제거·tab 제외로 차단한다 |
| `backgroundInteraction` · `mediaBadges` | `ReactNode` | 없음 | 미게시. 배경 카드 전용 제스처/접근성 대상과 상단 끝 분류 배지. 아래 설명 참조 |
| `backgroundMedia` | `ReactNode` | 없음 | 장식용 배경 그림. 아래 미게시 배경 카드 계약 참조 |
| `mediaAction` | `{ label, onActivate, icon?: ({ color, size }) => ReactNode }` | 없음 | 커버만 누를 때 사용. `media`는 수동 콘텐츠이며 별도 버튼을 넣지 않는다. 전체 `onActivate`와 함께 쓰지 않는다. 아이콘은 HJM이 커버 끝 아래의 원형 판에 장식으로 배치한다. 미게시 |
| `disabled` | `boolean` | `false` | 전체 카드 행동 차단·비활성 피드백(미게시) |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. 두 플랫폼 모두 root Surface에 적용된다 |

2026-10-20 번뚝 내 뚝의 짧은 안내와 편집 버튼에서 세로 중심이 어긋나는 것을 확인했다.
머리줄의 leading·제목/설명 묶음·headerActions는 같은 세로 중심을 사용한다. 긴 문구가 줄바꿈돼도
명령은 해당 머리줄의 중앙에 남으며, Native에서도 카드 열기와 별도의 접근성 대상으로 유지한다.

같은 날 다에리 여정 카드 이관에서 부모가 부여한 높이가 수동 카드의 본문까지 전달되지 않는 것을
확인했다. 카드가 할당 높이를 받으면 본문과 content 슬롯도 남은 높이를 채운다. 머리줄·media·actions는
내용 높이를 유지한다. 제품은 content 안의 Stack 등 공개 배치로 하단 요소를 정렬할 수 있다.
배경 그림 카드의 본문은 기존처럼 내용 높이로 아래에 놓인다.

### 그림을 배경으로 쓰는 카드(미게시)

2026-10-18 번뚝 추천/피드 머리에서 카드 위 배지·제목·그늘을 제품마다 별도로 조립하고 있었다.
`backgroundMedia`는 기존 Card의 `badges` → 제목/설명 → 본문 → 행동 순서를 장식용 그림 위에 놓는다.
`media`는 본문 위의 독립 커버이고 `backgroundMedia`는 카드 전체의 배경이다. 새 카드 이름을 만들지 않는다.

- `backgroundMedia`는 수동 장식 ReactNode이며 접근성 트리와 포인터 대상에서 제외한다. 의미 있는 설명은 title/description에 전달한다.
- `media`, `mediaAction`, 전체 `onActivate`와 함께 쓰지 않는다. 실행·작성자·댓글 등은 본문/`actions`의 독립 행동으로 제공한다.
- Web/Native 모두 recipe의 60% 검은 그늘과 흰 제목/설명을 사용한다. 브랜드 onPrimary가 어두워도 배경 그림 위 글자를 바꾸지 않는다.
- 배지 슬롯은 본문 시작에 가로·줄바꿈·8 간격으로 놓인다. 각 배지의 의미/값은 제품이 `Badge`로 공급한다.
- 높이는 콘텐츠 또는 호스트 viewport가 공급한다. 정해진 영역을 채울 때 호스트 안에서 `layoutStyle={{ flex: 1 }}`을 사용한다. 카드 자체의 클리핑·간격·모서리를 제품 CSS로 덮지 않는다.
- `backgroundInteraction`은 미게시 배경 카드의 독립 제스처·접근성 host다. `backgroundMedia`가 필수이며 장식 그림 위, 본문/행동 아래에 놓인다. 번뚝의 adjustable 넘기기 대상을 수동 그림에 넣으면 접근성 트리에서 사라지는 문제 때문에 분리했다. 제품의 경로/제스처 판정만 연결하며 제목·작성자·행동 배치를 이 슬롯에 복제하지 않는다.
- `mediaBadges`는 미게시 배경 카드 상단 끝의 비대화형 분류 표시다. HJM이 inset·간격·겹침 순서를 맡고 제품은 Badge/브랜드 분류 콘텐츠만 공급한다. `backgroundMedia` 없이 쓰면 오류다. 일반 상태는 본문 시작 `badges`를 사용한다.
- 커버 이미지의 구도·crop·브랜드 artwork는 제품 콘텐츠다. 카드의 그늘·제목·배지·행동 위치는 HJM이다.

```tsx
// Web
<Card backgroundMedia={<Artwork />} title={t("featured.title")}
  badges={<Badge tone="neutral">{t("featured.status")}</Badge>}
  actions={<Button onClick={open}>{t("featured.open")}</Button>} />
// Native: 같은 slots. Badge는 label={t("featured.status")}, Button은 onPress={open}
```

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
함께 필요하면 하단 명령은 `actions`, 제목 오른쪽의 명령은 `headerActions`에 둔다.

2026-10-19 번뚝 목록은 제목·상태 배지·신고를 제품의 Surface/Button과 절대 위치로 다시 조립하고 있었다.
`headerActions`는 이 우상단 독립 영역을 제공한다. Web은 header flex 행 끝, Native는 실제 측정한 명령 폭과
헤더 위치를 기준으로 본문 활성 대상 밖에 배치한다. 앱에서 신고 크기만큼 제목 padding을 다시 계산하지 않는다.
예를 들어 `headerActions={<><Badge label={statusLabel} /><IconButton label={reportLabel} onClick={report} /></>}`처럼 연결한다
(Native는 `onPress`). 카드 열기에는 별도의 `aria-label`/`accessibilityLabel`과 `onActivate`를 전달한다.
명령을 `children`, `leading`, `title`에 넣지 않는다. 슬롯이 있으면 카드 활성 대상은 명령과 독립되므로 버튼이 중첩되지 않는다.

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
| 구조 | root는 `<article>`로 남고, 카드 전체를 덮는 투명 `<button>`(`data-slot="activator"`)이 이름·명시된 선택 상태(`aria-pressed`)·`disabled`를 가진다. 행동 영역만 그 위에 놓인다 | media+본문이 하나의 `Pressable`(버튼 role·이름·선택/비활성 상태), 행동 줄은 그 형제다 |
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
| 간격 | 본문 안쪽 `spacing.md` 16, 본문 요소 사이 `spacing.xs` 8, leading↔제목 `spacing.sm` 12. 행동 영역은 좌우·아래 `spacing.md` 16, 버튼 사이 `spacing.xs` 8. 카드 목록 사이 간격은 부모 [Stack](stack.md)·[Grid](grid.md)이 정한다 | `cardRecipe.body`·`header`·`actions`, `.hjm-card*` |
| 순서·정렬 | 위→아래 `media` → [`leading` + `title`/`description`] → `children` → `actions` 고정. leading은 시작 쪽 위 정렬. 행동은 시작 쪽부터 한 줄로 놓인다 | `cardRecipe.slots`, `.hjm-card__header`·`__actions` |
| 고정·스크롤 | 고정 영역이 없다. 카드 안에서 스크롤 영역을 만들지 않는다(넘치면 `overflow: hidden`으로 잘린다) | `.hjm-card { overflow: hidden }` |
| 좁은 폭·큰 글자 | 제목·설명이 줄바꿈되고, 행동은 줄바꿈된다(`flex-wrap: wrap`) | `.hjm-card__title`, `.hjm-card__actions`, `react-native/src/data-display.tsx` |

## 꼭 지킬 것

- 제목·설명·행동 라벨은 i18n 키로 넣는다. 제품 데이터는 `children`과 `media`에 둔다.
- `media`(대표 이미지·일러스트)는 제품 소유다. 카드 모서리 clip과 구조는 HJM이 맡는다.
- 색·radius·padding은 `tone`·`radius`·`padding` 축으로만 바꾼다. 카드마다 브랜드 색을 칠하지 않는다.
- 배치는 두 플랫폼 모두 `layoutStyle`로 한다. Native `CardProps`에는 `style`이 없다. Web의 `className`·`style`로 recipe 값을 덮지 않는다.
  카드 목록 사이 간격은 바깥 [Stack](stack.md)·[Grid](grid.md)이 정한다.
- 카드 전체 명령은 `onActivate`, Web 목적지 이동은 `href`·`renderLink`를 사용한다. 카드 안 별도 명령은 `actions`에 두고 children에 버튼을 넣지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| root | 기본 `<article>`, 전체 행동은 `<button type="button">`, 전체 행동+`actions`는 `<article>` + 덮개 `<button>`, `href`는 이름 있는 별도 `<a>` | 기본 `View`(Surface), 전체 행동은 `Pressable`, 전체 행동+`actions`는 media·본문 `Pressable` + 형제 행동 줄 |
| 제목 | `h{headingLevel}` | `Text` + `accessibilityRole="header"`, 수준 지정 없음 |
| 배치 | `layoutStyle` | `layoutStyle` |
| 내용 clip | tone의 `clipsContent`(`raised`는 그림자 때문에 clip 안 함) | 내부 `View`가 항상 clip, 그림자는 바깥에 남는다. frame과 clip이 같은 Provider radius token을 사용 |

## 함정

- `radius="lg"`는 모든 테마에서 16px이라는 뜻이 아니다. foundation에서는 16이고, designProfile이
  등록되면 그 테마의 `tokens.radius.lg`를 쓴다. 2026-10-07 카드 갤러리 비교에서 Native의 바깥
  Surface만 테마를 따르고 내부 media clip은 foundation 값을 쓰는 누락을 발견해 같은 token으로 연결했다.

- passive Card의 `selected`는 tone 표시다. 전체 행동 Card는 Web `aria-pressed`, Native `accessibilityState.selected`로도 선택을 알린다.
  Web에서 `selected`를 생략한 일반 행동 카드에는 `aria-pressed`를 붙이지 않는다. 선택형 카드만
  `true|false`를 명시한다(2026-10-19 일반 이동이 토글로 읽히던 결함 수정). 기본 모양은 선택되지 않은 상태다.

커버 실행·작성자·댓글/공유처럼 목적지가 여러 개인 카드는 전체 `onActivate` 대신 `mediaAction`으로 커버 실행을 연결하고 본문/`actions`의 공개 버튼을 독립 대상으로 둔다. 번뚝 Web/Native가 각각 버튼·재생 판 위치를 조립하던 중복을 보완했다(2026-10-18). 커버의 색과 그림·비율은 제품 `media` 슬롯에 남는다.


## 인용문과 출처(QuoteCard, 미게시)

### 선택과 소유권

요청 원문·작성자의 발언처럼 다른 내용과 구분되는 인용문을 출처/시각과 함께 보여 줄 때 사용한다.
2026-10-18 번뚝 피드와 이야기 화면이 인용 표시·본문·출처·카드 여백을 반복 구현하던 문제에서 분리했다.
일반 정보 묶음은 Card, 라벨–값 목록은 DescriptionList, 펼침은 Collapsible을 그대로 쓴다.
QuoteCard는 새 표면 엔진이 아니라 Card의 인용 의미와 본문/출처 순서를 고정하는 동반 API다.

### QuoteCard import

| API | Web | Native |
| --- | --- | --- |
| QuoteCard · QuoteCardProps | `@hjmds/react/display` 또는 root | `@hjmds/react-native/data-display` 또는 root |

### 배치와 props

위→아래: 장식 인용 표시 → 본문(children) → 출처(attribution). Card의 기본 raised 표면·테두리·모서리·본문 여백을 재사용한다.
본문과 출처 사이는 `spacing.xs` 8이다. 출처는 caption/muted이며 제품이 이름·버전·시각·locale을 포맷한다.
Web은 실제 blockquote와 footer를 사용한다. Native는 같은 순서를 유지하고, 본문에 넣은 원문 펼침 버튼을 별도 대상으로 남긴다.
장식 표시는 읽기 트리에서 제외한다. 왼쪽 인용 선은 그리지 않는다.

| prop | 의미 |
| --- | --- |
| children | 제품의 인용문 또는 HJM 구조(List·DescriptionList·Collapsible) |
| attribution? | 포맷된 출처 문자열. 없으면 출처 줄도 없음 |
| renderMark? | `(context: { color, size }) => ReactNode`. 기본은 인용 부호. 제공된 색/크기로 제품 아이콘을 연결할 수 있다. Web 색은 currentColor, Native는 contentBrand. 크기는 glyph.md |
| layoutStyle? | 공통 배치 전용 속성. 표면/글자/간격을 덮지 않는다 |

```tsx
// Web
import { QuoteCard } from "@hjmds/react/display";
import { Text } from "@hjmds/react/layout";
<QuoteCard attribution={formattedAttribution}><Text>{quote}</Text></QuoteCard>;
```

```tsx
// Native
import { QuoteCard } from "@hjmds/react-native/data-display";
import { Text } from "@hjmds/react-native/primitives";
<QuoteCard attribution={formattedAttribution}><Text>{quote}</Text></QuoteCard>;
```

조회/권한/원문 소유권·요약 규칙은 제품에 둔다. 원문을 접고 펼칠 때 Collapsible을 children에 연결하며,
QuoteCard가 자동으로 원문을 자르거나 열지 않는다. 이 API의 소스 적용·검증과 npm 게시를 구분한다.

### 전체 목적지 링크 (미게시)

다에리 편지·장소 기록은 새 탭·가운데 클릭·링크 미리보기를 보존해야 하므로 버튼 callback으로 바꾸지 않는다. `href`는 공통 카드의 media·본문을 덮는 별도 이름 있는 anchor를 만들고, `actions`는 그 위의 독립 대상으로 남긴다. 본문/그림은 링크 이름에 모두 합치지 않고 `aria-label`에 제품이 고른 짧은 이름을 준다. 프레임워크 링크·소리·초안 정리는 `renderLink`가 받은 href/className/접근성 props를 그대로 전달하면서 연결한다. 카드·배지 위치·표면·누름 피드백을 제품 CSS로 다시 조립하지 않는다. Native 목적지 이동은 기존 `onActivate` 콜백으로 연결한다.

<!-- usage-example: Web ../../../../../showcase/web/src/components/Card.stories.tsx -->

### 회원 프로필 이동 (2026-10-25)

`leadingAction={label,onPress}`로 leading의 작성자 사진을 해당 회원 프로필에 연결한다. 카드 전체 `onActivate`/`href`와 독립된 형제 컨트롤이며 Native의 접근성 카드 안에 프로필 버튼을 중첩하지 않는다. 사진에는 별도 Avatar.action을 함께 넣지 않는다.
