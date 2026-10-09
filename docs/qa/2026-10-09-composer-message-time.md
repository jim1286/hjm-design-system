# QA — bounded 입력과 메시지 시간

## 1. 판정

부분 확인. 공통 source·타입·행동 회귀와 번뚝 개발 입력 성장 확인 통과. HJM 게시·정식 소비 채택은 미수행. 2026-10-09~10 KST, Codex.

## 2. 대상과 이력

main 04d0fedf 위 contracts screen-patterns, React/Native ChatMessage, Native inputs 미커밋 변경. 입력 contentSize만으로 고치던 첫 시도는 실제 iOS에서 실패했고 비노출 텍스트 측정으로 교체했다. 다른 세션의 source adapter·root package·showcase 설정 변경은 보존했다.

## 3. 환경과 범위

Node24.20.0, Vitest unit 및 기존 Chromium browser provider. 번뚝 기존 iPhone17Pro iOS26.5 Expo Go 개발/로컬 API, dark/기본 글자, 웹402×874. 최대 글자 제외. 사용자 데이터와 게시 버전을 변경하지 않았다.

## 4. 변경 전후

Native bounded TextArea는 iOS의 제한된 contentSize 대신 같은 폭의 NativeText 줄 높이로 성장·제한·축소를 계산한다. 비노출 측정은 접근성에서 제외하고 마지막 줄바꿈도 포함한다. 실제 3줄에서42→84를 확인했다. Web 입력은 공통 기존 성장으로44→76이었다.

ChatMessage timestampPresentation은 기본always를 유지하며 선택적swipe는 오른쪽 수평 동작만 시간 공간을 연다. 놓기/취소 시 닫고 reply를 실행하지 않는다. 양 renderer와 contracts가 같은 resolver를 소비한다. 기존 reply swipe를 별도 새 컴포넌트로 복제하지 않았다.

## 5. 검사

contracts screen-patterns 11, Native composition-style/screens 28, Web screens.browser 15 모두 통과. 세 패키지 build 통과. docs602 Markdown, usage 토큰13/컴포넌트139/구성59/화면22, api-map310이름, workspace 검사 통과. 변경 범위 확인을 위해 dev:check --plan을 읽었고 전체 release:check는 실행하지 않았다.

## 6. 한계

실물 기기/Release 성능, 모든 팔레트와 light 화면, 전체 suite·release 검사, npm 게시 및 소비 후보 CI는 미확인. 후보 개발은 HJM_LOCAL_SOURCE=1로 확인하고 게시 소비와 구분한다. 제품 전송·신고 저장은 번뚝 QA 기록 범위다.

## 7. 보관 처리

실패와 높이 관찰은 이 기록 및 번뚝 작업 QA에 보존했다. 임시 캡처·patch·로그는 종료 정리하며 source/test/계약 docs·dist는 유지한다. 이 작업에서 branch/worktree를 만들지 않았다.
