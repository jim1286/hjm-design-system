# TargetSummary

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [데이터 구성 계약](../../data-workflows.md), `src/data-workflows.ts`의 `resolveTarget`, 양 renderer `src/data-workflows.tsx`
- 스토리북: `배포/구성/정보 표시/목표 달성 요약`

## 언제 쓰나

실적과 목표를 받아 실적 수치, 달성 설명, 달성률 막대를 한 묶음으로 보여 준다. 달성률은 `actual / target`을 1에서
멈춘 값이다. 목표가 0이면 비율의 분모가 없으므로 막대를 그리지 않고 100% 달성으로 꾸미지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목표 없는 단일 수치 | [Statistic](statistic.md) |
| 작업 진행률(업로드·단계) | [Progress](progress.md), [TransferTask](transfer-task.md) |
| 여러 계열의 시간 추이 | [Chart](chart.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TargetSummary` | 실적·목표 달성 요약 | `@hjmds/react/data-workflows` | `@hjmds/react-native/data-workflows` |

`resolveTarget`은 `@hjmds/design-contracts/data-workflows`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { TargetSummary } from "@hjmds/react/data-workflows";

<TargetSummary label={t("sales.monthly")} actual={actual} target={target}
  formatActual={value => formatCurrency(value, locale)}
  summaryLabel={s => s.ratio === null ? t("sales.noTarget") : t("sales.achieved", { percent: formatPercent(s.ratio) })} />
```

```tsx
// Native
import { TargetSummary } from "@hjmds/react-native/data-workflows";

<TargetSummary label={t("sales.monthly")} actual={actual} target={target}
  formatActual={value => formatCurrency(value, locale)}
  summaryLabel={s => s.ratio === null ? t("sales.noTarget") : t("sales.achieved", { percent: formatPercent(s.ratio) })} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | string | 필수 | 수치 라벨이자 막대 이름 |
| `actual` · `target` | number | 필수 | 유한한 0 이상 값. 아니면 `RangeError` |
| `formatActual` | `(actual) => string` | 필수 | 실적 표시 문자열 |
| `summaryLabel` | `(summary) => string` | 필수 | `summary`는 `{ actual, target, difference, ratio, progress }`. 목표 0이면 `ratio`·`progress`가 `null` |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | [Statistic](statistic.md) 기본(`comfortable`), [Progress](progress.md) 기본 `medium` 두께 8 | `data-workflows.tsx` |
| 간격 | 수치와 막대 사이 `spacing.sm` 12 | `Stack gap="sm"` |
| 순서·정렬 | 수치(라벨·값·`summaryLabel` hint) → 달성률 막대 | 양 renderer |
| 고정·스크롤 | 없음. 카드·대시보드 격자가 정한다 | — |
| 좁은 폭·큰 글자 | 막대는 부모 폭을 채우고 문구는 Statistic 규칙으로 줄바꿈 | Progress·Statistic 지침 |

## 꼭 지킬 것

- `summaryLabel`은 `ratio === null`(목표 0)을 따로 처리한다. 이 경우 막대가 없다.
- 100%를 넘는 실적도 막대는 가득 찬 상태에서 멈춘다. 초과분은 `difference`로 문구에 적는다.
- 숫자·통화·백분율 형식은 제품 locale로 만든다.

## 관련 지침

[데이터 해석과 가져오기](../compositions/data-workflows.md), [Statistic](statistic.md), [Progress](progress.md).
