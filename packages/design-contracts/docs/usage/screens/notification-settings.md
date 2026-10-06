# 알림 설정

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/web/src/patterns/NotificationSettings.stories.tsx`, `showcase/native/src/NotificationSettings.stories.tsx`, `src/component-recipes.ts`(`topBarRecipe`·`bottomCtaRecipe`·`sectionRecipe`·`switchRecipe`), `src/container.ts`, `src/responsive.ts`(`resolveWindowClass`), `packages/react/src/styles.css`(`.hjm-top-bar`·`.hjm-bottom-cta`)
- 스토리북: `배포/화면/설정/알림 설정`

## 목적

알림 종류 몇 개를 스위치로 켜고 끈 뒤 하단 버튼 하나로 저장하는 설정 화면이다. 상단 바 · 읽기 폭 본문 · 하단 행동 바의
세 층으로 된 화면 골격의 기준 예다. 스위치를 바꾸는 즉시 서버에 반영하는 설정이면 하단 저장 바를 빼고 각 Switch의
`onCheckedChange`에서 저장한다.

## 영역 구조

```text
좁은 폭(Native·모바일 Web) — 상단·하단 바 고정, 본문만 스크롤
┌ 상단 안전 영역(TopBar safeAreaTop, Web은 env()와 큰 값) ┐
│ ① TopBar            알림 설정                │  최소 높이 52, 좌우 spacing.md 16 (고정)
├──────────────────────────────────────────────┤  ↕ spacing.lg 20
│ ② Container reading (최대 720,                │ ─ 스크롤 ─
│    좌우 gutter: 폭<600 compact 16 · 이상 20)  │
│   Section                                    │
│   필요한 소식만 받아요        ← title          │  title-description spacing.xxs 4
│   원하는 알림을 골라 주세요…  ← description    │  머리-내용 spacing.xs 8
│   ┌────────────────────────────────────────┐ │
│   │ 내 활동 알림                  (●──)    │ │  Switch presentation=row
│   │ 댓글과 답글이 도착하면…                │ │  라벨 왼쪽, 스위치 끝
│   │            ↕ spacing.md 16             │ │
│   │ 주간 모아보기                 (──○)    │ │
│   │ 일주일의 소식을 한 번에…               │ │
│   └────────────────────────────────────────┘ │
│   ┌ Notice success(저장 후) · danger(실패) ┐ │
│   └────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤  ↕ 20
│ ③ BottomCTA  (위 테두리 1 + 위쪽 그림자)      │  최소 높이 64 (고정)
│   선택한 알림만 보내드릴게요.  ← description   │  caption, muted
│   [         이 설정으로 저장하기          ]   │  ← 주 행동, 폭 전체
└ 하단 안전 영역(BottomCTA safeAreaBottom) ────┘
```

넓은 폭 Web: TopBar와 BottomCTA는 화면 폭 전체, 본문만 Container `reading`으로 가운데 720 폭에 묶인다.

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web `main` > `Stack gap="lg"` > TopBar · Container · BottomCTA `position="sticky"`, 문서 스크롤 · Native `View`(`flex: 1`) > TopBar · `ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}` > Container · BottomCTA | 화면 전체. 본문만 스크롤하고 하단 바는 고정(Web TopBar는 고정 prop이 없어 문서와 함께 움직이며, 고정하려면 제품 레이아웃이 맡는다) | 세 층 사이 `spacing.lg` 20(Web Stack gap, Native ScrollView 위아래 여백). 좌우 여백은 Container gutter. 안전 영역: 위는 TopBar `safeAreaTop`, 아래는 BottomCTA `safeAreaBottom`(Native는 기기 inset을 넘긴다, 기본 0). 키보드 입력이 없어 키보드 처리는 없다 |
| ① 상단 바 | TopBar `title` | 맨 위 | 최소 높이 52(`control.buttonHeight.large`), 좌우 `spacing.md` 16, 슬롯 사이 `spacing.xs` 8, 양 끝 슬롯 최소 44 |
| ② 본문 | Container `size="reading"` `gutter={gutter}` > Section `title` `description` > Stack `gap="md"` > Switch `presentation="row"` ×n, 그 아래 Notice | 상단 바 아래, 스크롤 | 최대 폭 720(`layout.readingMaxWidth`), 좌우 gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`layout.pagePadding`), 스위치 사이 `spacing.md` 16, 트랙 52×32 |
| ③ 하단 행동 | BottomCTA `description` `primaryAction` | 맨 아래 고정. Web `position="sticky"`(`inset-block-end: 0`, `z-index: var(--hjm-layer-sticky)`), Native는 `ScrollView` 바깥 | 최소 높이 64, 위아래 `spacing.sm` 12 + 안전 영역(`max(safeAreaBottom, spacing.sm 12)`), 좌우 `layout.pagePadding.regular` 20, 설명-버튼 `spacing.sm` 12 |

gutter는 창 폭으로 고른다: `resolveWindowClass(width) === "compact" ? "compact" : "regular"`([화면 여백과 너비](../tokens/layout.md)).
상단·스크롤 본문·하단 행동은 별도 영역으로 둔다. 목록이 길어져도 저장 행동이 본문과 함께 밀려나지 않는다.

```text
Native 고정 배치
┌ TopBar safeAreaTop={insets.top} ─────┐  고정
├ ScrollView paddingVertical 20 ───────┤
│  Container > Section > Switch …      │  스크롤
├ BottomCTA safeAreaBottom={insets.bottom} ┤  고정
└──────────────────────────────────────┘
```

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 저장(주 행동) | BottomCTA `primaryAction`(primary, 폭 전체) | 화면 맨 아래 바 | 1. 저장 중 `loading`, 저장 뒤에는 라벨을 `t("settings.saved")`로 바꾸고 `disabled` |
| 보조 행동 | BottomCTA `secondaryAction`(기본 `secondary`) | 같은 바, 주 행동 앞(왼쪽) | 스토리에는 없음. 둘 다 있으면 [보조][주] 같은 폭으로 나뉜다 |
| 항목 켜기·끄기 | Switch `presentation="row"` 행 전체 | 본문 Section 안 | 항목 수만큼, 위→아래 |
| 다시 불러오기 | Notice `action` > Button `tone="secondary" size="small"` | 불러오기 실패 Notice 안 | 스토리에 없음. 1 |
| 뒤로 | TopBar `leading` | 상단 바 시작 끝 | 스토리에는 없음. 하위 설정 화면이면 1 |
| 파괴 행동 | — | — | 없음 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 스위치가 현재 값, 저장 버튼 활성 | 스위치 바꾸기, 저장 |
| 로딩 | 스토리에 없음. 첫 값을 불러오는 동안 Section 안 스위치 자리에 [Skeleton](../components/skeleton.md) `shape="text"`, 저장 버튼 `disabled`. 저장 중이면 `primaryAction`에 `loading`(누름을 막고 같은 자리에 스피너) | 기다림 |
| 빈 | 해당 없음(설정 항목은 항상 있다). 항목이 조건부면 Section 아래 안내 Text | — |
| 오류 | 스토리에 없음. **불러오기 실패**: 스위치 대신 [Notice](../components/notice.md) `tone="danger"` + `action` 다시 시도, 저장 버튼 `disabled`. **저장 실패**: Section 끝에 Notice `tone="danger"`(action 없음 — 다시 시도는 저장 버튼이 맡는다), 사용자가 고른 스위치 값을 그대로 두고 `loading`만 푼다. 문구는 네트워크 실패 `settings.error.offline`·서버 실패 `settings.error.server`로 나눈다. 다시 시도가 또 실패하면 같은 Notice가 같은 자리에 남고 문구만 갱신한다. Native는 `announcement="assertive"`(기본 `none`) | 다시 시도 / 다시 저장 |
| 저장됨 | Section 끝에 Notice `tone="success"`(제목 + 켜짐/꺼짐 요약). 버튼은 "저장했어요"로 바뀌고 비활성. Native Notice `announcement="polite"` | 스위치를 다시 바꾸면 저장 상태가 풀린다 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [TopBar](../components/top-bar.md) | ① 상단 바 |
| [Container](../components/container.md) | ② 읽기 폭 |
| [Section](../components/section.md) | ② 설정 묶음 제목·설명 |
| [Switch](../components/switch.md) | ② 항목 행 |
| [Notice](../components/notice.md) | 저장 결과·오류 |
| [Skeleton](../components/skeleton.md) | 첫 값 불러오기 |
| [BottomCTA](../components/bottom-cta.md) | ③ 하단 저장 |
| [Stack](../components/stack.md) | 세 층 사이, 스위치 목록 |
| [화면 여백과 너비](../tokens/layout.md) | `layout.readingMaxWidth`, `layout.pagePadding.compact`·`regular`, `resolveWindowClass` |
| [간격](../tokens/spacing.md) | `spacing.xxs`·`xs`·`sm`·`md`·`lg` |

## 코드 골격

설정 항목·문구는 제품 소유다. 문구 키는 상태→키 표로 고르고 템플릿 문자열로 만들지 않는다.

```tsx
// Web
import { TopBar } from "@hjmds/react/top-bar";
import { BottomCTA } from "@hjmds/react/bottom-cta";
import { Container, Stack, Section } from "@hjmds/react/layout";
import { Switch } from "@hjmds/react/selection";
import { Notice, Skeleton } from "@hjmds/react/feedback";
import { Button } from "@hjmds/react/actions";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const failureKey = { offline: "settings.error.offline", server: "settings.error.server" } as const;
const onOffKey = { on: "settings.on", off: "settings.off" } as const;

const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";
const summary = t("settings.saved.summary", {
  activity: t(onOffKey[activity ? "on" : "off"]),
  digest: t(onOffKey[digest ? "on" : "off"]),
});

<main><Stack gap="lg">
  <TopBar title={t("settings.notifications.title")} />
  <Container size="reading" gutter={gutter}>
    <Section title={t("settings.notifications.section")} description={t("settings.notifications.hint")}>
      {status === "loading" ? <Stack gap="md"><Skeleton shape="text" width="60%" /><Skeleton shape="text" width="40%" /></Stack> : null}
      {status === "loadFailed" && failure ? <Notice tone="danger" title={t(failureKey[failure])}
        action={<Button tone="secondary" size="small" onClick={reload}>{t("common.retry")}</Button>} /> : null}
      {status === "ready" ? <Stack gap="md">
        <Switch presentation="row" label={t("settings.activity")} description={t("settings.activity.hint")}
          checked={activity} onCheckedChange={v => { setActivity(v); setSaved(false); }} />
      </Stack> : null}
      {status === "ready" && failure ? <Notice tone="danger" title={t(failureKey[failure])} description={t("settings.error.kept")} /> : null}
      {saved ? <Notice tone="success" title={t("settings.saved.title")} description={summary} /> : null}
    </Section>
  </Container>
  <BottomCTA position="sticky" description={t("settings.cta.hint")}
    primaryAction={{ label: saved ? t("settings.saved") : t("settings.save"), onClick: save, loading: saving, disabled: saved || status !== "ready" }} />
</Stack></main>
```

```tsx
// Native — 상단·하단 바를 고정한 형태
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 제품 의존성
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { TopBar } from "@hjmds/react-native/top-bar";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { Container, Stack, Section } from "@hjmds/react-native/primitives";
import { Switch } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";

const failureKey = { offline: "settings.error.offline", server: "settings.error.server" } as const;
const insets = useSafeAreaInsets();
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<View style={{ flex: 1 }}>
  <TopBar title={t("settings.notifications.title")} safeAreaTop={insets.top} />
  <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
    <Container size="reading" gutter={gutter}>
      <Section title={t("settings.notifications.section")} description={t("settings.notifications.hint")}>
        <Stack gap="md">
          <Switch presentation="row" label={t("settings.activity")} description={t("settings.activity.hint")}
            checked={activity} onCheckedChange={v => { setActivity(v); setSaved(false); }} />
        </Stack>
        {failure ? <Notice announcement="assertive" tone="danger" title={t(failureKey[failure])} description={t("settings.error.kept")} /> : null}
        {saved ? <Notice announcement="polite" tone="success" title={t("settings.saved.title")} description={summary} /> : null}
      </Section>
    </Container>
  </ScrollView>
  <BottomCTA safeAreaBottom={insets.bottom} description={t("settings.cta.hint")}
    primaryAction={{ label: saved ? t("settings.saved") : t("settings.save"), onPress: save, loading: saving, disabled: saved }} />
</View>
```

`react-native-safe-area-context`는 HJM 의존성이 아니다. 제품이 쓰는 inset 출처를 넘긴다. Native 로딩·불러오기 실패는 Web과 같은
자리에 같은 컴포넌트를 둔다(Button은 `onPress`).

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자(글자 배율 ≥ 1.6, `largeTextThreshold`) | TopBar 제목이 둘째 줄로 내려가 시작 정렬된다. BottomCTA 버튼이 세로로 쌓이고 **주 행동이 위**(`column-reverse`). Switch 행은 설명이 좁은 열이 되지 않게 세로로 쌓인다 |
| 다크 | 테마 토큰만 쓴다. Switch 꺼짐 상태는 트랙·손잡이 테두리(`trackOffBorder`·`thumbOffBorder`)로 다크에서도 모양이 보인다 |
| 좁은 폭 | 폭 600 미만이면 Container gutter `compact` 16. Section 머리는 Web 640 이하에서 제목·행동을 세로로 쌓는다 |
| 넓은 폭 Web | 본문만 720 폭 가운데, 상단·하단 바는 전체 폭 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| Switch 기본 배치 | `inline`(행으로 쓰려면 `presentation="row"` 명시) | `row` |
| 하단 바 고정 | `position="sticky"` | prop 없음 — `ScrollView` 바깥에 둔다 |
| 안전 영역 | CSS `env(safe-area-inset-*)`와 `safeAreaTop`/`safeAreaBottom` 중 큰 값 | `safeAreaTop`/`safeAreaBottom`만(기본 0) |
| 저장·오류 알림 | Notice가 `role="status"` | Notice `announcement` 명시(기본 `none`): 저장됨 `polite`, 오류 `assertive` |
| 스토리 상태 | 기본·큰 글자(어두운 테마 스토리 없음) | 기본만 |

## 함정

- Native에서 `safeAreaBottom`을 넘기지 않으면 홈 인디케이터가 저장 버튼 위에 겹친다. 기본값은 0이다.
- 현재 스토리는 저장 요약 문구를 템플릿 문자열(`내 활동 ${…}`)로 조립한다. 제품은 위 코드처럼 켜짐/꺼짐 키 표와 보간 값을 쓴다.
