# Combobox 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `comboboxRecipe`(`src/component-recipes.ts`), behavior `combobox`

## 언제 쓰나

주어진 목록에서 하나를 고르는데 목록이 길어 입력으로 좁혀야 할 때 쓴다. 나라·도시·카테고리 고르기가
여기에 속한다. 입력창이 곧 검색어이고, 확정된 값은 목록 항목 하나다. Native는 서버 검색 결과
(`filtering="external"`)도 받는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 항목이 짧아 입력 없이 고름 | [Select](select.md) |
| 목록 밖 값을 만들거나 여러 개를 고름 | [TagsInput](tags-input.md) ([경계](../tags-input.md)) |
| 결과가 화면 전체를 차지하는 검색 | [SearchField](search-field.md), [SearchScreen](search-screen.md) |
| 명령 실행 팔레트(Web) | [CommandPalette](command-palette.md) |
| 본문 중간의 `@` 언급 | [Mentions](mentions.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Combobox` | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Combobox } from "@hjmds/react/forms";

<Combobox
  label={t("profile.city")}
  items={cities.map((c) => ({ value: c.id, label: c.name }))}
  value={cityId}
  onValueChange={setCityId}
  emptyMessage={t("profile.city.empty")}
  loadingMessage={t("common.loading")}
  selectionRequiredMessage={t("profile.city.required")}
/>
```

```tsx
// Native
import { Combobox } from "@hjmds/react-native/forms";

<Combobox
  label={t("profile.city")}
  items={cities.map((c) => ({ id: c.id, label: c.name, textValue: c.name }))}
  selectedKey={cityId}
  onSelectionChange={setCityId}
  emptyMessage={t("profile.city.empty")}
  loadingMessage={t("common.loading")}
  clearLabel={t("common.clear")}
  dismissLabel={t("common.close")}
/>
```

## 축과 기본값

- `size`: `medium`(기본) · `large`. `density`: `comfortable`(기본) · `compact`.
- `openOnFocus`: 기본 `true`. 열림은 `open`/`defaultOpen`(기본 `false`)과 `onOpenChange(open, reason)`.
- 입력어는 `inputValue`/`defaultInputValue`/`onInputValueChange`로 따로 제어할 수 있다. 기본 입력어는 선택된 항목의 라벨이다.
- Web은 라벨과 `keywords`로 부분 일치 필터링을 한다. Native는 `filtering`: `local`(기본, `label`·`textValue`) · `external`.

## 꼭 지킬 것

- 상태 문구는 필수이고 i18n 키로 넣는다. Web은 `emptyMessage`·`loadingMessage`·`selectionRequiredMessage`,
  Native는 `emptyMessage`·`loadingMessage`·`clearLabel`·`dismissLabel`. Native는 빈 문자열이면 `TypeError`다.
- 선택 값은 목록에 있는 항목이어야 한다. Web은 없는 값이나 `disabled` 항목이면 `RangeError`, Native는
  목록에 없는 `selectedKey`에 `selectedItem` 스냅샷이 없으면 `RangeError`다.
- Native는 `items`·`sections`·`source` 중 정확히 하나만 준다.
- 입력을 고치면 확정 값이 지워진다(Web은 `""`, Native는 결과 sheet에서 다시 골라야 확정). 확정 값을 서버로
  보낼 때는 입력어가 아니라 `value`/`selectedKey`를 쓴다.
- `layoutStyle`은 없다. Web `className`은 input, `fieldClassName`은 필드 바깥에 붙는다. Native `style`은 바깥
  View에 붙는다. 배치에만 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 형태 | `{ value, label, keywords?, disabled? }` | `{ id, label, textValue, description?, disabled? }`, `sections` 가능 |
| 선택 값 | `value`·`onValueChange(string)`, 빈 값은 `""` | `selectedKey`·`onSelectionChange(key \| null)` |
| 결과 표시 | 입력 아래 listbox(포털, `align`, `portalContainer`) | `Modal` 결과 sheet(`sheetTitle`) |
| 비동기 결과 | `loading`만 | `asyncState`, `queryValue`/`resultQuery`, `minimumQueryLength`, `onRetry` |
| 확정 콜백 | `onValueChange` | `onCommit(key, reason)`, sheet가 닫힌 뒤 `onCommitAfterDismiss` |
| 폼 제출 | `name`이면 hidden input에 값 | 없음 |
| 항목 leading | 없음 | `renderLeading(item, props)` |

## 함정

- Native의 `onSelectionChange`·`onCommit`은 결과 `Modal`이 닫히기 전에 불린다. 닫힌 뒤에 해야 하는
  후속 작업은 `onCommitAfterDismiss`로 받는다(Modal이 닫힌 다음 실행된다). 선택 뒤 iOS가 입력에 초점을
  되돌려 키보드·결과가 다시 열리던 문제는 renderer가 막는다(2026-09-30 감사, 소스 주석).
