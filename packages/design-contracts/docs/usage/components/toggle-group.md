# ToggleGroup

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [ToggleGroup](../../toggle-group.md), `src/toggle-group.ts`(`toggleGroupRecipe`)
- 스토리북: `배포/컴포넌트/입력/토글 그룹`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ToggleGroup` | 기본 | `@hjmds/react`, `/toggle-group` | `@hjmds/react-native`, `/toggle-group` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `pressedIds` / `defaultPressedIds` | `ReadonlySet<Id>` | 빈 집합 | 제어 또는 비제어 |
| `onPressedIdsChange` | `(ids: ReadonlySet<Id>) => void` | — | 다음 눌림 집합 전체를 받는다 |
| `descriptor` | `{ accessibilityLabel: string, items: readonly { id, label, disabled? }[] }` | — (필수) | — |
| `size` | `small` · `medium` | `medium` | medium은 최소 높이 44 |
| `items[].disabled` | `boolean` | `false` | `disabled` 항목은 켜지지 않고 눌림 집합에도 들어가지 않는다. 사라진 id의 눌림 상태는 렌더 때 버려진다(`reconcileToggleGroupSelection`) |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 묶음 컨테이너 배치. Web·Native 모두 |
| `style`(Native) | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle` 또는 `size`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 항목 높이는 두 size 모두 최소 44(`control.minTouchTarget`). 좌우 여백 `small` `spacing.sm` 12, `medium` `spacing.md` 16, 모서리 `radius.md` 12 | `toggleGroupRecipe.sizes`·`radius` |
| 간격 | 항목 사이 `spacing.xxs` 4 | `toggleGroupRecipe.gap` |
| 순서·정렬 | `items` 배열 순서 그대로, 시작 쪽(왼쪽)에 붙는다. 편집 도구 줄·필터 줄처럼 적용될 내용 바로 위에 가로로 놓는다 | `.hjm-toggle-group`, `react-native/src/toggle-group.tsx` |
| 고정·스크롤 | 가로 스크롤로 바꾸지 않는다 | — |
| 좁은 폭·큰 글자 | 폭이 모자라면 다음 줄로 넘어간다(Web·Native 모두 wrap) | `.hjm-toggle-group`(`flex-wrap`), `react-native/src/toggle-group.tsx` |

## 꼭 지킬 것

- `descriptor.accessibilityLabel`은 필수다. 묶음 이름이며 개별 버튼 라벨로 대신할 수 없다.
  비거나 `items`가 비었거나 id가 겹치면 렌더 중 예외가 난다.
- 라벨은 i18n 키로 넣고 짧게 둔다. 단일 선택 모드는 없다. 하나만 고르게 하려고 변환하지 않는다.
- 눌림 표시 색은 recipe(`idle`/`pressed`)가 소유한다. 상태는 Web `aria-pressed`, Native `selected`로
  알리므로 색만으로 상태를 바꿔 그리지 않는다.
- 배치는 `layoutStyle`(묶음 컨테이너)로 한다. Web `className`·Native의 deprecated `style`로 항목 모양을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 컨테이너 | `role="group"` + `aria-label` | `View` + `accessibilityLabel`(role 없음) |
| 배치 | CSS(`hjm-toggle-group`) | 가로 `flexWrap: "wrap"` |
| 외부 꾸밈 | `className`, `ref`, `layoutStyle` | `layoutStyle`(`style`은 deprecated) |
| 키보드 | 항목마다 tab stop(roving 없음) | 해당 없음 |

### 제품 테마의 모서리

2026-10-07 테마 소비 점검에서 양 renderer가 숫자로 확정된 recipe 모서리를 읽어
제품 profile을 무시했다. profile이 있으면 가장 가까운 Provider의 `tokens.radius.md`를
사용하고 없으면 기존 `toggleGroupRecipe.radius` 12를 유지한다. 새 style prop이나
별도 토글 엔진을 추가하지 않는다. 중첩 Provider에서 별도 profile을 생략하면 상속하며,
명시적인 neutral profile은 중립 모서리로 돌아간다. 테마 변경은 눌린 항목·비활성·초점을 초기화하지 않는다.
