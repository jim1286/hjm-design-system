# Anchor

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Anchor — 같은 문서 안의 목차](../../anchor.md), `anchorRecipe`(`src/anchor.ts`)
- 스토리북: `배포/컴포넌트/탐색/문서 내 바로가기`

## 언제 쓰나

Web의 긴 문서·가이드·약관에서 같은 페이지 안 섹션으로 이동하는 목차에 쓴다. 현재 읽는 섹션을
실제 스크롤 위치로 계산해 `aria-current="location"`으로 표시하고, 클릭하면 대상 섹션에 초점을 옮긴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 다른 페이지·URL로 이동 | [Link](link.md) |
| 상위 경로 표시 | [Breadcrumb](breadcrumb.md) |
| 같은 자리의 화면 전환 | [Tabs](tabs.md) |
| 앱 전역 탐색 | [Sidebar](sidebar.md), [BottomNavigation](bottom-navigation.md) |
| 키보드 사용자를 본문으로 건너뛰기 | [SkipNav](skip-nav.md) |
| Native 화면 | 없음. Native renderer에는 Anchor가 없다 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Anchor` | 기본 | `@hjmds/react`, `/anchor` | 없음 |

## 최소 사용 예

```tsx
// Web
import { Anchor } from "@hjmds/react/anchor";

<Anchor
  label={t("guide.toc")}
  offset={64}
  items={[
    { id: "start", label: t("guide.start") },
    { id: "next", label: t("guide.next") },
  ]}
/>
// 같은 문서에 <section id="start">, <section id="next">를 둔다.
```

Native 사용 예는 없다(renderer 없음).

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | nav 접근성 이름 |
| `items` | `{ id: string, label: string }[]` | 필수 | 한 개 이상, id 고유·공백 없음 |
| `onNavigate` | `(id: string, event: MouseEvent<HTMLAnchorElement>) => void` | — | 기본 동작 전에 호출. `event.preventDefault()`면 HJM 스크롤·초점·history를 건너뛴다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용 |
| `orientation` | `vertical` · `horizontal` | `vertical` | 좁은 폭에서 줄바꿈하고 label을 자르지 않는다 |
| `offset` | 0 이상의 CSS px | `0` | 상단 고정 헤더 아래 남길 거리. 음수·비유한 값은 `RangeError` |
| `historyMode` | `push` · `replace` · `none` | `push` | URL을 쓰면 안 되는 미리보기는 `none` |
| `container` | `HTMLElement` · `null` | 생략(문서 스크롤) | `HTMLElement`면 그 영역 안만, `null`이면 ref를 기다리며 관찰하지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 링크 안쪽 여백 `spacing.xs` 8. 링크 높이는 44를 보장하지 않으므로 터치 중심 화면에서는 항목을 줄이거나 [Tabs](tabs.md)를 검토한다 | `anchorRecipe.link`, `.hjm-anchor__link` |
| 간격 | 항목 사이 `spacing.xxs` 4. 스토리는 Section 제목 아래 `Stack gap="md"`(16)로 [Anchor] → [본문 스크롤 영역]을 쌓는다 | `anchorRecipe.gap`, `showcase/web/src/patterns/Anchor.stories.tsx` |
| 순서·정렬 | 가리키는 본문 앞에 둔다. 넓은 문서 화면은 `vertical`로 본문 옆 열, 좁은 폭은 `horizontal`로 본문 위. 현재 위치는 세로형 시작 쪽·가로형 아래쪽 2px 선(`stroke.strong`, `border.focus`) | `anchorRecipe.current`, `.hjm-anchor*` |
| 고정·스크롤 | 스크롤 중에도 보이게 하려면 [Affix](affix.md)로 감싸고, 상단 고정 헤더가 있으면 `offset`을 그 높이로 맞춘다 | `getAnchorCurrentId`(`src/anchor.ts`) |
| 좁은 폭·큰 글자 | 가로 목차는 줄바꿈되며 가로 스크롤을 만들지 않는다. label은 줄바꿈되고 잘리지 않는다 | `.hjm-anchor[data-orientation="horizontal"] .hjm-anchor__list`(`flex-wrap: wrap`) |

```text
넓은 폭                                 좁은 폭
┌──────────┬────────────────────┐       ┌──────────────────────┐
│ ▍시작하기 │ 본문 섹션(스크롤)   │       │ 시작하기 · 다음 단계  │ ← horizontal
│  다음 단계│                    │       │ ▔▔▔▔▔▔              │
│  (Affix) │                    │       │ 본문 섹션(스크롤)     │
└──────────┴────────────────────┘       └──────────────────────┘
```

## 꼭 지킬 것

- `label`(nav 접근성 이름)과 항목 `label`은 i18n 문구로 넣는다. 빈 문자열이면 `TypeError`.
- 항목 `id`는 공백 없는 HTML id이고 문서 안에서 고유해야 한다. 중복·빈 목록은 throw다.
- 목차의 sticky 배치와 문서 레이아웃은 호스트가 소유한다. 고정이 필요하면 [Affix](affix.md)나 호스트 CSS로 감싼다.
- 앱 라우터로 처리하려면 `onNavigate(id, event)`에서 `event.preventDefault()`를 호출한다.
- 배치는 `layoutStyle`로 한다. `className`으로 현재 표시 색·선 굵기를 덮지 않는다([소비 정책 §3](../../consumer-policy.md)).

## 함정

- DOM에 대상이 없는 항목은 현재 위치 후보에서 빠지고 기본 href 동작을 한다. 지연 렌더 섹션은 삽입되면 자동으로 관찰된다.
- modifier 클릭(새 탭 등)은 브라우저 기본 동작에 맡긴다. 스크롤·초점 이동이 일어나지 않는 것이 정상이다.
- 중첩 트리 목차·제목 자동 수집은 없다. 항목은 호스트가 넘긴다.
