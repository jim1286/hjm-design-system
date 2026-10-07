# SkipNav

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [SkipNav](../../skip-nav.md), `src/skip-nav.ts`(`skipNavRecipe`)
- 스토리북: `배포/컴포넌트/기반 기능/본문 바로가기`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SkipNav` | 기본 | `@hjmds/react`, `/skip-nav` | — |

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

Native: 없음.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `targetId` | `#` 없는 id | 필수 | `href`는 받지 않고 `#${targetId}`로 만든다 |
| `label` | 문구 | 필수 | `children`은 받지 않는다 |
| `onClick` | `(event: MouseEvent<HTMLAnchorElement>) => void` | — | 먼저 불린 뒤 대상으로 초점을 옮긴다. `preventDefault()`하면 옮기지 않는다 |
| 나머지 `<a>` 속성 · `className` · `ref` | — | — | `ref`는 `HTMLAnchorElement`. `layoutStyle`은 받지 않는다(Web 제외 15개 중 하나) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 최소 높이 `control.minTouchTarget` 44, 좌우 `spacing.md` 16, radius `radius.md` 12 | `skipNavRecipe` |
| 간격 | 초점을 받으면 시작 쪽 위 모서리에서 `spacing.sm` 12 떨어져 나타난다 | `skipNavRecipe.offset`, `.hjm-skip-nav` |
| 순서·정렬 | DOM에서 `<body>`(또는 앱 셸 루트)의 첫 자식, 헤더·내비게이션보다 앞. 페이지에 하나 | — |
| 고정·스크롤 | 평소에는 화면 위로 밀려 보이지 않고, 초점 시 `position: absolute`로 겹쳐 나타난다(레이아웃을 밀지 않음). `position`이 걸린 컨테이너 안에 넣으면 그 기준으로 뜨므로 문서 최상단에 둔다. z-index `layer.toast + 1` 1001 | `.hjm-skip-nav` |
| 좁은 폭·큰 글자 | 긴 라벨은 화면 폭 − 24(양쪽 offset)를 넘지 않고 줄을 바꾼다 | `.hjm-skip-nav` `max-inline-size` |

## 꼭 지킬 것

- 문서의 **첫 tab stop**에 둔다. 배치는 renderer가 강제하지 못한다.
- `targetId`는 `#` 없는 id만 넣는다. `"#main"`이나 빈 문자열은 렌더 중 `TypeError`를 던진다. 빈 `label`도 같다.
- `targetId`의 요소가 실제로 문서에 있어야 한다. 없으면 클릭해도 초점이 옮겨지지 않는다.
- `label`은 i18n 키로 넣는다(제품 문구). 숨김·포커스 시 표시 방식은 HJM 소유이므로 `className`으로 계속 숨기거나 위치를 바꾸지 않는다.

## 함정

- 클릭 시 대상에 `tabindex`가 없으면 `tabindex="-1"`을 붙이고 `focus()`한다. 대상 요소에 생긴 이 속성을 지우지 않는다.
- `onClick`에서 `event.preventDefault()`를 부르면 초점 이동이 일어나지 않는다.
- 현재 `style`은 타입상 받지만 HJM이 recipe 변수 style로 덮어써 조용히 버려진다. 위치는 recipe offset이 고정한다.

### 프로필 모서리·제목 소비

2026-10-07 소비 감사에서 Web 링크의 숫자 recipe 모서리가 프로필을 우회했다. 기존 `radius.md` 역할을 가까운 Provider의 CSS 변수로 읽고 변수 없는 독립 사용은 recipe 12를 유지한다. 숨김·고정 위치·표시·본문 초점 이동과 Web 전용 범위는 바꾸지 않는다.

프로필 연결은 1.15.0 이후 미게시 변경이며, 기본 배포 계약과 실제 Native 기기 검증은 구분한다.
