# DescriptionList

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [DescriptionList](../../description-list.md), recipe `descriptionListRecipe`(`src/description-list.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/설명 목록`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `DescriptionList` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `columns` | `1` · `2` | `2` | 요청값일 뿐이며 resolver가 폭·`textScale`을 보고 1열로 접을 수 있다 |
| 항목 | `{ id, label: string, value: string }` | — (필수) | 셋 다 빈 문자열이면 안 된다. 항목이 없거나 `id`가 겹치면 예외가 난다 |
| Native `label` | `string` | — (필수) | 목록 전체의 접근성 이름 |
| Native `availableWidth` | 양수 | 측정값 | 주면 측정보다 우선 |
| `layoutStyle` | 배치 전용 style | — | 루트 배치. Native `style`·`itemStyle`은 deprecated |

콜백 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 항목 최소 폭 160 × `textScale` | `src/description-list.ts`(`descriptionListRecipe.group.minItemWidth`) |
| 간격 | 항목 사이 가로·세로 `spacing.sm` 12. 각 항목의 라벨–값 `spacing.xxs` 4 | `src/description-list.ts`, `packages/react/src/styles.css` `.hjm-description-list*`, `packages/react-native/src/data-display.tsx` |
| 순서·정렬 | [Card](card.md)·[Section](section.md) 본문 안에 둔다. 각 항목은 라벨 위·값 아래. 항목은 `items` 순서대로 행 우선으로 채운다(왼쪽 → 오른쪽, 위 → 아래) | 같은 파일 |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 폭이 `2 × 160 × textScale + 12` 미만이면 1열로 접는다(배율 1이면 332, 배율 1.6이면 524). 값이 길면 줄바꿈한다(Web `overflow-wrap: anywhere`) | `src/description-list.ts`(열 판정 함수), `packages/react/src/styles.css` |

## 꼭 지킬 것

- `value`는 제품이 locale·단위까지 포맷한 문자열로 넘긴다. HJM은 값을 포맷하지 않는다.
- 큰 글자 대응으로 화면에서 `fontScale`을 보고 `columns={1}`을 넘기지 않는다. 접힘은 resolver가 한다
  ([계약](../../description-list.md#큰-글자에서의-전환--resolver가-소유)).
- 라벨은 i18n 키로 넣는다. Native는 목록 전체의 접근성 이름 `label`이 필수다.
- 배치는 `layoutStyle`로만 한다(Web·Native). 색·글자 스타일을 덮지 않는다. Native `style`·`itemStyle`은 deprecated — 배치는 `layoutStyle`, 열 배치는 `descriptor.columns`로 옮긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 데이터 전달 | `items`, `columns` 평면 prop | `descriptor={{ items, columns }}` |
| 목록 이름 | 없음(`dl`/`dt`/`dd` 의미 구조) | `label` 필수, `accessibilityRole="list"` |
| 폭 측정 | 요소 폭 측정 | `availableWidth`가 우선, 없으면 `onLayout` 측정, 첫 프레임은 창 폭 |
| 배치 prop | `layoutStyle`(`style`과 합친다) | `layoutStyle`(`style`·`itemStyle`은 deprecated) |

## 함정

- Native에서 `availableWidth`에 0 이하·NaN을 넘기면 `RangeError`가 난다.
- Native는 각 쌍을 `"라벨, 값"` 하나의 접근성 노드로 읽는다. 라벨 문구에 쉼표·값을 반복하지 않는다.
