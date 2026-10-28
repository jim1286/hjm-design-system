# RadioGroup

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-19
- 근거: [cross-platform core](../../cross-platform-core-normalization.md), `src/component-recipes.ts`(`selectionGroupRecipe`·`selectionControlRecipe`)
- 스토리북: `배포/컴포넌트/입력/라디오 버튼 그룹`

## 언제 쓰나

한 화면에 펼쳐 둔 선택지 중 정확히 하나를 고를 때 쓴다. 선택지마다 설명이 붙거나,
사용자가 모든 보기를 한눈에 비교해야 할 때(배송 방법, 알림 빈도, 신고 사유) 맞다.
대략 2~6개, 각 항목이 한 행을 차지해도 되는 경우다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 2~4개의 짧은 라벨로 보기·필터를 즉시 전환 | [SegmentedControl](segmented-control.md) |
| 선택지가 많거나(대략 7개 이상) 공간이 좁음, 폼 한 칸 | [Select](select.md) |
| 여러 개를 동시에 고름 | [CheckboxGroup](checkbox-group.md) |
| 켜고 끄는 설정 한 줄 | [Switch](switch.md) |
| 선택지 사이에 다른 콘텐츠가 끼어 직접 배치해야 함 | [Radio](radio.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `RadioGroup` | 기본 | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` |

## 최소 사용 예

```tsx
// Web
import { RadioGroup } from "@hjmds/react/selection";

<RadioGroup
  label={t("settings.frequency.label")}
  items={[
    { value: "daily", label: t("settings.frequency.daily") },
    { value: "weekly", label: t("settings.frequency.weekly"), description: t("settings.frequency.weeklyHint") },
  ]}
  value={frequency}
  onValueChange={setFrequency}
/>
```

```tsx
// Native
import { RadioGroup } from "@hjmds/react-native/inputs";

<RadioGroup
  label={t("settings.frequency.label")}
  items={[
    { value: "daily", label: t("settings.frequency.daily") },
    { value: "weekly", label: t("settings.frequency.weekly") },
  ]}
  value={frequency}
  onValueChange={(next) => next && setFrequency(next)}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | Web `readonly { value: string; label: ReactNode; description?; disabled? }[]` · Native `readonly { value: Value; label: string; description?; disabled?; accessibilityHint?; leading? }[]` | 필수 | 비거나 값이 중복되면 `TypeError` |
| `value` · `defaultValue` | 항목 값 · `null` | `null` | 선택 없음 허용. items에 없는 값이면 `RangeError` |
| `onValueChange` | Web `(value: string) => void` · Native `(value: Value \| null) => void` | — | 고를 때 호출 |
| `orientation` | `vertical` · `horizontal` | `vertical` | Native는 글자 크기 160% 이상이면 가로를 세로로 쌓는다 |
| `presentation` | `plain` · `card` · `grouped` · `chips` | `card` | `grouped`는 한 카드 안에 행이 붙는다 |
| `size` | `small` · `medium` | `medium` | — |
| `required` | `boolean` | `false` | 켜면 초기 선택을 보정한다 |
| `description` · `error` | Web `ReactNode` · Native `string` | — | 그룹 설명·오류 문구 |
| `disabled` · `readOnly` | `boolean` | `false` | — |
| `renderLabel` | `(item) => ReactNode` | — | 글꼴·상품명 등 제품 미리보기. 선택 상태와 frame은 공통 구현이 소유하며 항목 `label`이 접근성 이름으로 유지된다. Native의 문자열/숫자는 공통 Text로 감싼다 |
| `items[].action` | `{ label, accessibilityLabel?, onAction, disabled? }` | — | 선택과 별개인 관리 행동. 작은 ghost Button이 행 끝에 놓이고 라디오 target 밖의 형제다. 그룹/항목 disabled와 함께 비활성화되며 readOnly는 선택만 막는다 |
| `renderLeading` | `(item, appearance) => ReactNode` — appearance Web `{ selected, color: "currentColor", size }`, Native `{ checked, selected, disabled, readOnly, color, size }` | — | 항목 앞 제품 아이콘 |
| `label` / `accessibilityLabel` | 문자열(Web `label`은 `ReactNode`) | — | 둘 중 하나 필수. 보이는 제목이 없으면 `accessibilityLabel` |
| `layoutStyle` | 배치 전용 style 객체 | — | 그룹 프레임 배치 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 행 최소 높이 `medium` 56 · `small` 44. 행 안쪽은 [Radio](radio.md#배치)와 같다. `grouped`는 그룹이 테두리 1·모서리 `radius.lg` 16을 갖는다 | `layout.rowHeight.singleLine`, `control.minTouchTarget`, `.hjm-radio-group[data-presentation="grouped"]` |
| 간격 | 항목 사이 세로 `plain` `spacing.xxs` 4 · `card` `spacing.xs` 8 · `grouped` 0, 가로 `plain` `spacing.sm` 12 · `card` `spacing.md` 16 · `grouped` 0. 제목·항목·설명·오류 사이 `spacing.xs` 8 | `selectionGroupRecipe.orientations`·`supportGap` |
| 순서·정렬 | 제목 맨 위. 설명은 항목 **위**(`selectionGroupRecipe.slots` 순서, 두 플랫폼). 오류는 항목 아래이며 있으면 설명을 대신한다. 폼 저장 버튼은 그룹 아래 | `selection.tsx`(RadioGroup), Native `inputs.tsx` |
| 고정·스크롤 | 고정되지 않는다. 폼·화면 본문 스크롤 안에 둔다 | — |
| 좁은 폭·큰 글자 | Web 가로 배치는 넘치면 다음 줄로 감긴다(`flex-wrap`). Native 가로 배치는 감지 않고 글자 크기 160% 이상에서 세로로 바뀐다. 가로 배치는 짧은 선택지 2~3개에만 쓴다 | `.hjm-radio-group[data-orientation="horizontal"]`, `largeTextThreshold` 1.6 |

```text
card(vertical)                 grouped(vertical)
알림 받기                       알림 받기
 └ gap spacing.xs 8
┌─────────────────────┐       ┌─────────────────────┐
│ ◉ 모두              │ 56    │ ◉ 모두              │
└─────────────────────┘       │ ○ 멘션만            │
   gap spacing.xs 8           │ ○ 받지 않음         │
┌─────────────────────┐       └─────────────────────┘  radius.lg 16
│ ○ 멘션만            │
└─────────────────────┘
```

## 꼭 지킬 것

- `items`가 비었거나 항목 `value`·문자열 `label`이 비었거나 `value`가 중복되면 렌더 중 `TypeError`,
  `value`/`defaultValue`가 items에 없으면 `RangeError`를 던진다. 서버 목록은 정리한 뒤 넘긴다.
- 옛 Native `options` prop은 1.11에서 제거됐다. 넘기면 `TypeError`다([이관표](../../migration-native-legacy-removal.md)).
- 오류 문구는 `error`로 넘긴다. 그룹 아래에 별도 Text로 직접 그리지 않는다.
- 배치는 `layoutStyle`로 한다. Native의 `style`과 slot style(`controlStyle`·`indicatorStyle`·`labelStyle` 등)은 제거된 속성이다([소비 정책 §3.1](../../consumer-policy.md)). 외형은 `presentation`·`size`·`renderIndicator`로 바꾼다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `onValueChange` 값 | `string` | `Value \| null`(제네릭) |
| `label`·항목 `label` 타입 | `ReactNode` | `string` |
| 항목 `leading`·`accessibilityHint` | 없음 | 있음 |
| indicator 숨김·교체 | `indicator="none"`(미게시) | `indicator="none"`, `renderIndicator` |
| 낭독 문구 `requiredLabel`·`readOnlyLabel`·`invalidLabel`, `invalid` | 없음 | 있음 |
| `name` | 있음(기본 자동 생성) | 없음 |
| 루트 요소 | `<fieldset>` + `<legend>` | `View` `accessibilityRole="radiogroup"` |

### 미리보기와 독립 행동 (개발 소스 · 미게시)

손글씨 선택에서 앱이 radio/행 frame을 다시 만들던 원인은 사용자 글꼴과 이름 변경 행동을 함께 넣을 슬롯이 없었기 때문이다(다에리, 2026-10-19). `renderLabel`에는 비상호작용 미리보기만 넣고 `action`에 별도 행동을 연결한다. Web은 실제 같은 name의 radio input을 유지해 방향키로 선택한다. action은 label/radio 안에 중첩하지 않아 관리 행동이 선택을 바꾸지 않는다. 제품은 선택 시 미리보기·닫기를 연결하고, 실제 저장은 별도 확인 행동으로 유지할 수 있다. 필터로 현재 값이 보이지 않으면 제품은 표시 값에 `null`을 전달하며 저장된 선택을 임의로 바꾸지 않는다.

frame과 선택 행의 기존 recipe 크기·색·간격을 재사용한다. 보조 행동이 있는 행은 frame 안에서 선택 영역이 남는 너비를 채우고 끝 행동에 `spacing.xs` 8의 바깥 여백을 둔다. label의 크기·색 override로 frame이나 indicator를 재구현하지 않는다. 실제 공개 사용 예는 양쪽 RadioGroup Story의 `OptionActions`다.


### 미선택·다중 선택의 칩 묶음

2026-10-19 오늘야구 연도 선택 이관에서 nullable 단일 선택과 드래프트 다중 선택을 앱이
Chip/직접 wrap으로 조립하고 있었다. `presentation="chips"`는 기존 선택 엔진·항목 타입·값 계약을
유지하고 Chip recipe의 모서리·색·타이포·크기를 사용한다. 기본 원/체크 indicator는 감추고(Native의 명시적 `renderIndicator`는 유지),
선택 색·굵기와 실제 radio/checkbox 의미를 유지한다. 그룹은 orientation과 관계없이 시작 쪽부터
줄바꿈하고 항목 간격은 `spacing.xs` 8이다. 설명·오류·비활성·읽기 전용 계약도 같다.

`size="small"`의 보이는 최소 높이는 Chip처럼36, medium은44이며 작은 칩의 터치 영역은44다.
필수 단일 보기 전환은 SegmentedControl, 선택 없음이 유효한 질문은 RadioGroup,
동시에 여러 조건을 고르면 CheckboxGroup을 사용한다. chips 모양 때문에 다른 선택 의미로 바꾸지 않는다.
기존 양쪽 RadioGroup의 `ChipChoices` 예제가 두 그룹과 미선택/다중 선택을 함께 실행한다.

연도/카테고리 창이 전체 목록의 일부만 보여주면 제품은 보이는 값만 그룹에 전달하고,
활성화된 항목의 도메인 변경을 전체 선택에 합쳐야 한다. 현재 보이지 않는 선택을 실제 목록 삭제로
오인해 지우지 않는다. 삭제·비활성 항목 pruning은 기존 그룹 계약을 그대로 따른다.

### 동일 폭의 선택 카드(미게시)

`grid`에 기존 Grid descriptor(`columns`, `gap`, `minColumnWidth`)를 전달하면 Web·Native 모두
선택 항목을 동일 폭으로 배치한다. 생략하면 기존 `orientation` 배치를 유지한다.
2026-10-20 다에리의 직접 카드/내부 CSS 이관이 계기이며, 선택 엔진은 바꾸지 않고 공통 Grid의 측정·열 축소를 합성한다.
예: `grid={{ columns: { compact: 2 }, gap: { compact: "xs" }, minColumnWidth: { compact: 152 } }}`.
그룹 안쪽을 측정해 두 열이 들어가지 않으면 한 열로 줄인다. 제품에서 항목 폭·grid CSS를 다시 계산하지 않는다.

### 같은 행의 카드 높이 (checkout 수정·미게시)

`presentation="card"` 항목은 같은 Grid 행에서 가장 높은 콘텐츠에 맞춰 칸을 채운다. Native의 Grid 칸 안에서 카드가 내용 높이만 사용하던 문제를 공통 ChoiceRow에서 수정했다(2026-10-20 다에리 공개 범위 선택 카드 지적). 제품에서 높이를 고정하거나 설명을 줄여 맞추지 않는다. 행별 높이는 해당 행의 콘텐츠로 결정한다.

### 그림 미리보기와 기본 선택 표시

2026-10-20 다에리 반응 카드 이관: Web도 Native와 같이 `indicator="none"`으로 기본 원형 표시를 숨길 수 있다(로컬·미게시). `renderLabel`의 비상호작용 그림/문구와 공통 카드의 선택 색으로 상태를 나타낼 때 사용한다. 실제 radio·그룹 이름·checked·키보드 선택·비활성 계약은 유지되며, 기본값 `default`는 기존 원형 표시를 유지한다. 제품에서 카드 테두리/눌림/선택 틀을 다시 만들지 않는다.

### 가로 스크롤 카드 (2026-10-28 개발 소스)

오늘야구의 일자 카드 요청으로 `overflow="scroll"`을 Web/Native RadioGroup에 추가했다.
`presentation="card"` 또는 `"chips"`에서 `grid` 없이 사용하며 기본 `wrap` 동작은 유지한다.
공통 레일이 가로 스크롤과 선택 항목 노출을 소유한다. 제품은 `renderLabel`로 요일·일자 등
콘텐츠만 공급한다. 비활성인 선택 날짜도 표시할 수 있다. 조회 실패를 비활성 날짜로 바꾸지 않는다.
이 API는 아직 게시하지 않은 개발 소스 변경이다.
