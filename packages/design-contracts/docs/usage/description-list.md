# DescriptionList 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [DescriptionList](../description-list.md), recipe `descriptionListRecipe`(`src/description-list.ts`)

## 언제 쓰나

라벨-값 쌍의 묶음을 보여 줄 때 쓴다. 프로필 정보, 계약·등급 조건, 주문 상세처럼 값이 임의 길이의
텍스트인 읽기 전용 정보가 여기에 속한다. 화면 폭과 글자 배율에 따라 2열에서 1열로 접는 판정은
HJM이 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 짧은 숫자 지표·추세 | [Statistic](statistic.md) |
| 누르면 이동·편집하는 행 | [ListRow](list-row.md) |
| 정렬·여러 열이 있는 표 | [DataTable](data-table.md)(Web) |
| 입력 폼 | [Form](form.md), [Field](field.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `DescriptionList` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

## 최소 사용 예

```tsx
// Web
import { DescriptionList } from "@hjmds/react/display";

<DescriptionList
  items={[
    { id: "grade", label: t("contract.grade"), value: formattedGrade },
    { id: "seasons", label: t("contract.seasons"), value: formattedSeasons },
  ]}
/>
```

```tsx
// Native
import { DescriptionList } from "@hjmds/react-native/data-display";

<DescriptionList
  label={t("contract.summary")}
  descriptor={{
    items: [
      { id: "grade", label: t("contract.grade"), value: formattedGrade },
      { id: "seasons", label: t("contract.seasons"), value: formattedSeasons },
    ],
  }}
/>
```

## 축과 기본값

- `columns`: `1` · `2`(기본). 요청값일 뿐이며 resolver가 폭·`textScale`을 보고 1열로 접을 수 있다.
- 각 항목은 `{ id, label, value }`이고 셋 다 빈 문자열이면 안 된다. 항목이 없거나 `id`가 겹치면 예외가 난다.

## 꼭 지킬 것

- `value`는 제품이 locale·단위까지 포맷한 문자열로 넘긴다. HJM은 값을 포맷하지 않는다.
- 큰 글자 대응으로 화면에서 `fontScale`을 보고 `columns={1}`을 넘기지 않는다. 접힘은 resolver가 한다
  ([계약](../description-list.md#큰-글자에서의-전환--resolver가-소유)).
- 라벨은 i18n 키로 넣는다. Native는 목록 전체의 접근성 이름 `label`이 필수다.
- 배치는 Web `layoutStyle`, Native `style`로만 한다. 색·글자 스타일을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 데이터 전달 | `items`, `columns` 평면 prop | `descriptor={{ items, columns }}` |
| 목록 이름 | 없음(`dl`/`dt`/`dd` 의미 구조) | `label` 필수, `accessibilityRole="list"` |
| 폭 측정 | 요소 폭 측정 | `availableWidth`가 우선, 없으면 `onLayout` 측정, 첫 프레임은 창 폭 |
| 배치 prop | `layoutStyle` | `style`, 항목별 `itemStyle` |

## 함정

- Native에서 `availableWidth`에 0 이하·NaN을 넘기면 `RangeError`가 난다.
- Native는 각 쌍을 `"라벨, 값"` 하나의 접근성 노드로 읽는다. 라벨 문구에 쉼표·값을 반복하지 않는다.
