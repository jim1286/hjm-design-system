# SkipNav 사용 지침

적용: `@hjmds/react` 1.12.1 (Web 전용) · 검토일: 2026-10-06 ·
계약: [SkipNav](../skip-nav.md), recipe `skipNavRecipe`

## 언제 쓰나

Web 화면에서 반복되는 머리(내비게이션·헤더)를 건너뛰고 본문으로 가는 링크가 필요할 때 쓴다.
내비게이션이 있는 Web 페이지에는 하나를 둔다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 계속 숨겨 두는 화면 리더 전용 문구 | [VisuallyHidden](visually-hidden.md) |
| 페이지 안의 여러 절로 이동하는 목차 | [Anchor](anchor.md) |
| 다른 페이지·URL로 이동 | [Link](link.md) |
| Native 화면 | 없음(화면 리더 rotor가 맡는다) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SkipNav` | `@hjmds/react`, `/skip-nav` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { SkipNav } from "@hjmds/react/skip-nav";

<body>
  <SkipNav targetId="main" label={t("a11y.skipToContent")} />
  <header>{/* 내비게이션 */}</header>
  <main id="main">{/* 본문 */}</main>
</body>
```

Native renderer는 없다.

## 축과 기본값

- 필수 prop은 `targetId`와 `label` 둘뿐이다. `href`·`children`은 받지 않고 `#${targetId}`와 `label`로 만든다.
- 나머지 `<a>` 속성과 `className`, `ref`(HTMLAnchorElement)를 받는다.

## 꼭 지킬 것

- 문서의 **첫 tab stop**에 둔다. 배치는 renderer가 강제하지 못한다.
- `targetId`는 `#` 없는 id만 넣는다. `"#main"`이나 빈 문자열은 렌더 중 `TypeError`를 던진다. 빈 `label`도 같다.
- `targetId`의 요소가 실제로 문서에 있어야 한다. 없으면 클릭해도 초점이 옮겨지지 않는다.
- `label`은 i18n 키로 넣는다(제품 문구). 숨김·포커스 시 표시 방식은 HJM 소유이므로 `className`으로 계속 숨기거나 위치를 바꾸지 않는다.

## 함정

- 클릭 시 대상에 `tabindex`가 없으면 `tabindex="-1"`을 붙이고 `focus()`한다. 대상 요소에 생긴 이 속성을 지우지 않는다.
- `onClick`에서 `event.preventDefault()`를 부르면 초점 이동이 일어나지 않는다.
