# SegmentedControl 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `segmentedControlRecipe`(`src/component-recipes.ts`), 경계: [ToggleGroup 계약](../toggle-group.md)

## 언제 쓰나

2~4개의 짧은 보기 중 **항상 하나가 선택된** 전환에 쓴다. 같은 화면의 목록·기간·보기 방식을
바꾸는 필터(오늘/이번 주/이번 달, 목록/지도)가 전형이다. 선택하면 곧바로 화면이 바뀐다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 선택 없음이 가능하거나, 항목마다 설명이 필요한 폼 질문 | [RadioGroup](radio-group.md) |
| 선택지가 많거나 라벨이 길다 | [Select](select.md) |
| 여러 개를 동시에 켠다 | [ToggleGroup](toggle-group.md) |
| 서로 다른 콘텐츠 패널 사이를 이동 | [Tabs](tabs.md) |
| 단일 행동 | [Button](button.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SegmentedControl` | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` | 기본 |

## 최소 사용 예

```tsx
// Web
import { SegmentedControl } from "@hjmds/react/selection";

<SegmentedControl
  label={t("stats.range.label")}
  items={[
    { value: "week", label: t("stats.range.week") },
    { value: "month", label: t("stats.range.month") },
  ]}
  value={range}
  onValueChange={setRange}
/>
```

```tsx
// Native
import { SegmentedControl } from "@hjmds/react-native/inputs";

<SegmentedControl
  label={t("stats.range.label")}
  items={[
    { value: "week", label: t("stats.range.week") },
    { value: "month", label: t("stats.range.month") },
  ]}
  value={range}
  onValueChange={setRange}
/>
```

## 축과 기본값

- `size`: `small` · `medium`(기본).
- `value`/`defaultValue`가 없으면 첫 번째 활성 항목이 선택된다. 선택 해제 상태는 없다.
- `label`(필수, `string`)은 화면에 보이지 않는 접근성 이름이다. 보이는 제목이 필요하면 바깥에 둔다.
- Native는 글자 크기 160% 이상(`stackAtFontScale`)에서 항목을 세로로 쌓는다.

## 꼭 지킬 것

- 라벨은 짧은 i18n 문구로 둔다. 한글 한 글자씩 줄바꿈될 만큼 길면 Select나 RadioGroup으로 바꾼다.
- 활성 항목이 하나도 없거나 `value`가 비거나 중복이면 렌더 중 오류를 던진다. Native는 controlled
  `value`가 비활성 항목이어도 `RangeError`다.
- 옛 Native `options` prop은 제거됐다. 넘기면 `TypeError`다([이관표](../migration-native-legacy-removal.md)).
- 선택 표시는 focus 색 테두리(ring)다. 제품 색으로 선택 배경을 칠하지 않는다. Native `style`은 배치에만 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 `label` 타입 | `ReactNode` | `string` |
| 항목 아이콘 | 없음 | `leading`, `renderLeading` |
| 전체 비활성 | fieldset `disabled` 속성 | `disabled` |
| `name` | 있음(기본 자동 생성) | 없음 |
| 키보드 | 네이티브 radio 화살표 이동 | 해당 없음 |
