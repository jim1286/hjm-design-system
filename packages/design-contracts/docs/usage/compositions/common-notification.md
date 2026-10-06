# 알림 항목

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [NotificationItem](../components/notification-item.md), [공통 실행과 실패 복구](../../action-session.md), `showcase/web/src/patterns/conversation-previews.tsx`, `showcase/native/src/conversation-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/공통 화면/알림 항목`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/정보 표시/알림 항목`

## 언제 쓰나

알림 한 행을 누르면 바로 읽음으로 바꾸고, 서버가 실패하면 읽지 않음으로 되돌릴 때 쓴다. NotificationItem과 낙관 반영 세션을 연결하며 새 데이터 엔진을 만들지 않는다.

2026-10-06 정리 전에는 이 스토리가 [알림함 화면](../screens/common-inbox.md)과 같은 화면 전체를 그렸다. 지금은 행 단위의 읽음 처리와 복구만 보이고,
필터·묶음 제목·불러오는 중·빈·오류·로그인 필요 상태는 알림함 화면이 소유한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `NotificationItem` | 알림 한 행. `read`면 제목 굵기가 풀리고 `statusLabel`이 글로도 상태를 알린다 | [NotificationItem](../components/notification-item.md) |
| `Avatar` | 보낸 사람(`leading`) | [Avatar](../components/avatar.md) |
| `createActionSession` + `optimisticValue` | 읽음 즉시 반영, 실패하면 이전 확인 값으로 복구 | [계약](../../action-session.md), [즉시 반영과 복구](action-recovery-optimistic.md) |
| `Text` 상태 | 읽음 처리 진행·실패 알림 | [Text](../components/text.md) |

## 배치

```text
┌ 바깥 틀: 알림함 본문 스크롤. 단독 예제는 Container ────────┐
│ ┌ NotificationItem ─────────────────────────────────────┐ │
│ │ (아바타)  서연님이 답글을 남겼어요   ← 안 읽음은 굵게  │ │
│ │           저도 그 산책길 좋아해요…                     │ │
│ │           새 알림 · 5분 전           ← statusLabel·시각│ │
│ └───────────────────────────────────────────────────────┘ │
│          ↕ spacing.sm 12                                  │
│ ┌ NotificationItem(확인함) ─────────────────────────────┐ │
│ └───────────────────────────────────────────────────────┘ │
│ 상태 문구(Web role=status, Native live region)             │
└───────────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | [NotificationInboxScreen](../components/notification-inbox-screen.md) 본문. 단독 예제는 Web `Container`, Native `ScrollView` > `Container` | 화면 본문 스크롤 | 좌우 `Container gutter` compact 16 / regular 20 |
| 행 | `NotificationItem` | 세로 목록 | ListRow 크기, 행 사이 `Stack gap="sm"` 12. 행을 카드로 다시 감싸지 않는다 |
| 상태 | `Text` | 목록 아래(단독 예제). 화면에서는 화면 단위로 한 번 알린다 | `spacing.lg` 20 |

## 흐름과 상태

1. 안 읽은 알림을 누르면 `optimisticValue`로 곧바로 읽음 표시가 되고 제품이 상세로 이동한다.
2. 진행 중에는 다른 행을 `disabled`로 막아 같은 세션의 겹친 요청을 만들지 않는다(제품은 행마다 세션을 둘 수 있다).
3. 서버가 실패하면 그 행만 읽지 않음으로 돌아오고 상태 문구가 알린다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 안 읽음: 제목 굵게, `statusLabel` "새 알림" | 행 이름에 제목·상태·시각 |
| 진행 중 | 누른 행이 읽음으로 바뀜(낙관), 다른 행 `disabled` | 포커스 유지, 상태 문구 |
| 실패 | 읽지 않음으로 복구 | 상태 문구 알림, 포커스 이동 없음 |
| 성공 | 읽음 확정, `statusLabel` "확인함" | 상태 문구 |

## 코드 골격

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
  leading={senderAvatar}
  onPress={() => openNotification(n.id)}
/>
```

제품 데이터·콜백은 주입한다. 위 공개 API 지침에 Web·Native 차이를 유지한다.

## 함정

- 읽음 상태를 제목 굵기만으로 알리지 않는다. `statusLabel`을 반드시 준다.
- 읽음 처리 실패를 조용히 삼키지 않는다. 이전 상태로 되돌리고 알린다.
- 필터·묶음 제목·화면 상태를 행 예제에 다시 만들지 않는다. [알림함 화면](../screens/common-inbox.md)이 소유한다.
- 스토리의 "다음 읽음 처리 실패시키기"·350ms 지연은 데모 전용이다.
