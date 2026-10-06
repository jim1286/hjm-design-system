# Anchor 사용 지침

적용: `@hjmds/react` 1.12.1(Web 전용) · 검토일: 2026-10-06 ·
계약: [Anchor — 같은 문서 안의 목차](../anchor.md), `anchorRecipe`(`src/anchor.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Anchor` | `@hjmds/react`, `/anchor` | 없음 | 기본 |

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

- `orientation`: `vertical`(기본) · `horizontal`. 좁은 폭에서 줄바꿈하고 label을 자르지 않는다.
- `offset`: 기본 `0`. 상단 고정 헤더 아래 남길 CSS px. 음수·비유한 값은 `RangeError`.
- `historyMode`: `push`(기본) · `replace` · `none`. URL을 쓰면 안 되는 미리보기는 `none`.
- `container`: 생략하면 문서 스크롤을 본다. `HTMLElement`면 그 영역 안만, `null`이면 ref를 기다리며 관찰하지 않는다.

## 꼭 지킬 것

- `label`(nav 접근성 이름)과 항목 `label`은 i18n 문구로 넣는다. 빈 문자열이면 `TypeError`.
- 항목 `id`는 공백 없는 HTML id이고 문서 안에서 고유해야 한다. 중복·빈 목록은 throw다.
- 목차의 sticky 배치와 문서 레이아웃은 호스트가 소유한다. 고정이 필요하면 [Affix](affix.md)나 호스트 CSS로 감싼다.
- 앱 라우터로 처리하려면 `onNavigate(id, event)`에서 `event.preventDefault()`를 호출한다.
- `className`은 배치용으로만 쓴다. 현재 표시 색·선 굵기를 덮지 않는다([소비 정책 §3](../consumer-policy.md)).

## 함정

- DOM에 대상이 없는 항목은 현재 위치 후보에서 빠지고 기본 href 동작을 한다. 지연 렌더 섹션은 삽입되면 자동으로 관찰된다.
- modifier 클릭(새 탭 등)은 브라우저 기본 동작에 맡긴다. 스크롤·초점 이동이 일어나지 않는 것이 정상이다.
- 중첩 트리 목차·제목 자동 수집은 없다. 항목은 호스트가 넘긴다.
