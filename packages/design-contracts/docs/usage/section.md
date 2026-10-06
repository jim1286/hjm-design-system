# Section 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `sectionRecipe`(`src/component-recipes.ts`, Native renderer가 바인딩). 별도 계약 문서는 없다.

## 언제 쓰나

화면 안의 내용 묶음에 제목·설명·머리 행동(“모두 보기”, “편집”)을 붙일 때 쓴다.
큰 글자에서는 머리 행동이 제목 아래로 내려가 겹치지 않는다. 배경·테두리가 없는 의미 구획이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 배경·테두리가 있는 떠 있는 묶음 | [Card](card.md), [Surface](surface.md) |
| 접고 펼치는 구획 | [Accordion](accordion.md), [Collapsible](collapsible.md) |
| 설정 화면 전체 | [SettingsScreen](settings-screen.md) (섹션을 직접 쌓지 않는다) |
| 제목 텍스트만 필요 | [Heading](heading.md) |
| 단순 세로 간격 | [Stack](stack.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Section` | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Section } from "@hjmds/react/layout";

<Section
  title={t("home.recent.title")}
  action={<Link href="/recent">{t("common.seeAll")}</Link>}
>
  <RecentList />
</Section>
```

```tsx
// Native
import { Section } from "@hjmds/react-native/primitives";

<Section
  title={t("home.recent.title")}
  description={t("home.recent.description")}
  action={<Button tone="link" onPress={openRecent}>{t("common.seeAll")}</Button>}
  layoutStyle={{ marginTop: 24 }}
>
  <RecentList />
</Section>
```

## 축과 기본값

- `title`, `description`, `action`, `children`(필수). 셋 다 없으면 머리 영역을 그리지 않는다.
- Web `headingLevel`: `2`(기본) ~ `6`. 문서 구조에 맞춰 고른다. Native 제목은 `accessibilityRole="header"`.
- Native는 글자 크기 160% 이상에서 머리 행을 세로로 쌓는다.

## 꼭 지킬 것

- 제목·설명은 i18n 문구로 넣는다. Native는 `string`만 받는다.
- Native 배치는 `layoutStyle`, slot 배치는 `headerStyle`·`copyStyle`·`actionStyle`·`contentStyle`(모두 배치 전용 타입)로 한다.
  `style`도 ViewProps로 남아 있지만 색·gap·글자를 덮는 데 쓰지 않는다.
- 머리 행동은 하나로 둔다. 여러 행동은 본문 안이나 [Menu](menu.md)로 옮긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `title`·`description` 타입 | `ReactNode` | `string` |
| heading 수준 | `headingLevel` | 없음(header role 고정) |
| 루트 | `<section>` | `View` |
| 배치 | `className`·`style` | `layoutStyle`, slot `*Style` |
