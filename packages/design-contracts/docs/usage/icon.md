# Icon 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Icon](../icon.md), recipe `iconRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

HJM semantic 이름(`search`, `back`, `chevronEnd`, `notifications` 등 43개)으로 고르는 그림 기호에 쓴다.
크기·색·선 굵기·RTL 반전은 HJM이 정하고, 그림 자체는 내장 경로(Web)나 제품이 넘긴 glyph가 그린다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 아이콘만 있는 누를 수 있는 행동 | [IconButton](icon-button.md) (이름은 버튼이 소유) |
| 사진·일러스트 | [Image](image.md), [Asset](asset.md) |
| 사람·계정 얼굴 | [Avatar](avatar.md) |
| 소셜 로그인 제공자 로고 | [AuthProviderButton](auth-provider-button.md) (로고는 제품 자산) |
| 미확인 개수 표시 | [CounterBadge](counter-badge.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Icon` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/primitives` | 기본 |
| `createLucideGlyph` | `/icon-lucide` | `/icon-lucide` | Lucide glyph 연결 helper(컴포넌트 아님) |

`/icon-lucide`는 optional peer가 필요하다. Web `lucide-react` 1.49.0,
Native `lucide-react-native` 1.49.0. 루트 entry에서는 나오지 않는다.

## 최소 사용 예

```tsx
// Web — 내장 glyph
import { Icon } from "@hjmds/react/display";

<Icon name="search" />
<Icon name="warning" tone="warning" decorative={false} accessibilityLabel={t("sync.failed")} />
```

```tsx
// Native — glyph는 제품이 공급한다(renderGlyph 필수)
import { Icon } from "@hjmds/react-native/primitives";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Search, ArrowLeft } from "lucide-react-native";

const renderGlyph = createLucideGlyph({ search: Search, back: ArrowLeft });

<Icon descriptor={{ name: "search" }} renderGlyph={renderGlyph} />
```

## 축과 기본값

- `size`: `xs` 14 · `sm` 20 · `md`(기본) 24 · `lg` 28 · `xl` 32 · `xxl` 44 · `xxxl` 48.
- `tone`: `primary` · `secondary`(기본) · `decorative` · `brand` · `info` · `success` · `warning` · `danger` · `inverse`.
- `weight`: `regular`(기본) · `strong`. `directionality`: 생략하면 `back`·`forward`·`chevronStart`·`chevronEnd`만 RTL에서 반전.
- 기본은 장식(`decorative` 생략 = true)이다. 정보 아이콘은 `decorative: false`와 현지화된 `accessibilityLabel`을 함께 준다.

## 꼭 지킬 것

- 장식 아이콘에 `accessibilityLabel`을 주거나, 정보 아이콘에 라벨을 빼면 `TypeError`가 난다.
  정보 아이콘에는 `decorative` tone도 쓸 수 없다.
- 이름은 모양이 아니라 목적으로 읽힌다. icon-only 행동의 이름은 바깥 IconButton·Link에 둔다.
- `inverse`는 brand·danger처럼 채워진 면 위에서만 쓴다.
- 크기·색·stroke를 `style`·`className`·glyph 쪽에서 바꾸지 않는다. 그림 라이브러리는 제품이 고르고
  (`createLucideGlyph`에 named import만 넘김), 의미 이름과 외형은 HJM이 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| API 모양 | 평평한 prop(`name`, `size`, `tone` …) | `descriptor` 객체 하나 |
| glyph | 내장 SVG 경로, `renderGlyph`는 선택 | `renderGlyph` 필수(내장 그림 없음) |
| 사용자 정의 이름 | `SemanticIconName`만 | `Icon<Name>` 제네릭으로 제품 이름 허용 |
| 출력 | `<svg>`(장식이면 `aria-hidden`) | `View` 프레임(장식이면 `accessible={false}`) |

## 함정

- 아이콘은 자기 `tone` 색을 직접 칠한다. Web CSS가 `data-tone`으로 색을 지정하므로 부모 색을 상속하지 않는다.
  primary·danger IconButton 안에서 기본 tone(`secondary`)을 쓰면 채워진 면 위에 회색이 된다. 이때는 `tone="inverse"`.
- `createLucideGlyph` 맵에 없는 이름을 그리면 실행 중 `TypeError`가 난다.
