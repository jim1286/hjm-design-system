# QA 리포트 — 할 일 목록의 독립 행동

## 판정과 대상

부분 확인. 2026-10-07 main 3b0d64c 위 TaskList 양 renderer의 renderItemAction 추가.
Utilverse의 체크와 삭제 행을 공통화하기 위한 공개 슬롯이다. 실제 소비 적용·npm 게시는 미실행이다.

## 변경과 이유

기존 TaskList는 완료 체크와 재정렬 합성만 제공해 항목 삭제를 넣으려면 제품이 행을 다시 만들었다.
체크 아래 spacing.sm(12) 간격으로 별도 행동을 제공한다. Checkbox의 label/pressable 내부에
넣지 않아 삭제를 눌렀을 때 완료가 토글되지 않는다. 다음 줄 배치로 큰 글자의 제목 폭을 보존한다.
제품이 받은 disabled 값을 버튼에 적용하고 실제 삭제·저장·복구를 소유한다.

## 검사

Node24.20.0/pnpm11.18.0. Web 실제 browser 회귀 2개, Native react-test-renderer 회귀 2개 통과.
행동 클릭이 completion callback을 부르지 않고 체크는 독립 callback을 부르는 것을 확인했다.
항목 disabled 전달, 기존 controlled 상태, custom renderCollection에서 행동 유지도 확인했다.
세 package typecheck/build, 양 Showcase typecheck, 문서 링크 582개·usage/API map/Storybook 규격 및 renderer graph/platform 경계 검사 통과. 전체 CI는 미실행이다. Showcase 기본/다크/큰 글자 예제에 삭제 행동을 연결했다.

## 미확인

실제 기기에서 삭제 후 접근성 초점, 재정렬 중 행동, 큰 글자·팔레트·RTL 렌더링은 pending이다.
Native renderer 테스트를 실제 터치/VoiceOver 검증으로 세지 않는다. UI 검증을 완료할 때까지
릴리스 완료나 Utilverse 채택 완료로 보고하지 않는다. 실험 수는 17개를 유지한다.

## Web 실제 흐름 후속 (2026-10-07 08:18 KST)

HJM 0b57991 위 Showcase 보완. IAB 개발 Storybook6006, 1280×720 및 390×844,
dark/textScale2. 좁은 폭에서 제목·설명·삭제 버튼이 겹치지 않고 줄바꿈되는 것을 캡처로 확인했다.
처음에는 삭제한 버튼에서 초점이 BODY로 빠졌다. 제품이 제거를 소유하므로 Web 소비 예제에서
삭제 전 이웃 ID를 기억하고 커밋 후 surviving action ref로 focus하도록 보완했다.
마지막 항목까지 없어지면 예시 재시작 버튼에 초점을 둔다. 삭제 표시 문구는 짧게 하고
접근성 이름에는 항목명을 유지했다(양 Showcase).

- 첫 항목 Enter 삭제 → 다음 항목 삭제 버튼 active, 나머지 checkbox 미선택 유지.
- 남은 첫 항목 체크 → 아래로 이동 → 같은 ID 체크 유지, 순서 변경 안내 표시.
- 마지막 위치 삭제 → 이전 항목 삭제 버튼 active.
- 마지막 하나 삭제 → 빈 목록 안내와 예시 다시 시작 active.
- Enter 재시작 → 세 초기 항목과 초기 체크 상태 복원.

양 Showcase typecheck 재통과. 이 확인은 Web keyboard/DOM 초점이며 Native 접근성 초점과
VoiceOver/TalkBack 발화는 미검증이다. Native 삭제 후 초점 정책도 후속으로 보완해야 한다.
브라우저 임시 viewport는 확인 후 해제하고 QA 탭을 닫는다.
