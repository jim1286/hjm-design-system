# CohortRetentionTable

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: `src/data-workflows.ts`의 `resolveCohorts`, 양 renderer `src/data-workflows.tsx`, [데이터 해석과 가져오기 구성](../compositions/data-workflows.md)
- 스토리북: `배포/구성/정보 표시/코호트 잔존율`

## 언제 쓰나

가입 시점(코호트)별로 기간마다 남은 인원 비율을 직사각형 표와 heat 색으로 비교할 때 쓴다. 각 행의 `size`가
분모이고 `retained[i]`가 기간 i의 관측 인원이다. 아직 관측하지 않은 기간은 `null`(또는 생략)로 두면
`missingLabel`이 표시된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 순차 단계 전환율 | [ConversionFunnel](conversion-funnel.md) |
| 변수끼리 대칭 상관 | [CorrelationMatrix](correlation-matrix.md) |
| 정렬·선택이 필요한 일반 기록 표 | [DataTable](data-table.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CohortRetentionTable` | 코호트 잔존율 heat 표 | `@hjmds/react/data-workflows` | `@hjmds/react-native/data-workflows` |

행 타입 `Cohort`와 계산 helper `resolveCohorts`는 `@hjmds/design-contracts/data-workflows`에서 import한다.

## 최소 사용 예

```tsx
// Web
import { CohortRetentionTable } from "@hjmds/react/data-workflows";

<CohortRetentionTable label={t("retention.title")} cohortColumnLabel={t("retention.cohort")}
  periods={periodLabels} cohorts={cohorts} missingLabel={t("retention.unobserved")}
  formatRate={(rate, retained, size) => formatPercent(rate)} />
```

```tsx
// Native
import { CohortRetentionTable } from "@hjmds/react-native/data-workflows";

<CohortRetentionTable label={t("retention.title")} cohortColumnLabel={t("retention.cohort")}
  periods={periodLabels} cohorts={cohorts} missingLabel={t("retention.unobserved")}
  formatRate={(rate, retained, size) => formatPercent(rate)} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| label | string | 필수 | 표 접근성 이름(화면에 제목을 그리지 않는다) |
| cohortColumnLabel | string | 필수 | 첫 열 머리글 |
| periods | `readonly string[]` | 필수 | 기간 열 머리글. 길이 1 이상이어야 한다 |
| cohorts | `readonly Cohort[]`(`id`·`label`·`size`·`retained`) | 필수 | `retained`는 `periods`보다 길 수 없고 각 값은 0~`size` 정수 또는 `null` |
| formatRate | `(rate, retained, size) => string` | 필수 | 관측 칸 문구 |
| missingLabel | string | 필수 | 미관측 칸·`size` 0 칸 문구 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 본문 폭을 채우는 DataTable. 열 = 코호트 이름 + 기간 수 | [DataTable](data-table.md) |
| 간격 | DataTable 셀 여백(`regular` 세로 12·가로 16) | `dataTableRecipe.density` |
| 순서·정렬 | 코호트 이름 열(`pinned: "start"`) → 기간 열 순서대로. 행은 `cohorts` 순서 | 양 renderer |
| 고정·스크롤 | 이름 열을 시작 쪽에 고정. Native는 나머지 열을 가로 `ScrollView`에 넣는다 | [DataTable](data-table.md) |
| 좁은 폭·큰 글자 | 열을 빼지 않고 이름 열 고정 + 가로 스크롤로 비교를 보존한다 | [DataTable](data-table.md) |

## 꼭 지킬 것

- heat 색은 비율이 0보다 클 때만 칠하고 강도는 0.35·0.7 경계의 세 단계다. 제품 CSS로 칸 색을 다시 칠하지 않는다.
- 미관측과 0명을 구분한다. 0명은 `retained`에 0, 미관측은 `null`로 넣는다.
- 정렬·행 선택은 제공하지 않는 읽기 전용 표다. 정렬이 필요하면 제품이 `cohorts` 순서를 바꾼다.

## 상태와 상호작용

읽기 전용이다. heat 색은 테마의 dataviz 계열 0번 색(high)을 쓰며 테마 전환을 따른다. 잘못된 분모·기간 수는
렌더 시 `RangeError`로 막는다.
