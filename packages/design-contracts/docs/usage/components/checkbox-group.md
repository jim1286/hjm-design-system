# CheckboxGroup

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `selectionGroupRecipe`·`selectionControlRecipe`(`src/component-recipes.ts`), behavior `checkboxGroup`
- 스토리북: `배포/컴포넌트/입력/체크박스 그룹`

## 언제 쓰나

한 질문에 대한 여러 선택지 중 0개 이상을 고르게 할 때 쓴다. 관심사·알림 종류·필터 조건처럼
각 선택지가 자기 줄과 설명을 가질 만한 목록이 여기에 속한다. 선택 상태는 `Set`으로 다룬다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 독립된 항목 하나 | [Checkbox](checkbox.md) |
| 하나만 고름 | [RadioGroup](radio-group.md) |
| 가로 버튼 줄로 짧은 옵션을 켜고 끔 | [ToggleGroup](toggle-group.md) ([경계](../../toggle-group.md)) |
| 약관 동의(필수가 제출 가능 여부를 정함) | [Agreement](agreement.md) ([이유](../../agreement.md)) |
| 칩 모양의 필터 줄 | [Chip](chip.md) `selectionMode="multiple"` |
| 목록 밖 값을 직접 입력 | [TagsInput](tags-input.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CheckboxGroup` | 기본 | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | `readonly { id: Key; label: string; description?: string; disabled?: boolean }[]` | 필수 | `label`·`description`은 `string`이다 |
| `value` + `onValueChange` | `ReadonlySet<Key>` + `(value: ReadonlySet<Key>) => void` | — | 제어. `value`를 주면 `onValueChange`가 필수다(타입이 `defaultValue`와 함께 쓰지 못하게 막는다) |
| `defaultValue` | `ReadonlySet<Key>` | 빈 `Set` | 비제어. 항목에서 빠진 id는 선택에서 자동으로 지워진다 |
| `label` · `accessibilityLabel` | `string` | — | 둘 중 하나는 필수 |
| `orientation` | `vertical` · `horizontal` | `vertical` | — |
| `presentation` | `card` · `plain` · `grouped` | `card` | — |
| `size` | `medium` · `small` | `medium` | — |
| `renderLeading` | Web `(item, appearance: { selected, color: "currentColor", size }) => ReactNode` · Native `(item, props: { checked, selected, disabled, readOnly, color, size }) => ReactNode` | — | 항목 아이콘 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 그룹 외곽(Web `fieldset`) 배치 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭을 채우는 묶음. 각 행은 [Checkbox](checkbox.md) 규격(최소 높이 `medium` 56 · `small` 44, 표시 24 · 20) | `selectionControlRecipe.sizes`, `.hjm-choice` |
| 간격 | 그룹 이름(legend)↔항목 `spacing.xs` 8. 항목 사이 세로 `card` `spacing.xs` 8 · `plain` `spacing.xxs` 4 · `grouped` 0, 가로 `card` `spacing.md` 16 · `plain` `spacing.sm` 12 · `grouped` 0. 설명·오류는 `formSupportContract.gap` `spacing.xs` 8 | `selectionGroupRecipe.orientations`, `.hjm-checkbox-group*` |
| 순서·정렬 | 위→아래 [그룹 이름(semibold)] → [설명] → [항목들] → [오류]. 항목은 시작 쪽 정렬. `grouped`는 항목들을 테두리 1px·`radius.lg` 16 카드 하나에 붙여 담는다 | `selectionGroupRecipe.slots`, `.hjm-checkbox-group[data-presentation="grouped"]` |
| 고정·스크롤 | 고정 영역이 없다. 목록이 길어도 그룹 안에서 스크롤 영역을 만들지 않는다 | `.hjm-checkbox-group__items` |
| 좁은 폭·큰 글자 | `horizontal`은 줄바꿈된다(`flex-wrap: wrap`). 좁은 폭·큰 글자에서는 `vertical`을 쓴다 | `.hjm-checkbox-group[data-orientation="horizontal"]` |

## 꼭 지킬 것

- `label` 또는 `accessibilityLabel` 중 하나는 반드시 준다. 둘 다 없거나 빈 문자열이면 실행 중 `TypeError`다.
- 항목 id는 비지 않고 중복되지 않아야 한다. 제어 `value`에 목록에 없는 id가 있으면 `RangeError`다.
  항목이 바뀌면 제어하는 쪽이 `value`를 먼저 정리한다.
- 문구는 모두 i18n 키로 넣는다. 각 항목의 아이콘은 `renderLeading(item, appearance)`로 그린다.
- 배치는 `layoutStyle`로 한다. Native의 `style`과 행 슬롯 스타일(`controlStyle`·`labelStyle` 등)은 deprecated —
  `layoutStyle` 또는 `presentation`·`size`·`renderIndicator`를 쓴다([이관 문서](../../migration-native-legacy-removal.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `description`·`error` 타입 | `ReactNode` | `string` |
| 오류 표시 | `error` | `error` 또는 `invalid`(+`invalidLabel`) |
| 폼 제출 | `name`으로 체크박스마다 `value=id` 전송 | 없음 |
| 그룹 전체 비활성 | `disabled`(fieldset) | `disabled` |
| 필수·읽기 전용 안내 | `aria-required`·`aria-readonly` | `requiredLabel`·`readOnlyLabel`을 행 hint로 읽음 |
| 선택 표시 교체 | 없음 | `indicator="none"`, `renderIndicator(item, props)` |
