# ChatRoomProfile

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.43.0
- 검토일: 2026-10-23
- 근거: 양 renderer `src/communication.tsx`와 [채팅방 비교·구성 지침](../compositions/chat-room.md)
- 스토리북: `배포/구성/입력과 작성/채팅방 관리`

## 언제 쓰나

사진·이름·소개를 편집하고 실제 저장 결과를 기다린다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 메시지 기록과 작성창만 필요한 화면 | [ChatScreen](chat-screen.md) |
| 제품의 서버·권한·저장 규칙 구현 | 제품 데이터 계층 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ChatRoomProfile` | 사진·이름·소개를 편집하고 실제 저장 결과를 기다린다. | `@hjmds/react/communication` | `@hjmds/react-native/communication` |

## 최소 사용 예

```tsx
// Web
import { ChatRoomProfile } from "@hjmds/react/communication";
<ChatRoomProfile value={draft} onValueChange={setDraft} onSave={saveProfile} labels={labels} />
```

```tsx
// Native
import { ChatRoomProfile } from "@hjmds/react-native/communication";
<ChatRoomProfile value={draft} onValueChange={setDraft} onSave={saveProfile} labels={labels} />
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

value·onValueChange·onSave·labels가 필수다. onPickPhoto는 업로드한 URL을 반환하며 null은 취소다.

데이터·문구·권한은 제품이 소유한다. 저장·개설·초대·삭제는 실제 성공 뒤 Promise를 resolve하고 실패는 reject한다. 입력과 선택은 실패 시 유지한다. Storybook의 메모리 예제를 운영 저장으로 사용하지 않는다. 방 전환 시 `key={roomId}`로 작업 수명을 구분한다.
