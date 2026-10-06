# EffectSurface 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Composable decorative surfaces](../effect-surface.md), 별도 보조 기능(supplemental)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `EffectSurface` | `/effect-surface` | `/effect-surface` | 장식 배경 셸 |
| `EffectSurfaceDescriptor` (타입) | `@hjmds/design-contracts/effect-surface` | 같음 | 레이어·seed·강도·주기·색 |

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

`descriptor`는 생략할 수 있고(`{}`), 잘못된 값은 렌더 중 `TypeError`/`RangeError`를 던진다.

- `layers`: `mesh`·`glow`·`grain` 중 서로 다른 1~3개. 기본 `["mesh"]`.
- `intensity`: 0~1, 기본 `0.22`. `period`: 2~120초, 기본 `12`. `seed`: 빈 문자열 금지, 기본 `"hjm"`.
- `active`: 기본 `false`. 켤 때만 천천히 움직인다. reduced motion이면 provider 설정에 따라 멈춘다.
- `colors`: `ColorReference` 세 개. 기본 `themeColor("primary")`·`themeColor("contentBrand")`·`themeColor("surfaceAccent")`.

## 꼭 지킬 것

- 색은 `@hjmds/design-contracts/color-references`의 `themeColor`·`accentColor` 참조로 넘겨 제품 테마를 따르게 한다.
  hex를 하드코딩하거나 Showcase의 예시 색·seed를 제품 기본값으로 복사하지 않는다([테마](../theming.md)).
- 임의 브랜드 색·강도에서 글자 대비를 보장하지 않는다. 실제 조합을 확인하거나 중요한 글자·버튼은 불투명
  [Surface](surface.md) 위에 둔다.
- Native 화면·목록 소유자는 화면이 가려지거나 목록 창 밖이면 `visible={false}`를 넘긴다.
- `active`는 효과가 의미 있을 때만 켠다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 컨테이너 배치 | `className` | `style`(컨테이너 `View`) |
| 가시성 | IntersectionObserver·`document.hidden`로 자동 | `visible`(기본 `true`) + AppState |
| 그리기 | 인라인 SVG + WAAPI | `react-native-svg` + core `Animated` |
| 렌더 실패 | 애니메이션 생성 거부 시 정적 SVG 유지 | 장식만 제거하고 children은 유지(remount 전까지) |

## 함정

- Native의 장식 실패 대비(error boundary)는 **렌더 오류**만 잡는다. peer가 없어 모듈 해석이 실패하면 앱 번들 자체가
  깨진다. `tsc` 통과를 설치 확인으로 보지 않는다.
- descriptor 검증 오류는 대비 밖에 있어 그대로 던져진다. 값 범위를 지킨다.
