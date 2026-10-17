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
| `typography.label` | 12 / 줄 18 / 600 | `--hjm-type-label-*` | `theme.tokens.typography.label` | 라벨·도움말·small 버튼 글자 |
| `typography.body` | 14 / 줄 20 / 400 | `--hjm-type-body-*` | `theme.tokens.typography.body` | 기본 본문·medium 버튼·필드 글자 |
| `typography.bodyLarge` | 16 / 줄 24 / 400 | `--hjm-type-body-large-*` | `theme.tokens.typography.bodyLarge` | 읽기용 긴 본문·large 버튼 글자 |
| `typography.title` | 18 / 줄 26 / 600 | `--hjm-type-title-*` | `theme.tokens.typography.title` | 카드 제목(`heading.level5`) |
| `typography.titleLarge` | 20 / 줄 28 / 600 | `--hjm-type-title-large-*` | `theme.tokens.typography.titleLarge` | 큰 구획 제목(`heading.level4`) |
| `typography.heading` | 24 / 줄 32 / 600 | `--hjm-type-heading-*` | `theme.tokens.typography.heading` | 화면의 가장 큰 제목 |

굵기 열은 토큰 원본값이다. 프로필 없는 Text는 기본 `emphasis="regular"`(400)를 사용하므로
variant만 지정해도 위 굵기가 자동 적용되는 것은 아니다. 프로필이 있으면 생략한 emphasis는
프로필의 variant 굵기를 읽고, 명시한 emphasis는 언제나 우선한다. Heading은 제목 단계의 굵기를 쓴다.

### 문서 제목 단계(`heading`, Heading `level`)

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `heading.level1` | 40 / 줄 48 / 800 | — | `heading.level1` | 랜딩·문서의 대표 제목 |
| `heading.level2` | 32 / 줄 40 / 800 | — | `heading.level2` | 긴 페이지의 큰 구획 제목 |
| `heading.level3` | = `typography.heading` 24 | `--hjm-type-heading-*` | `heading.level3` | 화면 제목 |
| `heading.level4` | = `typography.titleLarge` 20 | `--hjm-type-title-large-*` | `heading.level4` | 구획 제목 |
| `heading.level5` | = `typography.title` 18 | `--hjm-type-title-*` | `heading.level5` | 카드 제목 |

### 서체·굵기·자간·숫자

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `fontFamily.ui` | Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif | `--hjm-font-family-ui` | `fontFamily.ui` | 화면 글자. Native는 `fonts="pretendard"`일 때 굵기별 Pretendard face, 그 전에는 OS 서체. 불러오기는 [글꼴 역할](font-roles.md#기본-서체-pretendard-불러오기필수) |
| `fontFamily.code` | ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace | — (`--hjm-font-family-code` fallback) | `fontFamily.code` | 코드 |
| `fontWeight.regular` · `medium` · `semibold` · `bold` · `heavy` | 400 · 500 · 600 · 700 · 800 | `--hjm-font-weight-<이름>` | `fontWeight.<이름>` | Text `emphasis`: `regular` 400 · `medium` 600 · `strong` 700 |
| `letterSpacing.tight` · `normal` · `wide` | -0.2 · 0 · 0.2 | — | `letterSpacing.<이름>` | 자간 조정이 필요한 제품 고유 글자. HJM 컴포넌트는 자간을 지정하지 않는다 |
| `numeric.tabular` · `proportional` | `tabular-nums` · `proportional-nums` | — | `numeric.<이름>` | 바뀌는 숫자(카운터·통계·날짜 칸)는 `tabular`로 폭을 고정 |
| `largeTextThreshold` | 1.6 | 루트 `data-large-text="true"` | `largeTextThreshold` | 글자 배율이 이 값 이상이면 큰 글자 배치로 바꾼다 |

Native 경로의 `theme`은 `useHjmNativeTheme()`, 나머지 이름은 `@hjmds/design-contracts/foundations` import다.
Web 크기 변수는 `rem × --hjm-text-scale`이라 Provider의 `textScale`을 따른다.

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


Heading의 다섯 시각 단계는 `defineHjmDesignProfile({ tokens: { heading: ... } })`로
일괄 지정한다. Web `--hjm-heading-size/line-height/weight`, Native Heading의 Text
metrics로 연결된다. 해당 heading을 담은 Provider에서 가장 가까운 profile을 읽는다.
level3/4/5는 기존 typography heading/titleLarge/title override를 기본으로 병합하며
명시적인 heading 값이 우선한다. 문서의 h1~h6 순서는 `semanticLevel`이 소유한다.

제목·본문에 서로 다른 글꼴이 필요하면 [표시·읽기·기술 글자](font-roles.md)를 사용한다.
기존 ui/code-only 설정은 유지되며 optional display/reading은 1.16.0부터 제공한다.
