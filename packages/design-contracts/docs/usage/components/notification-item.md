# NotificationItem

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/정보 표시/알림 항목`, `배포/화면/소통/알림함`

## 언제 쓰나

알림함의 알림 한 행에 쓴다. [ListRow](list-row.md)에 읽음 여부(제목 굵기)와
지역화한 “상태 · 시각” 줄을 더한 조합이다. 탭 동작·링크는 ListRow 그대로다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 알림이 아닌 일반 목록 행 | [ListRow](list-row.md) |
| 알림함 화면 전체 틀 | [NotificationInboxScreen](notification-inbox-screen.md) |
| 화면 위에 잠시 뜨는 알림 | [Toast](toast.md) |
| 화면 안에 남는 상태 안내 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `NotificationItem` | supplemental, 루트 barrel에 없음 | `/screens` | `/screens` |

`@hjmds/react/screens`, `@hjmds/react-native/screens`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web
import { NotificationItem } from "@hjmds/react/screens";

<NotificationItem
  read={n.read}
  statusLabel={n.read ? t("inbox.read") : t("inbox.unread")}
  timestamp={formatRelative(n.createdAt)}
  title={n.title}
  description={n.body}
  leading={senderAvatar}
  href={n.url}
/>
```

```tsx
// Native
import { NotificationItem } from "@hjmds/react-native/screens";

<NotificationItem
  read={n.read}
  statusLabel={n.read ? t("inbox.read") : t("inbox.unread")}
  timestamp={formatRelative(n.createdAt)}
  title={n.title}
  description={n.body}
  onPress={() => openNotification(n)}
/>
```

### 제품이 공급할 것

| prop | 내용 |
| --- | --- |
| `read` | 읽음 여부(필수). 안 읽음이면 제목이 굵어진다 |
| `statusLabel` | 지역화 읽음 상태 문구(필수). 굵기만으로 상태를 전하지 않도록 글로도 표시한다 |
| `timestamp` | 제품이 포맷한 상대·절대 시각 문자열(필수) |
| `title`, `description` | 알림 내용 |
| 나머지 ListRow props | `leading`·`trailing`·`density`·`disabled` 등, 이동은 `href`/`onClick`(Web), `onPress`(Native) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ListRow 크기·density와 내용 높이를 따른다; 모서리 radius 0(Web) | Web `.hjm-notification-item`, `ListRow` |
| 간격 | ListRow 내부 간격; Web은 `description`–상태·시각 줄 `spacing.xxs` 4, Native는 같은 description 문자열 안 줄바꿈; 행을 카드 padding으로 다시 감싸지 않는다 | Web `Stack gap="xxs"`, Native `description` join |
| 순서·정렬 | leading → 제목(안 읽음은 굵게) → `description` → `statusLabel · timestamp` → trailing | Web·Native `NotificationItem` |
| 고정·스크롤 | 목록이 스크롤; 행 자체는 고정하지 않는다 | `NotificationInboxScreen` |
| 좁은 폭·큰 글자 | 제목·설명·상태 줄이 줄바꿈되며 행 높이가 늘어난다; 읽음 여부는 굵기만이 아니라 `statusLabel` 문구로도 전한다 | `NotificationItem` |

## 꼭 지킬 것

- 표시·탭·스크롤이 읽음 처리를 하지 않는다. 읽음 mutation은 제품이 `onPress`/`onClick` 또는 화면 정책에서 실행하고 `read`를 갱신한다.
- `selected`는 받지 않는다(타입에서 제외). 선택 목록이 필요하면 ListRow를 쓴다.
- 시각 포맷·상대시간은 제품 i18n에서 만든다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `title`, `description` 타입 | `ReactNode` | `string` |
| 상태·시각 줄 | 설명 아래 caption `Text` | `description`과 줄바꿈(`\n`)으로 합친 한 문자열 |
| 이동 | `href`, `onClick` | `onPress` |
| 추가 슬롯 | `className`, `layoutStyle` | `titleMetadata`, `trailingAction`, `trailingText`, `layoutStyle` |
| 제목 굵기 조정 | `Text emphasis` | 렌더러 비공개 입력(`hjmTitleEmphasis`)으로 안 읽음 700(`fontWeight.bold`)·읽음 400(`fontWeight.regular`). deprecated `ListRow.titleStyle`을 쓰지 않으므로 HJM이 `titleStyle` 경고를 내지 않는다. `NotificationItemProps`에는 `titleStyle`이 없다(미게시(1.12.1 이후)) |
