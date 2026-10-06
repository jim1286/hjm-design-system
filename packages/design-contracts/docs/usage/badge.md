# Badge 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `badgeRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

항목의 상태나 분류를 짧은 글자 하나로 붙일 때 쓴다. "진행 중", "완료", "시즌 3"처럼 누를 수 없는 표시다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 읽지 않은 수·알림 점 | [CounterBadge](counter-badge.md) |
| 사용자가 붙인 키워드·카테고리 | [Tag](tag.md) |
| 누르거나 고르는 필터 | [Chip](chip.md) |
| 문장으로 설명해야 하는 상태 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Badge` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Badge } from "@hjmds/react/display";

<Badge tone="success" size="small">{t("order.status.done")}</Badge>
```

```tsx
// Native
import { Badge } from "@hjmds/react-native/data-display";

<Badge tone="success" size="small" label={t("order.status.done")} />
```

## 축과 기본값

- `tone`: `neutral`(기본) · `strong` · `brand` · `info` · `success` · `warning` · `attention` · `danger`.
- `variant`: `filled`(기본) · `outline`. `size`: `small` · `medium`(기본).
- `leading`은 라벨 앞 아이콘 자리이며 보조기기에서 숨겨진다.
- `brand`는 판이 중립색이고 글자만 브랜드색이다. 브랜드 틴트는 "선택됨"을 뜻하므로 정적 표시에 쓰지 않는다.
- `strong`은 `neutral`보다 한 단계 강한 잉크 판이다. 승패처럼 한눈에 갈려야 하는 사실에 쓴다.

## 꼭 지킬 것

- 라벨은 i18n 키로 넣고 짧게 둔다. 상태 뜻을 색에만 싣지 않는다(글자가 뜻을 말해야 한다).
- 색은 `tone`으로만 고른다. 브랜드 색을 `style`·`className`·`labelStyle`로 덮지 않는다.
- 배치는 Web `layoutStyle`, Native `style`(여백·정렬)로만 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 라벨 | `children` | `label`(문자열·숫자, 필수) |
| 접근성 이름 | 라벨 텍스트 | `accessibilityLabel`(기본 `String(label)`) |
| 배치 | `layoutStyle` | `style` |
| 라벨 스타일 훅 | 없음 | `labelStyle`(색 override 금지) |
| 기본 폭 | inline | `alignSelf: "flex-start"` |
