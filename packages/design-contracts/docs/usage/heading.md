# Heading 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Heading](../heading.md), recipe `headingRecipe`(`src/heading.ts`)

## 언제 쓰나

자리를 모르는 큰 제목 글자 하나가 필요할 때 쓴다. 랜딩 히어로, 결과 화면의 큰 제목,
카드·표·빈 상태 안의 제목처럼 `Text`의 최대 크기(24px)로는 모자라거나 문서 제목 단계를
실제로 내야 하는 자리다. 주변 여백은 갖지 않는다. 담는 블록이 정한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 첫 제목(여백·eyebrow·보조 문장·보조 행동 포함) | [Top](top.md) |
| 본문 중간 묶음의 제목 행·설명 | [Section](section.md) |
| 본문·라벨·캡션 크기의 글자 | [Text](text.md) |
| 화면 전체 틀의 제목 | [ScreenLayout](screen-layout.md)의 `title` |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Heading` | `@hjmds/react`, `/heading` | `@hjmds/react-native`, `/heading` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Heading } from "@hjmds/react/heading";

<Heading level="level2">{t("result.title")}</Heading>
```

```tsx
// Native
import { Heading } from "@hjmds/react-native/heading";

<Heading level="level4" semanticLevel={3}>{t("card.title")}</Heading>
```

## 축과 기본값

- `level`(필수): `level1` 40px · `level2` 32px · `level3` 24px · `level4` 20px · `level5` 18px.
  recipe 기본은 `level3`이지만 두 renderer 모두 prop을 필수로 받는다.
- `semanticLevel`: 1~6. 생략하면 `level`의 숫자를 따른다. 크게 보이지만 구조상 h4인 카드 제목처럼
  시각 크기와 문서 단계가 다르면 둘을 따로 적는다.
- 범위 밖 값은 `TypeError`로 거부된다.

## 꼭 지킬 것

- 제목 문구는 i18n 키로 넣는다. Web은 줄바꿈을 `overflow-wrap: anywhere`로 처리하므로 자르지 않는다.
- 크기를 맞추려고 `semanticLevel`을 바꾸거나, 구조를 맞추려고 `level`을 줄이지 않는다.
- 제목 아래 간격은 Heading에 주지 않고 감싸는 Stack·Section의 gap으로 정한다.
- 색·크기·굵기를 덮지 않는다. 색은 테마의 `content.primary`를 따른다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 출력 | `h1`~`h6` 요소 | `Text` + `accessibilityRole="header"` + `aria-level` |
| 추가 prop | `HTMLAttributes`(`id`, `className` 등), ref | `style`(TextStyle)만 |
| 글자 배율 | `--hjm-text-scale`로 확대 | Native `Text`의 글자 배율 |

## 함정

- Web은 넘긴 `style`을 쓰지 않는다. renderer가 크기 변수를 담은 `style`로 덮어쓴다.
  배치가 필요하면 바깥 래퍼에 준다.
- Native `style`은 마지막에 합쳐져 색·크기까지 바뀐다. 타입이 막지 않으므로 리뷰에서 배치 외 값을 거른다.
