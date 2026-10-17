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
| 짧은 상태·결과 문구를 변경 알림으로 전달 | [StatusText](#statustext) |
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
| `StatusText` | 짧은 상태·결과 알림 companion | `@hjmds/react`, `/status-text` | `@hjmds/react-native`, `/status-text` |
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
| `fontRole` | `ui` · `display` · `reading` · `code` | 제목 variant는 display, 본문은 reading, caption/label은 ui | 명시값이 기본을 덮는다. [역할 지침](../tokens/font-roles.md), 1.16.0 변경 |
| `emphasis` | `regular` · `medium`(semibold) · `strong`(bold) | 프로필이 있으면 variant 굵기, 없으면 `regular` | 명시값이 프로필과 variant보다 우선 |
| `tone` | `primary` · `body` · `muted` · `subtle` · `weak` · `brand` · `danger` · `inverse` | `primary` | — |
| `as` | `span` · `p` · `div` · `strong` · `small` | `span` | Web만. 문단은 `as="p"` |
| `align` | `TextStyle["textAlign"]` | 쓰기 방향의 시작 쪽 | Native만 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 배치. Web·Native 모두 |
| `GravityLetters` `glyphs` | `readonly string[]`(1~32개) | — (필수) | — |
| `GravityLetters` `active`·`replayKey` | `boolean`·`string \| number` | `false`·`0` | `replayKey`가 바뀌면 다시 떨어진다. Web만 `layoutStyle`도 받는다. Native만 `level`(Heading 단계)을 받는다 — Web은 바깥 Heading의 글자 모양을 물려받는다 |

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
- `GravityLetters`는 장식이며 접근성 트리에서 숨는다. 읽을 수 있는 같은 문구를 함께 두되 화면에 두 번 보이지 않게 한다: Web은 같은 Heading 안의 `VisuallyHidden`, Native는 `accessibilityRole="header"`·`accessibilityLabel`을 가진 감싸는 View.
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

- `emphasis`를 명시하면 `variant`의 굵기를 덮는다. `designProfile`이 있으면 생략한 `emphasis`는 해당 프로필의 `tokens.typography[variant].fontWeight`를 따른다. 프로필이 없으면 기존 기본값 `regular`를 유지하므로 `variant="title"`도 보통 굵기로 그려진다. 그 경우 굵은 제목은 `emphasis="strong"`으로 지정한다(두 renderer 동일).


## StatusText

Text와 같은 표현을 유지하면서 상태 변경 알림을 연결하는 공개 companion이다.
기존 `본문 글자` Story의 `상태 알림`에서 지속 안내와 저장 결과를 확인한다.

### StatusText 선택 기준

저장 결과, 선택 개수, 요청 진행처럼 **짧은 문자열 하나**를 화면 안에 유지하며 변경을 알릴 때 쓴다.
Text의 companion으로 같은 `variant`·`tone`·`emphasis`·`layoutStyle`을 받으며 글꼴·색·간격을 새로 만들지 않는다.
문구와 성공·실패 판정은 제품이 소유한다.

| 상황 | 선택 |
| --- | --- |
| 읽기만 하는 본문·계속 표시되는 설명 | Text |
| 짧은 상태·결과 문자열의 변경 알림 | StatusText |
| 제목·설명·아이콘·재시도 행동을 묶은 안내 | Notice |
| 화면 위에 일시적으로 나타나며 닫히는 알림 | Toast |

### 가져오기

```tsx
// Web
import { StatusText } from "@hjmds/react/status-text";
// Native: import { StatusText } from "@hjmds/react-native/status-text";
// 두 renderer의 root에서도 내보낸다.
```

### StatusText가 놓이는 자리

```text
관련 입력 또는 행동
↕ 부모 Stack의 gap
StatusText: 결과 문자열
```

자체 여백·판·최소 높이는 없다. 관련 행동 가까이에 두고 부모 Stack이 간격을 소유한다.
화면 전체를 대체하는 로딩·실패·빈 상태는 해당 영역의 ScreenLayout/StateView/Notice로 구성한다.

### 공개 props

| prop | 기본값 | 의미 |
| --- | --- | --- |
| `children: string` | 필수 | 제품의 지역화된 상태 문구. 빈 문자열도 허용 |
| `announcement` | `polite` | `none`·`polite`·`assertive`. 시각적 tone과 알림 우선순위는 독립 |
| `announceOnMount` | `false` | Native iOS 옵션. 조건부로 새로 나타난 행동 결과를 처음에도 알림 |
| 나머지 Text props·ref | Text와 같음 | Web role/live/atomic, Native live region은 StatusText가 소유 |

### 지속 안내와 새 결과

```tsx
// Native
import { StatusText } from "@hjmds/react-native/status-text";

// 계속 유지되는 노드: 최초 안내는 iOS에서 읽지 않고 이후 문자열 변경만 알린다.
<StatusText>{message}</StatusText>

// Native: 행동 뒤 조건부로 새로 마운트되는 결과는 opt-in한다.
{saved ? <StatusText announceOnMount>{t("save.complete")}</StatusText> : null}

<StatusText announcement="assertive" tone="danger">{errorMessage}</StatusText>
```

Web은 `polite`를 `role="status"`, `assertive`를 `role="alert"`로 연결하고 `aria-live`와
`aria-atomic`을 설정한다. `none`은 `aria-live="off"`이고 상태 role을 붙이지 않는다.
같은 live node의 텍스트를 갱신하는 것이 기본이다. Web에는 `announceOnMount` prop이 없으며,
새로 마운트된 live region의 읽힘은 브라우저·보조기술에 따라 달라진다.

Native Android는 `accessibilityLiveRegion`만 사용한다. iOS는 앱이 active이고 비어 있지 않은 문구가
바뀔 때 `announceForAccessibilityWithOptions`를 호출한다. `polite`는 queue, `assertive`는 즉시 우선순위다.
`none`, 같은 문구 재렌더, 빈 문구, 배경 변경은 발표하지 않는다. foreground 복귀나 announcement 모드 변경만으로
과거 문구를 재생하지 않는다. 빈 문구로 지웠다가 같은 결과를 다시 표시하면 새 변경이다.
`announceOnMount`는 마운트 시점에 결정하며 나중에 true로 바꿔 초기 안내를 재생하지 않는다.

### 경계

동일 결과를 매 렌더 다시 알리기 위해 key를 바꾸지 않는다. Toast·Notice에서 이미 알리는 결과를 중복 알리지 않는다.
Showcase의 `PatternStatus`는 이 공개 컴포넌트를 가리키는 내부 별칭일 뿐이며 제품에서 Showcase 파일을 import하지 않는다.
DOM 속성·Native host 호출 검사는 실제 VoiceOver·TalkBack의 낭독 확인과 구분한다.
