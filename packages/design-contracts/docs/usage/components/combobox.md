# Combobox

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `comboboxRecipe`(`src/component-recipes.ts`), behavior `combobox`
- 스토리북: `배포/컴포넌트/입력/검색형 선택`

## 언제 쓰나

주어진 목록에서 하나를 고르는데 목록이 길어 입력으로 좁혀야 할 때 쓴다. 나라·도시·카테고리 고르기가
여기에 속한다. 입력창이 곧 검색어이고, 확정된 값은 목록 항목 하나다. Native는 서버 검색 결과
(`filtering="external"`)도 받는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 항목이 짧아 입력 없이 고름 | [Select](select.md) |
| 목록 밖 값을 만들거나 여러 개를 고름 | [TagsInput](tags-input.md) ([경계](../../tags-input.md)) |
| 결과가 화면 전체를 차지하는 검색 | [SearchField](search-field.md) |
| 명령 실행 팔레트(Web) | [CommandPalette](command-palette.md) |
| 본문 중간의 `@` 언급 | [Mentions](mentions.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Combobox` | 기본 | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| Web `items` | `readonly { value: string; label: string; keywords?: readonly string[]; disabled?: boolean }[]` | 필수 | 라벨과 `keywords`로 부분 일치 필터링한다 |
| Web `value` · `defaultValue` + `onValueChange` | `string` + `(value: string) => void` | `""` | 확정 값. 입력을 고치면 `""`로 지워진다 |
| Native `items` · `sections` · `source` | `readonly { id: Key; label: string; textValue: string; description?: string; disabled?: boolean }[]` · 구획 목록 · `{ items } \| { sections }` | — | 정확히 하나만 준다 |
| Native `selectedKey` · `defaultSelectedKey` + `onSelectionChange` | `Key \| null` + `(key: Key \| null) => void` | `null` | 확정 값. 목록 밖 키는 `selectedItem` 스냅샷이 필요하다 |
| Native `onCommit` · `onCommitAfterDismiss` | `(key: Key \| null, reason: "selection" \| "clear") => void` · `(key: Key, reason: "selection") => void \| Promise<void>` | — | 시트가 닫힌 뒤 할 일은 `onCommitAfterDismiss`에서 한다 |
| `inputValue` · `defaultInputValue` + `onInputValueChange` | `string` + `(value: string) => void` | 선택된 항목의 라벨 | 입력어를 따로 제어할 수 있다 |
| `open` · `defaultOpen` + `onOpenChange` | `boolean` + `(open: boolean, reason) => void` | `defaultOpen` `false` | reason: Web `"focus" \| "input" \| "keyboard" \| "selection" \| "escape" \| "blur"`, Native `"trigger" \| "keyboard" \| "selection" \| "escape" \| "outside" \| "blur" \| "programmatic"` |
| `size` | `medium` · `large` | `medium` | — |
| `density` | `comfortable` · `compact` | `comfortable` | — |
| `openOnFocus` | `boolean` | `true` | — |
| Native `filtering` | `"local"`(`label`·`textValue`) · `"external"` | `"local"` | `external`이면 제품이 `items`를 걸러 넘긴다 |
| Native `asyncState` | `{ status: "idle" }` · `{ status: "loading" \| "loadingMore" \| "empty" \| "error"; message: string }` | — | 결과 시트의 상태 문구. `error`면 `onRetry: () => void`·`retryLabel`로 다시 시도 버튼이 생긴다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 필드 바깥 배치 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 입력 높이 `medium` 44(`fieldFrameContract`) · `large` 52(`control.buttonHeight.large`), 폭은 폼 열을 채운다. Web 목록 최대 높이 22.5rem(360, recipe `popover.maxHeight`), 선택지 최소 높이 `compact` 44 · `comfortable` 56(3.5rem). Native 시트 최대 높이 화면의 75% | `selectRecipe.sizes`·`popover`, `.hjm-combobox__listbox`·`__option`, `react-native/src/forms.tsx` |
| 간격 | 라벨·설명·오류는 [Field](field.md) 규칙(`formSupportContract.gap` `spacing.xs` 8). Web 목록 안쪽 `spacing.xs` 8(`comboboxRecipe.popover.padding` = Select와 같은 표면. 2026-10-06까지 4, 1.12.1 이후 미게시), 선택지 안쪽 위아래 `spacing.xs` 8 · 좌우 `spacing.sm` 12. Native 시트 안쪽 `spacing.md` 16, 아래는 `spacing.md` + 하단 안전 영역, 요소 사이 `spacing.sm` 12 | `.hjm-combobox__option`, `react-native/src/forms.tsx` |
| 순서·정렬 | 폼 안에서 다른 입력과 같은 열에 둔다. Web은 입력 바로 아래(공간이 없으면 위, `data-placement`)에 목록이 붙는다. Native는 화면 아래에서 시트가 올라오고 [제목·닫기] → [상태 문구 또는 선택지 목록] 순서다 | `react/src/advanced-forms.tsx`(`AnchoredPortal`), `CollectionSheetHeader` |
| 고정·스크롤 | 목록은 그 안에서 스크롤한다. Web 목록은 `position: fixed`(z-index `layer.dropdown` 400)로 떠서 화면 스크롤과 무관하다. Native 시트는 배경막(`backdrop.modal`)과 함께 모달로 뜬다 | `.hjm-combobox__listbox`, `react-native/src/forms.tsx` |
| 좁은 폭·큰 글자 | 선택지 문구는 줄바꿈되고(`overflow-wrap: anywhere`) 높이가 늘어난다. 좁은 폭에서도 Web 목록은 입력에 붙는다 | `.hjm-combobox__option` |

```text
Web                                   Native
┌──────────────────────────┐          ┌──────────────────────────┐
│ 라벨                      │          │ 라벨                      │
│ [ 입력어 _____________ ▾ ]│          │ [ 입력어 _____________ ▾ ]│
│ ┌──────────────────────┐ │          │ ▒▒▒▒ 배경막 ▒▒▒▒▒▒▒▒▒▒▒▒ │
│ │ 선택지 1 (44/56)     │ │ ← fixed  │ ┌──────────────────────┐ │
│ │ 선택지 2             │ │   스크롤 │ │ 제목            [닫기]│ │
│ └──────────────────────┘ │          │ │ 선택지 목록(스크롤)  │ │ ← 최대 75%
│ 설명·오류                 │          │ │ ░ 하단 안전 영역 ░   │ │
└──────────────────────────┘          └─┴──────────────────────┴─┘
```

## 꼭 지킬 것

- 상태 문구는 필수이고 i18n 키로 넣는다. Web은 `emptyMessage`·`loadingMessage`·`selectionRequiredMessage`,
  Native는 `emptyMessage`·`loadingMessage`·`clearLabel`·`dismissLabel`. Native는 빈 문자열이면 `TypeError`다.
- 선택 값은 목록에 있는 항목이어야 한다. Web은 없는 값이나 `disabled` 항목이면 `RangeError`, Native는
  목록에 없는 `selectedKey`에 `selectedItem` 스냅샷이 없으면 `RangeError`다.
- Native는 `items`·`sections`·`source` 중 정확히 하나만 준다.
- 입력을 고치면 확정 값이 지워진다(Web은 `""`, Native는 결과 sheet에서 다시 골라야 확정). 확정 값을 서버로
  보낼 때는 입력어가 아니라 `value`/`selectedKey`를 쓴다.
- 배치는 `layoutStyle`(필드 바깥)로 한다. Web `style`·`className`은 input에, `fieldClassName`은 필드 바깥에 붙는다.
  Native `style`은 deprecated — `layoutStyle` 또는 `density`를 쓴다.

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
- Web은 `style`이 보이는 필드가 아니라 안쪽 input에 붙는다. 배치용 margin·width를 `style`로 주면 필드 틀과 어긋나므로
  `layoutStyle`을 쓴다.
