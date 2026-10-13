# 알림함

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-13
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/공통 화면/알림함`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/소통/알림함`

## 목적

NotificationInboxScreen을 사용해 알림함 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 제목·모두 읽음 → 필터 → 알림 행
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | NotificationInboxScreen | route 본문 | [API 배치 규칙](../components/notification-inbox-screen.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 제목·모두 읽음 → 필터 → 알림 행 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | NotificationInboxScreen 공개 행동 슬롯 | 행 이동과 모두 읽음은 별도; 필터는 상태 교체 중 유지 | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 제목·모두 읽음 → 필터 → 알림 행 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 읽음 저장 실패와 초기 조회 실패를 분리 | 실패 원인과 재시도 경로 제공 |


### 조회와 읽음 저장 분리

2026-10-13 전수 점검에서 최초 조회와 변경 요청의 상태를 같은 골격으로 설명하던 부분을 구체화했다.

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 전체 0건 | empty | 필터는 유지하고 불필요한 다시 시도 버튼을 만들지 않는다 |
| 안 읽음 0건 | empty + 전체 보기 stateAction | 전체 알림 삭제나 데이터 없음으로 오인하지 않는다 |
| 모두 읽음 진행 | actions의 버튼 pending | 확정 전 읽음 상태를 바꾸면 실패 시 요청에 포함된 항목만 되돌린다 |
| 알림 이동 | 제품 라우터에서 목적지 확인 | 읽음 저장 실패는 notice로 알리고 행 이동의 실패와 분리한다 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [NotificationInboxScreen](../components/notification-inbox-screen.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { NotificationInboxScreen, NotificationItem } from "@hjmds/react/screens";

<NotificationInboxScreen
  title={t("inbox.title")}
  filters={filterControl}
  state={items.length ? { kind: "ready" } : { kind: "empty", title: t("inbox.empty") }}
>
  {items.map((n) => (
    <NotificationItem key={n.id} title={n.title} description={n.body} timestamp={n.time}
      read={n.read} statusLabel={t(n.read ? "inbox.read" : "inbox.unread")}
      onClick={() => openNotification(n.id)} />
  ))}
</NotificationInboxScreen>
```

```tsx
// Native
import { NotificationInboxScreen, NotificationItem } from "@hjmds/react-native/screens";

<NotificationInboxScreen
  title={t("inbox.title")}
  filters={filterControl}
  state={items.length ? { kind: "ready" } : { kind: "empty", title: t("inbox.empty") }}
>
  {items.map((n) => (
    <NotificationItem key={n.id} title={n.title} description={n.body} timestamp={n.time}
      read={n.read} statusLabel={t(n.read ? "inbox.read" : "inbox.unread")}
      onPress={() => openNotification(n.id)} />
  ))}
</NotificationInboxScreen>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. 필수 props와 플랫폼별 차이는 위 API 지침에서 확인한다.

## 다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 행 누르기 | `onClick` | `onPress` |
| `NotificationItem` `description` | `ReactNode` | `string` |

## 함정

- 예제의 읽지 않음 필터가 0건이면 빈 상태를 표시하고 빈 날짜 그룹은 숨긴다. Web 상세 복귀는 남아 있는 원래 알림, 읽음 처리로 행이 사라졌으면 선택한 필터로 초점을 돌린다.
- 예제에 제공된 대화는 서연 대화뿐이므로 서연 알림 상세에서만 대화 이어가기를 제공한다. 다른 사람·공지 상세를 같은 대화로 연결하지 않는다. 제품은 실제 알림의 대상 id로 라우팅한다.
- 읽음 저장 실패와 초기 조회 실패를 분리한다. 읽음 오류와 실패 예약은 알림 행동에만 연결하고, 대화로 이동해도 메시지 전송 오류로 표시하지 않는다.
- 읽음 저장 실패는 본문을 교체하지 않고 `notice`에 한 줄로 알리며 알림은 읽지 않음으로 남는다(스토리 `읽음 저장 실패와 복구`). 묶음 제목(오늘·이번 주)은 Heading `level5`다.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크와 실패/복구를 각각 확인한다.
