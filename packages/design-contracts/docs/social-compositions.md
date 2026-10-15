# 팔로우 프로필과 행사 참석 응답

상태: 배포 · 적용: 미게시(1.20.0 이후) · 검토일: 2026-10-15

Lucian 054(팔로우 프로필), 059(참석 응답)의 실제 mutation·실패 복구를 소비 앱마다
다시 조립하지 않도록 기존 Card, Avatar, Button, AnimatedStatistic과 action-session을 합성한다.
사용법과 배치는 [구성 지침](usage/compositions/social-compositions.md)에 있다.

## 선택과 경계

- `ProfileScreen`(`screen-flows`)은 summary·편집 행동을 놓는 화면 틀이다. 카드 내부의
  follow 요청·낙관적 수치·실패 복구를 소유하지 않는다. `FollowProfileCard`를 summary나 본문에 넣을 수 있다.
- 단순 정보 카드·이벤트 목록은 기존 Card/Avatar/Statistic을 쓴다. 요청이 있는 이 두 구성만 새 optional
  `@hjmds/{react,react-native}/social-compositions`에서 제공한다. canonical catalog를 확장하지 않는다.
- 비동기 엔진은 기존 `action-session`/`useCompositionAction`, 수치 전환은 `AnimatedStatistic`을 재사용한다.
  Web은 기존 `statistic-motion`의 `@number-flow/react` peer가 필요하다. Native는 기존 ContentTransition을 쓴다.
  루트 entry에 이 선택 의존성을 끌어들이지 않는다.
- 사진·이름·문구·locale·세션·권한·팔로우/참석 API·캘린더는 제품 소유다. `avatar` 슬롯과 참가자별 `avatar`는
  제품 이미지 캐시 host도 수용한다. 없으면 기존 Avatar의 이름 fallback을 쓴다. 참가자 미리보기는 확인된 사람만 공급한다.

## 계약

`FollowProfileState`는 현재 확인된 `following/count`, `EventAttendanceState`는
`responseId/count`다. count는 현재 사용자를 포함한 음이 아닌 안전 정수다.
`AttendanceChoice.attending`으로 어떤 응답이 실제 참석 인원에 포함되는지 제품이 지정한다.
미정·불참 사이 전환은 인원을 바꾸지 않는다. null은 아직 응답하지 않은 상태다.
`resolveFollowProposal`/`resolveAttendanceProposal`은 원본을 바꾸지 않는 동결 proposal을 만든다.
동일 응답은 delta 0, 참석 경계만 ±1이며, 잘못된 응답·중복 id·음수/overflow·참석자 0 모순을 거부한다.

동작은 다음 순서다.

1. 제품은 마지막 서버 확정 상태를 `state`로 전달한다. callback에서 실제 요청을 시작한다.
2. 요청 중 제안 상태·수치를 한 번 캡처해 낙관적으로 표시한다. 새 서버 count가 들어와도 delta를 재적용하지 않는다.
3. 같은 동작의 연속 호출과 참석·캘린더 간 경쟁 요청은 기존 session이 직렬화한다.
4. 성공 callback은 서버 snapshot으로 제품 state를 갱신한 뒤 resolve한다. HJM이 임의로 성공 count를 확정하지 않는다.
5. 거절하면 현재 confirmed props로 복원하고 오류를 안내한다. 같은 버튼으로 명시적 재시도한다.
6. `profileId`/`eventId`가 바뀌면 내부 작업 범위가 remount된다. 오래된 응답은 새 엔티티의 오류·캘린더 완료를 바꾸지 않는다.
   이미 서버가 수락한 작업을 취소하는 의미는 아니다. 제품 callback도 이전 엔티티의 결과를 맞는 캐시에 기록해야 한다.

캘린더 완료는 `onAddToCalendar`의 실제 성공 후만 표시한다. 파일 생성이나 공유창 열기를
기기 캘린더 등록 완료로 resolve하지 않는다. 실패·권한 거절은 reject한다. 성공 후 같은 mount에서는
중복 추가를 막는다. remount 이후 중복 방지·이미 추가된 일정 조회·삭제/복구는 제품 어댑터의 책임이다.
스토리의 캘린더 callback은 호출 횟수를 기록하는 명시적 예시 어댑터이며 기기 캘린더 저장 증거가 아니다.

## 검증 범위

- 계약: immutable delta, 참석 경계, 잘못된 count/choice 거부.
- Web: 실제 DOM 버튼의 중복 클릭·거절 복구·서버 확정 count·엔티티 교체·캘린더 완료 시점,
  두 제품 팔레트와 light/dark의 375px 본문 폭.
- Native: host mock에서 중복 press·실패 복구·엔티티 교체·캘린더 실제 Promise 완료 시점.
- 기기 캘린더·로그인·제품 서버·Release 실기기·npm 게시·제품 적용은 이 내부 검사의 범위가 아니다.
