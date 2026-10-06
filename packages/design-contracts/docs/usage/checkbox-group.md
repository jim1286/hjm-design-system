# CheckboxGroup 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `selectionGroupRecipe`·`selectionControlRecipe`(`src/component-recipes.ts`), behavior `checkboxGroup`

## 언제 쓰나

한 질문에 대한 여러 선택지 중 0개 이상을 고르게 할 때 쓴다. 관심사·알림 종류·필터 조건처럼
각 선택지가 자기 줄과 설명을 가질 만한 목록이 여기에 속한다. 선택 상태는 `Set`으로 다룬다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 독립된 항목 하나 | [Checkbox](checkbox.md) |
| 하나만 고름 | [RadioGroup](radio-group.md) |
| 가로 버튼 줄로 짧은 옵션을 켜고 끔 | [ToggleGroup](toggle-group.md) ([경계](../toggle-group.md)) |
| 약관 동의(필수가 제출 가능 여부를 정함) | [Agreement](agreement.md) ([이유](../agreement.md)) |
| 칩 모양의 필터 줄 | [Chip](chip.md) `selectionMode="multiple"` |
| 목록 밖 값을 직접 입력 | [TagsInput](tags-input.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `CheckboxGroup` | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` | 기본 |

## 최소 사용 예

```tsx
// Web
import { CheckboxGroup } from "@hjmds/react/selection";

<CheckboxGroup
  label={t("settings.notify.title")}
  items={[
    { id: "comment", label: t("settings.notify.comment") },
    { id: "like", label: t("settings.notify.like"), description: t("settings.notify.likeHint") },
  ]}
  value={channels}
  onValueChange={setChannels}
/>
```

```tsx
// Native
import { CheckboxGroup } from "@hjmds/react-native/inputs";

<CheckboxGroup
  label={t("settings.notify.title")}
  items={items}
  value={channels}
  onValueChange={setChannels}
/>
```

## 축과 기본값

- 항목은 `{ id, label, description?, disabled? }`이며 `label`·`description`은 `string`이다.
- `value`(`ReadonlySet<Key>`)와 `onValueChange`로 제어, `defaultValue`(기본 빈 `Set`)로 비제어다.
- `orientation`: `vertical`(기본) · `horizontal`. `presentation`: `card`(기본) · `plain` · `grouped`.
  `size`: `medium`(기본) · `small`.
- 비제어일 때 항목에서 빠진 id는 선택에서 자동으로 지워진다.

## 꼭 지킬 것

- `label` 또는 `accessibilityLabel` 중 하나는 반드시 준다. 둘 다 없거나 빈 문자열이면 실행 중 `TypeError`다.
- 항목 id는 비지 않고 중복되지 않아야 한다. 제어 `value`에 목록에 없는 id가 있으면 `RangeError`다.
  항목이 바뀌면 제어하는 쪽이 `value`를 먼저 정리한다.
- 문구는 모두 i18n 키로 넣는다. 각 항목의 아이콘은 `renderLeading(item, appearance)`로 그린다.
- `layoutStyle`은 없다. Native `style`은 그룹 외곽, 나머지 슬롯 스타일은 각 행에 붙는다. 배치에만 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `description`·`error` 타입 | `ReactNode` | `string` |
| 오류 표시 | `error` | `error` 또는 `invalid`(+`invalidLabel`) |
| 폼 제출 | `name`으로 체크박스마다 `value=id` 전송 | 없음 |
| 그룹 전체 비활성 | `disabled`(fieldset) | `disabled` |
| 필수·읽기 전용 안내 | `aria-required`·`aria-readonly` | `requiredLabel`·`readOnlyLabel`을 행 hint로 읽음 |
| 선택 표시 교체 | 없음 | `indicator="none"`, `renderIndicator(item, props)` |
