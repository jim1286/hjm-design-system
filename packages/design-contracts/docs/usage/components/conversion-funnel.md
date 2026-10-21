# ConversionFunnel

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: `src/data-workflows.ts`의 `resolveFunnel`, 양 renderer `src/data-workflows.tsx`, [데이터 해석과 가져오기 구성](../compositions/data-workflows.md)
- 스토리북: `배포/구성/정보 표시/전환 퍼널`

## 언제 쓰나

순차 단계(열기 → 작성 → 저장 등)의 인원을 가로 막대로 보여 주고, 단계를 골라 전체 대비·직전 대비 전환율과
이탈 수를 문구로 읽을 때 쓴다. 단계 수는 0 이상 정수이고 뒤 단계가 앞 단계보다 크면 오류다.
비율 계산은 `resolveFunnel`이 하고 문구 형식은 제품이 정한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 순서가 없는 범주 비교 | [Chart](chart.md)의 `BarChart` |
| 가입 시점별 기간 잔존 | [CohortRetentionTable](cohort-retention-table.md) |
| 목표 대비 하나의 수치 | `TargetSummary`([데이터 해석과 가져오기](../compositions/data-workflows.md)) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ConversionFunnel` | 순차 퍼널 막대·단계 선택·상세 문구 | `@hjmds/react/data-workflows` | `@hjmds/react-native/data-workflows` |

단계 타입 `FunnelStage`와 계산 helper `resolveFunnel`은 `@hjmds/design-contracts/data-workflows`에서 import한다.

## 최소 사용 예

```tsx
// Web
import { ConversionFunnel } from "@hjmds/react/data-workflows";

<ConversionFunnel label={t("funnel.title")} stages={stages} formatCount={formatNumber}
  missingLabel={t("chart.missing")}
  detailLabel={stage => t("funnel.detail", { label: stage.label, count: stage.count, rate: stage.conversion })} />
```

```tsx
// Native
import { ConversionFunnel } from "@hjmds/react-native/data-workflows";

<ConversionFunnel label={t("funnel.title")} stages={stages} formatCount={formatNumber}
  missingLabel={t("chart.missing")}
  detailLabel={stage => t("funnel.detail", { label: stage.label, count: stage.count, rate: stage.conversion })} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| label | string | 필수 | 제목 문구, 차트 접근성 이름, 막대 계열 이름 |
| stages | `readonly FunnelStage[]`(`id`·`label`·`count`·`reason?`) | 필수 | 순서대로. id 중복·증가하는 수는 `RangeError`/`TypeError` |
| formatCount | `(count) => string` | 필수 | 막대 값 문구 |
| missingLabel | string | 필수 | 결측 값 문구, 단계가 없을 때 빈 상태 문구 |
| detailLabel | `(stage) => string` | 필수 | 선택 단계 상세. `conversion`·`previousConversion`·`lost`는 분모가 0이거나 첫 단계면 `null` |

선택 단계는 내부 상태이며 처음에는 첫 단계다. 외부 controlled prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 가로 막대 차트(`orientation="horizontal"`), 높이는 BarChart 기본 `chartRecipe.heights.regular` 180 | 양 renderer, [Chart](chart.md) |
| 간격 | 제목·차트·단계 선택·상세 문구 사이 `spacing.md` 16, 단계 선택은 SegmentedControl의 연결된 컨트롤 계약 | `Stack gap="md"`, `SegmentedControl` |
| 순서·정렬 | 제목(strong) → 막대 차트 → SegmentedControl 단계 선택 → 상세 문구 | 양 renderer |
| 고정·스크롤 | 자체 스크롤 없음 | — |
| 좁은 폭·큰 글자 | 단계 선택은 SegmentedControl의 좁은 폭 배치를 따르고, 차트는 가로만 줄어든다 | [SegmentedControl](segmented-control.md), [Chart](chart.md) |

## 꼭 지킬 것

- 단계 수는 실제 관측값을 넣는다. 감소하지 않는 데이터를 억지로 정렬·보정하지 않는다(계산 helper가 오류를 낸다).
- 비율·인원 문구는 `detailLabel`·`formatCount`에서 제품 i18n으로 만든다. 0 분모를 0%나 100%로 만들지 않는다.
- 이탈 사유(`reason`)는 수집된 응답일 때만 넣는다.

## 상태와 상호작용

막대를 누르거나 끌어 포커스하면(`onFocusChange`) 또는 단계 버튼을 누르면 선택 단계가 바뀐다. 상세 문구는
Web `role="status"`, Native `accessibilityLiveRegion="polite"`로 알린다. 단계가 없으면 차트 대신 `missingLabel`을
가운데 정렬로 표시한다.
