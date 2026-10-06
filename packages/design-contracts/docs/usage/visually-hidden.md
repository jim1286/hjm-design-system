# VisuallyHidden 사용 지침

적용: `@hjmds/react` 1.12.1 (Native 없음) · 검토일: 2026-10-06 ·
계약: [VisuallyHidden](../visually-hidden.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `VisuallyHidden` | `@hjmds/react`, `/layout` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { VisuallyHidden } from "@hjmds/react/layout";

<span aria-hidden="true">{unreadCount}</span>
<VisuallyHidden>{t("inbox.unreadCount", { count: unreadCount })}</VisuallyHidden>
```

Native: 없음. 계약이 Web 전용으로 정했고, 보이지 않는 `Text`를 따로 mount하면 읽기 순서와 중복 낭독이
달라지므로 host 컨트롤의 `accessibilityLabel`·`accessibilityHint`를 쓴다.

## 꼭 지킬 것

- 자식은 문구(i18n 키)만 넣는다. 숨긴 상태로 포커스되는 컨트롤을 넣지 않는다.
- 보이는 문구와 같은 내용을 다시 넣지 않는다. 보이는 쪽을 `aria-hidden`으로 빼거나 추가 문맥만 넣어 중복 낭독을 막는다.
- 루트는 `span`이고 `HTMLAttributes`·`ref`를 전달한다. `className`은 `hjm-visually-hidden`에 덧붙으며,
  그 클래스 규칙은 `!important`라 위치·크기를 덮어 다시 보이게 만들 수 없다.
- 숨김 CSS는 `@hjmds/react`의 `styles.css`에 있다. 스타일시트를 불러오지 않은 화면에서는 문구가 그대로 보인다.
