# Text

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: `src/component-recipes.ts`(`textRecipe`), [Gravity Letters](../../gravity-letters.md)
- 스토리북: `배포/컴포넌트/글자와 아이콘/본문 글자`, `배포/컴포넌트/시각 효과/중력 글자`

## 언제 쓰나

화면의 모든 일반 글자에 쓴다. 본문·보조 설명·캡션·라벨·카드 안의 작은 제목(24px 이하)이 여기에
속한다. 제품 CSS로 폰트 크기·굵기·색을 직접 쓰는 대신 `variant`·`emphasis`·`tone`으로 고른다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 문서 제목 단계(`h1`~)가 필요하거나 24px보다 큰 제목 | [Heading](heading.md) |
| 화면 첫 자리의 제목 블록(보조 문장·행동 포함) | [Top](top.md) |
| 본문 묶음의 헤더 행 | [Section](section.md) |
| 숫자 지표와 그 라벨 | [Statistic](statistic.md) |
| 다른 화면·URL로 가는 글자 | [Link](link.md) |
| 숫자·날짜·코드 같은 형식 글자 | [TextFormat](text-format.md) |
| 화면에는 숨기고 보조기기에만 읽힐 글자(Web) | [VisuallyHidden](visually-hidden.md) |

Text와 Heading의 경계: Text의 `variant="heading"`(24px)은 **모양만** 제목이고 제목 role이 없다.
보조기기의 제목 탐색에 잡혀야 하거나 더 큰 크기가 필요하면 Heading을 쓴다. Heading은 여백을 갖지 않는다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Text` | 기본 | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` |
| `GravityLetters` | 확장(홍보용 글자 낙하 장식, optional-extension) | `/gravity-letters` | `/gravity-letters` |

`GravityLetters`는 granular subpath로만 import 된다. 추가 peer 의존성은 없다(Web은 WAAPI, Native는 RN `Animated`).

## 최소 사용 예

```tsx
// Web
import { Text } from "@hjmds/react/layout";

<Text as="p" variant="body" tone="muted">{t("profile.bioHint")}</Text>
```

```tsx
// Native
import { Text } from "@hjmds/react-native/primitives";

<Text variant="body" tone="muted" numberOfLines={2}>{t("profile.bioHint")}</Text>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `caption`(11) · `label`(12) · `body`(14) · `bodyLarge`(16) · `title`(18) · `titleLarge`(20) · `heading`(24) | `body` | 화면·섹션 제목은 모양이 아니라 [Heading](heading.md)으로 쓴다 |
| `fontRole` | `ui` · `display` · `reading` · `code` | 제목 variant는 display, 본문은 reading, caption/label은 ui | 명시값이 기본을 덮는다. [역할 지침](../tokens/font-roles.md), 1.15.0 이후 미게시 |
| `emphasis` | `regular` · `medium`(semibold) · `strong`(bold) | `regular` | — |
| `tone` | `primary` · `body` · `muted` · `subtle` · `weak` · `brand` · `danger` · `inverse` | `primary` | — |
| `as` | `span` · `p` · `div` · `strong` · `small` | `span` | Web만. 문단은 `as="p"` |
| `align` | `TextStyle["textAlign"]` | 쓰기 방향의 시작 쪽 | Native만 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 배치. Web·Native 모두 |
| `GravityLetters` `glyphs` | `readonly string[]`(1~32개) | — (필수) | — |
| `GravityLetters` `active`·`replayKey` | `boolean`·`string \| number` | `false`·`0` | `replayKey`가 바뀌면 다시 떨어진다. Web만 `layoutStyle`도 받는다 |

## 배치

Native는 Text의 역할을 해당 stack에, 입력/조작 host는 제품 프로필의 `tokens.fontFamily.ui`에 연결한다. 기본 UI stack은 OS 서체를 유지하고, 제품이 지정한 첫 named font의 등록·글리프 확인은 제품이 맡는다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭은 부모를 따른다. 긴 읽기 글은 부모 폭을 `layout.readingMaxWidth` 720 이하로 둔다 | `foundations.ts`(`layout`) |
| 간격 | 바깥 여백이 없다(Web `margin: 0`). 문단 사이·라벨과 값 사이 간격은 부모 [Stack](stack.md)의 `gap`이나 `layoutStyle`로 준다. 본문 문단 묶음은 보통 `spacing.xs` 8~`spacing.sm` 12, 섹션 사이는 `layout.sectionGap`(`spacing.xl` 24) | `.hjm-text`, `foundations.ts`(`layout`, `spacing`) |
| 순서·정렬 | Web은 부모가 정하고, Native는 `align`(생략 시 쓰기 방향의 시작 쪽)으로 정한다 | `react-native/src/primitives.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 줄이 늘어나 높이가 자란다. 자르려면 Native `numberOfLines`를 쓰고, 핵심 문구는 자르지 않는다 | `.hjm-text`(`overflow-wrap: anywhere`) |

## 꼭 지킬 것

- 글자는 i18n 키로 넣는다. 제품 이름·도메인 문구는 제품 소유, 크기·색 체계는 HJM 소유다.
- 배치(여백·폭·flex)는 `layoutStyle`로만 한다. 색·크기·굵기는 `style`/`className`으로 덮지 않는다.
  (Native Text의 `style`은 layout primitive라 deprecated 경고 대상에서 빠져 있을 뿐 권장 경로가 아니다.)
- 색으로 의미를 바꿀 때는 `tone`만 쓴다(오류 문구 `danger`, 어두운 배경 위 `inverse`).
- `GravityLetters`는 장식이며 접근성 트리에서 숨는다. 같은 문구의 정적 Text·Heading을 바깥에 함께 둔다.
  `glyphs`는 32개 이하, 빈 문자열·줄바꿈 없이 넘긴다(어기면 `RangeError`). `active` 기본은 `false`다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 요소 선택 | `as` | 없음(항상 RN `Text`) |
| 정렬 | 없음(배치는 부모) | `align`(생략 시 방향에 맞춘 논리 정렬) |
| 글자 크기 조정 | 브라우저 | provider `textScaling`이 `allowFontScaling`을 정함 |
| 긴 단어 줄바꿈 | `overflow-wrap: anywhere` | RN 기본 |
| import 경로 | `/layout` | `/primitives` |

## 함정

- `emphasis`가 `variant`의 굵기를 덮는다. `variant="title"`도 기본 `emphasis="regular"`면 보통 굵기로
  그려진다. 굵은 제목이 필요하면 `emphasis="strong"`을 명시한다(두 renderer 동일).
