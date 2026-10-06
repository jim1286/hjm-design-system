# Select 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `selectRecipe`(`src/component-recipes.ts`), 정규화: [cross-platform core](../cross-platform-core-normalization.md),
이관: [Native legacy 제거](../migration-native-legacy-removal.md)

## 언제 쓰나

폼 한 칸에서 여러 선택지 중 하나를 고르게 할 때 쓴다. 선택지가 많거나(대략 7개 이상),
섹션으로 나뉘거나, 서버에서 비동기로 오거나, 화면에 펼쳐 둘 공간이 없을 때 맞다.
Web은 popover listbox, Native는 modal sheet로 목록을 연다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 2~6개 선택지를 펼쳐서 비교, 항목마다 설명 | [RadioGroup](radio-group.md) |
| 2~4개 짧은 보기 즉시 전환 | [SegmentedControl](segmented-control.md) |
| 입력하며 후보를 거름 | [Combobox](combobox.md) |
| 행동 목록(편집·삭제) | [Menu](menu.md) |
| 여러 개 선택 | [CheckboxGroup](checkbox-group.md), [TransferList](transfer-list.md) |
| Web 폼 제출·자동완성·모바일 브라우저 picker가 중요 | `NativeSelect`(아래) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Select` | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` | 기본(커스텀 listbox / modal sheet) |
| `NativeSelect` | `@hjmds/react`, `/forms` | 없음 | 브라우저 `<select>` 대안 |

## 최소 사용 예

```tsx
// Web
import { Select } from "@hjmds/react/forms";

<Select
  label={t("profile.country.label")}
  placeholder={t("profile.country.placeholder")}
  emptySelectionLabel={t("profile.country.none")}
  items={countries.map((c) => ({ id: c.code, label: t(c.nameKey), textValue: t(c.nameKey) }))}
  selectedKey={country}
  onSelectionChange={setCountry}
/>
```

```tsx
// Native
import { Select } from "@hjmds/react-native/forms";

<Select
  label={t("profile.country.label")}
  placeholder={t("profile.country.placeholder")}
  dismissLabel={t("common.close")}
  items={countries.map((c) => ({ id: c.code, label: t(c.nameKey), textValue: t(c.nameKey) }))}
  selectedKey={country}
  onSelectionChange={setCountry}
/>
```

```tsx
// Web 대안 — 브라우저 기본 select
import { NativeSelect } from "@hjmds/react/forms";

<NativeSelect name="country" label={t("profile.country.label")}
  options={[{ value: "kr", label: t("country.kr") }]} value={code} onValueChange={setCode} />
```

## 축과 기본값

- 항목은 `{ id, label, textValue }`(필수) + `description`·`disabled`. 섹션은 `sections`로 넘긴다.
- `size`: `medium`(기본) · `large`. `density`: `compact` · `comfortable`(기본).
- `selectedKey`/`defaultSelectedKey`/`onSelectionChange(key | null)`. 기본은 선택 해제 허용
  (`disallowEmptySelection` 기본 `false`), 그래서 콜백에 `null`이 올 수 있다.
- `asyncState`(`idle` 기본 · `loading` · `loadingMore` · `empty` · `error`, 각 `message`)로 비동기 상태를 그린다.
  목록이 아직 없는 동안 선택된 항목은 `selectedItem`으로 넘긴다.
- `busy`·`readOnly`·`required`·`disabled`, `renderLeading`·`renderOptionLeading`. `open`/`onOpenChange(open, reason)`.
- 이름은 `label` 또는 `accessibilityLabel` 중 하나가 필수다.

## 꼭 지킬 것

- 모든 문구(`placeholder`, Web `emptySelectionLabel`, Native `dismissLabel`)는 i18n 키로 넣는다. 비면 `TypeError`.
- 항목이 0개인데 `asyncState`가 `idle`이면 오류를 던진다. 로딩·빈 결과는 `asyncState`로 알린다.
  controlled 키가 목록에 없으면(그리고 `selectedItem`도 아니면) Native는 `RangeError`다.
- 옛 Native `options`·`value`·`onValueChange`는 1.11에서 제거됐다. `items`/`selectedKey`/`onSelectionChange`를 쓴다.
- Native 선택 후 화면 이동·다른 modal 열기는 `onSelectionAfterDismiss`에서 한다. sheet가 닫히기 전에
  다음 modal을 띄우지 않는다.
- Web `className`·`style`은 트리거 버튼, Native `style`은 바깥 View에 붙는다. 배치에만 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 목록 표면 | anchored popover(`align`, `portalContainer`) | modal sheet(`dismissLabel` 필수) |
| 컬렉션 입력 | `items` 또는 `sections` | `source`·`items`·`sections` 중 정확히 하나 |
| 선택 해제 항목 문구 | `emptySelectionLabel` 필수 | 없음 |
| 재시도 | 없음 | `onRetry`, `retryLabel` |
| 낭독 보조 | 없음 | `readOnlyLabel`, `openHint`, `optionsAccessibilityLabel` |
| 키보드 | `loop`, typeahead(`locale`) | 해당 없음 |
| `description`·`error` 타입 | `ReactNode` | `string` |
