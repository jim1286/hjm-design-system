# Pagination 사용 지침

적용: `@hjmds/react` 1.12.1 (Native 없음) · 검토일: 2026-10-06 ·
계약: [Pagination](../pagination.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Pagination` | `@hjmds/react`, `/navigation`, `/pagination` | 없음 | 기본 |

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

- `descriptor`는 `{ currentPage, totalCount, pageSize }` 또는 `{ currentPage, totalPages }` 중 정확히 하나의 형태다.
  `currentPage`는 1부터 시작하는 정수다.
- `siblingCount`·`boundaryCount`(descriptor 안): 기본 1. 생략된 구간은 말줄임으로 표시한다.
- `onPageChange(page, reason)`의 `reason`: `previous` · `next` · `page`.

## 꼭 지킬 것

- `label`(nav 이름)은 비어 있으면 던진다. `labels`와 `composeAccessibleName`이 만드는 페이지 이름까지 모두 제품 i18n에서 만든다.
  어순·조사는 제품이 조립하고, 현재 페이지 여부·총 페이지 계산은 HJM이 넘겨 준다.
- `currentPage`는 제어값이다. `onPageChange`에서 제품 상태를 바꾸고 데이터 요청·URL 동기화는 제품이 한다.
- 범위 밖 `currentPage`(0 이하, 총 페이지 초과)는 던진다. 결과 개수가 줄면 페이지를 먼저 보정한다.
- 페이지 크기 변경·페이지 번호 직접 입력은 없다. 필요하면 별도 컴포넌트로 옆에 합성한다.
- `className`은 배치에만 쓴다.
