# 내비게이션 바 비교

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [BottomNavigation](../../bottom-navigation.md), `src/component-recipes.ts` `bottomNavigationRecipe`, `packages/react/src/styles.css` `.hjm-bottom-navigation`, `showcase/shared/navigation-bar-references.ts`
- 스토리북: `배포/구성/비교와 검증/내비게이션 바 비교`

## 언제 쓰나

하단 탭에 목적지 이동과 별개의 행동(작성·전원·기록 추가)을 함께 둘지, 선택한 목적지를 어떻게 보여 줄지 고를 때 이 비교를 본다.
스토리는 BottomNavigation 하나를 `configuration`과 `primaryAction`만 바꿔 네 가지 동작으로 보여 준다.
열 가지 색·라벨은 참고 예시이고 동작은 네 가지뿐이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| BottomNavigation | 목적지 2~6개, 선택 상태, 배지 | [BottomNavigation](../components/bottom-navigation.md) |
| IconButton `tone="primary" size="large" shape="circle"` | `primaryAction`: 목적지가 아닌 행동 | [IconButton](../components/icon-button.md) |
| HjmProvider / HjmNativeProvider `brandPalette` | 막대 범위의 제품 색(스토리 색은 예시) | [DesignSystemProvider](../components/design-system-provider.md) |
| Button `secondary` `selected` | 스토리에서 참고 표현을 고르는 선택기(제품에는 필요 없음) | [Button](../components/button.md) |

## 배치

네 가지 동작과 고르는 기준이다.

| 동작 | `configuration` | `primaryAction` 위치 | 고를 때 |
| --- | --- | --- | --- |
| 중앙에서 작업 실행 | `presentation: "floating"`, `distribution: "center-gap"` | 막대 정중앙(목적지 사이 빈칸 위) | 생성이 앱의 핵심 행동이고 목적지가 짝수(2·4·6)일 때 |
| 탐색 옆에서 작업 실행 | `presentation: "capsule"`, `distribution: "equal"` | 캡슐 밖 끝 쪽, 캡슐과 `spacing.xs` 8 간격 | 행동이 목적지와 섞여 보이면 안 될 때, 목적지가 홀수일 때 |
| 선택한 목적지 이름 표시 | `presentation: "capsule"`, 행동 없음 | — | 아이콘만으로 목적지가 모호해 선택 항목의 이름을 보여야 할 때 |
| 사각 영역으로 현재 위치 표시 | `capsule` + 목록·항목 radius `lg` 16 | — | 둥근 캡슐이 제품 표현과 맞지 않을 때(radius 변경은 제품 스타일) |

```text
중앙에서 작업 실행 (floating + center-gap)         탐색 옆에서 작업 실행 (capsule)
┌──── 스크롤 본문 (하단 여백 = 막대 높이) ────┐     ┌───────────────────────────────────────┐
│ ...                                        │     │ ...                                   │
├──────── 고정 막대, outer 좌우 16 ──────────┤     ├───────────────────────────────────────┤
│ ╭───────────────────────────────────────╮ │     │ ╭─────────────────────────────╮ 8 (●) │
│ │ [홈] [공간]   (●)   [스토어] [전력]   │ │     │ │ [●홈 ] [달력] [통계] [기록] │   ↑   │
│ ╰──────── center gap 68 ────────────────╯ │     │ ╰───── radius full ───────────╯ 주 행동│
│              ↑ 주 행동 IconButton 52      │     │  선택 항목만 아이콘+이름(가로)         │
├──── 안전 영역 + spacing.xs 8 ─────────────┤     ├──── 안전 영역 + spacing.xs 8 ─────────┤
└────────────────────────────────────────────┘     └───────────────────────────────────────┘
  radius xl 24, 최대 폭 384                          최대 폭 480
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 문서 스크롤 본문(`Container`) + 화면 아래 고정 막대. Native: 화면 루트 세로 flex(`flex: 1`) — 위 `ScrollView`(flex 1) → `Container`, 아래 막대(탭 navigator의 tabBar 자리) | 막대는 스크롤하지 않는다. 하단 안전 영역은 막대가 받는다(Web `env(safe-area-inset-bottom)`, Native `safeAreaBottom`). 상단 안전 영역은 화면 header가 받는다. 키보드가 열리면 막대가 숨는다(`keyboardBehavior: "hide"` 기본) | 본문 좌우는 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20), Native `ScrollView` 위아래 `spacing.md` 16. Web 본문 하단 여백 = 잰 막대 높이(막대가 `position: fixed`라 내용이 아래로 들어간다) |
| 막대 | BottomNavigation | Web `position: fixed` 하단, Native는 제품 navigator가 하단에 둔다 | outer 위 `spacing.xs` 8, 좌우 `spacing.md` 16(floating·capsule), `bar`는 0 |
| 표면 | floating / capsule | 막대 가운데 | floating 최대 폭 384·radius `xl` 24, capsule 최대 폭 480·radius `full` |
| 항목 | 목적지 | 표면 안 균등 분배 | `compact` 최소 52×52·padding `spacing.xxs` 4, `regular` 56×64·padding `spacing.xs` 8 |
| 중앙 빈칸 | `center-gap` | 목적지 가운데 | `control.buttonHeight.large` 52 + `spacing.md` 16 = 68 |
| 주 행동 | IconButton | center-gap이면 정중앙, capsule이면 목록 뒤 끝 쪽 | `large` 지름 52, capsule 목록과 `spacing.xs` 8 |
| 하단 안전 영역 | — | 막대 아래 | Web `env(safe-area-inset-bottom)` + `spacing.xs` 8, Native `safeAreaBottom` |
| 스크롤 본문 | 제품 화면 | 막대 위 | Web은 하단 여백을 막대 높이만큼 제품이 둔다. Native는 막대가 flex 형제라 겹치지 않는다 |

capsule은 기본 크기에서 선택되지 않은 항목의 이름을 접는다. 큰 글자(계약 기준 1.5 이상)이거나 목적지가 5~6개면
모든 이름을 세로로 보인다. 접힌 항목도 접근성 이름은 유지된다.

## 흐름과 상태

1. 목적지를 누르면 `onActivate`로 이동 의도만 받는다. 선택은 제품 router가 확정해 `selectedKey`로 다시 넘긴다.
2. `primaryAction`을 누르면 작성 화면·시트를 연다. `selectedKey`는 바뀌지 않는다.
3. 같은 탭을 다시 누르면 Native는 `reason: "reselect"`로 오므로 목록 맨 위로 스크롤하는 데 쓴다.
4. 소프트 키보드가 열리면 기본(`keyboardBehavior: "hide"`)으로 막대를 숨긴다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 선택 목적지가 `content.brand` 아이콘·라벨, capsule은 `surfaceAccent` 배경 | Web `aria-current`, Native 선택 state |
| 진행 중 | — (막대는 즉시 바뀐다. 목적지 화면을 불러오는 동안의 로딩은 그 화면이 표시하고, 막대는 `selectedKey`가 바뀐 상태로 남는다) | — |
| 실패 | — (막대 자체는 실패하지 않는다. 목적지 화면의 불러오기 실패·재요청 실패는 그 화면의 [Result](../components/result.md)·[Notice](../components/notice.md)가 표시한다. `primaryAction`이 연 작성 화면의 저장 실패는 [저장과 재시도](action-recovery-save.md)를 따른다) | — |
| 배지 | 숫자 배지(`count`·`max`) | 배지 `accessibilityLabel`을 항목 이름과 함께 읽는다 |
| 키보드 열림 | 막대가 숨는다(`remain`이면 유지) | — |
| 큰 글자 | capsule의 모든 이름이 세로로 보인다 | 같다 |

## 코드 골격

```tsx
// Web
import { BottomNavigation } from "@hjmds/react/navigation";
import { IconButton } from "@hjmds/react/actions";
import { Container } from "@hjmds/react/layout";

<>
  {/* 막대가 position: fixed라 본문 끝이 가려진다. 잰 막대 높이만큼 아래 여백을 둔다. */}
  <main style={{ paddingBlockEnd: barHeight }}>
    <Container>{page}</Container>
  </main>
  <BottomNavigation ref={barRef}
    descriptor={{ accessibilityLabel: t("nav.main"), selectedKey: route, items }}
    configuration={{ presentation: "floating", density: "compact", distribution: "center-gap" }}
    getHref={(item) => routes[item.id]}
    renderLink={(props) => <Link {...props} />}
    renderIcon={renderGlyph}
    primaryAction={
      <IconButton label={t("post.create")} tone="primary" size="large" shape="circle" onClick={openComposer}>
        <PlusGlyph aria-hidden="true" />
      </IconButton>
    }
  />
</>
```

```tsx
// Native
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@hjmds/react-native/navigation";
import { IconButton } from "@hjmds/react-native/actions";
import { Container } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { colors, tokens } = useHjmNativeTheme();
const insets = useSafeAreaInsets();
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";

<View style={{ flex: 1 }}>
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: tokens.spacing.md }}>
    <Container gutter={gutter}>{page}</Container>
  </ScrollView>
  <BottomNavigation
    descriptor={{ accessibilityLabel: t("nav.main"), selectedKey: route, items }}
    configuration={{ presentation: "capsule", density: "compact", distribution: "equal" }}
    safeAreaBottom={insets.bottom}
    renderIcon={renderGlyph}
    onActivate={({ key }) => navigation.navigate(key)}
    primaryAction={
      <IconButton label={t("record.add")} tone="primary" size="large" shape="circle" onPress={openRecord}>
        <PlusGlyph color={colors.onPrimary} />
      </IconButton>
    }
  />
</View>
```

`route`·`items`·`routes`·`Link`·`renderGlyph`·`PlusGlyph`·`barRef`/`barHeight`(막대 높이 측정)·`navigation`은 제품 소유다.
탭 navigator를 쓰면 `View` 대신 navigator의 `tabBar`에 `BottomNavigation`을 넘기고 본문은 각 탭 화면이 그린다.

스토리의 참고 색(`accent`·`soft`), 아이콘 세트, 막대를 감싼 테두리 카드와 `padding-inline: 0`(320 폭 갤러리용) 덮어쓰기는
제품에 가져오지 않는다. 제품 색은 앱 루트 Provider의 `brandPalette`로 준다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | CSS `position: fixed`(스토리는 갤러리용으로 `relative`로 덮음), 본문 하단 여백은 제품 | 화면 루트 세로 flex의 마지막 자식 또는 navigator `tabBar` |
| 목적지 | 링크(`getHref` 필수, `renderLink`) | tab 역할 + `onActivate` 필수 |
| 사각 선택 표현 | 공개 축이 없다. 스토리는 CSS로 목록·항목 radius를 `lg`로 덮는다 | 공개 축이 없다. 스토리는 deprecated `listStyle={{ borderRadius: radius.lg }}`로 덮는다 |
| 행동 아이콘 색 | `currentColor` | `colors.onPrimary`를 직접 넘김 |

## 함정

- `center-gap`은 홀수 목적지에서, `capsule`과 함께 쓰면 오류다.
- 생성 행동을 목적지 항목으로 넣지 않는다. 선택 상태가 생성 화면으로 옮겨 가 탭 의미가 깨진다.
- "사각 영역으로 현재 위치 표시"는 `configuration` 축이 아니라 radius 덮어쓰기다. Native `listStyle`·`style`은 deprecated(다음 major에서 제거)라 제품에 옮기면 그때 깨진다. 필요하면 공개 축 추가를 먼저 요청한다.
- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
- 현재 스토리는 Native 막대에 deprecated `style={{ paddingHorizontal: 0 }}`를 준다(320 폭 갤러리용). 제품은 바깥 좌우 `spacing.md` 16을 그대로 둔다.
- 현재 스토리는 바깥 틀(본문 스크롤·하단 여백)이 없고 막대를 갤러리 카드 안에 둔다. 제품은 바깥 틀 행대로 둔다.
