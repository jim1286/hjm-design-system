# 작품 탐색

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-13
- 근거: `showcase/web/src/patterns/DiscoveryGallery.stories.tsx`, `showcase/native/src/DiscoveryGallery.stories.tsx`, `showcase/shared/discovery-gallery.ts`, `src/base-recipes.ts`(`buttonRecipe.states.selected`), `src/grid.ts`
- 스토리북: `배포/화면/검색/작품 탐색`

## 목적

여러 사람의 작품(카드)을 검색·카테고리·정렬로 훑고, 마음에 드는 것을 저장하고, 하나를 시트로 크게 보는 갤러리 화면이다.
[검색 결과와 필터](common-search.md)가 "검색어로 찾아 조건으로 좁히기"라면 이 화면은 "남의 것 둘러보기"라 결과를 목록이 아니라 그림 카드 격자로 보인다.
카드 그림(`Thumbnail`)·작가·좋아요 수는 모두 제품 소유이며 스토리의 그림은 직접 그린 예시다.

## 영역 구조

```text
좁은 폭(폭 < 600, Native·모바일 Web) — 세로 스크롤, 카드 한 열
┌ 상단 안전 영역 (화면 소유 아님: 헤더·TopBar safeAreaTop) ┐
│ ScrollView 위아래 spacing.lg 20                            │
│ Container gutter: 폭<600 compact 16 · 이상 regular 20      │
│ ① 머리 Stack gap md 16                                     │
│   eyebrow  Text tone=brand                                 │
│   제목     Heading level3 · semanticLevel 1                │
│   소개     Text                                            │
│   작품 검색 (보이는 라벨)                                    │
│   [🔍 모바일, 작업 공간 ...........  (x)]                  │  SearchField 최소 44
│              ↕ spacing.xl 24                               │
│ ② [전체] [웹사이트] [모바일] [대시보드]                       │  SegmentedControl pills, 단일 선택
│ ③ [정렬: 인기순] [저장한 작품 2]                             │  secondary(정렬) · ghost+selected(저장만 보기)
│ ④ "N개의 작품"  (상태 알림)                                 │
│ (오류면 여기 Notice danger + [다시 시도])                    │
│ ⑤ 카드 Grid                                                │
│ ┌ article ───────────────────────────────────────────┐   │
│ │ ┌ 그림 비율 1.6, radius.lg ──────────────────────┐ │   │  Stack gap sm 12
│ │ └─────────────────────────────────────────────────┘ │   │
│ │ 제목  Text variant=label                             │   │
│ │ 작가 · 카테고리  (muted)                              │   │
│ │ [자세히 보기]  [저장]                                 │   │  ghost · secondary(+selected)
│ └──────────────────────────────────────────────────────┘   │
│        ↕ 카드 사이 spacing.xl 24 (두 플랫폼 공통)              │
│ (0개면 EmptyState + [필터 초기화])                           │
│ ⑥ 범위 안내 Text tone=muted (스토리 전용)                    │
└ 아래: 고정 영역 없음, 내용이 스크롤된다 ───────────────────────┘

넓은 폭 — Grid columns { compact 1, medium 2, expanded 3 }, minColumnWidth 320
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 카드      │ │ 카드      │ │ 카드      │   열·행 사이 spacing.xl 24
└──────────┘ └──────────┘ └──────────┘   Container content 1200 안에서 최대 3열

⑦ 상세 Sheet(자세히 보기)
┌ 작품 제목 ───────────────────────── (닫기) ┐  머리 고정
│ 그림(1.6)                                 │  본문 스크롤, 직계 사이 spacing.lg 20
│ 작가 · 카테고리                            │
│ 설명                                      │
├───────────────────────────────────────────┤
│ footer: [   컬렉션에 저장   ]              │  고정. Native 꽉 찬 폭, Web 끝 정렬
└ 하단 안전 영역 (Sheet 소유) ─────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web `main` > [Container](../components/container.md) `size="content"` `gutter` > Stack `gap="xl"`, 문서 스크롤 · Native `ScrollView` `automaticallyAdjustKeyboardInsets` `keyboardShouldPersistTaps="handled"` > Container `size="content"` `gutter` > Stack `gap="xl"` | 화면 전체, 세로 스크롤 하나 | 좌우 Container gutter: 폭 < 600 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native ScrollView 위아래 `spacing.lg` 20(`paddingVertical`). 직계 요소 사이 `spacing.xl` 24. 위 안전 영역은 내비게이션 헤더·[TopBar](../components/top-bar.md) `safeAreaTop`이 맡는다. 아래 고정 영역이 없다. 키보드가 떠 있으면 Native ScrollView가 inset을 늘리고 첫 탭으로 필터·카드 버튼이 눌린다 |
| ① 머리 | Stack `gap="md"` > Text(brand) · [Heading](../components/heading.md) `level="level3"` `semanticLevel={1}` · Text(소개) · SearchField | 맨 위(카드 배경 없음) | 요소 사이 `spacing.md` 16. SearchField는 두 플랫폼 모두 보이는 `label` |
| ② 카테고리 | Stack `axis="inline" wrap gap="sm"` > SegmentedControl `presentation="pills"` | 머리 아래 | 높이 44, 사이 `spacing.sm` 12 |
| ③ 정렬·저장 보기 | Stack `axis="inline" wrap gap="sm"` > Button `secondary` · `ghost` + `selected` | 카테고리 아래 | 사이 12 |
| ④ 결과 수 | Text `role="status"`(Web) · `accessibilityLiveRegion="polite"` Text(Native) | 정렬 줄 아래 | — |
| ⑤ 격자 | [Grid](../components/grid.md) `columns={{ compact: 1, medium: 2, expanded: 3 }}` `gap={{ compact: "xl" }}` `minColumnWidth={{ compact: 320 }}` | 결과 수 아래 | 열·행 사이 `spacing.xl` 24(두 플랫폼 공통). 열 수는 창 폭 class로 고르고, 본문이 좁으면 `minColumnWidth` 320이 열을 줄인다 |
| ⑤ 카드 | `article`(Web) > Stack `gap="sm"` > 그림·Text·버튼 줄 | 격자 칸 | 그림 비율 1.6([AspectRatio](../components/aspect-ratio.md) `ratio={1.6}`), 모서리 `radius.lg` 16, 카드 안 `spacing.sm` 12 |
| ⑦ 상세 | [Sheet](../components/sheet.md)(Native `scrollable`) > Stack `gap="lg"` + `footer` | 오버레이, 화면 아래 | 본문 직계 요소(그림·작가 · 카테고리 Text·설명 Text) 사이 모두 `spacing.lg` 20, 메타는 기본 tone. 좌우 `spacing.lg` 20, Web 최대 폭 640. 저장은 `footer`(고정) |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 검색 | SearchField `onValueChange` | ① 맨 아래 | 1. 입력 즉시 거른다 |
| 카테고리 | SegmentedControl `presentation="pills"` | ② | 카테고리 수, "전체"가 맨 앞 |
| 정렬 전환 | Button `secondary`, 라벨에 현재 값(`t("gallery.sort", { value: t(sortKey[sort]) })`) | ③ 첫 자리 | 1. 누를 때마다 인기순 ↔ 최신순 |
| 저장한 작품만 | Button `ghost` + `selected`, 라벨에 개수 | ③ 정렬 뒤 | 1 |
| 상세 보기 | Button `ghost` | 카드 맨 아래 버튼 줄 첫 자리 | 카드마다 1. `aria-label`/`accessibilityLabel`에 작품 제목 포함 |
| 카드 저장 | Button `secondary` + `selected`(토글) | 카드 버튼 줄 둘째 자리 | 카드마다 1. 라벨 "저장" ↔ "저장됨", 접근성 이름에 제목과 저장/저장 취소 |
| 시트 저장(시트의 주 행동) | Button 기본 primary + `selected` | ⑦ Sheet `footer`(Native 꽉 찬 폭, Web 끝 정렬) | 1. 라벨 "컬렉션에 저장" ↔ "저장 취소". 시트를 닫지 않는 토글이다 |
| 빈 결과 복구 | EmptyState `action` > Button(기본 primary) | EmptyState 맨 아래 | 1. 검색어·카테고리·저장만 보기를 초기화(정렬은 유지) |
| 다시 시도 | [Notice](../components/notice.md) `action` > Button `tone="secondary" size="small"` | ④ 아래 Notice 끝 | 1. 오류일 때만 |
| 파괴 행동 | — | — | 없음(저장 취소는 같은 버튼의 토글) |

primary는 화면에서 빈 결과 복구 하나, 시트 안에서 저장 하나다. 시트 안 행동은 그 표면 안에서 세고, `selected`를 준 버튼은
tone과 관계없이 선택 모양(배경 `bg`, 글자 `contentBrand`, 별도 선택 테두리 없음)으로 칠해져 세지 않는다([Button](../components/button.md) "꼭 지킬 것").
카드 안 버튼은 [보기][저장] 순서로 시작 정렬, `wrap`이다. 카드 전체를 누름 대상으로 만들지 않는다 — 카드 안에 버튼이 둘이라
겹친 누름 대상이 된다.

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | "전체"·인기순, 전체 카드, 결과 수 | 검색·필터·정렬·저장·보기 |
| 로딩 | 동기 스토리에 없음. 제품 최초 조회는 ScreenLayout 본문 중앙 spinner, 재조회는 기존 결과와 검색·필터를 유지한다 | 같은 요청 중복 실행 방지 |
| 빈 | 성공 응답 0건일 때만 ScreenLayout 본문 중앙 빈 상태(`t("gallery.empty.title")`, 설명) | [필터 초기화] |
| 오류 | 스토리에 없음. ①~③은 남기고 ④ 아래 [Notice](../components/notice.md) `tone="danger"`(Native `announcement="assertive"` — 기본 `none`). 문구는 원인별 키(`errorKey`: 네트워크 `gallery.error.network`, 서버 `gallery.error.server`). 이전 결과가 있으면 ⑤를 유지하고, 첫 조회 실패면 ScreenLayout 중앙 오류와 재시도를 사용하고 EmptyState를 그리지 않는다(빈 결과와 실패를 섞지 않는다). 다시 시도가 또 실패하면 같은 Notice를 같은 자리에 두고 버튼 `loading`만 푼다 | Notice `action` 다시 시도 1개 |
| 저장 토글 | 카드 버튼이 `selected`로 바뀌고 ③ 저장 개수가 늘어난다. 저장만 보기 중 저장 취소하면 카드가 사라지고 결과 수가 읽힌다 | — |
| 상세 열림 | 시트가 올라오고 같은 그림을 크게 보인다. 시트에서 저장하면 카드 상태도 같이 바뀐다 | 저장·닫기 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [Container](../components/container.md) | 바깥 틀 폭·좌우 여백 |
| [Heading](../components/heading.md) | ① 화면 제목 |
| [SearchField](../components/search-field.md) | ① 검색 |
| [Button](../components/button.md) | 카테고리·정렬·저장 보기·카드 행동·시트 저장·다시 시도 |
| [Stack](../components/stack.md) | 세로 리듬, 버튼 줄, 카드 안 |
| [Text](../components/text.md) | 머리 문구, 카드 제목·메타 |
| [Grid](../components/grid.md) | ⑤ 카드 격자 |
| [AspectRatio](../components/aspect-ratio.md) · [Image](../components/image.md) | 제품의 실제 썸네일, 로딩 Skeleton 틀 |
| [EmptyState](../components/empty-state.md) | 결과 없음 |
| [Skeleton](../components/skeleton.md) | 로딩 | 동기 스토리에 없음. 제품 최초 조회는 ScreenLayout 본문 중앙 spinner, 재조회는 기존 결과와 검색·필터를 유지한다 | 같은 요청 중복 실행 방지 |
| [Notice](../components/notice.md) | 오류 |
| [Sheet](../components/sheet.md) | ⑦ 상세 |
| [화면 여백과 너비](../tokens/layout.md) | gutter·최대 폭·breakpoint |
| [간격](../tokens/spacing.md) | `spacing.sm`·`md`·`lg`·`xl` |

## 코드 골격

동기 검색·카테고리·독립 저장 토글·상세 Sheet의 실행 원본은
`showcase/web/src/patterns/DiscoveryGallery.stories.tsx`와
`showcase/native/src/DiscoveryGallery.stories.tsx`다. 이 이름의 공개 화면 API는 없다.
제품의 비동기 검색은 [검색 결과와 필터](common-search.md)의 SearchScreen을 먼저 검토한다.
갤러리 격자가 필요하면 기존 Grid·Sheet와 아래 ScreenLayout 상태를 결합한다.

```tsx
// Web
import { ScreenLayout } from "@hjmds/react/screens";
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";

// hasLoaded는 성공한 조회가 있는지다. 0건 성공도 true이며 배열 길이로 대신하지 않는다.
<>
<ScreenLayout title={t("gallery.title")} actions={categoryControls}
  notice={<>{searchAndSort}{hasLoaded && error ? <Notice tone="danger" title={t(errorKey[error])}
    action={<Button tone="secondary" loading={retrying} onClick={retry}>{t("common.retry")}</Button>} /> : null}</>}
  state={!hasLoaded
    ? error ? { kind: "error", title: t(errorKey[error]) } : { kind: "loading", title: t("gallery.loading") }
    : results.length === 0 ? { kind: "empty", title: t("gallery.empty.title") } : { kind: "ready" }}
  stateAction={!hasLoaded && error ? <Button loading={retrying} onClick={retry}>{t("common.retry")}</Button>
    : hasLoaded && results.length === 0 ? <Button onClick={reset}>{t("gallery.reset")}</Button> : null}>
  {galleryGrid}
</ScreenLayout>
{detailSheet}
</>
```

```tsx
// Native
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Button } from "@hjmds/react-native/actions";
import { Notice } from "@hjmds/react-native/feedback";

<>
<ScreenLayout title={t("gallery.title")} actions={categoryControls}
  notice={<>{searchAndSort}{hasLoaded && error ? <Notice tone="danger" announcement="assertive" title={t(errorKey[error])}
    action={<Button tone="secondary" loading={retrying} onPress={retry}>{t("common.retry")}</Button>} /> : null}</>}
  state={!hasLoaded
    ? error ? { kind: "error", title: t(errorKey[error]) } : { kind: "loading", title: t("gallery.loading") }
    : results.length === 0 ? { kind: "empty", title: t("gallery.empty.title") } : { kind: "ready" }}
  stateAction={!hasLoaded && error ? <Button loading={retrying} onPress={retry}>{t("common.retry")}</Button>
    : hasLoaded && results.length === 0 ? <Button onPress={reset}>{t("gallery.reset")}</Button> : null}>
  {galleryGrid}
</ScreenLayout>
{detailSheet}
</>
```

위 ReactNode 슬롯은 제품이 기존 SearchField·SegmentedControl·Grid·Sheet로 구성한다.
ScreenLayout host는 남은 본문 높이를 확보하고 로딩·오류·빈 상태를 그 영역 중앙에 둔다.
재조회는 hasLoaded와 마지막 성공 결과를 유지한다. 검색어·필터·정렬을 request key에 넣고 응답 key가
현재 선택과 같을 때만 적용한다. 이전 검색 결과를 유지하는 동안 그 결과의 현재성은 제품이 표시하고
맞지 않는 항목의 확정 행동을 막는다. 저장 pending·실패는 해당 작품 ID별로 관리해 전체 격자를 교체하지 않는다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자(`textScale` 2) | 필터·정렬·카드 버튼 줄이 감긴다. 시트 본문이 길어져도 저장은 `footer`라 스크롤 밖으로 밀리지 않는다. 카드 그림 안 장식 글자는 그림의 일부라 Native에서 `allowFontScaling={false}`로 고정하고, 읽어야 하는 제목·작가는 그림 밖 Text로 둔다 |
| 다크 | 그림·카드 색이 `primary`·`surfaceAccent`·`surfaceAlt`·`bg` 테마 토큰이라 같이 바뀐다 |
| 좁은 폭 | 카드 한 열(`compact`), gutter `compact` 16 |
| 넓은 폭 | 600 이상 두 열, 960 이상 세 열. 본문 폭이 칸마다 320을 못 주면 `minColumnWidth`가 열을 줄인다 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 격자 | Grid(폭은 `ResizeObserver`로 잰다), 사이 `spacing.xl` 24 | Grid(폭은 `onLayout`으로 잰다), 사이 `spacing.xl` 24 |
| 그림 접근성 | `aria-hidden="true"` | `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` |
| 결과 수 알림 | `role="status"` | 공개 StatusText(Android live region + iOS active 문구 변경 알림 — [사용법](../components/text.md#statustext)) |
| 검색 진행 | `loading` | `busy` + `busyLabel`(필수) |
| 시트 footer | 오른쪽 정렬 가로 줄 | 세로 열, `fullWidth` |
| 오류 Notice 알림 | `tone="danger"`가 알림 영역 | `announcement="assertive"`를 명시(기본 `none`) |

## 함정

- 카드 그림은 장식으로 숨기므로 그림에만 있는 정보(점수·제목)가 없어야 한다.
- Grid `gap`은 단일 token 문자열을 받지 않는다. `gap={{ compact: "xl" }}`처럼 class별 값으로 준다(`ResponsiveValue<GridGap>`).
- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
  새 제품은 Heading `level3`·`semanticLevel={1}`을 쓴다.
- 예제의 바깥 틀은 양 플랫폼 모두 `Container gutter="compact"`다. 제품의 넓은 화면에서는 위 배치 표의 반응형 gutter를 선택한다.
- 양 플랫폼 격자는 Grid를 사용한다. 창 폭의 열 수가 본문보다 넓으면 `minColumnWidth`가 실제 열 수를 줄인다.
- 카테고리는 `SegmentedControl presentation="pills"`의 단일 선택 계약을 사용한다. 저장만 보기는 독립 토글이므로 Button `selected`를 유지한다.
- 시트 확정 행동은 footer에 둔다. Native는 scrollable 본문과 분리해 큰 글자에서도 접근 가능하게 한다.
- 현재 스토리의 카드 메타는 "작가 · 카테고리 · 좋아요 N"을 한국어 템플릿으로 조립한다. 제품은 `t("gallery.meta", { author, category })`처럼
  보간 키 하나로 둔다. 좋아요 수가 필요하면 같은 키에 값을 더한다.


2026-10-13 행동 검수에서 제거/복구 뒤 키보드 문맥 유실을 확인해 보강했다. Web 저장만 보기에서 저장 취소로 카드가 사라지면 저장 필터로 초점을 돌린다. 상세를 닫을 때는 원래 상세 버튼, 해당 카드가 제거됐으면 저장 필터를 양 플랫폼 Sheet returnFocusRef로 지정한다. Web 빈 결과 초기화는 검색 필드로 이어진다. Native ref 연결과 실제 OS 접근성 초점 이동 검증은 구분한다.
