# ChatRoomCreate

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.43.0
- 검토일: 2026-10-23
- 근거: 양 renderer `src/communication.tsx`와 [채팅방 비교·구성 지침](../compositions/chat-room.md)
- 스토리북: `배포/구성/입력과 작성/채팅방 관리`

## 언제 쓰나

참여자를 검색·선택하고 사진·이름을 정해 방을 개설한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 메시지 기록과 작성창만 필요한 화면 | [ChatScreen](chat-screen.md) |
| 제품의 서버·권한·저장 규칙 구현 | 제품 데이터 계층 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ChatRoomCreate` | 참여자를 검색·선택하고 사진·이름을 정해 방을 개설한다. | `@hjmds/react/communication` | `@hjmds/react-native/communication` |

## 최소 사용 예

```tsx
// Web
import { ChatRoomCreate } from "@hjmds/react/communication";
<ChatRoomCreate {...roomDraftProps} {...memberSelectionProps} {...navigationLabels} onCreate={createRoom} />
```

```tsx
// Native
import { ChatRoomCreate } from "@hjmds/react-native/communication";
<ChatRoomCreate {...roomDraftProps} {...memberSelectionProps} {...navigationLabels} onCreate={createRoom} />
```

Native는 동일 prop 계약으로 `@hjmds/react-native/communication`에서 가져온다. 전체 실행 예제와 연결 props는 [채팅방 관리](../compositions/chat-room.md)의 양 플랫폼 예제를 따른다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 본문 폭, 프로필 Avatar 64·참여자 40 | 기존 Avatar·ListRow recipe |
| 간격 | 내부 sm·입력 md·그룹 lg | 양 renderer 공통 구성 |
| 순서·정렬 | 상단 탐색·확인 → 작업 본문 → 오류 | 구성 소스 |
| 고정·스크롤 | 스크롤·키보드 처리는 host 소유 | 웹·Native의 화면 host 계약 |
| 좁은 폭 | 도구 동폭, 이름·설명 줄바꿈 | 공통 레이아웃 |

## 꼭 지킬 것

선택 없이 다음으로 갈 수 없고 빈 이름으로 개설할 수 없다. onCreate는 실제 구성원 ID와 프로필을 받는다.

데이터·문구·권한은 제품이 소유한다. 저장·개설·초대·삭제는 실제 성공 뒤 Promise를 resolve하고 실패는 reject한다. 입력과 선택은 실패 시 유지한다. Storybook의 메모리 예제를 운영 저장으로 사용하지 않는다. 방 전환 시 `key={roomId}`로 작업 수명을 구분한다.
