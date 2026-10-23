# Top

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-23
- 근거: [Top](../../top.md), `src/top.ts`(`topRecipe`)
- 스토리북: `배포/컴포넌트/레이아웃/화면 제목과 설명`

## 언제 쓰나

화면 **본문의 첫 블록**에 쓴다. 사용자가 "이 화면이 무엇을 묻는지" 읽는 제목과 보조 문장이며, 스크롤과
함께 올라간다. 화면당 하나다. 시트·모달 안 화면의 첫 제목에는 `size: "medium"`을 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 위에 고정된 뒤로가기·화면 이름·행동 | [TopBar](top-bar.md) |
| 본문 중간의 묶음 제목 | [Section](section.md) |
| 제목 글자만 필요 | [Heading](heading.md) |
| 사이트 전체 탐색 바 | [TopBar](top-bar.md)의 `NavigationBar` |

Top과 TopBar의 구분: TopBar는 화면에 붙어 있는 크롬(safe area, 뒤로가기, 액션)이고 Top은 그 아래에서 스크롤되는
본문 제목이다. 한 화면에 둘을 같이 써도 된다. 이때 TopBar `title`을 생략하거나 Top과 다른 짧은 이름으로 둔다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Top` | 기본 | `@hjmds/react`, `/top` | `@hjmds/react-native`, `/top` |

## 최소 사용 예

```tsx
// Web
import { Link } from "@hjmds/react/actions";
import { Top } from "@hjmds/react/top";

<Top
  descriptor={{ title: t("signup.title"), description: t("signup.description") }}
  trailing={<Link href="/help">{t("common.help")}</Link>}
/>
```

```tsx
// Native
import { Top } from "@hjmds/react-native/top";

<Top descriptor={{ eyebrow: t("signup.step", { n: 1 }), title: t("signup.title") }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ title: string, eyebrow?: string, description?: string, size?, headingLevel?, titleLineBreaks? }` | — | 값을 주면 공백만 있는 문자열은 `TypeError` |
| `descriptor.titleLineBreaks` | `collapse` · `preserve` | `collapse` | 제목 안 `\n`. `collapse`는 공백으로 바꿔 폭에 따라 감고, `preserve`는 제품이 의도한 줄바꿈을 지킨다(Web `white-space: pre-line`, Native `\n`). 줄 앞뒤 공백과 빈 줄은 지운다. 두 값 모두 제목 이름은 줄을 공백 하나로 이은 한 문장이다(`resolveTopTitle`, 개발 소스·미게시) |
| `descriptor.size` | `large` · `medium` | `large` | `large`는 화면 첫 제목, `medium`은 시트·모달 안. 세 번째 크기는 없다 |
| `descriptor.headingLevel` | `1` · `2` · `3` | `1` | 한 라우트가 여러 화면을 담을 때만 낮춘다(Web만 반영) |
| `trailing` | `ReactNode`(요소 하나) | — | 제목 줄을 같이 쓰는 보조 행동. 공간이 모자라거나 큰 글자면 아래로 내려간다 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| `style`(Native) | 지원하지 않음 | — | 제거된 속성 — `layoutStyle`. 현재 공개 props에서 제거되었다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 좌우 여백 없음. 위·아래 여백 `large` `spacing.xl` 24 / `spacing.md` 16, `medium` `spacing.md` 16 / `spacing.sm` 12 | `topRecipe.sizes`, `.hjm-top` |
| 간격 | Web은 eyebrow 아래 `spacing.xxs` 4, description 위 `spacing.xs` 8. Native는 세 줄 사이 `spacing.xs` 8. 제목–`trailing` `spacing.xs` 8. 아래 본문 첫 블록과는 아래 여백으로 떨어진다 | `topRecipe.eyebrow`·`description`·`gap`, `.hjm-top__row` |
| 순서·정렬 | eyebrow → 제목 줄 → description. 제목 줄은 제목(남은 폭) + `trailing`(끝 정렬) | `.hjm-top__row`, `react-native/src/top.tsx` |
| 고정·스크롤 | 스크롤 영역의 맨 처음, [TopBar](top-bar.md) 바로 아래. 화면 페이지 여백(`layout.pagePadding`, 보통 `regular` 20) 안에 넣는다 | `foundations.ts` `layout.pagePadding` |
| 좁은 폭·큰 글자 | Web은 폭이 모자라면 줄바꿈으로, Native는 글자 배율 1.6 이상이면 `trailing`을 제목 아래로 내린다 | `.hjm-top__row`(flex-wrap), `react-native/src/top.tsx` |

## 꼭 지킬 것

- 문구는 모두 i18n 키로 만든 문자열이다. `description`은 잘리지 않고 줄바꿈되므로 말줄임을 덧대지 않는다.
- `eyebrow`에는 제목을 한정하는 짧은 말(카테고리·단계)만 넣고 제목에 없는 새 정보를 넣지 않는다.
- 주 행동을 `trailing`에 두지 않는다. 화면의 주 행동은 [BottomCTA](bottom-cta.md)나 본문 [Button](button.md)이다.
- 상태가 없다. 제목을 바꾸려면 다른 문자열을 넘긴다.
- 배치는 `layoutStyle`로 한다(Web `className`도 받는다). Native `style`은 제거된 속성이다. 글자 크기·색은 recipe가 정하므로 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제목 요소 | 실제 `h1`~`h3`(`headingLevel`) | `accessibilityRole="header"`(단계 없음, `headingLevel` 미사용) |
| `trailing` 내림 기준 | CSS 줄바꿈 | 글자 배율 1.6 이상이면 세로로 쌓음 |
| 줄바꿈 제목의 이름 | heading 내용의 공백 정규화로 한 문장 | `accessibilityLabel`에 줄을 공백으로 이은 문장 |
| ref | `forwardRef`(`header` 요소) | 없음 |

### 프로필 모서리·제목 소비

2026-10-07 소비 감사에서 두 renderer의 제목 크기·행간·굵기가 foundation으로 확정된 recipe를 직접 읽어 프로필을 우회했다. `large`는 가까운 프로필의 `heading.level3`(24, 2026-10-17 큰 글자 단계 폐지 전에는 `level2` 32), `medium`은 `typography.titleLarge`를 읽고 프로필이 없으면 기존 recipe를 유지한다. 시각 역할은 `headingLevel`과 독립이며 display 서체·제목 의미·보조 행동·초점은 바꾸지 않는다.

프로필 연결은 1.16.0 변경이며, 기본 배포 계약과 실제 Native 기기 검증은 구분한다.

## 근거

- `titleLineBreaks`(2026-10-23 소비 감사): 포트폴리오 사이트 히어로가 의도한 두 줄 제목(`"…제품으로,\n제품을…"`)을 `Heading` 안
  `white-space: pre-line` span으로 그려 Top을 채택하지 못했다. 같은 `\n`을 Web은 공백으로, Native는 줄바꿈으로 그려 두 플랫폼도 달랐다.
  줄 배열 대신 문자열 옵션을 고른 이유는 번역 문자열이 이미 `\n`을 담고 있고, 번역마다 줄 수가 달라도 제품이 쪼갤 필요가 없어서다.
  기본 `collapse`로 Native도 Web처럼 공백으로 바꾼다. 의도한 줄바꿈은 `preserve`로만 남는다.

```tsx
<Top descriptor={{ eyebrow: c.heroRole, title: c.heroTitle, description: c.heroBody, titleLineBreaks: "preserve" }} />
```
