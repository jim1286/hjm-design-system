# FilterRecovery

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [목록 편집 계약](../../collection-editing.md), `src/collection-editing.ts`의 `recoverableFilters`, 양 renderer `src/collection-editing.tsx`
- 스토리북: `배포/구성/피드백과 복구/검색 필터 완화`

## 언제 쓰나

검색·필터 결과가 비었을 때 실제로 결과가 생기는 필터 완화 제안을 보여 주고, 사용자가 고른 하나를 명시적으로 적용할 때 쓴다.
`resultCount`가 0인 제안은 숨긴다. 적용 실패 시 현재 필터를 유지하고 같은 버튼으로 재시도한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 완화 제안 없는 단순 빈 결과 | `EmptyState` |
| 검색 화면 전체 틀과 결과 없음 이유 | `SearchScreen` |
| 적용된 필터 목록 해제 | `SearchScreen`의 `appliedFilters` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `FilterRecovery` | 결과가 있는 필터 완화 제안과 적용 | `@hjmds/react/collection-editing` | `@hjmds/react-native/collection-editing` |

`FilterRecoveryOption` 타입과 `recoverableFilters`는 `@hjmds/design-contracts/collection-editing`에 있다.

## 최소 사용 예

```tsx
// Web
import { FilterRecovery } from "@hjmds/react/collection-editing";

{results.length === 0 ? <FilterRecovery title={t("search.noMatch")} description={t("search.relaxHint")}
  options={relaxOptions /* 서버가 센 resultCount */}
  optionLabel={option => t("search.relaxOption", { label: option.label, count: option.resultCount })}
  errorLabel={t("search.applyFailed")} onApply={async id => { await applyRelaxation(id); }} /> : resultList}
```

```tsx
// Native
import { FilterRecovery } from "@hjmds/react-native/collection-editing";

{results.length === 0 ? <FilterRecovery title={t("search.noMatch")} description={t("search.relaxHint")}
  options={relaxOptions}
  optionLabel={option => t("search.relaxOption", { label: option.label, count: option.resultCount })}
  errorLabel={t("search.applyFailed")} onApply={async id => { await applyRelaxation(id); }} /> : resultList}
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| title | string | 필수 | 결과 없음 제목(강조) |
| description | string | 없음 | 보조 설명(muted) |
| options | FilterRecoveryOption[] | 필수 | `{ id, label, resultCount }`. id는 서로 다르고 비지 않아야 함 |
| optionLabel | (option) => string | 필수 | 제안 버튼 문구 |
| onApply | (id) => void \| Promise | 필수 | 실제 필터 변경. 실패하면 reject |
| errorLabel | string | 필수 | 적용 실패 안내 |
| disabled | boolean | false | 모든 제안 비활성 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 기존 Button(secondary)·Text 규격 | 양 renderer |
| 간격 | 세로 sm | 양 renderer |
| 순서·정렬 | 제목 → 설명 → 제안 버튼들(`options` 순서) → 오류, 모두 가로·세로 중앙 | 양 renderer, VQ-09 |
| 고정·스크롤 | 결과 영역 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 버튼을 세로로 쌓아 각 행 전체 문구 유지 | 양 renderer |

빈 결과 영역 안에 그대로 넣는다. 앱이 임의 상단 여백으로 위치를 맞추지 않는다.

## 꼭 지킬 것

- `resultCount`는 제품 데이터에서 센 음이 아닌 안전 정수다. 어기면 렌더 중 `RangeError`가 난다. 추정치를 넣지 않는다.
- 중복·빈 `id`는 `TypeError`다.
- 적용 결과로 생긴 실제 목록은 제품이 다시 그린다. 이 구성은 결과를 만들지 않는다.

## 상태와 상호작용

| 상태 | 모습 |
| --- | --- |
| 기본 | 결과가 있는 제안만 secondary 버튼으로 표시 |
| 적용 중 | 누른 버튼 로딩, 다른 제안 비활성 |
| 실패 | 필터 유지, 중앙 오류, 같은 버튼으로 재시도 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그룹 | `role="group"`, 이름은 `title` | 접근성 그룹 없음 |
| 실패 알림 | `role="alert"` | `accessibilityRole="alert"`·assertive, iOS는 announce |
