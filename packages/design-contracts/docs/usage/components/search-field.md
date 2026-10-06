# SearchField

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/component-recipes.ts`(`searchFieldRecipe`). 별도 계약 문서는 없다
- 스토리북: `배포/컴포넌트/입력/검색 입력`

## 언제 쓰나

목록·화면 안에서 검색어를 입력받을 때 쓴다. 검색 아이콘, 값이 있을 때의 지우기 버튼,
조회 중 진행 표시가 기본으로 들어 있다. 입력값 상태만 소유하고 조회·결과는 제품이 맡는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 입력하며 후보 중 하나를 선택해 값으로 확정 | [Combobox](combobox.md) |
| 앱 전체 명령·이동 검색(Web) | [CommandPalette](command-palette.md) |
| 검색이 아닌 일반 텍스트 입력 | [Field](field.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SearchField` | 기본 | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/inputs` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `medium` · `large` | `medium` | 최소 높이 44 · 52 |
| `variant` | `surface` · `inset` | — | — |
| `shape` | `medium` · `large` · `full` | `medium` | — |
| `align` | `start` · `center` | — | — |
| `value` · `defaultValue` | 문자열 | `""` | — |
| `onValueChange` | `(value: string) => void` | — | 입력마다. 지우기를 누르면 `""`로 부른 뒤 `onClear`를 부른다. Web은 원시 `onChange`도 받는다 |
| `onClear` | `() => void` | — | 지우기 버튼을 누른 뒤 |
| `loading`(Web) / `busy`(Native) | `boolean` | `false` | 진행 중에는 지우기 대신 진행 표시가 뒤에 선다 |
| `clearLabel` | 문자열 | — | 필수, 지우기 버튼 접근성 이름. Native는 `busyLabel`도 필수 |
| `renderSearchIcon`(Web) · `renderLeading`(Native) | `(props) => ReactNode` — Web `{ color: "currentColor", size }`, Native `{ color, size, disabled }` | 기본 돋보기 | 제품 아이콘 adapter |
| `renderClearIcon` · `renderLoadingIndicator`(Web) · `renderBusyIndicator`(Native) | 위와 같은 모양 | 기본 아이콘·스피너 | — |
| `layoutStyle` | 배치 전용 style 객체 | — | 필드 전체 배치. Web `style`은 안쪽 input에 붙는다 |
| `label` / `aria-label`(Web) / `accessibilityLabel`(Native) | 문자열 | — | 하나는 필수. 없으면 렌더 중 `TypeError` |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 최소 높이 `medium` 44 · `large` 52. 지우기 버튼 `medium` 지름 36 + hitSlop 4, `large` 44(Web은 36 원에 `::after` 4px로 터치 44를 만든다) | `searchFieldRecipe.sizes`, `control.minTouchTarget`, `control.buttonHeight.large`, `.hjm-search-field__clear` |
| 간격 | 필드 안 좌우 `medium` `spacing.sm` 12 · `large` `spacing.md` 16, 안쪽 요소 사이 `medium` `spacing.xs` 8 · `large` `spacing.sm` 12(두 플랫폼). 아래 결과 목록과 `layout.contentGap` 16. 좌우는 화면 `layout.pagePadding`(`compact` 16 · `regular` 20)을 따른다 | `searchFieldRecipe.sizes`, `layout` |
| 순서·정렬 | 돋보기 → 입력 → 지우기/진행 표시. 목록·결과 바로 위에 폭을 꽉 채워 둔다. 필터 칩·정렬 버튼은 같은 줄이 아니라 아래 줄에 둔다 | `searchFieldRecipe.slots` |
| 고정·스크롤 | 컴포넌트 자체는 고정되지 않는다. 스크롤 중에도 보여야 하면 스크롤 영역 밖(목록 위 고정 영역)에 둔다 | — |
| 좁은 폭·큰 글자 | 높이는 최소값이라 큰 글자에서 늘어난다. 좁은 폭에서도 한 줄 전체 폭을 쓴다 | `minHeight`(`searchFieldRecipe.sizes`) |

```text
┌──────────────────────────────┐
│ TopBar                        │ ← 고정
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ 🔍  검색어          (×)  │ │ 44 (medium), 좌우 pagePadding
│ └──────────────────────────┘ │
│   gap layout.contentGap 16   │
│ 결과 행                       │ ↕ 스크롤
│ 결과 행                       │
└──────────────────────────────┘
```

## 꼭 지킬 것

- 모든 문구(`placeholder`, `clearLabel`, `busyLabel`)는 i18n 키로 넣는다.
- 아이콘은 제품 adapter로 그린다(`renderSearchIcon`/`renderLeading`, `renderClearIcon`). 크기·색은 렌더 함수가
  받은 값을 쓴다. 지우기 버튼·스피너를 `trailing`으로 따로 만들지 않는다. `trailing`은 지우기/진행이
  없을 때만 보인다.
- 디바운스·요청 취소는 제품 소유다. `onValueChange`마다 바로 요청하지 않는다.
- 배치는 `layoutStyle`로 한다(Native는 `style`이 타입에서 빠져 있다). Web `fieldClassName`은 필드 틀에, `style`은 안쪽
  input에 붙는다. 색·높이·radius를 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 진행 상태 prop | `loading`(+`renderLoadingIndicator`) | `busy`(+`renderBusyIndicator`, `busyLabel` 필수) |
| 검색 아이콘 | `renderSearchIcon`, 또는 `leading` | `renderLeading`, 또는 `leading` |
| 진행 중 입력 | 입력 가능(`aria-busy`) | 입력 가능(`accessibilityState.busy`). 2026-10-06까지 Native는 `busy`인 동안 입력을 무시했다(1.12.1 이후 미게시) |
| 입력 요소 | `<input type="search">`, 원시 `onChange`도 전달 | `TextInput` |
| 배치 | `layoutStyle`·`fieldClassName`(필드 틀), `style`은 안쪽 input | `layoutStyle` |
