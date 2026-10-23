# 채팅방 관리

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.44.0
- 검토일: 2026-10-23
- 근거: Telegram·Signal 실제 화면 비교와 채팅방 관리 공통화 요청
- 스토리북: `배포/구성/입력과 작성/채팅방 관리`

## 언제 쓰나

`@hjmds/react/communication`, `@hjmds/react-native/communication`에서 제공한다.
기존 ChatScreen은 메시지 기록·작성창의 화면 틀이다. 이 구성은 방 정보·개설·멤버 관리라는 별도 작업을 소유하며, ChatScreen 헤더의 방 정보 행동에서 연다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Avatar | 방·참여자 사진 | [Avatar](../components/avatar.md) |
| TextField | 이름·소개 초안 | [TextField](../components/text-field.md) |
| Menu | 멤버별 허용 행동 | [Menu](../components/menu.md) |
| AlertDialog | 나가기·삭제·권한 변경 확인 | [AlertDialog](../components/alert-dialog.md) |

- `ChatRoomDetails`: 가운데 방 사진·이름·인원·소개 → 편집 → 검색·공유 미디어·알림·초대 도구 → 참여자 → 파괴 행동 순서.
- `ChatRoomProfile`: 사진 선택/제거 → 이름·소개 → 저장. 제품이 제어하는 draft를 받는다.
- `ChatRoomCreate`: 참여자 검색·선택 후 사진·이름·소개를 설정하는 두 단계를 제공한다. 빈 이름이나 참여자 없는 생성은 막는다.
- `ChatRoomMembers`: 아바타·이름·역할 설명, 선택 또는 멤버별 앵커 메뉴. 권한이 있는 행동만 전달한다.
- `ChatRoomInvite`: 아직 참여하지 않은 사람을 선택하고 초대한다. disabled 멤버는 요청에서 제외한다.
- `ChatRoomActions`: 내 기록 삭제, 방 나가기, 방 자체 삭제를 별도 확인으로 처리한다. 관리 권한이 없는 삭제는 전달하지 않는다.

## 배치

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 부모 화면 본문 | gap xl |
| 방 정보 | Avatar·Text | 상단 중앙 | Avatar xlarge 64, gap sm |
| 선택한 사람 | Avatar large 48 + 이름 | 검색창 아래 가로 스크롤 | 항목 폭 64, gap sm, 해제 표시 20 |
| 참여자 | Avatar·Checkbox·Menu | 본문 | gap md |
| 나가기·삭제 | ListRow·AlertDialog | 최하단 | 기존 row recipe |

```text
방 정보 (ChatRoomDetails)
        [뒤로]                     [정보 편집]
             [방 사진 xlarge: 64]
                  방 이름
                 3명 참여 중
       [검색]   [사진·파일]   [알림]          동폭 타일
  ┌ 소개 ───────────────────────────┐
  ┌ 참여자 3 ───────────────────────┐
  │ (+) 대화상대 초대                │   brand 행, members.invite
  │ [사진] 나                   관리자 │   role = brand caption
  │ [사진] 서연 · 오늘 접속        (•••) │   memberActions 메뉴
  ┌ 내 대화 기록 삭제 / 채팅방 나가기 ─┐   danger 행

참여자 선택 (ChatRoomCreate 1단계 · ChatRoomInvite)
  [닫기]        새 채팅방          [다음]
  [ 이름 검색                        ]
  (서연 ×) (민수 ×)                       선택한 사람 가로 줄, 누르면 해제
  친구 2
  [✓] [사진] 서연 · 산책 친구

방 설정 (ChatRoomCreate 2단계)
  [뒤로]        새 채팅방          [개설]
  [사진 ✎]  [ 채팅방 이름     0/30 ]
  [ 소개 ]
  친구 2 · 선택한 참여자 목록
```

Stack gap은 그룹 `xl`, 입력/목록 `md`, 내부 `sm`이다. Avatar·Button·ListRow·Menu·AlertDialog의 기존 recipe를 재사용한다.
최종 삭제 확인은 danger AlertDialog이며 취소·pending·실패·중복 확인 방지는 기존 공통 동작을 따른다.

## 흐름과 상태

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 방 정보와 권한별 도구 | 화면 host가 진입을 소유 |
| 진행 중 | 요청 버튼 busy, 편집 잠금 | 중복 요청 방지 |
| 실패 | 입력 유지, 오류 문구 | alert 안내 후 재시도 가능 |

1. 방 정보에서 편집 또는 초대를 연다.
2. 제품이 사진·이름·멤버 초안을 제어한다.
3. 성공 응답 뒤 제품이 닫기·이동을 결정한다.

사진 선택/업로드는 `onPickPhoto`에서 제품이 수행하고 저장 가능한 URL을 반환한다. 취소는 null이다. 미디어 권한·서버 업로드를 HJM이 추정하지 않는다. `onValueChange`는 초안 변경, `onSave`/`onCreate`/`onInvite`의 resolve는 서버 성공을 뜻한다. 실패는 reject하며 초안을 지우지 않는다. 서버 결과를 받은 제품이 닫힘·이동·성공 안내를 결정한다.

방을 바꿀 때 구성에 `key={roomId}`를 지정한다. 방 데이터·사진 URL·구성원 ID·역할·지역화 문구·권한과 마지막 관리자 이탈 정책은 제품이 소유한다. 서버에서도 권한을 검증해야 한다. 모든 버튼을 노출하는 권한 기본값은 없다.
`deleteHistory`는 내 기록 삭제, `leave`는 멤버십 탈퇴, `deleteRoom`은 전체 방 삭제다. 하나를 다른 기능의 대체로 연결하지 않는다.
검색/공유 미디어/알림은 `tools`가 실제 제품 경로로 연결한다. 검색 엔진이나 알림 서버가 이 구성에 포함됐다는 뜻이 아니다.

## 코드 골격

```tsx
// Web
<ChatRoomProfile key={roomId} value={draft} onValueChange={setDraft}
  onSave={saveRoomProfile} onPickPhoto={pickAndUploadRoomPhoto} labels={labels} />
```

```tsx
// Native
<ChatRoomProfile key={roomId} value={draft} onValueChange={setDraft}
  onSave={saveRoomProfile} onPickPhoto={pickAndUploadRoomPhoto} labels={labels} />
```

실행 가능한 Web 예제: `showcase/web/src/patterns/ChatRoom.preview.tsx`.
Native 예제: `showcase/native/src/ChatRoom.preview.tsx`.
기본·정보 편집·단톡방 개설·실패 후 입력 유지·멤버 권한·어두운 테마를 제공한다. 예제의 사진 선택·저장·멤버 변경은 fixture이며 운영 저장이 아니다.

## 참고한 흐름

2026-10-23 사용자 요청에 따라 [Signal 그룹 관리](https://support.signal.org/hc/en-us/articles/360050427692-Manage-a-group)의 사진·이름·소개·관리자 권한과 [Telegram 공유 미디어](https://telegram.org/blog/shared-media-scrolling-calendar-join-requests-and-more)의 방별 미디어 진입을 참고했다. 색·간격·버튼·모달은 HJM과 제품 테마가 소유한다. [Signal 기록 삭제](https://support.signal.org/hc/en-us/articles/360007320491-Delete-messages-alerts-or-chats)를 참고해 기록 삭제와 나가기를 분리했다.

## UI/UX 개편 — 2026-10-23 오후

사용자 요청("다른 앱·웹 모티브를 최대한")으로 아래 실제 화면을 브라우저에서 열어 비교했다. 기능·배치만 가져오고 색은 HJM 토큰을 유지한다.

| 비교 화면 | 흡수한 내용 |
| --- | --- |
| [카카오톡 팀채팅 만들기·멤버 초대·채팅방 설정](https://funissu.com/kakaotalk-team-chat-room-create/) | 상단 오른쪽 다음/확인, 이름 검색창, 사진 모서리 편집 표시, 이름 글자 수(0/20), 설정 묶음과 하단 파괴 행동 |
| [Telegram 방 정보·Add Members·New Group(Android)](https://www.guidingtech.com/how-to-add-someone-to-telegram-group/) | 참여자 위 "Add Members" 브랜드 행, 역할(Owner/Admin) 오른쪽 표기, 선택한 사람을 검색창에 칩으로 모음, 선택 인원 표시, 사진 옆 이름 입력 |
| WhatsApp 새 그룹(참여자 선택) | 선택한 사람의 가로 아바타 줄과 × 해제 |

반영: `chatRoomRecipe`(screen-patterns), ListRow `tone="brand"`, `ChatRoomMemberActions`·`ChatRoomMemberSearch`·`ChatRoomSelectionLabels` 계약, 사진 실패와 저장 실패 안내 분리, 멤버 메뉴 이름·아이콘 버튼, 서버 검색 연결(`search.onQueryChange`·`searching`). 1.43.0의 `actions`·`searchLabel` 계열 prop은 소비 앱이 없어 이번 minor에서 바로 교체했다.

## 실제 화면 비교와 반영 — 2026-10-23

문서의 기능 목록만 읽고 첫 시안을 만든 접근을 사용자가 지적했다. 아래 원본 이미지를 브라우저에서 실제로 열어 HJM 웹 390px·기존 iPhone 17 Pro 화면과 비교하고 구성을 다시 만들었다.

| 비교 화면 | HJM에서 확인한 차이 | 공통 구현에 흡수한 내용 |
| --- | --- | --- |
| [Telegram 방 정보·편집 화면](https://img7.thuthuatphanmem.vn/uploads/2023/08/29/chon-members_020222519.jpg) | 초기 시안은 2줄 테두리 버튼, 본문 중앙 편집, 지나친 분산 배치 | 상단 편집, 1줄 동폭 아이콘 타일, 묶음형 참여자·설정 영역. 색은 HJM bg·surface 역할 유지 |
| [Signal 방 개설 화면](https://www.hardreset.info/media/resetinfo/2021/021/da0f9e34575545b8aca274f144ca3ce0/apps-signal.jpg) | 초기 시안은 사진·이름·전체 멤버를 한 화면에 넣고 하단 생성 | 검색 가능한 참여자 선택 → 사진·이름 설정, 상단 다음·개설·뒤로, 선택과 초안 유지 |
| [Telegram 답글 원본](https://telegram.org/file/400780400216/2/mfF9maKnA2g.67421/e744b36dd0e0da3840) | 인용 영역과 본문 구분이 약함 | 3px 시작선과 12% 인용 표면색, 누르면 원문 이동하는 기존 replyLink 보존 |
| Signal 그룹 관리 흐름 | 생성·초대·역할 변경이 화면별 조립에 맡겨짐 | ChatRoomCreate·Invite·Members와 서버 성공 대기, 취소·확인·실패 상태 제공 |
| 현재 대화 목록 예제 | 작성 버튼이 상태 문구만 변경 | 웹·Native의 실제 단톡방 개설 흐름으로 연결 |

사진·검색·미디어·알림·멤버 저장의 실제 서버는 제품이 연결한다. Storybook에서 fixture로 검증한 상태를 제품 운영 기능 완료로 보고하지 않는다. 현재 번뚝은 peer 기반 DM 및 프로젝트 대화, 유틸버스는 단일 도구 대화라 그룹 서버·권한·보존 정책은 별도 제품 구현 지점이다.

2026-10-23 사용자 보완: 다른 앱의 배경색·브랜드 팔레트는 복제하지 않는다. 참조 범위는 기능·배치·상호작용이며 화면 바탕은 HJM `bg`, 그룹·도구는 `surface`, 강조와 글자는 기존 의미 토큰과 제품 Provider를 따른다.
