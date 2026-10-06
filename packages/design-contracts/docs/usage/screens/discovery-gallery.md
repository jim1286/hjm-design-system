# 작품 탐색

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
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
│ ② [전체] [웹사이트] [모바일] [대시보드]                       │  ghost, 선택된 것만 selected
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
| 카테고리 | Button `ghost`, 선택된 것만 `selected` | ② | 카테고리 수, "전체"가 맨 앞 |
| 정렬 전환 | Button `secondary`, 라벨에 현재 값(`t("gallery.sort", { value: t(sortKey[sort]) })`) | ③ 첫 자리 | 1. 누를 때마다 인기순 ↔ 최신순 |
| 저장한 작품만 | SegmentedControl `presentation="pills"`, 라벨에 개수 | ③ 정렬 뒤 | 1 |
| 상세 보기 | Button `ghost` | 카드 맨 아래 버튼 줄 첫 자리 | 카드마다 1. `aria-label`/`accessibilityLabel`에 작품 제목 포함 |
| 카드 저장 | Button `secondary` + `selected`(토글) | 카드 버튼 줄 둘째 자리 | 카드마다 1. 라벨 "저장" ↔ "저장됨", 접근성 이름에 제목과 저장/저장 취소 |
| 시트 저장(시트의 주 행동) | Button 기본 primary + `selected` | ⑦ Sheet `footer`(Native 꽉 찬 폭, Web 끝 정렬) | 1. 라벨 "컬렉션에 저장" ↔ "저장 취소". 시트를 닫지 않는 토글이다 |
| 빈 결과 복구 | EmptyState `action` > Button(기본 primary) | EmptyState 맨 아래 | 1. 검색어·카테고리·저장만 보기를 초기화(정렬은 유지) |
| 다시 시도 | [Notice](../components/notice.md) `action` > Button `tone="secondary" size="small"` | ④ 아래 Notice 끝 | 1. 오류일 때만 |
| 파괴 행동 | — | — | 없음(저장 취소는 같은 버튼의 토글) |

primary는 화면에서 빈 결과 복구 하나, 시트 안에서 저장 하나다. 시트 안 행동은 그 표면 안에서 세고, `selected`를 준 버튼은
tone과 관계없이 선택 모양(배경 `bg`, 글자·테두리 `contentBrand`)으로 칠해져 세지 않는다([Button](../components/button.md) "꼭 지킬 것").
카드 안 버튼은 [보기][저장] 순서로 시작 정렬, `wrap`이다. 카드 전체를 누름 대상으로 만들지 않는다 — 카드 안에 버튼이 둘이라
겹친 누름 대상이 된다.

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | "전체"·인기순, 전체 카드, 결과 수 | 검색·필터·정렬·저장·보기 |
| 로딩 | 스토리에 없음. ①~③은 그대로, ⑤ 자리에 같은 Grid로 카드 3개 모양의 [Skeleton](../components/skeleton.md)(AspectRatio 1.6 안 `shape="block"` `height="100%"` + 제목 `shape="text"` 60%). 로딩 사실은 영역 단위로 한 번(Web Grid `aria-busy`·`aria-label`, Native 첫 Skeleton `accessibilityLabel`). 검색 중이면 SearchField Web `loading` · Native `busy` + `busyLabel` | 검색·필터는 그대로 |
| 빈 | ⑤ 자리에 EmptyState(`t("gallery.empty.title")`, 설명) | [필터 초기화] |
| 오류 | 스토리에 없음. ①~③은 남기고 ④ 아래 [Notice](../components/notice.md) `tone="danger"`(Native `announcement="assertive"` — 기본 `none`). 문구는 원인별 키(`errorKey`: 네트워크 `gallery.error.network`, 서버 `gallery.error.server`). 이전 결과가 있으면 ⑤를 유지하고, 결과가 없으면 EmptyState를 그리지 않는다(빈 결과와 실패를 섞지 않는다). 다시 시도가 또 실패하면 같은 Notice를 같은 자리에 두고 버튼 `loading`만 푼다 | Notice `action` 다시 시도 1개 |
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
| [Skeleton](../components/skeleton.md) | 로딩 |
| [Notice](../components/notice.md) | 오류 |
| [Sheet](../components/sheet.md) | ⑦ 상세 |
| [화면 여백과 너비](../tokens/layout.md) | gutter·최대 폭·breakpoint |
| [간격](../tokens/spacing.md) | `spacing.sm`·`md`·`lg`·`xl` |

## 코드 골격

카테고리·작품·썸네일·문구는 제품 소유다. `Thumbnail`은 제품 컴포넌트 자리다(AspectRatio 1.6 + Image). 상태마다 다른 문구는
상태→키 상수 표로 고른다. 아래 두 예는 설치 버전 타입으로 검사했다(`query`·`results`·`selected` 등 상태 값과 핸들러는 제품이 둔다).

```tsx
// Web
import { AspectRatio, Container, Grid, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { SegmentedControl } from "@hjmds/react/selection";
import { SearchField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";
import { EmptyState, Notice, Skeleton } from "@hjmds/react/feedback";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

type Category = "all" | "web" | "mobile" | "dashboard";
type Sort = "popular" | "latest";
type LoadError = "network" | "server";
const categories: readonly Category[] = ["all", "web", "mobile", "dashboard"];
const categoryKey = { all: "gallery.category.all", web: "gallery.category.web", mobile: "gallery.category.mobile", dashboard: "gallery.category.dashboard" } as const satisfies Record<Category, string>;
const sortKey = { popular: "gallery.sort.popular", latest: "gallery.sort.latest" } as const satisfies Record<Sort, string>;
const errorKey = { network: "gallery.error.network", server: "gallery.error.server" } as const satisfies Record<LoadError, string>;
const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";
const gridProps = { columns: { compact: 1, medium: 2, expanded: 3 }, gap: { compact: "xl" }, minColumnWidth: { compact: 320 } } as const;

<main><Container size="content" gutter={gutter}><Stack gap="xl">
  <Stack gap="md">
    <Text tone="brand">{t("gallery.eyebrow")}</Text>
    <Heading level="level3" semanticLevel={1}>{t("gallery.title")}</Heading>
    <Text as="p">{t("gallery.intro")}</Text>
    <SearchField label={t("gallery.search")} clearLabel={t("gallery.clear")} loading={loading} value={query} onValueChange={setQuery} />
  </Stack>
  <SegmentedControl label={t("gallery.category")} presentation="pills"
      items={categories.map(id => ({ value: id, label: t(categoryKey[id]) }))} value={category} onValueChange={setCategory} />
  <Stack axis="inline" wrap gap="sm">
    <Button tone="secondary" onClick={toggleSort}>{t("gallery.sort", { value: t(sortKey[sort]) })}</Button>
    <Button tone="ghost" selected={savedOnly} onClick={() => setSavedOnly(v => !v)}>{t("gallery.savedOnly", { count: savedCount })}</Button>
  </Stack>
  <Text role="status">{loading ? "" : t("gallery.count", { count: results.length })}</Text>
  {error ? <Notice tone="danger" title={t(errorKey[error])}
    action={<Button tone="secondary" size="small" loading={retrying} onClick={retry}>{t("common.retry")}</Button>} /> : null}
  {loading && results.length === 0 ? (
    <Grid {...gridProps} aria-busy="true" aria-label={t("gallery.loading")}>
      {[0, 1, 2].map(i => <Stack key={i} gap="sm"><AspectRatio ratio={1.6} aria-hidden="true"><Skeleton shape="block" height="100%" /></AspectRatio><Skeleton shape="text" width="60%" /></Stack>)}
    </Grid>
  ) : results.length ? (
    <Grid {...gridProps}>
      {results.map(item => <article key={item.id}><Stack gap="sm">
        <Thumbnail item={item} />
        <Text variant="label">{item.title}</Text>
        <Text tone="muted">{t("gallery.meta", { author: item.author, category: item.categoryLabel })}</Text>
        <Stack axis="inline" wrap gap="sm">
          <Button tone="ghost" aria-label={t("gallery.viewNamed", { title: item.title })} onClick={() => setSelected(item)}>{t("gallery.details")}</Button>
          <Button tone="secondary" selected={isSaved(item)} onClick={() => toggleSaved(item.id)}
            aria-label={t(isSaved(item) ? "gallery.unsaveNamed" : "gallery.saveNamed", { title: item.title })}>
            {t(isSaved(item) ? "gallery.saved" : "gallery.save")}</Button>
        </Stack>
      </Stack></article>)}
    </Grid>
  ) : error ? null : <EmptyState title={t("gallery.empty.title")} description={t("gallery.empty.body")}
      action={<Button onClick={reset}>{t("gallery.reset")}</Button>} />}
  <Sheet open={selected !== null} onOpenChange={o => { if (!o) setSelected(null); }}
    title={selected?.title ?? t("gallery.detail")} closeLabel={t("common.close")}
    footer={selected ? <Button selected={isSaved(selected)} onClick={() => toggleSaved(selected.id)}
      aria-label={t(isSaved(selected) ? "gallery.unsaveNamed" : "gallery.saveNamed", { title: selected.title })}>
      {t(isSaved(selected) ? "gallery.unsave" : "gallery.saveToCollection")}</Button> : null}>
    {selected ? <Stack gap="lg">
      <Thumbnail item={selected} />
      <Text>{t("gallery.meta", { author: selected.author, category: selected.categoryLabel })}</Text>
      <Text as="p">{selected.description}</Text>
    </Stack> : null}
  </Sheet>
</Stack></Container></main>
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { AspectRatio, Container, Grid, Stack, Text } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";
import { Button } from "@hjmds/react-native/actions";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { SearchField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { EmptyState, Notice, Skeleton } from "@hjmds/react-native/feedback";

// categories·categoryKey·sortKey·errorKey는 Web과 같다.
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";
const gridProps = { columns: { compact: 1, medium: 2, expanded: 3 }, gap: { compact: "xl" }, minColumnWidth: { compact: 320 } } as const;

<ScrollView automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled"
  contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container size="content" gutter={gutter}><Stack gap="xl">
    <Stack gap="md">
      <Text tone="brand">{t("gallery.eyebrow")}</Text>
      <Heading level="level3" semanticLevel={1}>{t("gallery.title")}</Heading>
      <Text>{t("gallery.intro")}</Text>
      <SearchField label={t("gallery.search")} clearLabel={t("gallery.clear")} busy={loading} busyLabel={t("gallery.searching")}
        value={query} onValueChange={setQuery} />
    </Stack>
    <SegmentedControl label={t("gallery.category")} presentation="pills"
      items={categories.map(id => ({ value: id, label: t(categoryKey[id]) }))} value={category} onValueChange={setCategory} />
    <Stack axis="inline" wrap gap="sm">
      <Button tone="secondary" onPress={toggleSort}>{t("gallery.sort", { value: t(sortKey[sort]) })}</Button>
      <Button tone="ghost" selected={savedOnly} onPress={() => setSavedOnly(v => !v)}>{t("gallery.savedOnly", { count: savedCount })}</Button>
    </Stack>
    <Text accessibilityLiveRegion="polite">{loading ? "" : t("gallery.count", { count: results.length })}</Text>
    {error ? <Notice tone="danger" announcement="assertive" title={t(errorKey[error])}
      action={<Button tone="secondary" size="small" loading={retrying} onPress={retry}>{t("common.retry")}</Button>} /> : null}
    {loading && results.length === 0 ? (
      <Grid {...gridProps}>
        {[0, 1, 2].map(i => <Stack key={i} gap="sm">
          <AspectRatio ratio={1.6}><Skeleton shape="block" layoutStyle={{ flex: 1 }} {...(i === 0 ? { accessibilityLabel: t("gallery.loading") } : {})} /></AspectRatio>
          <Skeleton shape="text" width="60%" />
        </Stack>)}
      </Grid>
    ) : results.length ? (
      <Grid {...gridProps}>
        {results.map(item => <Stack key={item.id} gap="sm">
          <Thumbnail item={item} />
          <Text variant="label">{item.title}</Text>
          <Text tone="muted">{t("gallery.meta", { author: item.author, category: item.categoryLabel })}</Text>
          <Stack axis="inline" wrap gap="sm">
            <Button tone="ghost" accessibilityLabel={t("gallery.viewNamed", { title: item.title })} onPress={() => setSelected(item)}>{t("gallery.details")}</Button>
            <Button tone="secondary" selected={isSaved(item)} onPress={() => toggleSaved(item.id)}
              accessibilityLabel={t(isSaved(item) ? "gallery.unsaveNamed" : "gallery.saveNamed", { title: item.title })}>
              {t(isSaved(item) ? "gallery.saved" : "gallery.save")}</Button>
          </Stack>
        </Stack>)}
      </Grid>
    ) : error ? null : <EmptyState title={t("gallery.empty.title")} description={t("gallery.empty.body")}
        action={<Button onPress={reset}>{t("gallery.reset")}</Button>} />}
    <Sheet scrollable open={selected !== null} onOpenChange={o => { if (!o) setSelected(null); }}
      title={selected?.title ?? t("gallery.detail")} closeLabel={t("common.close")}
      footer={selected ? <Button fullWidth selected={isSaved(selected)} onPress={() => toggleSaved(selected.id)}
        accessibilityLabel={t(isSaved(selected) ? "gallery.unsaveNamed" : "gallery.saveNamed", { title: selected.title })}>
        {t(isSaved(selected) ? "gallery.unsave" : "gallery.saveToCollection")}</Button> : null}>
      {selected ? <Stack gap="lg">
        <Thumbnail item={selected} />
        <Text>{t("gallery.meta", { author: selected.author, category: selected.categoryLabel })}</Text>
        <Text>{selected.description}</Text>
      </Stack> : null}
    </Sheet>
  </Stack></Container>
</ScrollView>
```

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
| 결과 수 알림 | `role="status"` | 라이브 영역(Android) + iOS는 제품이 직접 알림(문구가 바뀌었을 때만, `AppState` active일 때만 — [대시보드](dashboard.md) 함정) |
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
