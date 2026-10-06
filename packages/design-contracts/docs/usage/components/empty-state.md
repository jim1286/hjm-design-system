# EmptyState

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Result와의 경계](../../result.md#emptystate와의-경계), [ContentState 범위 축](../../content-state.md), recipe `emptyStateRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/상태와 알림/빈 상태`

## 언제 쓰나

목록이 비었거나 검색 결과가 0건이라 **아직 없음**을 알릴 때 쓴다. 조건이 바뀌면 다시 채워질 자리이고,
사용자는 그 화면에 머물며 필터를 바꾸거나 첫 항목을 만든다. 아이콘은 항상 중립색이고 상태 tone이 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 흐름이 끝남(결제 성공·실패 등) | [Result](result.md) |
| 불러오는 중 | [Skeleton](skeleton.md), [Spinner](spinner.md) |
| 화면은 그대로 두고 알릴 문제 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `EmptyState` | 기본 | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { EmptyState } from "@hjmds/react/feedback";

<EmptyState
  icon={<InboxGlyph />} // 제품 소유 아이콘
  title={t("inbox.empty.title")}
  description={t("inbox.empty.description")}
  action={<Button tone="secondary" onClick={compose}>{t("inbox.empty.compose")}</Button>}
/>
```

```tsx
// Native
import { Button } from "@hjmds/react-native/actions";
import { EmptyState } from "@hjmds/react-native/feedback";

<EmptyState
  illustration={<InboxGlyph />} // 제품 소유 아이콘
  title={t("inbox.empty.title")}
  description={t("inbox.empty.description")}
  action={<Button tone="secondary" onPress={compose}>{t("inbox.empty.compose")}</Button>}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `density` | `compact` · `regular` | `regular` | `compact`는 세로 여백이 작고 Native에서 남은 공간을 채우지 않는다 |
| `align`(Native) | `center` · `upper` | `center` | `upper`는 `regular`일 때 내용을 위쪽(1:3 여백)에 둔다 |
| `announcement`(Native) | `none` · `polite` · `assertive` | `none` | 상태가 바뀌어 빈 화면이 새로 나타날 때만 켠다 |
| `titleRole`(Native) | 접근성 role | `"header"` | Web은 항상 `role="status"`로 그린다 |
| `title` | Web `ReactNode`(필수) · Native `string` | — | — |
| `description` | Web `ReactNode` · Native `string` | — | — |
| `action` | `ReactNode`(Button 하나) | — | 콜백은 Button의 `onClick`·`onPress`가 갖는다 |
| Web `icon` · Native `illustration` | `ReactNode` | — | 장식, 접근성에서 숨김 |
| `layoutStyle` | 배치 전용 style | — | 루트 배치. Native `style`·`illustrationStyle`·`titleStyle`·`descriptionStyle`·`actionStyle`은 deprecated |

EmptyState 자체에는 콜백 prop이 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 그림 슬롯은 `glyph.lg`(28) 정사각형이다(Native `illustration` 상자 고정 크기). 세로 여백: `compact` `spacing.xl`(24). `regular` `spacing.xxxl`(40, 두 플랫폼) | `component-recipes.ts` `emptyStateRecipe`, `styles.css` `.hjm-empty-state` |
| 간격 | 항목 사이 간격 `spacing.xs`(8), 좌우 여백 `spacing.xl`(24) | `component-recipes.ts` `emptyStateRecipe` |
| 순서·정렬 | 위→아래 순서는 그림 → 제목 → 설명 → 행동이고 가운데 정렬이다. 행동은 Button 하나(`tone="secondary"` 또는 `primary`)를 내용 폭만큼 둔다 | `react-native/src/feedback.tsx` `EmptyState` |
| 고정·스크롤 | 비어 있는 목록·검색 결과 영역 **안**에 둔다. 위 TopBar·검색칸·필터는 그대로 남기고 그 아래 내용 영역만 EmptyState로 바꾼다. Native `regular`는 남은 높이를 채우고(`flexGrow: 1`) 세로 가운데에 놓는다. `align="upper"`는 위:아래 빈 공간을 1:3으로 나눠 내용이 위쪽에 온다. 화면 하단 고정 행동이 필요하면 [BottomCTA](bottom-cta.md)로 따로 둔다 | `react-native/src/feedback.tsx` `EmptyState` |
| 좁은 폭·큰 글자 | 카드·시트 안처럼 높이가 작은 자리는 `compact`(채우지 않음)를 쓴다 | `react-native/src/feedback.tsx` `EmptyState` |

```text
┌──────────────────────────┐
│ TopBar / 검색칸 (그대로)  │
├──────────────────────────┤
│                          │ ← flexGrow 1(upper: 위 1)
│          (그림)           │
│          제목             │  gap xs 8
│          설명             │
│        [첫 항목 만들기]    │
│                          │ ← (upper: 아래 3)
└──────────────────────────┘
```

## 꼭 지킬 것

- 제목·설명·행동 문구는 i18n 키로 넣는다. "검색 0건"과 "아직 만든 것 없음"은 다른 문구로 구분한다.
- 다음 행동이 있으면 `action`에 Button 하나를 둔다. 아이콘·일러스트는 장식이라 접근성에서 숨겨진다.
- Native는 `title`·`description`·`accessibilityLabel` 중 하나는 있어야 한다. 모두 없으면 `TypeError`를 던진다.
- 일러스트·아이콘 자산은 제품 소유다. 색은 recipe가 정하므로 슬롯 색을 덮지 않는다.
- 배치는 `layoutStyle`로 한다. Native 슬롯 style(`style`·`illustrationStyle`·`titleStyle`·`descriptionStyle`·`actionStyle`)은
  deprecated(개발 모드 1회 경고, 다음 major 제거)다 — 배치는 `layoutStyle`, 외형은 `density`·`align`으로 옮긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그림 슬롯 | `icon`(ReactNode) | `illustration`(ReactNode, 아이콘 크기 상자) |
| `title` | 필수, ReactNode | 선택, string |
| `description` | ReactNode | string |
| 정렬·알림 | 없음 | `align`, `announcement`, `accessibilityLabel`, `titleRole` |
| 배치 | `layoutStyle`(그 밖에 `className`과 div 속성) | `layoutStyle`(슬롯 style 다섯 개는 deprecated) |
