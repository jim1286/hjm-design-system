# Splitter

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Splitter](../../splitter.md), `src/splitter.ts`(`splitterRecipe`)
- 스토리북: `배포/컴포넌트/레이아웃/분할 영역 조절`

## 언제 쓰나

넓은 Web 화면에서 두 영역의 경계를 사용자가 드래그나 키보드로 옮겨 크기를 정할 때 쓴다.
파일 트리/편집기 폭, 목록/상세 폭처럼 사용자가 정한 크기가 다시 방문해도 남길 바라는 레이아웃이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 개발자가 정한 고정 비율의 나란한 배치 | [Grid](grid.md), [Stack](stack.md) |
| 옆에서 열고 닫는 보조 패널 | [SidePanel](side-panel.md), [Sidebar](sidebar.md) |
| 패널 접기(collapse), 분리선 여러 개 | 없음(계약이 넣지 않았다) |
| 범위 안의 값 하나 고르기 | [Slider](slider.md) |
| Native 화면 | 없음 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Splitter` | 기본 | `@hjmds/react`, `/splitter` | — |

## 최소 사용 예

```tsx
// Web
import { Splitter } from "@hjmds/react/splitter";

<Splitter
  label={t("editor.resizeTree")}
  min={15}
  max={60}
  step={5}
  value={treeWidth}
  onValueChange={setTreeWidth}
  onValueChangeEnd={persistTreeWidth}
  getValueText={(v) => t("editor.percent", { value: v })}
  primaryPane={<FileTree />}
  secondaryPane={<Editor />}
/>
```

Native: 없음.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label`·`min`·`max`·`primaryPane`·`secondaryPane` | — | — (필수) | — |
| `step` | `number` | `1` | — |
| `axis` | `horizontal` · `vertical` | `horizontal` | `horizontal`은 패널이 좌우로 나란하고 분리선이 세로, `vertical`은 위아래 |
| `value`/`defaultValue` | `number` | 둘 다 없으면 `min` | `primaryPane`이 값만큼, `secondaryPane`이 나머지를 차지한다 |
| `onValueChange` | `(value: number) => void` | — | 드래그 중 매번 |
| `onValueChangeEnd` | `(value: number) => void` | — | 드래그를 놓을 때와 값이 실제로 바뀐 키보드 step마다 한 번 |
| `getValueText` | `(value: number) => string` | — | 분리선의 `aria-valuetext`. 없으면 숫자만 읽힌다 |
| `disabled` | `boolean` | `false` | — |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치(margin·width·flex 계열·`alignSelf`) |
| `className`, `style` | `string`, `CSSProperties` | — | 루트에 붙는다. `style`과 `layoutStyle`이 겹치면 `layoutStyle`이 이긴다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `primaryPane`이 값만큼 고정 폭(`flex: 0 0`), `secondaryPane`이 나머지를 채운다. 분리선은 보이는 선 1(`stroke.default`, `border` 색), 잡는 영역 44(`control.minTouchTarget`) | `splitterRecipe.separator`, `styles.css` `.hjm-splitter*`, `react/src/splitter.tsx` |
| 간격 | 패널 사이 간격은 분리선의 44 영역이 대신하므로 패널에 따로 바깥 여백을 더하지 않는다 | `styles.css` `.hjm-splitter__separator` |
| 순서·정렬 | 넓은 Web 화면의 본문 영역을 둘로 나눈다. `horizontal`은 primary가 시작(왼쪽), `vertical`은 위 | `styles.css` `.hjm-splitter` |
| 고정·스크롤 | 두 패널은 각자 스크롤한다(`overflow: auto`). 부모가 높이를 정해야 세로 스크롤이 생긴다. 내용이 넘칠 때만 그 패널이 Tab 정지점(`tabIndex=0`)이 되어 키보드로 스크롤할 수 있고, 넘치지 않으면 정지점이 없다 | `styles.css` `.hjm-splitter__pane`, `splitter.tsx` `useScrollableTabStop` |
| 좁은 폭·큰 글자 | `min`은 좁은 쪽 패널 내용이 깨지지 않는 폭으로 정한다. 폭이 `breakpoint.medium`(600) 아래인 화면에서는 Splitter를 그리지 말고 [Stack](stack.md)으로 위아래로 쌓거나 한 패널만 보인다(HJM은 자동 전환하지 않는다) | `foundations.ts` `breakpoint` |

```text
axis="horizontal"(기본)
┌──────────────┬┬──────────────────────────┐
│ primaryPane  ││ secondaryPane            │
│ (값만큼 고정)││ (나머지, 각자 스크롤)     │
│              ││                          │
└──────────────┴┴──────────────────────────┘
               └┘ 분리선: 선 1 · 잡는 영역 44
```

## 꼭 지킬 것

- 크기 저장은 `onValueChangeEnd`에서 한다. 경계값에서 더 누른 키는 end를 보내지 않는다.
- `label`과 `getValueText`는 i18n 문구로 준다. 단위(%·px) 표현은 제품 소유다.
- 분리선 두께·44px hit target·핸들 모양은 HJM 소유다. 배치는 `layoutStyle`로 하고 분리선을 덮지 않는다.
- 좁은 화면(모바일 Web)에서 쓸지는 제품이 판단한다. 계약은 데스크톱 패턴으로 정의한다.

## 함정

- 키보드는 pane 축 방향키만 쓴다(가로면 좌/우, 세로면 위/아래). 다른 방향키와 PageUp/PageDown은 pane 콘텐츠의 것이다.
- 패널의 Tab 정지점은 넘침에 따라 생기고 사라진다(ResizeObserver·MutationObserver로 다시 잰다). 테스트에서 패널 `tabIndex`를 고정값으로 기대하지 않는다.
  패널에는 접근성 이름이 없다(이름 prop은 breaking 변경이라 두지 않았다, `splitter.tsx` 주석). 미게시(1.12.1 이후) 변경이며 1.12.1까지는 패널이 포커스를 받지 않았다.
- RTL에서는 ArrowLeft가 increment다. 드래그 거리도 같은 기준으로 잰다.
- primary pane 폭은 `value`가 아니라 `(value-min)/(max-min)` 비율로 그려진다. `value=min`이면 primary pane이 0%, `max`면 100%다.
  예를 들어 `min=15, max=60, value=30`은 33%로 그려진다. 원하는 실제 폭 범위에 맞춰 `min`/`max`를 정하고 화면에서 확인한다.
