# Breadcrumb 사용 지침

적용: `@hjmds/react` 1.12.1 (Web 전용) · 검토일: 2026-10-06 ·
계약: [Breadcrumb](../breadcrumb.md), recipe `breadcrumbRecipe`(`src/breadcrumb.ts`)

## 언제 쓰나

Web의 깊은 계층 화면에서 현재 위치까지의 경로를 보여 주고 상위 계층으로 바로 돌아가게 할 때 쓴다.
`구단 목록 › LG 트윈스 › 선수단`처럼 순서가 곧 계층이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| Native 화면 | 플랫폼 back + [TopBar](top-bar.md) 제목 (Native Breadcrumb는 없다) |
| 같은 계층의 형제 화면 전환 | [Tabs](tabs.md) |
| 최상위 목적지 이동 | [BottomNavigation](bottom-navigation.md), [Sidebar](sidebar.md) |
| 문장 안 링크 하나 | [Link](link.md) |
| 단계 진행 표시 | [Steps](steps.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Breadcrumb` | `@hjmds/react`, `/breadcrumb`, `/navigation` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { Breadcrumb } from "@hjmds/react/breadcrumb";

<Breadcrumb
  label={t("nav.breadcrumb")}
  items={[
    { id: "teams", label: t("teams.title"), destination: { kind: "internal", href: "/teams" } },
    { id: "lg", label: team.name, destination: { kind: "internal", href: `/teams/${team.id}` } },
    { id: "squad", label: t("teams.squad") },
  ]}
/>
```

Native renderer는 없다.

## 축과 기본값

- `label`: navigation landmark 이름. 비우면 `TypeError`.
- `items`: 마지막 항목만 현재 위치이며 `destination`이 없어야 한다. 그 앞 항목은 `destination`이 필수다.
  빈 trail·중복 id·빈 label도 거부한다. 항목 하나(현재 화면만)는 유효하다.
- `destination`은 Link의 `LinkDestination`(`internal` · `external`)이다. href 규칙은 [Link](link.md)를 따른다.
- `separator`: 기본 `›`(RTL에서 미러링). 직접 넘긴 구분자는 뒤집지 않고, `null`이면 숨긴다. 구분자는 항상 `aria-hidden`이다.

## 꼭 지킬 것

- `label`과 항목 label은 i18n 키 또는 제품 데이터로 넣는다.
- 긴 경로를 `...`로 접지 않는다. 축약 축이 없고 renderer는 전체 trail을 줄바꿈해 그린다.
- 마지막 항목은 링크가 아니다(`aria-current="page"` 텍스트). 현재 화면에 href를 주지 않는다.

## 함정

- 조상 항목은 일반 `<a href>`로 그린다. 라우터 adapter prop(`renderLink` 등)이 없으므로
  Next.js `Link` 같은 클라이언트 전환을 기대하지 않는다.
