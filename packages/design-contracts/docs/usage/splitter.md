# Splitter 사용 지침

적용: `@hjmds/react` 1.12.1 (Web 전용, Native unsupported) · 검토일: 2026-10-06 ·
계약: [Splitter](../splitter.md), recipe `splitterRecipe`

## 언제 쓰나

넓은 Web 화면에서 두 영역의 경계를 사용자가 드래그나 키보드로 옮겨 크기를 정할 때 쓴다.
파일 트리/편집기 폭, 목록/상세 폭처럼 사용자가 정한 크기가 다시 방문해도 남길 바라는 레이아웃이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 개발자가 정한 고정 비율의 나란한 배치 | [Grid](grid.md), [Stack](stack.md) |
| 목록과 상세를 화면 폭에 따라 전환 | [ListDetailScreen](list-detail-screen.md) |
| 옆에서 열고 닫는 보조 패널 | [SidePanel](side-panel.md), [Sidebar](sidebar.md) |
| 패널 접기(collapse), 분리선 여러 개 | 없음(계약이 넣지 않았다) |
| 범위 안의 값 하나 고르기 | [Slider](slider.md) |
| Native 화면 | 없음 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Splitter` | `@hjmds/react`, `/splitter` | 없음 | 기본 |

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

Native renderer는 없다.

## 축과 기본값

- `label`·`min`·`max`·`primaryPane`·`secondaryPane`이 필수다. `step` 기본 1.
- `axis`: `horizontal`(기본, 패널이 좌우로 나란하고 분리선은 세로) · `vertical`(위아래).
- `value`/`defaultValue`, 둘 다 없으면 `min`. `primaryPane`이 값만큼, `secondaryPane`이 나머지를 차지한다.
- `onValueChange`는 드래그 중 매번, `onValueChangeEnd`는 드래그를 놓을 때와 값이 실제로 바뀐 키보드 step마다 한 번 온다.
- `disabled` 기본 `false`. `className`, `style`은 루트에 붙는다.

## 꼭 지킬 것

- 크기 저장은 `onValueChangeEnd`에서 한다. 경계값에서 더 누른 키는 end를 보내지 않는다.
- `label`과 `getValueText`는 i18n 문구로 준다. 단위(%·px) 표현은 제품 소유다.
- 분리선 두께·44px hit target·핸들 모양은 HJM 소유다. `style`로 루트 배치만 하고 분리선을 덮지 않는다.
- 좁은 화면(모바일 Web)에서 쓸지는 제품이 판단한다. 계약은 데스크톱 패턴으로 정의한다.

## 함정

- 키보드는 pane 축 방향키만 쓴다(가로면 좌/우, 세로면 위/아래). 다른 방향키와 PageUp/PageDown은 pane 콘텐츠의 것이다.
- RTL에서는 ArrowLeft가 increment다. 드래그 거리도 같은 기준으로 잰다.
- primary pane 폭은 `value`가 아니라 `(value-min)/(max-min)` 비율로 그려진다. `value=min`이면 primary pane이 0%, `max`면 100%다.
  예를 들어 `min=15, max=60, value=30`은 33%로 그려진다. 원하는 실제 폭 범위에 맞춰 `min`/`max`를 정하고 화면에서 확인한다.
