# VisuallyHidden

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [VisuallyHidden](../../visually-hidden.md), `react/src/layout.tsx`
- 스토리북: `배포/컴포넌트/기반 기능/화면 읽기 도구용 글자`

## 언제 쓰나

Web에서 화면에는 보이지 않지만 스크린 리더는 읽어야 하는 **문맥 문구**를 덧붙일 때 쓴다.
예: 아이콘·숫자만 보이는 상태 옆의 설명, 표의 압축된 셀에 붙는 완전한 문장.
자식은 DOM과 접근성 트리에 남고 1px clip으로 시각에서만 빠진다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 아이콘 버튼의 이름 | [IconButton](icon-button.md)의 `label` |
| 본문으로 건너뛰기 링크 | [SkipNav](skip-nav.md) |
| 포커스 가능한 컨트롤(input·link·button)을 숨김 | 쓰지 않는다. 계약상 금지 |
| Native에서 추가 문맥 | 컨트롤의 `accessibilityLabel`·`accessibilityHint` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `VisuallyHidden` | 기본 | `@hjmds/react`, `/layout` | — |

## 최소 사용 예

```tsx
// Web
import { VisuallyHidden } from "@hjmds/react/layout";

<>
  <span aria-hidden="true">{unreadCount}</span>
  <VisuallyHidden>{t("inbox.unreadCount", { count: unreadCount })}</VisuallyHidden>
</>
```

Native: 없음. 계약이 Web 전용으로 정했고, 보이지 않는 `Text`를 따로 mount하면 읽기 순서와 중복 낭독이
달라지므로 host 컨트롤의 `accessibilityLabel`·`accessibilityHint`를 쓴다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | `ReactNode`(문구) | — (필수) | 읽힐 문맥 문구 |
| 나머지 | `HTMLAttributes<HTMLSpanElement>`, `ref` | — | 루트 `span`에 전달 |

`layoutStyle`은 없다. 화면 자리를 차지하지 않아 배치할 대상이 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면 자리를 차지하지 않는다(1px 클립) | `.hjm-visually-hidden` |
| 간격 | `position: absolute`라 flex·grid 부모의 간격(`gap`)·정렬에 끼지 않는다. 이웃 사이 간격을 맞추려고 따로 여백을 덧대지 않는다 | `.hjm-visually-hidden` |
| 순서·정렬 | 문맥을 보태는 보이는 요소 **바로 뒤**(DOM 순서상 이웃)에 둬서 읽기 순서가 이어지게 한다. 부모 끝이나 화면 다른 곳에 모아 두지 않는다 | — |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | — | — |

## 꼭 지킬 것

- 자식은 문구(i18n 키)만 넣는다. 숨긴 상태로 포커스되는 컨트롤을 넣지 않는다.
- 보이는 문구와 같은 내용을 다시 넣지 않는다. 보이는 쪽을 `aria-hidden`으로 빼거나 추가 문맥만 넣어 중복 낭독을 막는다.
- 루트는 `span`이고 `HTMLAttributes`·`ref`를 전달한다. `className`은 `hjm-visually-hidden`에 덧붙으며,
  그 클래스 규칙은 `!important`라 위치·크기를 덮어 다시 보이게 만들 수 없다.
- 숨김 CSS는 `@hjmds/react`의 `styles.css`에 있다. 스타일시트를 불러오지 않은 화면에서는 문구가 그대로 보인다.
