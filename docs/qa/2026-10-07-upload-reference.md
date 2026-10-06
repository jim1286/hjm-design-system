# QA 리포트 — 파일 선택과 오류 복구

## 판정·대상

부분 확인. 2026-10-07 03:36 KST, Codex. main 28ac155 위 미커밋 Web/Native
UploadRecoveryPreview와 사용 지침. 공개 renderer runtime 변경 없음. 승격·게시·Utilverse 미실행.

## 환경

Web IAB localhost:6006 light 1280×720(브라우저 세부 버전 미확인), 실제 file chooser에 직접
만든 SVG/TXT fixture 입력. Native 기존 iPhone17Pro/iOS26.5/Expo Go57.0.9/localhost:8084,
기본 light. idb·simctl 대체 도구 확인이며 직접 Device Hub 창·실물 Release 증거가 아니다.
Native picker는 sampleFile을 반환하는 합성 onPick이다. 두 플랫폼 모두 실제 서버 전송 없음.

## 재현·수정 전후

전송 시작 버튼을 누르면 pending 버튼이 사라지며 Web 초점이 body로 빠졌다. 파일별로
이름 있는 focusable 영역을 두고 상태 변경 전 그 영역으로 옮겼다. 제거는 추가 버튼으로
복귀한다. 상태 메시지로 대체되던 비전송 안내도 별도 본문으로 분리해 항상 표시한다.
Native에 빠져 있던 maxSizeBytes를 Web과 같은5MiB로 지정했다(UI 문구5MB).

| 확인 | 실제 결과 |
| --- | --- |
| 예제 파일 중복 추가 | 같은 이름/id 파일1개 유지 |
| Web 시작→실패 | 실패 문구와 파일 유지, 파일 영역 초점 유지 |
| Web Tab/Enter 재시도 | 다시 전송 동작, uploading·취소 표시 |
| Web 취소 | pending 복귀, 파일 유지 |
| Web 제거 | 항목 제거, 예제 추가 버튼 초점 |
| Web 실제 선택: SVG4개+TXT1개 | SVG3개만 추가, 제한 안내 |
| 최종 Web 실제 선택: 정상SVG+TXT+5MiB 초과SVG | 정상SVG1개만 추가, 거부 안내와 비전송 안내 동시에 유지 |
| Native 합성 선택→시작→실패→재시도→성공 | 동일 파일 유지, AX 값 '전송 완료' 및 실제 화면 확인 |

상태 fixture의 성공 버튼을 실제 서버 응답/업로드 완료로 세지 않는다. Native 시스템 picker,
실제 네트워크 취소와 늦은 응답 차단은 이번 검사 범위가 아니다.

## 검사·미확인

Node24.20.0/pnpm11.18.0. Showcase Web check(typecheck/43 tests/token), Native check
(typecheck/18 tests) 통과. 마지막 안내 문구 분리 후 양쪽 typecheck 재통과.
최종 usage/docs/diff 검사를 수행했다. 전체 package CI·production build는 이번에 반복하지 않았다.
두 제품 팔레트·다크·큰 글자·RTL·다중 파일 Native 스크롤, 드롭·시스템 picker, 스크린리더 실제
발화·실물 성능은 남았다. 안정된 파일 영역 초점의 자동 browser 회귀는 후속 전체 흐름 검증에서 보강할 수 있다.

## 보관

결과 보존 뒤 자체 임시 SVG/TXT/초과크기 fixture와 Native 캡처, 완료 검사 로그를 제거한다.
소스·공용 sample fixture·계약·사용 지침은 유지한다. 서버와 진행 중 로그는 보존한다.
