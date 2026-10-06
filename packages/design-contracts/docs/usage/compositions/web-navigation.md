# 보관함과 페이지 이동

- 단계: 구성
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Breadcrumb](../../breadcrumb.md), [Pagination](../../pagination.md), `showcase/web/src/patterns/WebNavigation.stories.tsx`, `packages/react/src/styles.css`(`.hjm-breadcrumb`, `.hjm-pagination`), `src/component-recipes.ts`(`listRowRecipe`)
- 스토리북: `배포/구성/탐색과 이동/보관함과 페이지 이동`

## 언제 쓰나

Web에서 상위 보관함 → 하위 모음으로 들어가고, 그 모음의 긴 목록을 페이지 단위로 넘겨 보는 탐색에 쓴다.
위에 경로(Breadcrumb), 가운데 목록(List), 아래 페이지 이동(Pagination)을 둔다. 무한 스크롤·더 보기가 맞으면
[LoadMore](../components/load-more.md)를, 앱 화면 전환이면 Native 내비게이션을 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Breadcrumb` | 현재 위치까지의 경로. 마지막 항목만 현재 위치(링크 없음) | [Breadcrumb](../components/breadcrumb.md) |
| `Section` | 모음 제목·설명("산책 기록 125개") | [Section](../components/section.md) |
| `Link` | 상위 화면에서 하위 모음으로 들어가는 링크 | [Link](../components/link.md) |
| 범위 문구 `Text` `role="status"` | "1–5번째 기록". 숫자 범위는 `<bdi>`로 감싼다 | [Text](../components/text.md) |
| `List` + `ListRow` | 현재 페이지 항목 | [List](../components/list.md), [ListRow](../components/list-row.md) |
| `Pagination` | 이전·번호·다음. `descriptor={{ currentPage, totalCount, pageSize }}` | [Pagination](../components/pagination.md) |
| `Stack` | 바깥 `gap="lg"`, 모음 안 `gap="md"` | [Stack](../components/stack.md) |
| `Skeleton` · `Notice` | 서버에서 페이지를 받을 때 목록 자리의 로딩·실패(스토리에 없음) | [Skeleton](../components/skeleton.md), [Notice](../components/notice.md) |

## 배치

```text
페이지 본문(문서 스크롤) > Container gutter 16(폭 < 600) · 20(폭 ≥ 600)
┌ 콘텐츠(스크롤) ────────────────────────────────┐
│ 전체 보관함 › 산책 기록          ← Breadcrumb  │
│              ↕ spacing.lg 20                    │
│ ┌ 콘텐츠 영역 (tabIndex=-1, 포커스 대상) ────┐  │
│ │ 걸었던 날을 모아봤어요   (Section 제목)    │  │
│ │ 산책 기록 125개          (설명)            │  │
│ │              ↕ spacing.md 16               │  │
│ │ 1–5번째 기록             ← status          │  │
│ │              ↕ spacing.md 16               │  │
│ │ ┌ 1번째 산책 기록 / 설명 ───────────────┐  │  │ ListRow 두 줄 최소 68
│ │ ├ 2번째 산책 기록 / 설명 ───────────────┤  │  │
│ │ └ … (pageSize 5) ───────────────────────┘  │  │
│ │              ↕ spacing.md 16               │  │
│ │ [‹] [1] [2] [3] … [25] [›] ← Pagination    │  │ 칸 최소 44×44
│ └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
  고정 영역 없음. Web 전용이라 안전 영역·화면 키보드 처리는 없다
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 제품 페이지 레이아웃(문서 스크롤) > [Container](../components/container.md) | 이 구성은 바깥 폭·여백을 정하지 않는다(스토리는 Stack만 그린다). 목록 화면이므로 페이지 본문은 Container `size="content"`가 정한다. 고정 영역·안전 영역·키보드 처리는 없다 | Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20 |
| 경로 | `Breadcrumb` | 콘텐츠 맨 위, 스크롤과 함께 | 항목·구분자 사이 `spacing.xxs` 4, 좁으면 줄바꿈 |
| 콘텐츠 머리 | `Section` 제목·설명 | 경로 아래 | 경로와 `spacing.lg` 20 |
| 범위 | status 문구 | 머리 아래, 목록 위 | `spacing.md` 16 |
| 목록 | `List` + `ListRow` | 범위 아래 | 두 줄 행 최소 `layout.rowHeight.twoLine` 68(comfortable), 사이 `spacing.md` 16 |
| 로딩·실패 | `Skeleton` 행 / `Notice` danger + 다시 시도 | 목록 자리(범위 문구·Pagination은 그대로) | 목록과 같은 자리 |
| 페이지 이동 | `Pagination` | 목록 바로 아래, 시작 정렬 | 칸 최소 `control.minTouchTarget` 44, 칸 사이 `spacing.xxs` 4, 좁으면 줄바꿈 |

- Pagination은 목록 **아래**에 둔다. 위·아래 두 벌을 두지 않는다.
- 상위 화면(보관함)은 같은 콘텐츠 영역에 Section + Link 하나만 그린다. 경로는 항목 하나(현재 위치)로 줄어든다.

## 흐름과 상태

1. 보관함에서 "산책 기록 125개 보기" Link를 누른다.
2. 경로가 "전체 보관함 › 산책 기록"으로 바뀌고 포커스가 새 콘텐츠 영역으로 옮겨진다.
3. Pagination으로 페이지를 바꾸면 목록과 범위 문구만 바뀐다. 서버에서 받으면 그동안 목록 자리에 Skeleton이 나온다.
4. 페이지를 받지 못하면 목록 자리에 Notice와 "다시 시도"가 나오고 Pagination은 요청한 페이지에 남는다.
5. 경로의 "전체 보관함"을 누르면 상위로 돌아가고 페이지는 1로 초기화된다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 상위(보관함): Section + Link, 경로는 현재 항목 하나 | 첫 진입에는 포커스를 옮기지 않는다 |
| 진행 중 | 서버에서 받는 페이지면 목록 자리에 `Skeleton` 행, Pagination은 새 페이지 표시. 늦게 온 이전 페이지 응답은 버린다 | 포커스는 Pagination에 남는다 |
| 실패 | 목록 자리에 `Notice` danger + `action` "다시 시도"(같은 페이지 재요청), 범위 문구는 비운다 | Notice `danger`는 `role="alert"` |
| 모음 진입 | 경로 두 단계, 목록 1페이지 | 누른 링크가 사라지므로 콘텐츠 영역(`tabIndex={-1}`)에 `focus({ preventScroll: true })` |
| 페이지 변경 | 목록 5개 교체, 범위 문구 갱신 | 포커스는 Pagination에 남고 범위 문구(`role="status"`)가 알린다 |
| 첫·마지막 페이지 | 이전/다음 칸이 `aria-disabled`, opacity 0.5 | — |

- 문구 키는 상태별 상수로 둔다(`records.range`·`records.loadFailed`·`common.retry`). 현재 페이지 이름은 `current`에 따라 두 키(`records.pageCurrent`·`records.pageGo`) 중 하나를 고른다. 범위 문구는 숫자 → 문구 순서를 코드에 고정한다(스토리와 같다). 언어마다 순서가 다르면 제품 i18n의 rich text 기능으로 `<bdi>`를 끼운다.

## 코드 골격

```tsx
// Web
import { Breadcrumb } from "@hjmds/react/breadcrumb";
import { Pagination } from "@hjmds/react/pagination";
import { Button } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Notice, Skeleton } from "@hjmds/react/feedback";
import { Section, Stack, Text } from "@hjmds/react/layout";

<Stack gap="lg">
  <Breadcrumb label={t("records.path")} items={[
    { id: "records", label: t("records.all"), destination: { kind: "internal", href: "/records" } },
    { id: "walks", label: t("records.walks") },
  ]} />
  <div ref={contentRef} tabIndex={-1}>
    <Section title={t("records.walks.title")} description={t("records.walks.count", { count: total })}>
      <Stack gap="md">
        <Text role="status">{status === "ready" ? <><bdi>{from}–{to}</bdi>{t("records.range")}</> : ""}</Text>
        {status === "loading"
          ? <Stack gap="xs"><Skeleton shape="text" /><Skeleton shape="text" width="60%" /></Stack>
          : status === "failed"
            ? <Notice tone="danger" title={t("records.loadFailed")}
                action={<Button tone="secondary" size="small" onClick={retry}>{t("common.retry")}</Button>} />
            : <List label={t("records.walks.list")}>
                {rows.map((row) => <ListRow key={row.id} title={row.title} description={row.summary} />)}
              </List>}
        <Pagination label={t("records.pages")}
          descriptor={{ currentPage: page, totalCount: total, pageSize: 5 }}
          labels={{ previous: t("records.prev"), next: t("records.next") }}
          composeAccessibleName={({ page, totalPages, current }) => t(current ? "records.pageCurrent" : "records.pageGo", { page, totalPages })}
          onPageChange={setPage} />
      </Stack>
    </Section>
  </div>
</Stack>;
```

```tsx
// Native
// 없음. Breadcrumb·Pagination은 Web 전용이다.
```

라우팅(스토리는 데모용 hash fragment), 레코드 125개, pageSize 5는 예시다. 경로·페이지 크기·URL 동기화는 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `Breadcrumb` | `/breadcrumb`, `/navigation` | 없음 |
| `Pagination` | `/pagination`, `/navigation` | 없음. 긴 목록은 [LoadMore](../components/load-more.md) |

## 함정

- Breadcrumb 마지막 항목에 `destination`을 주거나, 앞 항목에서 빠뜨리면 `TypeError`다.
- 범위 숫자를 `<bdi>`로 감싸지 않으면 RTL에서 "5–1"처럼 뒤집혀 읽힌다.
- 탐색 후 포커스를 옮기지 않으면 누른 링크가 사라져 포커스가 `body`로 떨어진다. 첫 마운트·페이지 변경에서는 옮기지 않는다.
- 현재 스토리는 로컬 배열을 잘라 쓰므로 로딩·실패 경로가 없다.
