# CorrelationMatrix

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: `src/data-workflows.ts`의 `validateCorrelation`, 양 renderer `src/data-workflows.tsx`, [데이터 해석과 가져오기 구성](../compositions/data-workflows.md)
- 스토리북: `배포/구성/정보 표시/상관 행렬`

## 언제 쓰나

여러 지표 사이의 상관계수(-1~1)를 정사각 대칭 표와 양·음 두 방향 heat 색으로 보여 줄 때 쓴다.
계산은 제품이 하고 HJM은 정사각·대칭·대각선 1·범위를 검증해 표시한다. 관측하지 못한 쌍은 `null`이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 기간별 잔존 비율 | [CohortRetentionTable](cohort-retention-table.md) |
| 두 변수 산포 | [Chart](chart.md)의 산점도 |
| 대각선을 비우는 대전표 | `MatrixTable`([DataTable](data-table.md)) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CorrelationMatrix` | 대칭 상관 행렬 heat 표 | `@hjmds/react/data-workflows` | `@hjmds/react-native/data-workflows` |

데이터 타입 `CorrelationData`와 검증 helper `validateCorrelation`은 `@hjmds/design-contracts/data-workflows`에서 import한다.

## 최소 사용 예

```tsx
// Web
import { CorrelationMatrix } from "@hjmds/react/data-workflows";

<CorrelationMatrix label={t("correlation.title")} variableColumnLabel={t("correlation.variable")}
  data={{ variables, values }} formatValue={v => v.toFixed(2)} missingLabel={t("correlation.unobserved")} />
```

```tsx
// Native
import { CorrelationMatrix } from "@hjmds/react-native/data-workflows";

<CorrelationMatrix label={t("correlation.title")} variableColumnLabel={t("correlation.variable")}
  data={{ variables, values }} formatValue={v => v.toFixed(2)} missingLabel={t("correlation.unobserved")} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| label | string | 필수 | 표 접근성 이름(화면에 제목을 그리지 않는다) |
| variableColumnLabel | string | 필수 | 첫 열 머리글 |
| data.variables | `readonly WorkflowField[]` | 필수 | 행·열 머리글. id 중복이면 오류 |
| data.values | `(number \| null)[][]` | 필수 | 변수 수와 같은 정사각, 대칭(오차 1e-10), 대각선은 1 또는 `null`, 값은 -1~1 |
| formatValue | `(value) => string` | 필수 | 관측 칸 문구 |
| missingLabel | string | 필수 | `null` 칸 문구 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 본문 폭을 채우는 DataTable. 열 = 변수 이름 + 변수 수 | [DataTable](data-table.md) |
| 간격 | DataTable 셀 여백(`regular` 세로 12·가로 16) | `dataTableRecipe.density` |
| 순서·정렬 | 변수 이름 열(`pinned: "start"`) → `variables` 순서의 열. 행도 같은 순서 | 양 renderer |
| 고정·스크롤 | 이름 열을 시작 쪽에 고정. Native는 나머지 열을 가로 `ScrollView`에 넣는다 | [DataTable](data-table.md) |
| 좁은 폭·큰 글자 | 열을 빼지 않고 이름 열 고정 + 가로 스크롤로 보존한다 | [DataTable](data-table.md) |

## 꼭 지킬 것

- 양수는 high(dataviz 계열 0번), 음수는 low(계열 1번) 색이며 |값| 0.35·0.7 경계로 세 단계다. 0과 `null`은 색을 칠하지 않는다.
- 비대칭·범위 밖 값은 렌더 시 `RangeError`가 난다. 표시를 위해 값을 잘라 넣지 말고 계산을 고친다.
- 정렬·행 선택이 없는 읽기 전용 표다. 변수 순서는 제품이 정한다.

## 상태와 상호작용

읽기 전용이다. heat 색은 현재 테마의 dataviz 색을 따른다. 색만으로 방향을 전하지 않도록 `formatValue`가
부호를 포함한 값을 보여 줘야 한다.
