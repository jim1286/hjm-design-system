# Section

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/component-recipes.ts`(`sectionRecipe`, Native renderer가 바인딩). 별도 계약 문서는 없다
- 스토리북: `배포/컴포넌트/레이아웃/섹션`

## 언제 쓰나

화면 안의 내용 묶음에 제목·설명·머리 행동(“모두 보기”, “편집”)을 붙일 때 쓴다.
큰 글자에서는 머리 행동이 제목 아래로 내려가 겹치지 않는다. 배경·테두리가 없는 의미 구획이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 배경·테두리가 있는 떠 있는 묶음 | [Card](card.md), [Surface](surface.md) |
| 접고 펼치는 구획 | [Accordion](accordion.md), [Collapsible](collapsible.md) |
| 제목 텍스트만 필요 | [Heading](heading.md) |
| 단순 세로 간격 | [Stack](stack.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Section` | 기본 | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` |

## 최소 사용 예

```tsx
// Web
import { Link } from "@hjmds/react/actions";
import { Section } from "@hjmds/react/layout";

<Section
  title={t("home.recent.title")}
  action={<Link href="/recent">{t("common.seeAll")}</Link>}
>
  <RecentList />
</Section>
```

```tsx
// Native — 섹션 사이 간격은 감싼 Stack gap(`layout.sectionGap` 24)이 기본. 단독 배치만 layoutStyle
import { spacing } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { Section } from "@hjmds/react-native/primitives";

<Section
  title={t("home.recent.title")}
  description={t("home.recent.description")}
  action={<Button tone="link" onPress={openRecent}>{t("common.seeAll")}</Button>}
  layoutStyle={{ marginTop: spacing.xl }}
>
  <RecentList />
</Section>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `title` · `description` | Web `ReactNode` · Native `string` | — | 현지화 |
| `action` | 노드 하나 | — | 머리 끝 행동(링크·`tone="link"` 버튼) |
| `title`·`description`·`action` 모두 없음 | — | — | 머리 영역을 그리지 않는다 |
| `children` | ReactNode | 필수 | |
| `headingLevel`(Web) | `2` ~ `6` | `2` | 문서 구조에 맞춰 고른다. Native 제목은 `accessibilityRole="header"` |
| `layoutStyle` | 배치 전용 style 객체 | — | 섹션 바깥 배치 |
| `headerStyle` · `copyStyle` · `actionStyle` · `contentStyle`(Native) | 배치 전용 style 객체 | — | slot 배치(색·글자는 받지 않는 타입) |

콜백 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 자체 배경·테두리·여백이 없다. 폭은 부모를 따른다 | `.hjm-section` |
| 글자 | 제목 `title` 18/26 bold, 설명 `caption` 11/16(두 플랫폼). 2026-10-06까지 Web은 둘 다 본문 14를 물려받았다(1.12.1 이후 미게시) | `sectionRecipe.title`·`description`, `.hjm-section__title`·`__description` |
| 간격 | 머리와 본문 사이 `spacing.xs` 8, 글자 묶음과 행동 사이 `spacing.sm` 12, 제목과 설명 사이 `spacing.xxs` 4. Section끼리의 간격은 Section이 주지 않는다. 감싸는 [Stack](stack.md)이나 `layoutStyle`로 `layout.sectionGap`(`spacing.xl` 24)을 둔다 | `sectionRecipe.gap`·`headerGap`·`copyGap`, `layout.sectionGap` |
| 순서·정렬 | 머리 행동은 끝(LTR 오른쪽)에 하나, 글자 묶음과 세로 가운데 정렬. 보통 [Link](link.md) 또는 `tone="link"` [Button](button.md) | `.hjm-section__header`, Native `Section` |
| 고정·스크롤 | 고정되지 않는다. 화면 본문 스크롤 안에 둔다 | — |
| 좁은 폭·큰 글자 | 머리 행이 세로로 쌓이고 행동이 글자 아래로 간다. Web은 폭 600 미만(`breakpoint.medium`, media query), Native는 글자 크기 160% 이상 | `.hjm-section__header` @media, `largeTextThreshold` 1.6 |

```text
최근 본 장소                  [전체 보기]   ← 머리: 제목 title 18, gap spacing.sm 12
자주 가는 곳이에요                        ← 설명: caption 11, gap spacing.xxs 4
  gap spacing.xs 8
┌──────────── 본문 ────────────┐
└──────────────────────────────┘
  gap layout.sectionGap 24 (Stack이 줌)
다음 Section …
```

## 꼭 지킬 것

- 제목·설명은 i18n 문구로 넣는다. Native는 `string`만 받는다.
- 배치는 `layoutStyle`로 한다. Native slot 배치는 `headerStyle`·`copyStyle`·`actionStyle`·`contentStyle`(모두 배치 전용 타입)이다.
  Native `style`은 deprecated(개발 모드 경고, 다음 major 제거)다.
- 머리 행동은 하나로 둔다. 여러 행동은 본문 안이나 [Menu](menu.md)로 옮긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `title`·`description` 타입 | `ReactNode` | `string` |
| heading 수준 | `headingLevel` | 없음(header role 고정) |
| 루트 | `<section>` | `View` |
| 배치 | `className`, `layoutStyle`(HTML `style`도 받음) | `layoutStyle`, slot `*Style`(`style`은 deprecated) |
