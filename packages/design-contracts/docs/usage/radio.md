# Radio 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `selectionControlRecipe`(`src/component-recipes.ts`). 별도 계약 문서는 없다.

## 언제 쓰나

라디오 한 개를 제품이 직접 배치해야 할 때만 쓴다. 예: 선택지 사이에 다른 콘텐츠가 끼어 있어
한 묶음 목록으로 그릴 수 없는 경우. 선택 상태는 제품이 들고 `checked`로 내려 준다.
선택지가 한 곳에 모여 있으면 거의 항상 [RadioGroup](radio-group.md)이 맞다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 모여 있는 2개 이상 선택지 중 하나(그룹 상태·키보드 이동 포함) | [RadioGroup](radio-group.md) |
| 2~4개의 짧은 보기 전환(어떤 목록을 볼지) | [SegmentedControl](segmented-control.md) |
| 선택지가 많거나 화면 공간이 좁음 | [Select](select.md) |
| 켜고 끄기 | [Switch](switch.md), [Checkbox](checkbox.md) |
| 여러 개를 동시에 고름 | [CheckboxGroup](checkbox-group.md), [ToggleGroup](toggle-group.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Radio` | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` | 기본 |

## 최소 사용 예

```tsx
// Web — 같은 묶음은 name을 같게 둔다
import { Radio } from "@hjmds/react/selection";

<Radio
  name="delivery"
  value="pickup"
  label={t("order.delivery.pickup")}
  checked={method === "pickup"}
  onCheckedChange={() => setMethod("pickup")}
/>
```

```tsx
// Native
import { Radio } from "@hjmds/react-native/inputs";

<Radio
  label={t("order.delivery.pickup")}
  checked={method === "pickup"}
  onCheckedChange={() => setMethod("pickup")}
/>
```

## 축과 기본값

- `presentation`: `plain` · `card`(기본) · `grouped`. `size`: `small` · `medium`(기본).
- `checked`/`defaultChecked`(기본 `false`)와 `onCheckedChange(true)`. 라디오는 스스로 해제되지 않으므로
  콜백은 항상 `true`로만 불린다. 해제는 제품이 다른 항목을 선택해 `checked`를 내려서 한다.
- `description`, `readOnly`(기본 `false`), `disabled`, `renderLeading`은 두 renderer에 있다.

## 꼭 지킬 것

- `label`은 i18n 문구로 넣는다. Native는 `string`만 받는다.
- 묶음의 접근성 이름(fieldset/radiogroup)은 Radio가 만들지 않는다. 단독 Radio 여러 개로 묶음을
  흉내 내지 말고 RadioGroup을 쓴다.
- 선택 표시는 indicator(dot)가 맡는다. 색만으로 선택을 알리도록 바꾸지 않는다.
- Native의 `style`·`controlStyle`·`labelStyle` 등 slot style은 배치에만 쓴다. 색·글자·radius·높이를
  덮지 않는다([소비 정책 §3](../consumer-policy.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `label`·`description` 타입 | `ReactNode` | `string` |
| 묶음 연결 | `name`(HTML input 속성) | 없음, 제품이 상태로 묶음 |
| `required`·`invalid`와 낭독 문구(`requiredLabel`·`invalidLabel`·`readOnlyLabel`) | `required`만 HTML 속성 | 있음 |
| indicator 숨김·교체 | 없음 | `indicator="none"`, `renderIndicator` |
| 앞 아이콘 | `renderLeading` | `leading`, `renderLeading` |
| 이벤트 | `onCheckedChange`, 원시 `onChange` | `onCheckedChange` |
