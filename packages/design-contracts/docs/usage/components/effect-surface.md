# EffectSurface

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Composable decorative surfaces](../../effect-surface.md), 별도 보조 기능(supplemental)
- 스토리북: `배포/컴포넌트/시각 효과/배경 시각 효과`

## 언제 쓰나

환영·온보딩·빈 히어로처럼 분위기를 주는 배경이 필요할 때 내용 뒤에 장식 레이어(mesh·glow·grain)를
깐다. 장식은 포커스·터치·접근성 이름을 갖지 않고, 내용은 일반 레이아웃에 그대로 남는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 일반 카드·패널 면 | [Surface](surface.md), [Card](card.md) |
| 실제 작업(생성·분석) 진행 표시 | [ThinkingOrb](thinking-orb.md) |
| 성공 순간의 축하 효과 | [Celebration](celebration.md) |
| 로딩 자리 표시 | [Skeleton](skeleton.md), [Spinner](spinner.md) |
| 목록의 여러 행마다 움직이는 배경 | 쓰지 않는다(동시에 움직이는 행을 늘리지 않는다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `EffectSurface` | 기본 — 장식 배경 셸 | `/effect-surface` | `/effect-surface` |
| `EffectSurfaceDescriptor` (타입) | 보조 — 레이어·seed·강도·주기·색 | `@hjmds/design-contracts/effect-surface` | 같음 |

루트에서는 import 할 수 없다. granular subpath만 쓴다.

**Native는 optional peer `react-native-svg`(정확히 `15.15.5`)가 앱에 설치돼 있어야 한다.**
`/effect-surface`가 이 모듈을 파일 최상단에서 import 하므로, 없으면 tsc·단위 테스트는 통과하고 기기 Metro
번들에서 `Unable to resolve module`로 크래시한다(2026-10 utilverse 사고, celebration·qr-code·thinking-orb·
toast-liquid도 같은 유형). 쓰기 전에 앱 `package.json`에 peer가 있는지 확인한다. 움직임은 core `Animated`라
Reanimated·Skia는 필요 없다. Web은 추가 peer가 없다(SVG·WAAPI).

## 최소 사용 예

```tsx
// Web
import { EffectSurface } from "@hjmds/react/effect-surface";

<EffectSurface descriptor={{ layers: ["mesh", "grain"], seed: "welcome", active: true }}>
  <WelcomeContent />
</EffectSurface>
```

```tsx
// Native
import { EffectSurface } from "@hjmds/react-native/effect-surface";

<EffectSurface descriptor={{ layers: ["mesh", "grain"], seed: "welcome", active: true }} visible={isFocused}>
  <WelcomeContent />
</EffectSurface>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor.layers` | `mesh` · `glow` · `grain` · `noise` · `ruled` | `["mesh"]` | 서로 다른 1~4개. ruled는 1.15.0 이후 미게시 실험 |
| `descriptor.ruledSpacing` | 유한한 8~128 host units | `24` | ruled의 1unit 선 간격. 텍스트 baseline과 독립적이며 모션 밖 정적 레이어 |
| `descriptor.intensity` | 0~1 | `0.22` | — |
| `descriptor.period` | 2~120초 | `12` | — |
| `descriptor.seed` | 문자열 | `"hjm"` | 빈 문자열 금지 |
| `descriptor.active` | `true` · `false` | `false` | 켤 때만 천천히 움직인다. reduced motion이면 provider 설정에 따라 멈춘다 |
| `descriptor.colors` | `ColorReference` 세 개 | `themeColor("primary")` · `themeColor("contentBrand")` · `themeColor("surfaceAccent")` | — |

| `children` | `ReactNode` | — (필수) | 일반 레이아웃 내용 |
| Native `visible` | `boolean` | `true` | 화면·목록 소유자가 가려짐을 알린다. `false`면 장식이 멈춘다 |
| Web `layoutStyle` | 배치 전용 style | — | 루트 배치 |
| Native `style` | `StyleProp<ViewStyle>` | — | 컨테이너 `View`. 정식 motion host 프레임이라 deprecated 대상이 아니다 |

- 콜백 prop은 없다. `descriptor`는 생략할 수 있고(`{}`), 잘못된 값은 렌더 중 `TypeError`/`RangeError`를 던진다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | EffectSurface는 여백을 갖지 않는다. 크기는 children이 정하고 장식 레이어가 그 영역 전체(`absolute`, inset 0)를 덮는다. 넘치는 장식은 잘린다(`overflow: hidden`). 배경은 테마 `bg`다. 높이를 늘리려면 children 높이, Web `layoutStyle`·Native `style`의 높이로 정한다. 장식 레이어는 배치에 참여하지 않는다 | `react/src/effect-surface.tsx`, `react-native/src/effect-surface.tsx` |
| 간격 | 내용 여백·간격은 children 쪽 [Stack](stack.md) 등으로 준다 | `react/src/effect-surface.tsx` |
| 순서·정렬 | children은 일반 레이아웃이다. [Stack](stack.md)으로 eyebrow → [Heading](heading.md) → 소개 → [Button](button.md)을 쌓는다(Showcase 랜딩 예는 `gap="lg"` 20, Heading `level1`) | `showcase/web/src/patterns/Landing.stories.tsx` |
| 고정·스크롤 | 화면 위쪽 히어로 하나에만 둔다. 같은 화면에 여러 개를 겹치거나 목록 행마다 두지 않는다 | — |
| 좁은 폭·큰 글자 | — | — |

```text
┌────────────────────────────┐ ← EffectSurface(배경 bg + mesh/glow/grain, 터치 없음)
│  eyebrow                   │
│  큰 제목(Heading level1)    │ ← children: 일반 레이아웃(Stack gap lg 20)
│  소개 문장                  │
│  [시작하기]  primary        │
└────────────────────────────┘
```

## 꼭 지킬 것

- 색은 `@hjmds/design-contracts/color-references`의 `themeColor`·`accentColor` 참조로 넘겨 제품 테마를 따르게 한다.
  hex를 하드코딩하거나 Showcase의 예시 색·seed를 제품 기본값으로 복사하지 않는다([테마](../../theming.md)).
- 임의 브랜드 색·강도에서 글자 대비를 보장하지 않는다. 실제 조합을 확인하거나 중요한 글자·버튼은 불투명
  [Surface](surface.md) 위에 둔다.
- Native 화면·목록 소유자는 화면이 가려지거나 목록 창 밖이면 `visible={false}`를 넘긴다.
- `active`는 효과가 의미 있을 때만 켠다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 컨테이너 배치 | `layoutStyle`(그 밖에 `className`) | `style`(컨테이너 `View`, `layoutStyle` 없음) |
| 가시성 | IntersectionObserver·`document.hidden`로 자동 | `visible`(기본 `true`) + AppState |
| 그리기 | 인라인 SVG + WAAPI | `react-native-svg` + core `Animated` |
| 렌더 실패 | 애니메이션 생성 거부 시 정적 SVG 유지 | 장식만 제거하고 children은 유지(remount 전까지) |

## 함정

- Native의 장식 실패 대비(error boundary)는 **렌더 오류**만 잡는다. peer가 없어 모듈 해석이 실패하면 앱 번들 자체가
  깨진다. `tsc` 통과를 설치 확인으로 보지 않는다.
- descriptor 검증 오류는 대비 밖에 있어 그대로 던져진다. 값 범위를 지킨다.

`noise`의 구현 차이·실험 조건은 [질감 비교](../compositions/texture-comparison.md)를 따른다. 기존 grain을 교체하지 않는다.

`ruled`의 profile 상속/override와 입력 보존은 [종이 줄무늬 비교](../compositions/paper-surface.md)를 따른다.
ruled-only descriptor는 active=true여도 애니메이션을 시작하지 않는다. 테이프·찢어진 경계·본문 회전은 제공하지 않는다.
