# ToggleGroup 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [ToggleGroup](../toggle-group.md), recipe `toggleGroupRecipe`(`src/toggle-group.ts`)

## 언제 쓰나

여러 개를 동시에 켜고 끄는 짧은 버튼 묶음에 쓴다. 굵게·기울임·밑줄 같은 서식 토글,
함께 거는 필터 몇 개가 여기에 속한다. 아무것도 켜지지 않은 상태도 유효한 값이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 여러 개 중 정확히 하나를 고름(어떤 화면을 볼지) | [SegmentedControl](segmented-control.md) |
| 목록 안에서 항목마다 줄·설명이 있는 다중 선택 | [CheckboxGroup](checkbox-group.md) |
| 단독 켜고 끄기 설정 | [Switch](switch.md), 토글 버튼 하나는 [Button](button.md) `selected` |
| 많은 필터를 칩으로 나열 | [Chip](chip.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ToggleGroup` | `@hjmds/react`, `/toggle-group` | `@hjmds/react-native`, `/toggle-group` | 기본 |

descriptor 타입과 helper는 `@hjmds/design-contracts/components/toggle-group`에 있다.

## 최소 사용 예

```tsx
// Web
import { ToggleGroup } from "@hjmds/react/toggle-group";

const descriptor = {
  accessibilityLabel: t("editor.format.group"),
  items: [
    { id: "bold", label: t("editor.format.bold") },
    { id: "italic", label: t("editor.format.italic") },
  ],
} as const;

<ToggleGroup descriptor={descriptor} pressedIds={formats} onPressedIdsChange={setFormats} />
```

```tsx
// Native
import { ToggleGroup } from "@hjmds/react-native/toggle-group";

<ToggleGroup descriptor={descriptor} pressedIds={formats} onPressedIdsChange={setFormats} size="small" />
```

## 축과 기본값

- 값은 `ReadonlySet<Id>`다. `pressedIds`+`onPressedIdsChange`(제어) 또는 `defaultPressedIds`(비제어).
- `size`: `small` · `medium`(기본). medium은 최소 높이 44.
- 항목은 `{ id, label, disabled? }`. `disabled` 항목은 켜지지 않고 눌림 집합에도 들어가지 않는다.
- `items`에서 사라진 id의 눌림 상태는 렌더 때 버려진다(`reconcileToggleGroupSelection`).

## 꼭 지킬 것

- `descriptor.accessibilityLabel`은 필수다. 묶음 이름이며 개별 버튼 라벨로 대신할 수 없다.
  비거나 `items`가 비었거나 id가 겹치면 렌더 중 예외가 난다.
- 라벨은 i18n 키로 넣고 짧게 둔다. 단일 선택 모드는 없다. 하나만 고르게 하려고 변환하지 않는다.
- 눌림 표시 색은 recipe(`idle`/`pressed`)가 소유한다. 상태는 Web `aria-pressed`, Native `selected`로
  알리므로 색만으로 상태를 바꿔 그리지 않는다.
- 꾸밈 수단은 Web `className`, Native `style`(묶음 컨테이너)뿐이다. 항목 모양은 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 컨테이너 | `role="group"` + `aria-label` | `View` + `accessibilityLabel`(role 없음) |
| 배치 | CSS(`hjm-toggle-group`) | 가로 `flexWrap: "wrap"` |
| 외부 꾸밈 | `className`, `ref` | `style` |
| 키보드 | 항목마다 tab stop(roving 없음) | 해당 없음 |
