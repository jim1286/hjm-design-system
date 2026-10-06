# SegmentedControl

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [ToggleGroup 계약](../../toggle-group.md)(경계), `src/component-recipes.ts`(`segmentedControlRecipe`). 2026-10-06 사용자 승인으로 실험 `실험/컴포넌트/입력/카테고리 필터`를 `알약 모양`·`비활성` 스토리로 합쳐 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/컴포넌트/입력/버튼형 선택`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SegmentedControl` | 기본 | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | Web `readonly { value: string; label: ReactNode; disabled? }[]` · Native `readonly { value: Value; label: string; disabled?; leading?; renderLeading? }[]` | 필수 | 값이 비거나 중복이면 던진다 |
| `presentation` | `connected` · `pills` | `connected` | 연결된 보기 전환 / 독립된 카테고리 필터. `pills`는 미게시(1.12.1 이후) |
| `size` | `small` · `medium` | `medium` | 항목 최소 높이 36(+hitSlop 4) · 44 |
| `value` · `defaultValue` | 항목 값 | 첫 번째 활성 항목 | 선택 해제 상태는 없다 |
| `onValueChange` | Web `(value: string) => void` · Native `(value: Value) => void` | — | 다른 항목을 고를 때. `null`은 오지 않는다 |
| `label` | `string` | 필수 | 화면에 보이지 않는 접근성 이름. 보이는 제목은 바깥에 둔다 |
| `disabled` | `boolean` | `false` | 전체 비활성(Web은 fieldset 속성) |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 배치 |

Native는 글자 크기 160% 이상(`stackAtFontScale`)에서 항목을 세로로 쌓는다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 항목 최소 높이 `medium` 44 · `small` 36 + hitSlop 4. 항목 좌우 여백 `medium` `spacing.md` 16 · `small` `spacing.sm` 12(두 플랫폼. Web `small`은 `::after`로 위아래 4를 넓힌다) | `segmentedControlRecipe.sizes`, `.hjm-segmented__item` |
| 간격 | 트랙 안쪽 여백·항목 간격 `container.padding`·`gap` `spacing.xxs` 4. 트랙 모서리 `radius.lg` 16(테두리 1). 선택 항목 모서리 `radius.md` 12, 선택 테두리 2(`stroke.strong`). 아래 내용과 `layout.contentGap` 16 | `segmentedControlRecipe.container`·`item`, `.hjm-segmented__items` |
| 순서·정렬 | 항목은 같은 폭으로 나뉘고(Native `flex: 1`, Web `flex: 1 1 0`) 트랙은 부모 폭을 채운다. 전환할 내용 바로 위, 화면 좌우 여백(`layout.pagePadding`) 안 | Native `SegmentedControl`, `.hjm-segmented__item` |
| 고정·스크롤 | 고정되지 않는다. Web 항목은 글자보다 좁아지지 않아(`min-inline-size: max-content`) 넘치면 트랙이 가로 스크롤된다. Native는 스크롤하지 않는다 | `.hjm-segmented__items`(overflow-x) |
| 좁은 폭·큰 글자 | 항목을 세로로 쌓는다. Native는 글자 크기 160% 이상, Web은 provider `data-large-text` 또는 폭 11em 이하 | `segmentedControlRecipe.adaptive`, `largeTextThreshold` 1.6, `.hjm-segmented` @media |

```text
┌───────────────────────────────┐  트랙: radius.lg 16, padding 4 (Native)
│ ┌─────────┐                   │
│ │  주간   │    월간     연간   │  44 (medium), 같은 폭
│ └─────────┘                   │  선택 = focus 색 테두리
└───────────────────────────────┘
   gap layout.contentGap 16
[ 전환되는 내용 ]
```

## 꼭 지킬 것

- 라벨은 짧은 i18n 문구로 둔다. 한글 한 글자씩 줄바꿈될 만큼 길면 Select나 RadioGroup으로 바꾼다.
- 활성 항목이 하나도 없거나 `value`가 비거나 중복이면 렌더 중 오류를 던진다. Native는 controlled
  `value`가 비활성 항목이어도 `RangeError`다.
- 옛 Native `options` prop은 제거됐다. 넘기면 `TypeError`다([이관표](../../migration-native-legacy-removal.md)).
- 연결형의 선택 표시는 focus 색 테두리(ring), `pills`는 본문색 채움과 반전 글자다. 제품에서 선택 배경을 직접 덮지 않는다. 배치는 `layoutStyle`로 하고, Native `style`은
  deprecated(개발 모드 경고, 다음 major 제거)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 `label` 타입 | `ReactNode` | `string` |
| 항목 아이콘 | 없음 | `leading`, `renderLeading({ selected, disabled, color, size })` |
| 전체 비활성 | fieldset `disabled` 속성 | `disabled` |
| `name` | 있음(기본 자동 생성) | 없음 |
| 키보드 | 네이티브 radio 화살표 이동 | 해당 없음 |

### 카테고리 필터 표현(알약 모양)

2026-10-06 사용자가 여러 화면의 전체/장소/일상 선택을 함께 개편하도록 요청했다.
[Material의 필터 칩](https://developer.android.com/develop/ui/compose/components/chip)처럼 콘텐츠 범위를 선택하는 작은 표면에서 착안했다.
기존 단일 선택 계약을 재사용하고 버튼마다 별도 selected 상태를 조립하는 대안은 제외했다.

- `presentation="pills"`: 카테고리·작성자·기간처럼 같은 목록의 범위를 좁힐 때 쓴다.
- 터치 영역은 크기 옵션과 관계없이 최소 `control.minTouchTarget` 44, 안쪽 표면은 위아래 `spacing.xs` 8만큼 들어간다. 눈에 보이는 모양을 작게 해도 터치 영역을 줄이지 않는다.
- 좌우 `spacing.md` 16, 항목 사이 `spacing.xs` 8, 모서리 `radius.full`. 비선택은 `surfaceAlt`, 선택은 `content.body`/`canvas` 반전이다. 색은 제품 provider에서 따라온다.
- 항목은 내용 폭이며 좁아지면 줄바꿈한다. 2배 글자는 기존 접근성 규칙대로 세로로 쌓으며, 라벨 높이만큼 항목도 늘어난다.
- 그룹 이름은 `label`, 하나의 선택은 `value`/`onValueChange`. 복수 조건은 ToggleGroup, 화면 이동은 Tabs/Navigation을 쓴다.
- 예제의 전체 선택값도 실제 항목으로 넣는다. 선택된 항목을 다시 눌러도 선택을 해제하지 않는다.

```tsx
import { SegmentedControl } from "@hjmds/react/selection";
<SegmentedControl label={t("category.label")} presentation="pills"
  items={categories} value={category} onValueChange={setCategory} />
```

Native는 `@hjmds/react-native/inputs`에서 같은 prop을 사용한다. `presentation`은 게시 버전 1.12.1에 없다(미게시, 1.12.1 이후). 게시·소비 앱 반영 전에는 연결형을 쓴다.
스토리는 `버튼형 선택`의 `알약 모양`·`비활성`이다. 2026-10-06 사용자 승인으로 실험 `입력/카테고리 필터` 항목을 배포하면서 별도 공개 API가 아니라 이 표현이라 그 스토리로 합쳤다([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). Storybook 배포는 npm 게시가 아니다.
