# HistogramExplorer

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [데이터 해석과 가져오기 계약](../../data-workflows.md), `src/data-workflows.ts`의 `binHistogram`, 양 renderer `src/data-workflows.tsx`
- 스토리북: `배포/구성/정보 표시/분포 구간 탐색`

## 언제 쓰나

실제 관측값 배열의 분포를 동폭 구간 막대로 보여 주고, 사용자가 구간 수를 바꿔 볼 때 쓴다.
Lucian 130·160–164 검토에서 별도 차트 엔진 대신 BarChart를 합성하기로 한 데이터 구성의 하나다.
구간 수를 바꿔도 모든 선택지의 최대 count로 y축을 고정해 막대 높이의 의미가 바뀌지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 이미 집계된 범주 값 | `BarChart` |
| 시간에 따른 추이 | `LineChart` |
| 단계별 감소 | `ConversionFunnel` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `HistogramExplorer` | 구간 수 선택 + 분포 막대 + 요약 | `@hjmds/react/data-workflows` | `@hjmds/react-native/data-workflows` |

`binHistogram`·`HistogramBin`은 `@hjmds/design-contracts/data-workflows`에 있다. root barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { HistogramExplorer } from "@hjmds/react/data-workflows";

<HistogramExplorer label={t("stats.duration")} samples={durations /* null = 미관측 */} domain={[0, 10]}
  binCounts={[2, 4, 8]} binCount={binCount} onBinCountChange={setBinCount}
  binLabel={bin => `${format(bin.lower)}–${format(bin.upper)}`} binCountLabel={count => t("stats.bins", { count })}
  formatCount={String} missingLabel={t("stats.unobserved")}
  summaryLabel={h => t("stats.summary", { observed: h.observed, missing: h.missing, outside: h.underflow + h.overflow })} />
```

```tsx
// Native
import { HistogramExplorer } from "@hjmds/react-native/data-workflows";

<HistogramExplorer label={t("stats.duration")} samples={durations} domain={[0, 10]}
  binCounts={[2, 4, 8]} binCount={binCount} onBinCountChange={setBinCount}
  binLabel={binLabel} binCountLabel={binCountLabel} formatCount={String}
  missingLabel={t("stats.unobserved")} summaryLabel={summaryLabel} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| label | string | 필수 | 제목, 차트 접근성 이름 |
| samples | (number \| null)[] | 필수 | 유한 값 또는 null(미관측) |
| binCounts | number[] | 필수 | 서로 다른 구간 수 선택지(각 1–100), `binCount` 포함 |
| binCount / onBinCountChange | number / fn | 필수 | 선택한 구간 수(제품 소유) |
| domain | [number, number] | 관측 최소·최대 | 지정하면 범위 밖 값을 underflow/overflow로 셈 |
| binLabel / binCountLabel / formatCount | fn | 필수 | 구간·선택지·count 문구 |
| missingLabel | string | 필수 | 관측값이 없을 때와 차트 결측 문구 |
| summaryLabel | (histogram) => string | 필수 | observed·missing·underflow·overflow 요약 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | BarChart 기본 규격, 값 표시(`showValues`) | 양 renderer |
| 간격 | 세로 md, 구간 선택 버튼 sm | 양 renderer |
| 순서·정렬 | 제목 → 구간 수 버튼(secondary, 선택 강조) → 막대 → 요약 | 양 renderer |
| 고정·스크롤 | 바깥 화면 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 구간 수 버튼 `wrap` 줄바꿈 | 양 renderer |

관측값이 하나도 없으면 막대 대신 `missingLabel`을 가로 중앙에 둔다.

## 꼭 지킬 것

- `binCounts`가 비었거나, `binCount`를 포함하지 않거나, 중복이 있으면 `RangeError`다.
- 구간은 동폭이며 마지막 구간만 상한을 포함한다. 무한대·NaN 샘플은 `RangeError`다.
- y축은 모든 선택지의 최대 count로 고정된다. 앱이 구간마다 다시 정규화하지 않는다.

## 상태와 상호작용

구간 수 버튼은 `onBinCountChange`만 호출한다. 요약은 Web `role="status"`, Native polite live region으로 갱신을 알린다.
