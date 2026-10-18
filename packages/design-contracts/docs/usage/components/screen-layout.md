# ScreenLayout

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.17.1
- 검토일: 2026-10-17
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
import { BottomCTA } from "@hjmds/react/bottom-cta";
import { ScreenLayout } from "@hjmds/react/screens";

<ScreenLayout
  title={t("saved.title")}
  exit={{ kind: "back", label: t("common.back"), onClick: goBack }}
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
| `keyboardAvoidance` (Native) | `boolean` | `true`(미게시) | 키보드와 실제로 겹치는 만큼 footer·본문을 올리고 포커스된 입력칸을 스크롤해 보인다. `KeyboardAvoiding`·키보드 처리 Sheet/Dialog 안에서는 건너뛴다 |
| `title` | `string` | 필수 | 화면 제목. `header`를 주면 접근성 이름으로만 쓴다 |
| `titleVisibility` | `"visible"` · `"hidden"` | `"visible"` | 하단 탭·상단 탐색으로 이미 식별되는 최상위 화면명은 `hidden`. 대상·하위 작업 이름은 식별에 필요하고 본문과 중복되지 않을 때 유지. 기본값이나 뒤로가기 유무로 목적지를 추정하지 않으며 제품이 맥락에 맞게 선택한다. `title` 값은 유지한다 |
| `titleBadge` | `ReactNode` | 없음 | 기본 제목 바로 옆 배지. 값·의미는 제품, 간격·정렬은 HJM. `header` 교체 또는 제목 숨김이면 그리지 않는다. 1.23.0 추가 API |
| `titleLeading` | `ReactNode` | 없음 | 미게시(1.30.0 이후). 제목 앞 식별 표시(팀 로고·도구 아트워크). 장식이라 보조기술에서 숨기고 제목이 heading·접근성 이름으로 남는다. `titleVisibility="hidden"`이면 표시가 제목 자리에 혼자 서고 `title`을 이름으로 하는 heading(level 1)이 된다. 이때도 아이콘 전용 48 띠가 아니라 제목 띠 52를 쓴다. 노드 크기는 제품이 주되 헤더 띠 안에 들어가야 한다. `header` 교체 시 그리지 않는다. `ChatScreen`은 같은 자리를 `avatar`로 받는다 |
| `header` | `ReactNode` | 없음 | 기존 navigator 헤더 또는 HJM `TopBar` 합성. 상단 탐색은 `TopBar.leading`에 HJM 탐색 컨트롤, 도구는 `TopBar.actions`에 주어 한 행을 만든다. 주면 기본 헤더(`exit`·제목·`actions`)를 그리지 않으므로 뒤로가기·도구도 해당 TopBar에 연결한다. 앱 자체 헤더 복제용 슬롯이 아니다 |
| `description` | `string` | 없음 | 2026-10-18 사용자 결정으로 상단 보조 문구는 표시하지 않는다. 기존 호출의 타입 호환을 위해 prop만 유지하며 다음 major 정리에서 제거한다. 필요한 설명은 본문 콘텐츠에 둔다 |
| `exit` | `{ kind: "back" \| "close"; label; onClick(Web) \| onPress(Native); disabled? }` | 없음 | 화면 나가기(뒤로·닫기·"설정 나가기")를 헤더 시작 쪽 아이콘 버튼으로 고정한다. 글자는 보이지 않고 `label`은 보조기술 이름이다. `back`은 ‹(RTL 반전), `close`는 ×. 헤더 시작 쪽에는 이 버튼 외의 자유 슬롯이 없다. 미게시(1.26.1 이후) |
| `actions` | `ReactNode` | 없음 | 제목 뒤(도구) 슬롯. 시작 쪽 `leading` 슬롯은 2026-10-17 제거됐다 — 제품 사용처가 모두 직접 만든 뒤로 버튼이었다 |
| `notice` | `ReactNode` | 없음 | 헤더 아래 비차단 안내. 상태 교체 중에도 남는다 |
| `footer` | `ReactNode` | 없음 | 하단 고정 행동. footer가 위 경계·여백·safe area를 맡고, 안에 둔 [BottomCTA](bottom-cta.md)는 자기 바를 그리지 않고 설명·행동 줄만 그린다(2026-10-17, 경계 두 겹·버튼 이중 들여쓰기 수정) |
| `state` | `{ kind: "ready" }` · `{ kind: "loading" \| "empty" \| "error" \| "restricted"; title; description? }` | `{ kind: "ready" }` | ready가 아니면 children을 그리지 않고 상태와 `stateAction`을 가운데에 놓는다. 로딩은 Spinner 하나만 보이고 `title`·`description`은 Spinner의 접근성 이름이 된다 |
| `stateAction` | `ReactNode` | 없음 | 상태 안내 아래 행동(재시도 등) |
| `loadingIndicator` | `ReactNode` | 없음 | 미게시(1.30.0 이후). `state.kind === "loading"`일 때 Spinner 대신 그리는 브랜드 표시. 표시 자체는 보조기술에서 숨기고, `title`·`description`을 이름으로 하는 busy 상태(Web `role="status"`, Native `progressbar`)·가운데 배치·알림은 HJM이 맡는다. [CompositionLayout](composition-layout.md)의 같은 prop과 같은 계약 |
| `scroll` | `"screen"` · `"content"` | `"screen"` | `content`는 본문 자식(가상화 목록)이 스크롤을 소유한다. 상태 교체 중에는 `screen`으로 돌아간다 |
| `contentAlignment` | `"start"` · `"center"` | `"start"` | ready 본문을 사용 영역 중앙에 배치. 긴 본문은 위가 잘리지 않게 스크롤한다. 로그인/제품 안내를 가짜 query state로 바꾸지 않는다(1.24.0) |
| `surface` | `"default"` · `"transparent"` | `"default"` | 투명은 제품 host의 배경·wallpaper를 보존. 배경색 style 우회 대신 사용(1.24.0) |
| `contentInset` | `"default"` · `"none"` · `"body-edge"` | `"default"` | `none`은 헤더·notice·본문·footer padding을 0으로(Native는 footer 위 테두리도 뺀다). host가 모든 여백을 이미 줄 때 쓴다. `body-edge`는 헤더·notice·footer 여백(16)과 footer 테두리를 유지하고 **본문 좌우 padding만 0**으로 한다. 자기 좌우 여백을 가진 전체 폭 목록 행(ConversationRow·NotificationRow 등 행 padding 16)을 본문에 바로 둘 때 쓴다(미게시). ListRow·NotificationItem은 `default`에 둔다. `body-bleed`(미게시, 1.31.0 이후)는 같은 여백을 유지하고 **본문 네 방향 padding을 모두 0**으로 해 지도·캔버스가 헤더(또는 notice)·화면 좌우·footer에 바로 닿는다. footer가 없으면 본문이 마지막 영역이라 여백 16 없이 `safeAreaBottom`(Native)과 겹친 하단 탐색 높이만 비운다. 홈 인디케이터 아래까지 그리려면 `safeAreaBottom`을 넘기지 않는다. `body-edge`·`body-bleed`에서도 로딩·빈 상태·오류 안내 묶음은 자기 여백이 없으므로 좌우 16을 유지한다(1.32.0 수정). 값 목록은 계약 `ScreenContentInset`·`screenContentInsets` |
| `presentation` | `"dashboard"` · `"editorial"` · `"landscape"` | 가장 가까운 profile.screens.overview / 없으면 기존 골격 | [디자인 프로필](../../design-profile.md)의 제공 범위를 따른다. 명시값이 프로필을 이긴다. 헤더 배치·읽기 폭만 바꾸고 상태·입력·행동 슬롯은 유지한다 |
| `as` (Web) | `"main"` · `"section"` | `"main"` | 제품 셸에 이미 `<main>`이 있으면 `section` |
| `initialFocus` | `first-input` · `none` | `first-input` | 페이지 진입 시 입력 하나에 한 번 포커스한다. 기본값 변경은 1.33.0부터 제공. 하단 시트 안에서는 자동 포커스하지 않는다. 아래 [진입 포커스](#진입-포커스) |
| `safeAreaBottom` (Native) | 0 이상의 유한수 | `0`(미게시) | 화면이 닿는 창 아래 가장자리의 safe area(`useSafeAreaInsets().bottom`, 탭바 위·이미 아래를 들인 host 안이면 0). 마지막 영역(footer, 없으면 본문)이 아래 여백을 `max(16, inset)`으로 한 번만 준다. 넘길 때는 host의 아래 SafeAreaView edge를 빼고, 둘을 같이 쓰지 않는다. 음수·무한대는 `RangeError` |
| `layoutStyle` | `HjmCompositionStyleProp` | 없음 | 화면 루트 배치 전용(예: 분할 화면의 `flex`·`width`). ScreenLayout 위에 만든 화면은 모두 이 prop을 루트까지 넘긴다 |
| `className` (Web) | `string` | 없음 | 식별·배치 보조. 색·여백을 덮지 않는다 |
| `testID` · `scrollRef` · `scrollProps` (Native) | `string` · `Ref<ScrollView>` · `refreshControl`·`keyboardDismissMode`·스크롤 막대 표시·`onScroll`·`onScrollBeginDrag`·`onScrollEndDrag`·`scrollEventThrottle`·`alwaysBounceVertical`·`automaticallyAdjustKeyboardInsets` | 없음 | ScrollView가 있을 때(`scroll="screen"` 또는 상태 교체 중)만 `scrollRef`·`scrollProps`가 연결된다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭 100%, 최대 `screenPatternRecipe.maxWidth`(`layout.readingMaxWidth` 720), 가운데 정렬; 높이는 host가 준 남은 높이(Web `block-size: 100%`, Native `flex: 1`) | Web `.hjm-screen`, Native `ScreenLayout` |
| 간격 | 바깥 padding `screenPatternRecipe.padding`(`spacing.md` 16)을 헤더 사방·notice 좌우·본문 사방·footer 사방에 준다(`contentInset="none"`이면 0, `"body-edge"`면 본문 좌우만 0, `"body-bleed"`면 본문 사방 0); 헤더 안 `exit`·제목·`actions` 간격 `itemGap`(`spacing.sm`) 12(두 플랫폼, `contentInset="none"`이어도 유지); 상태 안내는 위아래 `sectionGap`(`spacing.xl`) 24, 안내–`stateAction` `stateGap`(`spacing.md`) 16 | Web `src/screens.tsx`(`--hjm-screen-item-gap`·`--hjm-screen-state-gap`)·`.hjm-screen__*`, Native `ScreenLayout` |
| 제목 | 기본 가운데 `Heading` `screenHeaderRecipe.centeredTitleLevel`(level5), `headerAlignment="start"`면 `titleLevel`(level3). 추가 기능 버튼(`actions`)은 끝(오른쪽) 위, 나가기(`exit`)는 시작(왼쪽) 위. 헤더 높이는 두 플랫폼 모두 `screenHeaderRecipe`의 고정 띠 | `screenHeaderRecipe` |
| 순서·정렬 | 헤더(`exit` → 제목·설명 → `actions`) → notice → 본문 → footer; 상태 안내는 본문 세로 가운데 `exit`는 HJM이 `edge="start"`로 그려 아이콘 칸이 헤더 여백 선 16에 온다(Web·Native 31 → 16, 가운데 헤더의 같은 폭 양쪽 열·제목 중앙은 그대로). 끝 `actions`의 마지막 ghost IconButton은 제품이 `edge="end"`를 준다(2026-10-17 실측 감사, [IconButton `edge`](icon-button.md#배치)) | 렌더 순서 |
| 고정·스크롤 | 헤더·notice·footer 고정, `scroll="screen"`은 본문이 스크롤, `"content"`는 자식이 스크롤; footer 위 테두리 1. 마지막 영역(footer, 없으면 본문)의 아래 여백은 `max(16, 하단 inset)`이다 — Web은 `env(safe-area-inset-bottom)`, Native는 `safeAreaBottom`. 16 + inset으로 더하지 않으며, 키보드가 열려 있으면 키보드가 홈 인디케이터를 덮으므로 16만 둔다. [BottomNavigationInsetProvider](bottom-navigation.md#막대가-덮는-높이-bottomnavigationinsetprovider-1310) 안이면 같은 마지막 영역이 `max(위 값, 16 + 덮인 높이)`를 한 번 둔다. `scroll="content"` 목록이나 ScreenLayout 위의 화면 구성이 다시 더하지 않는다(1.32.0) | Web `data-scroll`·`.hjm-screen__footer`, Native `ScrollView` |
| 좁은 폭·큰 글자 | 제목 열 최소 폭 `headerMinWidth` 120 × 글자 배율, 모자라면 `actions`가 다음 줄로 내려간다; 제목은 줄바꿈(`overflow-wrap: anywhere`)되고 자르지 않는다; Native 위·옆 safe area·탭바 inset은 host, 아래 inset은 `safeAreaBottom` | `screenPatternRecipe.headerMinWidth`, Web `.hjm-screen__heading` |

## 진입 포커스

2026-10-18 후속 사용자 지시: “페이지 진입에만 적용하고 하단 시트에는 폐지해 포커스”. 일반·대화·인증 페이지의 기존 `none`과 시트의 단일 입력 자동 포커스를 이 기준으로 교체한다. **1.33.0에서 제공한다.**

2026-10-18 사용자 요청("input이 있는 화면에 진입하면 포커스되도록, 웹앱 둘 다"). 앱마다 `autoFocus`·지연 `ref.focus()`를 붙이던 것을 화면 골격이 맡는다. 입력 칸(TextField·TextArea·SearchField·PasswordField, 작성창의 TextArea)은 가장 가까운 화면·시트 범위에 자신을 등록하고, 범위가 진입 뒤 한 칸을 고른다. 규칙의 정본은 contracts `resolveInitialFocusTarget`·`resolveEntryFocus`·`initialFocusDefaults`(`screen-patterns`)다.

| 구성 | 기본값 | 이유 |
| --- | --- | --- |
| `ScreenLayout`(일반 화면) | `first-input` | 페이지 진입 시 입력이 있으면 첫 유효 입력 선택 |
| `SearchScreen` | `first-input`(검색어) | 검색이 화면의 목적 |
| `EditorScreen` | `first-input` | 작성·편집이 화면의 목적 |
| `ChatScreen`·`CommentThreadScreen` | `first-input` | 별도 페이지로 진입하면 작성창도 같은 규칙 적용 |
| 하단 `Sheet` | 자동 입력 포커스 없음 | 입력 개수·`initialFocus`·중첩 화면·`initialFocusTarget`과 무관하게 자동 포커스하지 않음. Web은 모달 컨테이너에 초점 유지 |
| `Dialog`·`AlertDialog`·측면 `Sheet` | 기존 모달 규칙 | `single-input` 등 기존 모달 포커스 계약 유지 |
| `AuthScreenLayout` | `first-input` | 페이지 진입 시 텍스트 입력이 있으면 선택. 제공자 버튼만 있으면 입력 포커스 없음 |

- 고르는 순서: `initialFocusTarget` 칸 → 등록(트리) 순서 첫 칸. 비활성·읽기 전용 칸, `initialFocusTarget={false}` 칸은 고르지 않는다.
- 시점: Native 페이지는 진입 전환이 끝난 뒤(`InteractionManager`) — 키보드 애니메이션이 전환과 겹치지 않는다. Web은 mount 직후, `preventScroll`.
- 빼앗지 않는다: 사용자가 이미 입력 칸에 있으면 그대로 둔다(Native 포커스된 입력, Web 편집 가능한 요소).
- 오버레이 아래(1.28.2, Web·Native): 위에 HJM `Dialog`·`AlertDialog`·`Sheet`가 열려 있으면 아래 화면·시트는 고르지 않는다. Web은 제품 자체 모달(`aria-modal`·`dialog[open]`)도 막는다. Native는 HJM 오버레이만 알 수 있으므로 화면을 덮는 모달은 HJM 오버레이로 만든다.
- 오버레이 안의 화면(Web·Native, 하단 시트 제외): 화면을 **감싸는** 모달은 그 화면을 막지 않는다. `Dialog`·측면 `Sheet` 본문에 둔 `ScreenLayout`(또는 화면 구성)은 오버레이가 열린 뒤(Web: 모달 활성화, Native: 표시·진입 애니메이션 뒤) 오버레이와 함께 진입해 자기 `initialFocus` 규칙으로 칸을 고른다. 오버레이 자신의 칸이 있으면 그 칸이 먼저이고, 오버레이에 `initialFocusRef`(Web)가 있으면 그쪽이 이긴다. Web 제품 모달(`aria-modal`)도 화면의 입력 칸을 품고 있으면 화면을 감싸는 것으로 보고 막지 않는다. 화면 밖에 열린 제품 모달은 그대로 막는다.
- 진입 창(1.28.2): 진입 뒤 아직 포커스하지 못한 범위는 사용자가 그 범위를 직접 조작(Native 터치·스크롤, Web 포인터·키·휠·터치)하기 전까지 열려 있다. 그 동안 ① 칸이 새로 나타나면(데이터 로드 뒤 드러나는 확인 칸) ② 진입 때 위에 있던 오버레이가 닫히면(첫 가입 약관 동의) 다시 고른다. 오버레이 안의 조작(동의 탭)은 아래 화면의 조작으로 세지 않는다. 오버레이가 닫힌 시점은 그 오버레이의 반환 포커스와 같은 시점(Native: 퇴장·dismiss 뒤, Web: 반환 포커스 뒤)이다.
- 진입 종료 뒤 입력: 사용자 조작이나 첫 포커스 이후 새로 나타난 입력은 `initialFocusTarget`이 있어도 자동 포커스하지 않는다. 검색 열기·단계 이동은 새 페이지 진입이 아니다.
- 다시 진입: 화면은 mount당 한 번이다. 스택에서 돌아온 화면(이미 mount)은 다시 포커스하지 않는다 — 돌아온 맥락을 키보드가 가리고, HJM은 내비게이션 포커스 신호를 모른다. 하단 시트는 자동 입력 포커스를 하지 않고, 대화상자·측면 시트는 기존 모달 규칙으로 다시 고른다.
- 모션 감소는 애니메이션에만 적용하고 포커스는 그대로 한다.
- 제품은 `autoFocus`·`setTimeout(() => ref.focus())`·단계 전환 뒤 `ref.focus()`를 쓰지 않고 `initialFocus`·`initialFocusTarget`으로 표현한다. 검증 실패 칸으로 옮기는 포커스(제출 오류)는 제품의 동작이라 그대로 둔다.

## 꼭 지킬 것

- **중복된 화면명은 숨기고, 대상·작업 식별에 필요한 제목은 유지한다.** 하단 탭·상단 탐색이 화면을 이미 설명하면 `titleVisibility="hidden"`으로 둔다. 제목·식별 자산·뒤로가기·도구가 모두 없으면 기본 헤더는 그리지 않는다. 내용 첫머리에서 이미 대상·작업을 식별할 수 있으면 같은 제목을 반복하지 않는다. 2026-10-18 사용자 결정이며 모든 제목을 숨기는 기본값 변경이 아니다.
- **보이는 헤더 제목은 기본 가운데, 추가 기능 버튼은 오른쪽 위.** `headerAlignment` 기본값은 `"center"`이고 `"start"`도 선택할 수 있다(2026-10-17 사용자 지시: 가운데가 기본, 강제는 아님). 상단 탐색이 있으면 HJM TopBar를 `header`에 합성해 왼쪽 탐색·오른쪽 도구 한 행으로 두고 별도 제목 줄을 만들지 않는다.
- **나가기는 `exit` 하나로 헤더 시작 쪽에 둔다(필수).** 본문·하단의 "나가기"·"닫기"·"뒤로"·"취소하고 나가기" 글자 버튼, 화면마다 다른 화살표(`←` 글자, 제품 아이콘)로 만든 뒤로 버튼을 두지 않는다. 2026-10-17 사용자 지시: `변경 저장과 이탈 확인` 예제의 "설정 나가기"가 본문 버튼으로 떠 있었고, 제품마다 뒤로 버튼 모양이 달랐다(야잘알 자체 `BackButton`, 예제의 `←`·`ChevronLeft`). 변경이 있을 때의 확인 대화상자는 제품이 `exit` 콜백에서 띄운다. 기존 navigator 헤더를 쓰는 화면은 그 헤더의 뒤로 버튼이 같은 자리를 맡는다.

- `headerAlignment="center"` + `titleVisibility="hidden"`이고 설명·사용자 지정 헤더가 없으면 아이콘 헤더는 최소 48pt, 세로 여백 2pt다(값의 정본은 `screenHeaderRecipe`). 2026-10-14 야잘알의 상단 버튼–탭 사이 빈 공간 피드백으로 제목용 높이를 줄였다. 제목이 보이는 가운데 헤더는 최소 52pt, 세로 여백 4pt다(2026-10-17 사용자 지시 "상단 여백 줄여": 60pt가 iOS 내비게이션 바보다 높았다). `notice`가 없을 때만 본문 상단 여백을 최대 4pt로 줄이며, `notice`에 둔 탭과 본문 카테고리 사이 기본 16pt 간격은 유지한다. 좌우 여백·하단 여백·터치 영역은 그대로다.

- Web의 화면 스크롤 본문은 Tab으로 진입할 수 있다. `scroll="content"`의 정상 본문은 자식이 키보드 스크롤을 소유하지만, 오류·빈 상태 등 대체 안내는 화면 스크롤로 바뀌며 Tab 진입도 함께 복원된다.
- Web에서 본문에 초점을 가진 입력·재시도 버튼이 상태 전환으로 제거되면 같은 본문으로 초점을 복구한다. `scroll="content"`의 본문은 이 복구만을 위한 `tabIndex=-1`을 가지며 일반 Tab 순서에는 추가되지 않는다. 사용자가 다른 컨트롤이나 바깥 영역으로 초점을 옮긴 경우에는 이동시키지 않는다. 2026-10-13 재시도·권한 제한 전환에서 초점이 body로 유실된 경로를 수정했다.
- **화면 여백은 ScreenLayout이 소유한다(기본 `contentInset`).** 화면을 바깥 `Container gutter`로 감싸고 `contentInset="none"`을 주는 구성은 지원하지 않는다. 행의 표면 bleed, footer·BottomCTA 바, 끝 컨트롤의 `edge`는 모두 ScreenLayout이 여백을 가진다는 전제로 맞춰져 있어, 그 구성에서는 행 표면이 본문 끝에서 잘리고 footer가 여백 안에 떠 있는 상자가 된다. `none`은 host가 모든 inset을 소유하는 기존 의미 그대로다(새 동작 없음).
- 가상화 목록(FlatList, VirtualList)을 넣으면 `scroll="content"`로 둔다. 스크롤을 이중으로 중첩하지 않는다.
- 새로고침 실패·저장 오류는 `state`를 바꾸지 말고 `ready` + `notice`로 알린다. `loading`으로 바꾸면 본문이
  unmount되어 입력 초안이 사라진다.
- `state.title`·문구는 i18n 키로 넣는다. ready 외 상태의 빈 `title`은 `TypeError`다.
- **`safeAreaBottom`을 받는 화면 구성(Native, 1.28.1 감사):** ScreenLayout을 그리는 공개 구성은 모두 같은 prop을 받아 자기 ScreenLayout에 넘긴다 — `SettingsScreen`·`NotificationInboxScreen`·`ChatScreen`·`OverviewScreen`·`EditorScreen`·`ProfileScreen`·`ModerationScreen`·`MediaSelectionScreen`·`PermissionScreen`·`CommentThreadScreen`·`SearchScreen`(+`footer`)·`SavedItemsScreen`(ListDetailScreen 경유)·`ListDetailScreen`(목록·상세 pane 둘 다)·`OnboardingScreen`. 로그인은 `AuthScreenLayout` `safeAreaBottom`(같은 max 규칙, 기준은 paddingBlock). 하단 막대를 직접 그리는 `BottomCTA`·`BottomNavigation`은 각자 `safeAreaBottom`, FAB는 `safeAreaBottomInset`을 받는다. `Layout`(primitives)의 `footer`는 배치 슬롯일 뿐 inset을 정하지 않는다.
- Web host는 실제 남은 높이(`height:100%` 등)를, Native host는 위·옆 safe area와 탭바 inset을 먼저 처리한다. 아래 홈 인디케이터는 host가 SafeAreaView로 들이지 말고 `safeAreaBottom`으로 넘긴다(들인 뒤 footer 16을 더하면 버튼 아래가 50이 된다).
  HJM은 기종별 높이를 추측하지 않는다.
- 배치는 Web·Native 모두 `layoutStyle`로 한다(Web은 `className`도 있다). 색·여백을 덮지 않는다.
- 제목 옆 로고·아트워크 때문에 `header`에 TopBar나 직접 만든 헤더를 넣지 않는다. `titleLeading`을 쓰면 가운데 제목·양쪽 같은 폭 열·`exit`·`actions` 배치가 그대로 유지된다.
- 첫 로딩에 브랜드 로더를 보이려고 `ready` 본문 안에 로딩 화면을 직접 두지 않는다. `state={{ kind: "loading", title }}` + `loadingIndicator`로 넘긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 루트 | `<main>`(`as="section"` 가능), 제목과 연결 | `View`, 제목 `accessibilityRole="header"` |
| 상태 알림 | error는 `role="alert"`, 그 외 `status` | `accessibilityLiveRegion`(error assertive) |
| 스크롤 | CSS(`data-scroll`) | `ScrollView`(`keyboardShouldPersistTaps="handled"`) |
| 배치·식별 | `layoutStyle`, `className` | `layoutStyle`, `testID` |

## 함정

- 이미 `<main>`이 있는 제품 셸 안에서는 `as="section"`을 준다. 중첩 main이 생긴다.

- 본문 좌우 여백을 직접 빼려고 목록에 음수 margin이나 제품 CSS를 쓰지 않는다. 행이 자기 여백을 가지면 `contentInset="body-edge"`, host가 모든 여백을 가지면 `"none"`이다. ListRow·NotificationItem은 글자를 부모 콘텐츠 가장자리에 두고 표면만 8 바깥으로 넓히므로(2026-10-17) `default` 본문에서 글자가 여백 선 16에 오고 설정 묶음 제목·알림 그룹 제목과 같은 선에 선다. `body-edge` 본문에 두면 글자가 화면 끝에 붙으므로 두지 않는다.
- 지도·캔버스를 화면 끝까지 그리려고 `body-edge` 본문에 음수 margin을 주거나 `none` + 직접 만든 헤더 여백을 쓰지 않는다. `contentInset="body-bleed"`다. 본문에 글자 목록을 두는 화면에는 쓰지 않는다(글자가 화면 끝에 붙는다). 지도 위에 띄우는 입력판·버튼의 여백은 제품 오버레이가 정한다.

### 디자인 프로필의 화면 표현

`presentation` 명시값, 가장 가까운 프로필의 screens.overview, 기존 화면 골격 순으로 선택한다.
dashboard는 가로 헤더/1200 목록 폭, editorial은 세로 헤더/720 읽기 폭, landscape는 중앙 세로 헤더/1200 폭이다.
폭은 foundations의 contentMaxWidth/readingMaxWidth다. 프로필을 지정하지 않으면 기존 recipe 배치를 유지한다.
같은 header/body/notice/footer 및 상태 엔진을 유지하며 입력 subtree를 테마별로 교체하지 않는다.

## 근거

- `titleLeading`: 2026-10-18 HJM 1.30.0 채택 감사. 야잘알 팀 상세는 팀 로고를 제목 자리에 두려고 헤더 전체를 직접 만들었고(측정한 양쪽 폭 맞춤까지 복제), 유틸버스 도구 화면은 도구 아트워크 때문에 `header`에 TopBar를 넣었다. ChatScreen 상대 사진은 이미 같은 자리를 비공개로 쓰고 있었으므로 공개 prop으로 열었다.
- `loadingIndicator`: 2026-10-18 spint 홈. ScreenLayout 로딩 상태가 브랜드 표시를 받지 않아 첫 로딩을 `ready` 본문 안의 제품 상태 화면으로 그렸다. CompositionLayout에는 같은 prop이 있었다.

- 하단 여백 `max(16, inset)`(Native `safeAreaBottom`): 2026-10-17 사용자 보고 "전체적으로 버튼 아래 여백이 많아". Native Storybook의 사진 선택과 업로드 화면에서 버튼 아래가 약 33pt였다. 원인은 둘이었다. 화면 스토리의 route host가 고정 높이 720이라 iPhone 17 Pro 스토리 영역 737보다 17 짧았고(footer 16 + 빈 칸 17), 컴포넌트는 Native footer가 safe area를 다루지 않아 host의 아래 inset 위에 16을, footer 안 BottomCTA의 `safeAreaBottom`도 16 위에 더했다(16 + 34 = 50). Web footer는 이미 `max(16, env())`였지만 footer 안 BottomCTA의 `safeAreaBottom`은 그 위에 더했다. 표준을 "마지막 컨트롤 아래 = footer 위 여백 16, 홈 인디케이터 기기에서는 max(16, inset)"으로 정하고 footer가 한 번만 소유하게 했다.
- 화면 여백은 ScreenLayout 소유, 바깥 여백 + `none` 미지원: 2026-10-17 바깥 여백 호스트 예제 사용자 검토. utilverse식(`Container gutter="regular"` 20 + `contentInset="none"`)을 HJM에서 지원하려고 본문 확장·footer 바 소유를 붙인 예제가 어색하다는 판단으로 지원을 접었다(2026-10-15 공통 구조는 HJM 소유 원칙). 측정상 그 구성에서는 Web 402·1280에서 행 표면이 양쪽 8 잘리고 본문이 옆으로 8 스크롤되며, Native 3x에서 선택 테두리 옆 선이 그려지지 않았다. 제품은 바깥 여백을 걷고 기본 inset을 쓴다.
- `contentInset="body-edge"`: 2026-10-17 사용자 결정. 화면 검토 S5#9에서 대화 목록 아바타가 화면 끝에서 약 32pt 안쪽에서 시작했다. 본문 padding 16과 ConversationRow 자체 padding 16이 겹쳤다(인스타그램 DM은 약 16). 앱 약 45곳이 "host가 모든 여백을 소유한다"는 뜻으로 `none`을 쓰고 있어 `none`의 의미를 바꿀 수 없었으므로 값을 새로 추가했다. ChatScreen의 10 타임라인 여백은 `default`일 때만 공통 여백을 대신한다.
- `contentInset="body-bleed"`: 2026-10-18 HJM 1.32.0 감사. 선택의창 지도 화면 세 곳(홈·경로 지도·지도에서 고르기)이 `body-edge`로 지도를 좌우 끝까지 그렸지만 본문 위아래 padding 16이 남아 헤더·footer와 지도 사이에 띠가 생겼다. `body-edge`의 뜻(전체 폭 목록 행의 좌우 여백)과 `none`의 뜻(host가 모든 여백)을 바꿀 수 없어 값을 추가했다.
- 하단 탐색 여백의 단일 소유: 2026-10-18 HJM 1.32.0. BottomNavigation 사용 지침이 `scroll="content"` 화면에 목록 여백으로 다시 더하라고 안내했으나 ScreenLayout은 그 화면에도 이미 적용했다(두 번 쌓임). 지침을 ScreenLayout 단일 소유로 고쳤다.
- 오버레이 안의 화면 진입 포커스: 2026-10-18 번뚝 검색 오버레이. Web은 화면을 감싼 제품 `aria-modal`을 화면 위의 모달로 보고 진입 포커스를 막았고, HJM Sheet 안에 둔 ScreenLayout은 Sheet의 첫 컨트롤(닫기)에 포커스를 빼앗겼다. Native는 오버레이 표시 전에 칸을 포커스해 무시될 수 있었다. 감싸는 모달은 막지 않고 오버레이 안의 화면은 오버레이와 함께 진입하도록 고쳤다(1.31.0 patch).

2026-10-18 사용자 결정: 빈 상태 문구는 화면·부분 영역 모두 `body`(14)로 표시한다. 오류·접근 제한의 제목은 기존 위계를 유지한다. 상단 보조 문구는 Spint 헤더 교체 중 커지고 강조된 문제를 계기로 표시를 제거했다. `state.description`과 본문의 안내는 유지한다.
