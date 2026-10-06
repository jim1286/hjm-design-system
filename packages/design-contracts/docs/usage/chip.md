# Chip 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Tag와의 경계](../tag.md#chip과의-경계), recipe `chipRecipe`(`src/component-recipes.ts`), behavior `chip`

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Chip` | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` | 기본 |

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

- `selectionMode`: `action`(기본, 버튼) · `single`(radio 역할) · `multiple`(checkbox 역할).
  `single`·`multiple`이면 `selected`가 필수이고, `action`이면 `selected`를 줄 수 없다.
- `size`: `small`(기본) · `medium`.
- 선택되면 체크 표시가 붙는다. 바꾸려면 `renderSelectionIndicator`를 쓴다.
- `leading`·`trailing`은 장식이다(접근성 트리에서 숨는다). 의미는 `label`에 담는다.

## 꼭 지킬 것

- `label`은 i18n 키로 넣는다. Native는 `string`만 받고, 다른 읽기 이름이 필요하면 `accessibilityLabel`을 준다.
- `single` 줄은 제품이 하나만 `selected`가 되도록 관리한다. Chip이 형제를 해제하지 않는다.
- 색·테두리를 덮지 않는다. Native 배치는 `layoutStyle`로만 한다(1.11에서 `style` 제거,
  [이관표](../migration-native-legacy-removal.md)). Web에는 `layoutStyle`이 없다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 행동 칩 이벤트 | `onPress(event)`(선택 사항) | `onPress(event)`(필수) |
| 선택 칩 이벤트 | `onSelectedChange(next)`, `onPress(event)`는 선택 사항 | `onPress(next, event)` 하나 |
| 선택 변경 취소 | `onPress`에서 `event.preventDefault()` | 없음 |
| `label` 타입 | `ReactNode` | `string` |
| 배치 | `className`/HTML 속성 | `layoutStyle`, 슬롯별 `leadingStyle`·`indicatorStyle`·`trailingStyle` |
| 선택 표시 위치 | 표시 → leading → 라벨 | leading → 표시 → 라벨 |

## 함정

- 두 renderer의 선택 콜백 이름이 다르다. Web 코드를 옮기면서 `onSelectedChange`를 Native에 넘기면
  타입 오류가 나고, Native의 `onPress(next, event)`를 Web에 넘기면 첫 인자가 이벤트다.
