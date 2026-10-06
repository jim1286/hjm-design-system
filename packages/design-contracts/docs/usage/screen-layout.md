# ScreenLayout 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
설계: [반복 화면 조합](../screen-patterns.md)(상태: 실험, supplemental). 카탈로그 계약은 없다.

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ScreenLayout` | `/screens` | `/screens` | supplemental. root에서는 내보내지 않는다 |

## 최소 사용 예

```tsx
// Web
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

- `title`(필수, `string`), `description`, `leading`, `actions`. `header`를 주면 기본 헤더 대신 그것을 그린다
  (기존 navigator 헤더 유지용, 이때 `title`은 접근성 이름으로만 쓰인다).
- `state`: `{ kind: "ready" }`(기본) 또는 `loading` · `empty` · `error` · `restricted` + `title`(필수)·`description`.
  ready가 아니면 본문(children)을 그리지 않고 상태와 `stateAction`을 가운데에 놓는다.
- `scroll`: `screen`(기본, 화면이 스크롤) · `content`(본문 자식이 스크롤 소유).
- `contentInset`: `default`(기본) · `none`(host가 이미 여백을 준 경우).
- Web `as`: `main`(기본) · `section`. Native `scrollRef`, `scrollProps`(`refreshControl` 등), `testID`.

## 꼭 지킬 것

- 가상화 목록(FlatList, VirtualList)을 넣으면 `scroll="content"`로 둔다. 스크롤을 이중으로 중첩하지 않는다.
- 새로고침 실패·저장 오류는 `state`를 바꾸지 말고 `ready` + `notice`로 알린다. `loading`으로 바꾸면 본문이
  unmount되어 입력 초안이 사라진다.
- `state.title`·문구는 i18n 키로 넣는다. ready 외 상태의 빈 `title`은 `TypeError`다.
- Web host는 실제 남은 높이(`height:100%` 등)를, Native host는 safe area·탭바 inset을 먼저 처리한다.
  HJM은 기종별 높이를 추측하지 않는다.
- 배치: Web은 `className`, Native는 `layoutStyle`만 있다. 색·여백을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 루트 | `<main>`(`as="section"` 가능), 제목과 연결 | `View`, 제목 `accessibilityRole="header"` |
| 상태 알림 | error는 `role="alert"`, 그 외 `status` | `accessibilityLiveRegion`(error assertive) |
| 스크롤 | CSS(`data-scroll`) | `ScrollView`(`keyboardShouldPersistTaps="handled"`) |
| 배치·식별 | `className` | `layoutStyle`, `testID` |

## 함정

- 이미 `<main>`이 있는 제품 셸 안에서는 `as="section"`을 준다. 중첩 main이 생긴다.
