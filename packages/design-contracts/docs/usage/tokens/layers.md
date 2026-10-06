# 겹침 순서

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [오버레이 스택](../../overlay-stack.md), `src/foundations.ts`(`layer`), `src/component-recipes.ts`(`toastRecipe.viewport.layer`·`tooltipRecipe.layer`), `packages/react/src/styles.css`, `packages/react-native/src/feedback.tsx`
- 스토리북: `배포/토큰/표면과 움직임/겹침 순서`

## 언제 쓰나

화면 위에 겹쳐 뜨는 것(고정 헤더·드롭다운·대화상자·툴팁·토스트)의 위아래 순서를 정할 때 쓴다. 값은 사이를 비워 둔
순서표다. 제품 고유 층은 두 토큰 사이 숫자를 쓰지 말고 같은 의미의 토큰을 고른다.

## 값

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `layer.base` | 0 | `--hjm-layer-base` | `layer.base` | 일반 문서 흐름 |
| `layer.sticky` | 100 | `--hjm-layer-sticky` | `layer.sticky` | 스크롤해도 붙어 있는 헤더·탭·하단 바 |
| `layer.dropdown` | 400 | `--hjm-layer-dropdown` | `layer.dropdown` | 입력에 붙어 열리는 목록·메뉴 |
| `layer.overlay` | 800 | `--hjm-layer-overlay` | `layer.overlay` | 화면을 덮는 배경막(scrim)·패널 |
| `layer.modal` | 900 | `--hjm-layer-modal` | `layer.modal` | 대화상자·시트 본체 |
| `layer.tooltip` | 950 | `--hjm-layer-tooltip` | `layer.tooltip` | 툴팁(`tooltipRecipe.layer`) |
| `layer.toast` | 1000 | `--hjm-layer-toast` | `layer.toast` | 토스트. 기본 modal·tooltip 위(`toastRecipe.viewport.layer`, Native는 `zIndex`·`elevation`으로 쓴다) |

순서는 아래→위로 `base < sticky < dropdown < overlay < modal < tooltip < toast`다. Native 경로의 `layer`는
`@hjmds/design-contracts/foundations` import다.

## 쓰는 법

```tsx
// Web
import { layer } from "@hjmds/design-contracts/foundations";

<header style={{ position: "sticky", insetBlockStart: 0, zIndex: layer.sticky }}>{topBar}</header>
```

```tsx
// Native
import { View } from "react-native";
import { layer } from "@hjmds/design-contracts/foundations";

<View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: layer.sticky, elevation: layer.sticky }}>{banner}</View>
```

대화상자·시트·토스트는 HJM 컴포넌트가 층을 정하므로 제품이 zIndex를 주지 않는다([Dialog](../components/dialog.md),
[Sheet](../components/sheet.md), [Toast](../components/toast.md)).

## 하지 말 것

- `z-index: 9999`처럼 순서표 밖 값을 쓰지 않는다. 가장 위가 필요하면 그것이 토스트인지부터 확인한다.
- 제품 헤더를 `layer.modal` 이상으로 올리지 않는다. 대화상자 배경막 위로 헤더가 떠서 닫기 전 조작이 가능해진다.
- 겹침 순서로 포커스 순서를 대신하지 않는다. 모달의 포커스 가두기는 컴포넌트가 맡는다.
- 1.12.1의 옛 숫자(700·800·1000 등)를 기준으로 맞춘 제품 `z-index`를 그대로 두지 않는다. 예를 들어 500인 제품 헤더는 예전엔
  메뉴(800·900) 아래였지만 이제 메뉴(400)를 덮고, 950인 배너는 대화상자(1000) 아래였지만 이제 대화상자(900)를 덮는다.
  제품 층은 숫자를 베끼지 말고 `var(--hjm-layer-sticky)`(메뉴가 덮어야 하는 제품 chrome), `var(--hjm-layer-dropdown)`보다 낮은 값(본문 위 떠 있는 내용),
  `var(--hjm-layer-toast)`보다 높은 값(모든 HJM 층을 덮어야 하는 것만)처럼 토큰 기준으로 적는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| HJM 컴포넌트가 쓰는 값 | FAB·BottomNavigation·sticky CTA는 `layer.sticky`, 목록·메뉴·Popover는 `layer.dropdown`, Dialog·Sheet는 `layer.modal + modalPriority`, Tooltip은 `layer.tooltip`, Toast는 `layer.toast`. 모달 내부 popup은 소유 모달 + 1 | Toast는 `layer.toast` 1000. Dialog·Sheet·Select는 RN `Modal`로 창 위에 뜬다 |
| 제품 고정 헤더 | `layer.sticky` 100이면 HJM 오버레이 아래에 있다 | `layer.sticky`, Android는 `elevation`도 같은 값 |

2026-10-06 후속 검수에서 Web의 별도 500–1400 순서표가 공통 토큰과 어긋나는 것을 확인해 토큰을 직접 소비하도록 바꿨다. 모달 내부 메뉴는 소유 모달보다 한 단계 위에 있어야 입력할 수 있으므로 +1 관계를 유지한다. 건너뛰기 링크는 키보드 초점 시 토스트에 가려지지 않게 `layer.toast + 1`을 쓴다. 이들은 새 독립 토큰이 아닌 소유·접근성 관계다.

### Web 표면별 실제 값

1.12.1까지 Web은 토큰과 다른 500–1400 숫자를 직접 썼다. 아래 값은 미게시(1.12.1 이후) 변경이며
`.changeset/shared-layer-elevation-consumption.md`가 이전 값을 함께 적는다. HJM 층끼리의 상대 순서는 Popover를 빼면 그대로다.

| Web 표면 | 토큰 | 값 | 1.12.1 값 |
| --- | --- | --- | --- |
| BottomCTA(`data-position="sticky"`), FloatingActionButton, BottomNavigation | `layer.sticky` | 100 | 1 · 500 · 700 |
| Select·Combobox 목록, DatePicker 팝오버, `useAnchoredPopup` 기본값, Menu, Menubar 패널, Mentions 목록, Popover | `layer.dropdown` | 400 | 800 · 900 · 950(Popover) |
| Dialog·AlertDialog·Sheet·SidePanel 배경막, ContextMenu, CommandPalette, Tour 배경막 | `layer.modal + modalPriority`(`getModalLayer`) | 900 + priority | 1000 + priority |
| Tour 팝업, 모달 안에서 열린 popup | 소유 모달 + 1 | 901 | 1001 |
| Tooltip | `layer.tooltip` | 950 | 1100 |
| Toast 영역 | `layer.toast` | 1000 | 1200 |
| SkipNav, Layout 건너뛰기 링크 | `layer.toast + 1` | 1001 | 1300 · 1400 |

Popover는 이제 메뉴와 같은 `dropdown` 층이다. 메뉴에서 연 Popover는 나중에 portal되므로 메뉴 위에 그려진다.

### `modalPriority` 기준

`getModalLayer(priority) = layer.modal + priority`다. 기준이 1000에서 900으로 내려와 문턱도 함께 내려왔다.

| 이 우선순위부터 | 모달이 덮는 것 | 1.12.1 문턱 |
| --- | --- | --- |
| 51 | Tooltip(950) | 101 |
| 101 | Toast(1000) | 201 |
| 102 | 건너뛰기 링크(1001) | 401 |

`modalPriority`는 모달 스택 내부 순서 조정 용도이며 제품이 전역 층을 바꾸는 우회로로 쓰지 않는다. 50을 넘는 값을 쓰는
제품은 위 문턱으로 다시 확인한다. 컨트롤 내부 장식의 0/1/2는 로컬 쌓임이며 전역 층 토큰과 구분한다.
