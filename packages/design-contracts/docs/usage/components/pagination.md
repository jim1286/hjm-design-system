# Pagination

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Pagination](../../pagination.md), `src/pagination.ts`(`paginationRecipe`)
- 스토리북: `배포/컴포넌트/탐색/페이지 이동`

## 언제 쓰나

총 개수(또는 총 페이지 수)가 정해진 결과 집합에서 사용자가 **임의의 페이지로 바로 이동**해야 할 때
Web에서 쓴다. 검색 결과, 관리자 테이블, 기록 목록이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 총량을 모르거나 계속 이어지는 피드 | [LoadMore](load-more.md) |
| Native 긴 목록 | [LoadMore](load-more.md), [VirtualList](virtual-list.md) (Pagination은 Web 전용) |
| 단계형 흐름의 이전/다음 | [Steps](steps.md) |
| 이미지·카드 넘기기 | [Carousel](carousel.md) |

한 목록에는 Pagination과 LoadMore 중 하나의 탐색 모델만 쓴다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Pagination` | 기본 | `@hjmds/react`, `/navigation`, `/pagination` | — |

## 최소 사용 예

```tsx
// Web
import { Pagination } from "@hjmds/react/pagination";

<Pagination
  label={t("records.pagination")}
  descriptor={{ currentPage: page, totalCount: total, pageSize: 20 }}
  labels={{ previous: t("pagination.previous"), next: t("pagination.next") }}
  composeAccessibleName={({ page, totalPages, current }) =>
    t(current ? "pagination.current" : "pagination.goTo", { page, totalPages })}
  onPageChange={(next) => setPage(next)}
/>
```

Native 예는 없다(renderer 없음).

## 축과 기본값

타입은 `@hjmds/design-contracts/components/pagination`에서 가져온다.

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | 문자열 | 필수 | `<nav>` 이름. 비면 던진다 |
| `descriptor` | `{ currentPage, totalCount, pageSize, siblingCount?, boundaryCount? }` 또는 `{ currentPage, totalPages, siblingCount?, boundaryCount? }` | 필수 | 정확히 하나의 형태. `currentPage`는 1부터 시작하는 정수 |
| `siblingCount` · `boundaryCount`(descriptor 안) | 정수 | 1 | 생략된 구간은 말줄임으로 표시한다 |
| `labels` | `{ previous: string; next: string }` | 필수 | 이전·다음 버튼 문구 |
| `composeAccessibleName` | `(info: { page: number; totalPages: number; current: boolean }) => string` | 필수 | 페이지 버튼마다 부른다. 어순은 제품 i18n이 정한다 |
| `onPageChange` | `(page: number, reason: "previous" \| "next" \| "page") => void` | 필수 | 제품이 `currentPage`를 바꾼다 |
| `className` · `layoutStyle` | 문자열 · 배치 전용 style 객체 | — | 루트 배치만 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 각 칸 최소 44×44(`control.minTouchTarget`), radius `radius.md` 12 | `paginationRecipe.item`, `.hjm-pagination__item` |
| 간격 | 칸 안쪽 `spacing.xs` 8, 칸 사이 `spacing.xxs` 4 | `paginationRecipe.gap`, `.hjm-pagination__list` |
| 순서·정렬 | `[‹ 이전] [1] … [4] [5] [6] … [20] [다음 ›]`. 이전·다음은 아이콘 버튼(문구는 접근성 이름), RTL에서 화살표 반전. 정렬은 놓는 레이아웃이 정한다(관리자 테이블은 끝, 검색 결과는 가운데가 흔하다) | `src/pagination.tsx`, `.hjm-pagination__previous`·`__next` |
| 고정·스크롤 | 목록·테이블 **바로 아래** 한 번. 페이지를 바꾸면 목록 시작으로 스크롤·포커스를 옮기는 것은 제품이 한다 | — |
| 좁은 폭·큰 글자 | 폭이 모자라면 줄바꿈된다(`flex-wrap`). 좁은 폭에서는 `siblingCount`·`boundaryCount`를 0~1로 줄여 한 줄을 유지한다 | `.hjm-pagination__list` |

## 꼭 지킬 것

- `label`(nav 이름)은 비어 있으면 던진다. `labels`와 `composeAccessibleName`이 만드는 페이지 이름까지 모두 제품 i18n에서 만든다.
  어순·조사는 제품이 조립하고, 현재 페이지 여부·총 페이지 계산은 HJM이 넘겨 준다.
- `currentPage`는 제어값이다. `onPageChange`에서 제품 상태를 바꾸고 데이터 요청·URL 동기화는 제품이 한다.
- 범위 밖 `currentPage`(0 이하, 총 페이지 초과)는 던진다. 결과 개수가 줄면 페이지를 먼저 보정한다.
- 페이지 크기 변경·페이지 번호 직접 입력은 없다. 필요하면 별도 컴포넌트로 옆에 합성한다.
- `className`·`layoutStyle`은 배치에만 쓴다.
