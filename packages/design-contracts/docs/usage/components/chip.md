# Chip

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Tag와의 경계](../../tag.md#chip과의-경계), recipe `chipRecipe`(`src/component-recipes.ts`), behavior `chip`
- 스토리북: `배포/컴포넌트/입력/선택 칩`

## 언제 쓰나

누를 수 있는 작은 pill이다. 필터 줄(여러 개 켬), 정렬·범위처럼 하나만 고르는 칩 줄, 추천 검색어처럼
누르면 바로 행동하는 칩에 쓴다. 선택 상태는 항상 제품이 들고 있다(숨은 내부 상태가 없다).

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 누를 수 없는 분류·속성 라벨 | [Tag](tag.md) |
| 개수·상태 표시 | [Badge](badge.md) |
| 줄 단위 선택지와 설명 | [CheckboxGroup](checkbox-group.md), [RadioGroup](radio-group.md) |
| 같은 폭의 구간 전환 | [SegmentedControl](segmented-control.md) |
| 사용자가 값을 입력해 칩을 만듦 | [TagsInput](tags-input.md) |
| 일반 텍스트 행동 | [Button](button.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Chip` | 기본 | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` |

## 최소 사용 예

```tsx
// Web
import { Chip } from "@hjmds/react/selection";

<Chip
  label={t("feed.filter.photo")}
  selectionMode="multiple"
  selected={filters.has("photo")}
  onSelectedChange={(next) => toggleFilter("photo", next)}
/>
```

```tsx
// Native
import { Chip } from "@hjmds/react-native/inputs";

<Chip
  label={t("feed.filter.photo")}
  selectionMode="multiple"
  selected={filters.has("photo")}
  onPress={(next) => toggleFilter("photo", next)}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `selectionMode` | `action`(버튼) · `single`(radio 역할) · `multiple`(checkbox 역할) | `action` | `single`·`multiple`이면 `selected`가 필수이고, `action`이면 `selected`를 줄 수 없다 |
| `selected` | `boolean` | — | 제어 전용. Chip은 내부 선택 상태를 두지 않는다 |
| Web `onSelectedChange` | `(selected: boolean) => void` | — | 선택 칩에서 필수. 다음 상태(`!selected`)를 받는다 |
| Web `onPress` | `(event: MouseEvent<HTMLButtonElement>) => void` | — | 선택 사항. `event.preventDefault()`면 `onSelectedChange`를 부르지 않는다 |
| Native `onPress` | 행동 칩 `(event: GestureResponderEvent) => void` · 선택 칩 `(selected: boolean, event: GestureResponderEvent) => void` | — | 필수 |
| `size` | `small` · `medium` | `small` | — |
| `renderSelectionIndicator` | `(props: { selected: boolean; color: string; size: number }) => ReactNode` (Web `color`는 `"currentColor"`) | 체크 표시 | 선택되면 붙는 체크 표시를 바꾼다 |
| `leading` · `trailing` | `ReactNode` | — | 장식이다(접근성 트리에서 숨는다). 의미는 `label`에 담는다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 칩 배치. Native `leadingStyle`·`indicatorStyle`·`trailingStyle`도 배치 key만 받는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 내용 폭. 높이 `small` 36 · `medium` 44(`control.chipHeight`), 모서리 `radius.full`. `small`은 위아래 4를 넓혀(Native hitSlop, Web `::after`) 터치 영역을 44에 맞춘다 | `chipRecipe.sizes`, `react-native/src/inputs.tsx` |
| 간격 | 좌우 여백 `small` `spacing.sm` 12 · `medium` `spacing.md` 16, 아이콘↔라벨 `small` `spacing.xxs` 4 · `medium` `spacing.xs` 8(두 플랫폼). 칩 사이는 부모가 정한다(`spacing.xs` 8 권장) | `chipRecipe.sizes`, `.hjm-chip` |
| 순서·정렬 | 필터 줄·태그 묶음으로 가로로 나란히 둔다. 안쪽은 [선택 표시] → [leading] → [라벨] → [trailing]. 선택 상태는 브랜드 테두리·글자색 | `chipRecipe.slots`, `.hjm-chip[data-selected]` |
| 고정·스크롤 | 고정 영역이 없다. 칩이 많으면 부모가 줄바꿈하거나 가로 스크롤 영역을 둔다. 검색 화면의 필터 칩 줄은 [SearchScreen](search-screen.md) `filtersOverflow="scroll"`이 가로 스크롤을 소유한다 | `SearchScreen` |
| 좁은 폭·큰 글자 | 라벨이 줄바꿈된다(`overflow-wrap: anywhere`). 높이는 최소값이라 늘어난다 | `.hjm-chip__label` |

## 꼭 지킬 것

- `label`은 i18n 키로 넣는다. Native는 `string`만 받고, 다른 읽기 이름이 필요하면 `accessibilityLabel`을 준다.
- `single` 줄은 제품이 하나만 `selected`가 되도록 관리한다. Chip이 형제를 해제하지 않는다.
- 색·테두리를 덮지 않는다. 배치는 두 renderer 모두 `layoutStyle`로 한다. Native `labelStyle`은 deprecated —
  `size`·`selected`로 글자 모양을 정한다([이관 문서](../../migration-native-legacy-removal.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 행동 칩 이벤트 | `onPress(event)`(선택 사항) | `onPress(event)`(필수) |
| 선택 칩 이벤트 | `onSelectedChange(next)`, `onPress(event)`는 선택 사항 | `onPress(next, event)` 하나 |
| 선택 변경 취소 | `onPress`에서 `event.preventDefault()` | 없음 |
| `label` 타입 | `ReactNode` | `string` |
| 배치 | `layoutStyle` | `layoutStyle`, 슬롯별 `leadingStyle`·`indicatorStyle`·`trailingStyle`(배치 key만) |
| 선택 표시 위치 | 표시 → leading → 라벨 | leading → 표시 → 라벨 |

## 함정

- 두 renderer의 선택 콜백 이름이 다르다. Web 코드를 옮기면서 `onSelectedChange`를 Native에 넘기면
  타입 오류가 나고, Native의 `onPress(next, event)`를 Web에 넘기면 첫 인자가 이벤트다.
