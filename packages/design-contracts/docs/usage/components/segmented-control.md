# SegmentedControl

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [ToggleGroup 계약](../../toggle-group.md)(경계), `src/component-recipes.ts`(`segmentedControlRecipe`). 2026-10-06 사용자 승인으로 실험 `실험/컴포넌트/입력/카테고리 필터`를 `알약 모양`·`비활성` 스토리로 합쳐 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/컴포넌트/입력/버튼형 선택`

## 언제 쓰나

2~4개의 짧은 보기 중 **항상 하나가 선택된** 전환에 쓴다. 같은 화면의 목록·기간·보기 방식을
바꾸는 필터(오늘/이번 주/이번 달, 목록/지도)가 전형이다. 선택하면 곧바로 화면이 바뀐다.
짧은 지표·시즌처럼 선택지가 더 많은 목록은 `presentation="pills" overflow="scroll"`로 한 줄에 둔다.
`items[].accessibilityLabel`은 축약된 화면 라벨 대신 읽을 전체 이름이다(Web radio의 aria-label, Native radio 이름).
생략하면 기존 label을 읽는다. 예: `{ value: "OPS", label: "OPS", accessibilityLabel: "출루율과 장타율의 합 OPS" }`.

2026-10-19 오늘야구 이관에서 지표 설명이 공통 레일의 이름에 전달되지 않던 공백을 보완했다.
필터 패널을 여는 행동은 선택 항목으로 섞지 않고 `actions`에 Button으로 공급한다. 이미 고른 시즌의
이전 연도 창도 다시 열 수 있어야 하며, 창을 여는 것만으로 선택 값이 바뀌면 안 된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 선택 없음이 가능하거나, 항목마다 설명이 필요한 폼 질문 | [RadioGroup](radio-group.md) |
| 선택지가 많거나 라벨이 길다 | [Select](select.md) |
| 여러 개를 동시에 켠다 | [ToggleGroup](toggle-group.md) |
| 서로 다른 콘텐츠 패널 사이를 이동 | [Tabs](tabs.md) |
| 단일 행동 | [Button](button.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SegmentedControl` | 기본 | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` |

## 최소 사용 예

```tsx
// Web
import { SegmentedControl } from "@hjmds/react/selection";

<SegmentedControl
  label={t("stats.range.label")}
  items={[
    { value: "week", label: t("stats.range.week") },
    { value: "month", label: t("stats.range.month") },
  ]}
  value={range}
  onValueChange={setRange}
/>
```

```tsx
// Native
import { SegmentedControl } from "@hjmds/react-native/inputs";

<SegmentedControl
  label={t("stats.range.label")}
  items={[
    { value: "week", label: t("stats.range.week") },
    { value: "month", label: t("stats.range.month") },
  ]}
  value={range}
  onValueChange={setRange}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | Web `readonly { value: string; label: ReactNode; disabled? }[]` · Native `readonly { value: Value; label: string; disabled?; leading?; renderLeading? }[]` | 필수 | 값이 비거나 중복이면 던진다 |
| `presentation` | `connected` · `pills` | `connected` | 연결된 보기 전환 / 독립된 카테고리 필터. `pills`는 1.13.0 변경 |
| `selectionTone` | `neutral` · `brand` | `brand` | 기본 선택 면은 `primary`와 `onPrimary`. `neutral`은 `surfaceSelected`와 `text`로 차분하게 표시한다. `text` 표현은 채움 없이 기존 표시를 유지한다 |
| `size` | `small` · `medium` | `medium` | 항목 최소 높이 36(+hitSlop 4) · 44 |
| `value` · `defaultValue` | 항목 값 | 첫 번째 활성 항목 | 선택 해제 상태는 없다 |
| `onValueChange` | Web `(value: string) => void` · Native `(value: Value) => void` | — | 다른 항목을 고를 때. `null`은 오지 않는다 |
| `label` | `string` | 필수 | 화면에 보이지 않는 접근성 이름. 보이는 제목은 바깥에 둔다 |
| `disabled` | `boolean` | `false` | 전체 비활성(Web은 fieldset 속성) |
| `overflow` | `wrap` · `scroll` | `wrap` | 미게시. pills는 기본 줄바꿈, scroll은 유한 가로 목록으로 배치한다. connected의 기존 내부 스크롤은 유지한다. 선택/포커스 항목을 최소 이동으로 노출한다 |
| `actions` | `ReactNode` | 없음 | 미게시. 스크롤 밖 끝 쪽 고정 행동. radio 그룹과 형제이며 선택 값에 포함하지 않는다. 도구는 IconButton으로 연결한다 |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 배치 |

`connected`는 글자 크기 160% 이상(`stackAtFontScale`)에서 항목을 세로로 쌓는다. `pills`는 쌓지 않는다(`pills.largeTextLayout` `wrap`, 1.13.1 변경).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 바깥 높이(트랙 테두리·안쪽 여백 포함) `height`는 같은 크기의 Button·IconButton·Chip과 같다: `medium` 44 · `small` 36. 항목 최소 높이는 그보다 트랙 안쪽 여백 4와 테두리 1을 위아래로 뺀 `medium` 34 · `small` 26이고, 위아래로만 넓힌 터치 영역(`hitSlop` 5 · 9, Web `::after`)으로 44를 채운다. 작은 트랙은 바깥으로 4 더 넓어지되 레이아웃 높이는 늘지 않는다. 큰 글자에서 세로로 쌓이면 항목마다 44. 항목 좌우 여백 `medium` `spacing.md` 16 · `small` `spacing.sm` 12. 2026-10-17 사용자 요청("높이 맞춰")으로 같은 줄의 칩과 높이를 맞췄다(이전에는 항목 높이 기준이라 트랙이 46·54였다) | `segmentedControlRecipe.sizes`, `.hjm-segmented__scroller`, `.hjm-segmented__item` |
| 간격 | 트랙 안쪽 여백·항목 간격 `container.padding`·`gap` `spacing.xxs` 4. 트랙 모서리 `radius.lg` 16(테두리 1). 선택 항목 모서리 `radius.md` 12, 선택 테두리 2(`stroke.strong`). 아래 내용과 `layout.contentGap` 16 | `segmentedControlRecipe.container`·`item`, `.hjm-segmented__items` |
| 순서·정렬 | 항목은 같은 폭으로 나뉘고(Native `flex: 1`, Web `flex: 1 1 0`) 트랙은 부모 폭을 채운다. 전환할 내용 바로 위, 화면 좌우 여백(`layout.pagePadding`) 안 | Native `SegmentedControl`, `.hjm-segmented__item` |
| 고정·스크롤 | 고정되지 않는다. Web 항목은 글자보다 좁아지지 않아(`min-inline-size: max-content`) 넘치면 트랙이 가로 스크롤된다. Native는 스크롤하지 않는다 | `.hjm-segmented__items`(overflow-x) |
| 좁은 폭·큰 글자 | `connected`는 항목을 세로로 쌓는다. Native는 글자 크기 160% 이상, Web은 provider `data-large-text` 또는 폭 11em 이하. `pills`는 쌓지 않고 가로 줄을 유지한다: 블록 안에서는 줄바꿈, 가로 스크롤 줄(SearchScreen `filtersOverflow="scroll"`, 제품 레일) 안에서는 한 줄 | `segmentedControlRecipe.adaptive`·`pills.largeTextLayout`, `largeTextThreshold` 1.6, `.hjm-segmented` @media |

```text
┌───────────────────────────────┐  트랙: radius.lg 16, padding 4 (Native)
│ ┌─────────┐                   │
│ │  주간   │    월간     연간   │  44 (medium), 같은 폭
│ └─────────┘                   │  선택 = 브랜드 배경 채움 + 반전 글자
└───────────────────────────────┘
   gap layout.contentGap 16
[ 전환되는 내용 ]
```

## 꼭 지킬 것

- 라벨은 짧은 i18n 문구로 둔다. 한글 한 글자씩 줄바꿈될 만큼 길면 Select나 RadioGroup으로 바꾼다.
- 활성 항목이 하나도 없거나 `value`가 비거나 중복이면 렌더 중 오류를 던진다. Native는 controlled
  `value`가 비활성 항목이어도 `RangeError`다.
- 옛 Native `options` prop은 제거됐다. 넘기면 `TypeError`다([이관표](../../migration-native-legacy-removal.md)).
- 연결형과 `pills` 모두 기본 선택 배경은 `primary`, 글자·아이콘은 `onPrimary`다. `selectionTone="neutral"`이면 `selection.background`(`surfaceSelected`)와 `selection.content`(`text`)를 쓴다. 연결형의 선택 테두리(ring)는 추가 구분 수단으로 유지한다. 제품에서 선택 배경을 직접 덮지 않는다. 배치는 `layoutStyle`로 하고, Native `style`은
  제거된 속성이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 `label` 타입 | `ReactNode` | `string` |
| 항목 아이콘 | 없음 | `leading`, `renderLeading({ selected, disabled, color, size })` |
| 전체 비활성 | fieldset `disabled` 속성 | `disabled` |
| `name` | 있음(기본 자동 생성) | 없음 |
| 키보드 | 네이티브 radio 화살표 이동 | 해당 없음 |

### 카테고리 필터 표현(알약 모양)

2026-10-06 사용자가 여러 화면의 전체/장소/일상 선택을 함께 개편하도록 요청했다.
[Material의 필터 칩](https://developer.android.com/develop/ui/compose/components/chip)처럼 콘텐츠 범위를 선택하는 작은 표면에서 착안했다.
기존 단일 선택 계약을 재사용하고 버튼마다 별도 selected 상태를 조립하는 대안은 제외했다.

- `presentation="pills"`: 카테고리·작성자·기간처럼 같은 목록의 범위를 좁힐 때 쓴다.
- 표면 높이·좌우 여백·글자는 같은 size의 Chip과 맞춘다. 터치 영역은 최소 `control.minTouchTarget` 44이며 안쪽 표면은 위아래 `spacing.xxs` 4만큼 들어간다. 2026-10-20 Utilverse 혼합 필터 행에서 작은 Chip36과 pill28의 불일치가 확인돼 공통 크기로 정렬했다(미게시). 누름 영역은 줄이지 않는다.
- 좌우 여백은 Chip과 같이 small12/medium16, 항목 사이 `spacing.xs` 8, 모서리 `radius.full`. 비선택은 `surface.raised`(`canvas`) 바탕과 `border.control` 1pt 테두리, 기본 선택은 `primary`/`onPrimary`, `selectionTone="neutral"` 선택은 `selection.background`(`surfaceSelected`)/`selection.content`(`text`) 조합이다. 2026-10-20 Utilverse의 파스텔 배경에서 비선택 버튼 경계가 묻힌 사용자 지적에 따라 inset 표면을 공통으로 보완했다(미게시). 색은 제품 provider에서 따라온다.
- 항목은 내용 폭이며 좁아지면 줄바꿈한다. 큰 글자에서도 세로로 쌓지 않는다(`pills.largeTextLayout` `wrap`): 블록 안에서는 줄바꿈하고, 가로 스크롤 줄 안에서는 한 줄로 남아 스크롤된다. 라벨 높이만큼 항목도 늘어난다. 선택 상태(radio)와 포커스 이동(Web 화살표, Native 접근성 순서)은 배치와 관계없이 같다.
- 그룹 이름은 `label`, 하나의 선택은 `value`/`onValueChange`. 복수 조건은 ToggleGroup, 화면 이동은 Tabs/Navigation을 쓴다.
- 예제의 전체 선택값도 실제 항목으로 넣는다. 선택된 항목을 다시 눌러도 선택을 해제하지 않는다.

```tsx
import { SegmentedControl } from "@hjmds/react/selection";
<SegmentedControl label={t("category.label")} presentation="pills"
  items={categories} value={category} onValueChange={setCategory} />
```

Native는 `@hjmds/react-native/inputs`에서 같은 prop을 사용한다. `presentation`은 1.13.0 추가 API다. 연결형과 pills는 같은 단일 선택 계약을 따른다.
스토리는 `버튼형 선택`의 `알약 모양`·`비활성`·`알약 모양 · 큰 글자`다. 2026-10-06 사용자 승인으로 실험 `입력/카테고리 필터` 항목을 배포하면서 별도 공개 API가 아니라 이 표현이라 그 스토리로 합쳤다([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). Storybook 배포는 npm 게시가 아니다.

## 함정

- 1.13.0 이하는 `pills`도 글자 크기 160%부터 세로로 쌓았다. 한 줄 레일에 둔 주제 7개가 accessibility-large에서 약 440pt
  기둥이 됐고(2026-10-06 utilverse 적용, iPhone 17 Pro · iOS 26.5), 제품은 그 크기부터 Select로 바꾸는 우회를 넣었다.
  1.13.1부터는 레일 안에서 한 줄로 남으므로 그 분기를 지운다. 1.13.0에 머무는 제품만 우회를 유지한다.
- 레일(가로 스크롤)은 바깥이 만든다. SearchScreen 안이면 `filtersOverflow="scroll"`, 그 밖이면 제품의 가로 ScrollView다.
  `pills`가 스스로 스크롤하지 않는 이유는 레일 안에 두 번째 가로 스크롤을 겹치지 않기 위해서다.


### 선택 배경 이동

2026-10-07 Animated Background 비교에서 시각적 선택만 있는 외부 예제를 그대로 교체하면 radio/checked 의미를 잃는 것을 확인했다.
`selectionMotion="slide"`는 기존 선택 엔진·키보드·접근성 이름·입력 위치를 유지하고 배경만 측정 위치로 이동한다.
Web은 항목과 바깥 선택 영역의 크기를 함께 관찰한다. 2026-10-07 RTL pills에서 항목 너비는
그대로인 채 부모 폭만 바뀌면 선택 배경이 이전 위치에 남는 오류를 수정했다. 크기 변경에는
이동 모션을 재생하지 않고 새 위치에 맞춘다.
기본은 `"none"`이며 opt-in 실험이다. 별도 버튼/선택 상태를 만들어 기존 라디오를 대체하지 않는다.

- Web/Native 모두 `connected`와 `pills`에 적용한다. 큰 글자·RTL·줄바꿈에서는 실제 항목 위치를 측정한다.
- 최초 배치와 resize는 즉시 맞추며 선택이 바뀔 때만 HJM `motion.normal` 시간으로 이동한다.
- 모션 감소와 비활성 화면에서는 이동 효과를 중지한다. 동작 중인 입력·선택 값은 그대로다.
- 조작 가능 영역·글자는 움직이거나 확대하지 않는다. 새 사용 예제는 [선택 배경 이동](../compositions/selection-motion.md)이다.

2026-10-07에는 Web 배경이 글자를 감싸도록 세로 padding과 pills.inset을 함께 적용했다. 2026-10-20에는 같은 원리를 유지하며 inset을4로 정렬하고 size별 Chip 높이를 표면의 최소값으로 사용한다.

### Text presentation (미게시, 1.23.0 이후)

`presentation="text"`는 캡슐 없이 라디오 항목과 짧은 선택 표시를 그린다. `textEmphasis="strong" | "regular"`
기본 strong이며 조용한 관계 목록은 regular다. 기존 `items/value/onValueChange`와 키보드·disabled 계약을 유지한다.
글자 탭의 radio 의미를 제품에서 재구현하던 문제를 없애기 위해 추가했다(2026-10-15 BurnTok 전사 이관).
선택 표시는 16×2, 목표 높이는 44, 항목 간격은 md이며 text 모드는 slide artwork를 사용하지 않는다.

## 가로 필터와 고정 행동

Spint 스팟 필터가 제품 ScrollView와 고정 추가 행을 재조립하던 공통 배치 공백을 `overflow="scroll"`과 `actions`로 보완했다(미게시). 제품은 값·목록·문구·추가 권한과 콜백을 소유하고 HJM이 줄 배치, 스크롤, 선택/포커스 항목 노출과 별도 행동의 위치를 소유한다. 이름이 긴 선택지를 탐색하는 폼은 여전히 Select를 쓰고, 화면 목록에 직접 적용하는 유한 필터가 이 rail의 대상이다.

<!-- usage-example: Web ../../../../../showcase/web/src/components/SegmentedControl.stories.tsx -->
<!-- usage-example: Native ../../../../../showcase/native/src/components/SegmentedControl.stories.tsx -->

2026-10-20 개발 소스·미게시: Spint 카테고리 재검토에서 사용자가 여백은 이전처럼 유지하고 글씨를 줄이도록 요청했다. pills 좌우 여백은 small 12, medium 16으로 복원하고 글씨는 label(12/18)로 통일한다. 높이와 터치 영역은 유지한다.

### 진한 브랜드 선택 — 개발 소스, 미게시 (2026-10-21)

다에리·스핀트의 선택 배경이 너무 옅다는 사용자 피드백에 따라 `selectionTone="brand"`로 선택 면에 `primary`, 글자·아이콘에 `onPrimary`를 쓴다. `pills`·`connected`의 크기와 선택 동작을 유지하며 `text`는 기존 표시를 유지한다.

### 선택 배경 기본값 — 개발 소스, 미게시 (2026-10-23)

사용자가 공개 Storybook의 기록 표현 비교 화면에서 선택 배경이 없는 것처럼 보인다고 지적하고 기본 채움을 요청했다.
같은 날 시각 비교 후 사용자가 강조안을 기본으로 선택했다. Web·Native 모두 별도 prop 없이 `selectionTone="brand"`를 사용해 `primary` 배경과 `onPrimary` 글자·아이콘을 그린다.
중립색은 `selectionTone="neutral"` 옵션이며 light `#f0f1f3`, dark `#30343b` 및 브랜드 팔레트의 `surfaceSelected` 재정의를 따른다.
`presentation="text"`는 캡슐 없는 탐색 표현을 선택할 때 명시하며 기존 글자·짧은 표시를 유지한다.
선택 값은 배경·굵기·연결형 테두리로, 키보드 포커스는 별도 focus-visible 외곽선으로 구분한다.
단일 선택과 짧은 라벨은 [Fluent](https://fluent2.microsoft.design/components/ios/core/segmentedcontrol/usage),
선택 면의 구분은 [Material의 단일 선택 예시](https://developer.android.com/develop/ui/compose/components/segmented-button)를 참고한다.
강조 기본값은 선택된 항목을 즉시 구분하려는 사용자 결정이며, 외부 지침이 특정 색상값을 요구한다는 뜻은 아니다.
공개 Storybook 배포·패키지 게시와 개발 소스 적용은 구분한다.
