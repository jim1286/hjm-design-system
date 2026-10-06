# ScreenLayout

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/화면 틀과 도구/화면 골격과 상태`

## 언제 쓰나

한 라우트 화면의 뼈대가 필요할 때 쓴다. 제목·뒤로 가기 슬롯·도구, 안내(notice), 본문,
하단 행동을 한 화면으로 배치하고, 화면 전체의 로딩·빈 상태·오류·접근 제한을 본문 자리에서 교체한다.
데이터 조회·권한 판단·라우팅은 제품 소유다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 앱 전체 navigation·sidebar 셸 | [Layout](layout.md) |
| 상단 제목 막대만 필요 | [TopBar](top-bar.md) |
| 하단 고정 주 행동만 필요 | [BottomCTA](bottom-cta.md) |
| 설정·검색·알림·채팅 화면 | [SettingsScreen](settings-screen.md), [SearchScreen](search-screen.md), [NotificationInboxScreen](notification-inbox-screen.md), [ChatScreen](chat-screen.md) |
| 로그인 화면 | [AuthScreenLayout](auth-screen-layout.md) |
| 흐름이 끝난 결과 화면 | 본문에 [Result](result.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ScreenLayout` | supplemental. root에서는 내보내지 않는다 | `/screens` | `/screens` |

## 최소 사용 예

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { BottomCTA } from "@hjmds/react/bottom-cta";
import { ScreenLayout } from "@hjmds/react/screens";

<ScreenLayout
  title={t("saved.title")}
  leading={<IconButton label={t("common.back")} onClick={goBack}><BackGlyph /></IconButton>}
  state={isLoading ? { kind: "loading", title: t("saved.loading") } : { kind: "ready" }}
  footer={<BottomCTA primaryAction={{ label: t("saved.add"), onClick: add }} />}
>
  <SavedList items={items} />
</ScreenLayout>
```

```tsx
// Native — FlatList 본문은 scroll="content"
import { FlatList } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { ScreenLayout } from "@hjmds/react-native/screens";

<ScreenLayout
  title={t("saved.title")}
  scroll="content"
  state={error ? { kind: "error", title: t("saved.error") } : { kind: "ready" }}
  stateAction={<Button onPress={refetch}>{t("common.retry")}</Button>}
>
  <FlatList data={items} renderItem={renderItem} />
</ScreenLayout>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `title` | `string` | 필수 | 화면 제목. `header`를 주면 접근성 이름으로만 쓴다 |
| `header` | `ReactNode` | 없음 | 기존 navigator 헤더 유지용. 주면 기본 헤더(`leading`·제목·`description`·`actions`)를 그리지 않는다 |
| `description` | `string` | 없음 | 제목 아래 muted 설명 |
| `leading` · `actions` | `ReactNode` | 없음 | 제목 앞(뒤로 가기)·뒤(도구) 슬롯 |
| `notice` | `ReactNode` | 없음 | 헤더 아래 비차단 안내. 상태 교체 중에도 남는다 |
| `footer` | `ReactNode` | 없음 | 하단 고정 행동 |
| `state` | `{ kind: "ready" }` · `{ kind: "loading" \| "empty" \| "error" \| "restricted"; title; description? }` | `{ kind: "ready" }` | ready가 아니면 children을 그리지 않고 상태와 `stateAction`을 가운데에 놓는다. 로딩은 Spinner 하나만 보이고 `title`·`description`은 Spinner의 접근성 이름이 된다 |
| `stateAction` | `ReactNode` | 없음 | 상태 안내 아래 행동(재시도 등) |
| `scroll` | `"screen"` · `"content"` | `"screen"` | `content`는 본문 자식(가상화 목록)이 스크롤을 소유한다. 상태 교체 중에는 `screen`으로 돌아간다 |
| `contentInset` | `"default"` · `"none"` | `"default"` | `none`은 헤더·notice·본문·footer padding을 0으로(Native는 footer 위 테두리도 뺀다) |
| `as` (Web) | `"main"` · `"section"` | `"main"` | 제품 셸에 이미 `<main>`이 있으면 `section` |
| `layoutStyle` | `HjmCompositionStyleProp` | 없음 | 화면 루트 배치 전용(예: 분할 화면의 `flex`·`width`). ScreenLayout 위에 만든 화면은 모두 이 prop을 루트까지 넘긴다 |
| `className` (Web) | `string` | 없음 | 식별·배치 보조. 색·여백을 덮지 않는다 |
| `testID` · `scrollRef` · `scrollProps` (Native) | `string` · `Ref<ScrollView>` · `refreshControl`·`keyboardDismissMode`·스크롤 막대 표시 | 없음 | ScrollView가 있을 때(`scroll="screen"` 또는 상태 교체 중)만 `scrollRef`·`scrollProps`가 연결된다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭 100%, 최대 `screenPatternRecipe.maxWidth`(`layout.readingMaxWidth` 720), 가운데 정렬; 높이는 host가 준 남은 높이(Web `block-size: 100%`, Native `flex: 1`) | Web `.hjm-screen`, Native `ScreenLayout` |
| 간격 | 바깥 padding `screenPatternRecipe.padding`(`spacing.md` 16)을 헤더 사방·notice 좌우·본문 사방·footer 사방에 준다(`contentInset="none"`이면 0); 헤더 안 `leading`·제목·`actions` 간격 `itemGap`(`spacing.sm`) 12(두 플랫폼, `contentInset="none"`이어도 유지); 상태 안내는 위아래 `sectionGap`(`spacing.xl`) 24, 안내–`stateAction` `stateGap`(`spacing.md`) 16 | Web `src/screens.tsx`(`--hjm-screen-item-gap`·`--hjm-screen-state-gap`)·`.hjm-screen__*`, Native `ScreenLayout` |
| 순서·정렬 | 헤더(`leading` → 제목·설명 → `actions`) → notice → 본문 → footer; 상태 안내는 본문 세로 가운데 | 렌더 순서 |
| 고정·스크롤 | 헤더·notice·footer 고정, `scroll="screen"`은 본문이 스크롤, `"content"`는 자식이 스크롤; footer 위 테두리 1, Web은 하단 safe area만큼 padding을 늘린다 | Web `data-scroll`·`.hjm-screen__footer`, Native `ScrollView` |
| 좁은 폭·큰 글자 | 제목 열 최소 폭 `headerMinWidth` 120 × 글자 배율, 모자라면 `actions`가 다음 줄로 내려간다; 제목은 줄바꿈(`overflow-wrap: anywhere`)되고 자르지 않는다; Native safe area·탭바 inset은 host | `screenPatternRecipe.headerMinWidth`, Web `.hjm-screen__heading` |

## 꼭 지킬 것

- Web의 화면 스크롤 본문은 Tab으로 진입할 수 있다. `scroll="content"`의 정상 본문은 자식이 키보드 스크롤을 소유하지만, 오류·빈 상태 등 대체 안내는 화면 스크롤로 바뀌며 Tab 진입도 함께 복원된다.
- 가상화 목록(FlatList, VirtualList)을 넣으면 `scroll="content"`로 둔다. 스크롤을 이중으로 중첩하지 않는다.
- 새로고침 실패·저장 오류는 `state`를 바꾸지 말고 `ready` + `notice`로 알린다. `loading`으로 바꾸면 본문이
  unmount되어 입력 초안이 사라진다.
- `state.title`·문구는 i18n 키로 넣는다. ready 외 상태의 빈 `title`은 `TypeError`다.
- Web host는 실제 남은 높이(`height:100%` 등)를, Native host는 safe area·탭바 inset을 먼저 처리한다.
  HJM은 기종별 높이를 추측하지 않는다.
- 배치는 Web·Native 모두 `layoutStyle`로 한다(Web은 `className`도 있다). 색·여백을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 루트 | `<main>`(`as="section"` 가능), 제목과 연결 | `View`, 제목 `accessibilityRole="header"` |
| 상태 알림 | error는 `role="alert"`, 그 외 `status` | `accessibilityLiveRegion`(error assertive) |
| 스크롤 | CSS(`data-scroll`) | `ScrollView`(`keyboardShouldPersistTaps="handled"`) |
| 배치·식별 | `layoutStyle`, `className` | `layoutStyle`, `testID` |

## 함정

- 이미 `<main>`이 있는 제품 셸 안에서는 `as="section"`을 준다. 중첩 main이 생긴다.
