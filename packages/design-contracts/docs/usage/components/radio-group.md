# RadioGroup

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
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
| `presentation` | `plain` · `card` · `grouped` | `card` | `grouped`는 한 카드 안에 행이 붙는다 |
| `size` | `small` · `medium` | `medium` | — |
| `required` | `boolean` | `false` | 켜면 초기 선택을 보정한다 |
| `description` · `error` | Web `ReactNode` · Native `string` | — | 그룹 설명·오류 문구 |
| `disabled` · `readOnly` | `boolean` | `false` | — |
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
- 배치는 `layoutStyle`로 한다. Native의 `style`과 slot style(`controlStyle`·`indicatorStyle`·`labelStyle` 등)은 deprecated
  (개발 모드 경고, 다음 major 제거)다([소비 정책 §3.1](../../consumer-policy.md)). 외형은 `presentation`·`size`·`renderIndicator`로 바꾼다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `onValueChange` 값 | `string` | `Value \| null`(제네릭) |
| `label`·항목 `label` 타입 | `ReactNode` | `string` |
| 항목 `leading`·`accessibilityHint` | 없음 | 있음 |
| indicator 숨김·교체 | 없음 | `indicator="none"`, `renderIndicator` |
| 낭독 문구 `requiredLabel`·`readOnlyLabel`·`invalidLabel`, `invalid` | 없음 | 있음 |
| `name` | 있음(기본 자동 생성) | 없음 |
| 루트 요소 | `<fieldset>` + `<legend>` | `View` `accessibilityRole="radiogroup"` |
