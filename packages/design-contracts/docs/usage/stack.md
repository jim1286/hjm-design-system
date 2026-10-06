# Stack 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `stackRecipe`(`src/component-recipes.ts`), 판정: [Flex·Space와의 관계](../layout-primitives.md)

## 언제 쓰나

자식들을 한 방향으로 늘어놓고 사이 간격을 토큰으로 맞출 때 쓴다. 폼 필드 세로 나열, 버튼 두 개의
가로 배치, 카드 안 제목·설명 묶음이 여기에 속한다. antd `Flex`·`Space`에 해당하는 자리도 Stack이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 2차원 열·반응형 칸 | [Grid](grid.md) |
| 높이가 제각각인 카드 벽 | [Masonry](masonry.md) |
| 콘텐츠 최대 폭·좌우 여백 | [Container](container.md) |
| 배경·테두리·radius가 있는 상자 | [Surface](surface.md), [Card](card.md) |
| 항목 사이 구분선 | Stack 안에 [Divider](divider.md) |
| 헤더·사이드바·본문 화면 골격 | [Layout](layout.md) |
| 제목이 있는 본문 묶음 | [Section](section.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Stack` | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Stack } from "@hjmds/react/layout";

<Stack axis="inline" gap="xs" justify="end">
  <Button tone="secondary" onClick={cancel}>{t("common.cancel")}</Button>
  <Button onClick={save}>{t("common.save")}</Button>
</Stack>
```

```tsx
// Native
import { Stack } from "@hjmds/react-native/primitives";

<Stack gap="sm">
  <Text variant="title" emphasis="strong">{t("profile.title")}</Text>
  <Text tone="muted">{t("profile.description")}</Text>
</Stack>
```

## 축과 기본값

- `axis`: `block`(세로, 기본) · `inline`(가로).
- `gap`: spacing 토큰 `xxs`(4) · `xs`(8) · `sm`(12) · `md`(16, 기본) · `lg`(20) · `xl`(24) · `xxl`(32) · `xxxl`(40).
- `align`: `start` · `center` · `end` · `stretch`(기본). `justify`: `start`(기본) · `center` · `end` · `between`.
- `wrap`: 기본 `false`.

## 꼭 지킬 것

- 간격은 `gap` 토큰으로만 정한다. 자식마다 margin을 붙여 간격을 만들지 않는다.
- Stack 자체의 배치(바깥 여백·폭·flex)는 `layoutStyle`로 한다. Stack은 배경·테두리를 갖지 않으므로
  상자가 필요하면 Surface로 감싼다.
- 시각 순서는 DOM/자식 순서와 같게 둔다. 순서를 뒤집는 CSS로 읽기 순서를 바꾸지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `gap` 타입 | 토큰만 | 토큰 또는 숫자 |
| 방향 | CSS 상속 | provider `environment.direction`을 `direction`으로 적용 |
| import 경로 | `/layout` | `/primitives` |
| ref | `forwardRef`(`div`) | 없음 |
