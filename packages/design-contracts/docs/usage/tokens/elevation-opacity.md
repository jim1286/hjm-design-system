# 그림자와 투명도

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: `src/foundations.ts`(`shadow`·`opacity`·`stateLayer`·`overlay`·`backdrop`·`scrim`), `src/component-contracts.ts`(`floatingSurfaceContract`), `src/component-recipes.ts`(`dialogRecipe`·`sheetRecipe`·`toastRecipe`·`bottomCtaRecipe`), `packages/react/src/theme.ts`, `packages/react/src/styles.css`, `packages/react-native/src/primitives.tsx`
- 스토리북: `배포/토큰/표면과 움직임/그림자와 투명도`

## 언제 쓰나

면이 다른 면 위에 떠 있음을 보일 때(그림자), 비활성·누름·끌기 상태를 흐리게 할 때(투명도), 상태 덧칠의 세기와
모달 뒤 배경막을 정할 때 쓴다. HJM은 층을 색 단계보다 테두리와 그림자로 나누므로(모든 Surface tone이 `bg`를 칠한다)
떠 있는 면이 필요하면 그림자 토큰을 고른다.

## 값

### 그림자

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `shadow.raised` | `#000000` 0.08 · radius 4 · offsetY 1 | `--hjm-shadow-raised` | `shadow.raised` | 바탕에서 살짝 뜬 면 |
| `shadow.floating` | `#000000` 0.12 · radius 12 · offsetY 4 | `--hjm-shadow-floating` | `shadow.floating` | 떠 있는 면: Dialog·Sheet·Toast·팝오버(`floatingSurfaceContract`), Surface `tone="raised"`(Web) |
| `shadow.overlay` | `#000000` 0.16 · radius 24 · offsetY 8 | `--hjm-shadow-overlay` | `shadow.overlay` | 화면 위에 가장 높이 뜬 면 |

Web 변수는 `0 <offsetY>px <radius>px rgb(0 0 0 / <opacity>%)` box-shadow 문자열이다(blur = radius).

### 투명도

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `opacity.disabled` | 0.5 | `--hjm-button-disabled-opacity`(Button) | `opacity.disabled` | 비활성 컨트롤 |
| `opacity.muted` | 0.72 | — | `opacity.muted` | 덜 중요한 내용(Calendar의 다른 달 날짜) |
| `opacity.pressed` | 0.86 | `--hjm-button-pressed-opacity`(Button) | `opacity.pressed` | 누르는 동안 |
| `opacity.dragged` | 0.64 | — | `opacity.dragged` | 끄는 중인 요소(Slider·Carousel·Toast 스와이프) |

### 상태 덧칠·배경막

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `stateLayer.hover` | 0.06 | — | `stateLayer.hover` | 마우스 올림 덧칠 세기(`interaction.hover`) |
| `stateLayer.focus` | 0.08 | — | `stateLayer.focus` | 포커스 덧칠 세기 |
| `stateLayer.pressed` | 0.1 | — | `stateLayer.pressed` | 누름 덧칠 세기 |
| `stateLayer.selected` | 0.1 | — | `stateLayer.selected` | 선택 덧칠 세기 |
| `overlay.scrim` · `backdrop.modal` | `#000000` 0.6 | `--hjm-backdrop-modal` | `backdrop.modal` · `scrim`(`rgba(0, 0, 0, 0.6)`) | Dialog·Sheet·Tour 뒤 배경막 |
| `overlay.veil` · `backdrop.veil` | `#000000` 0.25 | — | `backdrop.veil` | 화면을 가볍게 덮는 막 |

Native 경로의 이름은 `@hjmds/design-contracts/foundations` import다.

## 쓰는 법

```tsx
// Web
// 제품 고유 떠 있는 카드: .product-floating { box-shadow: var(--hjm-shadow-floating); }
import { Surface } from "@hjmds/react/layout";

<Surface tone="raised" padding="md">{children}</Surface>
```

```tsx
// Native
import { Pressable, View } from "react-native";
import { opacity, shadow } from "@hjmds/design-contracts/foundations";

const s = shadow.floating;
<View style={{ shadowColor: s.color, shadowOpacity: s.opacity, shadowRadius: s.radius, shadowOffset: { width: 0, height: s.offsetY }, elevation: 4 }} />;
<Pressable style={({ pressed }) => ({ opacity: pressed ? opacity.pressed : 1 })} onPress={open}>{tile}</Pressable>
```

## 하지 말 것

- 새 그림자(`0 2px 6px rgba(0,0,0,.2)`)를 만들지 않는다. 세 단계 중 고른다.
- 그림자를 겹쳐 층을 표현하지 않는다. 한 면에는 하나만 쓴다.
- 비활성을 투명도만으로 알리지 않는다. 컴포넌트 `disabled` prop을 써서 보조기기에도 알린다.
- 배경막 색·세기를 제품이 바꾸지 않는다. 모달은 HJM Dialog·Sheet가 배경막을 그린다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그림자 표현 | box-shadow 문자열(`--hjm-shadow-*`) | iOS `shadow*` 속성 + Android `elevation` |
| Surface `tone="raised"` | `--hjm-shadow-floating` | `shadow.floating` + `elevation` 4 |
| HJM 목록 팝업 그림자 | `--hjm-shadow-floating`(Select·Menubar·DatePicker·Menu·Popover) | Modal 기반 메뉴는 해당 플랫폼 표면 계약 |

2026-10-06 후속 검수에서 정의만 있던 Web 그림자 변수를 실제 떠 있는 표면에 연결했다. CommandPalette·Tour 같은 큰 강조 표면은 `shadow.overlay`, 일반 popup·Surface는 `shadow.floating`을 쓴다. Native Surface의 별도 blur 6도 floating token으로 맞췄다. 포커스 링·선택 테두리·스위치 손잡이의 inset 표현은 높이 그림자가 아니므로 각 컴포넌트 상태 계약을 유지한다.

### 디자인 프로필(실험·미게시)

위 표는 프로필 없는 기본값이다. 앱이 [디자인 프로필](../../design-profile.md)을 선택하면 연결된
컴포넌트는 Web CSS 변수 또는 Native `theme.tokens`/semantic palette를 읽는다.
직접 foundations를 import한 값은 기본 상수이므로 프로필 변경을 따라가지 않는다. 현재 연결 API의 범위는
프로필 계약에서 확인하고 앱 CSS로 내부 값을 덮지 않는다.
