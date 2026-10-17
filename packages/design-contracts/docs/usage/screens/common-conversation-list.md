# 대화 목록

- 단계: 화면
- 상태: 실험
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-16
- 근거: 2026-10-16 사용자가 제공한 인스타그램 iOS DM 목록·길게 누르기 캡처. 행은 [ConversationRow](../components/conversation-row.md), 행 메뉴는 [ContextMenu](../components/context-menu.md)(Native canonical은 같은 날 추가, 미게시)
- 스토리북: `실험/화면/소통/대화 목록`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다.

## 목적

DM·채팅방 목록에서 상대·마지막 메시지·시각·읽지 않음을 훑고, 행을 눌러 대화로 들어가며, 길게 눌러 행 단위 동작(읽지 않음 표시·알림 해제·차단·삭제)을 고른다.

## 영역 구조

```text
host: 남은 높이·safe area
└─ 헤더(제목·작성 버튼) → notice(검색·안내) → 대화 행 목록(가상화)
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ScreenLayout(`scroll="content"`) | route 본문 | 화면 recipe padding 16 |
| 검색 | SearchField(라벨 "대화 검색") | `notice` | 화면 recipe itemGap 12. 결과가 없으면 `state.empty` |
| 행 | 라우팅 host(Pressable·링크) + ConversationRow | 본문 목록 | 아바타 56, 가로 sm·세로 10, 행 padding은 recipe 소유 |
| 행 메뉴 | ContextMenu | 행 host를 감싼다 | Native 카드 폭 최대 280, 행 48, 아이콘 24 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 대화 열기 | 행 host 탭(link) | 행 전체 | 하나 |
| 행 동작 | ContextMenu 항목 | 길게 누름(Web은 우클릭·Shift+F10, Native는 접근성 동작) | 일반 동작 먼저, `tone: "danger"`(차단·삭제)는 끝 |
| 새 대화 | IconButton | 헤더 `actions` | 하나 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 행 목록 | 행 탭·길게 누름 |
| 로딩 | `state.loading`이 본문을 교체 | 없음 |
| 빈 | `state.empty` + 첫 대화 시작 안내 | `stateAction`으로 새 대화 |
| 오류 | 최초 조회 실패는 `state.error`, 새로고침 실패는 목록 유지 + `notice` | 재시도 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ConversationRow](../components/conversation-row.md) | 행 표시 |
| [ContextMenu](../components/context-menu.md) | 행 길게 누르기 메뉴 |
| [ScreenLayout](../components/screen-layout.md) | 바깥 틀·상태 |

## 코드 골격

```tsx
// Native
import { ConversationRow } from "@hjmds/react-native/conversation-row";
import { ContextMenu } from "@hjmds/react-native/context-menu";

<ContextMenu accessibilityLabel={t("dm.rowMenu", { name })} onAction={id => runRowAction(room, id)}
  items={[{ id: "unread", label: t("dm.markUnread"), icon: <MailOpen /> }, { id: "mute", label: t("dm.mute"), icon: <BellOff /> },
    { id: "block", label: t("dm.block"), tone: "danger", icon: <Ban /> }, { id: "delete", label: t("dm.delete"), tone: "danger", icon: <Trash2 /> }]}>
  <Pressable accessibilityRole="link" accessibilityLabel={summary} onPress={openRoom}>
    <ConversationRow title={name} preview={last} metadata={time} unread={unread} avatar={<Avatar source={photo} size={56} decorative />} />
  </Pressable>
</ContextMenu>
```

```tsx
// Web
import { ConversationRow } from "@hjmds/react/conversation-row";
import { ContextMenu } from "@hjmds/react/context-menu";

<ContextMenu accessibilityLabel={t("dm.rowMenu", { name })} onAction={id => runRowAction(room, id)}
  items={[{ id: "unread", label: t("dm.markUnread"), textValue: t("dm.markUnread"), icon: <MailOpen size={20} /> },
    { id: "delete", label: t("dm.delete"), textValue: t("dm.delete"), tone: "danger", icon: <Trash2 size={20} /> }]}>
  <Link href={roomHref} aria-label={summary}><ConversationRow title={name} preview={last} metadata={time} unread={unread} avatar={avatar} /></Link>
</ContextMenu>
```

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 제목·미리보기가 커져도 한 줄 말줄임, 시각·읽지 않음 점은 유지 |
| 다크 | 행·메뉴 카드가 테마 `bg`·`surface`를 따른다. 위험 항목은 `danger` 글자색 |
| 좁은 폭 | 미리보기만 줄어든다. Native 메뉴 카드는 화면 폭 − 32와 280 중 작은 폭 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 메뉴 열기 | 우클릭·길게 누름·Shift+F10 | 길게 누름, 보조기술은 행의 "메뉴" 동작 |
| 메뉴 표시 | 포인터 위치 Popover | 배경 어둡게 + 누른 위치 근처 카드 |
| 메뉴 아이콘 | 항목 `icon`, 24 칸, `currentColor`로 항목 색을 따른다 | 항목 `icon`, 24 칸, 색은 제품이 테마 색으로 넘긴다 |

## 함정

- 행 host를 ContextMenu 안에 하나만 둔다. Native ContextMenu는 그 host에 길게 누르기와 접근성 동작을 덧붙이므로, 별도 Pressable로 다시 감싸면 탭이 먹힌다.
- 위험 동작(차단·삭제)은 확인 대화상자를 제품이 띄운다. 메뉴 항목 선택 즉시 삭제하지 않는다.

## 근거

- 헤더 새 대화 IconButton·`notice` 검색·Web 메뉴 아이콘: 2026-10-17 화면 검토(S5)에서 예제가 새 대화 행동 없이, `notice`에 데모 안내 문구를 두고, Web과 Native 문구·메뉴 모양이 갈라진 것을 확인했다. 예제 데이터·문구는 `showcase/shared/conversation-list.ts` 하나를 두 플랫폼이 읽는다.
