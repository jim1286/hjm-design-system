# RadioGroup 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `selectionGroupRecipe`·`selectionControlRecipe`(`src/component-recipes.ts`), 정규화:
[cross-platform core](../cross-platform-core-normalization.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `RadioGroup` | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` | 기본 |

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

- `orientation`: `vertical`(기본) · `horizontal`. Native는 글자 크기 160% 이상이면 가로를 세로로 쌓는다.
- `presentation`: `plain` · `card`(기본) · `grouped`(한 카드 안에 행이 붙음). `size`: `small` · `medium`(기본).
- `value`/`defaultValue`(기본 `null`, 선택 없음 허용). `required`(기본 `false`)면 초기 선택을 보정한다.
- `description`, `error`, `disabled`, `readOnly`(기본 `false`), `renderLeading(item, appearance)`.
- 이름은 `label` 또는 `accessibilityLabel` 중 하나가 필수다. 보이는 제목이 없으면 `accessibilityLabel`.

## 꼭 지킬 것

- `items`가 비었거나 항목 `value`·문자열 `label`이 비었거나 `value`가 중복되면 렌더 중 `TypeError`,
  `value`/`defaultValue`가 items에 없으면 `RangeError`를 던진다. 서버 목록은 정리한 뒤 넘긴다.
- 옛 Native `options` prop은 1.11에서 제거됐다. 넘기면 `TypeError`다([이관표](../migration-native-legacy-removal.md)).
- 오류 문구는 `error`로 넘긴다. 그룹 아래에 별도 Text로 직접 그리지 않는다.
- Native의 `style`(그룹 프레임)과 slot style(`labelStyle` 등)은 배치에만 쓴다([소비 정책 §3](../consumer-policy.md)).

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
