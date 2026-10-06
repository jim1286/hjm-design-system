# Top

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
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
| `descriptor` | `{ title: string, eyebrow?: string, description?: string, size?, headingLevel? }` | — | 값을 주면 공백만 있는 문자열은 `TypeError` |
| `descriptor.size` | `large` · `medium` | `large` | `large`는 화면 첫 제목, `medium`은 시트·모달 안. 세 번째 크기는 없다 |
| `descriptor.headingLevel` | `1` · `2` · `3` | `1` | 한 라우트가 여러 화면을 담을 때만 낮춘다(Web만 반영) |
| `trailing` | `ReactNode`(요소 하나) | — | 제목 줄을 같이 쓰는 보조 행동. 공간이 모자라거나 큰 글자면 아래로 내려간다 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| `style`(Native) | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

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
- 배치는 `layoutStyle`로 한다(Web `className`도 받는다). Native `style`은 deprecated다. 글자 크기·색은 recipe가 정하므로 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제목 요소 | 실제 `h1`~`h3`(`headingLevel`) | `accessibilityRole="header"`(단계 없음, `headingLevel` 미사용) |
| `trailing` 내림 기준 | CSS 줄바꿈 | 글자 배율 1.6 이상이면 세로로 쌓음 |
| ref | `forwardRef`(`header` 요소) | 없음 |
