# Stack

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Flex·Space와의 관계](../../layout-primitives.md), `src/component-recipes.ts`(`stackRecipe`)
- 스토리북: `배포/컴포넌트/레이아웃/가로·세로 배치`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Stack` | 기본 | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Stack } from "@hjmds/react/layout";

<Stack axis="inline" gap="xs" justify="end">
  <Button tone="secondary" onClick={cancel}>{t("common.cancel")}</Button>
  <Button onClick={save}>{t("common.save")}</Button>
</Stack>
```

```tsx
// Native
import { Heading } from "@hjmds/react-native/heading";
import { Stack, Text } from "@hjmds/react-native/primitives";

<Stack gap="sm">
  <Heading level="level4" semanticLevel={2}>{t("profile.title")}</Heading>
  <Text tone="muted">{t("profile.description")}</Text>
</Stack>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `axis` | `block` · `inline` | `block` | `block` 세로, `inline` 가로 |
| `gap` | `xxs`(4) · `xs`(8) · `sm`(12) · `md`(16) · `lg`(20) · `xl`(24) · `xxl`(32) · `xxxl`(40) | `md` | spacing 토큰 |
| `align` | `start` · `center` · `end` · `stretch` | `stretch` | — |
| `justify` | `start` · `center` · `end` · `between` | `start` | — |
| `wrap` | `boolean` | `false` | — |
| `layoutStyle` | `HjmCompositionStyleProp` | — | Stack 자신의 바깥 여백·폭·flex·`alignSelf` |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | — | — |
| 간격 | 형제 사이 간격만 정한다. 화면 섹션 사이 `xl` 24(`layout.sectionGap`), 섹션 안 내용 사이 `md` 16(`layout.contentGap`, 기본), 관련 묶음(라벨과 값, 나란한 버튼) `sm` 12·`xs` 8. 이 밖의 숫자를 새로 만들지 않는다. 바깥 여백은 부모(화면 여백 `layout.pagePadding` compact 16 · regular 20 · spacious 24)가 정한다 | `stackRecipe`, `foundations.ts` `layout` |
| 순서·정렬 | 가로로 버튼을 나열할 때 주 행동 순서는 [Button](button.md#배치)을 따른다 | — |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 가로(`axis="inline"`)로 버튼·칩을 나열해 좁은 폭에서 넘치면 `wrap`을 켠다 | `stackRecipe.defaults.wrap` |

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
