# Top 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Top](../top.md), recipe `topRecipe`(`src/top.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Top` | `@hjmds/react`, `/top` | `@hjmds/react-native`, `/top` | 기본 |

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

- descriptor: `title` 필수, `eyebrow`·`description` 선택. 값을 주면 공백만 있는 문자열은 `TypeError`다.
- `size`: `large`(기본, 화면 첫 제목) · `medium`(시트·모달 안). 세 번째 크기는 없다.
- `headingLevel`: `1`(기본) · `2` · `3`. 한 라우트가 여러 화면을 담을 때만 낮춘다.
- `trailing`: 제목 줄을 같이 쓰는 보조 행동 하나. 공간이 모자라거나 큰 글자면 아래로 내려간다.

## 꼭 지킬 것

- 문구는 모두 i18n 키로 만든 문자열이다. `description`은 잘리지 않고 줄바꿈되므로 말줄임을 덧대지 않는다.
- `eyebrow`에는 제목을 한정하는 짧은 말(카테고리·단계)만 넣고 제목에 없는 새 정보를 넣지 않는다.
- 주 행동을 `trailing`에 두지 않는다. 화면의 주 행동은 [BottomCTA](bottom-cta.md)나 본문 [Button](button.md)이다.
- 상태가 없다. 제목을 바꾸려면 다른 문자열을 넘긴다.
- 배치 수단은 Web `className`, Native `style`뿐이다. 글자 크기·색은 recipe가 정하므로 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제목 요소 | 실제 `h1`~`h3`(`headingLevel`) | `accessibilityRole="header"`(단계 없음, `headingLevel` 미사용) |
| `trailing` 내림 기준 | CSS 줄바꿈 | 글자 배율 1.6 이상이면 세로로 쌓음 |
| ref | `forwardRef`(`header` 요소) | 없음 |
