# SearchField 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `searchFieldRecipe`(`src/component-recipes.ts`). 별도 계약 문서는 없다.

## 언제 쓰나

목록·화면 안에서 검색어를 입력받을 때 쓴다. 검색 아이콘, 값이 있을 때의 지우기 버튼,
조회 중 진행 표시가 기본으로 들어 있다. 입력값 상태만 소유하고 조회·결과는 제품이 맡는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 검색 입력·최근 검색·결과 상태를 갖춘 전체 화면 | [SearchScreen](search-screen.md) |
| 입력하며 후보 중 하나를 선택해 값으로 확정 | [Combobox](combobox.md) |
| 앱 전체 명령·이동 검색(Web) | [CommandPalette](command-palette.md) |
| 검색이 아닌 일반 텍스트 입력 | [Field](field.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SearchField` | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/inputs` | 기본 |

## 최소 사용 예

```tsx
// Web
import { SearchField } from "@hjmds/react/forms";

<SearchField
  aria-label={t("feed.search.label")}
  placeholder={t("feed.search.placeholder")}
  clearLabel={t("common.clearSearch")}
  value={query}
  onValueChange={setQuery}
  loading={isFetching}
/>
```

```tsx
// Native
import { SearchField } from "@hjmds/react-native/inputs";

<SearchField
  accessibilityLabel={t("feed.search.label")}
  placeholder={t("feed.search.placeholder")}
  clearLabel={t("common.clearSearch")}
  busyLabel={t("common.searching")}
  value={query}
  onValueChange={setQuery}
  busy={isFetching}
/>
```

## 축과 기본값

- `size`: `medium`(기본) · `large`. `variant`: `surface` · `inset`. `shape`: `medium` · `large` · `full`. `align`: `start` · `center`.
- `value`/`defaultValue`(기본 `""`)/`onValueChange(string)`. 지우기를 누르면 `""`로 바꾸고 `onClear`를 부른다.
- 진행 중: Web `loading`, Native `busy`(기본 `false`). 진행 중에는 지우기 대신 진행 표시가 뒤에 선다.
- `clearLabel`(필수)은 지우기 버튼의 접근성 이름이다. Native는 `busyLabel`도 필수다.
- 이름: 보이는 `label` 또는 Web `aria-label` / Native `accessibilityLabel`. 둘 다 없으면 렌더 중 `TypeError`다.

## 꼭 지킬 것

- 모든 문구(`placeholder`, `clearLabel`, `busyLabel`)는 i18n 키로 넣는다.
- 아이콘은 제품 adapter로 그린다(`renderSearchIcon`/`renderLeading`, `renderClearIcon`). 크기·색은 렌더 함수가
  받은 값을 쓴다. 지우기 버튼·스피너를 `trailing`으로 따로 만들지 않는다. `trailing`은 지우기/진행이
  없을 때만 보인다.
- 디바운스·요청 취소는 제품 소유다. `onValueChange`마다 바로 요청하지 않는다.
- 배치: Native는 `layoutStyle`만(`style`은 타입에서 빠져 있다). Web은 `fieldClassName`이 필드 틀에 붙는다.
  색·높이·radius를 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 진행 상태 prop | `loading`(+`renderLoadingIndicator`) | `busy`(+`renderBusyIndicator`, `busyLabel` 필수) |
| 검색 아이콘 | `renderSearchIcon`, 또는 `leading` | `renderLeading`, 또는 `leading` |
| 진행 중 입력 | 입력 가능(`aria-busy`) | 입력 변경 무시 |
| 입력 요소 | `<input type="search">`, 원시 `onChange`도 전달 | `TextInput` |
| 배치 | `fieldClassName`(필드 틀) | `layoutStyle` |
