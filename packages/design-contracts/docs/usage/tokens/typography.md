# 타이포그래피

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-17
- 근거: `src/foundations.ts`(`typography`·`heading`·`fontFamily`·`fontWeight`·`letterSpacing`·`numeric`·`largeTextThreshold`), `src/component-recipes.ts`(`textRecipe`), `packages/react/src/theme.ts`, `packages/react/src/provider.tsx`, `packages/react-native/src/provider.tsx`
- 스토리북: `배포/토큰/색과 글자/타이포그래피`

## 언제 쓰나

글자 크기·줄 높이·굵기를 정할 때 쓴다. 대부분은 [Text](../components/text.md)의 `variant`·`emphasis`와
[Heading](../components/heading.md)의 `level`로 고르고, 토큰을 직접 읽는 것은 제품 고유 그림(차트 라벨 등)일 때다.

## 값

### 글자 단계(`typography`, Text `variant`)

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `typography.caption` | 11 / 줄 16 / 400 | `--hjm-type-caption-size` · `-line-height` · `-weight` | `theme.tokens.typography.caption` | 가장 작은 보조 표기, AuthScreen 정책 링크 |
| `typography.label` | 12 / 줄 18 / 500 | `--hjm-type-label-*` | `theme.tokens.typography.label` | 라벨·도움말·small 버튼 글자 |
| `typography.body` | 14 / 줄 20 / 400 | `--hjm-type-body-*` | `theme.tokens.typography.body` | 기본 본문·medium 버튼·필드 글자 |
| `typography.bodyLarge` | 16 / 줄 24 / 400 | `--hjm-type-body-large-*` | `theme.tokens.typography.bodyLarge` | 읽기용 긴 본문·large 버튼 글자 |
| `typography.title` | 18 / 줄 26 / 500 | `--hjm-type-title-*` | `theme.tokens.typography.title` | 카드 제목(`heading.level5`) |
| `typography.titleLarge` | 20 / 줄 28 / 500 | `--hjm-type-title-large-*` | `theme.tokens.typography.titleLarge` | 큰 구획 제목(`heading.level4`) |
| `typography.heading` | 24 / 줄 32 / 500 | `--hjm-type-heading-*` | `theme.tokens.typography.heading` | 화면의 가장 큰 제목. **HJM 글자 크기의 상한** |

굵기 열은 토큰 원본값이다. 프로필 없는 Text는 기본 `emphasis="regular"`(400)를 사용하므로
variant만 지정해도 위 굵기가 자동 적용되는 것은 아니다. 예외는 `label`이다. `label`은 프로필이 없어도
생략한 emphasis가 토큰 굵기 500을 따른다(`textRecipe.variantWeight`, `resolveTextDefaultWeight`).
프로필이 있으면 생략한 emphasis는 프로필의 variant 굵기를 읽고, 명시한 emphasis는 언제나 우선한다.
Heading은 제목 단계의 굵기를 쓴다. 두 renderer가 같은 resolver를 쓴다.

### 문서 제목 단계(`heading`, Heading `level`)

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `heading.level3` | = `typography.heading` 24 | `--hjm-type-heading-*` | `heading.level3` | 화면 제목·랜딩 대표 제목 |
| `heading.level4` | = `typography.titleLarge` 20 | `--hjm-type-title-large-*` | `heading.level4` | 구획 제목 |
| `heading.level5` | = `typography.title` 18 | `--hjm-type-title-*` | `heading.level5` | 카드 제목 |
| `heading.level1` · `level2` | = `heading.level3` 24 (사용 중단) | `--hjm-type-heading-*` | `heading.level1` · `level2` | 새 코드에서 쓰지 않는다. 기존 소비 코드가 깨지지 않도록 이름만 남기고 값은 상한 24로 고정했다 |

### 서체·굵기·자간·숫자

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `fontFamily.ui` | Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif | `--hjm-font-family-ui` | `fontFamily.ui` | 화면 글자. Native는 `fonts="pretendard"`일 때 굵기별 Pretendard face, 그 전에는 OS 서체. 불러오기는 [글꼴 역할](font-roles.md#기본-서체-pretendard-불러오기필수) |
| `fontFamily.code` | ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Cascadia Mono, Consolas, Liberation Mono, monospace | — (`--hjm-font-family-code` fallback) | `fontFamily.code` | 코드 |
| `fontWeight.regular` · `medium` · `semibold` · `bold` · `heavy` | 400 · 500 · 600 · 700 · 800 | `--hjm-font-weight-<이름>` | `fontWeight.<이름>` | Text `emphasis`: `regular` 400 · `medium` 500 · `strong` 500 (2026-10-17, 가장 강한 강조 = 제목 굵기). 컴포넌트 recipe는 제목 500, 큰 숫자(Statistic 값)·선택 상태 600을 쓰고 700·800은 브루탈리즘 프리셋 외에 쓰지 않는다 |
| `letterSpacing.tight` · `normal` · `wide` | -0.2 · 0 · 0.2 | — | `letterSpacing.<이름>` | 자간 조정이 필요한 제품 고유 글자. HJM 컴포넌트는 자간을 지정하지 않는다 |
| `numeric.tabular` · `proportional` | `tabular-nums` · `proportional-nums` | — | `numeric.<이름>` | 바뀌는 숫자(카운터·통계·날짜 칸)는 `tabular`로 폭을 고정 |
| `largeTextThreshold` | 1.6 | 루트 `data-large-text="true"` | `largeTextThreshold` | 글자 배율이 이 값 이상이면 큰 글자 배치로 바꾼다 |

Native는 `fonts="pretendard"`일 때 500을 `Pretendard-Medium`, 600을 `Pretendard-SemiBold` face로 그린다(`resolvePretendardNativeFace`).
`@hjmds/react-native/fonts`의 `hjmPretendardFonts`가 400~800 다섯 face를 모두 번들한다. Web은 Pretendard Variable 한 파일이 모든 굵기를 덮는다.

Native 경로의 `theme`은 `useHjmNativeTheme()`, 나머지 이름은 `@hjmds/design-contracts/foundations` import다.
Web 크기 변수는 `rem × --hjm-text-scale`이라 Provider의 `textScale`을 따른다.

## 근거

2026-10-17 사용자 결정: `label`은 폼 라벨·섹션 부제목이 본문 대비 약해 500으로 정하고
Web·Native 모두 기본으로 그린다. `heading.level1`·`level2`는 Pretendard 800이 큰 크기에서 무겁고 거칠어 700으로
낮췄다(제목 단계 3~5는 같은 날 600). 같은 날 두 번째 검토("굵기 좀더 줄여")에서 한 단계씩 더 낮춰 큰 제목 600,
제목 단계 500, 강조 `strong` 500이 됐다. Web CSS는 `--hjm-type-title-weight`·`--hjm-text-emphasis-*` 역할 변수로 같은 값을 읽는다.
브루탈리즘 프리셋은 강한 강조 프리셋이라 `typography.heading`(따라서 Heading level1~3) 굵기를 800으로 명시해 유지한다. 크기는 공통 단계를 따른다.

2026-10-17 사용자 결정("글자 너무 커", "큰 글자 정책은 없애"): 큰 글자 단계(display)를 폐지했다. HJM에서 가장 큰 글자는
`typography.heading` 24 / 줄 32다. 계기는 Native Storybook 서비스 소개 화면의 히어로 제목(level1 40)과 구획 제목(level2 32)이
화면에 비해 지나치게 컸던 것이다. `heading.level1`·`level2`의 40·32와 semibold 600 단계를 없애고 두 이름을 `level3`(24/32/500)과
같은 값으로 고정했다. 디자인 프로필도 이 상한을 넘는 글자 크기를 `RangeError`로 거부하므로 에디토리얼(56/42/30)·브루탈리즘(48/38/30)의
확대 크기도 함께 없앴다. 랜딩 대표 제목은 `level3`, 구획 제목은 `level4`, 카드 제목은 `level5`로 위계를 만든다.

## 쓰는 법

```tsx
// Web
import { Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";

<>
<Heading level="level3">{t("orders.title")}</Heading>
<Text as="p" variant="body" tone="muted">{t("orders.hint")}</Text>
</>
// 제품 고유 그림: .product-axis-label { font-size: var(--hjm-type-caption-size); line-height: var(--hjm-type-caption-line-height); }
```

```tsx
// Native
import { Text } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";

<>
<Heading level="level3">{t("orders.title")}</Heading>
<Text variant="body" tone="muted">{t("orders.hint")}</Text>
</>
```

## 하지 말 것

- `font-size: 15px`, `fontWeight: "900"`처럼 단계 밖 값을 쓰지 않는다.
- 24보다 큰 글자(히어로·큰 숫자·표지 제목)를 제품 CSS·StyleSheet로 만들지 않는다. 강조는 위계(level3 → level4 → level5)·굵기·여백으로 한다.
- 크기를 맞추려고 Heading의 `semanticLevel`을 바꾸지 않는다. 시각 크기는 `level`, 문서 구조는 `semanticLevel`이다.
- 글자 크기를 고정해 OS 글자 크기 설정을 막지 않는다(`allowFontScaling={false}`, px 고정 `font-size`).
- 줄 높이를 지워 글자를 겹치게 하지 않는다. 한국어 본문은 토큰 줄 높이를 그대로 쓴다.
- 제품 서체는 [글꼴 편집](typography-studio.md)으로 비교·라이선스를 확인한 뒤 제품이 소유한다. `--hjm-font-family-ui`를 재정의하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 단위 | rem(16px 기준) × `--hjm-text-scale` | dp. OS 글자 크기를 따르고, Provider `textScale`을 주면 HJM이 한 번만 곱한다 |
| 서체 | `--hjm-font-family-ui` 목록 | 중립 기본 stack은 OS 서체, 프로필의 역할별 stack은 첫 named font |
| 큰 글자 판정 | 루트 `data-large-text` | `isLargeTextScale(environment.textScale)` |

### 디자인 프로필

기본 프로필은 1.15.0, 후속 글자·토큰 소비 개선은 1.16.0부터 제공한다.

위 표는 프로필 없는 기본값이다. 앱이 [디자인 프로필](../../design-profile.md)을 선택하면 연결된
컴포넌트는 Web CSS 변수 또는 Native `theme.tokens`/semantic palette를 읽는다.
직접 foundations를 import한 값은 기본 상수이므로 프로필 변경을 따라가지 않는다. 현재 연결 API의 범위는
프로필 계약에서 확인하고 앱 CSS로 내부 값을 덮지 않는다.


Heading의 시각 단계는 `defineHjmDesignProfile({ tokens: { heading: ... } })`로
일괄 지정한다. 어느 단계도 `typography.heading` 24를 넘을 수 없다. Web `--hjm-heading-size/line-height/weight`, Native Heading의 Text
metrics로 연결된다. 해당 heading을 담은 Provider에서 가장 가까운 profile을 읽는다.
level1/2/3은 typography heading, level4/5는 titleLarge/title override를 기본으로 병합하며
명시적인 heading 값이 우선한다. 문서의 h1~h6 순서는 `semanticLevel`이 소유한다.

제목·본문에 서로 다른 글꼴이 필요하면 [표시·읽기·기술 글자](font-roles.md)를 사용한다.
기존 ui/code-only 설정은 유지되며 optional display/reading은 1.16.0부터 제공한다.
