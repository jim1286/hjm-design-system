# Breadcrumb

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Breadcrumb](../../breadcrumb.md), recipe `breadcrumbRecipe`(`src/breadcrumb.ts`)
- 스토리북: `배포/컴포넌트/탐색/이동 경로`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Breadcrumb` | 기본 | `@hjmds/react`, `/breadcrumb`, `/navigation` | 없음 |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | 문자열 | 필수 | navigation landmark 이름. 비우면 `TypeError` |
| `items` | `readonly { id: Id; label: string; destination?: { kind: "internal" \| "external"; href: string } }[]` | 필수 | 마지막 항목만 현재 위치이며 `destination`이 없어야 한다. 그 앞 항목은 `destination`이 필수다. 빈 trail·중복 id·빈 label도 거부한다. 항목 하나(현재 화면만)는 유효하다 |
| 항목 `destination` | Link의 `LinkDestination`(`internal` · `external`) | — | href 규칙은 [Link](link.md)를 따른다 |
| `separator` | 노드 · `null` | `›`(RTL에서 미러링) | 직접 넘긴 구분자는 뒤집지 않고, `null`이면 숨긴다. 구분자는 항상 `aria-hidden`이다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. `style`도 받지만 외형을 덮지 않는다 |

콜백이 없다. 조상 항목은 일반 `<a href>`이고 이동은 브라우저가 한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 내용 폭만 차지하는 한 줄 경로. 글자는 `label` 변형(12/18). 링크 높이가 44에 못 미치므로 터치 중심 화면의 주 탐색으로 쓰지 않는다 | `breadcrumbRecipe.link`·`current` |
| 간격 | 항목·구분자 사이 `spacing.xxs` 4. 바깥 여백이 없으므로 아래 제목·본문과의 간격은 화면의 세로 [Stack](stack.md)이 정한다 | `breadcrumbRecipe.gap`, `.hjm-breadcrumb` |
| 순서·정렬 | 페이지 제목 바로 위, 본문 시작 쪽 정렬. 상위 → 현재 순서이고 현재 위치(마지막)는 링크가 아니며 `semibold`로 표시한다 | `.hjm-breadcrumb__current` |
| 고정·스크롤 | 고정되지 않고 본문과 함께 스크롤한다 | `.hjm-breadcrumb__list` |
| 좁은 폭·큰 글자 | 줄바꿈된다(`flex-wrap: wrap`). 항목 label도 줄바꿈되고 구분자는 줄어들지 않는다 | `.hjm-breadcrumb__list`, `.hjm-breadcrumb__separator { flex-shrink: 0 }` |

## 꼭 지킬 것

- `label`과 항목 label은 i18n 키 또는 제품 데이터로 넣는다.
- 긴 경로를 `...`로 접지 않는다. 축약 축이 없고 renderer는 전체 trail을 줄바꿈해 그린다.
- 마지막 항목은 링크가 아니다(`aria-current="page"` 텍스트). 현재 화면에 href를 주지 않는다.

## 함정

- 조상 항목은 일반 `<a href>`로 그린다. 라우터 adapter prop(`renderLink` 등)이 없으므로
  Next.js `Link` 같은 클라이언트 전환을 기대하지 않는다.
