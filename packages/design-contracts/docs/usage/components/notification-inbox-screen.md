# NotificationInboxScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/소통/알림함`

## 언제 쓰나

알림함 화면 전체 틀에 쓴다. [ScreenLayout](screen-layout.md) 위에 필터 슬롯을 `notice` 영역에 고정해,
로딩·빈 상태·오류로 본문이 바뀌어도 필터는 남게 한다. 본문 행은 [NotificationItem](notification-item.md)을 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 알림 한 행 | [NotificationItem](notification-item.md) |
| 상단 바의 알림 진입 아이콘·개수 | `NotificationBell`([IconButton](icon-button.md) 확장, `/notification-bell`) |
| 필터 없는 일반 목록 화면 | [ScreenLayout](screen-layout.md), [ListDetailScreen](list-detail-screen.md) |
| 일시적인 결과 알림 | [Toast](toast.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `NotificationInboxScreen` | supplemental, 루트 barrel에 없음 | `/screens` | `/screens` |

`@hjmds/react/screens`, `@hjmds/react-native/screens`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web
import { NotificationInboxScreen, NotificationItem } from "@hjmds/react/screens";

<NotificationInboxScreen
  title={t("inbox.title")}
  filters={filterControl}
  state={items.length ? { kind: "ready" } : { kind: "empty", title: t("inbox.empty") }}
>
  {items.map((n) => <NotificationItem key={n.id} {...toItemProps(n)} />)}
</NotificationInboxScreen>
```

```tsx
// Native
import { FlatList } from "react-native";
import { NotificationInboxScreen } from "@hjmds/react-native/screens";

<NotificationInboxScreen
  title={t("inbox.title")}
  filters={filterControl}
  scroll="content"
  state={query.isPending ? { kind: "loading", title: t("inbox.loading") } : { kind: "ready" }}
>
  <FlatList data={items} renderItem={renderNotification} />
</NotificationInboxScreen>
```

### 제품이 공급할 것

| 슬롯·prop | 내용 |
| --- | --- |
| `title`, `description` | 지역화 제목 |
| `filters` | 필터 control(SegmentedControl·Chip 등). 상태가 바뀌어도 유지된다 |
| `notice` | 새로고침 실패 같은 안내. `filters` 위에 함께 놓인다 |
| `state` | `ready` · `loading` · `empty` · `error` · `restricted`. ready 외에는 지역화 `title` 필수 |
| `stateAction` | 재시도·로그인 같은 실제 행동 |
| `children` | 알림 목록(데이터·페이지 합치기·더 보기는 제품) |
| `header`, `leading`, `actions` | 기존 내비게이션 헤더, 뒤로 가기, “모두 읽음” 같은 행동 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720) 안에서 알림 행이 폭을 채운다 | `ScreenLayout`, `NotificationItem`(ListRow) |
| 간격 | 화면 padding `spacing.md` 16(notice 영역은 좌우만); `notice`–`filters` `spacing.sm` 12; 행 사이 간격은 목록(제품) 소유 | Web·Native `NotificationInboxScreen` `Stack gap="sm"` |
| 순서·정렬 | 헤더(`leading` → 제목 → `actions`) → `notice` → `filters` → 알림 목록 | 렌더 순서 |
| 고정·스크롤 | `notice`·`filters`는 헤더 아래 고정되고 상태 교체 중에도 남는다; 목록은 기본 화면 스크롤(`scroll="screen"`), 가상화 목록이면 `scroll="content"` | `ScreenLayout` `notice`·`scroll` |
| 좁은 폭·큰 글자 | 제목 열 최소 폭 120 × 글자 배율, 모자라면 `actions`(모두 읽음 등)가 다음 줄로 내려간다; 필터 줄바꿈·가로 스크롤은 `filters` 소유 | `screenPatternRecipe.headerMinWidth` |

## 꼭 지킬 것

- 읽음 처리·계정 scope·요청 취소·라우팅·focus 복구는 제품 소유다. 화면 표시만으로 읽음 처리하지 않는다.
- 새로고침 실패는 `state="error"`가 아니라 `ready` + `notice`로 알린다. 오류로 바꾸면 목록이 내려간다.
- FlatList 같은 가상화 목록은 `scroll="content"`로 넣는다. 스크롤 컨테이너를 이중으로 만들지 않는다.
- 이미 `<main>` 안이면 Web은 `as="section"`, 라우트가 여백을 이미 주면 `contentInset="none"`.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치·식별 | `layoutStyle`, `className`, `as` | `layoutStyle`, `testID` |
| 스크롤 | 없음 | `scrollRef`, `scrollProps`(`refreshControl` 등) |
