# 캐릭터와 시작 행동

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/component-recipes.ts` `emptyStateRecipe`, `packages/react/src/styles.css` `.hjm-empty-state`, `showcase/shared/stea-expressions.ts`, `showcase/{web/src/patterns,native/src}/stea-expression-previews.tsx`(`PixelEmptyState`, Native `Frame`), `src/container.ts`
- 스토리북: `배포/구성/피드백과 복구/캐릭터와 시작 행동`

## 언제 쓰나

아직 만든 것이 없는 첫 빈 화면에 제품 캐릭터를 움직여 보이고 첫 행동 하나로 이끌 때 쓴다. 검색 결과 0건이나 오류처럼
캐릭터가 어울리지 않는 빈 상태에는 쓰지 않고 기본 [EmptyState](../components/empty-state.md)만 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| EmptyState | 그림·제목·설명·행동 한 묶음 | [EmptyState](../components/empty-state.md) |
| 제품 캐릭터(스토리: 12×12 픽셀 스프라이트) | 장식 그림, 4프레임 220ms 반복 | 제품 소유 |
| Button `primary` | 첫 기록 남기기(시작 행동) | [Button](../components/button.md) |
| Button `ghost` | 움직임 멈추기/다시 움직이기 | [Button](../components/button.md) |
| Text `tone="muted"` 상태 문구 | 시작 행동 결과 | [Text](../components/text.md) |
| `ScrollView` + `Container`(Native) | 바깥 틀. 세로 스크롤·위아래 여백, 좌우 gutter | [Container](../components/container.md), [화면 여백과 너비](../tokens/layout.md) |

## 배치

```text
Native 화면(ScrollView, 위아래 spacing.lg 20) > Container gutter 16(폭 < 600) · 20(폭 ≥ 600)
┌──────── Stack gap spacing.md 16 ─────────┐
│ ┌──── EmptyState (가운데 정렬) ────────┐ │
│ │            ┌────────┐                │ │
│ │            │ 캐릭터 │ 96×96          │ │
│ │            └────────┘   ↕ spacing.xs 8│ │
│ │   아직 남긴 기록이 없어요  (제목)      │ │
│ │   말랑이가 첫 기록을 기다리고 있어요.  │ │
│ │        [ 첫 기록 남기기 ]  primary     │ │ ← 주 행동
│ └────────────────────────────────────────┘ │
│ [ 움직임 멈추기 ]  ghost                   │ ← 보조(멈춤 제어)
│ 상태 문구 (muted, live)                    │
└───────────────────────────────────────────┘
  고정 영역 없음. 안전 영역은 화면 골격이 맡는다
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 제품 화면 레이아웃(문서 스크롤). Native: `ScrollView` > `Container` | 이 구성은 바깥 폭·여백을 정하지 않는다(Web 스토리는 Stack만 그린다). Native는 `ScrollView` 안 [Container](../components/container.md)에 둔다. 입력이 없어 키보드 처리는 없다. 안전 영역은 화면 골격(내비게이션 헤더·탭 바)이 맡는다 | Native ScrollView 위아래 `spacing.lg` 20, Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`layout.pagePadding`) |
| 빈 상태 | EmptyState `density="regular"` | 본문 가운데 | 위아래 Web `spacing.xxl` 32 / Native `spacing.xxxl` 40, 좌우 `spacing.xl` 24, 슬롯 사이 `spacing.xs` 8 |
| 캐릭터 | Web `icon` / Native `illustration` | EmptyState 맨 위 | 96×96(12칸 × `spacing.xs` 8). Native는 `illustrationStyle`로 칸을 96에 맞춘다 |
| 시작 행동 | Button `primary` | EmptyState `action` | 높이 44, 하나만 |
| 멈춤 제어 | Button `ghost` | EmptyState 아래, 꽉 찬 폭(`Stack` 기본 `align="stretch"`) | 묶음 사이 `spacing.md` 16 |
| 상태 문구 | Text muted | 맨 아래. Web은 빈 `role="status"`를 늘 마운트, Native는 문구가 있을 때만 | `spacing.md` 16 |

## 흐름과 상태

1. 화면이 열리면 캐릭터가 220ms 간격 4프레임으로 반복한다.
2. "첫 기록 남기기"를 누르면 제품의 작성 화면으로 간다(스토리는 상태 문구만 보인다).
3. "움직임 멈추기"를 누르면 첫 프레임에서 멈추고 라벨이 "다시 움직이기"로 바뀐다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 캐릭터가 움직인다 | 캐릭터는 숨김, 제목·설명이 의미를 전한다 |
| 진행 중 | 시작 행동이 화면 이동이면 없다. 서버 요청(예: 첫 항목 생성)이면 primary `loading` | 포커스는 버튼 유지 |
| 실패 | 시작 행동이 서버 요청일 때 실패하면 상태 문구 자리에 실패 문구, primary는 다시 누를 수 있다. 빈 상태 자체를 불러오지 못한 경우는 이 구성이 아니라 오류 화면([Result](../components/result.md) failure)이다 | 상태 문구가 Web `role="status"`, Native live region으로 읽힌다 |
| 멈춤 | 첫 프레임 정지 | 멈춤 버튼 라벨이 바뀐다 |
| reduced motion | 타이머 없이 첫 프레임 | — |
| 탭 숨김(Web)·앱 배경(Native) | 타이머를 걸지 않는다 | — |
| 시작 행동 후 | 상태 문구 표시 | Web `role="status"`, Native `accessibilityLiveRegion` |
| 다크 | 캐릭터 색을 테마에서 고른다(Native 예: 외곽 `text`, 몸 `contentBrand`, 밝은 칸 `bg`) | — |

## 코드 골격

```tsx
// Web
import { EmptyState } from "@hjmds/react/feedback";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";

// 상태 → 문구 키
const statusKey = { idle: undefined, started: "records.empty.started", failed: "records.empty.startFailed" } as const;
const statusText = statusKey[startState];

<Stack gap="md">
  <EmptyState icon={<ProductMascot paused={paused} />} title={t("records.empty.title")}
    description={t("records.empty.description")}
    action={<Button loading={starting} onClick={startRecord}>{t("records.empty.start")}</Button>} />
  <Button tone="ghost" onClick={() => setPaused((v) => !v)}>
    {paused ? t("mascot.resume") : t("mascot.pause")}
  </Button>
  <Text role="status" tone="muted">{statusText ? t(statusText) : ""}</Text>
</Stack>;
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { EmptyState } from "@hjmds/react-native/feedback";
import { Button } from "@hjmds/react-native/actions";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";

const statusKey = { idle: undefined, started: "records.empty.started", failed: "records.empty.startFailed" } as const;
const statusText = statusKey[startState];
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container gutter={gutter}>
    <Stack gap="md">
      <EmptyState illustration={<ProductMascot paused={paused} />} illustrationStyle={{ width: 96, height: 96 }}
        title={t("records.empty.title")} description={t("records.empty.description")}
        action={<Button loading={starting} onPress={startRecord}>{t("records.empty.start")}</Button>} />
      <Button tone="ghost" onPress={() => setPaused((v) => !v)}>
        {paused ? t("mascot.resume") : t("mascot.pause")}
      </Button>
      {statusText ? <Text accessibilityLiveRegion="polite" tone="muted">{t(statusText)}</Text> : null}
    </Stack>
  </Container>
</ScrollView>;
```

캐릭터 그림·프레임·색 배정, 문구는 제품 소유다. 스토리의 픽셀 박쥐와 "말랑이"는 예시다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그림 슬롯 | `icon` | `illustration` + `illustrationStyle`(기본 칸이 아이콘 크기 `glyph.lg`라 캐릭터가 넘친다) |
| 세로 여백 | `.hjm-empty-state` `spacing.xxl` 32 | recipe `spacing.xxxl` 40 |
| 일시정지 감지 | `document.hidden` | `AppState` |
| 상태 문구 자리 | 빈 `role="status"`를 늘 마운트 | 문구가 있을 때만 마운트 |
| 바깥 틀 | 제품 화면 레이아웃(문서 스크롤) | `ScrollView` > `Container` |

## 함정

- 5초 넘게 반복되는 움직임에는 멈춤 제어를 둔다(WCAG 2.2.2). 스토리의 ghost 버튼이 그 자리다.
- 캐릭터에 접근성 이름을 붙이지 않는다. EmptyState가 그림을 장식으로 숨긴다.
- 현재 스토리의 시작 행동은 상태 문구만 바꾼다. 진행 중·실패 경로는 없다.
